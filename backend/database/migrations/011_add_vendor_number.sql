-- ============================================================
--  Migration 011: Add vendor_number to vendors table
-- ============================================================

-- Add vendor_number column (unique, auto-generated like V-00001)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS vendor_number VARCHAR(30) UNIQUE;

-- Generate vendor numbers for existing vendors based on creation order
UPDATE vendors
SET vendor_number = sub.vendor_number
FROM (
    SELECT id, 'V-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::text, 5, '0') AS vendor_number
    FROM vendors
) sub
WHERE vendors.id = sub.id
  AND vendors.vendor_number IS NULL;

-- Make vendor_number NOT NULL after backfilling
ALTER TABLE vendors ALTER COLUMN vendor_number SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vendors_vendor_number ON vendors(vendor_number);