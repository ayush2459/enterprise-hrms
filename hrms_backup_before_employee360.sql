--
-- PostgreSQL database dump
--

\restrict C6p7YkE4kQNCNfhXMrcXzCo127gqetpHTHh11Scy6jXrw9eog52VYL7t7YQfysH

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: attendance_status_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.attendance_status_enum AS ENUM (
    'PRESENT',
    'ABSENT',
    'HALF_DAY',
    'ON_LEAVE',
    'HOLIDAY'
);


ALTER TYPE public.attendance_status_enum OWNER TO hrms_user;

--
-- Name: bgv_check_status_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.bgv_check_status_enum AS ENUM (
    'INITIATED',
    'IN_PROGRESS',
    'CLEARED',
    'FLAGGED'
);


ALTER TYPE public.bgv_check_status_enum OWNER TO hrms_user;

--
-- Name: candidate_stage_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.candidate_stage_enum AS ENUM (
    'APPLIED',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFER_EXTENDED',
    'HIRED',
    'REJECTED'
);


ALTER TYPE public.candidate_stage_enum OWNER TO hrms_user;

--
-- Name: conversion_status_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.conversion_status_enum AS ENUM (
    'NOT_APPLICABLE',
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.conversion_status_enum OWNER TO hrms_user;

--
-- Name: document_status_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.document_status_enum AS ENUM (
    'PENDING_UPLOAD',
    'SUBMITTED',
    'VERIFIED',
    'REJECTED',
    'EXPIRED'
);


ALTER TYPE public.document_status_enum OWNER TO hrms_user;

--
-- Name: employee_status_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.employee_status_enum AS ENUM (
    'ACTIVE',
    'ON_LEAVE',
    'OFFBOARDED',
    'RESIGNED',
    'TERMINATED'
);


ALTER TYPE public.employee_status_enum OWNER TO hrms_user;

--
-- Name: employment_type_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.employment_type_enum AS ENUM (
    'FULL_TIME',
    'INTERN',
    'CONTRACT'
);


ALTER TYPE public.employment_type_enum OWNER TO hrms_user;

--
-- Name: job_opening_status_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.job_opening_status_enum AS ENUM (
    'OPEN',
    'ON_HOLD',
    'CLOSED'
);


ALTER TYPE public.job_opening_status_enum OWNER TO hrms_user;

--
-- Name: leave_request_status_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.leave_request_status_enum AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.leave_request_status_enum OWNER TO hrms_user;

--
-- Name: offboard_reason_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.offboard_reason_enum AS ENUM (
    'RESIGNATION',
    'TERMINATION',
    'CONTRACT_END',
    'RETIREMENT',
    'ABANDONMENT',
    'OTHER'
);


ALTER TYPE public.offboard_reason_enum OWNER TO hrms_user;

--
-- Name: payroll_status_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.payroll_status_enum AS ENUM (
    'DRAFT',
    'PROCESSED',
    'PAID'
);


ALTER TYPE public.payroll_status_enum OWNER TO hrms_user;

--
-- Name: review_cycle_status_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.review_cycle_status_enum AS ENUM (
    'ACTIVE',
    'CLOSED'
);


ALTER TYPE public.review_cycle_status_enum OWNER TO hrms_user;

--
-- Name: review_rating_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.review_rating_enum AS ENUM (
    'NOT_RATED',
    'BELOW_EXPECTATIONS',
    'MEETS_EXPECTATIONS',
    'EXCEEDS_EXPECTATIONS'
);


ALTER TYPE public.review_rating_enum OWNER TO hrms_user;

--
-- Name: review_status_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.review_status_enum AS ENUM (
    'PENDING_SELF_ASSESSMENT',
    'PENDING_MANAGER_REVIEW',
    'COMPLETED'
);


ALTER TYPE public.review_status_enum OWNER TO hrms_user;

--
-- Name: role_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.role_enum AS ENUM (
    'EMPLOYEE',
    'REPORTING_MANAGER',
    'HR_EXECUTIVE',
    'HR_ADMIN',
    'SYSTEM_ADMIN'
);


ALTER TYPE public.role_enum OWNER TO hrms_user;

--
-- Name: selection_status_enum; Type: TYPE; Schema: public; Owner: hrms_user
--

CREATE TYPE public.selection_status_enum AS ENUM (
    'SHORTLISTED',
    'SELECTED',
    'OFFER_EXTENDED',
    'JOINED'
);


ALTER TYPE public.selection_status_enum OWNER TO hrms_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO hrms_user;

--
-- Name: assets; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.assets (
    employee_id uuid NOT NULL,
    asset_type character varying(60) NOT NULL,
    asset_name character varying(255) NOT NULL,
    serial_number character varying(120),
    assigned_date date,
    returned_date date,
    notes character varying(500),
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.assets OWNER TO hrms_user;

--
-- Name: attendance_records; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.attendance_records (
    employee_id uuid NOT NULL,
    date date NOT NULL,
    status public.attendance_status_enum NOT NULL,
    marked_by uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.attendance_records OWNER TO hrms_user;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.audit_logs (
    user_id uuid,
    action character varying(120) NOT NULL,
    resource_type character varying(120),
    resource_id character varying(120),
    ip_address character varying(64),
    user_agent character varying(255),
    detail character varying(500),
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO hrms_user;

--
-- Name: bgv_checks; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.bgv_checks (
    employee_id uuid NOT NULL,
    check_type character varying(60) NOT NULL,
    status public.bgv_check_status_enum NOT NULL,
    notes character varying(500),
    updated_by uuid,
    cleared_at timestamp with time zone,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bgv_checks OWNER TO hrms_user;

--
-- Name: candidates; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.candidates (
    job_opening_id uuid NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(30),
    resume_file_name character varying(255),
    resume_file_path character varying(512),
    resume_mime_type character varying(120),
    resume_file_size integer,
    stage public.candidate_stage_enum NOT NULL,
    notes character varying(500),
    converted_employee_id uuid,
    created_by uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    notice_period_days integer
);


ALTER TABLE public.candidates OWNER TO hrms_user;

--
-- Name: company_events; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.company_events (
    title character varying(200) NOT NULL,
    event_date date NOT NULL,
    category character varying(60) NOT NULL,
    created_by uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.company_events OWNER TO hrms_user;

--
-- Name: dependents; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.dependents (
    insurance_policy_id uuid NOT NULL,
    full_name character varying(255) NOT NULL,
    relationship character varying(50) NOT NULL,
    date_of_birth date NOT NULL,
    card_id character varying(100) NOT NULL,
    verified boolean NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dependents OWNER TO hrms_user;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.documents (
    employee_id uuid NOT NULL,
    document_type character varying(120) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(512) NOT NULL,
    mime_type character varying(120) NOT NULL,
    file_size_bytes integer NOT NULL,
    status public.document_status_enum NOT NULL,
    uploaded_by uuid NOT NULL,
    verified_by uuid,
    verified_at timestamp with time zone,
    notes character varying(500),
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documents OWNER TO hrms_user;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.employees (
    user_id uuid NOT NULL,
    full_name character varying(255) NOT NULL,
    photo_url character varying(512),
    department character varying(120),
    designation character varying(120),
    employment_type public.employment_type_enum NOT NULL,
    date_of_joining date,
    date_of_birth date,
    gender character varying(30),
    personal_address character varying(500),
    blood_group character varying(5),
    emergency_contact character varying(50),
    personal_email character varying(255),
    selection_status public.selection_status_enum NOT NULL,
    status public.employee_status_enum NOT NULL,
    reporting_manager_id uuid,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    notice_period_days integer,
    conversion_status public.conversion_status_enum NOT NULL,
    separation_date date,
    separation_reason text,
    offboard_reason public.offboard_reason_enum,
    offboarded_at date,
    mobile_number character varying(20),
    bank_account_number character varying(40),
    bank_ifsc character varying(20),
    bank_name character varying(120),
    pf_number character varying(40)
);


ALTER TABLE public.employees OWNER TO hrms_user;

--
-- Name: holidays; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.holidays (
    name character varying(120) NOT NULL,
    date date NOT NULL,
    is_optional boolean NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.holidays OWNER TO hrms_user;

--
-- Name: insurance_policies; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.insurance_policies (
    employee_id uuid NOT NULL,
    policy_number character varying(100) NOT NULL,
    insurer_name character varying(150) NOT NULL,
    plan_type character varying(100) NOT NULL,
    sum_insured integer NOT NULL,
    premium_employer_paid integer NOT NULL,
    premium_employee_contribution integer NOT NULL,
    valid_from date NOT NULL,
    valid_to date NOT NULL,
    benefits character varying[] NOT NULL,
    created_by uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.insurance_policies OWNER TO hrms_user;

--
-- Name: job_openings; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.job_openings (
    title character varying(200) NOT NULL,
    department character varying(120) NOT NULL,
    positions_count integer NOT NULL,
    status public.job_opening_status_enum NOT NULL,
    created_by uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.job_openings OWNER TO hrms_user;

--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.leave_requests (
    employee_id uuid NOT NULL,
    leave_type_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason character varying(500),
    status public.leave_request_status_enum NOT NULL,
    reviewed_by uuid,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.leave_requests OWNER TO hrms_user;

--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.leave_types (
    name character varying(60) NOT NULL,
    annual_quota_days integer NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.leave_types OWNER TO hrms_user;

--
-- Name: payroll_records; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.payroll_records (
    employee_id uuid NOT NULL,
    month date NOT NULL,
    basic_pay integer NOT NULL,
    allowances integer NOT NULL,
    deductions integer NOT NULL,
    net_pay integer NOT NULL,
    status public.payroll_status_enum NOT NULL,
    processed_by uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payroll_records OWNER TO hrms_user;

--
-- Name: performance_reviews; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.performance_reviews (
    review_cycle_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    self_assessment character varying(2000),
    manager_assessment character varying(2000),
    rating public.review_rating_enum NOT NULL,
    status public.review_status_enum NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.performance_reviews OWNER TO hrms_user;

--
-- Name: policies; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.policies (
    title character varying(200) NOT NULL,
    category character varying(100) NOT NULL,
    version integer NOT NULL,
    is_current boolean NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(512) NOT NULL,
    mime_type character varying(120) NOT NULL,
    file_size_bytes integer NOT NULL,
    uploaded_by uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.policies OWNER TO hrms_user;

--
-- Name: policy_acknowledgements; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.policy_acknowledgements (
    policy_id uuid NOT NULL,
    user_id uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.policy_acknowledgements OWNER TO hrms_user;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.refresh_tokens (
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO hrms_user;

--
-- Name: review_cycles; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.review_cycles (
    name character varying(150) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status public.review_cycle_status_enum NOT NULL,
    created_by uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.review_cycles OWNER TO hrms_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: hrms_user
--

CREATE TABLE public.users (
    official_email character varying(255) NOT NULL,
    employee_id character varying(50),
    hashed_password character varying(255) NOT NULL,
    role public.role_enum NOT NULL,
    is_active boolean NOT NULL,
    mfa_enabled boolean NOT NULL,
    mfa_secret character varying(64),
    failed_login_attempts integer NOT NULL,
    locked_until timestamp with time zone,
    last_login_at timestamp with time zone,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO hrms_user;

--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.alembic_version (version_num) FROM stdin;
e49899d7875b
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.assets (employee_id, asset_type, asset_name, serial_number, assigned_date, returned_date, notes, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: attendance_records; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.attendance_records (employee_id, date, status, marked_by, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, detail, id, created_at, updated_at) FROM stdin;
\N	login_failed	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	unknown identifier	0965405a-5160-47e5-87cd-4a45e5c834d2	2026-08-13 08:58:34.324368+00	2026-08-13 08:58:34.324368+00
\N	login_failed	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	unknown identifier	e603fe46-e42c-4979-9de9-f6a86a4f30dd	2026-08-13 08:58:35.090097+00	2026-08-13 08:58:35.090097+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	login_failed	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	attempt 1	336063c0-ad86-4916-b49f-c593e58fc748	2026-08-13 09:07:29.284879+00	2026-08-13 09:07:29.284879+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	login_success	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	\N	91e35b3f-92a6-4fe1-8819-818f03ebd103	2026-08-13 09:07:40.279177+00	2026-08-13 09:07:40.279177+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	login_success	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	\N	1972e3dc-2198-47fa-9306-7224db6afb6c	2026-08-13 09:07:41.470176+00	2026-08-13 09:07:41.470176+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	login_success	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	\N	ee225930-1b33-4387-977c-f15b0e7219fe	2026-08-13 09:09:36.071641+00	2026-08-13 09:09:36.071641+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	login_success	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	\N	2701e233-0b6c-4a17-bf60-e51602fd556f	2026-08-13 09:14:08.269207+00	2026-08-13 09:14:08.269207+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	login_success	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	\N	7a374224-1b41-48dd-80a7-e3e3fdfe6d7f	2026-08-13 09:27:12.89598+00	2026-08-13 09:27:12.89598+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	login_success	\N	\N	192.168.65.1	curl/8.7.1	\N	092ce39e-3fac-483f-b529-1010def90da8	2026-08-13 09:42:28.712996+00	2026-08-13 09:42:28.712996+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	login_success	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	\N	88a6b9ca-cd62-448f-93ff-09dfbac97b2e	2026-08-13 09:44:02.925552+00	2026-08-13 09:44:02.925552+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	login_success	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	\N	9dfad1ad-e456-4a2c-bf73-a0a84e0eb550	2026-08-13 09:46:38.943369+00	2026-08-13 09:46:38.943369+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_create	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	2c2ea2b8-60e1-452a-bec9-53ce59132dbc	2026-08-13 09:48:24.784905+00	2026-08-13 09:48:24.784905+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	aace3ac0-910a-4d95-9eb2-b69106de8e44	2026-08-13 09:48:27.867075+00	2026-08-13 09:48:27.867075+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	c05bb4b2-ad93-4ec7-b0d5-ad5e806f9bf6	2026-08-13 09:48:28.001106+00	2026-08-13 09:48:28.001106+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	payroll_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	ca0692b7-d8c9-4045-aa0c-56dffb6de32f	2026-08-13 09:48:27.992059+00	2026-08-13 09:48:27.992059+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	ec8177c6-24e0-410e-8bed-424a85e66d1b	2026-08-13 09:48:27.99207+00	2026-08-13 09:48:27.99207+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_update	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	ccf1d5c5-e4a1-4c26-b6d5-f813164c12ea	2026-08-13 09:48:32.526344+00	2026-08-13 09:48:32.526344+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	3e3a32af-275a-4bbb-9459-6c297776da90	2026-08-13 09:48:32.55781+00	2026-08-13 09:48:32.55781+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	3372f6d8-b649-4361-b93b-e4954f9cc269	2026-08-13 09:50:33.040404+00	2026-08-13 09:50:33.040404+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	7d71d635-3727-426b-b927-b28ec5b97039	2026-08-13 09:50:36.034173+00	2026-08-13 09:50:36.034173+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	payroll_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	16f88a66-afed-4012-abe6-a7fabb048bfa	2026-08-13 09:50:39.03419+00	2026-08-13 09:50:39.03419+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	email_change	\N	\N	\N	\N	admin@enterprise-hrms.com -> admin@enterprise-hrms.com	e237e175-d1e5-4e7b-ac5e-c5e36fcb02f4	2026-08-13 09:53:00.600135+00	2026-08-13 09:53:00.600135+00
40fafcbb-c647-4fb2-8620-248c9cf74c0f	login_failed	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	attempt 1	720db989-1af2-4299-8c3b-bbf79dfaae8c	2026-08-13 09:53:17.805221+00	2026-08-13 09:53:17.805221+00
40fafcbb-c647-4fb2-8620-248c9cf74c0f	login_failed	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	attempt 2	549e2464-fe6d-4172-a9c1-7de0fb63dd14	2026-08-13 09:53:19.857288+00	2026-08-13 09:53:19.857288+00
40fafcbb-c647-4fb2-8620-248c9cf74c0f	login_failed	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	attempt 3	a55c90b0-c4dd-40dd-8c3d-6ecdd87b9cfb	2026-08-13 09:53:32.628616+00	2026-08-13 09:53:32.628616+00
40fafcbb-c647-4fb2-8620-248c9cf74c0f	login_failed	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	attempt 4	1a4fd899-2ba5-47f7-bf05-90186cd5826f	2026-08-13 09:53:34.280293+00	2026-08-13 09:53:34.280293+00
40fafcbb-c647-4fb2-8620-248c9cf74c0f	login_failed	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	attempt 5	bd90c34d-f9f8-4373-8dc8-82cee930fa2e	2026-08-13 09:53:35.055319+00	2026-08-13 09:53:35.055319+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	login_success	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	\N	49e0ec07-508f-456c-bcb9-b1c3b74a1356	2026-08-13 09:56:29.599115+00	2026-08-13 09:56:29.599115+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	e6f1ae57-f353-4b03-ba6e-d4086f36893f	2026-08-13 09:56:37.155624+00	2026-08-13 09:56:37.155624+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	aff6db1a-0647-4b0c-8a26-2bc6119e21c9	2026-08-13 09:56:38.440222+00	2026-08-13 09:56:38.440222+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	payroll_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	1d9af91b-3f3b-45b5-b250-6554f73cbfbf	2026-08-13 09:56:42.160142+00	2026-08-13 09:56:42.160142+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	7e61a10c-bce4-4e58-b81c-7525da04f78a	2026-08-13 09:56:58.632317+00	2026-08-13 09:56:58.632317+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	login_success	\N	\N	192.168.65.1	curl/8.7.1	\N	0d1668f5-9885-4ce2-b451-cccdc0e54db8	2026-08-13 10:38:38.644302+00	2026-08-13 10:38:38.644302+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	login_success	\N	\N	172.20.0.5	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	\N	84407d4d-5a75-439b-81b4-c260711305dc	2026-08-13 10:40:03.260125+00	2026-08-13 10:40:03.260125+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	684a4bca-2ecf-4e7f-b8f4-6a4f01058157	2026-08-13 10:40:21.496897+00	2026-08-13 10:40:21.496897+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	217caf4f-c50e-4a59-bcbd-925505776c9c	2026-08-13 10:40:21.497667+00	2026-08-13 10:40:21.497667+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	75693bfa-dddd-4c3d-84d5-3bc3fc6d771e	2026-08-13 10:40:21.602635+00	2026-08-13 10:40:21.602635+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	payroll_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	6441c585-f327-4698-9d9c-02a651923432	2026-08-13 10:40:21.584013+00	2026-08-13 10:40:21.584013+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_update	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	f1f4e8e9-5575-49c8-9069-ccaf7abb6484	2026-08-13 10:40:25.449666+00	2026-08-13 10:40:25.449666+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	65f4e882-1708-46fb-bc58-9e06638dac8d	2026-08-13 10:40:25.489145+00	2026-08-13 10:40:25.489145+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	payroll_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	d9bf8ec1-5191-41d7-bdcc-4bdfc3a0ca8f	2026-08-13 10:41:52.879779+00	2026-08-13 10:41:52.879779+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	6a1e4d08-ac98-4fef-a4aa-5723cf0b6d71	2026-08-13 10:41:52.880351+00	2026-08-13 10:41:52.880351+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	fdc51f8b-19d5-4067-8309-b5975e13a606	2026-08-13 10:41:52.880409+00	2026-08-13 10:41:52.880409+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	089fa1c8-befe-46ce-acb6-8dda82fd5479	2026-08-13 10:41:52.912291+00	2026-08-13 10:41:52.912291+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	abee9cae-f23b-4b7a-888f-b0653dcba526	2026-08-13 10:42:02.311329+00	2026-08-13 10:42:02.311329+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	1436520d-0e90-4e59-aea0-d777d90dc6c3	2026-08-13 10:42:03.967356+00	2026-08-13 10:42:03.967356+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	payroll_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	185d92c3-2f3b-4558-a44a-9ae7fc35e965	2026-08-13 10:42:08.572452+00	2026-08-13 10:42:08.572452+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	f816afa6-50ca-42cc-a4a6-6e038b61bd9e	\N	\N	\N	6a98bf28-f238-464a-b539-26791abf5609	2026-08-13 10:43:02.308602+00	2026-08-13 10:43:02.308602+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	b5ddc1a8-6dd6-4632-9b8f-ace224db7167	\N	\N	\N	32b84b5c-e7ad-418d-a864-4f2880387510	2026-08-13 10:43:19.11798+00	2026-08-13 10:43:19.11798+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	payroll_view	employee	9297a76d-5dc3-4b63-9b0a-b941c7e1e79a	\N	\N	\N	0592ecb3-172c-4286-b7f5-f066af26944a	2026-08-13 10:43:30.089551+00	2026-08-13 10:43:30.089551+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	aaab6af2-a9cb-4995-b659-edb1d498378f	2026-08-13 10:43:42.493256+00	2026-08-13 10:43:42.493256+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	54fd2d86-2854-485b-8648-8fb84e8d0d74	\N	\N	\N	0bb8aa69-c795-49ef-83b2-70d2d6ce304f	2026-08-13 10:43:46.958329+00	2026-08-13 10:43:46.958329+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_bulk_import	employee	bulk	\N	\N	created=8 updated=0 skipped=0	4e9ddd2c-e0c6-4555-b826-ebec32f220bb	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	f816afa6-50ca-42cc-a4a6-6e038b61bd9e	\N	\N	\N	9fb156fa-2b01-4f88-a26b-46c9f95cee54	2026-08-13 10:43:02.326051+00	2026-08-13 10:43:02.326051+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	9297a76d-5dc3-4b63-9b0a-b941c7e1e79a	\N	\N	\N	1d7a6b44-0be8-4d3a-8de6-2b9627692124	2026-08-13 10:43:30.088922+00	2026-08-13 10:43:30.088922+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	3d0b808b-0b1f-4cf0-b03b-2e71a0ffc1e6	2026-08-13 10:43:42.463542+00	2026-08-13 10:43:42.463542+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	payroll_view	employee	f816afa6-50ca-42cc-a4a6-6e038b61bd9e	\N	\N	\N	7e830fc7-cfaf-4c30-a7fa-e093e7cd2f4a	2026-08-13 10:43:02.325756+00	2026-08-13 10:43:02.325756+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_update	employee	f816afa6-50ca-42cc-a4a6-6e038b61bd9e	\N	\N	\N	b210a824-33d1-41bf-89e6-d327075b1e4f	2026-08-13 10:43:12.564678+00	2026-08-13 10:43:12.564678+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	b5ddc1a8-6dd6-4632-9b8f-ace224db7167	\N	\N	\N	7e680849-8f2b-4e5d-b9c8-aa38132c6723	2026-08-13 10:43:19.097579+00	2026-08-13 10:43:19.097579+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	9297a76d-5dc3-4b63-9b0a-b941c7e1e79a	\N	\N	\N	17e3c49c-9486-43ab-b026-5ea5300ccf6b	2026-08-13 10:43:30.10619+00	2026-08-13 10:43:30.10619+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	54fd2d86-2854-485b-8648-8fb84e8d0d74	\N	\N	\N	862f1f71-62ae-4274-bdef-69e6c1af0140	2026-08-13 10:43:46.937215+00	2026-08-13 10:43:46.937215+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	f816afa6-50ca-42cc-a4a6-6e038b61bd9e	\N	\N	\N	cc263c1b-79c6-4baf-93f6-b9daa36445d6	2026-08-13 10:43:02.351472+00	2026-08-13 10:43:02.351472+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	9297a76d-5dc3-4b63-9b0a-b941c7e1e79a	\N	\N	\N	9243382d-739b-4014-b587-b9a7e31d01f6	2026-08-13 10:43:30.088471+00	2026-08-13 10:43:30.088471+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	payroll_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	0f577d09-fca3-42bc-8dc9-93d9db7bf84e	2026-08-13 10:43:42.46378+00	2026-08-13 10:43:42.46378+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	f816afa6-50ca-42cc-a4a6-6e038b61bd9e	\N	\N	\N	9588a2a8-7fe4-4740-86b7-7472f94be8c9	2026-08-13 10:43:12.581206+00	2026-08-13 10:43:12.581206+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	payroll_view	employee	b5ddc1a8-6dd6-4632-9b8f-ace224db7167	\N	\N	\N	1091ba76-57ab-43c3-b46e-75be01a5e34c	2026-08-13 10:43:19.097792+00	2026-08-13 10:43:19.097792+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	payroll_view	employee	54fd2d86-2854-485b-8648-8fb84e8d0d74	\N	\N	\N	357c804a-af59-4429-b49b-efd7588f5309	2026-08-13 10:43:46.937665+00	2026-08-13 10:43:46.937665+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	b5ddc1a8-6dd6-4632-9b8f-ace224db7167	\N	\N	\N	91a4da2c-1c78-4881-bf47-682fa93f1d96	2026-08-13 10:43:19.097377+00	2026-08-13 10:43:19.097377+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	7fa37afc-4eee-4dce-a5dd-88656df922eb	2026-08-13 10:43:42.464734+00	2026-08-13 10:43:42.464734+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	54fd2d86-2854-485b-8648-8fb84e8d0d74	\N	\N	\N	5242b7bc-995f-4220-b9da-e3a3c99138f3	2026-08-13 10:43:46.938399+00	2026-08-13 10:43:46.938399+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_update	employee	54fd2d86-2854-485b-8648-8fb84e8d0d74	\N	\N	\N	dd0075c9-1a94-4b47-b792-29a92b990952	2026-08-13 10:44:03.733774+00	2026-08-13 10:44:03.733774+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	54fd2d86-2854-485b-8648-8fb84e8d0d74	\N	\N	\N	888765be-385c-4a6b-9c67-f676a8649b4b	2026-08-13 10:44:03.753892+00	2026-08-13 10:44:03.753892+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	c6ebf6e0-87ae-4667-919b-6b61866fde42	2026-08-13 10:44:11.843414+00	2026-08-13 10:44:11.843414+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	b5ddc1a8-6dd6-4632-9b8f-ace224db7167	\N	\N	\N	cd96a2bf-930c-4c74-b899-6e55c7c5356f	2026-08-13 10:44:15.899928+00	2026-08-13 10:44:15.899928+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	6073a61c-bb2c-4172-95e3-17db7e000bd0	\N	\N	\N	16c01014-696d-43c6-98f3-dc88e833e95e	2026-08-13 10:44:17.700979+00	2026-08-13 10:44:17.700979+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	employee_view_full	employee	f816afa6-50ca-42cc-a4a6-6e038b61bd9e	\N	\N	\N	e03f886e-93df-4354-af78-976ba0534c2d	2026-08-13 10:45:24.639826+00	2026-08-13 10:45:24.639826+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	payroll_view	employee	f816afa6-50ca-42cc-a4a6-6e038b61bd9e	\N	\N	\N	76ad3082-e065-4dae-b12e-c3a33685fa22	2026-08-13 10:45:24.647063+00	2026-08-13 10:45:24.647063+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	insurance_view	employee	f816afa6-50ca-42cc-a4a6-6e038b61bd9e	\N	\N	\N	bf929d7c-9662-48d4-a18b-f16b817366c3	2026-08-13 10:45:24.646253+00	2026-08-13 10:45:24.646253+00
d8ec354d-b123-47a3-9bcb-baa037f6ce9a	documents_list	employee	f816afa6-50ca-42cc-a4a6-6e038b61bd9e	\N	\N	\N	5e27f9fe-ad83-43dd-85fc-30aff884d6b5	2026-08-13 10:45:24.669729+00	2026-08-13 10:45:24.669729+00
\.


--
-- Data for Name: bgv_checks; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.bgv_checks (employee_id, check_type, status, notes, updated_by, cleared_at, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.candidates (job_opening_id, full_name, email, phone, resume_file_name, resume_file_path, resume_mime_type, resume_file_size, stage, notes, converted_employee_id, created_by, id, created_at, updated_at, notice_period_days) FROM stdin;
\.


--
-- Data for Name: company_events; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.company_events (title, event_date, category, created_by, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dependents; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.dependents (insurance_policy_id, full_name, relationship, date_of_birth, card_id, verified, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.documents (employee_id, document_type, file_name, file_path, mime_type, file_size_bytes, status, uploaded_by, verified_by, verified_at, notes, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.employees (user_id, full_name, photo_url, department, designation, employment_type, date_of_joining, date_of_birth, gender, personal_address, blood_group, emergency_contact, personal_email, selection_status, status, reporting_manager_id, id, created_at, updated_at, notice_period_days, conversion_status, separation_date, separation_reason, offboard_reason, offboarded_at, mobile_number, bank_account_number, bank_ifsc, bank_name, pf_number) FROM stdin;
40fafcbb-c647-4fb2-8620-248c9cf74c0f	Ayush Gupta	\N	Tech	Manager	FULL_TIME	\N	\N	\N	\N	\N	\N	\N	JOINED	ACTIVE	\N	6073a61c-bb2c-4172-95e3-17db7e000bd0	2026-08-13 09:48:24.784905+00	2026-08-13 09:48:24.784905+00	\N	NOT_APPLICABLE	\N	\N	\N	\N	\N	\N	\N	\N	\N
cba2d508-193f-4f8e-aa2a-9ac39a0163e0	Aarav Sharma	\N	\N	Software Engineer	FULL_TIME	2025-01-15	\N	Male	\N	\N	\N	aarav.test@example.com	JOINED	ACTIVE	\N	f816afa6-50ca-42cc-a4a6-6e038b61bd9e	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00	\N	NOT_APPLICABLE	\N	\N	\N	\N	9876543210	TEST10000001	TEST0000001	Test National Bank	PFTEST001
3c706159-bfdc-4fd4-87dd-b94a7ec91264	Priya Mehta	\N	\N	HR Manager	FULL_TIME	2024-08-01	\N	Female	\N	\N	\N	priya.test@example.com	JOINED	ACTIVE	\N	2275046a-3925-49e6-8ae1-1710c67c681e	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00	\N	NOT_APPLICABLE	\N	\N	\N	\N	9876543211	TEST10000002	TEST0000002	Test National Bank	PFTEST002
4e87d89b-07f1-4919-9a87-0b29fdf3d18c	Rohan Verma	\N	\N	Frontend Developer	INTERN	2026-01-10	\N	Male	\N	\N	\N	rohan.test@example.com	JOINED	ACTIVE	\N	33d555b6-f4a8-44ab-aa28-020089dadf3c	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00	\N	NOT_APPLICABLE	\N	\N	\N	\N	9876543212	TEST10000003	TEST0000003	Test National Bank	\N
724a796b-c965-4587-92a3-5b88a39694a0	Neha Kapoor	\N	\N	Financial Analyst	FULL_TIME	2025-06-20	\N	Female	\N	\N	\N	neha.test@example.com	JOINED	ACTIVE	\N	b5ddc1a8-6dd6-4632-9b8f-ace224db7167	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00	\N	NOT_APPLICABLE	\N	\N	\N	\N	9876543213	TEST10000004	TEST0000004	Test National Bank	PFTEST004
a8c2a7ab-2ec8-42bf-906e-621fe7e37154	Kabir Singh	\N	\N	Backend Developer	FULL_TIME	2023-11-13	\N	Male	\N	\N	\N	kabir.test@example.com	JOINED	ACTIVE	\N	54fd2d86-2854-485b-8648-8fb84e8d0d74	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00	\N	NOT_APPLICABLE	\N	\N	\N	\N	9876543214	TEST10000005	TEST0000005	Test National Bank	PFTEST005
8026046b-3adb-4d75-b34a-422cee02d52d	Ishita Rao	\N	\N	Operations Executive	CONTRACT	2025-09-01	\N	Female	\N	\N	\N	ishita.test@example.com	JOINED	ACTIVE	\N	a858cd12-dc38-4282-af44-74912deb2d48	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00	\N	NOT_APPLICABLE	\N	\N	\N	\N	9876543215	TEST10000006	TEST0000006	Test National Bank	\N
52d5bf73-deb1-40f7-a04b-cf05206b6f2a	Vikram Malhotra	\N	\N	Sales Executive	FULL_TIME	2024-04-08	\N	Male	\N	\N	\N	vikram.test@example.com	JOINED	ACTIVE	\N	7751c711-d7bf-45e2-9ce9-3a906b00c48c	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00	\N	NOT_APPLICABLE	\N	\N	\N	\N	9876543216	TEST10000007	TEST0000007	Test National Bank	PFTEST007
d58ac78d-a023-4b46-ae13-f7b946e99bbc	Ananya Iyer	\N	\N	QA Engineer	FULL_TIME	2026-02-16	\N	Female	\N	\N	\N	ananya.test@example.com	JOINED	ACTIVE	\N	9297a76d-5dc3-4b63-9b0a-b941c7e1e79a	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00	\N	NOT_APPLICABLE	\N	\N	\N	\N	9876543217	TEST10000008	TEST0000008	Test National Bank	PFTEST008
\.


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.holidays (name, date, is_optional, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: insurance_policies; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.insurance_policies (employee_id, policy_number, insurer_name, plan_type, sum_insured, premium_employer_paid, premium_employee_contribution, valid_from, valid_to, benefits, created_by, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: job_openings; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.job_openings (title, department, positions_count, status, created_by, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.leave_requests (employee_id, leave_type_id, start_date, end_date, reason, status, reviewed_by, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.leave_types (name, annual_quota_days, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payroll_records; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.payroll_records (employee_id, month, basic_pay, allowances, deductions, net_pay, status, processed_by, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: performance_reviews; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.performance_reviews (review_cycle_id, employee_id, self_assessment, manager_assessment, rating, status, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: policies; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.policies (title, category, version, is_current, file_name, file_path, mime_type, file_size_bytes, uploaded_by, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: policy_acknowledgements; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.policy_acknowledgements (policy_id, user_id, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.refresh_tokens (user_id, token_hash, expires_at, revoked, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: review_cycles; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.review_cycles (name, start_date, end_date, status, created_by, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: hrms_user
--

COPY public.users (official_email, employee_id, hashed_password, role, is_active, mfa_enabled, mfa_secret, failed_login_attempts, locked_until, last_login_at, id, created_at, updated_at) FROM stdin;
admin@enterprise-hrms.local	\N	$2b$12$KykIMbIHh4bH.lorVmT/A.Q5s2DTZ3ACeXu4JgZUXDDJDyxxM2Xji	SYSTEM_ADMIN	t	f	\N	0	\N	\N	1e469563-6e34-4ce5-bdec-ab7b3f7f950e	2026-08-13 09:09:13.647579+00	2026-08-13 09:09:13.647579+00
ayushgupt27@gmail.com	kwwg@gmail.com	$2b$12$18gl7Ij6kNjTfE5mwJAR/eS6L80bROSqmNdaHt4Lt0iWOtPGUxMOu	EMPLOYEE	t	f	\N	5	2026-08-13 10:08:35.3998+00	\N	40fafcbb-c647-4fb2-8620-248c9cf74c0f	2026-08-13 09:48:24.784905+00	2026-08-13 09:53:35.055319+00
admin@enterprise-hrms.com	\N	$2b$12$8bJG7imgPnPEFVRur9w7husA32qthMjEOmeqxmWqyFlGEhZEtDxsK	SYSTEM_ADMIN	t	f	\N	0	\N	2026-08-13 10:40:03.596161+00	d8ec354d-b123-47a3-9bcb-baa037f6ce9a	2026-08-13 08:57:37.408169+00	2026-08-13 10:40:03.260125+00
aarav.sharma@enterprise-hrms.com	\N	$2b$12$QhPlnP2N0QlEc3JM256ERuG.FoTK3Ci8eroC9jebqf2wEE1B8a32m	EMPLOYEE	t	f	\N	0	\N	\N	cba2d508-193f-4f8e-aa2a-9ac39a0163e0	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00
priya.mehta@enterprise-hrms.com	\N	$2b$12$w5YJRKsKp69cO8.w7QJ7juYw7Y6ovxnWu4JRQfBom6.vLaGlOs0G2	EMPLOYEE	t	f	\N	0	\N	\N	3c706159-bfdc-4fd4-87dd-b94a7ec91264	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00
rohan.verma@enterprise-hrms.com	\N	$2b$12$RJ4uyUsvsXXZYvWTa6zNFORmAcqFPXgPStZhQ0VTrimKEE.bIp.qu	EMPLOYEE	t	f	\N	0	\N	\N	4e87d89b-07f1-4919-9a87-0b29fdf3d18c	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00
neha.kapoor@enterprise-hrms.com	\N	$2b$12$gFtujpz5kkP07WTdxoq45OGYOgpxtJX8wQRhn/ELbsutaR8P9S7/6	EMPLOYEE	t	f	\N	0	\N	\N	724a796b-c965-4587-92a3-5b88a39694a0	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00
kabir.singh@enterprise-hrms.com	\N	$2b$12$dj/84eiy8l/a0kK5ijk.Su1uigWK9j4g6Mk.NmP0y37lT4C5FK3MW	EMPLOYEE	t	f	\N	0	\N	\N	a8c2a7ab-2ec8-42bf-906e-621fe7e37154	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00
ishita.rao@enterprise-hrms.com	\N	$2b$12$6syT.ZLLM2jGIRJzfEscsOIAuObW8wfM/Jzy3fe/L2bTIL.DghopG	EMPLOYEE	t	f	\N	0	\N	\N	8026046b-3adb-4d75-b34a-422cee02d52d	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00
vikram.malhotra@enterprise-hrms.com	\N	$2b$12$I37jscEFya/siPcBI526vOEF4RZt4WGqwb9KxUKXSjSQc6119dcey	EMPLOYEE	t	f	\N	0	\N	\N	52d5bf73-deb1-40f7-a04b-cf05206b6f2a	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00
ananya.iyer@enterprise-hrms.com	\N	$2b$12$F8cpW3WXAXHsJtauAMrqJ.Nj6q.YjuOsYr.JW.hIvGNdAmFg01FAK	EMPLOYEE	t	f	\N	0	\N	\N	d58ac78d-a023-4b46-ae13-f7b946e99bbc	2026-08-13 10:42:54.407231+00	2026-08-13 10:42:54.407231+00
\.


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: attendance_records attendance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bgv_checks bgv_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.bgv_checks
    ADD CONSTRAINT bgv_checks_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: company_events company_events_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.company_events
    ADD CONSTRAINT company_events_pkey PRIMARY KEY (id);


--
-- Name: dependents dependents_card_id_key; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.dependents
    ADD CONSTRAINT dependents_card_id_key UNIQUE (card_id);


--
-- Name: dependents dependents_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.dependents
    ADD CONSTRAINT dependents_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employees employees_user_id_key; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_key UNIQUE (user_id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: insurance_policies insurance_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.insurance_policies
    ADD CONSTRAINT insurance_policies_pkey PRIMARY KEY (id);


--
-- Name: insurance_policies insurance_policies_policy_number_key; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.insurance_policies
    ADD CONSTRAINT insurance_policies_policy_number_key UNIQUE (policy_number);


--
-- Name: job_openings job_openings_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_name_key; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_name_key UNIQUE (name);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: payroll_records payroll_records_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT payroll_records_pkey PRIMARY KEY (id);


--
-- Name: performance_reviews performance_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT performance_reviews_pkey PRIMARY KEY (id);


--
-- Name: policies policies_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_pkey PRIMARY KEY (id);


--
-- Name: policy_acknowledgements policy_acknowledgements_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.policy_acknowledgements
    ADD CONSTRAINT policy_acknowledgements_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: review_cycles review_cycles_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.review_cycles
    ADD CONSTRAINT review_cycles_pkey PRIMARY KEY (id);


--
-- Name: performance_reviews uq_cycle_employee_review; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT uq_cycle_employee_review UNIQUE (review_cycle_id, employee_id);


--
-- Name: attendance_records uq_employee_date_attendance; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT uq_employee_date_attendance UNIQUE (employee_id, date);


--
-- Name: payroll_records uq_employee_month_payroll; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT uq_employee_month_payroll UNIQUE (employee_id, month);


--
-- Name: policy_acknowledgements uq_policy_user_ack; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.policy_acknowledgements
    ADD CONSTRAINT uq_policy_user_ack UNIQUE (policy_id, user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_assets_employee_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_assets_employee_id ON public.assets USING btree (employee_id);


--
-- Name: ix_attendance_records_employee_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_attendance_records_employee_id ON public.attendance_records USING btree (employee_id);


--
-- Name: ix_audit_logs_user_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: ix_bgv_checks_employee_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_bgv_checks_employee_id ON public.bgv_checks USING btree (employee_id);


--
-- Name: ix_candidates_job_opening_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_candidates_job_opening_id ON public.candidates USING btree (job_opening_id);


--
-- Name: ix_dependents_insurance_policy_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_dependents_insurance_policy_id ON public.dependents USING btree (insurance_policy_id);


--
-- Name: ix_documents_employee_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_documents_employee_id ON public.documents USING btree (employee_id);


--
-- Name: ix_holidays_date; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_holidays_date ON public.holidays USING btree (date);


--
-- Name: ix_insurance_policies_employee_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE UNIQUE INDEX ix_insurance_policies_employee_id ON public.insurance_policies USING btree (employee_id);


--
-- Name: ix_leave_requests_employee_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_leave_requests_employee_id ON public.leave_requests USING btree (employee_id);


--
-- Name: ix_payroll_records_employee_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_payroll_records_employee_id ON public.payroll_records USING btree (employee_id);


--
-- Name: ix_performance_reviews_employee_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_performance_reviews_employee_id ON public.performance_reviews USING btree (employee_id);


--
-- Name: ix_performance_reviews_review_cycle_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_performance_reviews_review_cycle_id ON public.performance_reviews USING btree (review_cycle_id);


--
-- Name: ix_policies_title; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_policies_title ON public.policies USING btree (title);


--
-- Name: ix_policy_acknowledgements_policy_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_policy_acknowledgements_policy_id ON public.policy_acknowledgements USING btree (policy_id);


--
-- Name: ix_policy_acknowledgements_user_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_policy_acknowledgements_user_id ON public.policy_acknowledgements USING btree (user_id);


--
-- Name: ix_refresh_tokens_token_hash; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE UNIQUE INDEX ix_refresh_tokens_token_hash ON public.refresh_tokens USING btree (token_hash);


--
-- Name: ix_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE INDEX ix_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- Name: ix_users_employee_id; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE UNIQUE INDEX ix_users_employee_id ON public.users USING btree (employee_id);


--
-- Name: ix_users_official_email; Type: INDEX; Schema: public; Owner: hrms_user
--

CREATE UNIQUE INDEX ix_users_official_email ON public.users USING btree (official_email);


--
-- Name: assets assets_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: attendance_records attendance_records_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: attendance_records attendance_records_marked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id);


--
-- Name: bgv_checks bgv_checks_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.bgv_checks
    ADD CONSTRAINT bgv_checks_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: bgv_checks bgv_checks_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.bgv_checks
    ADD CONSTRAINT bgv_checks_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: candidates candidates_converted_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_converted_employee_id_fkey FOREIGN KEY (converted_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: candidates candidates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: candidates candidates_job_opening_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_job_opening_id_fkey FOREIGN KEY (job_opening_id) REFERENCES public.job_openings(id) ON DELETE CASCADE;


--
-- Name: company_events company_events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.company_events
    ADD CONSTRAINT company_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: dependents dependents_insurance_policy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.dependents
    ADD CONSTRAINT dependents_insurance_policy_id_fkey FOREIGN KEY (insurance_policy_id) REFERENCES public.insurance_policies(id) ON DELETE CASCADE;


--
-- Name: documents documents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: documents documents_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: employees employees_reporting_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_reporting_manager_id_fkey FOREIGN KEY (reporting_manager_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: insurance_policies insurance_policies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.insurance_policies
    ADD CONSTRAINT insurance_policies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: insurance_policies insurance_policies_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.insurance_policies
    ADD CONSTRAINT insurance_policies_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: job_openings job_openings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: leave_requests leave_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id);


--
-- Name: leave_requests leave_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: payroll_records payroll_records_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT payroll_records_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: payroll_records payroll_records_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT payroll_records_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: performance_reviews performance_reviews_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT performance_reviews_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: performance_reviews performance_reviews_review_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT performance_reviews_review_cycle_id_fkey FOREIGN KEY (review_cycle_id) REFERENCES public.review_cycles(id) ON DELETE CASCADE;


--
-- Name: policies policies_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: policy_acknowledgements policy_acknowledgements_policy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.policy_acknowledgements
    ADD CONSTRAINT policy_acknowledgements_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES public.policies(id) ON DELETE CASCADE;


--
-- Name: policy_acknowledgements policy_acknowledgements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.policy_acknowledgements
    ADD CONSTRAINT policy_acknowledgements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: review_cycles review_cycles_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hrms_user
--

ALTER TABLE ONLY public.review_cycles
    ADD CONSTRAINT review_cycles_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict C6p7YkE4kQNCNfhXMrcXzCo127gqetpHTHh11Scy6jXrw9eog52VYL7t7YQfysH

