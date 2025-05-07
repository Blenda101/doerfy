/*
  # Fix Notes Author Relationship

  1. Changes
    - Rename author_id to author in notes table
    - Update foreign key constraints
    - Update RLS policies

  2. Security
    - Maintain existing RLS policies with new column name
*/

-- Rename author_id to author in notes table
ALTER TABLE notes
RENAME COLUMN author_id TO author;

-- Update foreign key constraint
ALTER TABLE notes
DROP CONSTRAINT IF EXISTS notes_author_id_fkey;

ALTER TABLE notes
ADD CONSTRAINT notes_author_fkey
FOREIGN KEY (author)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

CREATE POLICY "Users can read their own notes"
  ON notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author);

CREATE POLICY "Users can insert their own notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author);

CREATE POLICY "Users can update their own notes"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author)
  WITH CHECK (auth.uid() = author);

CREATE POLICY "Users can delete their own notes"
  ON notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author);