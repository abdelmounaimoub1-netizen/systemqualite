insert into public.roles (id, name, slug, description)
values
  ('10000000-0000-0000-0000-000000000001', 'Admin', 'admin', 'Acces administrateur complet.'),
  ('10000000-0000-0000-0000-000000000002', 'Responsable qualite', 'quality_manager', 'Pilote la gouvernance qualite, les documents, les CAPA et les reglages.'),
  ('10000000-0000-0000-0000-000000000003', 'Auditeur', 'auditor', 'Realise les audits, suit les constats et les revues de risques.'),
  ('10000000-0000-0000-0000-000000000004', 'Collaborateur', 'employee', 'Acces general pour la participation qualite quotidienne.'),
  ('10000000-0000-0000-0000-000000000005', 'Lecteur fournisseur', 'supplier_viewer', 'Acces fournisseur en lecture et collaboration limitee.')
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description;

insert into public.departments (id, name, description)
values
  ('20000000-0000-0000-0000-000000000001', 'Qualite', 'Systeme qualite, CAPA et supervision des audits.'),
  ('20000000-0000-0000-0000-000000000002', 'Operations', 'Production et execution quotidienne.'),
  ('20000000-0000-0000-0000-000000000003', 'Supply Chain', 'Fournisseurs, logistique et flux matieres entrants.'),
  ('20000000-0000-0000-0000-000000000004', 'Maintenance', 'Entretien des equipements et etalonnage.')
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description;

