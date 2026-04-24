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
