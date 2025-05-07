/*
  # Add Aging Status Column to Tasks

  1. Changes
    - Add agingStatus column to tasks table
    - Set default value to ensure data consistency
    - Update existing tasks to have a default value

  2. Security
    - No changes to RLS policies needed as this is just a column addition
*/

-- Add agingStatus column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'aging_status'
  ) THEN
    ALTER TABLE tasks
    ADD COLUMN aging_status text DEFAULT 'normal';
  END IF;
END $$;

-- Update any existing tasks to have the default aging status
UPDATE tasks 
SET aging_status = 'normal' 
WHERE aging_status IS NULL;