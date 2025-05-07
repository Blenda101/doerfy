/*
  # Fix TimeBox Schema and Relationships

  1. Changes
    - Add warnThreshold and expireThreshold columns
    - Set default values for specific time boxes
    - Add foreign key constraint from tasks to time boxes
    - Create necessary indexes
    - Ensure all required time boxes exist

  2. Security
    - No changes to RLS policies needed
*/

-- First ensure the time_boxes table exists
CREATE TABLE IF NOT EXISTS time_boxes (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  "warnThreshold" integer,
  "expireThreshold" integer,
  sort_order integer NOT NULL
);

-- Insert or update time boxes with correct values
INSERT INTO time_boxes (id, name, description, "warnThreshold", "expireThreshold", sort_order)
VALUES
  ('queue', 'Do Queue', 'Tasks waiting to be started', NULL, NULL, 0),
  ('do', 'Do', 'Tasks ready to be worked on', 24, 30, 1),
  ('doing', 'Doing', 'Tasks currently in progress', 6, 7, 2),
  ('today', 'Do Today', 'Tasks that need to be completed today', 1, 1, 3),
  ('done', 'Done', 'Completed tasks', NULL, NULL, 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "warnThreshold" = EXCLUDED."warnThreshold",
  "expireThreshold" = EXCLUDED."expireThreshold",
  sort_order = EXCLUDED.sort_order;

-- Add foreign key constraint to tasks table
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS valid_timestage;

ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_timestage_fkey;

ALTER TABLE tasks
ADD CONSTRAINT tasks_timestage_fkey
FOREIGN KEY (timestage)
REFERENCES time_boxes(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Create index for the foreign key if it doesn't exist
CREATE INDEX IF NOT EXISTS tasks_timestage_fkey_idx ON tasks(timestage);

-- Update any tasks with invalid time stages to 'queue'
UPDATE tasks
SET timestage = 'queue'
WHERE timestage NOT IN (SELECT id FROM time_boxes);