/*
  # Add admin flag to profiles table

  1. Changes
    - Add is_admin column to profiles table
    - Set default value to false
    - Add check constraint to ensure valid values

  2. Security
    - Update existing policies to handle admin flag
*/

-- Add is_admin column to profiles table
ALTER TABLE profiles
ADD COLUMN is_admin boolean DEFAULT false;

-- Add check constraint
ALTER TABLE profiles
ADD CONSTRAINT valid_admin_flag CHECK (is_admin IS NOT NULL);

-- Update existing policies
DROP POLICY IF EXISTS "Only admins can modify time boxes" ON time_boxes;
CREATE POLICY "Only admins can modify time boxes"
  ON time_boxes
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  ));

-- Create first admin user (replace with your user ID)
UPDATE profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = current_setting('app.admin_email', true)
);