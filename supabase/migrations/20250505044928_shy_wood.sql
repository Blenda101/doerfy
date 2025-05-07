/*
  # Notes and Notebooks Schema

  1. New Tables
    - `notes`
      - Core note information
      - Content and metadata
      - Notebook relationship
    - `notebooks`
      - Notebook configuration
      - Dynamic filtering support
      - Note organization

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type = 'note'),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  labels text[] DEFAULT '{}',
  author_id uuid NOT NULL REFERENCES auth.users(id),
  color_theme text NOT NULL CHECK (color_theme = ANY (ARRAY['blue', 'green', 'purple', 'red', 'yellow'])),
  is_protected boolean DEFAULT false,
  pin_hash text,
  notebook_id uuid REFERENCES notebooks(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notebooks table if it doesn't exist
CREATE TABLE IF NOT EXISTS notebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type = 'notebook'),
  title text NOT NULL,
  description text DEFAULT '',
  labels text[] DEFAULT '{}',
  color_theme text NOT NULL CHECK (color_theme = ANY (ARRAY['blue', 'green', 'purple', 'red', 'yellow'])),
  is_dynamic boolean DEFAULT false,
  filter_criteria jsonb,
  note_ids uuid[] DEFAULT '{}',
  is_protected boolean DEFAULT false,
  pin_hash text,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_filter_criteria CHECK (
    (is_dynamic = false AND filter_criteria IS NULL) OR
    (is_dynamic = true AND filter_criteria IS NOT NULL)
  )
);

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'notes_author_id_idx') THEN
    CREATE INDEX notes_author_id_idx ON notes(author_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'notes_labels_idx') THEN
    CREATE INDEX notes_labels_idx ON notes USING gin(labels);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'notes_notebook_id_idx') THEN
    CREATE INDEX notes_notebook_id_idx ON notes(notebook_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'notebooks_author_id_idx') THEN
    CREATE INDEX notebooks_author_id_idx ON notebooks(author_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'notebooks_labels_idx') THEN
    CREATE INDEX notebooks_labels_idx ON notebooks USING gin(labels);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;
DROP POLICY IF EXISTS "Users can read their own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can insert their own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can update their own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can delete their own notebooks" ON notebooks;

-- Create policies for notes
CREATE POLICY "Users can read their own notes"
  ON notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can insert their own notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own notes"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own notes"
  ON notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create policies for notebooks
CREATE POLICY "Users can read their own notebooks"
  ON notebooks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can insert their own notebooks"
  ON notebooks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own notebooks"
  ON notebooks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own notebooks"
  ON notebooks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create or replace function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
DROP TRIGGER IF EXISTS update_notebooks_updated_at ON notebooks;

-- Create triggers
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notebooks_updated_at
  BEFORE UPDATE ON notebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();