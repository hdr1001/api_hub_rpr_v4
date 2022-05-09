-- *********************************************************************
--
-- SQL DDL statements in support of API Hub data persistence
-- SQL code file: init.sql
--
-- Copyright 2021 Hans de Rooij
--
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
--       http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, 
-- software distributed under the License is distributed on an 
-- "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
-- either express or implied. See the License for the specific 
-- language governing permissions and limitations under the 
-- License.
--
-- *********************************************************************

-- DROP TABLE public.dnb_dpl_idr;
-- DROP TABLE public.products_dnb;
-- DROP TABLE public.auth_tokens_dpl;
-- DROP TABLE public.ah_errors;
-- DROP TABLE public.products_gleif;
-- DROP SEQUENCE public.dnb_dpl_idr_id_seq;
-- DROP SEQUENCE public.auth_tokens_dpl_id_seq;
-- DROP SEQUENCE public.ah_errors_id_seq;

-- Create a sequence for the primary key of table API hub errors
CREATE SEQUENCE public.ah_errors_id_seq
   INCREMENT 1
   START 1
   MINVALUE 1
   MAXVALUE 9223372036854775807
   CACHE 1;

-- Create the sequence for the primary key of table auth_tokens_dpl
CREATE SEQUENCE public.auth_tokens_dpl_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

-- Create the sequence for the primary key of table match_dnb_idr
CREATE SEQUENCE public.dnb_dpl_idr_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

-- Create table for storing GLEIF data products
CREATE TABLE public.products_gleif (
   lei character varying(32) COLLATE pg_catalog."default",
   lei_ref JSONB,
   lei_ref_obtained_at bigint,
   lei_ref_http_status smallint,
   CONSTRAINT products_gleif_pkey PRIMARY KEY (lei)
)
WITH (
   OIDS = false
)
TABLESPACE pg_default;

-- Create table for persisting error objects
CREATE TABLE public.ah_errors (
   id integer NOT NULL DEFAULT nextval('ah_errors_id_seq'::regclass),
   key character varying(32) COLLATE pg_catalog."default",
   err JSONB,
   err_obtained_at bigint,
   err_http_status smallint,
   CONSTRAINT ah_errors_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = false
)
TABLESPACE pg_default;

-- Create table auth_tokens for storing Direct Direct+ tokens
CREATE TABLE public.auth_tokens_dpl
(
    id integer NOT NULL DEFAULT nextval('auth_tokens_dpl_id_seq'::regclass),
    token character varying(2048) COLLATE pg_catalog."default",
    expires_in bigint,
    obtained_at bigint,
    CONSTRAINT auth_tokens_dpl_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

-- Create table for storing D&B data products
CREATE TABLE public.products_dnb (
   duns character varying(9) COLLATE pg_catalog."default",
   dbs_01 JSONB,
   dbs_01_obtained_at bigint,
   dbs_01_http_status smallint,
   CONSTRAINT products_dnb_pkey PRIMARY KEY (duns)
)
WITH (
   OIDS = false
)
TABLESPACE pg_default;

-- Create table storing D&B Direct+ identity resolution in & output
CREATE TABLE public.dnb_dpl_idr
(
    id integer NOT NULL DEFAULT nextval('dnb_dpl_idr_id_seq'::regclass),
    parameters JSONB,
    result JSONB,
    http_stat char(3),
    obtained_at bigint,
    duns character varying(11) COLLATE pg_catalog."default",
    CONSTRAINT dnb_dpl_idr_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
