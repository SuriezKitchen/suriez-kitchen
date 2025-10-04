-- Update local_videos table to use integer types for views and likes
ALTER TABLE local_videos ALTER COLUMN views TYPE integer USING views::integer;
ALTER TABLE local_videos ALTER COLUMN likes TYPE integer USING likes::integer;
