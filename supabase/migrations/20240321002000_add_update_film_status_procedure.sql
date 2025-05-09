-- Migration: Add update_film_status stored procedure
-- Description: Creates a stored procedure for updating film status with logging
-- Author: AI Assistant
-- Date: 2024-03-21

create or replace function update_film_status(
    p_film_id bigint,
    p_user_id uuid,
    p_new_status varchar,
    p_prev_status varchar
) returns user_films as $$
declare
    v_updated_film user_films;
begin
    -- Validate input status values
    if p_new_status not in ('to-watch', 'watched', 'rejected') then
        raise exception 'Invalid new_status value: %', p_new_status;
    end if;

    if p_prev_status not in ('to-watch', 'watched', 'rejected') then
        raise exception 'Invalid prev_status value: %', p_prev_status;
    end if;

    -- Update film status
    update user_films
    set status = p_new_status,
        updated_at = now()
    where id = p_film_id
        and user_id = p_user_id
    returning * into v_updated_film;

    -- If film was not found or doesn't belong to user
    if not found then
        raise exception 'Film not found or you are not authorized to update it';
    end if;

    -- Log status change
    insert into film_status_logs (
        film_id,
        user_id,
        prev_status,
        next_status
    ) values (
        p_film_id,
        p_user_id,
        p_prev_status,
        p_new_status
    );

    return v_updated_film;
end;
$$ language plpgsql security definer; 