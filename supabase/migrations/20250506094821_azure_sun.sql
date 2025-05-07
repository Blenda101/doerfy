/*
  # Fix Time Boxes Schema

  1. Changes
    - Rename warn_threshold to warnThreshold
    - Rename expire_threshold to expireThreshold
    - Update existing data with new column names
    - Add foreign key relationship with tasks

  2. Security
    - No changes to existing policies needed
*/

-- Rename columns in time_boxes table
ALTER TABLE time_boxes 
RENAME COLUMN warn_threshold TO "warnThreshold";

ALTER TABLE time_boxes 
RENAME COLUMN expire_threshold TO "expireThreshold";

-- Update existing data
UPDATE time_boxes SET
  "warnThreshold" = 24,
  "expireThreshold" = 30
WHERE id = 'do';

UPDATE time_boxes SET
  "warnThreshold" = 6,
  "expireThreshold" = 7
WHERE id = 'doing';

UPDATE time_boxes SET
  "warnThreshold" = 1,
  "expireThreshold" = 1
WHERE id = 'today';

-- Ensure all required time boxes exist
INSERT INTO time_boxes (id, name, description, "warnThreshold", "expireThreshold", sort_order)
VALUES
  ('queue', 'Do Queue', 'Tasks waiting to be started', NULL, NULL, 0),
  ('do', 'Do', 'Tasks ready to be worked on', 24, 30, 1),
  ('doing', 'Doing', 'Tasks currently in progress', 6, 7, 2),
  ('today', 'Do Today', 'Tasks that need to be completed today', 1, 1, 3),
  ('done', 'Done', 'Completed tasks', NULL, NULL, 4)
ON CONFLICT (id) DO NOTHING;

-- Add foreign key constraint to tasks table
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS valid_timestage;

ALTER TABLE tasks
ADD CONSTRAINT tasks_timestage_fkey
FOREIGN KEY (timestage)
REFERENCES time_boxes(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Create index for the foreign key
CREATE INDEX IF NOT EXISTS tasks_timestage_fkey_idx ON tasks(timestage);

-- Update any tasks with invalid time stages to 'queue'
UPDATE tasks
SET timestage = 'queue'
WHERE timestage NOT IN (SELECT id FROM time_boxes);