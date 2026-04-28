-- Qualios-style QMS complete SQL for Supabase SQL Editor.
-- Fresh database order included in this file: base schema, Qualios portal extension, customer complaint workflow, demo seed.
-- Run once on a Supabase project where the public schema can be created.

-- ------------------------------------------------------------

create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.document_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  job_title text,
  phone text,
  role_id uuid references public.roles (id) on delete set null,
  department_id uuid references public.departments (id) on delete set null,
  avatar_url text,
  supplier_company text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  document_code text not null unique,
  title text not null,
  summary text,
  category_id uuid references public.document_categories (id) on delete set null,
  owner_id uuid references public.profiles (id) on delete set null,
  department_id uuid references public.departments (id) on delete set null,
  status text not null default 'Draft' check (status in ('Draft', 'Under Review', 'Approved', 'Archived')),
  version_current text not null default '1.0',
  effective_date date,
  review_date date,
  file_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  version_number text not null,
  status text not null default 'Draft' check (status in ('Draft', 'Under Review', 'Approved', 'Archived')),
  change_summary text,
  approval_date date,
  file_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  process_area text,
  owner_id uuid references public.profiles (id) on delete set null,
  department_id uuid references public.departments (id) on delete set null,
  status text not null default 'Draft' check (status in ('Draft', 'Active', 'Archived')),
  fields_schema text,
  target_indicator text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.form_entries (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  record_code text not null,
  title text not null,
  submitted_by uuid references public.profiles (id) on delete set null,
  workflow_state text not null default 'Draft' check (workflow_state in ('Draft', 'Submitted', 'In Review', 'Approved', 'Rejected')),
  due_date date,
  content text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'Draft' check (status in ('Draft', 'In Progress', 'Awaiting Approval', 'Approved', 'Rejected', 'Completed')),
  due_date date,
  responsible_user_id uuid references public.profiles (id) on delete set null,
  approval_required boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows (id) on delete cascade,
  step_name text not null,
  description text,
  responsible_user_id uuid references public.profiles (id) on delete set null,
  due_date date,
  status text not null default 'Draft' check (status in ('Draft', 'In Progress', 'Awaiting Approval', 'Approved', 'Rejected', 'Completed')),
  approval_state text not null default 'Pending' check (approval_state in ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.non_conformities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  severity text not null default 'Medium' check (severity in ('Low', 'Medium', 'High', 'Critical')),
  source text,
  department_id uuid references public.departments (id) on delete set null,
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Closed')),
  responsible_user_id uuid references public.profiles (id) on delete set null,
  root_cause text,
  due_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.capa_actions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  action_type text not null default 'Corrective' check (action_type in ('Corrective', 'Preventive')),
  non_conformity_id uuid references public.non_conformities (id) on delete set null,
  description text,
  responsible_user_id uuid references public.profiles (id) on delete set null,
  deadline date,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Critical')),
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Verification', 'Closed')),
  effectiveness_check text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  audit_type text not null default 'Internal' check (audit_type in ('Internal', 'External')),
  scope text,
  auditor_id uuid references public.profiles (id) on delete set null,
  planned_date date,
  follow_up_date date,
  status text not null default 'Planned' check (status in ('Planned', 'In Progress', 'Completed', 'Closed')),
  report_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.audit_checklists (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits (id) on delete cascade,
  item_text text not null,
  is_required boolean not null default true,
  response_status text not null default 'Pending' check (response_status in ('Pending', 'Pass', 'Fail', 'N/A')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.audit_findings (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits (id) on delete cascade,
  title text not null,
  description text,
  severity text not null default 'Minor' check (severity in ('Minor', 'Major', 'Critical')),
  owner_id uuid references public.profiles (id) on delete set null,
  status text not null default 'Open' check (status in ('Open', 'Action Planned', 'Closed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.risks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  probability integer not null default 1 check (probability between 1 and 5),
  impact integer not null default 1 check (impact between 1 and 5),
  risk_score integer not null default 1,
  risk_level text not null default 'Low' check (risk_level in ('Low', 'Medium', 'High', 'Critical')),
  mitigation_plan text,
  owner_id uuid references public.profiles (id) on delete set null,
  review_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.trainings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  employee_id uuid references public.profiles (id) on delete set null,
  role_required text,
  status text not null default 'Planned' check (status in ('Planned', 'In Progress', 'Completed', 'Expired')),
  expiry_date date,
  certificate_path text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  serial_number text,
  location text,
  maintenance_date date,
  calibration_date date,
  status text not null default 'Active' check (status in ('Active', 'Maintenance', 'Calibration Due', 'Retired')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  evaluation_score numeric(5,2),
  status text not null default 'Under Review' check (status in ('Approved', 'Under Review', 'Blocked')),
  audit_history text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  status text not null default 'Unread' check (status in ('Unread', 'Read')),
  due_date date,
  category text,
  user_id uuid references public.profiles (id) on delete cascade,
  action_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.audit_trail (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action_type text not null check (action_type in ('INSERT', 'UPDATE', 'DELETE')),
  user_id uuid references auth.users (id) on delete set null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists idx_profiles_role_id on public.profiles (role_id);
create index if not exists idx_profiles_department_id on public.profiles (department_id);
create index if not exists idx_documents_status on public.documents (status);
create index if not exists idx_documents_owner_id on public.documents (owner_id);
create index if not exists idx_documents_review_date on public.documents (review_date);
create index if not exists idx_document_versions_document_id on public.document_versions (document_id);
create index if not exists idx_forms_status on public.forms (status);
create index if not exists idx_forms_owner_id on public.forms (owner_id);
create index if not exists idx_form_entries_form_id on public.form_entries (form_id);
create index if not exists idx_form_entries_state on public.form_entries (workflow_state);
create index if not exists idx_form_entries_due_date on public.form_entries (due_date);
create index if not exists idx_workflows_status on public.workflows (status);
create index if not exists idx_workflows_due_date on public.workflows (due_date);
create index if not exists idx_workflow_steps_workflow_id on public.workflow_steps (workflow_id);
create index if not exists idx_workflow_steps_due_date on public.workflow_steps (due_date);
create index if not exists idx_non_conformities_status on public.non_conformities (status);
create index if not exists idx_non_conformities_severity on public.non_conformities (severity);
create index if not exists idx_non_conformities_department_id on public.non_conformities (department_id);
create index if not exists idx_capa_actions_status on public.capa_actions (status);
create index if not exists idx_capa_actions_deadline on public.capa_actions (deadline);
create index if not exists idx_capa_actions_nc_id on public.capa_actions (non_conformity_id);
create index if not exists idx_audits_status on public.audits (status);
create index if not exists idx_audits_planned_date on public.audits (planned_date);
create index if not exists idx_audit_checklists_audit_id on public.audit_checklists (audit_id);
create index if not exists idx_audit_findings_audit_id on public.audit_findings (audit_id);
create index if not exists idx_risks_level on public.risks (risk_level);
create index if not exists idx_risks_review_date on public.risks (review_date);
create index if not exists idx_trainings_employee_id on public.trainings (employee_id);
create index if not exists idx_trainings_expiry_date on public.trainings (expiry_date);
create index if not exists idx_equipment_status on public.equipment (status);
create index if not exists idx_equipment_calibration_date on public.equipment (calibration_date);
create index if not exists idx_suppliers_status on public.suppliers (status);
create index if not exists idx_notifications_user_id on public.notifications (user_id);
create index if not exists idx_notifications_due_date on public.notifications (due_date);
create index if not exists idx_audit_trail_table_record on public.audit_trail (table_name, record_id);
create index if not exists idx_comments_table_record on public.comments (table_name, record_id);
create index if not exists idx_attachments_table_record on public.attachments (table_name, record_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.calculate_risk_fields()
returns trigger
language plpgsql
as $$
begin
  new.risk_score = coalesce(new.probability, 0) * coalesce(new.impact, 0);
  new.risk_level =
    case
      when new.risk_score >= 16 then 'Critical'
      when new.risk_score >= 10 then 'High'
      when new.risk_score >= 5 then 'Medium'
      else 'Low'
    end;
  return new;
end;
$$;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select r.slug
  from public.profiles p
  left join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
$$;

create or replace function public.has_role(allowed_roles text[])
returns boolean
language sql
stable
as $$
  select coalesce(public.current_role() = any(allowed_roles), false)
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  employee_role_id uuid;
begin
  select id into employee_role_id from public.roles where slug = 'employee' limit 1;

  insert into public.profiles (
    id,
    email,
    full_name,
    job_title,
    role_id,
    is_active,
    created_by
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'job_title',
    employee_role_id,
    true,
    new.id
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    job_title = coalesce(excluded.job_title, public.profiles.job_title);

  return new;
end;
$$;

create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email = new.email,
    full_name = coalesce(new.raw_user_meta_data ->> 'full_name', public.profiles.full_name),
    job_title = coalesce(new.raw_user_meta_data ->> 'job_title', public.profiles.job_title)
  where id = new.id;

  return new;
end;
$$;

create or replace function public.log_audit_trail()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'audit_trail' then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' then
    insert into public.audit_trail (table_name, record_id, action_type, user_id, before_data, after_data, created_by)
    values (tg_table_name, new.id, 'INSERT', auth.uid(), null, to_jsonb(new), auth.uid());
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_trail (table_name, record_id, action_type, user_id, before_data, after_data, created_by)
    values (tg_table_name, new.id, 'UPDATE', auth.uid(), to_jsonb(old), to_jsonb(new), auth.uid());
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.audit_trail (table_name, record_id, action_type, user_id, before_data, after_data, created_by)
    values (tg_table_name, old.id, 'DELETE', auth.uid(), to_jsonb(old), null, auth.uid());
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row
execute function public.sync_auth_user_profile();

drop trigger if exists trg_risks_calculate on public.risks;
create trigger trg_risks_calculate
before insert or update on public.risks
for each row
execute function public.calculate_risk_fields();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'roles',
    'departments',
    'document_categories',
    'profiles',
    'documents',
    'document_versions',
    'forms',
    'form_entries',
    'workflows',
    'workflow_steps',
    'non_conformities',
    'capa_actions',
    'audits',
    'audit_checklists',
    'audit_findings',
    'risks',
    'trainings',
    'equipment',
    'suppliers',
    'notifications',
    'comments',
    'attachments',
    'app_settings',
    'audit_trail'
  ]
  loop
    execute format('drop trigger if exists trg_%1$s_set_updated_at on public.%1$s', table_name);
    execute format('create trigger trg_%1$s_set_updated_at before update on public.%1$s for each row execute function public.set_updated_at()', table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'roles',
    'departments',
    'document_categories',
    'profiles',
    'documents',
    'document_versions',
    'forms',
    'form_entries',
    'workflows',
    'workflow_steps',
    'non_conformities',
    'capa_actions',
    'audits',
    'audit_checklists',
    'audit_findings',
    'risks',
    'trainings',
    'equipment',
    'suppliers',
    'notifications',
    'comments',
    'attachments',
    'app_settings'
  ]
  loop
    execute format('drop trigger if exists trg_%1$s_audit on public.%1$s', table_name);
    execute format('create trigger trg_%1$s_audit after insert or update or delete on public.%1$s for each row execute function public.log_audit_trail()', table_name);
  end loop;
end $$;

alter table public.roles enable row level security;
alter table public.departments enable row level security;
alter table public.document_categories enable row level security;
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.forms enable row level security;
alter table public.form_entries enable row level security;
alter table public.workflows enable row level security;
alter table public.workflow_steps enable row level security;
alter table public.non_conformities enable row level security;
alter table public.capa_actions enable row level security;
alter table public.audits enable row level security;
alter table public.audit_checklists enable row level security;
alter table public.audit_findings enable row level security;
alter table public.risks enable row level security;
alter table public.trainings enable row level security;
alter table public.equipment enable row level security;
alter table public.suppliers enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_trail enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;
alter table public.app_settings enable row level security;

create policy "roles_select_authenticated" on public.roles
for select to authenticated
using (true);

create policy "roles_manage_quality" on public.roles
for all to authenticated
using (public.has_role(array['admin', 'quality_manager']))
with check (public.has_role(array['admin', 'quality_manager']));

create policy "departments_select_authenticated" on public.departments
for select to authenticated
using (true);

create policy "departments_manage_quality" on public.departments
for all to authenticated
using (public.has_role(array['admin', 'quality_manager']))
with check (public.has_role(array['admin', 'quality_manager']));

create policy "document_categories_select_authenticated" on public.document_categories
for select to authenticated
using (true);

create policy "document_categories_manage_quality" on public.document_categories
for all to authenticated
using (public.has_role(array['admin', 'quality_manager']))
with check (public.has_role(array['admin', 'quality_manager']));

create policy "profiles_select_authenticated" on public.profiles
for select to authenticated
using (true);

create policy "profiles_update_self_or_quality" on public.profiles
for update to authenticated
using (auth.uid() = id or public.has_role(array['admin', 'quality_manager']))
with check (auth.uid() = id or public.has_role(array['admin', 'quality_manager']));

create policy "profiles_manage_admin" on public.profiles
for insert to authenticated
with check (public.has_role(array['admin', 'quality_manager']));

create policy "documents_select_role_based" on public.documents
for select to authenticated
using (
  public.has_role(array['admin', 'quality_manager', 'auditor', 'employee'])
  or (public.current_role() = 'supplier_viewer' and status = 'Approved')
);

create policy "documents_manage_quality" on public.documents
for all to authenticated
using (public.has_role(array['admin', 'quality_manager']))
with check (public.has_role(array['admin', 'quality_manager']));

create policy "document_versions_select_role_based" on public.document_versions
for select to authenticated
using (
  public.has_role(array['admin', 'quality_manager', 'auditor', 'employee'])
  or (
    public.current_role() = 'supplier_viewer'
    and exists (
      select 1
      from public.documents d
      where d.id = document_versions.document_id
        and d.status = 'Approved'
    )
  )
);

create policy "document_versions_manage_quality" on public.document_versions
for all to authenticated
using (public.has_role(array['admin', 'quality_manager']))
with check (public.has_role(array['admin', 'quality_manager']));

create policy "forms_select_internal" on public.forms
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "forms_manage_quality" on public.forms
for all to authenticated
using (public.has_role(array['admin', 'quality_manager']))
with check (public.has_role(array['admin', 'quality_manager']));

create policy "form_entries_select_internal" on public.form_entries
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "form_entries_manage_internal" on public.form_entries
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "workflows_select_internal" on public.workflows
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "workflows_manage_internal" on public.workflows
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'employee']));

create policy "workflow_steps_select_internal" on public.workflow_steps
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "workflow_steps_manage_internal" on public.workflow_steps
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'employee']));

create policy "non_conformities_select_internal" on public.non_conformities
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "non_conformities_manage_internal" on public.non_conformities
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "capa_actions_select_internal" on public.capa_actions
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "capa_actions_manage_quality" on public.capa_actions
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor']));

create policy "audits_select_internal" on public.audits
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "audits_manage_quality" on public.audits
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor']));

create policy "audit_checklists_select_internal" on public.audit_checklists
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "audit_checklists_manage_quality" on public.audit_checklists
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor']));

create policy "audit_findings_select_internal" on public.audit_findings
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "audit_findings_manage_quality" on public.audit_findings
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor']));

create policy "risks_select_internal" on public.risks
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "risks_manage_quality" on public.risks
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor']));

create policy "trainings_select_role_based" on public.trainings
for select to authenticated
using (
  public.has_role(array['admin', 'quality_manager'])
  or employee_id = auth.uid()
);

create policy "trainings_manage_quality" on public.trainings
for all to authenticated
using (public.has_role(array['admin', 'quality_manager']))
with check (public.has_role(array['admin', 'quality_manager']));

create policy "equipment_select_internal" on public.equipment
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "equipment_manage_quality" on public.equipment
for all to authenticated
using (public.has_role(array['admin', 'quality_manager']))
with check (public.has_role(array['admin', 'quality_manager']));

create policy "suppliers_select_role_based" on public.suppliers
for select to authenticated
using (
  public.has_role(array['admin', 'quality_manager', 'auditor', 'employee'])
  or public.current_role() = 'supplier_viewer'
);

create policy "suppliers_manage_quality" on public.suppliers
for all to authenticated
using (public.has_role(array['admin', 'quality_manager']))
with check (public.has_role(array['admin', 'quality_manager']));

create policy "notifications_select_recipient" on public.notifications
for select to authenticated
using (
  public.has_role(array['admin', 'quality_manager'])
  or user_id = auth.uid()
  or user_id is null
);

create policy "notifications_insert_internal" on public.notifications
for insert to authenticated
with check (
  public.has_role(array['admin', 'quality_manager', 'auditor', 'employee'])
  and (user_id = auth.uid() or user_id is null or public.has_role(array['admin', 'quality_manager']))
);

create policy "notifications_update_recipient" on public.notifications
for update to authenticated
using (
  public.has_role(array['admin', 'quality_manager'])
  or user_id = auth.uid()
)
with check (
  public.has_role(array['admin', 'quality_manager'])
  or user_id = auth.uid()
);

create policy "notifications_delete_quality" on public.notifications
for delete to authenticated
using (public.has_role(array['admin', 'quality_manager']));

create policy "audit_trail_select_quality" on public.audit_trail
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor']));

create policy "comments_select_authenticated" on public.comments
for select to authenticated
using (true);

create policy "comments_manage_internal" on public.comments
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "attachments_select_authenticated" on public.attachments
for select to authenticated
using (true);

create policy "attachments_manage_internal" on public.attachments
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "app_settings_select_internal" on public.app_settings
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "app_settings_manage_quality" on public.app_settings
for all to authenticated
using (public.has_role(array['admin', 'quality_manager']))
with check (public.has_role(array['admin', 'quality_manager']));

insert into storage.buckets (id, name, public)
values ('qms-files', 'qms-files', false)
on conflict (id) do nothing;

create policy "storage_read_qms_files" on storage.objects
for select to authenticated
using (bucket_id = 'qms-files');

create policy "storage_write_qms_files" on storage.objects
for all to authenticated
using (
  bucket_id = 'qms-files'
  and public.has_role(array['admin', 'quality_manager', 'auditor', 'employee'])
)
with check (
  bucket_id = 'qms-files'
  and public.has_role(array['admin', 'quality_manager', 'auditor', 'employee'])
);


-- ------------------------------------------------------------

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


-- ------------------------------------------------------------

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

create index if not exists idx_customer_complaint_actions_complaint
  on public.customer_complaint_actions (customer_complaint_id);

create index if not exists idx_customer_complaint_actions_pilot
  on public.customer_complaint_actions (pilot_id);

drop trigger if exists trg_customer_complaint_actions_set_updated_at on public.customer_complaint_actions;
create trigger trg_customer_complaint_actions_set_updated_at
before update on public.customer_complaint_actions
for each row
execute function public.set_updated_at();

drop trigger if exists trg_customer_complaint_actions_audit on public.customer_complaint_actions;
create trigger trg_customer_complaint_actions_audit
after insert or update or delete on public.customer_complaint_actions
for each row
execute function public.log_audit_trail();

alter table public.customer_complaint_actions enable row level security;

drop policy if exists "customer_complaint_actions_select_internal" on public.customer_complaint_actions;
create policy "customer_complaint_actions_select_internal" on public.customer_complaint_actions
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

drop policy if exists "customer_complaint_actions_manage_internal" on public.customer_complaint_actions;
create policy "customer_complaint_actions_manage_internal" on public.customer_complaint_actions
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));


-- ------------------------------------------------------------

insert into public.roles (id, name, slug, description)
values
  ('10000000-0000-0000-0000-000000000001', 'Admin', 'admin', 'Full system administrator access.'),
  ('10000000-0000-0000-0000-000000000002', 'Quality Manager', 'quality_manager', 'Oversees quality governance, documents, CAPA, and settings.'),
  ('10000000-0000-0000-0000-000000000003', 'Auditor', 'auditor', 'Runs audits, findings, and risk reviews.'),
  ('10000000-0000-0000-0000-000000000004', 'Employee', 'employee', 'General employee access for day-to-day quality participation.'),
  ('10000000-0000-0000-0000-000000000005', 'Supplier Viewer', 'supplier_viewer', 'Read-oriented supplier collaborator access.')
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description;

insert into public.departments (id, name, description)
values
  ('20000000-0000-0000-0000-000000000001', 'Quality', 'Quality systems, CAPA, and audit oversight.'),
  ('20000000-0000-0000-0000-000000000002', 'Operations', 'Production and day-to-day execution.'),
  ('20000000-0000-0000-0000-000000000003', 'Supply Chain', 'Suppliers, logistics, and incoming material flow.'),
  ('20000000-0000-0000-0000-000000000004', 'Maintenance', 'Equipment upkeep and calibration.')
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description;

insert into public.document_categories (id, name, description)
values
  ('30000000-0000-0000-0000-000000000001', 'Policies', 'Governance and management-level controlled documents.'),
  ('30000000-0000-0000-0000-000000000002', 'SOPs', 'Operational standard operating procedures.'),
  ('30000000-0000-0000-0000-000000000003', 'Forms', 'Templates, checklists, and controlled forms.')
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '40000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@qualios.ma',
    crypt('QmsDemo123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Amina Laurent","job_title":"Head of Quality"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '40000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'manager@qmspro.demo',
    crypt('QmsDemo123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Marco Rivet","job_title":"Quality Manager"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '40000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'auditor@qmspro.demo',
    crypt('QmsDemo123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Elena Ortiz","job_title":"Lead Auditor"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '40000000-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'employee@qmspro.demo',
    crypt('QmsDemo123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Samir Benali","job_title":"Production Supervisor"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '40000000-0000-0000-0000-000000000005',
    'authenticated',
    'authenticated',
    'supplier@qmspro.demo',
    crypt('QmsDemo123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Noah Fischer","job_title":"Supplier Contact"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  )
on conflict (id) do update
set
  aud = excluded.aud,
  role = excluded.role,
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = timezone('utc', now());

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  ('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '{"sub":"40000000-0000-0000-0000-000000000001","email":"admin@qualios.ma"}', 'email', 'admin@qualios.ma', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('41000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '{"sub":"40000000-0000-0000-0000-000000000002","email":"manager@qmspro.demo"}', 'email', 'manager@qmspro.demo', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('41000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', '{"sub":"40000000-0000-0000-0000-000000000003","email":"auditor@qmspro.demo"}', 'email', 'auditor@qmspro.demo', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('41000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', '{"sub":"40000000-0000-0000-0000-000000000004","email":"employee@qmspro.demo"}', 'email', 'employee@qmspro.demo', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('41000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', '{"sub":"40000000-0000-0000-0000-000000000005","email":"supplier@qmspro.demo"}', 'email', 'supplier@qmspro.demo', timezone('utc', now()), timezone('utc', now()), timezone('utc', now()))
on conflict (id) do update
set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  provider = excluded.provider,
  provider_id = excluded.provider_id,
  updated_at = timezone('utc', now());

update public.profiles
set
  role_id = '10000000-0000-0000-0000-000000000001',
  department_id = '20000000-0000-0000-0000-000000000001',
  phone = '+33 6 20 11 22 33',
  created_by = '40000000-0000-0000-0000-000000000001'
where id = '40000000-0000-0000-0000-000000000001';

update public.profiles
set
  role_id = '10000000-0000-0000-0000-000000000002',
  department_id = '20000000-0000-0000-0000-000000000001',
  phone = '+33 6 20 11 22 44',
  created_by = '40000000-0000-0000-0000-000000000001'
where id = '40000000-0000-0000-0000-000000000002';

update public.profiles
set
  role_id = '10000000-0000-0000-0000-000000000003',
  department_id = '20000000-0000-0000-0000-000000000001',
  phone = '+33 6 20 11 22 55',
  created_by = '40000000-0000-0000-0000-000000000001'
where id = '40000000-0000-0000-0000-000000000003';

update public.profiles
set
  role_id = '10000000-0000-0000-0000-000000000004',
  department_id = '20000000-0000-0000-0000-000000000002',
  phone = '+33 6 20 11 22 66',
  created_by = '40000000-0000-0000-0000-000000000001'
where id = '40000000-0000-0000-0000-000000000004';

update public.profiles
set
  role_id = '10000000-0000-0000-0000-000000000005',
  department_id = '20000000-0000-0000-0000-000000000003',
  phone = '+49 170 123 4567',
  supplier_company = 'Nordic Components GmbH',
  created_by = '40000000-0000-0000-0000-000000000001'
where id = '40000000-0000-0000-0000-000000000005';

insert into public.documents (
  id,
  document_code,
  title,
  summary,
  category_id,
  owner_id,
  department_id,
  status,
  version_current,
  effective_date,
  review_date,
  file_path,
  created_by
)
values
  ('50000000-0000-0000-0000-000000000001', 'POL-001', 'Quality Policy', 'Top-level quality policy and commitments.', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Approved', '2.0', current_date - 90, current_date + 270, 'documents/policies/quality-policy-v2.pdf', '40000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', 'SOP-014', 'Line Clearance Procedure', 'Operator checks before each batch start.', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'Under Review', '1.3', current_date - 30, current_date + 60, 'documents/sops/line-clearance-v1-3.pdf', '40000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000003', 'FRM-022', 'Supplier Evaluation Form', 'Controlled scoring sheet for supplier onboarding and annual review.', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'Approved', '1.0', current_date - 120, current_date + 180, 'documents/forms/supplier-evaluation-form.pdf', '40000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into public.document_versions (
  id,
  document_id,
  version_number,
  status,
  change_summary,
  approval_date,
  file_path,
  created_by
)
values
  ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '2.0', 'Approved', 'Aligned terminology to the new management review cycle.', current_date - 90, 'documents/versions/pol-001-v2.pdf', '40000000-0000-0000-0000-000000000001'),
  ('51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '1.3', 'Under Review', 'Added second sign-off for startup checks.', current_date - 2, 'documents/versions/sop-014-v1-3.pdf', '40000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.forms (
  id,
  code,
  name,
  description,
  process_area,
  owner_id,
  department_id,
  status,
  fields_schema,
  target_indicator,
  created_by
)
values
  (
    '67000000-0000-0000-0000-000000000001',
    'FRM-NC-001',
    'Non-conformity intake',
    'Standard form to capture, qualify, and route quality events.',
    'Quality',
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'Active',
    'Date; department; source; severity; description; immediate containment; root cause; linked CAPA',
    'Open NC count and closure delay',
    '40000000-0000-0000-0000-000000000001'
  ),
  (
    '67000000-0000-0000-0000-000000000002',
    'FRM-AUD-002',
    'Audit finding sheet',
    'Reusable finding sheet with owner, severity, evidence, and follow-up due date.',
    'Audit',
    '40000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    'Active',
    'Audit scope; requirement; finding; evidence; severity; owner; due date; verification',
    'Findings by severity',
    '40000000-0000-0000-0000-000000000002'
  ),
  (
    '67000000-0000-0000-0000-000000000003',
    'FRM-SUP-003',
    'Supplier evaluation',
    'Scoring form for supplier onboarding and annual re-evaluation.',
    'Supply Chain',
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003',
    'Draft',
    'Supplier; category; score; certification; audit history; required actions',
    'Average supplier score',
    '40000000-0000-0000-0000-000000000002'
  )
on conflict (id) do nothing;

insert into public.form_entries (
  id,
  form_id,
  record_code,
  title,
  submitted_by,
  workflow_state,
  due_date,
  content,
  created_by
)
values
  (
    '67100000-0000-0000-0000-000000000001',
    '67000000-0000-0000-0000-000000000001',
    'NC-2026-001',
    'Unsigned shift handover entry',
    '40000000-0000-0000-0000-000000000004',
    'In Review',
    current_date + 10,
    'Temperature log entry missing second signature. Containment: shift lead notified.',
    '40000000-0000-0000-0000-000000000004'
  ),
  (
    '67100000-0000-0000-0000-000000000002',
    '67000000-0000-0000-0000-000000000002',
    'AUD-F-2026-003',
    'Outdated visual aid at line 3',
    '40000000-0000-0000-0000-000000000003',
    'Submitted',
    current_date + 14,
    'Finding raised during packaging audit. Evidence uploaded in audit attachments.',
    '40000000-0000-0000-0000-000000000003'
  )
on conflict (id) do nothing;

insert into public.workflows (
  id,
  title,
  description,
  status,
  due_date,
  responsible_user_id,
  approval_required,
  created_by
)
values
  ('52000000-0000-0000-0000-000000000001', 'Document approval route', 'Standard approval path for new controlled documents.', 'In Progress', current_date + 7, '40000000-0000-0000-0000-000000000002', true, '40000000-0000-0000-0000-000000000001'),
  ('52000000-0000-0000-0000-000000000002', 'Supplier onboarding review', 'Evaluate quality agreement, score, and qualification evidence.', 'Awaiting Approval', current_date + 5, '40000000-0000-0000-0000-000000000003', true, '40000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.workflow_steps (
  id,
  workflow_id,
  step_name,
  description,
  responsible_user_id,
  due_date,
  status,
  approval_state,
  created_by
)
values
  ('53000000-0000-0000-0000-000000000001', '52000000-0000-0000-0000-000000000001', 'Quality review', 'Ensure structure and metadata are complete.', '40000000-0000-0000-0000-000000000002', current_date + 2, 'In Progress', 'Pending', '40000000-0000-0000-0000-000000000001'),
  ('53000000-0000-0000-0000-000000000002', '52000000-0000-0000-0000-000000000001', 'Final approval', 'Approve for controlled release.', '40000000-0000-0000-0000-000000000001', current_date + 5, 'Draft', 'Pending', '40000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into public.non_conformities (
  id,
  title,
  description,
  severity,
  source,
  department_id,
  status,
  responsible_user_id,
  root_cause,
  due_date,
  created_by
)
values
  ('54000000-0000-0000-0000-000000000001', 'Line log not completed', 'Batch temperature log had an unsigned shift handover entry.', 'Medium', 'Internal audit', '20000000-0000-0000-0000-000000000002', 'In Progress', '40000000-0000-0000-0000-000000000004', 'No second-level verification in the end-of-shift routine.', current_date + 10, '40000000-0000-0000-0000-000000000003'),
  ('54000000-0000-0000-0000-000000000002', 'Supplier CoA delay', 'Certificate of analysis was received after material release.', 'High', 'Incoming inspection', '20000000-0000-0000-0000-000000000003', 'Open', '40000000-0000-0000-0000-000000000002', 'Escalation trigger missing from the supplier handoff workflow.', current_date + 14, '40000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.capa_actions (
  id,
  title,
  action_type,
  non_conformity_id,
  description,
  responsible_user_id,
  deadline,
  priority,
  status,
  effectiveness_check,
  created_by
)
values
  ('55000000-0000-0000-0000-000000000001', 'Add second sign-off to shift log', 'Corrective', '54000000-0000-0000-0000-000000000001', 'Update controlled log template and train the team.', '40000000-0000-0000-0000-000000000004', current_date + 7, 'High', 'In Progress', 'Check 3 batches for complete signatures.', '40000000-0000-0000-0000-000000000002'),
  ('55000000-0000-0000-0000-000000000002', 'Supplier CoA escalation rule', 'Preventive', '54000000-0000-0000-0000-000000000002', 'Create alert when a CoA is missing after goods receipt.', '40000000-0000-0000-0000-000000000002', current_date + 12, 'High', 'Open', 'Validate next 5 deliveries.', '40000000-0000-0000-0000-000000000002'),
  ('55000000-0000-0000-0000-000000000003', 'Review open training deviations', 'Preventive', null, 'Cross-check expired training against critical roles.', '40000000-0000-0000-0000-000000000002', current_date + 20, 'Medium', 'Verification', 'No expired training on critical roles after review.', '40000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into public.audits (
  id,
  title,
  audit_type,
  scope,
  auditor_id,
  planned_date,
  follow_up_date,
  status,
  report_path,
  created_by
)
values
  ('56000000-0000-0000-0000-000000000001', 'Internal packaging audit', 'Internal', 'Packaging line controls and label reconciliation.', '40000000-0000-0000-0000-000000000003', current_date + 9, current_date + 30, 'Planned', 'audits/reports/internal-packaging-audit.pdf', '40000000-0000-0000-0000-000000000002'),
  ('56000000-0000-0000-0000-000000000002', 'Supplier quality system review', 'External', 'Quality agreement, deviations, and release performance.', '40000000-0000-0000-0000-000000000003', current_date + 15, current_date + 40, 'Planned', 'audits/reports/supplier-system-review.pdf', '40000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.audit_checklists (
  id,
  audit_id,
  item_text,
  is_required,
  response_status,
  notes,
  created_by
)
values
  ('57000000-0000-0000-0000-000000000001', '56000000-0000-0000-0000-000000000001', 'Verify line clearance before first batch start.', true, 'Pending', null, '40000000-0000-0000-0000-000000000003'),
  ('57000000-0000-0000-0000-000000000002', '56000000-0000-0000-0000-000000000001', 'Confirm label reconciliation is documented.', true, 'Pending', null, '40000000-0000-0000-0000-000000000003'),
  ('57000000-0000-0000-0000-000000000003', '56000000-0000-0000-0000-000000000002', 'Check supplier deviation closure SLA.', true, 'Pending', null, '40000000-0000-0000-0000-000000000003')
on conflict (id) do nothing;

insert into public.audit_findings (
  id,
  audit_id,
  title,
  description,
  severity,
  owner_id,
  status,
  created_by
)
values
  ('58000000-0000-0000-0000-000000000001', '56000000-0000-0000-0000-000000000001', 'Outdated visual aid posted at line 3', 'Instruction board still references retired form revision.', 'Minor', '40000000-0000-0000-0000-000000000004', 'Action Planned', '40000000-0000-0000-0000-000000000003'),
  ('58000000-0000-0000-0000-000000000002', '56000000-0000-0000-0000-000000000002', 'No escalation path for delayed CoA', 'Supplier team lacks a documented escalation trigger after receipt.', 'Major', '40000000-0000-0000-0000-000000000002', 'Open', '40000000-0000-0000-0000-000000000003')
on conflict (id) do nothing;

insert into public.risks (
  id,
  title,
  description,
  probability,
  impact,
  mitigation_plan,
  owner_id,
  review_date,
  created_by
)
values
  ('59000000-0000-0000-0000-000000000001', 'Label mix-up during line changeover', 'High throughput increases chance of component mix-up if line clearance slips.', 3, 5, 'Double-check label kit issuance and line clearance sign-off.', '40000000-0000-0000-0000-000000000004', current_date + 21, '40000000-0000-0000-0000-000000000002'),
  ('59000000-0000-0000-0000-000000000002', 'Delayed supplier release evidence', 'Critical materials may arrive before complete documentation.', 4, 4, 'Escalation alert and monthly supplier review.', '40000000-0000-0000-0000-000000000002', current_date + 14, '40000000-0000-0000-0000-000000000002'),
  ('59000000-0000-0000-0000-000000000003', 'Training lapse for temporary operators', 'Peak season staffing may create gaps in mandatory refreshers.', 2, 3, 'Role-based training matrix reviewed weekly.', '40000000-0000-0000-0000-000000000002', current_date + 28, '40000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into public.trainings (
  id,
  title,
  employee_id,
  role_required,
  status,
  expiry_date,
  certificate_path,
  notes,
  created_by
)
values
  ('60000000-0000-0000-0000-000000000001', 'Annual GMP refresher', '40000000-0000-0000-0000-000000000004', 'Employee', 'Completed', current_date + 300, 'trainings/certificates/gmp-refresher.pdf', 'Completed on schedule.', '40000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000002', 'Lead auditor refresher', '40000000-0000-0000-0000-000000000003', 'Auditor', 'Completed', current_date + 250, 'trainings/certificates/auditor-refresher.pdf', 'Required for external audit lead role.', '40000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000003', 'Deviation handling onboarding', '40000000-0000-0000-0000-000000000004', 'Supervisor', 'In Progress', current_date + 45, null, 'Practical assessment still open.', '40000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.equipment (
  id,
  name,
  serial_number,
  location,
  maintenance_date,
  calibration_date,
  status,
  notes,
  created_by
)
values
  ('61000000-0000-0000-0000-000000000001', 'Metal detector MD-03', 'MD03-2022-771', 'Packaging line 3', current_date - 30, current_date + 60, 'Active', 'Quarterly check completed and signed.', '40000000-0000-0000-0000-000000000001'),
  ('61000000-0000-0000-0000-000000000002', 'Scale BL-12', 'BL12-2019-145', 'Warehouse weighing bay', current_date - 10, current_date + 5, 'Calibration Due', 'Calibration booking pending for next week.', '40000000-0000-0000-0000-000000000001'),
  ('61000000-0000-0000-0000-000000000003', 'Air handling unit AHU-7', 'AHU7-2018-219', 'Clean room corridor', current_date - 15, current_date + 120, 'Maintenance', 'Filter replacement in progress.', '40000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into public.suppliers (
  id,
  name,
  contact_name,
  email,
  phone,
  evaluation_score,
  status,
  audit_history,
  notes,
  created_by
)
values
  ('62000000-0000-0000-0000-000000000001', 'Nordic Components GmbH', 'Noah Fischer', 'supplier@qmspro.demo', '+49 170 123 4567', 89, 'Approved', 'Remote quality review completed last quarter.', 'Strong delivery performance, minor documentation delays.', '40000000-0000-0000-0000-000000000002'),
  ('62000000-0000-0000-0000-000000000002', 'Blue Harbor Packaging', 'Lina Costa', 'quality@blueharbor.example', '+351 910 222 111', 76, 'Under Review', 'On-site audit scheduled this month.', 'Awaiting updated quality agreement.', '40000000-0000-0000-0000-000000000002'),
  ('62000000-0000-0000-0000-000000000003', 'Apex Analytical Labs', 'Diego Melo', 'lab@apexlabs.example', '+34 600 888 222', 92, 'Approved', 'External lab qualification renewed.', 'Consistent turnaround and complete reports.', '40000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.customer_complaints (
  id,
  reference,
  customer_name,
  contact_email,
  product_reference,
  description,
  severity,
  status,
  received_date,
  due_date,
  responsible_user_id,
  response_summary,
  created_by
)
values
  (
    '68000000-0000-0000-0000-000000000001',
    'RC-2026-001',
    'Atlas Distribution',
    'qualite@atlas.example',
    'LOT-PKG-0426',
    'Client reports damaged secondary packaging on delivery with photos attached.',
    'High',
    'In Progress',
    current_date - 3,
    current_date + 7,
    '40000000-0000-0000-0000-000000000002',
    'Containment opened. Logistics and packaging teams checking transport evidence.',
    '40000000-0000-0000-0000-000000000002'
  ),
  (
    '68000000-0000-0000-0000-000000000002',
    'RC-2026-002',
    'Medina Retail',
    'support@medina.example',
    'SKU-QA-118',
    'Label readability complaint on one carton batch.',
    'Medium',
    'Open',
    current_date - 1,
    current_date + 10,
    '40000000-0000-0000-0000-000000000004',
    null,
    '40000000-0000-0000-0000-000000000002'
  )
on conflict (id) do nothing;

update public.customer_complaints
set
  affiliation = 'RCC-000018',
  agent_id = '40000000-0000-0000-0000-000000000002',
  declarant_name = 'Mounir Mestouria',
  client_sector = 'Distribution',
  client_typology = 'Client direct',
  contact_name = 'Responsable reception',
  phone = '+212 522 100 200',
  country_city = 'Maroc / Casablanca',
  distributor_channel = 'Canal distributeur',
  complaint_type = 'Produit',
  object_summary = 'Emballage endommage a la reception',
  complaint_category = 'Qualite produit',
  origin = 'Reception client',
  brand = 'Gamme premium',
  product_name = 'Conditionnement secondaire',
  lot_number = 'LOT-PKG-0426',
  production_date = current_date - 20,
  expiry_date = current_date + 365,
  purchase_delivery_date = current_date - 4,
  quantity = 120,
  immediate_actions = 'Lot identifie, photos demandees, controle transport ouvert.',
  orientation_recipient = 'QSE LE ORIENTATION',
  information_recipients = 'Production, logistique',
  orientation_decision = 'Traiter',
  problem_origin = 'Protection palette insuffisante pendant le transport.',
  verification_recipient = 'Responsable QSE',
  closure_recipients = 'Client, commerce, logistique',
  actions_effective = 'A mesurer',
  effectiveness_criteria = 'Absence de recidive sur les trois prochaines livraisons.',
  estimated_cost_total = 850,
  measurement_reason = 'Verification sur prochaines expeditions.',
  measurement_deadline = current_date + 30,
  response_summary = 'Analyse en cours avec plan d actions logistique.'
where id = '68000000-0000-0000-0000-000000000001';

update public.customer_complaints
set
  affiliation = 'RCC-000019',
  agent_id = '40000000-0000-0000-0000-000000000004',
  declarant_name = 'Samir Benali',
  client_sector = 'Retail',
  client_typology = 'Distributeur',
  contact_name = 'Service client',
  phone = '+212 522 300 400',
  country_city = 'Maroc / Rabat',
  complaint_type = 'Produit',
  object_summary = 'Lisibilite etiquette',
  complaint_category = 'Etiquetage',
  origin = 'Client',
  brand = 'SKU-QA',
  product_name = 'SKU-QA-118',
  lot_number = 'LOT-LBL-118',
  purchase_delivery_date = current_date - 2,
  quantity = 24,
  immediate_actions = 'Controle echantillon conserve.',
  orientation_recipient = 'Qualite produit',
  orientation_decision = 'Traiter'
where id = '68000000-0000-0000-0000-000000000002';

insert into public.customer_complaint_actions (
  id,
  customer_complaint_id,
  pilot_id,
  action,
  deadline,
  completion_date,
  comment,
  progress_status,
  estimated_cost,
  created_by
)
values
  (
    '68400000-0000-0000-0000-000000000001',
    '68000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000004',
    'Verifier les conditions de palettisation et renforcer le filmage.',
    current_date + 4,
    null,
    'Controle terrain planifie avec logistique.',
    'In Progress',
    500,
    '40000000-0000-0000-0000-000000000002'
  ),
  (
    '68400000-0000-0000-0000-000000000002',
    '68000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000002',
    'Repondre au client avec synthese analyse et delai de mesure.',
    current_date + 7,
    null,
    'Message prepare apres validation QSE.',
    'Open',
    350,
    '40000000-0000-0000-0000-000000000002'
  )
on conflict (id) do nothing;

insert into public.supplier_complaints (
  id,
  reference,
  supplier_id,
  supplier_name,
  issue_type,
  description,
  severity,
  status,
  received_date,
  due_date,
  responsible_user_id,
  response_summary,
  created_by
)
values
  (
    '68100000-0000-0000-0000-000000000001',
    'RF-2026-001',
    '62000000-0000-0000-0000-000000000001',
    'Nordic Components GmbH',
    'Certificate delay',
    'Certificate of analysis arrived after internal release deadline.',
    'High',
    'In Progress',
    current_date - 4,
    current_date + 6,
    '40000000-0000-0000-0000-000000000002',
    'Supplier asked to confirm corrective timing and prevention rule.',
    '40000000-0000-0000-0000-000000000002'
  ),
  (
    '68100000-0000-0000-0000-000000000002',
    'RF-2026-002',
    '62000000-0000-0000-0000-000000000002',
    'Blue Harbor Packaging',
    'Incoming damage',
    'Two pallets received with moisture marks on outer packaging.',
    'Medium',
    'Open',
    current_date - 2,
    current_date + 9,
    '40000000-0000-0000-0000-000000000003',
    null,
    '40000000-0000-0000-0000-000000000002'
  )
on conflict (id) do nothing;

insert into public.constats (
  id,
  reference,
  title,
  description,
  process_area,
  department_id,
  severity,
  status,
  detected_date,
  responsible_user_id,
  action_summary,
  created_by
)
values
  (
    '68200000-0000-0000-0000-000000000001',
    'CST-2026-001',
    'Outdated visual standard',
    'A production board still references an old form revision.',
    'Operations industrielles',
    '20000000-0000-0000-0000-000000000002',
    'Medium',
    'Action Required',
    current_date - 1,
    '40000000-0000-0000-0000-000000000004',
    'Replace board content and confirm document diffusion.',
    '40000000-0000-0000-0000-000000000003'
  ),
  (
    '68200000-0000-0000-0000-000000000002',
    'CST-2026-002',
    'Incomplete supplier handoff',
    'Handoff checklist does not clearly mention certificate escalation owner.',
    'Supply chain',
    '20000000-0000-0000-0000-000000000003',
    'High',
    'Open',
    current_date,
    '40000000-0000-0000-0000-000000000002',
    null,
    '40000000-0000-0000-0000-000000000003'
  )
on conflict (id) do nothing;

insert into public.complaints (
  id,
  reference,
  complainant_name,
  channel,
  description,
  severity,
  status,
  received_date,
  due_date,
  responsible_user_id,
  response_summary,
  created_by
)
values
  (
    '68300000-0000-0000-0000-000000000001',
    'PL-2026-001',
    'Production team',
    'Interne',
    'Repeated delay in receiving updated controlled form after revision approval.',
    'Medium',
    'In Progress',
    current_date - 5,
    current_date + 4,
    '40000000-0000-0000-0000-000000000002',
    'Document controller reviewing diffusion workflow.',
    '40000000-0000-0000-0000-000000000004'
  )
on conflict (id) do nothing;

insert into public.notifications (
  id,
  title,
  message,
  status,
  due_date,
  category,
  user_id,
  action_url,
  created_by
)
values
  ('63000000-0000-0000-0000-000000000001', 'Document review due soon', 'SOP-014 reaches review due date in 60 days.', 'Unread', current_date + 60, 'Document Review', '40000000-0000-0000-0000-000000000002', '/documents/50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001'),
  ('63000000-0000-0000-0000-000000000002', 'CAPA deadline approaching', 'Add second sign-off to shift log is due in 7 days.', 'Unread', current_date + 7, 'CAPA', '40000000-0000-0000-0000-000000000004', '/capa-actions/55000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002'),
  ('63000000-0000-0000-0000-000000000003', 'Audit scheduled', 'Internal packaging audit is planned for next week.', 'Read', current_date + 9, 'Audit', '40000000-0000-0000-0000-000000000003', '/audits/56000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002'),
  ('63000000-0000-0000-0000-000000000004', 'Supplier review pending', 'Please upload the renewed quality agreement.', 'Unread', current_date + 5, 'Supplier', '40000000-0000-0000-0000-000000000005', '/suppliers/62000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.comments (
  id,
  table_name,
  record_id,
  body,
  created_by
)
values
  ('64000000-0000-0000-0000-000000000001', 'non_conformities', '54000000-0000-0000-0000-000000000001', 'Training impact reviewed. Shift leads understand the temporary workaround.', '40000000-0000-0000-0000-000000000002'),
  ('64000000-0000-0000-0000-000000000002', 'audits', '56000000-0000-0000-0000-000000000001', 'Checklist draft reviewed with packaging supervision.', '40000000-0000-0000-0000-000000000003'),
  ('64000000-0000-0000-0000-000000000003', 'suppliers', '62000000-0000-0000-0000-000000000001', 'Supplier requested updated quality agreement wording.', '40000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.attachments (
  id,
  table_name,
  record_id,
  file_name,
  file_path,
  file_size,
  mime_type,
  note,
  created_by
)
values
  ('65000000-0000-0000-0000-000000000001', 'documents', '50000000-0000-0000-0000-000000000001', 'quality-policy-v2.pdf', 'documents/policies/quality-policy-v2.pdf', 248320, 'application/pdf', 'Current approved issue.', '40000000-0000-0000-0000-000000000001'),
  ('65000000-0000-0000-0000-000000000002', 'audits', '56000000-0000-0000-0000-000000000001', 'packaging-audit-plan.pdf', 'audits/plans/packaging-audit-plan.pdf', 186400, 'application/pdf', 'Audit plan and scope.', '40000000-0000-0000-0000-000000000003'),
  ('65000000-0000-0000-0000-000000000003', 'suppliers', '62000000-0000-0000-0000-000000000001', 'quality-agreement.pdf', 'suppliers/contracts/nordic-quality-agreement.pdf', 312800, 'application/pdf', 'Latest signed agreement.', '40000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.app_settings (id, setting_key, setting_value, created_by)
values
  ('66000000-0000-0000-0000-000000000001', 'branding', '{"appName":"QMS Pro","theme":"coastal-blue"}', '40000000-0000-0000-0000-000000000001'),
  ('66000000-0000-0000-0000-000000000002', 'dashboard', '{"showRecentActivity":true,"showNotifications":true}', '40000000-0000-0000-0000-000000000001')
on conflict (id) do update
set
  setting_key = excluded.setting_key,
  setting_value = excluded.setting_value;

