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
    'admin@qmspro.demo',
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
on conflict (id) do nothing;

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
  ('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '{"sub":"40000000-0000-0000-0000-000000000001","email":"admin@qmspro.demo"}', 'email', 'admin@qmspro.demo', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('41000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '{"sub":"40000000-0000-0000-0000-000000000002","email":"manager@qmspro.demo"}', 'email', 'manager@qmspro.demo', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('41000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', '{"sub":"40000000-0000-0000-0000-000000000003","email":"auditor@qmspro.demo"}', 'email', 'auditor@qmspro.demo', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('41000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', '{"sub":"40000000-0000-0000-0000-000000000004","email":"employee@qmspro.demo"}', 'email', 'employee@qmspro.demo', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('41000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', '{"sub":"40000000-0000-0000-0000-000000000005","email":"supplier@qmspro.demo"}', 'email', 'supplier@qmspro.demo', timezone('utc', now()), timezone('utc', now()), timezone('utc', now()))
on conflict (id) do nothing;

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
