/*
  # Initial Schema Setup

  1. New Tables
    - `tasks`
      - Core task information
      - Status tracking
      - Metadata and timestamps
    - `time_boxes`
      - Time box configuration
      - Thresholds for warnings and expiry
      - Ordering information

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  time_stage text NOT NULL,
  stage_entry_date timestamptz NOT NULL DEFAULT now(),
  assignee uuid NOT NULL,
  list text NOT NULL,
  priority text DEFAULT 'medium',
  energy text DEFAULT 'medium',
  location text,
  story text,
  labels text[] DEFAULT '{}',
  icon text DEFAULT 'blue',
  highlighted boolean DEFAULT false,
  status text,
  aging_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL
);

-- Create time_boxes table
CREATE TABLE IF NOT EXISTS time_boxes (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  warn_threshold integer,
  expire_threshold integer,
  sort_order integer NOT NULL
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_boxes ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can read their own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = assignee);

CREATE POLICY "Users can insert their own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = assignee);

CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = assignee)
  WITH CHECK (auth.uid() = assignee);

CREATE POLICY "Users can delete their own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = assignee);

-- Create policies for time_boxes
CREATE POLICY "Time boxes are readable by all authenticated users"
  ON time_boxes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify time boxes"
  ON time_boxes
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_app_meta_data->>'is_admin' = 'true'
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS tasks_assignee_idx ON tasks(assignee);
CREATE INDEX IF NOT EXISTS tasks_time_stage_idx ON tasks(time_stage);
CREATE INDEX IF NOT EXISTS time_boxes_sort_order_idx ON time_boxes(sort_order);