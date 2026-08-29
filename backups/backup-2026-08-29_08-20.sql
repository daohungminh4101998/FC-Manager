--
-- PostgreSQL database dump
--

\restrict PFULXI4ENZAoF5XeH6BvpIAJoxtcfzzeDaM0exDMTjolT2ljsMT9FPjjgrmxPwT

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.11 (Ubuntu 17.11-1.pgdg24.04+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.match_performances DROP CONSTRAINT IF EXISTS match_performances_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_performances DROP CONSTRAINT IF EXISTS match_performances_match_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_defenders DROP CONSTRAINT IF EXISTS match_defenders_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_defenders DROP CONSTRAINT IF EXISTS match_defenders_match_id_fkey;
ALTER TABLE IF EXISTS ONLY public.login DROP CONSTRAINT IF EXISTS login_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.goalkeeper_stats DROP CONSTRAINT IF EXISTS goalkeeper_stats_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.goalkeeper_stats DROP CONSTRAINT IF EXISTS goalkeeper_stats_match_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contribution_transactions DROP CONSTRAINT IF EXISTS contribution_transactions_contribution_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contribution_players DROP CONSTRAINT IF EXISTS contribution_players_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contribution_players DROP CONSTRAINT IF EXISTS contribution_players_contribution_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_records DROP CONSTRAINT IF EXISTS attendance_records_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_records DROP CONSTRAINT IF EXISTS attendance_records_match_id_fkey;
DROP INDEX IF EXISTS public.login_single_admin;
DROP INDEX IF EXISTS public.login_player_id_unique;
DROP INDEX IF EXISTS public.idx_matches_match_date;
DROP INDEX IF EXISTS public.idx_match_performances_player;
DROP INDEX IF EXISTS public.idx_match_defenders_player;
DROP INDEX IF EXISTS public.idx_goalkeeper_stats_player;
DROP INDEX IF EXISTS public.idx_contribution_transactions_contribution_id;
DROP INDEX IF EXISTS public.idx_contribution_players_player_id;
DROP INDEX IF EXISTS public.idx_contribution_players_contribution_id;
ALTER TABLE IF EXISTS ONLY public.players DROP CONSTRAINT IF EXISTS players_pkey;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS matches_pkey;
ALTER TABLE IF EXISTS ONLY public.match_performances DROP CONSTRAINT IF EXISTS match_performances_unique;
ALTER TABLE IF EXISTS ONLY public.match_performances DROP CONSTRAINT IF EXISTS match_performances_pkey;
ALTER TABLE IF EXISTS ONLY public.match_defenders DROP CONSTRAINT IF EXISTS match_defenders_unique;
ALTER TABLE IF EXISTS ONLY public.match_defenders DROP CONSTRAINT IF EXISTS match_defenders_pkey;
ALTER TABLE IF EXISTS ONLY public.login DROP CONSTRAINT IF EXISTS login_username_key;
ALTER TABLE IF EXISTS ONLY public.login DROP CONSTRAINT IF EXISTS login_pkey;
ALTER TABLE IF EXISTS ONLY public.goalkeeper_stats DROP CONSTRAINT IF EXISTS goalkeeper_stats_unique;
ALTER TABLE IF EXISTS ONLY public.goalkeeper_stats DROP CONSTRAINT IF EXISTS goalkeeper_stats_pkey;
ALTER TABLE IF EXISTS ONLY public.contributions DROP CONSTRAINT IF EXISTS contributions_pkey;
ALTER TABLE IF EXISTS ONLY public.contribution_transactions DROP CONSTRAINT IF EXISTS contribution_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.contribution_players DROP CONSTRAINT IF EXISTS contribution_players_pkey;
ALTER TABLE IF EXISTS ONLY public.contribution_players DROP CONSTRAINT IF EXISTS contribution_players_contribution_id_player_id_key;
ALTER TABLE IF EXISTS ONLY public.attendance_records DROP CONSTRAINT IF EXISTS attendance_records_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance_records DROP CONSTRAINT IF EXISTS attendance_records_match_id_player_id_key;
DROP TABLE IF EXISTS public.players;
DROP TABLE IF EXISTS public.matches;
DROP TABLE IF EXISTS public.match_performances;
DROP TABLE IF EXISTS public.match_defenders;
DROP TABLE IF EXISTS public.login;
DROP TABLE IF EXISTS public.goalkeeper_stats;
DROP TABLE IF EXISTS public.contributions;
DROP TABLE IF EXISTS public.contribution_transactions;
DROP TABLE IF EXISTS public.contribution_players;
DROP TABLE IF EXISTS public.attendance_records;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.match_result;
DROP TYPE IF EXISTS public.contribution_payment_status;
DROP SCHEMA IF EXISTS public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: contribution_payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contribution_payment_status AS ENUM (
    'unpaid',
    'partial',
    'paid',
    'exempt'
);


--
-- Name: match_result; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.match_result AS ENUM (
    'Win',
    'Draw',
    'Loss'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'Admin',
    'User',
    'Player'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid NOT NULL,
    player_id uuid NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT attendance_records_status_check CHECK (((status)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying])::text[])))
);


--
-- Name: contribution_players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contribution_players (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contribution_id uuid NOT NULL,
    player_id uuid NOT NULL,
    amount_due numeric DEFAULT 0 NOT NULL,
    amount_paid numeric DEFAULT 0 NOT NULL,
    status public.contribution_payment_status DEFAULT 'unpaid'::public.contribution_payment_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contribution_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contribution_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contribution_id uuid NOT NULL,
    amount numeric NOT NULL,
    method text NOT NULL,
    paid_at timestamp with time zone NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contributions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contributions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    default_amount numeric NOT NULL,
    due_date date,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: goalkeeper_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goalkeeper_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid NOT NULL,
    player_id uuid NOT NULL,
    goals_conceded integer DEFAULT 0 NOT NULL,
    matches_played numeric(3,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT goalkeeper_stats_goals_conceded_check CHECK ((goals_conceded >= 0)),
    CONSTRAINT goalkeeper_stats_matches_played_check CHECK (((matches_played > (0)::numeric) AND (matches_played <= (1)::numeric)))
);


--
-- Name: login; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.login (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(100) NOT NULL,
    password_hash text NOT NULL,
    role public.user_role DEFAULT 'User'::public.user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    player_id uuid,
    CONSTRAINT login_player_role_consistency CHECK ((((role = 'Player'::public.user_role) AND (player_id IS NOT NULL)) OR ((role <> 'Player'::public.user_role) AND (player_id IS NULL))))
);


--
-- Name: match_defenders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_defenders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid NOT NULL,
    player_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: match_performances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_performances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid NOT NULL,
    player_id uuid NOT NULL,
    goals integer DEFAULT 0 NOT NULL,
    assists integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT match_performances_assists_check CHECK ((assists >= 0)),
    CONSTRAINT match_performances_goals_check CHECK ((goals >= 0))
);


--
-- Name: matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    opponent character varying(255) NOT NULL,
    match_date date NOT NULL,
    venue character varying(255) NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    result public.match_result,
    location_url text,
    highlight_url text
);


--
-- Name: players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.players (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "jerseyNumber" integer NOT NULL,
    "position" text NOT NULL,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true NOT NULL
);


