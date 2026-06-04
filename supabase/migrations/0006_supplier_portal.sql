-- Supplier portal: create own complaints

drop policy if exists "supplier_complaints_insert_supplier" on public.supplier_complaints;

create policy "supplier_complaints_insert_supplier" on public.supplier_complaints
for insert to authenticated
with check (public.current_role() = 'supplier_viewer');
