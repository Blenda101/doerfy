/*
  # Add Stories Feature

  1. New Tables
    - `stories`
      - Core story information
      - Story type (theme, mega_do, project, todo)
      - Parent/child relationships
      - Status tracking
      - Metadata and timestamps
    
  2. Changes to Existing Tables
    - Add story_id to tasks table
    
  3. Security
    - Enable RLS on stories table
    - Add policies for authenticated users
*/

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL CHECK (type IN ('theme', 'mega_do', 'project', 'todo')),
  parent_id text REFERENCES stories(id),
  vision text,
  mission text,
  goals jsonb DEFAULT '[]'::jsonb,
  what_done_looks_like text,
  due_date timestamptz,
  effort_estimate integer,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  labels text[] DEFAULT '{}',
  assignee uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Add story_id to tasks
ALTER TABLE tasks
ADD COLUMN story_id text REFERENCES stories(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS stories_parent_id_idx ON stories(parent_id);
CREATE INDEX IF NOT EXISTS stories_type_idx ON stories(type);
CREATE INDEX IF NOT EXISTS stories_assignee_idx ON stories(assignee);
CREATE INDEX IF NOT EXISTS tasks_story_id_idx ON tasks(story_id);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create policies for stories
CREATE POLICY "Users can read their own stories"
  ON stories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = assignee OR auth.uid() = created_by);

CREATE POLICY "Users can insert their own stories"
  ON stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = assignee OR auth.uid() = created_by);

CREATE POLICY "Users can update their own stories"
  ON stories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = assignee OR auth.uid() = created_by)
  WITH CHECK (auth.uid() = assignee OR auth.uid() = created_by);

CREATE POLICY "Users can delete their own stories"
  ON stories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = assignee OR auth.uid() = created_by);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_stories_updated_at();