--
-- Data for Name: attendance_records; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.attendance_records VALUES ('8d721fd0-33cc-4957-980f-22a8b95a18f2', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'absent', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('2ad8299e-e4bb-46a2-a23f-980fc1c589c4', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '752d264e-9403-48df-836a-30666ccd9485', 'absent', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('c74d2938-4fee-4c91-b2e6-d9b70a745b20', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'present', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('c7588fe6-1cb6-467e-b8d7-36972579e7a7', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('312a6e7f-b04c-4231-a595-94b2a9492584', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('c2e9f1fa-dc48-4137-bb83-bd8b9a7e0674', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'present', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('59fb6bbb-69d9-4d3f-a9ce-56f272da81af', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'present', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('7e07b0d0-5772-4e17-abf2-64386a04f368', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '5f9468b3-388f-4e05-81af-c4f078a91270', 'present', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('9629ed7a-29a5-4d1b-973b-956009f7093b', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'present', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('0da39649-178d-4a9e-8c02-b20befff042c', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'absent', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('a68258e8-8442-490a-88be-14ce68bd64e4', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('bf530138-874f-4ed0-9e5c-93a9b5495afa', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('a4758367-754d-498f-8cb4-8ed08b233160', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('ec30b362-957e-4a92-be75-7f0bb1c82285', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('dd7c3351-1ed2-4035-b31b-bd3279837637', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 11:02:31.064532+00');
INSERT INTO public.attendance_records VALUES ('4b1a75f7-777f-43f7-84e8-e79ffefc2ad8', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'absent', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('9f985e67-932b-40be-b03a-03a136489b82', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '752d264e-9403-48df-836a-30666ccd9485', 'present', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('4978de1c-7bd8-4c94-918d-b37299084e56', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'present', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('f7307515-7c1e-4487-9986-8c24689600a2', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('263d387b-48ed-457d-83e2-750c873176af', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('19272476-3df0-44cc-8edd-da11fe5f6b20', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'present', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('7b107712-295e-4615-80d3-3403ddb95bfc', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('404002d5-9119-482b-94f3-782f46fb2358', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '5f9468b3-388f-4e05-81af-c4f078a91270', 'absent', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('3cea6856-8c59-4167-88ed-2b4bfc3cd6be', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'absent', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('31d7f4cf-d78d-41da-a2bf-a28df5d58a8a', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'present', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('d325a9db-583c-41a0-be1b-e98307d9a5bd', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('fd66c915-047b-44f1-ba03-6a7101ea96db', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('51998208-b7ba-48f3-b23f-e58e11e0ffe4', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('0b48cc2d-b268-472a-94a2-88217b6f7f60', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('3ba9fdfe-7aa6-4db7-80bb-50d2885923e4', 'b96daa18-54e2-48e2-b18f-85793457fcbc', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'absent', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('87ce0a8f-e106-4b0a-be11-0faee588f00f', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '752d264e-9403-48df-836a-30666ccd9485', 'absent', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('8bf39871-cce2-4764-900a-48dc03a7b63d', 'b96daa18-54e2-48e2-b18f-85793457fcbc', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'absent', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('a4a83abb-521f-4def-a391-91f461f4ba70', 'b96daa18-54e2-48e2-b18f-85793457fcbc', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('449393a8-a95c-443f-bce5-5c7f348e072c', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('c09c519e-14fa-4f45-8106-0c711f95a459', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'absent', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('968d9735-3c88-4c31-bb57-2189080c0c05', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('ebd19144-c516-4ac0-a02f-3b7a0c1b0756', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '5f9468b3-388f-4e05-81af-c4f078a91270', 'present', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('ba4c9906-00eb-458d-8341-979eedbf19b1', 'b96daa18-54e2-48e2-b18f-85793457fcbc', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'present', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('575fff6d-6ac0-4103-a9ab-35cf2bf216c8', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'present', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('1ef71d5b-6e11-4ef4-b546-0c903fce5f73', 'b96daa18-54e2-48e2-b18f-85793457fcbc', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'present', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('764f047a-f3ec-4cd0-984b-5a7b53c5eba4', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('603ca74f-dcf0-4c38-822e-31c5870f3d64', 'b96daa18-54e2-48e2-b18f-85793457fcbc', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('f0db5fa9-8631-4e57-ac11-fb1c665bfbf8', 'b96daa18-54e2-48e2-b18f-85793457fcbc', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('00bc6643-aabc-42d8-bf11-34d8d5aa8e75', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 10:44:59.4463+00');
INSERT INTO public.attendance_records VALUES ('723e0ec7-205f-4af1-b150-b8dd0b900ab4', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'absent', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('e322a749-3124-46a5-8fd7-11f199092b08', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '752d264e-9403-48df-836a-30666ccd9485', 'absent', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('a54a0c2d-628c-4683-9845-596be4a8d184', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'absent', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('6eaf23a0-d489-49c2-9291-0494ecd2a145', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('cffb6447-e3fa-45d8-8f6a-cd4badce1f89', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('d64f1c7f-da7b-47f3-aa2b-0cf024f1efa0', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'present', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('bad54f73-ab1f-4429-ba3c-f4425a6d99b3', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'present', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('a7b49960-eda5-479d-ae9b-bb21295cc8aa', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '5f9468b3-388f-4e05-81af-c4f078a91270', 'present', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('6ba475b6-bb1c-46dd-b45f-b74304098819', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'present', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('8bed369c-a208-4779-9858-c4b50faecdd9', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'present', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('6b78a15c-2811-4cb0-ba6d-5955c58d7c5f', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'present', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('96de19d8-da00-477e-aa7c-6c75db6e85a8', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('37535e03-a0c4-4198-a554-f1708352203e', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('e109e5ab-82dd-41f9-9dfe-e523d26e0de9', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('47e1d3ad-2e15-4951-a3da-8731c1ee067d', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 10:45:20.160332+00');
INSERT INTO public.attendance_records VALUES ('c6b628f7-3e13-4ea2-8e3d-6317928e2e5d', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'absent', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('ec9afbbe-7f09-4d22-985a-0c63a04872cd', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '752d264e-9403-48df-836a-30666ccd9485', 'absent', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('49a0cf47-3261-4be2-beb4-6aeda45e5dd0', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'absent', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('37ceeae5-ffca-43fe-8040-03bcc17752ce', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'present', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('0e9118ea-fede-4f88-9034-46525ed5366d', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '48ac9f52-b30b-40ca-952f-f41177c51460', 'present', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('243c2aef-70fc-4e38-8bfe-2093154940c8', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'present', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('33bd534e-06e9-4aa7-a3ed-c69fe6d2641c', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('13f0cb76-9493-4704-8831-b4eba9e591c3', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '5f9468b3-388f-4e05-81af-c4f078a91270', 'present', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('3c18fc47-d789-4b8c-8357-6fb7fa245890', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'present', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('fb733538-541e-48db-86d1-3f7dabbb4562', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'present', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('5ebd0234-49aa-4403-9606-56c07cbf1866', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('95a8bc2f-20f9-434b-b086-4161f9ce5334', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('c46a3043-5812-4b5a-964b-80df432dd774', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('07e61b24-d519-46d4-ad90-155a56d662e8', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('2ab27802-7b98-4213-87f4-40603b74b8fd', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 10:53:56.270842+00');
INSERT INTO public.attendance_records VALUES ('6b7b3f0b-25e2-49bc-b272-9e6186bae89e', '6ba45759-eade-4592-84e5-683d840df842', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'absent', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('42f13331-4543-45ff-8f66-ff2d59eddc1b', '6ba45759-eade-4592-84e5-683d840df842', '752d264e-9403-48df-836a-30666ccd9485', 'absent', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('c4e2ca9b-3f73-4c19-8591-56516ae6d207', '6ba45759-eade-4592-84e5-683d840df842', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'present', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('a3b6101e-d427-4df9-af9a-7153074f4233', '6ba45759-eade-4592-84e5-683d840df842', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('4eeffe9f-56e4-40dc-be67-de9812cdc553', '6ba45759-eade-4592-84e5-683d840df842', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('a3c2c100-ef0e-447d-8344-0f4aa4fb3eb6', '6ba45759-eade-4592-84e5-683d840df842', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'present', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('4a90c1fe-f7c2-4e68-8fa2-45f053a5f601', '6ba45759-eade-4592-84e5-683d840df842', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('a64c6b18-1721-4746-9f6f-fc59c919b901', '6ba45759-eade-4592-84e5-683d840df842', '5f9468b3-388f-4e05-81af-c4f078a91270', 'present', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('a810ecae-6c8f-4b0a-b557-5f20e9dcfac8', '6ba45759-eade-4592-84e5-683d840df842', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'present', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('fe9c5821-02f7-420c-8618-ce00b8795ca4', '6ba45759-eade-4592-84e5-683d840df842', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'absent', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('09825804-f183-4796-aaa5-4c838133d78d', '6ba45759-eade-4592-84e5-683d840df842', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'present', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('f3689d00-ddf5-4d57-994b-5c06a91f50da', '6ba45759-eade-4592-84e5-683d840df842', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('af07d58f-bfc3-4e60-b926-b153d68ee401', '6ba45759-eade-4592-84e5-683d840df842', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('723da2f0-5d0c-4a2f-8645-e4056970f94d', '6ba45759-eade-4592-84e5-683d840df842', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('144020bf-330d-4f75-b49f-f13d8e580115', '6ba45759-eade-4592-84e5-683d840df842', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 11:03:08.439958+00');
INSERT INTO public.attendance_records VALUES ('de095946-70c1-4aaa-90b3-0d6b9fce5213', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'absent', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('5f0fd750-f8d6-4fd8-8624-6192feda367f', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '752d264e-9403-48df-836a-30666ccd9485', 'absent', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('02eef44d-b080-47b6-8a96-49162f7ea700', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'present', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('2cb4f8ad-a23f-441b-abef-0198418141b8', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'present', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('e02fa72a-2d6c-44a4-997c-2727b725df83', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '48ac9f52-b30b-40ca-952f-f41177c51460', 'present', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('4de7106b-fb32-489a-87f4-098f1cf4704f', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'absent', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('7789ef2d-248d-4fcc-9e3f-2bbfbfc83a04', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'present', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('e7782603-9c15-4010-8673-1c6356fcb447', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '5f9468b3-388f-4e05-81af-c4f078a91270', 'absent', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('6923bc5f-2f46-4b04-bc47-17be47905a70', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'present', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('1c7f0112-5dd2-4fee-ab94-93d50ae50428', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'absent', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('81e4b3bc-2df4-423a-98ed-67ad95558491', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('f9d89ee6-cb3a-44d8-95c8-48f4ef4287da', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('0d53ef77-bc8e-4f60-b751-f5e61d1f7778', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('b9d414da-ad86-41d8-91ec-a202eb07013c', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('3505314d-a05b-4405-b4d7-2debec7ea563', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 11:01:43.94082+00');
INSERT INTO public.attendance_records VALUES ('d416eec2-718a-47ce-b32b-c09cbb486c58', '5bac867a-6a49-4e66-a35b-66f237400299', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'present', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('8d1efd20-dc85-4bc5-b116-783fbbd09bdb', '5bac867a-6a49-4e66-a35b-66f237400299', '752d264e-9403-48df-836a-30666ccd9485', 'present', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('f713b73f-38f8-4e45-ba4f-02e142f6ae2d', '5bac867a-6a49-4e66-a35b-66f237400299', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'present', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('3054cce7-b751-4ae9-947b-6bc002e94a07', '5bac867a-6a49-4e66-a35b-66f237400299', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('677d2a6c-0b31-4478-9b87-32d51006f190', '5bac867a-6a49-4e66-a35b-66f237400299', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('63e75475-858b-4d65-8eaf-681a89d68a18', '5bac867a-6a49-4e66-a35b-66f237400299', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'present', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('08b80e73-8215-44ec-8b48-7c0ed157fada', '5bac867a-6a49-4e66-a35b-66f237400299', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('440ab86b-fbf1-48e5-b8f7-87d424404cb7', '5bac867a-6a49-4e66-a35b-66f237400299', '5f9468b3-388f-4e05-81af-c4f078a91270', 'absent', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('9b24e72b-c1d1-4bce-84c2-682425dd41f2', '5bac867a-6a49-4e66-a35b-66f237400299', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'absent', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('251e0910-cad3-468f-862f-a99aaa3ee074', '5bac867a-6a49-4e66-a35b-66f237400299', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'present', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('3a20eb85-08d4-4c89-9513-24511e2139f8', '5bac867a-6a49-4e66-a35b-66f237400299', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'present', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('3bfe4104-a15d-4499-9886-5beb90c05154', '5bac867a-6a49-4e66-a35b-66f237400299', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('7a714f7d-ec2c-485d-8158-ccfa10717f69', '5bac867a-6a49-4e66-a35b-66f237400299', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('f7951f52-6e1f-4e7d-9d2f-63dd5bf764ce', '5bac867a-6a49-4e66-a35b-66f237400299', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('ab9ec110-5440-4b8d-b5c6-051bfdc8bfc4', '5bac867a-6a49-4e66-a35b-66f237400299', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 11:05:49.277362+00');
INSERT INTO public.attendance_records VALUES ('2835b2c8-50f4-481b-9e4c-ca6f736a3260', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 11:07:25.20606+00');
INSERT INTO public.attendance_records VALUES ('522d1c04-4fe5-439f-86da-c4dc9f764fbf', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'present', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('98512e4c-3ca3-4bf2-b364-0aac7b6bea75', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '752d264e-9403-48df-836a-30666ccd9485', 'present', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('0607b252-60fd-4515-9a21-58506ef361be', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'present', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('9d34c9cd-e3e1-4e47-ae4d-92b6745b29af', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('86550e90-0605-46c7-9445-c0d6727fff1e', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('cbe95712-5d9e-400b-bd4a-e50c6105775c', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'absent', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('8a08eb8c-fe31-4b0d-ad1a-ae819578a560', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('3a839206-2137-4769-a208-d9e448d1d5f6', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '5f9468b3-388f-4e05-81af-c4f078a91270', 'present', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('7a65ec4d-9925-4f9d-b8d5-0b6c9c7a2984', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'absent', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('590cd767-b8c4-456e-a2c8-ba92c88781ab', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'absent', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('43ed67d8-5827-40a0-b8ef-19317ce9e141', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('77119a34-d943-45e4-874a-0d7a96022e78', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('011cb149-7b9a-4381-bf1d-6851668b9460', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('4eb8825b-6955-46fb-af51-a2b333edea23', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('40eb7205-c9df-4e91-af6d-d15504b36ed3', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 11:08:34.6567+00');
INSERT INTO public.attendance_records VALUES ('1b338f61-0354-40bf-a0ca-27b035b758bc', '628cb143-b22d-49d6-984a-35d213d2ffe2', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'present', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('5d11c41c-d98a-4d44-8395-1ff420ab1781', '628cb143-b22d-49d6-984a-35d213d2ffe2', '752d264e-9403-48df-836a-30666ccd9485', 'present', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('659ec4df-4fba-4961-9103-42a0507ac34a', '628cb143-b22d-49d6-984a-35d213d2ffe2', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'absent', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('b955d867-31a2-41c4-ad17-8c89b4a6a933', '628cb143-b22d-49d6-984a-35d213d2ffe2', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('86a398ed-f7a9-4fc1-b884-abf9bddf6929', '628cb143-b22d-49d6-984a-35d213d2ffe2', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('f06bdbf6-7a00-4ff9-a8ee-6134f6e5447a', '628cb143-b22d-49d6-984a-35d213d2ffe2', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'absent', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('4f489415-50be-4db4-8d66-0c901f2873c1', '628cb143-b22d-49d6-984a-35d213d2ffe2', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('9096bd25-598a-4fe0-b53c-980d87bf25ba', '628cb143-b22d-49d6-984a-35d213d2ffe2', '5f9468b3-388f-4e05-81af-c4f078a91270', 'present', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('cd97b7a9-6e72-4fe6-bc02-e354815e24bb', '628cb143-b22d-49d6-984a-35d213d2ffe2', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'absent', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('4e54e91a-a0e7-4744-81fd-939238be7885', '628cb143-b22d-49d6-984a-35d213d2ffe2', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'present', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('1c43f7ef-3dd2-451c-80f3-e2b5aa07a3be', '628cb143-b22d-49d6-984a-35d213d2ffe2', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('087936c1-507a-4621-96ff-185c8737f6b5', '628cb143-b22d-49d6-984a-35d213d2ffe2', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('21d395e4-9e28-4d4f-92d4-167db8e16eca', '628cb143-b22d-49d6-984a-35d213d2ffe2', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('edb628fe-28ea-441b-80d6-15cc5b5e63c8', '628cb143-b22d-49d6-984a-35d213d2ffe2', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('d35f4dd1-f5d8-4594-a5e6-62aaf233a62f', '628cb143-b22d-49d6-984a-35d213d2ffe2', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 11:12:31.544521+00');
INSERT INTO public.attendance_records VALUES ('cd9356c0-c63d-46e3-a26e-d56008afc3bc', 'f4be7335-0d25-4d42-9620-a28b8e137fab', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'present', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('ccc7d992-7472-4977-8a9a-8069def95a8e', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '752d264e-9403-48df-836a-30666ccd9485', 'present', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('36ee44df-ccc3-48d8-9ad9-9b820cd13e03', 'f4be7335-0d25-4d42-9620-a28b8e137fab', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'absent', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('694ec2dc-2928-4407-a1ab-264eda393b78', 'f4be7335-0d25-4d42-9620-a28b8e137fab', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('079d1e41-8e5b-47bd-bece-d161fe968879', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('d8d169c9-f601-45db-bb2c-86b4f89f480a', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'present', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('dfa4f2f6-9e82-4c8a-bf42-67644440903b', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('dc071c0f-6b5f-4b46-8cc0-9176e6f49636', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '5f9468b3-388f-4e05-81af-c4f078a91270', 'present', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('9f672f46-7892-4b98-ac90-d89556d275c9', 'f4be7335-0d25-4d42-9620-a28b8e137fab', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'absent', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('faa3d58f-a5a0-48ad-8fe4-1e34970821a2', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'present', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('cf2b2700-23b8-431c-b516-299e8c996154', 'f4be7335-0d25-4d42-9620-a28b8e137fab', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('359bdc9a-7ede-43a7-9a1d-e65b963e03a6', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('798db272-d6b4-4853-9190-4f43ec9fb9ec', 'f4be7335-0d25-4d42-9620-a28b8e137fab', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('7a2cff6f-328a-47e9-8242-b4505f46f1d5', 'f4be7335-0d25-4d42-9620-a28b8e137fab', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('5e958aea-c815-4d45-acaf-d60f8ec581e0', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 11:25:38.353971+00');
INSERT INTO public.attendance_records VALUES ('b9b773ab-0cd2-4b57-bfbd-8aad331c203c', '4c62f87f-5e12-416f-b216-dfe70eea241a', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'present', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('2fd91feb-c384-46b5-9bb7-7f30de0f2e4c', '4c62f87f-5e12-416f-b216-dfe70eea241a', '752d264e-9403-48df-836a-30666ccd9485', 'absent', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('ae461280-3609-429d-84a5-dbfa0f2bdbf5', '4c62f87f-5e12-416f-b216-dfe70eea241a', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'absent', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('e118ec4f-9759-4833-86d6-70164a62a9b4', '4c62f87f-5e12-416f-b216-dfe70eea241a', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('0c96267a-c8d0-45db-a13e-ee080cb1aa6e', '4c62f87f-5e12-416f-b216-dfe70eea241a', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('41844dac-392d-4254-acf0-cb05c5149b02', '4c62f87f-5e12-416f-b216-dfe70eea241a', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'present', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('38054c46-ad49-472d-8f0c-789ac888e813', '4c62f87f-5e12-416f-b216-dfe70eea241a', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('83ba4859-1c62-4097-bb94-15b4ebf1c2b9', '4c62f87f-5e12-416f-b216-dfe70eea241a', '5f9468b3-388f-4e05-81af-c4f078a91270', 'present', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('f336e713-502c-4e82-8902-045269147806', '4c62f87f-5e12-416f-b216-dfe70eea241a', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'present', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('d160c95d-26b1-42af-85d9-116c63538af1', '4c62f87f-5e12-416f-b216-dfe70eea241a', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'absent', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('0b1c5e58-4b86-4264-8f6b-bd3027b9461a', '4c62f87f-5e12-416f-b216-dfe70eea241a', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('38128db5-43e3-4cb4-bf8d-d8df7561a177', '4c62f87f-5e12-416f-b216-dfe70eea241a', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('1a714aed-6eec-4fe2-b22f-643894c58259', '4c62f87f-5e12-416f-b216-dfe70eea241a', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('17517f9a-428a-45ed-9df2-0b755af48e60', '4c62f87f-5e12-416f-b216-dfe70eea241a', 'f6599177-5f54-479c-a95c-e07046afde02', 'absent', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('b53cdd09-d01c-480b-b5e0-da9f1f0cc6d2', '4c62f87f-5e12-416f-b216-dfe70eea241a', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 11:29:20.493088+00');
INSERT INTO public.attendance_records VALUES ('05bbf4fe-8cf3-47e6-9eee-c4f54624a922', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'absent', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('dc44d49c-a27b-4c30-94ba-a8023b20e141', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '752d264e-9403-48df-836a-30666ccd9485', 'absent', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('7ee3ca98-d7c4-4a35-b00a-4a15fb8d8eef', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'present', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('4295500c-f77d-4137-b1f7-d52e7ab918cd', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('5f5a14f7-7a10-4483-99da-3e9fc90bed8c', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('001824aa-9674-4c98-a393-c216dc3e1890', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'present', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('692a410d-f30f-45b3-9653-72996d18a5bc', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('3007f3ce-fe1e-4f25-a533-084dfb8206a5', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '5f9468b3-388f-4e05-81af-c4f078a91270', 'present', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('2ce78bbe-8077-48d4-8a24-6a4f4711050b', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'present', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('58fc4b09-6246-48d4-a47f-6bed5aebec43', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'present', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('4c215e74-ae71-4479-982e-6219ea99e5cc', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('e23d17d1-af58-4ddd-aa0d-af1680be68fd', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('61c1cffb-4de7-4b9f-b50c-9e359eff5312', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('48e5ffdd-0408-4d4a-956a-0c2b0173e3c3', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('5b6af4e8-e583-40c6-a8b3-10217779957d', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'absent', '2026-07-11 15:34:25.786613+00');
INSERT INTO public.attendance_records VALUES ('b75ceaf4-71de-4c9e-bfbd-7c36846dd18e', '29d48621-997d-42bf-8261-1aef82fc335e', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'present', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('f0fa8060-368b-465f-a581-1f6cf7d842b4', '29d48621-997d-42bf-8261-1aef82fc335e', '752d264e-9403-48df-836a-30666ccd9485', 'absent', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('dbb324e7-53bc-4e8e-9c17-2496edd111d5', '29d48621-997d-42bf-8261-1aef82fc335e', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'present', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('947bc62a-3c29-4aa4-adc2-2f79637855b4', '29d48621-997d-42bf-8261-1aef82fc335e', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('405894a9-ef16-4927-bc17-8bdddd945e95', '29d48621-997d-42bf-8261-1aef82fc335e', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('ef74c786-35d1-4338-a06e-009039818f80', '29d48621-997d-42bf-8261-1aef82fc335e', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'present', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('88c5f900-0204-4071-91e9-c08b2ccdd333', '29d48621-997d-42bf-8261-1aef82fc335e', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('5598319f-f864-4e9b-973e-3fd5e07c95e8', '29d48621-997d-42bf-8261-1aef82fc335e', '5f9468b3-388f-4e05-81af-c4f078a91270', 'present', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('e11a0c3f-4ef0-49d7-bd9f-d761ff374aca', '29d48621-997d-42bf-8261-1aef82fc335e', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'absent', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('14fc5800-cdc0-41dc-98c6-48b5098466cc', '29d48621-997d-42bf-8261-1aef82fc335e', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'present', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('02b9ce0f-8976-4765-95fb-70bdef7df769', '29d48621-997d-42bf-8261-1aef82fc335e', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('b8f87755-afdf-4df3-9f53-e59fe76aa1d0', '29d48621-997d-42bf-8261-1aef82fc335e', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('c28eb79c-ea6e-4a13-8d26-56bfc0e8ca2c', '29d48621-997d-42bf-8261-1aef82fc335e', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('c0835ea3-410d-4961-997f-6d47b2a8b454', '29d48621-997d-42bf-8261-1aef82fc335e', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('16b4bf4e-071e-4f79-b202-010a466f17ab', '29d48621-997d-42bf-8261-1aef82fc335e', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-11 15:43:21.557492+00');
INSERT INTO public.attendance_records VALUES ('ddd1cd3c-105f-41fd-bb4e-ccf4e07afb1c', '90936adf-ba98-457d-b85f-293f8ed324f5', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'present', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('c397fb1c-a3fc-4ad5-8b99-f6390c60249f', '90936adf-ba98-457d-b85f-293f8ed324f5', '752d264e-9403-48df-836a-30666ccd9485', 'absent', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('075f4358-95a0-4686-9778-0864afd48354', '90936adf-ba98-457d-b85f-293f8ed324f5', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'absent', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('6bf9874c-a7b5-45c5-903e-d27ccbde6cdc', '90936adf-ba98-457d-b85f-293f8ed324f5', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('9d35e64d-9367-447b-b837-a0cbbf62c642', '90936adf-ba98-457d-b85f-293f8ed324f5', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('0e72cf68-c47f-40ef-9909-f049683a09c5', '90936adf-ba98-457d-b85f-293f8ed324f5', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'present', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('553af28d-6a87-4fdc-9bde-f6bc62cab97b', '90936adf-ba98-457d-b85f-293f8ed324f5', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('476eb329-b3b4-4f8e-948f-e79ca2972c4a', '90936adf-ba98-457d-b85f-293f8ed324f5', '5f9468b3-388f-4e05-81af-c4f078a91270', 'absent', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('96ebe1e7-8a22-478a-bfbd-c0eda49ca167', '90936adf-ba98-457d-b85f-293f8ed324f5', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'present', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('ea3b1e43-1886-4a5c-8a51-5dd6d1720583', '90936adf-ba98-457d-b85f-293f8ed324f5', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'present', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('a034eb10-f340-4c6c-98aa-97f7569bd057', '90936adf-ba98-457d-b85f-293f8ed324f5', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('1ad50627-1c1f-4ff0-a003-a4de2e208569', '90936adf-ba98-457d-b85f-293f8ed324f5', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('18ff7b0b-53ce-4380-9c8f-baf85df7a77c', '90936adf-ba98-457d-b85f-293f8ed324f5', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'absent', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('266e936b-9bb4-4f28-a0eb-003ce3f2bdf0', '90936adf-ba98-457d-b85f-293f8ed324f5', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('a9f379f0-8815-4442-97f2-dc31d1d98112', '90936adf-ba98-457d-b85f-293f8ed324f5', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-23 09:36:36.543974+00');
INSERT INTO public.attendance_records VALUES ('30532588-7b63-44a6-9a69-ad7079faf942', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '5b76049d-e898-4167-926a-edb06c067599', 'present', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('d342e10f-c530-488c-beb1-3bfe2e79717f', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'present', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('30c5d238-14ba-4b2e-90bb-170780d48f06', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '752d264e-9403-48df-836a-30666ccd9485', 'present', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('64695032-403c-4ff3-b5a9-24c21c4d7662', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'absent', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('2e3c6e01-81ab-4caa-87c7-13e347e555c6', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('bc91b3c9-e367-4027-9c76-52ae29f026b1', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('0f3b2cd6-f748-490c-9fa7-d95f2e34da7c', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'present', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('a6852f36-14a0-4987-a860-1cdb2f9d3337', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('e5da4bd3-a126-4e52-a83b-2c882f2502de', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '5f9468b3-388f-4e05-81af-c4f078a91270', 'absent', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('0e68d4c1-e005-4c1f-a21e-135e4adb9094', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'present', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('e43946e4-2832-48f8-a7d9-d88458987e36', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'present', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('e6fb9540-607c-42f0-8f98-5a3adb172aa3', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('b1bb9a50-1056-41c9-97fa-e8d6cf96b812', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('5bb0aeb3-7894-4338-bed8-e804f205c085', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('0a0e8b03-7b0e-459c-8dd8-bd9fe8b76949', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('b4e2bfda-d81d-45d0-8140-0da9cec3d92e', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-07-30 01:47:20.015399+00');
INSERT INTO public.attendance_records VALUES ('f7e8d97f-1884-4c75-a34d-0024566702bc', '312b1df1-b5cf-4c63-8039-1909dba83284', '5b76049d-e898-4167-926a-edb06c067599', 'absent', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('c7f9b860-8820-4db9-83a5-48b3a508ec00', '312b1df1-b5cf-4c63-8039-1909dba83284', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'present', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('d11603d9-6b0d-4fac-a1bf-912a77426ef2', '312b1df1-b5cf-4c63-8039-1909dba83284', '752d264e-9403-48df-836a-30666ccd9485', 'absent', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('afc0bca3-86a4-4267-a265-3bd6018ea567', '312b1df1-b5cf-4c63-8039-1909dba83284', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 'absent', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('8c3ccc1b-5863-4be9-87b5-82876e5095ad', '312b1df1-b5cf-4c63-8039-1909dba83284', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 'absent', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('a48beb17-df2b-4063-bfe4-68a69173b63e', '312b1df1-b5cf-4c63-8039-1909dba83284', '48ac9f52-b30b-40ca-952f-f41177c51460', 'absent', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('b5f41bff-63d4-4a4a-a76d-9f53179c8308', '312b1df1-b5cf-4c63-8039-1909dba83284', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 'absent', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('c651aa2a-7e26-47ba-8270-de086b6b5fea', '312b1df1-b5cf-4c63-8039-1909dba83284', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 'absent', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('d57d3260-5a63-479c-aac8-db60cd093b5a', '312b1df1-b5cf-4c63-8039-1909dba83284', '5f9468b3-388f-4e05-81af-c4f078a91270', 'absent', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('7eafc56a-5cc1-4d2f-b126-ca40aa82d96c', '312b1df1-b5cf-4c63-8039-1909dba83284', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'present', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('8c7e2a8b-f26a-4a99-aaae-cbd3d47c8a23', '312b1df1-b5cf-4c63-8039-1909dba83284', '9ade5c9f-e785-4d12-81d9-91fe23696636', 'present', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('d66839e3-7884-4076-a6a9-82497c5b8d03', '312b1df1-b5cf-4c63-8039-1909dba83284', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 'absent', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('bb56c5d6-967d-4f49-a87f-ab5fc41e93a3', '312b1df1-b5cf-4c63-8039-1909dba83284', '2eb14f5f-607a-4c15-92ce-407661b74988', 'present', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('c999ac05-6372-4f6b-b493-eb5077fe45ef', '312b1df1-b5cf-4c63-8039-1909dba83284', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 'present', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('6ebf9d56-3db2-4f15-9da6-c300764a5840', '312b1df1-b5cf-4c63-8039-1909dba83284', 'f6599177-5f54-479c-a95c-e07046afde02', 'present', '2026-08-26 05:10:50.376829+00');
INSERT INTO public.attendance_records VALUES ('b8f663b8-4839-4de1-92c9-e3dd3852e10f', '312b1df1-b5cf-4c63-8039-1909dba83284', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'present', '2026-08-26 05:10:50.376829+00');


--
-- Data for Name: contribution_players; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: contribution_transactions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: contributions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: goalkeeper_stats; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.goalkeeper_stats VALUES ('4ed8ad41-ccf8-4628-8d8b-b4417916ba48', '4c62f87f-5e12-416f-b216-dfe70eea241a', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 3, 1.00, '2026-07-11 12:44:15.345927+00', '2026-07-11 12:44:15.345927+00');
INSERT INTO public.goalkeeper_stats VALUES ('ea6324cc-ece6-46c7-992a-3d520311605e', '5bac867a-6a49-4e66-a35b-66f237400299', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 4, 1.00, '2026-07-11 15:24:47.409213+00', '2026-07-11 15:24:47.409213+00');
INSERT INTO public.goalkeeper_stats VALUES ('96d16329-de13-404f-9811-e5f9f40ff06e', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '48ac9f52-b30b-40ca-952f-f41177c51460', 0, 0.33, '2026-07-11 15:28:08.759293+00', '2026-07-11 15:28:08.759293+00');
INSERT INTO public.goalkeeper_stats VALUES ('b0fff2bc-1fea-4ca2-bfd0-8fe30e00cee7', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 2, 0.33, '2026-07-11 15:28:08.759293+00', '2026-07-11 15:28:08.759293+00');
INSERT INTO public.goalkeeper_stats VALUES ('951cfd1d-c018-4baa-a234-0c9c0b5abdf7', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 0.33, '2026-07-11 15:28:08.759293+00', '2026-07-11 15:28:08.759293+00');
INSERT INTO public.goalkeeper_stats VALUES ('adda69b9-f51c-4f59-b976-ffb73a370188', '6ba45759-eade-4592-84e5-683d840df842', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 1.00, '2026-07-11 15:31:27.925987+00', '2026-07-11 15:31:27.925987+00');
INSERT INTO public.goalkeeper_stats VALUES ('156c661a-a71a-48b1-83d2-6fb7b0b2c4a0', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 4, 1.00, '2026-07-11 15:35:49.083877+00', '2026-07-11 15:35:49.083877+00');
INSERT INTO public.goalkeeper_stats VALUES ('7ada3810-c2d1-48bf-8479-101e23619a34', '628cb143-b22d-49d6-984a-35d213d2ffe2', '5f9468b3-388f-4e05-81af-c4f078a91270', 2, 0.33, '2026-07-11 15:38:50.701085+00', '2026-07-11 15:38:50.701085+00');
INSERT INTO public.goalkeeper_stats VALUES ('c083b26b-d71a-4f58-a400-93ee594c3fe7', '628cb143-b22d-49d6-984a-35d213d2ffe2', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 2, 0.31, '2026-07-11 15:38:50.701085+00', '2026-07-11 15:38:50.701085+00');
INSERT INTO public.goalkeeper_stats VALUES ('3e747e75-4a8c-4073-a7da-911f6f8dbe74', '628cb143-b22d-49d6-984a-35d213d2ffe2', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 3, 0.33, '2026-07-11 15:38:50.701085+00', '2026-07-11 15:38:50.701085+00');
INSERT INTO public.goalkeeper_stats VALUES ('88649758-2bf6-409b-b5b9-1a74f3147abb', '29d48621-997d-42bf-8261-1aef82fc335e', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 1, 0.30, '2026-07-11 15:45:35.701606+00', '2026-07-11 15:45:35.701606+00');
INSERT INTO public.goalkeeper_stats VALUES ('332cef20-f685-4070-8bb2-240cd8f97573', '29d48621-997d-42bf-8261-1aef82fc335e', '5f9468b3-388f-4e05-81af-c4f078a91270', 2, 0.66, '2026-07-11 15:45:35.701606+00', '2026-07-11 15:45:35.701606+00');
INSERT INTO public.goalkeeper_stats VALUES ('31f94507-37b0-4547-850b-9623cc508d7b', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 1.00, '2026-07-11 15:49:47.831156+00', '2026-07-11 15:49:47.831156+00');
INSERT INTO public.goalkeeper_stats VALUES ('928b17aa-fd36-4ab1-81e2-e6e2b3169a65', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '2eb14f5f-607a-4c15-92ce-407661b74988', 2, 0.33, '2026-07-11 15:55:27.873897+00', '2026-07-11 15:55:27.873897+00');
INSERT INTO public.goalkeeper_stats VALUES ('120a2f7f-4a26-4cec-b974-f4ab21581d51', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 0, 0.33, '2026-07-11 15:55:27.873897+00', '2026-07-11 15:55:27.873897+00');
INSERT INTO public.goalkeeper_stats VALUES ('a4f1c41b-a0af-4c40-969f-90448717dcf2', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '5f9468b3-388f-4e05-81af-c4f078a91270', 3, 0.33, '2026-07-11 15:55:27.873897+00', '2026-07-11 15:55:27.873897+00');
INSERT INTO public.goalkeeper_stats VALUES ('373c27c3-8b89-4250-ba60-cdecbb09765d', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '5f9468b3-388f-4e05-81af-c4f078a91270', 0, 0.50, '2026-07-11 15:57:38.237134+00', '2026-07-11 15:57:38.237134+00');
INSERT INTO public.goalkeeper_stats VALUES ('4c5694e9-a991-40f2-8b51-666291422ee5', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '752d264e-9403-48df-836a-30666ccd9485', 3, 0.50, '2026-07-11 15:57:38.237134+00', '2026-07-11 15:57:38.237134+00');
INSERT INTO public.goalkeeper_stats VALUES ('78d150ab-8721-477e-a752-5e2a3ab71d14', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 1, 1.00, '2026-07-11 15:58:41.679438+00', '2026-07-11 15:58:41.679438+00');
INSERT INTO public.goalkeeper_stats VALUES ('f232e7ff-042f-46de-9c89-2e9fc4b73485', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '5f9468b3-388f-4e05-81af-c4f078a91270', 2, 1.00, '2026-07-11 15:59:29.301367+00', '2026-07-11 15:59:29.301367+00');
INSERT INTO public.goalkeeper_stats VALUES ('42bd4933-8a55-4bd0-8f3d-4ed1f16c8dc6', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 1, 1.00, '2026-07-11 15:59:40.835729+00', '2026-07-11 15:59:40.835729+00');
INSERT INTO public.goalkeeper_stats VALUES ('e3a3a57b-63fb-4009-a605-3bd5ebd106d8', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 4, 1.00, '2026-07-11 15:59:49.037869+00', '2026-07-11 15:59:49.037869+00');
INSERT INTO public.goalkeeper_stats VALUES ('53a53780-5808-428e-a4ed-8de7a630fbe6', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 6, 1.00, '2026-07-30 02:07:38.889601+00', '2026-07-30 02:07:38.889601+00');
INSERT INTO public.goalkeeper_stats VALUES ('d1ed011d-c7f8-450f-9621-b089f8b3ceb2', '90936adf-ba98-457d-b85f-293f8ed324f5', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 1, 1.00, '2026-07-30 08:43:32.264518+00', '2026-07-30 08:43:32.264518+00');
INSERT INTO public.goalkeeper_stats VALUES ('5c2c7475-55e7-4935-9d38-c2f152e3d30b', '312b1df1-b5cf-4c63-8039-1909dba83284', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 1, 1.00, '2026-08-26 05:12:02.849871+00', '2026-08-26 05:12:02.849871+00');


--
-- Data for Name: login; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.login VALUES ('be0b1eee-ca5e-4a32-b48a-32149ef486e6', 'admin', '123456', 'Admin', '2026-07-09 04:07:49.493529+00', '2026-07-09 04:07:49.493529+00', NULL);
INSERT INTO public.login VALUES ('2bc53203-2295-4245-aeef-d5f06deebb91', 'ducdatchelsea', '123456', 'Player', '2026-07-10 16:58:30.528351+00', '2026-07-10 16:58:30.528351+00', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc');
INSERT INTO public.login VALUES ('8aac164c-ea1b-4413-9b94-b997043b1320', 'jr.hust.11@gmail.com', '150812101909', 'Player', '2026-07-23 11:04:03.005979+00', '2026-07-23 11:04:03.005979+00', '2eb14f5f-607a-4c15-92ce-407661b74988');
INSERT INTO public.login VALUES ('c7e9a046-3a51-4dff-87e7-91bdbab23643', 'Ngoc Minh', '123456', 'Player', '2026-07-23 11:06:05.787084+00', '2026-07-23 11:06:05.787084+00', 'bc0c6a6b-b25a-4442-8673-d192aad8412d');
INSERT INTO public.login VALUES ('83311c9a-0d4a-4ab8-ae12-21bb7ec352a6', 'duong2k6', 'duong2k6', 'Player', '2026-07-30 05:04:39.373071+00', '2026-07-30 05:04:39.373071+00', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6');
INSERT INTO public.login VALUES ('1b32e93e-2c51-4e1d-be44-68867c3fb6b7', 'sonld', '123456', 'Player', '2026-07-30 07:48:05.149897+00', '2026-07-30 07:48:05.149897+00', '5f9468b3-388f-4e05-81af-c4f078a91270');
INSERT INTO public.login VALUES ('1a791b1f-9384-4de0-ac59-9b025c1991b1', 'Tùng Anh', '17021993', 'User', '2026-07-30 08:31:08.121267+00', '2026-07-30 08:31:08.121267+00', NULL);
INSERT INTO public.login VALUES ('4db055ad-9743-4102-ad2d-5a645ad2833b', 'Duccris', '160691', 'User', '2026-07-30 03:13:21.593613+00', '2026-07-30 08:58:13.37229+00', NULL);
INSERT INTO public.login VALUES ('152a5c00-0d5f-4f33-b766-7eec5e53ed2b', 'admin_admin', 'adminadmin', 'Player', '2026-07-31 08:50:53.225868+00', '2026-07-31 08:50:53.225868+00', '5b76049d-e898-4167-926a-edb06c067599');


--
-- Data for Name: match_defenders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.match_defenders VALUES ('bf115c54-9b55-4103-8aca-8c7cb5601fc9', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-30 02:07:38.90275+00');
INSERT INTO public.match_defenders VALUES ('352a78b9-6ebb-4ac3-926f-ccc489a81c1e', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', '2026-07-30 02:07:38.90275+00');
INSERT INTO public.match_defenders VALUES ('6bc42e06-f831-4c68-a719-08c62cc29ab9', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-30 02:07:38.90275+00');
INSERT INTO public.match_defenders VALUES ('d927e5d0-6aeb-44f4-80cf-6f91461c6e8d', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '752d264e-9403-48df-836a-30666ccd9485', '2026-07-30 02:07:38.90275+00');
INSERT INTO public.match_defenders VALUES ('bfa9e669-6b4a-4cc6-b069-26ef9284fce6', '90936adf-ba98-457d-b85f-293f8ed324f5', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-30 08:43:32.252055+00');
INSERT INTO public.match_defenders VALUES ('ad532b83-b479-4a41-a965-92c61b860061', '90936adf-ba98-457d-b85f-293f8ed324f5', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-30 08:43:32.252055+00');
INSERT INTO public.match_defenders VALUES ('a4d27b47-7dfe-438b-8c21-d46a64e79b24', '312b1df1-b5cf-4c63-8039-1909dba83284', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-08-26 05:12:02.857019+00');
INSERT INTO public.match_defenders VALUES ('994420b7-7f1f-4f6d-b371-3c2142b317a6', '312b1df1-b5cf-4c63-8039-1909dba83284', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-08-26 05:12:02.857019+00');
INSERT INTO public.match_defenders VALUES ('65dc0072-5656-49e5-a888-7d6e9e3c0d83', '4c62f87f-5e12-416f-b216-dfe70eea241a', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', '2026-07-11 12:44:15.352822+00');
INSERT INTO public.match_defenders VALUES ('36b726e9-b525-4112-bb67-d04ee486a0f1', '4c62f87f-5e12-416f-b216-dfe70eea241a', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 12:44:15.352822+00');
INSERT INTO public.match_defenders VALUES ('26dfd63c-459d-4a93-9524-93c64ef4f8f7', '5bac867a-6a49-4e66-a35b-66f237400299', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:24:47.29485+00');
INSERT INTO public.match_defenders VALUES ('d1dcb5b6-3f11-4d46-b94b-521bf9c209b0', '5bac867a-6a49-4e66-a35b-66f237400299', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:24:47.29485+00');
INSERT INTO public.match_defenders VALUES ('8ca0ef6f-f1f8-401f-bdc6-886022ab4578', '5bac867a-6a49-4e66-a35b-66f237400299', '752d264e-9403-48df-836a-30666ccd9485', '2026-07-11 15:24:47.29485+00');
INSERT INTO public.match_defenders VALUES ('c63c03db-6040-49c5-b322-6fc193bbff4d', '5bac867a-6a49-4e66-a35b-66f237400299', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', '2026-07-11 15:24:47.29485+00');
INSERT INTO public.match_defenders VALUES ('4d66c1b2-56f8-4f47-99bc-8d859473992f', '5bac867a-6a49-4e66-a35b-66f237400299', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', '2026-07-11 15:24:47.29485+00');
INSERT INTO public.match_defenders VALUES ('b12cd3fc-0b03-4c12-8dd4-7f216e0abe7d', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', '2026-07-11 15:28:08.764414+00');
INSERT INTO public.match_defenders VALUES ('84361e9a-0d01-4e0c-9c3a-703db27caa22', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:28:08.764414+00');
INSERT INTO public.match_defenders VALUES ('0fb7a1af-7f41-4c6f-9e6c-26868403ff83', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:28:08.764414+00');
INSERT INTO public.match_defenders VALUES ('6dac0923-cdd9-433e-bd67-288274fac090', '6ba45759-eade-4592-84e5-683d840df842', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', '2026-07-11 15:31:27.975971+00');
INSERT INTO public.match_defenders VALUES ('6f24fad9-64d4-42f1-84bf-173159d7a527', '6ba45759-eade-4592-84e5-683d840df842', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:31:27.975971+00');
INSERT INTO public.match_defenders VALUES ('11d2cc6f-a7c1-47e0-bc6e-21dd4f80c7e0', '6ba45759-eade-4592-84e5-683d840df842', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:31:27.975971+00');
INSERT INTO public.match_defenders VALUES ('8c05024e-021b-46f2-9aa0-b186511a5c46', '6ba45759-eade-4592-84e5-683d840df842', '5f9468b3-388f-4e05-81af-c4f078a91270', '2026-07-11 15:31:27.975971+00');
INSERT INTO public.match_defenders VALUES ('363a2e61-c374-4dfe-bd9d-7d11bfa84253', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:35:49.13048+00');
INSERT INTO public.match_defenders VALUES ('8daa952e-a25b-41ed-a053-2fd3f724e19c', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:35:49.13048+00');
INSERT INTO public.match_defenders VALUES ('017465cf-3842-4275-830a-5ee3781f8959', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '5f9468b3-388f-4e05-81af-c4f078a91270', '2026-07-11 15:35:49.13048+00');
INSERT INTO public.match_defenders VALUES ('6f8b56ed-d217-47d6-9f3d-0878d580d072', '628cb143-b22d-49d6-984a-35d213d2ffe2', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', '2026-07-11 15:38:50.819957+00');
INSERT INTO public.match_defenders VALUES ('8b559f01-f09f-4b1f-bbad-0ee3c3bf382c', '628cb143-b22d-49d6-984a-35d213d2ffe2', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:38:50.819957+00');
INSERT INTO public.match_defenders VALUES ('9033456f-8ed4-4470-8c3e-c8caa1910b91', '628cb143-b22d-49d6-984a-35d213d2ffe2', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:38:50.819957+00');
INSERT INTO public.match_defenders VALUES ('9659fb9c-5d34-4906-a4ae-ce165927d69d', '628cb143-b22d-49d6-984a-35d213d2ffe2', '752d264e-9403-48df-836a-30666ccd9485', '2026-07-11 15:38:50.819957+00');
INSERT INTO public.match_defenders VALUES ('9daf7f86-27c1-4ed0-9137-86a7d87e2817', '29d48621-997d-42bf-8261-1aef82fc335e', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', '2026-07-11 15:45:35.577874+00');
INSERT INTO public.match_defenders VALUES ('a97b32cb-146c-4851-9123-356b25b47f9b', '29d48621-997d-42bf-8261-1aef82fc335e', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:45:35.577874+00');
INSERT INTO public.match_defenders VALUES ('a7bd4d9c-6cc3-46f9-a0a7-ee0dc3d187f5', '29d48621-997d-42bf-8261-1aef82fc335e', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:45:35.577874+00');
INSERT INTO public.match_defenders VALUES ('a01ba35b-608a-4684-b784-6ff5c461e5cb', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', '2026-07-11 15:49:47.844843+00');
INSERT INTO public.match_defenders VALUES ('2f17731d-e337-420f-baa8-747f71fe9891', 'f4be7335-0d25-4d42-9620-a28b8e137fab', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:49:47.844843+00');
INSERT INTO public.match_defenders VALUES ('b514dc0b-acc1-4fc0-b4d1-e34dc15a8c4e', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:49:47.844843+00');
INSERT INTO public.match_defenders VALUES ('332190ad-13a3-40b1-b74f-1a4b35d75358', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '752d264e-9403-48df-836a-30666ccd9485', '2026-07-11 15:49:47.844843+00');
INSERT INTO public.match_defenders VALUES ('39b2a5e3-7751-4191-9e9f-0fc8f57d588d', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', '2026-07-11 15:55:27.977974+00');
INSERT INTO public.match_defenders VALUES ('d00d41bd-8765-4695-83dd-935c90c1309f', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:55:27.977974+00');
INSERT INTO public.match_defenders VALUES ('594a5d5a-1f1e-488f-b691-732caca36655', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:55:27.977974+00');
INSERT INTO public.match_defenders VALUES ('9d936c89-825d-4e27-b233-d1331917b009', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', '2026-07-11 15:55:27.977974+00');
INSERT INTO public.match_defenders VALUES ('872d9ccb-d8a6-4096-a13e-9c105c0d069a', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', '2026-07-11 15:55:27.977974+00');
INSERT INTO public.match_defenders VALUES ('25df9a74-b124-4f71-92d9-59b0d7f0bfb5', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:57:38.322802+00');
INSERT INTO public.match_defenders VALUES ('78b42b53-e107-4710-8f82-30a808dffe1d', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:57:38.322802+00');
INSERT INTO public.match_defenders VALUES ('a73c0db4-8a33-460b-9abd-c7226fb68e9d', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '752d264e-9403-48df-836a-30666ccd9485', '2026-07-11 15:58:41.82009+00');
INSERT INTO public.match_defenders VALUES ('896af700-9c7a-4710-8f45-56975a84a8e9', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:58:41.82009+00');
INSERT INTO public.match_defenders VALUES ('45bd2ecd-9b08-4973-aeea-187c9ff0cad9', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:58:41.82009+00');
INSERT INTO public.match_defenders VALUES ('cbab2d03-d20c-4526-bc04-c020a2ab390e', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:59:29.369797+00');
INSERT INTO public.match_defenders VALUES ('cc9c2606-11b5-4bc3-9a98-20e7bcedb301', 'b96daa18-54e2-48e2-b18f-85793457fcbc', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:59:29.369797+00');
INSERT INTO public.match_defenders VALUES ('6733e14b-9744-4373-b76d-3a0d727bbd37', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', '2026-07-11 15:59:29.369797+00');
INSERT INTO public.match_defenders VALUES ('2701a85a-bc10-4c39-bbd1-5485bb4fe01d', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '9ade5c9f-e785-4d12-81d9-91fe23696636', '2026-07-11 15:59:29.369797+00');
INSERT INTO public.match_defenders VALUES ('11170715-0904-40d0-9b10-8ac57be4c7a5', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:59:40.906287+00');
INSERT INTO public.match_defenders VALUES ('149fc849-0785-403c-998e-9335f118abb5', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:59:40.906287+00');
INSERT INTO public.match_defenders VALUES ('f40d26ce-0376-49b0-9871-df19463ab6b2', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', '2026-07-11 15:59:40.906287+00');
INSERT INTO public.match_defenders VALUES ('f154bb07-d844-4333-a132-e7e2ce84b601', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '5f9468b3-388f-4e05-81af-c4f078a91270', '2026-07-11 15:59:40.906287+00');
INSERT INTO public.match_defenders VALUES ('894aadd3-d28e-4040-b6ef-a4c951ec555d', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', '2026-07-11 15:59:40.906287+00');
INSERT INTO public.match_defenders VALUES ('6f3700c1-c11e-4b24-b0d5-de7d36d93b9e', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', '2026-07-11 15:59:40.906287+00');
INSERT INTO public.match_defenders VALUES ('90e3e111-2106-4626-ba76-8e89b8c4e745', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '48ac9f52-b30b-40ca-952f-f41177c51460', '2026-07-11 15:59:49.151424+00');
INSERT INTO public.match_defenders VALUES ('be92f22a-7595-4c03-b870-2a5bff232e0e', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', '2026-07-11 15:59:49.151424+00');
INSERT INTO public.match_defenders VALUES ('30b0d044-2a9e-4eab-9113-2e8bbcb3360f', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'f6599177-5f54-479c-a95c-e07046afde02', '2026-07-11 15:59:49.151424+00');
INSERT INTO public.match_defenders VALUES ('7c790dee-551a-4608-89e3-1dacd745c07d', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '2eb14f5f-607a-4c15-92ce-407661b74988', '2026-07-11 15:59:49.151424+00');
INSERT INTO public.match_defenders VALUES ('8e69b77b-23e0-4628-ac9c-8859d639208f', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '5f9468b3-388f-4e05-81af-c4f078a91270', '2026-07-11 15:59:49.151424+00');
INSERT INTO public.match_defenders VALUES ('3d3933fd-ee39-49de-9a70-a5c7894e3afb', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '9ade5c9f-e785-4d12-81d9-91fe23696636', '2026-07-11 15:59:49.151424+00');


--
-- Data for Name: match_performances; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.match_performances VALUES ('bd7c23a9-e227-4b6f-bb14-a58c710b36b1', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 0, 0, '2026-07-11 15:57:38.206906+00', '2026-07-11 15:57:38.206906+00');
INSERT INTO public.match_performances VALUES ('2b0c1638-8c8d-475d-b95b-182dabeb4282', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '752d264e-9403-48df-836a-30666ccd9485', 0, 0, '2026-07-11 15:57:38.206906+00', '2026-07-11 15:57:38.206906+00');
INSERT INTO public.match_performances VALUES ('15324199-65a6-439d-9051-edff93725cba', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 0, 0, '2026-07-11 15:57:38.206906+00', '2026-07-11 15:57:38.206906+00');
INSERT INTO public.match_performances VALUES ('bdd0a746-77a4-470a-ba1e-db6c69046183', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '5f9468b3-388f-4e05-81af-c4f078a91270', 0, 0, '2026-07-11 15:57:38.206906+00', '2026-07-11 15:57:38.206906+00');
INSERT INTO public.match_performances VALUES ('96ea8525-16ea-4daf-adf6-ccf466d5e29d', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '2eb14f5f-607a-4c15-92ce-407661b74988', 0, 0, '2026-07-11 15:57:38.206906+00', '2026-07-11 15:57:38.206906+00');
INSERT INTO public.match_performances VALUES ('88a06824-a2f7-4939-bdfa-7848d806d5db', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 0, 0, '2026-07-11 15:57:38.206906+00', '2026-07-11 15:57:38.206906+00');
INSERT INTO public.match_performances VALUES ('7c54d6b2-ef35-4fef-9b61-d00217bf49b9', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-07-11 15:57:38.206906+00', '2026-07-11 15:57:38.206906+00');
INSERT INTO public.match_performances VALUES ('68b3af8a-0230-4183-a9e6-d0346238f62e', '2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 0, '2026-07-11 15:57:38.206906+00', '2026-07-11 15:57:38.206906+00');
INSERT INTO public.match_performances VALUES ('698d2b76-84f6-4ad9-8578-5df507419f24', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '5b76049d-e898-4167-926a-edb06c067599', 0, 0, '2026-07-30 02:07:38.906573+00', '2026-07-30 02:07:38.906573+00');
INSERT INTO public.match_performances VALUES ('ccd4828f-de01-41bb-81e3-32f27e93e01b', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 0, 0, '2026-07-30 02:07:38.906573+00', '2026-07-30 02:07:38.906573+00');
INSERT INTO public.match_performances VALUES ('8692d24c-1cac-4d31-8ac6-1cd7c2b1b0c6', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '752d264e-9403-48df-836a-30666ccd9485', 0, 0, '2026-07-30 02:07:38.906573+00', '2026-07-30 02:07:38.906573+00');
INSERT INTO public.match_performances VALUES ('65fb6318-5b42-40d1-b57e-97c73e8f2731', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 0, '2026-07-30 02:07:38.906573+00', '2026-07-30 02:07:38.906573+00');
INSERT INTO public.match_performances VALUES ('95a2d666-3fbf-48b6-bc3c-63ad245067e8', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 1, 0, '2026-07-30 02:07:38.906573+00', '2026-07-30 02:07:38.906573+00');
INSERT INTO public.match_performances VALUES ('6549c8c8-08d0-44e6-a0da-5235c2dd383a', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '9ade5c9f-e785-4d12-81d9-91fe23696636', 2, 1, '2026-07-30 02:07:38.906573+00', '2026-07-30 02:07:38.906573+00');
INSERT INTO public.match_performances VALUES ('bf53a532-ddb2-483d-a217-630c406f9612', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '2eb14f5f-607a-4c15-92ce-407661b74988', 1, 2, '2026-07-30 02:07:38.906573+00', '2026-07-30 02:07:38.906573+00');
INSERT INTO public.match_performances VALUES ('ed871ffa-8003-434f-80e9-374629f699db', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 1, 1, '2026-07-30 02:07:38.906573+00', '2026-07-30 02:07:38.906573+00');
INSERT INTO public.match_performances VALUES ('eaeee702-b59c-44d3-b6f0-cbccca7cbe63', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '5f9468b3-388f-4e05-81af-c4f078a91270', 0, 0, '2026-07-11 15:59:29.370648+00', '2026-07-11 15:59:29.370648+00');
INSERT INTO public.match_performances VALUES ('2d4e596b-2ed9-42f0-8a99-c6e7e4568ac8', 'b96daa18-54e2-48e2-b18f-85793457fcbc', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 0, 0, '2026-07-11 15:59:29.370648+00', '2026-07-11 15:59:29.370648+00');
INSERT INTO public.match_performances VALUES ('a8dd0761-ddb5-4cfc-9b94-7d935d55a72d', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '9ade5c9f-e785-4d12-81d9-91fe23696636', 2, 0, '2026-07-11 15:59:29.370648+00', '2026-07-11 15:59:29.370648+00');
INSERT INTO public.match_performances VALUES ('07cd0013-6f79-4ec3-ac5b-cbb21418cab4', 'b96daa18-54e2-48e2-b18f-85793457fcbc', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 0, 0, '2026-07-11 15:59:29.370648+00', '2026-07-11 15:59:29.370648+00');
INSERT INTO public.match_performances VALUES ('e7799dda-8e0d-4daf-8ee3-3f5bddc8ae4a', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '2eb14f5f-607a-4c15-92ce-407661b74988', 1, 0, '2026-07-11 15:59:29.370648+00', '2026-07-11 15:59:29.370648+00');
INSERT INTO public.match_performances VALUES ('df646c43-6828-48b4-8fc4-6a526f8603d7', 'b96daa18-54e2-48e2-b18f-85793457fcbc', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 1, 1, '2026-07-11 15:59:29.370648+00', '2026-07-11 15:59:29.370648+00');
INSERT INTO public.match_performances VALUES ('b23f5986-74b3-4618-b41d-0d0cf3fd7075', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-07-30 02:07:38.906573+00', '2026-07-30 02:07:38.906573+00');
INSERT INTO public.match_performances VALUES ('8ede965d-e61a-42c9-9ff2-5cb5a3dcfbad', 'b4d66f29-f132-49ec-b675-b66e5150e6f4', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 0, '2026-07-30 02:07:38.906573+00', '2026-07-30 02:07:38.906573+00');
INSERT INTO public.match_performances VALUES ('87369c9e-f14b-4280-b406-3177781fef61', '312b1df1-b5cf-4c63-8039-1909dba83284', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 0, 0, '2026-08-26 05:12:02.848879+00', '2026-08-26 05:12:02.848879+00');
INSERT INTO public.match_performances VALUES ('45c4795a-b08a-46d8-963a-b856665be937', '312b1df1-b5cf-4c63-8039-1909dba83284', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 0, 0, '2026-08-26 05:12:02.848879+00', '2026-08-26 05:12:02.848879+00');
INSERT INTO public.match_performances VALUES ('f0a283bd-10e3-46a0-9461-3168378243c0', '312b1df1-b5cf-4c63-8039-1909dba83284', '9ade5c9f-e785-4d12-81d9-91fe23696636', 2, 0, '2026-08-26 05:12:02.848879+00', '2026-08-26 05:12:02.848879+00');
INSERT INTO public.match_performances VALUES ('cabef0ee-cb95-401b-87b0-d3712a7d61bd', '312b1df1-b5cf-4c63-8039-1909dba83284', '2eb14f5f-607a-4c15-92ce-407661b74988', 0, 0, '2026-08-26 05:12:02.848879+00', '2026-08-26 05:12:02.848879+00');
INSERT INTO public.match_performances VALUES ('d28625f3-826a-40a6-9caa-129aeb349f50', '312b1df1-b5cf-4c63-8039-1909dba83284', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 0, 0, '2026-08-26 05:12:02.848879+00', '2026-08-26 05:12:02.848879+00');
INSERT INTO public.match_performances VALUES ('b3043869-63f4-4d70-ac25-9bea5b1f3118', '312b1df1-b5cf-4c63-8039-1909dba83284', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-08-26 05:12:02.848879+00', '2026-08-26 05:12:02.848879+00');
INSERT INTO public.match_performances VALUES ('910a6456-65a9-4a1f-ba0f-7980de12bdb1', 'b96daa18-54e2-48e2-b18f-85793457fcbc', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-07-11 15:59:29.370648+00', '2026-07-11 15:59:29.370648+00');
INSERT INTO public.match_performances VALUES ('4893f1f1-cf0a-400d-bac5-9123239b9e3a', 'b96daa18-54e2-48e2-b18f-85793457fcbc', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 3, '2026-07-11 15:59:29.370648+00', '2026-07-11 15:59:29.370648+00');
INSERT INTO public.match_performances VALUES ('34385648-dc2f-4917-9b9b-8268ccd0643c', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 0, 0, '2026-07-11 15:59:49.037436+00', '2026-07-11 15:59:49.037436+00');
INSERT INTO public.match_performances VALUES ('310f2e30-80ce-4786-9264-45657b5c5a6f', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '48ac9f52-b30b-40ca-952f-f41177c51460', 0, 0, '2026-07-11 15:59:49.037436+00', '2026-07-11 15:59:49.037436+00');
INSERT INTO public.match_performances VALUES ('ec901b65-17f1-4327-80ab-172836acf840', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 0, '2026-07-11 15:59:49.037436+00', '2026-07-11 15:59:49.037436+00');
INSERT INTO public.match_performances VALUES ('764216d9-c4e0-40c9-9075-9ff362a93614', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '5f9468b3-388f-4e05-81af-c4f078a91270', 0, 0, '2026-07-11 15:59:49.037436+00', '2026-07-11 15:59:49.037436+00');
INSERT INTO public.match_performances VALUES ('0058fd25-d8a8-4ef1-ae08-797e96716b44', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 1, 0, '2026-07-11 15:59:49.037436+00', '2026-07-11 15:59:49.037436+00');
INSERT INTO public.match_performances VALUES ('9738afa5-db18-4dae-be87-9d45b645a8cc', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '9ade5c9f-e785-4d12-81d9-91fe23696636', 2, 0, '2026-07-11 15:59:49.037436+00', '2026-07-11 15:59:49.037436+00');
INSERT INTO public.match_performances VALUES ('76a43507-e503-4200-85c8-92d74615137d', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '2eb14f5f-607a-4c15-92ce-407661b74988', 0, 0, '2026-07-11 15:59:49.037436+00', '2026-07-11 15:59:49.037436+00');
INSERT INTO public.match_performances VALUES ('d5f4b425-7d1b-4b4d-bb14-7cee300ff129', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 0, 2, '2026-07-11 15:59:49.037436+00', '2026-07-11 15:59:49.037436+00');
INSERT INTO public.match_performances VALUES ('46bdf3bc-993d-4504-b033-47f798bb4379', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-07-11 15:59:49.037436+00', '2026-07-11 15:59:49.037436+00');
INSERT INTO public.match_performances VALUES ('63ba3347-06a0-4524-93ff-1577b1e1e882', 'a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 1, '2026-07-11 15:59:49.037436+00', '2026-07-11 15:59:49.037436+00');
INSERT INTO public.match_performances VALUES ('5f2fc7f7-082e-4665-8c36-49d6d3085b84', '4c62f87f-5e12-416f-b216-dfe70eea241a', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 1, 1, '2026-07-11 12:44:15.346013+00', '2026-07-11 12:44:15.346013+00');
INSERT INTO public.match_performances VALUES ('7e030146-0025-4c49-8a6a-856aced3ffc7', '4c62f87f-5e12-416f-b216-dfe70eea241a', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 0, '2026-07-11 12:44:15.346013+00', '2026-07-11 12:44:15.346013+00');
INSERT INTO public.match_performances VALUES ('8be79ef2-e5af-457e-a23a-6ff0d243b74f', '4c62f87f-5e12-416f-b216-dfe70eea241a', '5f9468b3-388f-4e05-81af-c4f078a91270', 0, 0, '2026-07-11 12:44:15.346013+00', '2026-07-11 12:44:15.346013+00');
INSERT INTO public.match_performances VALUES ('5d0f1a07-e7d0-4c15-a821-810f0d2ae0f7', '4c62f87f-5e12-416f-b216-dfe70eea241a', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 3, 1, '2026-07-11 12:44:15.346013+00', '2026-07-11 12:44:15.346013+00');
INSERT INTO public.match_performances VALUES ('65c89b2b-1f2b-4ff7-943e-e1b537047e7d', '4c62f87f-5e12-416f-b216-dfe70eea241a', '2eb14f5f-607a-4c15-92ce-407661b74988', 1, 2, '2026-07-11 12:44:15.346013+00', '2026-07-11 12:44:15.346013+00');
INSERT INTO public.match_performances VALUES ('36d46862-68bc-4d1a-999c-347d8a0b7df4', '4c62f87f-5e12-416f-b216-dfe70eea241a', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 1, 2, '2026-07-11 12:44:15.346013+00', '2026-07-11 12:44:15.346013+00');
INSERT INTO public.match_performances VALUES ('2151a575-956b-4f4f-b208-2b38ab2d6dbc', '4c62f87f-5e12-416f-b216-dfe70eea241a', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 2, 2, '2026-07-11 12:44:15.346013+00', '2026-07-11 12:44:15.346013+00');
INSERT INTO public.match_performances VALUES ('60b72da9-1c51-41c0-930e-e8bb9e39d552', '312b1df1-b5cf-4c63-8039-1909dba83284', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 0, '2026-08-26 05:12:02.848879+00', '2026-08-26 05:12:02.848879+00');
INSERT INTO public.match_performances VALUES ('0ebf2e43-aadc-4737-838e-2628218de0e2', '5bac867a-6a49-4e66-a35b-66f237400299', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 0, 0, '2026-07-11 15:24:47.287785+00', '2026-07-11 15:24:47.287785+00');
INSERT INTO public.match_performances VALUES ('e21d4247-4c62-4bef-b73f-443e8dee1755', '5bac867a-6a49-4e66-a35b-66f237400299', '752d264e-9403-48df-836a-30666ccd9485', 0, 0, '2026-07-11 15:24:47.287785+00', '2026-07-11 15:24:47.287785+00');
INSERT INTO public.match_performances VALUES ('05736b9c-97d6-41c5-ac92-ccc156225af8', '5bac867a-6a49-4e66-a35b-66f237400299', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 2, 1, '2026-07-11 15:24:47.287785+00', '2026-07-11 15:24:47.287785+00');
INSERT INTO public.match_performances VALUES ('c04b8446-b60e-4ee2-99e8-4f0cb526cd7f', '5bac867a-6a49-4e66-a35b-66f237400299', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 1, '2026-07-11 15:24:47.287785+00', '2026-07-11 15:24:47.287785+00');
INSERT INTO public.match_performances VALUES ('e0a74aab-af9f-42e9-a125-8f03f8220400', '5bac867a-6a49-4e66-a35b-66f237400299', '9ade5c9f-e785-4d12-81d9-91fe23696636', 3, 2, '2026-07-11 15:24:47.287785+00', '2026-07-11 15:24:47.287785+00');
INSERT INTO public.match_performances VALUES ('27db1ad5-b8a5-4de8-a720-eb4b72a47e64', '5bac867a-6a49-4e66-a35b-66f237400299', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 2, 0, '2026-07-11 15:24:47.287785+00', '2026-07-11 15:24:47.287785+00');
INSERT INTO public.match_performances VALUES ('10f2484e-6682-425d-8e61-806a54bb4a2e', '5bac867a-6a49-4e66-a35b-66f237400299', '2eb14f5f-607a-4c15-92ce-407661b74988', 0, 0, '2026-07-11 15:24:47.287785+00', '2026-07-11 15:24:47.287785+00');
INSERT INTO public.match_performances VALUES ('7501d53c-3435-4907-a264-714f4a2a0d81', '5bac867a-6a49-4e66-a35b-66f237400299', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 3, 2, '2026-07-11 15:24:47.287785+00', '2026-07-11 15:24:47.287785+00');
INSERT INTO public.match_performances VALUES ('764d911f-4229-458e-8bfa-50272f08f365', '5bac867a-6a49-4e66-a35b-66f237400299', 'f6599177-5f54-479c-a95c-e07046afde02', 1, 0, '2026-07-11 15:24:47.287785+00', '2026-07-11 15:24:47.287785+00');
INSERT INTO public.match_performances VALUES ('159c09c4-204c-469e-a750-3a9e524ab490', '5bac867a-6a49-4e66-a35b-66f237400299', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 3, 1, '2026-07-11 15:24:47.287785+00', '2026-07-11 15:24:47.287785+00');
INSERT INTO public.match_performances VALUES ('1df17eac-4847-4d1f-8310-ce382863df09', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 0, 0, '2026-07-11 15:28:08.805205+00', '2026-07-11 15:28:08.805205+00');
INSERT INTO public.match_performances VALUES ('fe446284-939b-490b-8f3d-ec513dfc279b', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'ebecb39c-3f37-4532-ae1a-861990cf5d76', 0, 0, '2026-07-11 15:28:08.805205+00', '2026-07-11 15:28:08.805205+00');
INSERT INTO public.match_performances VALUES ('29fb3b99-6052-405e-9b87-599762a672e5', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '48ac9f52-b30b-40ca-952f-f41177c51460', 0, 0, '2026-07-11 15:28:08.805205+00', '2026-07-11 15:28:08.805205+00');
INSERT INTO public.match_performances VALUES ('68e28c19-3917-4d20-a194-ef82daa5524d', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 1, 0, '2026-07-11 15:28:08.805205+00', '2026-07-11 15:28:08.805205+00');
INSERT INTO public.match_performances VALUES ('627f9a97-d3c7-479d-826b-92e384bcfacf', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 1, 0, '2026-07-11 15:28:08.805205+00', '2026-07-11 15:28:08.805205+00');
INSERT INTO public.match_performances VALUES ('044fcff7-27b9-45cc-ab4c-595702a40fa8', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '2eb14f5f-607a-4c15-92ce-407661b74988', 0, 0, '2026-07-11 15:28:08.805205+00', '2026-07-11 15:28:08.805205+00');
INSERT INTO public.match_performances VALUES ('82eb5138-a2ce-401e-8668-6a5880eadb47', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 3, 2, '2026-07-11 15:28:08.805205+00', '2026-07-11 15:28:08.805205+00');
INSERT INTO public.match_performances VALUES ('13180a69-017b-4f2b-95f4-c760815bc4e7', 'a092c367-3050-43cc-b26d-3c0ce358ad04', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 1, '2026-07-11 15:28:08.805205+00', '2026-07-11 15:28:08.805205+00');
INSERT INTO public.match_performances VALUES ('8184bb00-8896-4d4e-a21c-ce1af1ff3bc9', 'a092c367-3050-43cc-b26d-3c0ce358ad04', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 0, '2026-07-11 15:28:08.805205+00', '2026-07-11 15:28:08.805205+00');
INSERT INTO public.match_performances VALUES ('c6cf7858-3326-440d-a727-6c31e5e0c47c', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '752d264e-9403-48df-836a-30666ccd9485', 0, 0, '2026-07-11 15:58:41.667128+00', '2026-07-11 15:58:41.667128+00');
INSERT INTO public.match_performances VALUES ('307d996c-610a-44a6-9389-647869ffe9fc', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 0, 1, '2026-07-11 15:58:41.667128+00', '2026-07-11 15:58:41.667128+00');
INSERT INTO public.match_performances VALUES ('bd4852c7-4452-46f2-80a3-a913bec232a0', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 0, '2026-07-11 15:58:41.667128+00', '2026-07-11 15:58:41.667128+00');
INSERT INTO public.match_performances VALUES ('99a8367e-c429-424a-ad41-da7741d8aff3', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '9ade5c9f-e785-4d12-81d9-91fe23696636', 1, 0, '2026-07-11 15:58:41.667128+00', '2026-07-11 15:58:41.667128+00');
INSERT INTO public.match_performances VALUES ('9e4d95ea-4612-4849-a5c8-9cb03c27e095', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '2eb14f5f-607a-4c15-92ce-407661b74988', 1, 1, '2026-07-11 15:58:41.667128+00', '2026-07-11 15:58:41.667128+00');
INSERT INTO public.match_performances VALUES ('5b913c70-f9b3-4520-a4c6-324588a63895', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 0, 0, '2026-07-11 15:58:41.667128+00', '2026-07-11 15:58:41.667128+00');
INSERT INTO public.match_performances VALUES ('f369d93c-2ffd-4aa2-89bc-b0efeac4e822', '6ba45759-eade-4592-84e5-683d840df842', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 0, 0, '2026-07-11 15:31:27.936161+00', '2026-07-11 15:31:27.936161+00');
INSERT INTO public.match_performances VALUES ('484e5ad3-d8c6-4192-8a6b-58b4e7dab18a', '6ba45759-eade-4592-84e5-683d840df842', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 0, '2026-07-11 15:31:27.936161+00', '2026-07-11 15:31:27.936161+00');
INSERT INTO public.match_performances VALUES ('bca871be-b178-455c-ad38-2448efe28800', '6ba45759-eade-4592-84e5-683d840df842', '5f9468b3-388f-4e05-81af-c4f078a91270', 0, 0, '2026-07-11 15:31:27.936161+00', '2026-07-11 15:31:27.936161+00');
INSERT INTO public.match_performances VALUES ('299308b1-4145-4ed3-9562-60512549aeea', '6ba45759-eade-4592-84e5-683d840df842', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 0, 0, '2026-07-11 15:31:27.936161+00', '2026-07-11 15:31:27.936161+00');
INSERT INTO public.match_performances VALUES ('c0def01d-04f4-4570-b6bc-63c9f2cbad9e', '6ba45759-eade-4592-84e5-683d840df842', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 0, 0, '2026-07-11 15:31:27.936161+00', '2026-07-11 15:31:27.936161+00');
INSERT INTO public.match_performances VALUES ('88ec4ebb-8221-4c02-a9ac-0e2995a536e8', '6ba45759-eade-4592-84e5-683d840df842', '2eb14f5f-607a-4c15-92ce-407661b74988', 0, 0, '2026-07-11 15:31:27.936161+00', '2026-07-11 15:31:27.936161+00');
INSERT INTO public.match_performances VALUES ('b8ae742d-5418-4a12-b9fc-eb778c7f3622', '6ba45759-eade-4592-84e5-683d840df842', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 0, 0, '2026-07-11 15:31:27.936161+00', '2026-07-11 15:31:27.936161+00');
INSERT INTO public.match_performances VALUES ('9448c908-b62e-4ce9-8eb3-696e97c9c615', '6ba45759-eade-4592-84e5-683d840df842', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-07-11 15:31:27.936161+00', '2026-07-11 15:31:27.936161+00');
INSERT INTO public.match_performances VALUES ('0fc1d70a-b976-416a-a7f2-98106ced3333', '6ba45759-eade-4592-84e5-683d840df842', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 0, '2026-07-11 15:31:27.936161+00', '2026-07-11 15:31:27.936161+00');
INSERT INTO public.match_performances VALUES ('8265054f-61aa-4c96-996c-9b89e9fc34eb', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 5, 0, '2026-07-11 15:35:49.091525+00', '2026-07-11 15:35:49.091525+00');
INSERT INTO public.match_performances VALUES ('07797148-37bb-4696-a6ed-5c505f5c5ecf', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 0, '2026-07-11 15:35:49.091525+00', '2026-07-11 15:35:49.091525+00');
INSERT INTO public.match_performances VALUES ('831a222a-4eae-4750-87b1-1ade52e0e63f', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '5f9468b3-388f-4e05-81af-c4f078a91270', 0, 0, '2026-07-11 15:35:49.091525+00', '2026-07-11 15:35:49.091525+00');
INSERT INTO public.match_performances VALUES ('161b337d-e0f2-4a07-9fc2-1dd3e45bbbe5', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 0, 4, '2026-07-11 15:35:49.091525+00', '2026-07-11 15:35:49.091525+00');
INSERT INTO public.match_performances VALUES ('c4b5b4e4-1621-406d-ab2f-9d17e62d587b', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '9ade5c9f-e785-4d12-81d9-91fe23696636', 2, 4, '2026-07-11 15:35:49.091525+00', '2026-07-11 15:35:49.091525+00');
INSERT INTO public.match_performances VALUES ('9ac6742b-4fa5-4d3c-a6fc-ebaea097ef06', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', '2eb14f5f-607a-4c15-92ce-407661b74988', 1, 0, '2026-07-11 15:35:49.091525+00', '2026-07-11 15:35:49.091525+00');
INSERT INTO public.match_performances VALUES ('49db5659-1f4a-4e6e-8c1f-5c241a98d12b', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 3, 1, '2026-07-11 15:35:49.091525+00', '2026-07-11 15:35:49.091525+00');
INSERT INTO public.match_performances VALUES ('c02b40e9-fe42-4d80-a248-6c62290e6e4e', '092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'f6599177-5f54-479c-a95c-e07046afde02', 1, 1, '2026-07-11 15:35:49.091525+00', '2026-07-11 15:35:49.091525+00');
INSERT INTO public.match_performances VALUES ('fecaff4d-967a-469c-a7e1-2675dd9b773a', '90936adf-ba98-457d-b85f-293f8ed324f5', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 0, 1, '2026-07-30 08:43:32.245825+00', '2026-07-30 08:43:32.245825+00');
INSERT INTO public.match_performances VALUES ('b10e0cb2-1c23-4fc3-896a-ded2ba7cddcb', '90936adf-ba98-457d-b85f-293f8ed324f5', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 0, '2026-07-30 08:43:32.245825+00', '2026-07-30 08:43:32.245825+00');
INSERT INTO public.match_performances VALUES ('1a827c61-3367-4402-aa35-ef3fa3d246ff', '90936adf-ba98-457d-b85f-293f8ed324f5', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 0, 0, '2026-07-30 08:43:32.245825+00', '2026-07-30 08:43:32.245825+00');
INSERT INTO public.match_performances VALUES ('89d63ec3-9519-4445-9c1e-892174847e4e', '90936adf-ba98-457d-b85f-293f8ed324f5', '9ade5c9f-e785-4d12-81d9-91fe23696636', 2, 0, '2026-07-30 08:43:32.245825+00', '2026-07-30 08:43:32.245825+00');
INSERT INTO public.match_performances VALUES ('370d3d34-ab22-4b8d-b183-00830a459407', '90936adf-ba98-457d-b85f-293f8ed324f5', '2eb14f5f-607a-4c15-92ce-407661b74988', 0, 0, '2026-07-30 08:43:32.245825+00', '2026-07-30 08:43:32.245825+00');
INSERT INTO public.match_performances VALUES ('ddc6d9a9-9dd2-4906-8c61-3bddb8191cc1', '90936adf-ba98-457d-b85f-293f8ed324f5', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-07-30 08:43:32.245825+00', '2026-07-30 08:43:32.245825+00');
INSERT INTO public.match_performances VALUES ('912941ca-cb0f-459f-857e-1555f5270db3', '90936adf-ba98-457d-b85f-293f8ed324f5', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 1, '2026-07-30 08:43:32.245825+00', '2026-07-30 08:43:32.245825+00');
INSERT INTO public.match_performances VALUES ('83586cfa-b5ba-4582-83ed-e2079ac52ed9', '628cb143-b22d-49d6-984a-35d213d2ffe2', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 0, 0, '2026-07-11 15:38:50.696469+00', '2026-07-11 15:38:50.696469+00');
INSERT INTO public.match_performances VALUES ('282bb90a-41d9-444f-9e5d-050904bd7c43', '628cb143-b22d-49d6-984a-35d213d2ffe2', '752d264e-9403-48df-836a-30666ccd9485', 0, 0, '2026-07-11 15:38:50.696469+00', '2026-07-11 15:38:50.696469+00');
INSERT INTO public.match_performances VALUES ('d81a120a-ae8e-4d16-8443-c0dbd4380f67', '628cb143-b22d-49d6-984a-35d213d2ffe2', '5f9468b3-388f-4e05-81af-c4f078a91270', 0, 0, '2026-07-11 15:38:50.696469+00', '2026-07-11 15:38:50.696469+00');
INSERT INTO public.match_performances VALUES ('8653e992-539a-489b-8f12-38946e2bba9c', '628cb143-b22d-49d6-984a-35d213d2ffe2', '9ade5c9f-e785-4d12-81d9-91fe23696636', 0, 0, '2026-07-11 15:38:50.696469+00', '2026-07-11 15:38:50.696469+00');
INSERT INTO public.match_performances VALUES ('acee96bb-4c3c-4bbf-9b5d-c24a585c8911', '628cb143-b22d-49d6-984a-35d213d2ffe2', '2eb14f5f-607a-4c15-92ce-407661b74988', 0, 0, '2026-07-11 15:38:50.696469+00', '2026-07-11 15:38:50.696469+00');
INSERT INTO public.match_performances VALUES ('b5012ced-664a-4498-b61c-22a96d952e9e', '628cb143-b22d-49d6-984a-35d213d2ffe2', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 0, 0, '2026-07-11 15:38:50.696469+00', '2026-07-11 15:38:50.696469+00');
INSERT INTO public.match_performances VALUES ('afb7844a-8dc1-4b52-bed1-053f93c896e3', '628cb143-b22d-49d6-984a-35d213d2ffe2', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-07-11 15:38:50.696469+00', '2026-07-11 15:38:50.696469+00');
INSERT INTO public.match_performances VALUES ('2cc55a22-c015-4a88-abb7-18545f836106', '628cb143-b22d-49d6-984a-35d213d2ffe2', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 0, '2026-07-11 15:38:50.696469+00', '2026-07-11 15:38:50.696469+00');
INSERT INTO public.match_performances VALUES ('2ab36685-23bd-4053-89bf-8ca375f03364', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-07-11 15:58:41.667128+00', '2026-07-11 15:58:41.667128+00');
INSERT INTO public.match_performances VALUES ('c762cdeb-a809-46c4-b2ff-f63d253f5288', 'c5d3bb29-6a05-4540-aa13-0f213049f22d', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 1, '2026-07-11 15:58:41.667128+00', '2026-07-11 15:58:41.667128+00');
INSERT INTO public.match_performances VALUES ('b4605e73-5950-4971-bcdc-d9241ae3585a', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 0, '2026-07-11 15:59:40.825936+00', '2026-07-11 15:59:40.825936+00');
INSERT INTO public.match_performances VALUES ('0761cf02-0afc-43db-b9d1-2a7e4e9e20c0', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 0, 0, '2026-07-11 15:59:40.825936+00', '2026-07-11 15:59:40.825936+00');
INSERT INTO public.match_performances VALUES ('16136bfa-aa79-4843-896c-9a60d3970676', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '5f9468b3-388f-4e05-81af-c4f078a91270', 0, 0, '2026-07-11 15:59:40.825936+00', '2026-07-11 15:59:40.825936+00');
INSERT INTO public.match_performances VALUES ('2db57d44-04e6-4874-b097-7376a31afe42', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 0, 1, '2026-07-11 15:59:40.825936+00', '2026-07-11 15:59:40.825936+00');
INSERT INTO public.match_performances VALUES ('65a2eb64-872c-4131-8649-135fa83c521f', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '9ade5c9f-e785-4d12-81d9-91fe23696636', 2, 1, '2026-07-11 15:59:40.825936+00', '2026-07-11 15:59:40.825936+00');
INSERT INTO public.match_performances VALUES ('0ad636de-aff9-4663-b5c0-a3b379eb3cbd', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'bd4244aa-492f-488f-8615-ffa5052a9bdb', 0, 1, '2026-07-11 15:59:40.825936+00', '2026-07-11 15:59:40.825936+00');
INSERT INTO public.match_performances VALUES ('56e86f63-f113-4a30-b9a0-1f3596cce4f1', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '2eb14f5f-607a-4c15-92ce-407661b74988', 0, 0, '2026-07-11 15:59:40.825936+00', '2026-07-11 15:59:40.825936+00');
INSERT INTO public.match_performances VALUES ('895afd5d-af32-4490-9fcf-d892fd094bb3', '29d48621-997d-42bf-8261-1aef82fc335e', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 0, 0, '2026-07-11 15:45:35.566758+00', '2026-07-11 15:45:35.566758+00');
INSERT INTO public.match_performances VALUES ('07f7d331-5ad9-4060-a24f-0b90ceb3bf9d', '29d48621-997d-42bf-8261-1aef82fc335e', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 1, 2, '2026-07-11 15:45:35.566758+00', '2026-07-11 15:45:35.566758+00');
INSERT INTO public.match_performances VALUES ('1059271d-d841-4071-95a3-3f81d8a5d3f5', '29d48621-997d-42bf-8261-1aef82fc335e', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 0, '2026-07-11 15:45:35.566758+00', '2026-07-11 15:45:35.566758+00');
INSERT INTO public.match_performances VALUES ('e12d4ba7-e651-466d-b8e5-c96864ef1cb1', '29d48621-997d-42bf-8261-1aef82fc335e', '5f9468b3-388f-4e05-81af-c4f078a91270', 0, 0, '2026-07-11 15:45:35.566758+00', '2026-07-11 15:45:35.566758+00');
INSERT INTO public.match_performances VALUES ('64f248b8-2e77-4e2f-9cbd-006cdad780a2', '29d48621-997d-42bf-8261-1aef82fc335e', '9ade5c9f-e785-4d12-81d9-91fe23696636', 2, 1, '2026-07-11 15:45:35.566758+00', '2026-07-11 15:45:35.566758+00');
INSERT INTO public.match_performances VALUES ('52f7df10-d791-4bf4-b7e5-061f31c3c00d', '29d48621-997d-42bf-8261-1aef82fc335e', '2eb14f5f-607a-4c15-92ce-407661b74988', 1, 0, '2026-07-11 15:45:35.566758+00', '2026-07-11 15:45:35.566758+00');
INSERT INTO public.match_performances VALUES ('d3eac196-3dc8-4905-8c49-c05e767a6d0e', '29d48621-997d-42bf-8261-1aef82fc335e', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 0, 0, '2026-07-11 15:45:35.566758+00', '2026-07-11 15:45:35.566758+00');
INSERT INTO public.match_performances VALUES ('32523b57-98c7-424a-a0d5-2172a0b5f34c', '29d48621-997d-42bf-8261-1aef82fc335e', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-07-11 15:45:35.566758+00', '2026-07-11 15:45:35.566758+00');
INSERT INTO public.match_performances VALUES ('510f21ba-e4ad-450e-8e28-76c8bc6d658d', '29d48621-997d-42bf-8261-1aef82fc335e', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 1, 0, '2026-07-11 15:45:35.566758+00', '2026-07-11 15:45:35.566758+00');
INSERT INTO public.match_performances VALUES ('eabdff8a-bb58-4705-90b3-5ad90e48a623', 'f4be7335-0d25-4d42-9620-a28b8e137fab', 'b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 0, 0, '2026-07-11 15:49:47.849781+00', '2026-07-11 15:49:47.849781+00');
INSERT INTO public.match_performances VALUES ('87a6685e-e706-43a0-828c-d72b9488cb80', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '752d264e-9403-48df-836a-30666ccd9485', 0, 0, '2026-07-11 15:49:47.849781+00', '2026-07-11 15:49:47.849781+00');
INSERT INTO public.match_performances VALUES ('4f9f20a5-56f5-4bd8-97af-ae0a67556111', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 0, '2026-07-11 15:49:47.849781+00', '2026-07-11 15:49:47.849781+00');
INSERT INTO public.match_performances VALUES ('d8bdccf4-705e-462b-838d-ed3b5bf0011d', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '5f9468b3-388f-4e05-81af-c4f078a91270', 0, 0, '2026-07-11 15:49:47.849781+00', '2026-07-11 15:49:47.849781+00');
INSERT INTO public.match_performances VALUES ('b759a027-a36f-47d7-a7e9-a5194433fecd', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '9ade5c9f-e785-4d12-81d9-91fe23696636', 0, 0, '2026-07-11 15:49:47.849781+00', '2026-07-11 15:49:47.849781+00');
INSERT INTO public.match_performances VALUES ('5d37db70-0476-4b27-952b-02d3b4314466', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '2eb14f5f-607a-4c15-92ce-407661b74988', 0, 0, '2026-07-11 15:49:47.849781+00', '2026-07-11 15:49:47.849781+00');
INSERT INTO public.match_performances VALUES ('1cfa5d3f-c3f4-4f32-ac6d-016f91cb7748', 'f4be7335-0d25-4d42-9620-a28b8e137fab', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 0, 0, '2026-07-11 15:49:47.849781+00', '2026-07-11 15:49:47.849781+00');
INSERT INTO public.match_performances VALUES ('1b005ab5-da78-461a-ac09-a7c9e5b7ff0e', 'f4be7335-0d25-4d42-9620-a28b8e137fab', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-07-11 15:49:47.849781+00', '2026-07-11 15:49:47.849781+00');
INSERT INTO public.match_performances VALUES ('ffe47a38-0931-4752-a4b0-b3a6f07754c0', 'f4be7335-0d25-4d42-9620-a28b8e137fab', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 0, '2026-07-11 15:49:47.849781+00', '2026-07-11 15:49:47.849781+00');
INSERT INTO public.match_performances VALUES ('3ce8cafe-1e65-4f99-905b-16a0e09334df', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'f8f16dd4-45d1-424e-8f28-862b241d21dc', 1, 0, '2026-07-11 15:55:27.853894+00', '2026-07-11 15:55:27.853894+00');
INSERT INTO public.match_performances VALUES ('5e9bf1c6-7ff3-41fe-9d83-25f9630dedcb', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '23a0537c-ea94-496b-9e8e-517f5a8d4084', 0, 0, '2026-07-11 15:55:27.853894+00', '2026-07-11 15:55:27.853894+00');
INSERT INTO public.match_performances VALUES ('95f59bb7-6a2f-414e-a350-84eda36429f9', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '785a76e5-9ac1-449f-9926-0d84f4058f1c', 1, 0, '2026-07-11 15:55:27.853894+00', '2026-07-11 15:55:27.853894+00');
INSERT INTO public.match_performances VALUES ('3ad3a6e8-09a0-488b-984f-332012571e32', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '5f9468b3-388f-4e05-81af-c4f078a91270', 0, 0, '2026-07-11 15:55:27.853894+00', '2026-07-11 15:55:27.853894+00');
INSERT INTO public.match_performances VALUES ('4779dee2-dc84-4703-b96f-24c0b353f1ad', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'e521a2c2-e47b-4b88-8d09-8127628ff8d6', 0, 1, '2026-07-11 15:55:27.853894+00', '2026-07-11 15:55:27.853894+00');
INSERT INTO public.match_performances VALUES ('e9b1f916-8998-4e2b-be31-a6ac370eef15', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '2eb14f5f-607a-4c15-92ce-407661b74988', 0, 0, '2026-07-11 15:55:27.853894+00', '2026-07-11 15:55:27.853894+00');
INSERT INTO public.match_performances VALUES ('c9745862-a8a7-4183-a560-1c67ad2f29e5', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 1, 0, '2026-07-11 15:55:27.853894+00', '2026-07-11 15:55:27.853894+00');
INSERT INTO public.match_performances VALUES ('158a4549-25a7-43f5-8723-d57ff80990cd', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-07-11 15:55:27.853894+00', '2026-07-11 15:55:27.853894+00');
INSERT INTO public.match_performances VALUES ('30ef3a92-c40d-4e0e-93d3-382bf7ab5bbb', 'cf7b00bb-9479-4796-8196-bcc52c91be7c', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 0, 0, '2026-07-11 15:55:27.853894+00', '2026-07-11 15:55:27.853894+00');
INSERT INTO public.match_performances VALUES ('3d6a956d-0ec3-4d9c-bc20-c2485f9e8a55', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'bc0c6a6b-b25a-4442-8673-d192aad8412d', 2, 0, '2026-07-11 15:59:40.825936+00', '2026-07-11 15:59:40.825936+00');
INSERT INTO public.match_performances VALUES ('6fe41349-1f17-4d19-a924-ed4d2982d0e5', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'f6599177-5f54-479c-a95c-e07046afde02', 0, 0, '2026-07-11 15:59:40.825936+00', '2026-07-11 15:59:40.825936+00');
INSERT INTO public.match_performances VALUES ('84ce227b-f2b0-4ffd-a314-c4d1f344c429', 'ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', '6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 1, 1, '2026-07-11 15:59:40.825936+00', '2026-07-11 15:59:40.825936+00');


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.matches VALUES ('6ba45759-eade-4592-84e5-683d840df842', 'Không rõ', '2026-04-08', 'Sân THPT Liên cấp Phenika', 'Thắng không nhớ nổi, tiền sân 270', '2026-07-11 10:56:49.699499+00', '2026-07-11 10:56:49.699499+00', 'Win', 'https://maps.app.goo.gl/j9J9k3Q1nanw5sx3A', NULL);
INSERT INTO public.matches VALUES ('a092c367-3050-43cc-b26d-3c0ce358ad04', 'Không rõ', '2026-04-22', 'Sân Trung Văn', 'Thắng 5 - 2, Tiền sân 400
Huy: 1 bàn
Minh: 3 bàn, 2 ass
Dương: 1 bàn
Thành: 1 ass', '2026-07-11 11:00:39.217351+00', '2026-07-11 11:00:39.217351+00', 'Win', 'https://maps.app.goo.gl/tUhXrdtiBNjYefni9', NULL);
INSERT INTO public.matches VALUES ('5bac867a-6a49-4e66-a35b-66f237400299', 'Không rõ', '2026-05-13', 'Sân Aka', 'Thắng  14 - 4, tiền sân 300
A Đức: 3 bàn, 2 ass
Minh: 3 bàn, 2 ass
Đạt: 3 bàn, 1 as
Thành: 1 bàn
Toàn: 2 bàn, 1 ass
Đức: 2 bàn
a Phương: 1 ass', '2026-07-11 11:05:16.410243+00', '2026-07-11 11:05:16.410243+00', 'Win', 'https://maps.app.goo.gl/embckr5RGKckBjw76', NULL);
INSERT INTO public.matches VALUES ('628cb143-b22d-49d6-984a-35d213d2ffe2', 'Không rõ', '2026-06-24', 'Sân Đại Nam', 'Thắng không nhớ nổi, tiền sân 600', '2026-07-11 11:12:08.063355+00', '2026-07-11 11:12:08.063355+00', 'Win', 'https://maps.app.goo.gl/8AbCzHeoV9NG9VzU8', NULL);
INSERT INTO public.matches VALUES ('29d48621-997d-42bf-8261-1aef82fc335e', 'Không rõ', '2026-06-10', 'Sân Viettel ', 'Thắng 5 - 3, tiền sân 200
A Đức 2 bàn, 1 ass
Toàn 1 bàn, 2 ass
Đạt 1 bàn
Toanh 1 bàn', '2026-07-11 15:42:21.454344+00', '2026-07-11 15:42:21.454344+00', 'Win', 'https://maps.app.goo.gl/VifBtVmZJY3bnoxk8', NULL);
INSERT INTO public.matches VALUES ('312b1df1-b5cf-4c63-8039-1909dba83284', 'Không rõ', '2026-08-26', 'sân La Thành', 'Thắng 2 - 1 (Đức Cris 2 bàn)', '2026-08-26 05:09:55.457864+00', '2026-08-26 05:09:55.457864+00', 'Win', 'https://maps.app.goo.gl/sTipR2hNLLe7rm7E9', NULL);
INSERT INTO public.matches VALUES ('b4d66f29-f132-49ec-b675-b66e5150e6f4', 'FC Áo AC Milan', '2026-07-29', 'Sân Kiên Cường', 'Thua 5 - 6
A Đức 2 bàn, 1 ass
Minh 1 bàn, 1 ass
Toanh 1 bàn, 2 ass
Dương 1 bàn', '2026-07-30 01:46:11.568706+00', '2026-07-30 01:46:11.568706+00', 'Loss', 'https://maps.app.goo.gl/NQaT1CZtrawRpASu9', 'https://youtu.be/3S3uvRWN1M4?si=0gkdNUIUfmAESPz6');
INSERT INTO public.matches VALUES ('90936adf-ba98-457d-b85f-293f8ed324f5', 'Không rõ', '2026-07-22', 'Sân Nguyên Dương (sân 5)', 'Thắng 3 - 1
A Đức 2 bàn, a Tùng Anh 1 ass, Đạt 1 ass', '2026-07-21 01:38:26.732281+00', '2026-07-21 01:38:26.732281+00', 'Win', 'https://maps.app.goo.gl/P2i6ypuJdReSWBkL7', NULL);
INSERT INTO public.matches VALUES ('4c62f87f-5e12-416f-b216-dfe70eea241a', 'F5C', '2026-07-08', 'Sân Đoan Môn', 'Thắng 8 - 3, tiền sân 400
Minh 1 bàn, 2 ass
Đạt 2 bàn, 2 ass
Dương 3 bàn, 1 as
Tùng Anh 1 bàn, 1 ass
Toanh 1 bàn, 2 ass', '2026-07-11 11:27:52.053982+00', '2026-07-11 11:27:52.053982+00', 'Win', 'https://maps.app.goo.gl/1kLVmT7sue3CkHbz7', NULL);
INSERT INTO public.matches VALUES ('2d01834c-f5e7-4e5a-a6a5-565fc1b3a71c', 'F5C', '2026-06-03', 'Sân Đoan Môn', 'Thua 0 - 3, Tiền sân 600', '2026-07-11 11:08:07.187327+00', '2026-07-11 11:08:07.187327+00', 'Loss', 'https://maps.app.goo.gl/1kLVmT7sue3CkHbz7', NULL);
INSERT INTO public.matches VALUES ('f4be7335-0d25-4d42-9620-a28b8e137fab', 'Không rõ', '2026-07-01', 'Sân Đầm Hồng 2 ', 'Thắng không nhớ nổi, tiền sân 600', '2026-07-11 11:24:42.292856+00', '2026-07-11 11:24:42.292856+00', 'Win', 'https://maps.app.goo.gl/1oMAM6cHsMqog66j6', NULL);
INSERT INTO public.matches VALUES ('a5a0d0f0-8288-41e2-b149-bb4eecfc5d5d', 'Không rõ', '2026-03-18', 'Sân Đầm Hồng 2', 'Thua 3 - 4, Tiền sân 400
A Đức: 2 bàn
Dương: 1 bàn
Minh: 2 kiến tạo
Đạt: 1 kiến tạo', '2026-07-11 10:53:16.94334+00', '2026-07-11 10:53:16.94334+00', 'Loss', 'https://maps.app.goo.gl/1oMAM6cHsMqog66j6', NULL);
INSERT INTO public.matches VALUES ('c5d3bb29-6a05-4540-aa13-0f213049f22d', 'Không rõ', '2026-05-28', 'Sân Kiên Cường', 'Thắng 3 - 1, Tiền sân 200
A Đức: 1 bàn
Toàn: 1 ass
Toanh: 1 bàn, 1 ass
Đạt:  1 ass', '2026-07-11 11:06:54.711662+00', '2026-07-11 11:06:54.711662+00', 'Win', 'https://maps.app.goo.gl/NQaT1CZtrawRpASu9', NULL);
INSERT INTO public.matches VALUES ('cf7b00bb-9479-4796-8196-bcc52c91be7c', 'Đối Thái Bình', '2026-04-15', 'Sân Nguyễn Hoàng', 'Thua 3 - 5, Tiền sân 480
Huy: 1 bàn
Minh: 1 bàn
Toàn: 1 bàn
Dương: 1 ass', '2026-07-11 10:58:20.867009+00', '2026-07-11 10:58:20.867009+00', 'Loss', 'https://maps.app.goo.gl/xjTxaSpyChJrLPGn9', NULL);
INSERT INTO public.matches VALUES ('ae3d9ad4-d01e-44e2-b59d-6b2ac94221d9', 'Đối Thái Bình', '2026-03-04', 'Sân Nguyễn Hoàng', 'Thắng 5 - 1, Tiền sân 320', '2026-07-11 10:42:40.30987+00', '2026-07-11 10:42:40.30987+00', 'Win', 'https://maps.app.goo.gl/xjTxaSpyChJrLPGn9', NULL);
INSERT INTO public.matches VALUES ('b96daa18-54e2-48e2-b18f-85793457fcbc', 'Không rõ', '2026-02-25', 'Sân Yên Hòa', 'Thắng 4 - 2, Tiền sân 300', '2026-07-11 10:34:52.274652+00', '2026-07-11 10:34:52.274652+00', 'Win', 'https://maps.app.goo.gl/BjJyscHRPmeETicR6', NULL);
INSERT INTO public.matches VALUES ('092e9f9b-59ca-493b-9e3c-f3ac8e9f7b0a', 'Không rõ', '2026-04-01', 'Sân Mỹ đình 2', '22h, Thắng 12 - 4, Tiền sân 400

A Đức: 2 bàn, 4 ass
Dương: 4 ass
Minh: 3 bàn, 1 ass
Thành: 1 bàn, 1 ass 
Toanh: 1 bàn
Toàn: 5 bàn', '2026-07-11 10:55:39.743274+00', '2026-07-11 10:55:39.743274+00', 'Win', 'https://maps.app.goo.gl/WdXN4AzkaKma58Zq8', NULL);


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.players VALUES ('6ae8e7ed-d1d8-4f69-833b-59bffd4b37fc', 'Đức Đạt Nguyễn', 29, 'MID', '09235252535', '2026-07-09 03:54:53.335008+00', true);
INSERT INTO public.players VALUES ('f6599177-5f54-479c-a95c-e07046afde02', 'Thành', 23, 'DEF', '', '2026-07-11 09:26:14.743668+00', true);
INSERT INTO public.players VALUES ('bc0c6a6b-b25a-4442-8673-d192aad8412d', 'Minh', 19, 'MID', '', '2026-07-11 09:26:26.306786+00', true);
INSERT INTO public.players VALUES ('2eb14f5f-607a-4c15-92ce-407661b74988', 'Toanh', 10, 'DEF', '', '2026-07-11 09:26:50.255383+00', true);
INSERT INTO public.players VALUES ('bd4244aa-492f-488f-8615-ffa5052a9bdb', 'Đức 2k', 66, 'MID', '', '2026-07-11 09:27:59.018037+00', true);
INSERT INTO public.players VALUES ('9ade5c9f-e785-4d12-81d9-91fe23696636', 'a Đức', 20, 'FWD', '', '2026-07-11 09:28:15.14045+00', true);
INSERT INTO public.players VALUES ('e521a2c2-e47b-4b88-8d09-8127628ff8d6', 'Dương', 10, 'FWD', '', '2026-07-11 09:28:27.346031+00', true);
INSERT INTO public.players VALUES ('5f9468b3-388f-4e05-81af-c4f078a91270', 'Sơn', 7, 'GK', '', '2026-07-11 09:29:01.432147+00', true);
INSERT INTO public.players VALUES ('785a76e5-9ac1-449f-9926-0d84f4058f1c', 'Huy', 22, 'FWD', '', '2026-07-11 09:29:14.372184+00', true);
INSERT INTO public.players VALUES ('23a0537c-ea94-496b-9e8e-517f5a8d4084', 'a Phương', 1, 'GK', '', '2026-07-11 09:29:33.740617+00', true);
INSERT INTO public.players VALUES ('48ac9f52-b30b-40ca-952f-f41177c51460', 'Thắng', 27, 'DEF', '', '2026-07-11 09:29:46.247086+00', true);
INSERT INTO public.players VALUES ('ebecb39c-3f37-4532-ae1a-861990cf5d76', 'Quang', 17, 'FWD', '', '2026-07-11 09:29:59.301485+00', true);
INSERT INTO public.players VALUES ('f8f16dd4-45d1-424e-8f28-862b241d21dc', 'Toàn', 9, 'FWD', '', '2026-07-11 09:30:08.248042+00', true);
INSERT INTO public.players VALUES ('752d264e-9403-48df-836a-30666ccd9485', 'Nam', 3, 'DEF', '', '2026-07-11 09:30:17.946956+00', true);
INSERT INTO public.players VALUES ('b0d1c8c6-54ad-49e2-bbe9-51857bfc4ff2', 'a Tùng Anh', 8, 'FWD', '', '2026-07-11 09:30:31.623132+00', true);
INSERT INTO public.players VALUES ('5b76049d-e898-4167-926a-edb06c067599', 'A Minh 98', 10, 'FWD', '', '2026-07-30 01:47:02.215063+00', true);
INSERT INTO public.players VALUES ('9c784129-c386-4642-9b2f-2d9aa56cd42c', 'SECURITY_TEST', 999, 'MID', '', '2026-07-31 10:07:55.290298+00', false);
INSERT INTO public.players VALUES ('b1d1eb84-e227-4b6f-94d1-7d7f35dce25d', 'KhangNV 8386', 999, 'MID', '', '2026-07-31 10:13:59.235142+00', false);


--
-- Name: attendance_records attendance_records_match_id_player_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_match_id_player_id_key UNIQUE (match_id, player_id);


--
-- Name: attendance_records attendance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_pkey PRIMARY KEY (id);


--
-- Name: contribution_players contribution_players_contribution_id_player_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contribution_players
    ADD CONSTRAINT contribution_players_contribution_id_player_id_key UNIQUE (contribution_id, player_id);


--
-- Name: contribution_players contribution_players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contribution_players
    ADD CONSTRAINT contribution_players_pkey PRIMARY KEY (id);


--
-- Name: contribution_transactions contribution_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contribution_transactions
    ADD CONSTRAINT contribution_transactions_pkey PRIMARY KEY (id);


--
-- Name: contributions contributions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributions
    ADD CONSTRAINT contributions_pkey PRIMARY KEY (id);


--
-- Name: goalkeeper_stats goalkeeper_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goalkeeper_stats
    ADD CONSTRAINT goalkeeper_stats_pkey PRIMARY KEY (id);


--
-- Name: goalkeeper_stats goalkeeper_stats_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goalkeeper_stats
    ADD CONSTRAINT goalkeeper_stats_unique UNIQUE (match_id, player_id);


--
-- Name: login login_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login
    ADD CONSTRAINT login_pkey PRIMARY KEY (id);


--
-- Name: login login_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login
    ADD CONSTRAINT login_username_key UNIQUE (username);


--
-- Name: match_defenders match_defenders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_defenders
    ADD CONSTRAINT match_defenders_pkey PRIMARY KEY (id);


--
-- Name: match_defenders match_defenders_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_defenders
    ADD CONSTRAINT match_defenders_unique UNIQUE (match_id, player_id);


--
-- Name: match_performances match_performances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_performances
    ADD CONSTRAINT match_performances_pkey PRIMARY KEY (id);


--
-- Name: match_performances match_performances_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_performances
    ADD CONSTRAINT match_performances_unique UNIQUE (match_id, player_id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: idx_contribution_players_contribution_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contribution_players_contribution_id ON public.contribution_players USING btree (contribution_id);


--
-- Name: idx_contribution_players_player_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contribution_players_player_id ON public.contribution_players USING btree (player_id);


--
-- Name: idx_contribution_transactions_contribution_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contribution_transactions_contribution_id ON public.contribution_transactions USING btree (contribution_id);


--
-- Name: idx_goalkeeper_stats_player; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_goalkeeper_stats_player ON public.goalkeeper_stats USING btree (player_id);


--
-- Name: idx_match_defenders_player; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_match_defenders_player ON public.match_defenders USING btree (player_id);


--
-- Name: idx_match_performances_player; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_match_performances_player ON public.match_performances USING btree (player_id);


--
-- Name: idx_matches_match_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matches_match_date ON public.matches USING btree (match_date);


--
-- Name: login_player_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX login_player_id_unique ON public.login USING btree (player_id) WHERE (player_id IS NOT NULL);


--
-- Name: login_single_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX login_single_admin ON public.login USING btree (((role = 'Admin'::public.user_role))) WHERE (role = 'Admin'::public.user_role);


--
-- Name: attendance_records attendance_records_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;


--
-- Name: attendance_records attendance_records_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: contribution_players contribution_players_contribution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contribution_players
    ADD CONSTRAINT contribution_players_contribution_id_fkey FOREIGN KEY (contribution_id) REFERENCES public.contributions(id) ON DELETE CASCADE;


--
-- Name: contribution_players contribution_players_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contribution_players
    ADD CONSTRAINT contribution_players_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- Name: contribution_transactions contribution_transactions_contribution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contribution_transactions
    ADD CONSTRAINT contribution_transactions_contribution_id_fkey FOREIGN KEY (contribution_id) REFERENCES public.contribution_players(id);


--
-- Name: goalkeeper_stats goalkeeper_stats_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goalkeeper_stats
    ADD CONSTRAINT goalkeeper_stats_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;


--
-- Name: goalkeeper_stats goalkeeper_stats_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goalkeeper_stats
    ADD CONSTRAINT goalkeeper_stats_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: login login_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login
    ADD CONSTRAINT login_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: match_defenders match_defenders_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_defenders
    ADD CONSTRAINT match_defenders_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;


--
-- Name: match_defenders match_defenders_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_defenders
    ADD CONSTRAINT match_defenders_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: match_performances match_performances_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_performances
    ADD CONSTRAINT match_performances_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;


--
-- Name: match_performances match_performances_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_performances
    ADD CONSTRAINT match_performances_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- PostgreSQL database dump complete
--

\unrestrict PFULXI4ENZAoF5XeH6BvpIAJoxtcfzzeDaM0exDMTjolT2ljsMT9FPjjgrmxPwT

