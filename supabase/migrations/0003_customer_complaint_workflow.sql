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
