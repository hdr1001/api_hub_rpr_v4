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
