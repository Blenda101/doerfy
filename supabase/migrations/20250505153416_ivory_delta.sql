/*
  # Rename time_stage column to timeStage

  1. Changes
    - Rename column `time_stage` to `timeStage` in tasks table to match frontend code
    - Update all references and indexes

  2. Security
    - No security changes needed, keeping existing RLS policies
*/

DO $$ 
BEGIN
  -- Only rename if the old column exists and new one doesn't
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'time_stage'
  ) AND NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'timeStage'
  ) THEN
    -- Rename the column
    ALTER TABLE tasks RENAME COLUMN time_stage TO "timeStage";
    
    -- Recreate the index with the new column name
    DROP INDEX IF EXISTS tasks_time_stage_idx;
    CREATE INDEX tasks_time_stage_idx ON tasks ("timeStage");
  END IF;
END $$;