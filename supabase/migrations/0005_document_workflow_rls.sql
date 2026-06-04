-- Workflow: recipient self-ack on distributions; supplier document scope

drop policy if exists "document_distributions_ack_recipient" on public.document_distributions;

create policy "document_distributions_ack_recipient" on public.document_distributions
for update to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

drop policy if exists "documents_select_role_based" on public.documents;

create policy "documents_select_role_based" on public.documents
for select to authenticated
using (
  public.has_role(array['admin', 'quality_manager', 'auditor', 'employee'])
  or (
    public.current_role() = 'supplier_viewer'
    and status = 'Approved'
    and (
      confidentiality_level = 'Fournisseur'
      or confidentiality_level = 'Public portail'
    )
  )
);
