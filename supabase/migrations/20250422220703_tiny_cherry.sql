/*
  # Add Banner Configuration Storage

  1. New Tables
    - `banner_configs`
      - Stores user banner settings including:
        - Images and their order
        - Audio files and settings
        - Quotes and rotation settings
        - Text styling preferences

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Ensure each user has a banner config record
*/

-- Create banner_configs table
CREATE TABLE IF NOT EXISTS banner_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  images JSONB DEFAULT '[]'::JSONB,
  transition_time INTEGER DEFAULT 5,
  audio JSONB DEFAULT '[]'::JSONB,
  autoplay BOOLEAN DEFAULT FALSE,
  volume INTEGER DEFAULT 50,
  quotes JSONB DEFAULT '[]'::JSONB,
  quote_rotation BOOLEAN DEFAULT FALSE,
  quote_duration INTEGER DEFAULT 10,
  text_style JSONB DEFAULT '{"font": "Inter", "size": 24, "color": "#FFFFFF"}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE banner_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own banner config"
  ON banner_configs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own banner config"
  ON banner_configs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own banner config"
  ON banner_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_banner_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_banner_configs_updated_at
  BEFORE UPDATE ON banner_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_banner_configs_updated_at();

-- Create trigger for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.banner_configs (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert banner configs for existing users
INSERT INTO banner_configs (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;