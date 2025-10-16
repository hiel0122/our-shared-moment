-- Update couple names in invitation table
UPDATE invitation SET 
  couple_groom = '이학인',
  couple_bride = '고다희'
WHERE id IS NOT NULL;

-- Update default values for future records
ALTER TABLE invitation 
  ALTER COLUMN couple_groom SET DEFAULT '이학인',
  ALTER COLUMN couple_bride SET DEFAULT '고다희';