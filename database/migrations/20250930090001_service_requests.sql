create extension if not exists "uuid-ossp";

create table if not exists public.service_requests (
  id uuid primary key default uuid_generate_v4(),
  guest_id uuid references public.profiles(id) on delete set null,
  room_number text,
  request_type text,
  summary text not null,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  eta timestamptz,
  created_by text not null default 'agent' check (created_by in ('agent','staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists service_requests_guest_id_idx on public.service_requests (guest_id);
create index if not exists service_requests_status_idx on public.service_requests (status);

create table if not exists public.service_request_updates (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  author_type text not null check (author_type in ('staff','agent','system')),
  staff_profile_id uuid references public.profiles(id) on delete set null,
  note text,
  status text,
  visible_to_guest boolean not null default true,
  added_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists service_request_updates_request_id_idx on public.service_request_updates (request_id);
create index if not exists service_request_updates_added_at_idx on public.service_request_updates (added_at desc);

create or replace function public.service_requests_updated_at_trigger()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp on public.service_requests;
create trigger set_service_requests_timestamp
before update on public.service_requests
for each row execute procedure public.service_requests_updated_at_trigger();
