-- Alter time_taken and points_awarded columns to FLOAT in attempts table
ALTER TABLE attempts 
ALTER COLUMN time_taken TYPE FLOAT,
ALTER COLUMN points_awarded TYPE FLOAT;

-- Alter score column to FLOAT in teams table
ALTER TABLE teams
ALTER COLUMN score TYPE FLOAT;
