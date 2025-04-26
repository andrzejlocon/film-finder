-- Migration: Restore RLS Policies
-- Description: Re-enables RLS and recreates all security policies for tables
-- Author: AI Assistant
-- Date: 2024-03-21

-- Enable Row Level Security for all tables
alter table user_films enable row level security;
alter table user_preferences enable row level security;
alter table film_status_logs enable row level security;
alter table generation_logs enable row level security;
alter table generation_error_logs enable row level security;

-- Create RLS Policies for user_films
create policy "Users can view their own films"
    on user_films for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own films"
    on user_films for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own films"
    on user_films for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own films"
    on user_films for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create RLS Policies for user_preferences
create policy "Users can view their own preferences"
    on user_preferences for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
    on user_preferences for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
    on user_preferences for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own preferences"
    on user_preferences for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create RLS Policies for film_status_logs
create policy "Users can view their own status logs"
    on film_status_logs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own status logs"
    on film_status_logs for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Create RLS Policies for generation_logs
create policy "Users can view their own generation logs"
    on generation_logs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own generation logs"
    on generation_logs for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own generation logs"
    on generation_logs for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Create RLS Policies for generation_error_logs
create policy "Users can view their own error logs"
    on generation_error_logs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs"
    on generation_error_logs for insert
    to authenticated
    with check (auth.uid() = user_id);
