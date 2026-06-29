-- 008_migrate_account_numbers_format.sql
-- Migrates existing account numbers to the new IC format derived from member number.
-- New format: IC-{type_digit}{member_suffix_last_5}
--   Type digits: 5=shares, 4=savings, 3=loans, 2=transactional
--
-- Example: member IC-000002 → shares IC-500002, savings IC-400002, loans IC-300002, transactional IC-200002
-- Example (old YC-): member YC-000005 → shares IC-500005, etc.
--
-- The suffix after the type digit is the last 5 characters of the member number suffix.
-- Member number: IC-000002 → suffix: 000002 → last 5: 00002
-- Shares:         IC-5 + 00002 = IC-500002

-- Update account numbers based on user's member_number and account_type
UPDATE accounts a
SET account_number = 
    'IC-' || 
    CASE a.account_type::text
        WHEN 'shared'         THEN '5'
        WHEN 'savings'        THEN '4'
        WHEN 'loans'          THEN '3'
        WHEN 'transactional'  THEN '2'
        ELSE '0'
    END || 
    SUBSTRING(u.member_number, 5, 5)  -- last 5 chars of the suffix (skip 'IC-' + first digit)
FROM users u
WHERE a.user_id = u.id
  AND (u.member_number LIKE 'IC-%' OR u.member_number LIKE 'YC-%')
  AND a.account_number NOT LIKE 'IC-%';
