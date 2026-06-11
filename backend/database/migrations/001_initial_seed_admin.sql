-- 001_initial_seed_admin.sql
-- Creates the default admin user (change password after first login)
-- Run automatically by: npm run migrate

INSERT INTO users (full_name, phone, pin_hash, member_number, role)
VALUES (
    'System Admin',
    '0700000000',
    -- Default PIN: 0000 (bcrypt hash — change immediately after setup)
    '$2b$10$Kix/1ZYVOIpBjZjCQFJCueH4zH.PEpGfLR2C3gWjwAWtEq2FLm3pW',
    'YC-ADMIN',
    'admin'
)
ON CONFLICT (phone) DO NOTHING;
