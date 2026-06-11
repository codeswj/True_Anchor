-- ============================================================
--  IloviaCapital Seed Data (for development/testing only)
-- ============================================================
-- Default PIN for all test users: 1234
-- bcrypt hash of '1234' with 10 rounds
-- ============================================================

-- Test Members
INSERT INTO users (full_name, phone, pin_hash, id_number, email, member_number, role)
VALUES
    ('John Kamau',    '0710000001', '$2b$10$Kix/1ZYVOIpBjZjCQFJCueH4zH.PEpGfLR2C3gWjwAWtEq2FLm3pW', '12345678', 'john@email.com',  'YC-000001', 'member'),
    ('Jane Wanjiku',  '0720000002', '$2b$10$Kix/1ZYVOIpBjZjCQFJCueH4zH.PEpGfLR2C3gWjwAWtEq2FLm3pW', '23456789', 'jane@email.com',  'YC-000002', 'member'),
    ('Peter Mwangi',  '0730000003', '$2b$10$Kix/1ZYVOIpBjZjCQFJCueH4zH.PEpGfLR2C3gWjwAWtEq2FLm3pW', '34567890', 'peter@email.com', 'YC-000003', 'member'),
    ('Mary Akinyi',   '0740000004', '$2b$10$Kix/1ZYVOIpBjZjCQFJCueH4zH.PEpGfLR2C3gWjwAWtEq2FLm3pW', '45678901', 'mary@email.com',  'YC-000004', 'member'),
    ('System Admin',  '0700000000', '$2b$10$Kix/1ZYVOIpBjZjCQFJCueH4zH.PEpGfLR2C3gWjwAWtEq2FLm3pW', NULL,       'admin@yetu.co.ke','YC-ADMIN',  'admin')
ON CONFLICT (phone) DO NOTHING;

-- Accounts for test members
INSERT INTO accounts (user_id, account_number, balance, shares)
SELECT id, 'ACC-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::text, 6, '0'), 
       CASE member_number
           WHEN 'YC-000001' THEN 50000.00
           WHEN 'YC-000002' THEN 25000.00
           WHEN 'YC-000003' THEN 75000.00
           WHEN 'YC-000004' THEN 10000.00
           ELSE 0.00
       END,
       CASE member_number
           WHEN 'YC-000001' THEN 5000.00
           WHEN 'YC-000002' THEN 5000.00
           WHEN 'YC-000003' THEN 10000.00
           WHEN 'YC-000004' THEN 5000.00
           ELSE 0.00
       END
FROM users
WHERE member_number IN ('YC-000001','YC-000002','YC-000003','YC-000004','YC-ADMIN')
ON CONFLICT (user_id) DO NOTHING;

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
WHERE u.member_number = 'YC-000001'
ON CONFLICT DO NOTHING;
