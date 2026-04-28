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
