/*
  # Add Unique List Names Per Owner

  1. Changes
    - Add unique constraint for list names per owner
    - Ensure existing data complies with constraint
    - Update indexes for performance

  2. Security
    - No changes to RLS policies needed
*/

-- First clean up any duplicate list names per owner
WITH duplicates AS (
  SELECT owner_id, name, 
    ROW_NUMBER() OVER (PARTITION BY owner_id, name ORDER BY created_at) as rn
  FROM lists
)
DELETE FROM lists
WHERE id IN (
  SELECT l.id
  FROM lists l
  JOIN duplicates d ON l.owner_id = d.owner_id AND l.name = d.name
  WHERE d.rn > 1
);

-- Add unique constraint for list name per owner
ALTER TABLE lists
ADD CONSTRAINT unique_list_name_per_owner UNIQUE (owner_id, name);

-- Update existing index to support the unique constraint
DROP INDEX IF EXISTS lists_owner_id_idx;
CREATE INDEX lists_owner_id_name_idx ON lists(owner_id, name);