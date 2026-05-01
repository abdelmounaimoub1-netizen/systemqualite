-- Repair script for Supabase SQL Editor.
-- Use this when the app shows:
-- "Could not find the table 'public.customer_complaints' in the schema cache"
--
-- Requirement: the base QMS schema must already exist (profiles, roles,
-- departments, suppliers, audit_trail, set_updated_at, log_audit_trail, has_role).

create extension if not exists pgcrypto;

create table if not exists public.customer_complaints (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  contact_email text,
  product_reference text,
  description text not null,
  severity text not null default 'Medium' check (severity in ('Low', 'Medium', 'High', 'Critical')),
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Answered', 'Closed')),
  received_date date,
  due_date date,
  responsible_user_id uuid references public.profiles (id) on delete set null,
  response_summary text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

alter table public.customer_complaints
  add column if not exists affiliation text,
  add column if not exists agent_id uuid references public.profiles (id) on delete set null,
  add column if not exists declarant_name text,
  add column if not exists client_sector text,
  add column if not exists client_typology text,
  add column if not exists contact_name text,
  add column if not exists phone text,
  add column if not exists country_city text,
  add column if not exists distributor_channel text,
  add column if not exists complaint_type text not null default 'Produit',
  add column if not exists object_summary text,
  add column if not exists complaint_category text,
  add column if not exists origin text,
  add column if not exists brand text,
  add column if not exists product_name text,
  add column if not exists lot_number text,
  add column if not exists production_date date,
  add column if not exists expiry_date date,
  add column if not exists purchase_delivery_date date,
  add column if not exists quantity numeric,
  add column if not exists immediate_actions text,
  add column if not exists orientation_recipient text,
  add column if not exists information_recipients text,
  add column if not exists orientation_decision text,
  add column if not exists problem_origin text,
  add column if not exists verification_recipient text,
  add column if not exists closure_recipients text,
  add column if not exists actions_effective text,
  add column if not exists effectiveness_criteria text,
  add column if not exists closure_date date,
  add column if not exists estimated_cost_total numeric,
  add column if not exists measurement_reason text,
  add column if not exists measurement_deadline date,
  add column if not exists ineffective_reason text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'customer_complaints_complaint_type_check'
  ) then
    alter table public.customer_complaints
      add constraint customer_complaints_complaint_type_check
      check (complaint_type in ('Produit', 'Service', 'Autre'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'customer_complaints_orientation_decision_check'
  ) then
    alter table public.customer_complaints
      add constraint customer_complaints_orientation_decision_check
      check (orientation_decision is null or orientation_decision in ('Traiter', 'Modifier', 'Cloturer'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'customer_complaints_actions_effective_check'
  ) then
    alter table public.customer_complaints
      add constraint customer_complaints_actions_effective_check
      check (actions_effective is null or actions_effective in ('Oui', 'Non', 'A mesurer'));
  end if;
end $$;

create table if not exists public.customer_complaint_actions (
  id uuid primary key default gen_random_uuid(),
  customer_complaint_id uuid not null references public.customer_complaints (id) on delete cascade,
  pilot_id uuid references public.profiles (id) on delete set null,
  action text not null,
  deadline date,
  completion_date date,
  comment text,
  progress_status text not null default 'Open' check (progress_status in ('Open', 'In Progress', 'Done', 'Ineffective')),
  estimated_cost numeric,
  attachment_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.supplier_complaints (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  supplier_id uuid references public.suppliers (id) on delete set null,
  supplier_name text,
  issue_type text,
  description text not null,
  severity text not null default 'Medium' check (severity in ('Low', 'Medium', 'High', 'Critical')),
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Answered', 'Closed')),
  received_date date,
  due_date date,
  responsible_user_id uuid references public.profiles (id) on delete set null,
  response_summary text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.constats (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  title text not null,
  description text not null,
  process_area text,
  department_id uuid references public.departments (id) on delete set null,
  severity text not null default 'Medium' check (severity in ('Low', 'Medium', 'High', 'Critical')),
  status text not null default 'Open' check (status in ('Open', 'Analyzed', 'Action Required', 'Closed')),
  detected_date date,
  responsible_user_id uuid references public.profiles (id) on delete set null,
  action_summary text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  complainant_name text not null,
  channel text,
  description text not null,
  severity text not null default 'Medium' check (severity in ('Low', 'Medium', 'High', 'Critical')),
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Answered', 'Closed')),
  received_date date,
  due_date date,
  responsible_user_id uuid references public.profiles (id) on delete set null,
  response_summary text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists idx_customer_complaints_status on public.customer_complaints (status);
create index if not exists idx_customer_complaints_due_date on public.customer_complaints (due_date);
create index if not exists idx_customer_complaints_responsible on public.customer_complaints (responsible_user_id);
create index if not exists idx_customer_complaint_actions_complaint on public.customer_complaint_actions (customer_complaint_id);
create index if not exists idx_customer_complaint_actions_pilot on public.customer_complaint_actions (pilot_id);
create index if not exists idx_supplier_complaints_status on public.supplier_complaints (status);
create index if not exists idx_supplier_complaints_due_date on public.supplier_complaints (due_date);
create index if not exists idx_supplier_complaints_supplier on public.supplier_complaints (supplier_id);
create index if not exists idx_supplier_complaints_responsible on public.supplier_complaints (responsible_user_id);
create index if not exists idx_constats_status on public.constats (status);
create index if not exists idx_constats_detected_date on public.constats (detected_date);
create index if not exists idx_constats_responsible on public.constats (responsible_user_id);
create index if not exists idx_complaints_status on public.complaints (status);
create index if not exists idx_complaints_due_date on public.complaints (due_date);
create index if not exists idx_complaints_responsible on public.complaints (responsible_user_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'customer_complaints',
    'customer_complaint_actions',
    'supplier_complaints',
    'constats',
    'complaints'
  ]
  loop
    execute format('drop trigger if exists trg_%1$s_set_updated_at on public.%1$s', table_name);
    execute format('create trigger trg_%1$s_set_updated_at before update on public.%1$s for each row execute function public.set_updated_at()', table_name);

    execute format('drop trigger if exists trg_%1$s_audit on public.%1$s', table_name);
    execute format('create trigger trg_%1$s_audit after insert or update or delete on public.%1$s for each row execute function public.log_audit_trail()', table_name);
  end loop;
end $$;

alter table public.customer_complaints enable row level security;
alter table public.customer_complaint_actions enable row level security;
alter table public.supplier_complaints enable row level security;
alter table public.constats enable row level security;
alter table public.complaints enable row level security;

drop policy if exists "customer_complaints_select_internal" on public.customer_complaints;
create policy "customer_complaints_select_internal" on public.customer_complaints
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

drop policy if exists "customer_complaints_manage_internal" on public.customer_complaints;
create policy "customer_complaints_manage_internal" on public.customer_complaints
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

drop policy if exists "customer_complaint_actions_select_internal" on public.customer_complaint_actions;
create policy "customer_complaint_actions_select_internal" on public.customer_complaint_actions
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

drop policy if exists "customer_complaint_actions_manage_internal" on public.customer_complaint_actions;
create policy "customer_complaint_actions_manage_internal" on public.customer_complaint_actions
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

drop policy if exists "supplier_complaints_select_internal" on public.supplier_complaints;
create policy "supplier_complaints_select_internal" on public.supplier_complaints
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee', 'supplier_viewer']));

drop policy if exists "supplier_complaints_manage_internal" on public.supplier_complaints;
create policy "supplier_complaints_manage_internal" on public.supplier_complaints
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

drop policy if exists "constats_select_internal" on public.constats;
create policy "constats_select_internal" on public.constats
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

drop policy if exists "constats_manage_internal" on public.constats;
create policy "constats_manage_internal" on public.constats
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

drop policy if exists "complaints_select_internal" on public.complaints;
create policy "complaints_select_internal" on public.complaints
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

drop policy if exists "complaints_manage_internal" on public.complaints;
create policy "complaints_manage_internal" on public.complaints
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

-- Force Supabase/PostgREST to see the new tables immediately.
notify pgrst, 'reload schema';
