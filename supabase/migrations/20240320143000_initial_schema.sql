-- Migration: Initial Schema Setup
-- Description: Creates all initial tables with relationships, indexes and RLS policies
-- Author: AI Assistant
-- Date: 2024-03-20

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create tables
create table user_films (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    title varchar(200) not null,
    year integer not null check (year >= 1887),
    description text,
    genres text[],
    actors text[],
    director varchar not null,
    status varchar not null check (status in ('to-watch', 'watched', 'rejected')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint,
    unique(user_id, title)
);

create table user_preferences (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    actors text[],
    directors text[],
    genres text[],
    year_from integer,
    year_to integer,
    unique(user_id)
);

create table generation_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    generated_count integer not null,
    marked_as_to_watch_count integer,
    marked_as_watched_count integer,
    marked_as_rejected_count integer,
    criteria_hash varchar not null,
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Add foreign key constraint for generation_id after generation_logs table is created
alter table user_films 
    add constraint user_films_generation_id_fkey 
    foreign key (generation_id) 
    references generation_logs(id) 
    on delete set null;

create table film_status_logs (
    id bigserial primary key,
    film_id bigint not null references user_films(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    prev_status varchar not null check (prev_status in ('to-watch', 'watched', 'rejected')),
    next_status varchar not null check (next_status in ('to-watch', 'watched', 'rejected')),
    status_changed_at timestamptz not null default now()
);

create table generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    criteria_hash varchar not null,
    error_code varchar not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Create indexes
create index idx_user_films_user_id on user_films(user_id);
create index idx_user_films_title on user_films(title);
create index idx_film_status_logs_film_id on film_status_logs(film_id);
create index idx_film_status_logs_user_id on film_status_logs(user_id);
create index idx_generation_logs_user_id on generation_logs(user_id);
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);

-- Create updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_user_films_updated_at
    before update on user_films
    for each row
    execute function update_updated_at_column();

create trigger update_generation_logs_updated_at
    before update on generation_logs
    for each row
    execute function update_updated_at_column();

-- Enable Row Level Security
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