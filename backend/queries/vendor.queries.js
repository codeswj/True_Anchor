const { pool } = require('../config/db');
const { generateVendorNumber } = require('../utils/helpers');

// Get next vendor sequence number
const getNextVendorSequence = async (client = pool) => {
    const { rows } = await client.query('SELECT COUNT(*) AS total FROM vendors');
    return parseInt(rows[0].total) + 1;
};

// Create a new vendor
const createVendor = async ({
    vendorName,
    contactPerson,
    phone,
    email,
    kraPin,
    paymentTerms,
    physicalAddress,
    status,
    notes,
    createdBy,
}) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const seq = await getNextVendorSequence(client);
        const vendorNumber = generateVendorNumber(seq);

        const { rows } = await client.query(
            `INSERT INTO vendors (vendor_name, contact_person, phone, email, kra_pin, payment_terms, physical_address, status, notes, created_by, vendor_number)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id, vendor_number, vendor_name, contact_person, phone, email, kra_pin, payment_terms, physical_address, status, notes, created_at`,
            [
                vendorName,
                contactPerson || null,
                phone,
                email || null,
                kraPin || null,
                paymentTerms || null,
                physicalAddress || null,
                status || 'active',
                notes || null,
                createdBy || null,
                vendorNumber,
            ]
        );

        await client.query('COMMIT');
        return rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// List all vendors with optional search
const listVendors = async ({ search, limit = 100, offset = 0 } = {}) => {
    let whereClause = '';
    const params = [];
    let idx = 1;

    if (search) {
        whereClause = `WHERE (v.vendor_name ILIKE $${idx} OR v.contact_person ILIKE $${idx} OR v.phone ILIKE $${idx})`;
        params.push(`%${search}%`);
        idx++;
    }

    params.push(limit, offset);

    const { rows } = await pool.query(
        `SELECT
            v.id, v.vendor_number, v.vendor_name, v.contact_person, v.phone, v.email, v.kra_pin,
            v.payment_terms, v.physical_address, v.status, v.notes, v.created_at, v.updated_at
         FROM vendors v
         ${whereClause}
         ORDER BY v.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        params
    );

    return rows;
};

// Get a single vendor by ID
const getVendorById = async (id) => {
    const { rows } = await pool.query(
        `SELECT
            v.id, v.vendor_number, v.vendor_name, v.contact_person, v.phone, v.email, v.kra_pin,
            v.payment_terms, v.physical_address, v.status, v.notes, v.created_at, v.updated_at
         FROM vendors v
         WHERE v.id = $1`,
        [id]
    );
    return rows[0] || null;
};

// Update a vendor
const updateVendor = async (id, fields) => {
    const setClauses = [];
    const params = [];
    let idx = 1;

    const fieldMap = {
        vendorName: 'vendor_name',
        contactPerson: 'contact_person',
        phone: 'phone',
        email: 'email',
        kraPin: 'kra_pin',
        paymentTerms: 'payment_terms',
        physicalAddress: 'physical_address',
        status: 'status',
        notes: 'notes',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
        if (fields[key] !== undefined) {
            setClauses.push(`${column} = $${idx++}`);
            params.push(fields[key]);
        }
    }

    if (setClauses.length === 0) return null;

    params.push(id);
    const { rows } = await pool.query(
        `UPDATE vendors SET ${setClauses.join(', ')} WHERE id = $${idx}
         RETURNING id, vendor_number, vendor_name, contact_person, phone, email, kra_pin, payment_terms, physical_address, status, notes, created_at, updated_at`,
        params
    );
    return rows[0] || null;
};

// Delete a vendor
const deleteVendor = async (id) => {
    const { rowCount } = await pool.query('DELETE FROM vendors WHERE id = $1', [id]);
    return rowCount > 0;
};

module.exports = {
    getNextVendorSequence,
    createVendor,
    listVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
};
