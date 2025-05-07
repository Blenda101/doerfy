/*
  # Add Name Fields to Profiles

  1. Changes
    - Add first_name column to profiles table
    - Add last_name column to profiles table
    - Add name display function

  2. Security
    - No changes to existing policies required
*/

-- Add name columns to profiles table
ALTER TABLE profiles
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Create a function to get full name
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