-- 005_seed_test_staff.sql
-- Creates a staff test user for the staff portal.
-- Login with phone 0710101010 and PIN 1169.

INSERT INTO users (full_name, phone, pin_hash, email, member_number, role)
VALUES (
    'Test Staff',
    '0710101010',
    '$2b$10$ZUAZ3jfGq49tNIXfzNYoTekhkFxJA1JQ56Y0zJr5pf9yav3W2f3IG',
    'Teststaff@iloviacapital.com',
    'IC-STAFF-TEST',
    'staff'
)
ON CONFLICT (phone) DO UPDATE
SET
    full_name = EXCLUDED.full_name,
    pin_hash = EXCLUDED.pin_hash,
    email = EXCLUDED.email,
    member_number = EXCLUDED.member_number,
    role = EXCLUDED.role,
    is_active = TRUE;
