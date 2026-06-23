-- Stores staff-captured member onboarding details that do not belong in auth.

CREATE TABLE IF NOT EXISTS member_profiles (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    kra_pin                  VARCHAR(30),
    marital_status           VARCHAR(30),
    date_of_birth            DATE,
    gender                   VARCHAR(30),
    physical_address         TEXT,
    signature_file_path      TEXT,
    passport_photo_file_path TEXT,
    created_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_profiles_user_id
    ON member_profiles(user_id);

DROP TRIGGER IF EXISTS trg_member_profiles_updated_at ON member_profiles;
CREATE TRIGGER trg_member_profiles_updated_at
    BEFORE UPDATE ON member_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