insert into public.document_categories (id, name, description)
values
  ('30000000-0000-0000-0000-000000000001', 'Politiques', 'Documents maitrises de gouvernance et de management.'),
  ('30000000-0000-0000-0000-000000000002', 'Procedures', 'Procedures operationnelles standard.'),
  ('30000000-0000-0000-0000-000000000003', 'Formulaires', 'Modeles, checklists et formulaires maitrises.')
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
    '{"full_name":"Amina Laurent","job_title":"Directrice qualite"}',
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
    '{"full_name":"Marco Rivet","job_title":"Responsable qualite"}',
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
    '{"full_name":"Elena Ortiz","job_title":"Auditrice principale"}',
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
    '{"full_name":"Samir Benali","job_title":"Superviseur production"}',
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
    '{"full_name":"Noah Fischer","job_title":"Contact fournisseur"}',
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
  ('50000000-0000-0000-0000-000000000001', 'POL-001', 'Politique qualite', 'Politique qualite et engagements de haut niveau.', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Approved', '2.0', current_date - 90, current_date + 270, 'documents/policies/politique-qualite-v2.pdf', '40000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', 'SOP-014', 'Procedure de liberation de ligne', 'Controles operateur avant chaque demarrage de lot.', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'Under Review', '1.3', current_date - 30, current_date + 60, 'documents/sops/liberation-ligne-v1-3.pdf', '40000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000003', 'FRM-022', 'Formulaire evaluation fournisseur', 'Grille maitrisee pour integration fournisseur et revue annuelle.', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'Approved', '1.0', current_date - 120, current_date + 180, 'documents/forms/formulaire-evaluation-fournisseur.pdf', '40000000-0000-0000-0000-000000000001')
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
  ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '2.0', 'Approved', 'Terminologie alignee sur le nouveau cycle de revue de direction.', current_date - 90, 'documents/versions/pol-001-v2.pdf', '40000000-0000-0000-0000-000000000001'),
  ('51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '1.3', 'Under Review', 'Ajout du deuxieme visa pour les controles de demarrage.', current_date - 2, 'documents/versions/sop-014-v1-3.pdf', '40000000-0000-0000-0000-000000000002')
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
    'Declaration non-conformite',
    'Formulaire standard pour saisir, qualifier et orienter les evenements qualite.',
    'Qualite',
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'Active',
    'Date; departement; source; criticite; description; confinement immediat; cause racine; CAPA liee',
    'Nombre de NC ouvertes et delai de cloture',
    '40000000-0000-0000-0000-000000000001'
  ),
  (
    '67000000-0000-0000-0000-000000000002',
    'FRM-AUD-002',
    'Fiche constat audit',
    'Fiche reutilisable avec pilote, criticite, preuve et echeance de suivi.',
    'Audit',
    '40000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    'Active',
    'Perimetre audit; exigence; constat; preuve; criticite; pilote; echeance; verification',
    'Constats par criticite',
    '40000000-0000-0000-0000-000000000002'
  ),
  (
    '67000000-0000-0000-0000-000000000003',
    'FRM-SUP-003',
    'Evaluation fournisseur',
    'Formulaire de notation pour integration fournisseur et reevaluation annuelle.',
    'Supply Chain',
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003',
    'Draft',
    'Fournisseur; categorie; score; certification; historique audit; actions requises',
    'Score fournisseur moyen',
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
    'Transmission de quart non signee',
    '40000000-0000-0000-0000-000000000004',
    'In Review',
    current_date + 10,
    'Une entree du releve temperature manque la seconde signature. Confinement: chef de quart informe.',
    '40000000-0000-0000-0000-000000000004'
  ),
  (
    '67100000-0000-0000-0000-000000000002',
    '67000000-0000-0000-0000-000000000002',
    'AUD-F-2026-003',
    'Support visuel obsolete en ligne 3',
    '40000000-0000-0000-0000-000000000003',
    'Submitted',
    current_date + 14,
    'Constat releve pendant l'audit conditionnement. Preuve importee dans les pieces jointes audit.',
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
  ('52000000-0000-0000-0000-000000000001', 'Circuit approbation document', 'Parcours standard d'approbation des nouveaux documents maitrises.', 'In Progress', current_date + 7, '40000000-0000-0000-0000-000000000002', true, '40000000-0000-0000-0000-000000000001'),
  ('52000000-0000-0000-0000-000000000002', 'Revue integration fournisseur', 'Evaluer accord qualite, score et preuves de qualification.', 'Awaiting Approval', current_date + 5, '40000000-0000-0000-0000-000000000003', true, '40000000-0000-0000-0000-000000000002')
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
  ('53000000-0000-0000-0000-000000000001', '52000000-0000-0000-0000-000000000001', 'Revue qualite', 'Verifier que la structure et les metadonnees sont completes.', '40000000-0000-0000-0000-000000000002', current_date + 2, 'In Progress', 'Pending', '40000000-0000-0000-0000-000000000001'),
  ('53000000-0000-0000-0000-000000000002', '52000000-0000-0000-0000-000000000001', 'Approbation finale', 'Approuver la diffusion controlee.', '40000000-0000-0000-0000-000000000001', current_date + 5, 'Draft', 'Pending', '40000000-0000-0000-0000-000000000001')
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
  ('54000000-0000-0000-0000-000000000001', 'Journal de ligne incomplet', 'Le releve temperature de lot contient une transmission de quart non signee.', 'Medium', 'Audit interne', '20000000-0000-0000-0000-000000000002', 'In Progress', '40000000-0000-0000-0000-000000000004', 'Absence de verification de second niveau en fin de quart.', current_date + 10, '40000000-0000-0000-0000-000000000003'),
  ('54000000-0000-0000-0000-000000000002', 'Retard CoA fournisseur', 'Le certificat d'analyse a ete recu apres la liberation matiere.', 'High', 'Controle reception', '20000000-0000-0000-0000-000000000003', 'Open', '40000000-0000-0000-0000-000000000002', 'Declencheur d'escalade absent du circuit fournisseur.', current_date + 14, '40000000-0000-0000-0000-000000000002')
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
  ('55000000-0000-0000-0000-000000000001', 'Ajouter un deuxieme visa au journal de quart', 'Corrective', '54000000-0000-0000-0000-000000000001', 'Mettre a jour le modele maitrise et former l'equipe.', '40000000-0000-0000-0000-000000000004', current_date + 7, 'High', 'In Progress', 'Verifier 3 lots avec signatures completes.', '40000000-0000-0000-0000-000000000002'),
  ('55000000-0000-0000-0000-000000000002', 'Regle escalade CoA fournisseur', 'Preventive', '54000000-0000-0000-0000-000000000002', 'Creer une alerte si le CoA manque apres reception marchandise.', '40000000-0000-0000-0000-000000000002', current_date + 12, 'High', 'Open', 'Valider les 5 prochaines livraisons.', '40000000-0000-0000-0000-000000000002'),
  ('55000000-0000-0000-0000-000000000003', 'Revoir les ecarts formation ouverts', 'Preventive', null, 'Croiser les formations expirees avec les roles critiques.', '40000000-0000-0000-0000-000000000002', current_date + 20, 'Medium', 'Verification', 'Aucune formation expiree sur role critique apres revue.', '40000000-0000-0000-0000-000000000001')
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
  ('56000000-0000-0000-0000-000000000001', 'Audit interne conditionnement', 'Internal', 'Controles ligne de conditionnement et reconciliation etiquettes.', '40000000-0000-0000-0000-000000000003', current_date + 9, current_date + 30, 'Planned', 'audits/reports/audit-interne-conditionnement.pdf', '40000000-0000-0000-0000-000000000002'),
  ('56000000-0000-0000-0000-000000000002', 'Revue systeme qualite fournisseur', 'External', 'Accord qualite, ecarts et performance de liberation.', '40000000-0000-0000-0000-000000000003', current_date + 15, current_date + 40, 'Planned', 'audits/reports/revue-systeme-fournisseur.pdf', '40000000-0000-0000-0000-000000000002')
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
  ('57000000-0000-0000-0000-000000000001', '56000000-0000-0000-0000-000000000001', 'Verifier la liberation de ligne avant le premier lot.', true, 'Pending', null, '40000000-0000-0000-0000-000000000003'),
  ('57000000-0000-0000-0000-000000000002', '56000000-0000-0000-0000-000000000001', 'Confirmer que la reconciliation etiquettes est documentee.', true, 'Pending', null, '40000000-0000-0000-0000-000000000003'),
  ('57000000-0000-0000-0000-000000000003', '56000000-0000-0000-0000-000000000002', 'Verifier le SLA de cloture des ecarts fournisseur.', true, 'Pending', null, '40000000-0000-0000-0000-000000000003')
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
  ('58000000-0000-0000-0000-000000000001', '56000000-0000-0000-0000-000000000001', 'Support visuel obsolete affiche en ligne 3', 'Le panneau instruction reference encore une revision de formulaire retiree.', 'Minor', '40000000-0000-0000-0000-000000000004', 'Action Planned', '40000000-0000-0000-0000-000000000003'),
  ('58000000-0000-0000-0000-000000000002', '56000000-0000-0000-0000-000000000002', 'Aucun circuit escalade CoA retarde', 'L'equipe fournisseur n'a pas de declencheur documente apres reception.', 'Major', '40000000-0000-0000-0000-000000000002', 'Open', '40000000-0000-0000-0000-000000000003')
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
  ('59000000-0000-0000-0000-000000000001', 'Risque melange etiquettes au changement de ligne', 'Le haut debit augmente le risque de melange si la liberation de ligne derape.', 3, 5, 'Double verification des kits etiquettes et visa liberation de ligne.', '40000000-0000-0000-0000-000000000004', current_date + 21, '40000000-0000-0000-0000-000000000002'),
  ('59000000-0000-0000-0000-000000000002', 'Preuves fournisseur retardees', 'Des matieres critiques peuvent arriver avant dossier documentaire complet.', 4, 4, 'Alerte escalade et revue fournisseur mensuelle.', '40000000-0000-0000-0000-000000000002', current_date + 14, '40000000-0000-0000-0000-000000000002'),
  ('59000000-0000-0000-0000-000000000003', 'Ecart formation operateurs temporaires', 'Les pics de charge peuvent creer des retards sur les recyclages obligatoires.', 2, 3, 'Matrice formation par role revue chaque semaine.', '40000000-0000-0000-0000-000000000002', current_date + 28, '40000000-0000-0000-0000-000000000001')
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
  ('60000000-0000-0000-0000-000000000001', 'Recyclage annuel BPF', '40000000-0000-0000-0000-000000000004', 'Collaborateur', 'Completed', current_date + 300, 'trainings/certificates/recyclage-bpf.pdf', 'Realise dans les delais.', '40000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000002', 'Recyclage auditeur principal', '40000000-0000-0000-0000-000000000003', 'Auditeur', 'Completed', current_date + 250, 'trainings/certificates/recyclage-auditeur.pdf', 'Requis pour piloter les audits externes.', '40000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000003', 'Integration traitement des ecarts', '40000000-0000-0000-0000-000000000004', 'Superviseur', 'In Progress', current_date + 45, null, 'Evaluation pratique encore ouverte.', '40000000-0000-0000-0000-000000000002')
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
  ('61000000-0000-0000-0000-000000000001', 'Detecteur de metaux MD-03', 'MD03-2022-771', 'Ligne conditionnement 3', current_date - 30, current_date + 60, 'Active', 'Controle trimestriel realise et signe.', '40000000-0000-0000-0000-000000000001'),
  ('61000000-0000-0000-0000-000000000002', 'Balance BL-12', 'BL12-2019-145', 'Zone pesee magasin', current_date - 10, current_date + 5, 'Calibration Due', 'Reservation etalonnage prevue la semaine prochaine.', '40000000-0000-0000-0000-000000000001'),
  ('61000000-0000-0000-0000-000000000003', 'Centrale traitement air AHU-7', 'AHU7-2018-219', 'Couloir salle propre', current_date - 15, current_date + 120, 'Maintenance', 'Remplacement filtre en cours.', '40000000-0000-0000-0000-000000000001')
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
  ('62000000-0000-0000-0000-000000000001', 'Nordic Components GmbH', 'Noah Fischer', 'supplier@qmspro.demo', '+49 170 123 4567', 89, 'Approved', 'Revue qualite a distance terminee le trimestre dernier.', 'Bonne performance livraison, quelques retards documentaires mineurs.', '40000000-0000-0000-0000-000000000002'),
  ('62000000-0000-0000-0000-000000000002', 'Blue Harbor Packaging', 'Lina Costa', 'quality@blueharbor.example', '+351 910 222 111', 76, 'Under Review', 'Audit sur site planifie ce mois-ci.', 'Accord qualite mis a jour en attente.', '40000000-0000-0000-0000-000000000002'),
  ('62000000-0000-0000-0000-000000000003', 'Apex Analytical Labs', 'Diego Melo', 'lab@apexlabs.example', '+34 600 888 222', 92, 'Approved', 'Qualification laboratoire externe renouvelee.', 'Delais constants et rapports complets.', '40000000-0000-0000-0000-000000000002')
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
    'Le client signale un emballage secondaire endommage a la livraison avec photos jointes.',
    'High',
    'In Progress',
    current_date - 3,
    current_date + 7,
    '40000000-0000-0000-0000-000000000002',
    'Confinement ouvert. Logistique et conditionnement verifient les preuves transport.',
    '40000000-0000-0000-0000-000000000002'
  ),
  (
    '68000000-0000-0000-0000-000000000002',
    'RC-2026-002',
    'Medina Retail',
    'support@medina.example',
    'SKU-QA-118',
    'Reclamation lisibilite etiquette sur un lot de cartons.',
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
  client_sector = 'Detail',
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
    'Retard certificat',
    'Le certificat d'analyse est arrive apres le delai interne de liberation.',
    'High',
    'In Progress',
    current_date - 4,
    current_date + 6,
    '40000000-0000-0000-0000-000000000002',
    'Fournisseur sollicite pour confirmer le delai correctif et la regle de prevention.',
    '40000000-0000-0000-0000-000000000002'
  ),
  (
    '68100000-0000-0000-0000-000000000002',
    'RF-2026-002',
    '62000000-0000-0000-0000-000000000002',
    'Blue Harbor Packaging',
    'Dommage reception',
    'Deux palettes recues avec traces d'humidite sur emballage exterieur.',
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
    'Standard visuel obsolete',
    'Un tableau production reference encore une ancienne revision de formulaire.',
    'Operations industrielles',
    '20000000-0000-0000-0000-000000000002',
    'Medium',
    'Action Required',
    current_date - 1,
    '40000000-0000-0000-0000-000000000004',
    'Remplacer le contenu du tableau et confirmer la diffusion documentaire.',
    '40000000-0000-0000-0000-000000000003'
  ),
  (
    '68200000-0000-0000-0000-000000000002',
    'CST-2026-002',
    'Transmission fournisseur incomplete',
    'La checklist de passation ne mentionne pas clairement le pilote escalade certificat.',
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
    'Equipe production',
    'Interne',
    'Retard repete de reception du formulaire maitrise mis a jour apres approbation.',
    'Medium',
    'In Progress',
    current_date - 5,
    current_date + 4,
    '40000000-0000-0000-0000-000000000002',
    'Le gestionnaire documentaire revoit le circuit de diffusion.',
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
  ('63000000-0000-0000-0000-000000000001', 'Revue document bientot due', 'SOP-014 atteint sa date de revue dans 60 jours.', 'Unread', current_date + 60, 'Revue documentaire', '40000000-0000-0000-0000-000000000002', '/documents/50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001'),
  ('63000000-0000-0000-0000-000000000002', 'Echeance CAPA proche', 'Le deuxieme visa du journal de quart est du dans 7 jours.', 'Unread', current_date + 7, 'CAPA', '40000000-0000-0000-0000-000000000004', '/capa-actions/55000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002'),
  ('63000000-0000-0000-0000-000000000003', 'Audit planifie', 'Audit interne conditionnement planifie pour la semaine prochaine.', 'Read', current_date + 9, 'Audit', '40000000-0000-0000-0000-000000000003', '/audits/56000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002'),
  ('63000000-0000-0000-0000-000000000004', 'Revue fournisseur en attente', 'Veuillez importer l'accord qualite renouvele.', 'Unread', current_date + 5, 'Fournisseur', '40000000-0000-0000-0000-000000000005', '/suppliers/62000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.comments (
  id,
  table_name,
  record_id,
  body,
  created_by
)
values
  ('64000000-0000-0000-0000-000000000001', 'non_conformities', '54000000-0000-0000-0000-000000000001', 'Impact formation revu. Les chefs de quart comprennent le contournement temporaire.', '40000000-0000-0000-0000-000000000002'),
  ('64000000-0000-0000-0000-000000000002', 'audits', '56000000-0000-0000-0000-000000000001', 'Brouillon checklist revu avec la supervision conditionnement.', '40000000-0000-0000-0000-000000000003'),
  ('64000000-0000-0000-0000-000000000003', 'suppliers', '62000000-0000-0000-0000-000000000001', 'Le fournisseur demande la mise a jour du libelle de l'accord qualite.', '40000000-0000-0000-0000-000000000002')
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
  ('65000000-0000-0000-0000-000000000001', 'documents', '50000000-0000-0000-0000-000000000001', 'politique-qualite-v2.pdf', 'documents/policies/politique-qualite-v2.pdf', 248320, 'application/pdf', 'Version approuvee en vigueur.', '40000000-0000-0000-0000-000000000001'),
  ('65000000-0000-0000-0000-000000000002', 'audits', '56000000-0000-0000-0000-000000000001', 'plan-audit-conditionnement.pdf', 'audits/plans/plan-audit-conditionnement.pdf', 186400, 'application/pdf', 'Plan et perimetre audit.', '40000000-0000-0000-0000-000000000003'),
  ('65000000-0000-0000-0000-000000000003', 'suppliers', '62000000-0000-0000-0000-000000000001', 'accord-qualite.pdf', 'suppliers/contracts/accord-qualite-nordic.pdf', 312800, 'application/pdf', 'Dernier accord signe.', '40000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.app_settings (id, setting_key, setting_value, created_by)
values
  ('66000000-0000-0000-0000-000000000001', 'identite_visuelle', '{"nomApplication":"QMS Pro","theme":"bleu-cotier"}', '40000000-0000-0000-0000-000000000001'),
  ('66000000-0000-0000-0000-000000000002', 'tableau_de_bord', '{"afficherActiviteRecente":true,"afficherNotifications":true}', '40000000-0000-0000-0000-000000000001')
on conflict (id) do update
set
  setting_key = excluded.setting_key,
  setting_value = excluded.setting_value;
