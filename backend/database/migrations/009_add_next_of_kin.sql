-- ============================================================
--  Migration 009: Add Next of Kin table
-- ============================================================

CREATE TABLE IF NOT EXISTS next_of_kin (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(150)        NOT NULL,
    id_number       VARCHAR(20),
    relationship    VARCHAR(50),
    phone           VARCHAR(15),
    percentage      NUMERIC(5, 2)       DEFAULT 0.00,  -- percentage the kin can receive from member
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_next_of_kin_user_id ON next_of_kin(user_id);

CREATE TRIGGER trg_next_of_kin_updated_at
    BEFORE UPDATE ON next_of_kin
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();