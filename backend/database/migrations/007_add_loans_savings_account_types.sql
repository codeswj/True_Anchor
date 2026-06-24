-- 007_add_loans_savings_account_types.sql
-- Extends the account_type enum to support loans and savings sub-accounts.
-- Onboarding a member now creates 4 sub-accounts:
--   shares (SHR-), transactional (TXN-), loans (LON-), savings (SAV-)

ALTER TYPE account_type ADD VALUE IF NOT EXISTS 'loans';
ALTER TYPE account_type ADD VALUE IF NOT EXISTS 'savings';