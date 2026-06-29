-- 006_rename_yc_member_numbers_to_ic.sql
-- Rename existing member numbers from YC-* to IC-* for consistency.

UPDATE users
SET member_number = regexp_replace(member_number, '^YC-', 'IC-')
WHERE member_number LIKE 'YC-%';
