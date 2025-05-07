/*
  # Fix Notes Author Relationship

  1. Changes
    - Update foreign key relationship for notes.author_id to reference profiles table
    - Drop existing foreign key if it exists
    - Add new foreign key constraint

  2. Security
    - No changes to RLS policies needed
*/

-- First drop the existing foreign key if it exists
ALTER TABLE notes
DROP CONSTRAINT IF EXISTS notes_author_id_fkey;

-- Add the new foreign key constraint
ALTER TABLE notes
ADD CONSTRAINT notes_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES profiles(id)
ON DELETE CASCADE;