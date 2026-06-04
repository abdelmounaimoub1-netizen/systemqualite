-- GED document extensions: extra columns on documents + child tables for approvals, distributions, etc.

alter table public.documents
  add column if not exists document_type text not null default 'Procedure',
  add column if not exists process_family text,
  add column if not exists process_group text,
  add column if not exists process_activity text,
  add column if not exists confidentiality_level text not null default 'Interne',
  add column if not exists review_frequency_months integer not null default 12,
  add column if not exists validation_level integer not null default 2,
  add column if not exists approval_mode text not null default 'Sequential',
  add column if not exists diffusion_scope text not null default 'Portail Qualite',
  add column if not exists read_ack_required boolean not null default true,
  add column if not exists archive_rule text not null default 'Archivage automatique si nouvelle version',
  add column if not exists retention_period_months integer not null default 60;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'documents_document_type_check') then
    alter table public.documents
      add constraint documents_document_type_check
      check (document_type in ('Procedure', 'Processus', 'Politique', 'Formulaire', 'Instruction', 'Enregistrement', 'Externe'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'documents_process_family_check') then
    alter table public.documents
      add constraint documents_process_family_check
      check (process_family is null or process_family in ('Pilotage', 'Realisation', 'Support'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'documents_confidentiality_level_check') then
    alter table public.documents
      add constraint documents_confidentiality_level_check
      check (confidentiality_level in ('Public portail', 'Interne', 'Confidentiel', 'Fournisseur'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'documents_validation_level_check') then
    alter table public.documents
      add constraint documents_validation_level_check
      check (validation_level between 1 and 5);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'documents_approval_mode_check') then
    alter table public.documents
      add constraint documents_approval_mode_check
      check (approval_mode in ('Sequential', 'Parallel'));
  end if;
end $$;

create table if not exists public.document_approvals (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  step_order integer not null default 1,
  approver_id uuid references public.profiles (id) on delete set null,
  role_label text,
  decision text not null default 'Pending' check (decision in ('Pending', 'Approved', 'Rejected', 'Skipped')),
  due_date date,
  signed_at timestamptz,
  comment text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.document_distributions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  recipient_id uuid references public.profiles (id) on delete set null,
  recipient_group text,
  channel text not null default 'Portail' check (channel in ('Portail', 'Email', 'Extranet')),
  requires_ack boolean not null default true,
  status text not null default 'To Acknowledge' check (status in ('To Acknowledge', 'Acknowledged', 'Overdue', 'Cancelled')),
  due_date date,
  acknowledged_at timestamptz,
  comment text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.document_review_cycles (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  reviewer_id uuid references public.profiles (id) on delete set null,
  planned_review_date date,
  status text not null default 'Planned' check (status in ('Planned', 'In Review', 'Completed', 'Late')),
  conclusion text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.document_suggestions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  suggested_by uuid references public.profiles (id) on delete set null,
  suggestion text not null,
  status text not null default 'Open' check (status in ('Open', 'Accepted', 'Rejected', 'Converted')),
  response text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create table if not exists public.document_consultations (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  consulted_at timestamptz not null default timezone('utc', now()),
  source text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists idx_documents_process_family on public.documents (process_family);
create index if not exists idx_document_approvals_document_id on public.document_approvals (document_id);
create index if not exists idx_document_approvals_approver_id on public.document_approvals (approver_id);
create index if not exists idx_document_approvals_due_date on public.document_approvals (due_date);
create index if not exists idx_document_distributions_document_id on public.document_distributions (document_id);
create index if not exists idx_document_distributions_recipient_id on public.document_distributions (recipient_id);
create index if not exists idx_document_distributions_due_date on public.document_distributions (due_date);
create index if not exists idx_document_review_cycles_document_id on public.document_review_cycles (document_id);
create index if not exists idx_document_review_cycles_planned_date on public.document_review_cycles (planned_review_date);
create index if not exists idx_document_suggestions_document_id on public.document_suggestions (document_id);
create index if not exists idx_document_suggestions_status on public.document_suggestions (status);
create index if not exists idx_document_consultations_document_id on public.document_consultations (document_id);
create index if not exists idx_document_consultations_user_id on public.document_consultations (user_id);
create index if not exists idx_document_consultations_consulted_at on public.document_consultations (consulted_at);

alter table public.document_approvals enable row level security;
alter table public.document_distributions enable row level security;
alter table public.document_review_cycles enable row level security;
alter table public.document_suggestions enable row level security;
alter table public.document_consultations enable row level security;

drop policy if exists "document_approvals_select_role_based" on public.document_approvals;
drop policy if exists "document_approvals_manage_quality" on public.document_approvals;
drop policy if exists "document_distributions_select_role_based" on public.document_distributions;
drop policy if exists "document_distributions_manage_quality" on public.document_distributions;
drop policy if exists "document_review_cycles_select_internal" on public.document_review_cycles;
drop policy if exists "document_review_cycles_manage_quality" on public.document_review_cycles;
drop policy if exists "document_suggestions_select_internal" on public.document_suggestions;
drop policy if exists "document_suggestions_manage_internal" on public.document_suggestions;
drop policy if exists "document_consultations_select_quality" on public.document_consultations;
drop policy if exists "document_consultations_manage_quality" on public.document_consultations;

create policy "document_approvals_select_role_based" on public.document_approvals
for select to authenticated
using (
  public.has_role(array['admin', 'quality_manager', 'auditor', 'employee'])
  or (
    public.current_role() = 'supplier_viewer'
    and exists (
      select 1
      from public.documents d
      where d.id = document_approvals.document_id
        and d.status = 'Approved'
    )
  )
);

create policy "document_approvals_manage_quality" on public.document_approvals
for all to authenticated
using (public.has_role(array['admin', 'quality_manager']))
with check (public.has_role(array['admin', 'quality_manager']));

create policy "document_distributions_select_role_based" on public.document_distributions
for select to authenticated
using (
  public.has_role(array['admin', 'quality_manager', 'auditor', 'employee'])
  or recipient_id = auth.uid()
  or (
    public.current_role() = 'supplier_viewer'
    and exists (
      select 1
      from public.documents d
      where d.id = document_distributions.document_id
        and d.status = 'Approved'
    )
  )
);

create policy "document_distributions_manage_quality" on public.document_distributions
for all to authenticated
using (public.has_role(array['admin', 'quality_manager']))
with check (public.has_role(array['admin', 'quality_manager']));

create policy "document_review_cycles_select_internal" on public.document_review_cycles
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "document_review_cycles_manage_quality" on public.document_review_cycles
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor']));

create policy "document_suggestions_select_internal" on public.document_suggestions
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "document_suggestions_manage_internal" on public.document_suggestions
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor', 'employee']));

create policy "document_consultations_select_quality" on public.document_consultations
for select to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor']));

create policy "document_consultations_manage_quality" on public.document_consultations
for all to authenticated
using (public.has_role(array['admin', 'quality_manager', 'auditor']))
with check (public.has_role(array['admin', 'quality_manager', 'auditor']));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'document_approvals',
    'document_distributions',
    'document_review_cycles',
    'document_suggestions',
    'document_consultations'
  ]
  loop
    execute format('drop trigger if exists trg_%1$s_set_updated_at on public.%1$s', table_name);
    execute format(
      'create trigger trg_%1$s_set_updated_at before update on public.%1$s for each row execute function public.set_updated_at()',
      table_name
    );
    execute format('drop trigger if exists trg_%1$s_audit on public.%1$s', table_name);
    execute format(
      'create trigger trg_%1$s_audit after insert or update or delete on public.%1$s for each row execute function public.log_audit_trail()',
      table_name
    );
  end loop;
end $$;
