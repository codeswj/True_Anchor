DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
        CREATE TYPE account_type AS ENUM ('shared', 'transactional');
    END IF;
END $$;

DROP INDEX IF EXISTS idx_accounts_user_id_unique;
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_user_id_key;

ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS account_type account_type NOT NULL DEFAULT 'transactional';

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_user_type
    ON accounts(user_id, account_type);

UPDATE accounts
SET account_type = 'transactional'
WHERE account_type IS NULL;

WITH numbered_transactional_accounts AS (
    SELECT
        id,
        LPAD(ROW_NUMBER() OVER (ORDER BY created_at ASC, id::text ASC)::text, 6, '0') AS suffix
    FROM accounts
    WHERE account_type = 'transactional'
)
UPDATE accounts a
SET account_number = 'TXN-' || n.suffix
FROM numbered_transactional_accounts n
WHERE a.id = n.id
  AND a.account_number NOT LIKE 'TXN-%';

INSERT INTO accounts (user_id, account_number, account_type, balance, shares, is_active)
SELECT
    user_id,
    'SHR-' || SUBSTRING(account_number FROM 5),
    'shared',
    shares,
    shares,
    is_active
FROM accounts
WHERE account_type = 'transactional'
ON CONFLICT (user_id, account_type) DO NOTHING;

