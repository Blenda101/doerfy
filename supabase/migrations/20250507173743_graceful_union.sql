/*
  # Add Lists Table and Task Relationships

  1. New Tables
    - `lists`
      - Core list information
      - User ownership
      - Metadata and timestamps

  2. Changes to Tasks Table
    - Add foreign key relationship to lists
    - Update existing tasks to use new list relationship

  3. Security
    - Enable RLS on lists table
    - Add policies for authenticated users
*/

-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'list',
  color text DEFAULT 'gray',
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- Create policies for lists
CREATE POLICY "Users can read their own lists"
  ON lists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own lists"
  ON lists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own lists"
  ON lists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own lists"
  ON lists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create indexes
CREATE INDEX lists_owner_id_idx ON lists(owner_id);

-- Add list_id to tasks table
ALTER TABLE tasks
ADD COLUMN list_id uuid REFERENCES lists(id) ON DELETE SET NULL;

-- Create index for the foreign key
CREATE INDEX tasks_list_id_idx ON tasks(list_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON lists
  FOR EACH ROW
  EXECUTE FUNCTION update_lists_updated_at();

-- Insert default lists for existing tasks
DO $$
DECLARE
  task_record RECORD;
BEGIN
  FOR task_record IN SELECT DISTINCT assignee, list FROM tasks WHERE list IS NOT NULL LOOP
    INSERT INTO lists (name, owner_id)
    VALUES (task_record.list, task_record.assignee)
    ON CONFLICT DO NOTHING;
    
    UPDATE tasks
    SET list_id = (
      SELECT id 
      FROM lists 
      WHERE name = task_record.list 
      AND owner_id = task_record.assignee
      LIMIT 1
    )
    WHERE assignee = task_record.assignee
    AND list = task_record.list;
  END LOOP;
END $$;