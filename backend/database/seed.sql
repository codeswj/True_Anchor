-- ============================================================
--  IloviaCapital Seed Data (for development/testing only)
-- ============================================================
-- Default PIN for all test users: 1234
-- bcrypt hash of '1234' with 10 rounds
-- ============================================================

-- Test Members
INSERT INTO users (full_name, phone, pin_hash, id_number, email, member_number, role)
VALUES
    ('John Kamau',    '0710000001', '$2b$10$Kix/1ZYVOIpBjZjCQFJCueH4zH.PEpGfLR2C3gWjwAWtEq2FLm3pW', '12345678', 'john@email.com',  'IC-000001', 'member'),
    ('Jane Wanjiku',  '0720000002', '$2b$10$Kix/1ZYVOIpBjZjCQFJCueH4zH.PEpGfLR2C3gWjwAWtEq2FLm3pW', '23456789', 'jane@email.com',  'IC-000002', 'member'),
    ('Peter Mwangi',  '0730000003', '$2b$10$Kix/1ZYVOIpBjZjCQFJCueH4zH.PEpGfLR2C3gWjwAWtEq2FLm3pW', '34567890', 'peter@email.com', 'IC-000003', 'member'),
    ('Mary Akinyi',   '0740000004', '$2b$10$Kix/1ZYVOIpBjZjCQFJCueH4zH.PEpGfLR2C3gWjwAWtEq2FLm3pW', '45678901', 'mary@email.com',  'IC-000004', 'member'),
    ('System Admin',  '0700000000', '$2b$10$Kix/1ZYVOIpBjZjCQFJCueH4zH.PEpGfLR2C3gWjwAWtEq2FLm3pW', NULL,       'admin@yetu.co.ke','IC-ADMIN',  'admin')
ON CONFLICT (phone) DO NOTHING;

-- Sub-accounts for test members
WITH seeded_users AS (
    SELECT
        id,
        member_number,
        LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::text, 6, '0') AS suffix,
        CASE member_number
            WHEN 'IC-000001' THEN 50000.00
            WHEN 'IC-000002' THEN 25000.00
            WHEN 'IC-000003' THEN 75000.00
            WHEN 'IC-000004' THEN 10000.00
            ELSE 0.00
        END AS transactional_balance,
        CASE member_number
            WHEN 'IC-000001' THEN 5000.00
            WHEN 'IC-000002' THEN 5000.00
            WHEN 'IC-000003' THEN 10000.00
            WHEN 'IC-000004' THEN 5000.00
            ELSE 0.00
        END AS shared_balance
    FROM users
    WHERE member_number IN ('IC-000001','IC-000002','IC-000003','IC-000004','IC-ADMIN')
),
account_rows AS (
    SELECT id AS user_id, 'SHR-' || suffix AS account_number, 'shared'::account_type AS account_type, shared_balance AS balance, shared_balance AS shares
    FROM seeded_users
    UNION ALL
    SELECT id AS user_id, 'TXN-' || suffix AS account_number, 'transactional'::account_type AS account_type, transactional_balance AS balance, 0.00 AS shares
    FROM seeded_users
    UNION ALL
    SELECT id AS user_id, 'BOF-' || suffix AS account_number, 'transactional'::account_type AS account_type, 0.00 AS balance, 0.00 AS shares
    FROM seeded_users
    WHERE 1=0
)
INSERT INTO accounts (user_id, account_number, account_type, balance, shares)
SELECT user_id, account_number, account_type, balance, shares
FROM account_rows
ON CONFLICT (user_id, account_type) DO NOTHING;

-- Sample messages
INSERT INTO messages (user_id, title, body)
SELECT u.id,
       m.title,
       m.body
FROM users u
CROSS JOIN (
    VALUES
        ('Welcome to IloviaCapital', 'Dear member, welcome to IloviaCapital. Your account has been successfully created.'),
        ('Loan Reminder', 'Your loan repayment of KES 5,000 is due on 30th this month.'),
        ('Deposit Confirmed', 'Your deposit of KES 10,000 has been received and credited to your account.')
) AS m(title, body)
WHERE u.member_number = 'IC-000001'
ON CONFLICT DO NOTHING;
