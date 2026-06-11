const axios        = require('axios');
const { pool }     = require('../config/db');
const mpesaCfg     = require('../config/mpesa');
const { formatPhone, generateReference } = require('../utils/helpers');
const { getAccountByUserId } = require('../queries/account.queries');
const { updateBalance }      = require('../queries/account.queries');
const { createTransaction }  = require('../queries/transaction.queries');

// ── Get OAuth token ───────────────────────────────────────
const getAccessToken = async () => {
    const key = mpesaCfg.consumerKey || '';
    const secret = mpesaCfg.consumerSecret || '';
    
    // Debug: log masked credentials
    const keyMask = key.length > 0 ? `${key.slice(0, 3)}...${key.slice(-3)}` : 'MISSING';
    const secretMask = secret.length > 0 ? `${secret.slice(0, 3)}...${secret.slice(-3)}` : 'MISSING';
    console.log(`[MPESA] OAuth attempt - Key: ${keyMask}, Secret: ${secretMask}`);
    
    const credentials = Buffer.from(
        `${key}:${secret}`
    ).toString('base64');

    const { data } = await axios.get(
        `${mpesaCfg.baseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
        { headers: { Authorization: `Basic ${credentials}` } }
    );
    return data.access_token;
};

// ── Generate timestamp & password ─────────────────────────
const getTimestampAndPassword = () => {
    const now       = new Date();
    const timestamp = now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password  = Buffer.from(
        `${mpesaCfg.shortcode}${mpesaCfg.passkey}${timestamp}`
    ).toString('base64');
    return { timestamp, password };
};

// ── Initiate STK Push ─────────────────────────────────────
const initiateSTKPush = async (userId, { phone, amount, description }) => {
    const formattedPhone = formatPhone(phone);
    const token          = await getAccessToken();
    const { timestamp, password } = getTimestampAndPassword();

    const payload = {
        BusinessShortCode: mpesaCfg.shortcode,
        Password:          password,
        Timestamp:         timestamp,
        TransactionType:   'CustomerPayBillOnline',
        Amount:            Math.round(amount),
        PartyA:            formattedPhone,
        PartyB:            mpesaCfg.shortcode,
        PhoneNumber:       formattedPhone,
        CallBackURL:       mpesaCfg.callbackUrl,
        AccountReference:  'IloviaCapital',
        TransactionDesc:   description || 'IloviaCapital Deposit',
    };

    const { data } = await axios.post(
        `${mpesaCfg.baseUrl()}/mpesa/stkpush/v1/processrequest`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    const { rows } = await pool.query(
        `INSERT INTO mpesa_transactions
            (user_id, phone, amount, merchant_request_id, checkout_request_id, status, mpesa_type)
         VALUES ($1,$2,$3,$4,$5,'initiated','stk_push')
         RETURNING *`,
        [userId, formattedPhone, amount, data.MerchantRequestID, data.CheckoutRequestID]
    );

    return {
        checkoutRequestId:   data.CheckoutRequestID,
        merchantRequestId:   data.MerchantRequestID,
        responseDescription: data.ResponseDescription,
        mpesaTransactionId:  rows[0].id,
    };
};

// ── Handle STK Callback ───────────────────────────────────
const handleCallback = async (callbackData) => {
    const { Body }  = callbackData;
    const stk       = Body.stkCallback;
    const checkoutRequestId = stk.CheckoutRequestID;
    const resultCode        = stk.ResultCode;
    const resultDesc        = stk.ResultDesc;

    const { rows } = await pool.query(
        `SELECT * FROM mpesa_transactions WHERE checkout_request_id=$1`,
        [checkoutRequestId]
    );
    if (!rows[0]) return;
    const mpesaRow = rows[0];

    if (resultCode !== 0) {
        await pool.query(
            `UPDATE mpesa_transactions
             SET status='failed', result_code=$1, result_desc=$2
             WHERE id=$3`,
            [resultCode, resultDesc, mpesaRow.id]
        );
        return;
    }

    // Extract callback metadata
    const meta          = {};
    const callbackItems = stk.CallbackMetadata?.Item || [];
    callbackItems.forEach(item => { meta[item.Name] = item.Value; });

    const receiptNumber = meta.MpesaReceiptNumber;
    const amount        = meta.Amount;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Credit the member account directly (no circular require)
        const account     = await getAccountByUserId(mpesaRow.user_id);
        if (!account) throw new Error('Account not found for user');

        const balanceBefore = parseFloat(account.balance);
        const balanceAfter  = balanceBefore + parseFloat(amount);

        await updateBalance(client, account.id, balanceAfter);

        const txn = await createTransaction(client, {
            accountId:     account.id,
            userId:        mpesaRow.user_id,
            type:          'deposit',
            amount,
            balanceBefore,
            balanceAfter,
            status:        'completed',
            reference:     generateReference(),
            description:   `M-Pesa deposit - ${receiptNumber}`,
        });

        await client.query(
            `UPDATE mpesa_transactions
             SET status='success',
                 result_code=$1,
                 result_desc=$2,
                 mpesa_receipt_number=$3,
                 confirmed_at=NOW(),
                 transaction_id=$4
             WHERE id=$5`,
            [resultCode, resultDesc, receiptNumber, txn.id, mpesaRow.id]
        );

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ── Check STK push status ─────────────────────────────────
const checkStatus = async (checkoutRequestId) => {
    const { rows } = await pool.query(
        `SELECT * FROM mpesa_transactions WHERE checkout_request_id=$1`,
        [checkoutRequestId]
    );
    return rows[0] || null;
};

module.exports = { initiateSTKPush, handleCallback, checkStatus };
