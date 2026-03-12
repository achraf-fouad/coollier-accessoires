-- ============================================================
-- COOLLIER ACCESSOIRES - Supabase SQL Migration
-- Run this in: https://supabase.com/dashboard -> SQL Editor
-- ============================================================

-- 1. Add status column to orders (pending | confirmed | cancelled)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

-- 2. Add notes column to orders (for variant info, quartier, etc.)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Verify the orders table looks correct
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- ============================================================
-- OPTIONAL: Enable Realtime on orders table so admin dashboard
-- updates live when new orders arrive
-- ============================================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;
