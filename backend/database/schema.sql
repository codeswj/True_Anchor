-- ============================================================
--  IloviaCapital Database Schema
--  PostgreSQL
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS  (members)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(150)        NOT NULL,
    phone           VARCHAR(15)         NOT NULL UNIQUE,  -- e.g. 0710401353
    pin_hash        TEXT                NOT NULL,         -- bcrypt hashed PIN
    id_number       VARCHAR(20)         UNIQUE,           -- National ID
    email           VARCHAR(150)        UNIQUE,
    member_number   VARCHAR(30)         UNIQUE,           -- e.g. YC-001
    role            VARCHAR(20)         NOT NULL DEFAULT 'member', -- member | admin
    is_active       BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. ACCOUNTS  (one savings account per member)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID                NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    account_number  VARCHAR(30)         NOT NULL UNIQUE,  -- e.g. ACC-00001
    balance         NUMERIC(15, 2)      NOT NULL DEFAULT 0.00,
    shares          NUMERIC(15, 2)      NOT NULL DEFAULT 0.00,  -- share capital
    is_active       BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. TRANSACTIONS
-- ============================================================
CREATE TYPE transaction_type AS ENUM (
    'deposit',
    'withdrawal',
    'bank_transfer',
    'savings_transfer',
    'airtime',
    'utility_payment',
    'loan_disbursement',
    'loan_repayment',
    'internal_transfer'
);

CREATE TYPE transaction_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'reversed'
);

CREATE TABLE IF NOT EXISTS transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID                NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    user_id         UUID                NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
    type            transaction_type    NOT NULL,
    amount          NUMERIC(15, 2)      NOT NULL CHECK (amount > 0),
    balance_before  NUMERIC(15, 2)      NOT NULL,
    balance_after   NUMERIC(15, 2)      NOT NULL,
    status          transaction_status  NOT NULL DEFAULT 'pending',
    reference       VARCHAR(100)        UNIQUE,           -- unique ref number
    description     TEXT,
    recipient_phone VARCHAR(15),                          -- for airtime / transfers
    recipient_name  VARCHAR(150),
    bank_name       VARCHAR(100),
    bank_account    VARCHAR(50),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. LOANS
-- ============================================================
CREATE TYPE loan_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'disbursed',
    'active',
    'completed',
    'defaulted'
);

CREATE TYPE loan_type AS ENUM (
    'normal',
    'emergency',
    'development',
    'school_fees'
);

CREATE TABLE IF NOT EXISTS loans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    account_id          UUID            NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    loan_number         VARCHAR(30)     UNIQUE,             -- e.g. LN-00001
    loan_type           loan_type       NOT NULL DEFAULT 'normal',
    principal_amount    NUMERIC(15, 2)  NOT NULL CHECK (principal_amount > 0),
    interest_rate       NUMERIC(5, 2)   NOT NULL,           -- e.g. 12.00 = 12%
    loan_term_months    INTEGER         NOT NULL,           -- repayment period
    monthly_repayment   NUMERIC(15, 2),                     -- computed installment
    total_repayable     NUMERIC(15, 2),                     -- principal + interest
    amount_paid         NUMERIC(15, 2)  NOT NULL DEFAULT 0.00,
    outstanding_balance NUMERIC(15, 2),
    status              loan_status     NOT NULL DEFAULT 'pending',
    purpose             TEXT,
    applied_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at         TIMESTAMP WITH TIME ZONE,
    disbursed_at        TIMESTAMP WITH TIME ZONE,
    due_date            DATE,
    completed_at        TIMESTAMP WITH TIME ZONE,
    approved_by         UUID            REFERENCES users(id),  -- admin who approved
    rejection_reason    TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 5. LOAN GUARANTORS
-- ============================================================
CREATE TYPE guarantor_status AS ENUM (
    'pending',
    'accepted',
    'declined'
);

CREATE TABLE IF NOT EXISTS loan_guarantors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id         UUID                NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    guarantor_id    UUID                NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount_guaranteed NUMERIC(15, 2)   NOT NULL,
    status          guarantor_status    NOT NULL DEFAULT 'pending',
    responded_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (loan_id, guarantor_id)
);

-- ============================================================
-- 6. MPESA TRANSACTIONS
-- ============================================================
CREATE TYPE mpesa_status AS ENUM (
    'initiated',
    'pending',
    'success',
    'failed',
    'timeout',
    'cancelled'
);

CREATE TYPE mpesa_type AS ENUM (
    'stk_push',      -- member paying into IloviaCapital
    'b2c'            -- IloviaCapital sending money to member
);

CREATE TABLE IF NOT EXISTS mpesa_transactions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    transaction_id          UUID            REFERENCES transactions(id), -- linked once confirmed
    mpesa_type              mpesa_type      NOT NULL DEFAULT 'stk_push',
    phone                   VARCHAR(15)     NOT NULL,
    amount                  NUMERIC(15, 2)  NOT NULL,
    -- Daraja request fields
    merchant_request_id     VARCHAR(100),
    checkout_request_id     VARCHAR(100)    UNIQUE,
    -- Daraja callback fields
    mpesa_receipt_number    VARCHAR(50)     UNIQUE,
    result_code             INTEGER,
    result_desc             TEXT,
    status                  mpesa_status    NOT NULL DEFAULT 'initiated',
    initiated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at            TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. MESSAGES  (in-app notifications/messages to members)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200)    NOT NULL,
    body        TEXT            NOT NULL,
    is_read     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES  (for query performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transactions_account_id   ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id      ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at   ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status       ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_loans_user_id             ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status              ON loans(status);

CREATE INDEX IF NOT EXISTS idx_loan_guarantors_loan_id   ON loan_guarantors(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_guarantors_user_id   ON loan_guarantors(guarantor_id);

CREATE INDEX IF NOT EXISTS idx_mpesa_checkout_request    ON mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_user_id             ON mpesa_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_messages_user_id          ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read          ON messages(is_read);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_loans_updated_at
    BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_mpesa_updated_at
    BEFORE UPDATE ON mpesa_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
