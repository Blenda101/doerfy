-- Add 'none' to existing recurring_pattern enum
ALTER TYPE recurring_pattern ADD VALUE IF NOT EXISTS 'none';

-- Create new enums
CREATE TYPE ends_type AS ENUM ('never', 'on-date', 'after-occurrences');

CREATE TYPE recurring_occurrences AS ENUM ('S', 'M', 'T', 'W', 'Th', 'F', 'Sa', 'Su');

-- Alter tasks table with new columns
ALTER TABLE tasks
ADD COLUMN recurring_occurrences recurring_occurrences, -- defaults to NULL
ADD COLUMN workdays_only boolean DEFAULT false,
ADD COLUMN ends_type ends_type DEFAULT 'never',
ADD COLUMN ends_date date,
ADD COLUMN ends_after_occurrences integer,
ADD COLUMN alarm_enabled boolean DEFAULT false;
