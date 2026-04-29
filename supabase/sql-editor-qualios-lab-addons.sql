-- Qualios laboratory portal add-ons.
-- Run this after the main schema/seed if you already installed the project.

insert into public.document_categories (id, name, description)
values
  ('30000000-0000-0000-0000-000000000004', 'Laboratoire', 'Cartographie, processus et enregistrements du laboratoire.'),
  ('30000000-0000-0000-0000-000000000005', 'Processus support laboratoire', 'Personnel, equipements, systeme documentaire, achats, SI et locaux.')
on conflict (name) do update
set description = excluded.description;

insert into public.documents (
  id,
  document_code,
  title,
  summary,
  category_id,
  status,
  version_current,
  effective_date,
  review_date,
  file_path
)
values
  (
    '69000000-0000-0000-0000-000000000001',
    'DOC-LAB-001',
    'Cartographie du laboratoire',
    'Fonctionnement normal du laboratoire: management, realisation, support et amelioration continue.',
    '30000000-0000-0000-0000-000000000004',
    'Approved',
    '1.0',
    current_date,
    current_date + 365,
    'documents/laboratoire/cartographie-laboratoire.pdf'
  ),
  (
    '69000000-0000-0000-0000-000000000002',
    'PR-LAB-MGT-001',
    'Organisation et systeme de management laboratoire',
    'Politique, objectifs, responsabilites, autorites, planification et communication interne.',
    '30000000-0000-0000-0000-000000000004',
    'Approved',
    '1.0',
    current_date,
    current_date + 365,
    'documents/laboratoire/organisation-management.pdf'
  ),
  (
    '69000000-0000-0000-0000-000000000003',
    'PR-LAB-REA-001',
    'Processus pre-analytique analytique post-analytique',
    'Plan de controle, prelevements, analyses, validation, interpretation et transmission des resultats.',
    '30000000-0000-0000-0000-000000000004',
    'Approved',
    '1.0',
    current_date,
    current_date + 365,
    'documents/laboratoire/processus-realisation.pdf'
  ),
  (
    '69000000-0000-0000-0000-000000000004',
    'PR-LAB-SUP-001',
    'Processus support laboratoire',
    'Personnel, equipements, systeme documentaire, achats, systeme informatique, locaux et environnement analytique.',
    '30000000-0000-0000-0000-000000000005',
    'Approved',
    '1.0',
    current_date,
    current_date + 365,
    'documents/laboratoire/processus-support.pdf'
  )
on conflict (document_code) do update
set
  title = excluded.title,
  summary = excluded.summary,
  category_id = excluded.category_id,
  status = excluded.status,
  version_current = excluded.version_current,
  effective_date = excluded.effective_date,
  review_date = excluded.review_date,
  file_path = excluded.file_path;

insert into public.forms (
  id,
  code,
  name,
  description,
  process_area,
  status,
  fields_schema,
  target_indicator
)
values
  (
    '69100000-0000-0000-0000-000000000001',
    'FRM-LAB-001',
    'Plan de controle laboratoire',
    'Planification et suivi des controles laboratoire.',
    'Laboratoire - Pre-analytique',
    'Active',
    'Echantillon; lot; matrice; methode; frequence; responsable; statut; observation',
    'Taux de controles realises dans les delais'
  ),
  (
    '69100000-0000-0000-0000-000000000002',
    'FRM-LAB-002',
    'Enregistrement pre-analytique',
    'Reception, identification et pretraitement des echantillons.',
    'Laboratoire - Pre-analytique',
    'Active',
    'Date reception; provenance; echantillon; quantite; etat; pretraitement; operateur',
    'Taux de conformite reception echantillons'
  ),
  (
    '69100000-0000-0000-0000-000000000003',
    'FRM-LAB-003',
    'Validation post-analytique',
    'Validation, interpretation et transmission des resultats.',
    'Laboratoire - Post-analytique',
    'Active',
    'Reference analyse; resultats; conformite; validation; commentaire; destinataire; date transmission',
    'Delai de validation et transmission'
  ),
  (
    '69100000-0000-0000-0000-000000000004',
    'FRM-LAB-004',
    'Amelioration continue laboratoire',
    'Suivi des actions, risques et opportunites du laboratoire.',
    'Laboratoire - Management',
    'Active',
    'Source; constat; risque/opportunite; action; pilote; deadline; efficacite',
    'Taux de cloture des actions laboratoire'
  )
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  process_area = excluded.process_area,
  status = excluded.status,
  fields_schema = excluded.fields_schema,
  target_indicator = excluded.target_indicator;

insert into public.workflows (
  id,
  title,
  description,
  status,
  due_date,
  approval_required
)
values
  (
    '69200000-0000-0000-0000-000000000001',
    'Circuit validation resultats laboratoire',
    'Workflow Qualios pour analyse, verification technique, validation et transmission des resultats.',
    'In Progress',
    current_date + 7,
    true
  ),
  (
    '69200000-0000-0000-0000-000000000002',
    'Revue indicateurs laboratoire',
    'Analyse des indicateurs, risques, opportunites et amelioration continue du laboratoire.',
    'Draft',
    current_date + 30,
    true
  )
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  due_date = excluded.due_date,
  approval_required = excluded.approval_required;

insert into public.notifications (
  id,
  title,
  message,
  status,
  due_date,
  category,
  user_id,
  action_url
)
values
  (
    '69300000-0000-0000-0000-000000000001',
    'Revue cartographie laboratoire',
    'La cartographie du laboratoire doit etre revue et validee.',
    'Unread',
    current_date + 30,
    'Laboratoire',
    null,
    '/documents'
  )
on conflict (id) do update
set
  title = excluded.title,
  message = excluded.message,
  status = excluded.status,
  due_date = excluded.due_date,
  category = excluded.category,
  action_url = excluded.action_url;

insert into public.app_settings (id, setting_key, setting_value)
values
  (
    '69400000-0000-0000-0000-000000000001',
    'qualios_lab_cartography',
    '{
      "title":"Fonctionnement normale du laboratoire",
      "management":["Organisation et systeme de management","Management de la qualite"],
      "realisation":["Pre-Analytique","Analytique","Post-Analytique"],
      "support":["Gestion du personnel","Maitrise des equipements","Systeme Documentaire","Achats / Sous-traitance","Systeme informatique","Locaux et E.A"],
      "pdca":["Plan","Do","Check","Act"]
    }'::jsonb
  )
on conflict (setting_key) do update
set setting_value = excluded.setting_value;
