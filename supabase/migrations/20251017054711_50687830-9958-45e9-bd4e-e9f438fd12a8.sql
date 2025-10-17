-- Add new fields to invitation table for intro text section and footer parent names
ALTER TABLE invitation 
ADD COLUMN IF NOT EXISTS intro_text TEXT DEFAULT '서로의 삶이 하나로 이어지는 날, 함께 축하해주세요.',
ADD COLUMN IF NOT EXISTS groom_father TEXT DEFAULT '이양규',
ADD COLUMN IF NOT EXISTS groom_mother TEXT DEFAULT '한나미',
ADD COLUMN IF NOT EXISTS bride_father TEXT DEFAULT '고범석',
ADD COLUMN IF NOT EXISTS bride_mother TEXT DEFAULT '장은경';