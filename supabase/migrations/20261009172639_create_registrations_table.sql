/*
# Create registrations table for Desa Jatimulyo service system

1. New Tables
- `registrations`
  - `id` (uuid, primary key)
  - `tracking_code` (text, unique) — format JTM-YYYYMMDD-XXX
  - `full_name` (text, not null) — citizen's full name
  - `phone` (text, not null) — WhatsApp/phone number
  - `dusun_rt` (text, not null) — hamlet/RT selection
  - `service_type` (text, not null) — type of letter requested
  - `planned_visit_date` (date, not null) — planned visit to village office
  - `notes` (text) — optional additional notes
  - `status` (text, not null, default 'diajukan') — diajukan | verifikasi | diproses | siap_diambil | selesai
  - `officer_note` (text) — note from officer
  - `is_walk_in` (boolean, default false) — whether registered offline by operator
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
  - `completed_at` (timestamptz) — when status changed to selesai

2. Security
- Enable RLS on `registrations`.
- Allow anon + authenticated CRUD — this is a public-facing app with mock operator login (no real auth).
- All data is intentionally shared/public within the village service context.
*/

CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  dusun_rt text NOT NULL,
  service_type text NOT NULL,
  planned_visit_date date NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'diajukan',
  officer_note text,
  is_walk_in boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_registrations" ON registrations;
CREATE POLICY "anon_select_registrations" ON registrations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_registrations" ON registrations;
CREATE POLICY "anon_insert_registrations" ON registrations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_registrations" ON registrations;
CREATE POLICY "anon_update_registrations" ON registrations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_registrations" ON registrations;
CREATE POLICY "anon_delete_registrations" ON registrations FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_registrations_tracking_code ON registrations(tracking_code);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);
