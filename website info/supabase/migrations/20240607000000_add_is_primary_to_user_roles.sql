-- Add is_primary column to user_roles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_roles' 
        AND column_name = 'is_primary'
    ) THEN
        ALTER TABLE user_roles ADD COLUMN is_primary BOOLEAN DEFAULT true;
    END IF;
END $$; 