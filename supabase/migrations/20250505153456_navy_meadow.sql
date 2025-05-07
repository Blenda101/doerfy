/*
  # Rename timeStage column to time_stage

  1. Changes
    - Rename the 'timeStage' column to 'time_stage' in the tasks table to match application expectations
    - Update indexes to use the new column name

  2. Security
    - No changes to RLS policies needed
*/

-- First drop the existing index if it exists
DROP INDEX IF EXISTS tasks_time_stage_idx;

-- Rename the column
ALTER TABLE tasks 
RENAME COLUMN "timeStage" TO time_stage;

-- Recreate the index with the new column name
CREATE INDEX tasks_time_stage_idx ON tasks USING btree (time_stage);