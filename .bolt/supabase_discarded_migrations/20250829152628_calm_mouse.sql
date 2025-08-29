/*
  # Fix Foreign Keys and Database Relations

  1. Foreign Keys
    - Add missing foreign key constraint between posters and categories
    - Ensure referential integrity

  2. Indexes
    - Add performance indexes for common queries
    - Optimize JOIN operations

  3. Data Validation
    - Ensure all existing posters have valid category references
    - Clean up orphaned data
*/

-- 1. First, let's check and fix any orphaned posters
DO $$ 
BEGIN 
    -- Update any posters with invalid category_id to use a default category
    UPDATE posters 
    SET category_id = (
        SELECT id FROM categories 
        WHERE slug = 'autres' 
        LIMIT 1
    )
    WHERE category_id NOT IN (
        SELECT id FROM categories
    );
    
    RAISE NOTICE 'Updated orphaned posters to use default category';
END $$;

-- 2. Add the foreign key constraint if it doesn't exist
DO $$ 
BEGIN 
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_posters_category_id' 
        AND table_name = 'posters'
    ) THEN
        -- Add the constraint
        ALTER TABLE posters 
        ADD CONSTRAINT fk_posters_category_id 
        FOREIGN KEY (category_id) 
        REFERENCES categories(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- 3. Add performance indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_posters_category_published 
ON posters(category_id, is_published) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_posters_featured_published 
ON posters(is_featured, is_published) 
WHERE is_published = true AND is_featured = true;

-- 4. Ensure is_featured column exists with proper default
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posters' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE posters ADD COLUMN is_featured boolean DEFAULT false;
        RAISE NOTICE 'Added is_featured column';
    END IF;
END $$;

-- 5. Create a function to limit featured posters to 4 maximum
CREATE OR REPLACE FUNCTION check_featured_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- If trying to set is_featured to true
    IF NEW.is_featured = true AND (OLD.is_featured IS NULL OR OLD.is_featured = false) THEN
        -- Check current count of featured posters
        IF (SELECT COUNT(*) FROM posters WHERE is_featured = true AND id != NEW.id) >= 4 THEN
            RAISE EXCEPTION 'Maximum 4 featured posters allowed';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to enforce featured limit
DROP TRIGGER IF EXISTS check_featured_limit_trigger ON posters;
CREATE TRIGGER check_featured_limit_trigger
    BEFORE INSERT OR UPDATE ON posters
    FOR EACH ROW
    EXECUTE FUNCTION check_featured_limit();