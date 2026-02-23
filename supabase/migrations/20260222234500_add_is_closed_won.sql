-- Migration to add `is_closed_won` property to pipeline_stages

ALTER TABLE public.pipeline_stages
ADD COLUMN is_closed_won BOOLEAN DEFAULT false;

-- Update existing 'won' stages if any exist by name as a best effort
UPDATE public.pipeline_stages
SET is_closed_won = true
WHERE name ILIKE '%ganho%' 
   OR name ILIKE '%won%' 
   OR name ILIKE '%fechado%ganho%';
