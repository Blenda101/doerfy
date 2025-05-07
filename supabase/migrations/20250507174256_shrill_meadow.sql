/*
  # Remove List Field from Tasks Table

  1. Changes
    - Remove the 'list' column from tasks table
    - Keep list_id as the only reference to lists

  2. Notes
    - All data has already been migrated to use list_id in previous migrations
    - Safe to remove the old column
*/

-- Remove the list column from tasks table
ALTER TABLE tasks
DROP COLUMN IF EXISTS list;