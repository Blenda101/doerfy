/*
  # Add Aging Status Column to Tasks Table

  1. Changes
    - Add aging_status column to tasks table
    - Set default value to 'normal'
    - Add check constraint for valid values
*/

-- Add aging_status column if it doesn't exist
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

-- Add check constraint for valid values
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS valid_aging_status;

ALTER TABLE tasks
ADD CONSTRAINT valid_aging_status 
CHECK (aging_status = ANY (ARRAY['normal', 'warning', 'overdue']));

-- Update any null values to 'normal'
UPDATE tasks 
SET aging_status = 'normal' 
WHERE aging_status IS NULL;