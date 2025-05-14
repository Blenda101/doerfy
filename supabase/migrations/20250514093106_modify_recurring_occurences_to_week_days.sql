-- 1. Rename the enum type
ALTER TYPE recurring_occurrences RENAME TO week_days;

-- 2. Rename the column
ALTER TABLE tasks
RENAME COLUMN recurring_occurrences TO week_days;

-- 3. Change the column type to use the renamed enum as an array
ALTER TABLE tasks
ALTER COLUMN week_days TYPE week_days[] USING ARRAY[week_days]::week_days[];

-- 4. Ensure default is NULL (by clearing any existing default)
ALTER TABLE tasks
ALTER COLUMN week_days DROP DEFAULT;
