/*
  # Update Profile Schema and Fix Tasks Table

  1. Changes
    - Add name columns to profiles table if they don't exist
    - Create/update full name function
    - Fix tasks table updated_at column if missing

  2. Safety
    - Check for column existence before adding
    - Use IF NOT EXISTS clauses
*/

-- Add name columns to profiles table if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'first_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN first_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'last_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_name TEXT;
  END IF;
END $$;

-- Create or replace function to get full name
CREATE OR REPLACE FUNCTION get_full_name(profile_row profiles)
RETURNS TEXT AS $$
BEGIN
  IF profile_row.first_name IS NOT NULL AND profile_row.last_name IS NOT NULL THEN
    RETURN profile_row.first_name || ' ' || profile_row.last_name;
  ELSIF profile_row.first_name IS NOT NULL THEN
    RETURN profile_row.first_name;
  ELSIF profile_row.last_name IS NOT NULL THEN
    RETURN profile_row.last_name;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Fix tasks table updated_at column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE tasks 
    ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;