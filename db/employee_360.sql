
-- Employee 360 extension for the existing Enterprise HRMS PostgreSQL database.
-- Existing tables "employees", "assets", and "holidays" are reused.
-- Run this once against hrms_db after backing up the database.
BEGIN;

CREATE TABLE IF NOT EXISTS employee_bank_details (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    account_holder_name varchar(255) NOT NULL,
    bank_name varchar(120) NOT NULL,
    account_number varchar(40) NOT NULL,
    ifsc varchar(20) NOT NULL,
    branch varchar(120) NOT NULL,
    account_type varchar(30) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_pf_details (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    uan varchar(40) NOT NULL,
    pf_number varchar(40) NOT NULL,
    pf_applicable boolean NOT NULL,
    pf_joining_date date NOT NULL,
    pension_applicable boolean NOT NULL,
    nominee_name varchar(255) NOT NULL,
    nominee_relationship varchar(80) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_type varchar(60) NOT NULL,
    file_name varchar(255) NOT NULL,
    storage_key varchar(1024) NOT NULL,
    mime_type varchar(120) NOT NULL,
    uploaded_by uuid NOT NULL REFERENCES users(id),
    verification_status varchar(30) NOT NULL DEFAULT 'pending',
    verified_by uuid REFERENCES users(id),
    verified_at timestamptz,
    remarks varchar(1000),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_salary (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    effective_date date NOT NULL,
    annual_ctc numeric(14,2) NOT NULL,
    monthly_gross numeric(14,2) NOT NULL,
    basic numeric(14,2) NOT NULL,
    hra numeric(14,2) NOT NULL,
    special_allowance numeric(14,2) NOT NULL,
    conveyance numeric(14,2) NOT NULL,
    medical_allowance numeric(14,2) NOT NULL,
    other_allowances numeric(14,2) NOT NULL,
    employer_pf numeric(14,2) NOT NULL,
    employee_pf numeric(14,2) NOT NULL,
    professional_tax numeric(14,2) NOT NULL,
    tds numeric(14,2) NOT NULL,
    net_salary numeric(14,2) NOT NULL,
    currency varchar(10) NOT NULL DEFAULT 'INR',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_salary_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    effective_date date NOT NULL,
    previous_ctc numeric(14,2) NOT NULL,
    new_ctc numeric(14,2) NOT NULL,
    increment_percent numeric(7,2) NOT NULL,
    reason varchar(500) NOT NULL,
    approved_by uuid NOT NULL REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Existing "assets" table is extended instead of recreated.
ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_id varchar(80);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS model varchar(120);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS condition varchar(40);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS status varchar(40);

CREATE TABLE IF NOT EXISTS employee_insurance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    policy_type varchar(80) NOT NULL,
    policy_number varchar(120) NOT NULL,
    provider varchar(160) NOT NULL,
    coverage_amount numeric(14,2) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    employee_contribution numeric(14,2) NOT NULL,
    employer_contribution numeric(14,2) NOT NULL,
    status varchar(30) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_dependents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    relationship varchar(80) NOT NULL,
    date_of_birth date NOT NULL,
    gender varchar(30) NOT NULL,
    contact varchar(50) NOT NULL,
    coverage varchar(255) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_leave_balances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type varchar(80) NOT NULL,
    leave_year integer NOT NULL,
    allocated_days numeric(6,2) NOT NULL,
    used_days numeric(6,2) NOT NULL,
    remaining_days numeric(6,2) NOT NULL,
    UNIQUE(employee_id, leave_type, leave_year)
);

CREATE TABLE IF NOT EXISTS employee_team (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    manager_employee_id uuid NOT NULL REFERENCES employees(id),
    team_name varchar(120) NOT NULL,
    team_role varchar(120) NOT NULL
);

-- The four mandatory HR document types are represented as application-level
-- required document types; file content itself belongs in object/file storage.
CREATE INDEX IF NOT EXISTS ix_employee_documents_employee_id ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS ix_employee_insurance_employee_id ON employee_insurance(employee_id);
CREATE INDEX IF NOT EXISTS ix_employee_dependents_employee_id ON employee_dependents(employee_id);
CREATE INDEX IF NOT EXISTS ix_employee_salary_history_employee_id ON employee_salary_history(employee_id);

COMMIT;
