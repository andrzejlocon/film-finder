-- Migration: Disable All RLS Policies
-- Description: Drops all previously defined RLS policies
-- Author: AI Assistant
-- Date: 2024-03-21

-- Drop policies for user_films
drop policy if exists "Users can view their own films" on user_films;
drop policy if exists "Users can insert their own films" on user_films;
drop policy if exists "Users can update their own films" on user_films;
drop policy if exists "Users can delete their own films" on user_films;

-- Drop policies for user_preferences
drop policy if exists "Users can view their own preferences" on user_preferences;
drop policy if exists "Users can insert their own preferences" on user_preferences;
drop policy if exists "Users can update their own preferences" on user_preferences;
drop policy if exists "Users can delete their own preferences" on user_preferences;

-- Drop policies for film_status_logs
drop policy if exists "Users can view their own status logs" on film_status_logs;
drop policy if exists "Users can insert their own status logs" on film_status_logs;

-- Drop policies for generation_logs
drop policy if exists "Users can view their own generation logs" on generation_logs;
drop policy if exists "Users can insert their own generation logs" on generation_logs;
drop policy if exists "Users can update their own generation logs" on generation_logs;

-- Drop policies for generation_error_logs
drop policy if exists "Users can view their own error logs" on generation_error_logs;
drop policy if exists "Users can insert their own error logs" on generation_error_logs;

-- Disable RLS on all tables
alter table user_films disable row level security;
alter table user_preferences disable row level security;
alter table film_status_logs disable row level security;
alter table generation_logs disable row level security;
alter table generation_error_logs disable row level security; 