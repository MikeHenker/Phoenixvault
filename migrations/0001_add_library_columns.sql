
-- Add has_local_files and exe_path columns to user_library table
ALTER TABLE "user_library" ADD COLUMN "has_local_files" boolean DEFAULT false;
ALTER TABLE "user_library" ADD COLUMN "exe_path" text;
