-- ============================================================
--  Migration 010: Add Vendors table
-- ============================================================

CREATE TABLE IF NOT EXISTS vendors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name     VARCHAR(200)        NOT NULL,
    contact_person  VARCHAR(150),
    phone           VARCHAR(15)         NOT NULL,
    email           VARCHAR(150),
    kra_pin         VARCHAR(30),
    payment_terms   VARCHAR(30),
    physical_address TEXT,
    status          VARCHAR(20)         NOT NULL DEFAULT 'active',
    notes           TEXT,
    created_by      UUID                REFERENCES users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_phone ON vendors(phone);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);

CREATE TRIGGER trg_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();