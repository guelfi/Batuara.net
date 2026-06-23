--
-- PostgreSQL database dump
--

\restrict 4HCL3ySJzVajOJSNiPCQnqePWOai7snV0cEGqCZndHDwZUIfGIfBagbWtgUIEUQ

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

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
-- Data for Name: CalendarAttendances; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."CalendarAttendances" ("Id", "Date", "StartTime", "EndTime", "Type", "Description", "Observations", "RequiresRegistration", "MaxCapacity", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
1	2026-01-07 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
2	2026-01-14 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
3	2026-01-21 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
4	2026-01-28 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
5	2026-02-04 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
6	2026-02-11 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
7	2026-02-18 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
8	2026-02-25 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
9	2026-03-04 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
10	2026-03-11 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
11	2026-03-18 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
12	2026-03-25 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
13	2026-04-01 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
14	2026-04-08 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
15	2026-04-15 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
16	2026-04-22 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
17	2026-04-29 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
18	2026-05-06 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
19	2026-05-13 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
20	2026-05-20 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
21	2026-05-27 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
22	2026-06-03 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
23	2026-06-10 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
24	2026-06-17 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
25	2026-06-24 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
26	2026-07-01 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
27	2026-07-08 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
28	2026-07-15 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
29	2026-07-22 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
30	2026-07-29 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
31	2026-08-05 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
32	2026-08-12 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
33	2026-08-19 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
34	2026-08-26 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
35	2026-09-02 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
36	2026-09-09 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
37	2026-09-16 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
38	2026-09-23 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
39	2026-09-30 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
40	2026-10-07 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
41	2026-10-14 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
42	2026-10-21 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
43	2026-10-28 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
44	2026-11-04 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
45	2026-11-11 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
46	2026-11-18 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
47	2026-11-25 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
48	2026-12-02 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
49	2026-12-09 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
50	2026-12-16 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
51	2026-12-23 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
52	2026-12-30 03:00:00+00	20:00:00	22:00:00	1	Atendimento Kardecista	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
53	2026-01-16 03:00:00+00	20:00:00	22:00:00	2	Trabalhos de Firma??o da Casa	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
54	2026-01-24 03:00:00+00	20:00:00	23:00:00	5	Festa de Ox?ssi	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
55	2026-01-30 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
56	2026-02-07 03:00:00+00	20:00:00	23:00:00	5	Festa de Iemanj? / Amaci	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
57	2026-02-13 03:00:00+00	20:00:00	22:00:00	2	Gira Cancelada - Carnaval	Gira cancelada devido ao Carnaval	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	f
58	2026-02-20 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
59	2026-02-27 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
60	2026-02-28 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
61	2026-03-06 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
62	2026-03-13 03:00:00+00	20:00:00	23:00:00	5	Festa dos Malandros	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
63	2026-03-20 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
64	2026-03-27 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
65	2026-04-03 03:00:00+00	15:00:00	17:00:00	2	Sexta Santa	Cerim?nia especial - in?cio ?s 15h00	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
66	2026-04-10 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
67	2026-04-17 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
68	2026-04-25 03:00:00+00	20:00:00	23:00:00	5	Festa de Ogum / Iao	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
69	2026-05-01 03:00:00+00	20:00:00	22:00:00	2	Gira Cancelada	Gira cancelada	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	f
70	2026-05-08 03:00:00+00	20:00:00	23:00:00	5	Festa dos Pretos Velhos	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
71	2026-05-15 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
72	2026-05-16 03:00:00+00	10:00:00	18:00:00	5	Bazar	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
73	2026-05-17 03:00:00+00	10:00:00	18:00:00	5	Bazar	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
74	2026-05-22 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
75	2026-05-30 03:00:00+00	20:00:00	23:00:00	5	Festa dos Ciganos	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
76	2026-06-05 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
77	2026-06-12 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
78	2026-06-20 03:00:00+00	20:00:00	23:00:00	5	Festa de Boiadeiro e Sauda??o a Xang? Menino	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
79	2026-06-27 03:00:00+00	20:00:00	23:00:00	5	Festa de Esquerda	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
80	2026-07-03 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
81	2026-07-10 03:00:00+00	20:00:00	23:00:00	5	Festa dos Marinheiros	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
82	2026-07-17 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
83	2026-07-24 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
84	2026-07-31 03:00:00+00	20:00:00	23:00:00	5	Festa de Nan?	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
85	2026-08-07 03:00:00+00	20:00:00	23:00:00	5	Festa dos Baianos	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
86	2026-08-14 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
87	2026-08-21 03:00:00+00	20:00:00	23:00:00	5	Festa de Obalua?	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
88	2026-08-28 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
89	2026-09-04 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
90	2026-09-11 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
91	2026-09-18 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
92	2026-09-25 03:00:00+00	20:00:00	23:00:00	5	Festa de Er? - Dia 1	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
93	2026-09-26 03:00:00+00	20:00:00	23:00:00	5	Festa de Er? - Dia 2	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
94	2026-09-27 03:00:00+00	20:00:00	23:00:00	5	Festa de Er? - Dia 3	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
95	2026-10-02 03:00:00+00	20:00:00	23:00:00	5	Festa de Xang?	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
96	2026-10-09 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	Feriado na segunda-feira	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
97	2026-10-16 03:00:00+00	20:00:00	23:00:00	5	Festa de Oxum	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
98	2026-10-23 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
99	2026-10-30 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
100	2026-11-06 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
101	2026-11-13 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
102	2026-11-20 03:00:00+00	20:00:00	22:00:00	2	Gira Cancelada	Gira cancelada	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	f
103	2026-11-27 03:00:00+00	20:00:00	22:00:00	2	Gira Normal	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
104	2026-12-05 03:00:00+00	20:00:00	23:00:00	5	Festa de Ians?	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
105	2026-12-11 03:00:00+00	20:00:00	23:00:00	5	Festa de Oxal?	\N	f	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
\.


--
-- Data for Name: CalendarAttendances_backup_pre2026; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."CalendarAttendances_backup_pre2026" ("Id", "Date", "StartTime", "EndTime", "Type", "Description", "Observations", "RequiresRegistration", "MaxCapacity", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
1	2026-04-07 00:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água	f	\N	2026-04-02 14:37:36.978051+00	2026-04-02 14:37:36.978051+00	t
2	2026-04-03 00:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas	f	\N	2026-04-02 14:37:36.97859+00	2026-04-02 14:37:36.97859+00	t
3	2026-04-05 00:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	\N	t	30	2026-04-02 14:37:36.978595+00	2026-04-02 14:37:36.978595+00	t
6	2026-01-06 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
7	2026-01-13 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
8	2026-01-27 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
9	2026-02-03 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
10	2026-02-10 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
11	2026-02-24 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
12	2026-03-03 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
13	2026-03-10 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
14	2026-03-17 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
15	2026-03-24 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
16	2026-03-31 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
17	2026-04-07 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
18	2026-04-14 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
19	2026-04-21 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
20	2026-04-28 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
21	2026-05-05 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
22	2026-05-12 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
23	2026-05-19 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
24	2026-05-26 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
25	2026-06-02 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
26	2026-06-09 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
27	2026-06-16 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
28	2026-06-23 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
29	2026-06-30 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
30	2026-07-07 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
31	2026-07-14 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
32	2026-07-21 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
33	2026-07-28 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
34	2026-08-04 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
35	2026-08-11 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
36	2026-08-18 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
37	2026-08-25 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
38	2026-09-01 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
39	2026-09-08 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
40	2026-09-15 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
41	2026-09-22 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
42	2026-09-29 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
43	2026-10-06 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
44	2026-10-13 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
45	2026-10-20 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
46	2026-10-27 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
47	2026-11-03 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
48	2026-11-10 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
49	2026-11-17 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
50	2026-11-24 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
51	2026-12-01 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
52	2026-12-15 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
53	2026-12-22 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
54	2026-12-29 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
55	2026-01-01 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
56	2026-01-08 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
57	2026-01-15 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
58	2026-01-22 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
59	2026-01-29 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
60	2026-02-05 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
61	2026-02-12 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
62	2026-02-19 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
63	2026-02-26 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
64	2026-03-05 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
65	2026-03-12 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
66	2026-03-19 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
67	2026-03-26 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
68	2026-04-30 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
69	2026-05-07 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
70	2026-05-14 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
71	2026-05-21 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
72	2026-05-28 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
73	2026-06-04 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
74	2026-06-11 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
75	2026-06-18 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
76	2026-06-25 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
77	2026-07-02 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
78	2026-07-09 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
79	2026-07-16 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
80	2026-07-23 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
81	2026-07-30 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
82	2026-08-06 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
83	2026-08-13 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
84	2026-08-20 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
85	2026-08-27 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
86	2026-09-03 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
87	2026-09-10 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
88	2026-09-17 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
89	2026-09-24 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
90	2026-10-01 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
91	2026-10-08 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
92	2026-10-15 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
93	2026-10-22 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
94	2026-10-29 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
95	2026-11-05 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
96	2026-11-12 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
97	2026-11-19 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
98	2026-11-26 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
99	2026-12-03 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
100	2026-12-10 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
101	2026-12-17 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
102	2026-12-24 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
103	2026-12-31 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
104	2026-01-04 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
105	2026-01-18 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
106	2026-02-01 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
107	2026-02-15 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
108	2026-03-01 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
109	2026-03-15 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
110	2026-03-29 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
111	2026-04-12 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
112	2026-04-26 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
113	2026-05-10 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
114	2026-05-24 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
115	2026-06-07 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
116	2026-06-21 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
117	2026-07-05 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
118	2026-07-19 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
119	2026-08-02 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
120	2026-08-16 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
121	2026-08-30 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
122	2026-09-13 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
123	2026-09-27 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
124	2026-10-11 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
125	2026-10-25 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
126	2026-11-08 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
127	2026-11-22 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
128	2026-12-06 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
129	2026-12-20 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
\.


--
-- Data for Name: ContactMessages; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."ContactMessages" ("Id", "Name", "Email", "Phone", "Subject", "Message", "Status", "AdminNotes", "ReceivedAt", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
1	QA Público	qa-publico@batuara.test	11999990000	Teste integração	Mensagem automática de validação.	Archived	Registro de validação automatizada arquivado.	2026-04-03 00:07:51.223026+00	2026-04-03 00:07:51.222913+00	2026-04-03 00:23:17.806076+00	t
2	Smoke Test	smoke-test@batuara.local	11999990099	Validação automatizada	Mensagem criada pelo roteiro de integração.	Archived	Mensagem arquivada pelo roteiro de integração.	2026-04-03 00:25:43.670251+00	2026-04-03 00:25:43.670139+00	2026-04-03 00:25:43.754073+00	t
3	Anny Alves	annysthefany112@gmail.com	11948446665	Curso de desenvolvimento	Olá, gostaria de informações sobre o curso de kardessismo e o desenvolvimento espiritual da casa.	New	\N	2026-05-31 12:31:43.966543+00	2026-05-31 12:31:43.966362+00	2026-05-31 12:31:43.966362+00	t
4	RITA DE CASSIA MAIA BESERRA	cassia.maia2835@gmail.com	11965641374	Consulta Espiritual	Boa noite \nFui orientada pela minha cigana a procurar uma casa de umbanda, preciso de uma consulta	New	\N	2026-06-10 20:54:38.726655+00	2026-06-10 20:54:38.726652+00	2026-06-10 20:54:38.726652+00	t
5	Livia do carmo maranha	livia.carmo@renovaengenharias.com.br	11 97495-3384	Renovação da licença do corpo de bombeiros	Me chamo Lívia\n\nEstou passando para lembrar que a licença do Corpo de Bombeiros de vocês emitida em 2023 vence em (13/07/2026).\nRazão Social: CASA DE CARIDADE BATUARA\nEndereço: AVENIDA BRIGADEIRO FARIA LIMA, 2750, COCAIA\t- GUARULHOS\nLicença: 1040186\n\nEstamos com uma condição especial para as renovações que iniciarem ainda nesta semana. Vale a pena aproveitar!	New	\N	2026-06-11 17:04:42.8088+00	2026-06-11 17:04:42.8088+00	2026-06-11 17:04:42.8088+00	t
\.


--
-- Data for Name: Events; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."Events" ("Id", "Title", "Description", "Date", "StartTime", "EndTime", "Type", "ImageUrl", "Location", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
1	Trabalhos de Firma??o da Casa	Cerim?nia especial de firma??o da casa espiritual.	2026-01-16 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
2	Festa de Ox?ssi	Celebra??o em homenagem ao Orix? Ox?ssi, senhor das matas.	2026-01-24 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
3	Festa de Iemanj? / Amaci	Celebra??o de Iemanj? com ritual de amaci.	2026-02-07 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
4	Festa dos Malandros	Celebra??o em homenagem aos Malandros da Umbanda.	2026-03-13 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
5	Sexta Santa	Cerim?nia especial de Sexta Santa. In?cio ?s 15h00.	2026-04-03 03:00:00+00	15:00:00	17:00:00	3	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
6	Festa de Ogum / Iao	Celebra??o em homenagem ao Orix? Ogum e seus filhos.	2026-04-25 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
7	Festa dos Pretos Velhos	Homenagem aos Pretos Velhos, mestres da sabedoria.	2026-05-08 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
8	Bazar	Grande Bazar Beneficente da Batuara - S?bado.	2026-05-16 03:00:00+00	10:00:00	18:00:00	4	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
9	Bazar	Grande Bazar Beneficente da Batuara - Domingo.	2026-05-17 03:00:00+00	10:00:00	18:00:00	4	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
10	Festa dos Ciganos	Celebra??o em homenagem aos Ciganos da Umbanda.	2026-05-30 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
11	Festa de Boiadeiro e Sauda??o a Xang? Menino	Celebra??o dos Boiadeiros e sauda??o a Xang? Menino.	2026-06-20 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
12	Festa de Esquerda	Gira de Esquerda com os Exus e Pombas Giras.	2026-06-27 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
13	Festa dos Marinheiros	Celebra??o em homenagem aos Marinheiros da Umbanda.	2026-07-10 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
14	Festa de Nan?	Celebra??o em homenagem ? Orix? Nan? Buruqu?.	2026-07-31 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
15	Festa dos Baianos	Celebra??o em homenagem aos Baianos da Umbanda.	2026-08-07 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
16	Festa de Obalua?	Celebra??o em homenagem ao Orix? Obalua?, senhor das doen?as.	2026-08-21 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
17	Festa de Er? - Dia 1	Festa de Er? - primeiro dia de celebra??o.	2026-09-25 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
18	Festa de Er? - Dia 2	Festa de Er? - segundo dia de celebra??o.	2026-09-26 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
19	Festa de Er? - Dia 3	Festa de Er? - terceiro e ?ltimo dia de celebra??o.	2026-09-27 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
20	Festa de Xang?	Celebra??o em homenagem ao Orix? Xang?, senhor da justi?a.	2026-10-02 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
21	Festa de Oxum	Celebra??o em homenagem ? Orix? Oxum, senhora das ?guas doces.	2026-10-16 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
22	Festa de Ians?	Celebra??o em homenagem ? Orix? Ians?, senhora dos ventos.	2026-12-05 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
23	Festa de Oxal?	Celebra??o em homenagem ao Orix? Oxal?, pai da cria??o.	2026-12-11 03:00:00+00	\N	\N	1	\N	\N	2026-05-22 20:46:21.002666+00	2026-05-22 20:46:21.002666+00	t
\.


--
-- Data for Name: Events_backup_pre2026; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."Events_backup_pre2026" ("Id", "Title", "Description", "Date", "StartTime", "EndTime", "Type", "ImageUrl", "Location", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
1	Festa de Yemanjá	Celebração em honra à nossa querida Mãe Yemanjá, com gira especial e oferendas ao mar.	2026-04-17 00:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 14:37:36.840772+00	2026-04-02 14:37:36.840772+00	t
2	Palestra: Os Orixás na Umbanda	Palestra educativa sobre os Orixás e seus ensinamentos na tradição umbandista.	2026-04-10 00:00:00+00	19:30:00	21:00:00	5	\N	Casa de Caridade Batuara	2026-04-02 14:37:36.841007+00	2026-04-02 14:37:36.841007+00	t
3	Bazar Beneficente	Bazar com roupas, livros e artesanatos para arrecadar fundos para as obras da casa.	2026-04-14 00:00:00+00	14:00:00	18:00:00	4	\N	Casa de Caridade Batuara	2026-04-02 14:37:36.841008+00	2026-04-02 14:37:36.841008+00	t
17	São Sebastião	Dia dedicado a São Sebastião, protetor contra as epidemias. Data importante no calendário espírita.	2026-01-20 03:00:00+00	09:00:00	18:00:00	3	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
18	Dia de Oxóssi	Celebração do dia de Oxóssi, Orixá da mata, da fartura e do conhecimento. Gira especial com ofertas de caça e beers.	2026-01-20 03:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
19	Dia de Iemanjá (潮) / Natal de Iemanjá	Dia de Iemanjá (潮): Celebração do dia de Iemanjá, mãe de todos os Orixás. Cerimônia especial com gira de água.\r\n\r\nNatal de Iemanjá: Celebração do 'Natal' de Iemanjá. Uma das datas mais importantes para os seguidores de Umbanda e Candomblé.	2026-02-02 03:00:00+00	19:00:00	23:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
20	Aniversário de Iemanjá	Comemoração do aniversário de Iemanjá, mãe querida de todos os filhos. Gira especial com oferendas ao mar.	2026-04-23 03:00:00+00	19:00:00	23:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
21	Dia de Todos os Santos	Celebração do Dia de Todos os Santos. Feriado religioso que coincide com a Linha de Oxalá.	2026-05-01 03:00:00+00	09:00:00	18:00:00	3	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
22	Dia do Trabalho	Feriado nacional. Casa fechada para atendimento espiritual.	2026-05-01 03:00:00+00	\N	\N	3	\N	Casa fechada	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	f
23	Festa Junina de São João	Celebração de São João com bingo, quadrilha, comidas típicas e muito forró. Momento de fraternidade e alegria.	2026-06-24 03:00:00+00	19:00:00	23:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
24	Dia de Ogum	Celebração do dia de Ogum, Orixá guerreiro, senhor do ferro e das estradas. Gira especial com ofertas de ferro.	2026-07-27 03:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
25	Dia de Nanã	Celebração do dia de Nanã, Orixá anciã, senhora da sabedoria e dos mistérios da vida e morte.	2026-08-15 03:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
26	Dia de Oxum	Celebração do dia de Oxum, Orixá do amor, da beleza e das águas doces. Gira especial com oferendas douradas.	2026-08-16 03:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
27	Dia de Obaluaê	Celebração do dia de Obaluaê, Orixá da cura e das doenças. Gira especial com preces pela saúde.	2026-10-31 03:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
28	Natal de Iansã / Natal de Logun Edé	Natal de Iansã: Celebração do Natal de Iansã. Data importante para os filhos desta Orixá guerreira.\r\n\r\nNatal de Logun Edé: Celebração do Natal de Logun Edé, Orixá da união entre força e amor.	2026-12-08 03:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
29	Natal	Celebração do Natal de Cristo. Feriado religioso. Momento de paz, fraternidade e reflexão.	2026-12-25 03:00:00+00	09:00:00	12:00:00	3	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
30	Evento QA Visual 2026 Editado	Evento criado durante a validação visual automatizada do AdminDashboard.	2026-12-20 00:00:00+00	19:00:00	21:00:00	2	\N	Casa de Caridade Batuara	2026-04-02 20:54:38.103896+00	2026-04-02 20:57:17.948963+00	f
31	Evento QA Visual 2026 R2	Evento temporário para validação visual automatizada.	2026-11-19 00:00:00+00	19:00:00	21:00:00	2	\N	Casa Batuara QA	2026-04-02 21:10:23.52271+00	2026-04-02 21:12:35.276911+00	f
\.


--
-- Data for Name: Guides; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."Guides" ("Id", "Name", "Description", "PhotoUrl", "Specialties", "EntryDate", "Email", "Phone", "Whatsapp", "DisplayOrder", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
9	Baiano	Entidades alegres e festeiras, vindas da Bahia. Conhecidos por sua sabedoria popular e humor. Comemoração: 04/08 — Saudação: Salve Nosso Senhor do Bonfim. Habitat: Praias e cidades da Bahia. Cor: Amarelo e Vermelho. Dia: Quinta-feira.	\N	["Alegria contagiante", "Sabedoria popular", "Gosto por festas", "Linguagem típica baiana", "Proteção através da alegria"]	2024-01-01 00:00:00+00	\N	\N	\N	1	2026-04-29 05:54:12.42551+00	2026-04-29 05:54:12.42551+00	t
10	Preto Velho	Espíritos de anciãos africanos, símbolos de sabedoria, paciência e humildade. Comemoração: 13/05 — Saudação: Adorei as Almas. Habitat: Senzalas e terreiros antigos. Cor: Branco e Preto. Dia: Segunda-feira.	\N	["Sabedoria ancestral", "Paciência infinita", "Humildade profunda", "Conselhos valiosos", "Cura através da fé"]	2024-01-01 00:00:00+00	\N	\N	\N	2	2026-04-29 05:54:12.42551+00	2026-04-29 05:54:12.42551+00	t
11	Erês	Espíritos de crianças, trazem alegria, pureza e inocência. São os mensageiros da esperança. Comemoração: 27/09 — Saudação: Aminbeijada. Habitat: Jardins e parques infantis. Cor: Rosa e Azul. Dia: Domingo.	\N	["Pureza de coração", "Alegria contagiante", "Inocência genuína", "Brincadeiras e risos", "Proteção das crianças"]	2024-01-01 00:00:00+00	\N	\N	\N	3	2026-04-29 05:54:12.42551+00	2026-04-29 05:54:12.42551+00	t
12	Boiadeiro	Espíritos de vaqueiros e trabalhadores rurais, conhecidos por sua força e determinação. Comemoração: 24/06 — Saudação: Getruá seu Boiadeiro. Habitat: Campos e fazendas. Cor: Marrom e Bege. Dia: Terça-feira.	\N	["Força e coragem", "Determinação", "Simplicidade", "Proteção do gado", "Trabalho árduo"]	2024-01-01 00:00:00+00	\N	\N	\N	4	2026-04-29 05:54:12.42551+00	2026-04-29 05:54:12.42551+00	t
13	Marinheiro	Espíritos dos mares, navegadores experientes que trazem proteção nas viagens. Comemoração: 07/07 — Saudação: Salve Nossa Senhora dos Navegantes. Habitat: Portos e navios. Cor: Azul e Branco. Dia: Sábado.	\N	["Conhecimento dos mares", "Proteção em viagens", "Aventura e coragem", "Histórias fascinantes", "Ligação com Iemanjá"]	2024-01-01 00:00:00+00	\N	\N	\N	5	2026-04-29 05:54:12.42551+00	2026-04-29 05:54:12.42551+00	t
14	Cigano	Espíritos nômades, conhecedores dos mistérios, da magia e da leitura do destino. Comemoração: 24/05 — Saudação: É de Ouro e Oriente. Habitat: Estradas e acampamentos. Cor: Dourado e Roxo. Dia: Sexta-feira.	\N	["Conhecimento místico", "Leitura do destino", "Liberdade de espírito", "Magia e encantamentos", "Proteção em viagens"]	2024-01-01 00:00:00+00	\N	\N	\N	6	2026-04-29 05:54:12.42551+00	2026-04-29 05:54:12.42551+00	t
15	Malandro	Espíritos urbanos, conhecedores da vida nas ruas, trazem proteção e esperteza. Comemoração: 18/03 — Saudação: Salve a Malandragem. Habitat: Ruas e esquinas da cidade. Cor: Preto e Branco. Dia: Quarta-feira.	\N	["Esperteza urbana", "Proteção nas ruas", "Jogo de cintura", "Conhecimento da vida", "Humor e malandragem"]	2024-01-01 00:00:00+00	\N	\N	\N	7	2026-04-29 05:54:12.42551+00	2026-04-29 05:54:12.42551+00	t
\.


--
-- Data for Name: HouseMembers; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."HouseMembers" ("Id", "FullName", "BirthDate", "EntryDate", "HeadOrixaFront", "HeadOrixaBack", "HeadOrixaRonda", "Email", "MobilePhone", "ZipCode", "Street", "Number", "Complement", "District", "City", "State", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
4	Marco Guelfi	1967-12-03 00:00:00+00	2023-12-06 00:00:00+00	Yemanjá	Ogun	Xangô	guelfi@msn.com	(11) 97574-7470	09190-670	Rua Gamboa	366	ap 6	Paraiso	Santo Andr├®	SP	2026-05-13 22:09:19.273792+00	2026-05-14 18:14:59.202337+00	t
\.


--
-- Data for Name: HouseMemberContributions; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."HouseMemberContributions" ("Id", "HouseMemberId", "ReferenceMonth", "DueDate", "Amount", "Status", "PaidAt", "Notes", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
4	4	2026-05-01 00:00:00+00	2026-05-10 00:00:00+00	50.00	Pending	\N	\N	2026-05-13 22:09:19.280904+00	2026-05-14 18:14:59.202344+00	t
\.


--
-- Data for Name: Orixas; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."Orixas" ("Id", "Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
6	Nanã	Nanã é uma das mais antigas Orixás femininas, conhecida como senhora da sabedoria ancestral e dos mistérios da vida e morte.	Nanã é uma das mais antigas Orixás femininas, conhecida como senhora da sabedoria ancestral e dos mistérios da vida e morte.	Na Casa Batuara, Nanã é reverenciada como a anciã sábia, aquela que guarda os segredos da vida e da morte, ensinando-nos a respeitar todos os ciclos da existência.	https://batuara.net/assets/orixas/nana.jpg	3	["Sabedoria", "Tradição", "Paciência", "Mistério", "Respeito aos antepassados"]	["Lilás", "Roxo"]	["Água", "Lama", "Terra"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
7	Oxum	Oxum é a Orixá das águas doces, dos rios e cachoeiras, conhecida como a senhora do ouro e do amor.	Oxum é a Orixá das águas doces, dos rios e cachoeiras, conhecida como a senhora do ouro e do amor.	Na Casa Batuara, Oxum é muito querida por suas qualidades de amor, beleza e fertilidade. Ela nos ensina a valorizar a doçura da vida e a beleza interior.	https://batuara.net/assets/orixas/oxum.jpg	4	["Amor", "Beleza", "Fertilidade", "Doçura", "Prosperidade"]	["Dourado", "Amarelo"]	["Água doce", "Ouro", "Rios"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
4	Ogum	Ogum é uma das divindades mais antigas da tradição Yorubá, conhecido como o senhor do ferro e da guerra.	Ogum é uma das divindades mais antigas da tradição Yorubá, conhecido como o senhor do ferro e da guerra.	A Casa Batuara ensina que Ogum é o grande trabalhador, aquele que nos mostra a importância do esforço e da dedicação para alcançar nossos objetivos.	https://batuara.net/assets/orixas/ogum.jpg	5	["Trabalho", "Perseverança", "Coragem", "Determinação", "Proteção", "Liderança", "Honestidade", "Força de vontade"]	["Azul escuro", "Vermelho", "Verde escuro"]	["Ferro", "Metal", "Terra", "Fogo"]	2026-04-02 14:36:08.320278+00	2026-04-02 18:32:28.981706+00	t
8	Oxóssi	Oxóssi é o Orixá caçador, senhor das matas e da fartura, conhecido por sua sabedoria e conexão com a natureza.	Oxóssi é o Orixá caçador, senhor das matas e da fartura, conhecido por sua sabedoria e conexão com a natureza.	Na Casa Batuara, Oxóssi é reverenciado como o provedor, aquele que nos ensina a buscar o conhecimento e a viver em harmonia com a natureza.	https://batuara.net/assets/orixas/oxossi.jpg	6	["Sabedoria", "Conhecimento", "Prosperidade", "Caça", "Natureza", "Fartura"]	["Verde", "Azul"]	["Mata", "Terra", "Arco"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
9	Xangô	Xangô é o Orixá da justiça, do fogo e do trovão, conhecido como o rei poderoso que pune os injustos e protege os oprimidos.	Xangô é o Orixá da justiça, do fogo e do trovão, conhecido como o rei poderoso que pune os injustos e protege os oprimidos.	A Casa Batuara ensina que Xangô é a personificação da justiça divina, nos mostrando que toda ação tem consequências e que a verdade sempre prevalece.	https://batuara.net/assets/orixas/xango.jpg	7	["Justiça", "Equilíbrio", "Autoridade", "Fogo", "Trovão", "Determinação"]	["Marrom", "Vermelho", "Branco"]	["Fogo", "Pedra", "Trovão"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
3	Iansã	Iansã, conhecida como Oyá na tradição Yorubá, é a divindade dos ventos e tempestades.	Iansã, conhecida como Oyá na tradição Yorubá, é a divindade dos ventos e tempestades. É esposa de Xangô e uma das mais respeitadas guerreiras entre os Orixás.	Na Casa Batuara, Iansã é reverenciada como a guerreira da luz, aquela que nos ensina a coragem para enfrentar as adversidades da vida.	https://batuara.net/assets/orixas/iansa.jpg	8	["Coragem", "Justiça", "Determinação", "Liderança", "Proteção", "Transformação", "Força", "Independência"]	["Amarelo", "Vermelho", "Coral", "Dourado"]	["Vento", "Tempestade", "Raio", "Fogo"]	2026-04-02 14:36:08.32027+00	2026-04-02 18:32:28.981706+00	t
10	Obaluaê	Obaluaê é o Orixá da cura e das doenças, também conhecido como Omolu.	Obaluaê é o Orixá da cura e das doenças, também conhecido como Omolu. É considerado o médico dos Orixás e senhor da vida e da morte.	Na Casa Batuara, Obaluaê é reverenciado como o grande curador, aquele que nos ensina que a saúde é o maior bem e que devemos cuidar do corpo e da alma.	https://batuara.net/assets/orixas/obaluae.jpg	9	["Cura", "Saúde", "Doenças", "Renovação", "Ciclo da vida"]	["Roxo", "Preto", "Vermelho"]	["Terra", "Lama", "Palha"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
11	Exu	Exu é o Orixá mensageiro, guardião dos caminhos e das encruzilhadas.	Exu é o Orixá mensageiro, guardião dos caminhos e das encruzilhadas. É o comunicador entre os mundos espiritual e material.	Na Casa Batuara, Exu é reverenciado como o mensageiro essencial, aquele que abre os caminhos e permite a comunicação entre o céu e a terra.	https://batuara.net/assets/orixas/exu.jpg	10	["Comunicação", "Caminhos", "Encruzilhadas", "Movimento", "Equilíbrio"]	["Vermelho", "Preto"]	["Terra", "Tridente"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
5	Iemanjá	Iemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja.	Iemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja. É a divindade dos rios e mares, mãe de muitos Orixás e protetora das mulheres e crianças.	A Casa Batuara tem especial devoção à Iemanjá, nossa mãe querida. Ela nos ensina o amor incondicional de mãe, a proteção aos necessitados e a importância da família espiritual.	https://batuara.net/assets/orixas/iemanja.jpg	2	["Maternidade", "Proteção", "Fertilidade", "Amor maternal", "Cura", "Acolhimento", "Generosidade", "Compaixão"]	["Azul", "Branco", "Azul marinho", "Prata"]	["Água", "Mar", "Rios", "Conchas"]	2026-04-02 18:32:28.981706+00	2026-06-20 20:01:11.146931+00	t
2	Yemanjá	Yemanjá é a mãe de todos os Orixás e rainha dos mares. Representa a maternidade, a fertilidade, a proteção e o amor maternal. É a grande mãe que acolhe e protege todos os seus filhos.	Yemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja. É a divindade dos rios e mares, mãe de muitos Orixás e protetora das mulheres e crianças.	A Casa Batuara tem especial devoção à Yemanjá, nossa mãe querida. Ela nos ensina o amor incondicional de mãe, a proteção aos necessitados e a importância da família espiritual. Yemanjá nos mostra que o amor maternal é a força mais poderosa do universo, capaz de curar, proteger e transformar. Em nossa casa, ela é celebrada como a mãe que nunca abandona seus filhos.	\N	2	["Maternidade", "Proteção", "Fertilidade", "Amor maternal", "Cura", "Acolhimento", "Generosidade", "Compaixão"]	["Azul", "Branco", "Azul marinho", "Prata"]	["Água", "Mar", "Rios", "Conchas"]	2026-04-02 14:36:08.320269+00	2026-06-20 20:01:46.194416+00	t
12	Pomba Gira	Pomba Gira é uma entidade feminina associada a Exu, senhora das encruzilhadas e dos mistérios femininos.	Pomba Gira é uma entidade feminina associada a Exu, senhora das encruzilhadas e dos mistérios femininos.	Na Casa Batuara, Pomba Gira é reverenciada como a guardiã dos mistérios femininos, ensinando-nos sobre a dualidade e o poder da energia feminina.	https://batuara.net/assets/orixas/pomba-gira.jpg	11	["Mistério", "Feminilidade", "Amor", "Encantamento", "Dualidade"]	["Preto", "Vermelho", "Rosa"]	["Terra", "Tridente"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
13	Ossain	Ossain é o Orixá das folhas e ervas medicinais, senhor do conhecimento das plantas curativas.	Ossain é o Orixá das folhas e ervas medicinais, senhor do conhecimento das plantas curativas.	Na Casa Batuara, Ossain é reverenciado como o mestre das ervas, ensinando-nos sobre as propriedades medicinais das plantas e a cura natural.	https://batuara.net/assets/orixas/ossain.jpg	12	["Cura", "Ervas", "Medicina", "Conhecimento ancestral", "Natureza"]	["Verde", "Marrom"]	["Ervas", "Terra", "Folhas"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
14	Oxumarê	Oxumarê é o Orixá da transformação, do movimento e da renovação.	Oxumarê é o Orixá da transformação, do movimento e da renovação. Representa o arco-íris e a serpente.	Na Casa Batuara, Oxumarê é reverenciado como o renovador, aquele que nos ensina que toda situação pode ser transformada e que a esperança sempre retorna.	https://batuara.net/assets/orixas/oxumare.jpg	13	["Renovação", "Transformação", "Movimento", "Esperança", "Equilíbrio"]	["Amarelo", "Verde", "Arco-íris"]	["Água", "Serpente", "Arco-íris"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
15	Logun Edé	Logun Edé é a fusão de Oxóssi e Oxum, representando a harmonia entre os opostos.	Logun Edé é a fusão de Oxóssi e Oxum, representando a harmonia entre os opostos. É Orixá da juventude, da sorte e das boas vendas.	Na Casa Batuara, Logun Edé é reverenciado como a união perfeita entre força e amor, ensina-nos que a prosperidade vem da harmonia entre os opostos.	https://batuara.net/assets/orixas/logun-ede.jpg	14	["União", "Prosperidade", "Juventude", "Sorte", "Harmonia"]	["Verde", "Dourado", "Azul"]	["Mata", "Rio", "Juventude"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
1	Oxalá	Oxalá tem origem na tradição Yorubá da África, onde é conhecido como Obatalá.	Oxalá tem origem na tradição Yorubá da África, onde é conhecido como Obatalá. É considerado o criador da humanidade e o pai de todos os Orixás.	Na Casa Batuara, Oxalá é reverenciado como o grande pai, aquele que nos ensina a humildade, a paciência e o amor incondicional. Seus ensinamentos nos mostram que através da paz interior e da pureza de coração podemos alcançar a elevação espiritual.	https://batuara.net/assets/orixas/oxala.jpg	1	["Paciência", "Sabedoria", "Pureza", "Paz", "Criação", "Paternidade", "Humildade", "Amor incondicional"]	["Branco", "Azul claro"]	["Ar", "Éter", "Luz"]	2026-04-02 14:36:08.319981+00	2026-06-20 20:02:38.303174+00	t
\.


--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."SiteSettings" ("Id", "Address", "Email", "Phone", "Instagram", "AboutText", "InstagramUrl", "PixKey", "CreatedAt", "UpdatedAt", "IsActive", "BankAccount", "BankAccountType", "BankAgency", "BankName", "City", "CompanyDocument", "Complement", "District", "FacebookUrl", "HistoryHtml", "HistorySubtitle", "HistoryTitle", "InstitutionalEmail", "MapEmbedUrl", "Number", "PixCity", "PixPayload", "PixRecipientName", "PrimaryPhone", "ReferenceNotes", "SecondaryPhone", "ServiceHours", "State", "Street", "WhatsappNumber", "WhatsappUrl", "YoutubeUrl", "ZipCode", "HistoryMissionText", "PixQrCodeBase64") FROM stdin;
1	Av. Brigadeiro Faria Lima, 2750 - Jardim Cocaia, Guarulhos/SP - 07130-000	contato@casabatuara.org.br	(11) 1234-5678	casadecaridade.batuara	A Casa de Caridade Caboclo Batuara nasceu do desejo de servir a Espiritualidade através da caridade e do amor ao próximo. Fundada em 23/04/1973 por Armando Augusto Nunes Filho (Dinho) e Cicero Diniz (Ciro) na Cidade de Guarulhos com base na Sabedoria Ancestral dos Orixás e no Conhecimento dos Guias, Entidades e Mentores, nossa casa é um lar espiritual para todos que buscam a luz, a paz e a elevação da alma.\n\nTrabalhamos com a Umbanda e a Doutrina Espírita, unindo a ciência, a filosofia e a religião em uma só prática. Nosso lema "Fora da caridade não há salvação" guia todas as nossas ações e nos lembra constantemente de nossa missão principal: servir com amor e humildade.\n\nOferecemos assistência espiritual gratuita, orientação, consolação e ensinamentos para todos que nos procuram, independentemente de sua condição social, raça ou credo religioso. Aqui, todos são bem-vindos e tratados como irmãos. Nossa comunidade se fortalece através da união, do respeito mútuo e da prática constante da caridade em todas as suas formas.	https://www.instagram.com/casadecaridade.batuara?igsh=ejU1dWozbTZlYXM4	08.488.544/0001-56	2026-04-02 13:19:11.868065+00	2026-05-24 11:58:50.342511+00	t	\N	\N	\N	\N	Guarulhos	08.488.544/0001-56	\N	Jardim Cocaia	\N	<p class="MuiTypography-root MuiTypography-body1 css-ds7uh7" style="margin-right: 0px; margin-bottom: 24px; margin-left: 0px; font-family: Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif; line-height: 1.8; font-size: 1.1rem; text-align: justify; letter-spacing: normal; background-color: rgb(250, 250, 250);">A <b>Casa de Caridade Caboclo Batuara</b> nasceu do desejo de servir a Espiritualidade através da caridade e do amor ao próximo. Fundada em 23/04/1973 por Armando Augusto Nunes Filho (Dinho) e Cicero Diniz (Ciro) na Cidade de Guarulhos com base na Sabedoria Ancestral dos Orixás e no Conhecimento dos Guias, Entidades e Mentores, nossa casa é um lar espiritual para todos que buscam a luz, a paz e a elevação da alma.</p><blockquote style="margin-right: 0px; margin-bottom: 24px; margin-left: 0px; font-family: Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif; line-height: 1.8; font-size: 1.1rem; text-align: justify; letter-spacing: normal; background-color: rgb(250, 250, 250);">Trabalhamos com a Umbanda e a Doutrina Espírita, unindo a ciência, a filosofia e a religião em uma só prática. Nosso lema "Fora da caridade não há salvação" guia todas as nossas ações e nos lembra constantemente de nossa missão principal: servir com amor e humildade.</blockquote><p class="MuiTypography-root MuiTypography-body1 css-bm69r4" style="margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-family: Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif; line-height: 1.8; font-size: 1.1rem; text-align: justify; letter-spacing: normal; background-color: rgb(250, 250, 250);">Oferecemos assistência espiritual gratuita, orientação, consolação e ensinamentos para todos que nos procuram, independentemente de sua condição social, raça ou credo religioso. Aqui, todos são bem-vindos e tratados como irmãos. Nossa comunidade se fortalece através da união, do respeito mútuo e da prática constante da caridade em todas as suas formas.</p>	Uma Jornada de Fé, Caridade e Amor ao próximo.	Nossa História	contato@casabatuara.org.br	https://maps.google.com/maps?q=Av.%20Brigadeiro%20Faria%20Lima%2C%202750%20-%20Jardim%20Cocaia%2C%20Guarulhos%20-%20SP%2C%2007130-000&z=17&output=embed	2750	Sao Paulo	00020126360014BR.GOV.BCB.PIX0114084885440001565204000053039865802BR5924Casa de Caridade Batuara6009Sao Paulo62070503***6304554C	Casa de Caridade Batuara	(11) 1234-5678	\N	\N	\N	SP	Av. Brigadeiro Faria Lima	\N	\N	\N	07130-000	Promover a caridade, o amor fraterno e a elevação espiritual através da Sabedoria Ancestral dos Orixás, Guias, Entidades e Mentores, oferecendo assistência espiritual gratuita a todos que buscam a LUZ.	data:image/png;base64,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
\.


--
-- Data for Name: SpiritualContents; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."SpiritualContents" ("Id", "Title", "Content", "Type", "Category", "Source", "DisplayOrder", "IsFeatured", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
3	Os Orixás na Visão da Casa Batuara	Os Orixás são manifestações divinas, aspectos de Deus que se apresentam para nos ensinar e orientar. Cada Orixá representa virtudes e qualidades que devemos desenvolver em nós mesmos.\r\n\r\nNa Casa Batuara, compreendemos os Orixás como:\r\n\r\nOXALÁ - O Pai Criador, que nos ensina a paz, a paciência e a sabedoria.\r\nYEMANJÁ - A Mãe Universal, que nos ensina o amor incondicional e a proteção.\r\nIANSÃ - A Guerreira da Justiça, que nos ensina a coragem e a determinação.\r\nOGUM - O Trabalhador Incansável, que nos ensina a perseverança e a honestidade.\r\n\r\nCada Orixá tem seus ensinamentos específicos, mas todos nos conduzem ao mesmo objetivo: a evolução espiritual através do amor e da caridade.	3	4	Apostila Batuara 2024	3	t	2026-04-02 14:36:08.524449+00	2026-04-02 14:36:08.524449+00	t
4	Oração de Caritas	Deus, nosso Pai, que sois todo poder e bondade,\nDai força àquele que passa pela provação,\nDai luz àquele que procura a verdade,\nPonde no coração do homem a compaixão e a caridade.\n\nDeus! Dai ao viajor a estrela guia,\nAo aflito a consolação,\nAo doente o repouso.\n\nPai! Dai ao culpado o arrependimento,\nAo espírito a verdade,\nÀ criança o guia,\nAo órfão o pai.\n\nSenhor! Que a vossa bondade se estenda sobre tudo o que criastes.\nPiedade, Senhor, para aqueles que vos não conhecem,\nEsperança para aqueles que sofrem.\n\nQue a vossa bondade permita aos espíritos consoladores\nDerramarem por toda parte a paz, a esperança e a fé.	1	2	Apostila Batuara 2024	3	t	2026-04-02 14:36:08.524449+00	2026-04-02 14:36:08.524449+00	t
5	Oração a Oxalá	Salve Oxalá, Pai de todos os Orixás,\nSenhor da paz e da harmonia,\nQue vossa luz ilumine nossos caminhos,\nE vossa sabedoria guie nossos passos.\n\nOxalá, Pai da criação,\nDai-nos força para vencer as dificuldades,\nPaciência para suportar as provações,\nE amor para perdoar as ofensas.\n\nQue vossa benção esteja sempre conosco,\nProtegendo nossa família e nossos irmãos.	1	4	Apostila Batuara 2024	4	t	2026-04-02 14:36:08.524449+00	2026-04-02 14:36:08.52445+00	t
6	Oração do Médium	Senhor Jesus, que sois o caminho, a verdade e a vida,\nIluminai-me para que eu possa ser um instrumento de vossa paz.\n\nQue os espíritos de luz me assistam nesta tarefa sagrada,\nE que eu possa transmitir apenas palavras de consolação,\nEsperança e amor aos corações aflitos.\n\nAfastai de mim toda vaidade e orgulho,\nPara que eu seja apenas um canal humilde\nDe vossa infinita misericórdia.	1	2	Apostila Batuara 2024	5	f	2026-04-02 14:36:08.52445+00	2026-04-02 14:36:08.52445+00	t
1	Pai Nosso da Umbanda	Pai nosso que estais no infinito,\r\nSantificado seja o vosso reino de luz.\r\nVenha a nós a vossa paz,\r\nSeja feita a vossa vontade,\r\nAssim na Terra como no infinito.\r\n\r\nO pão nosso de cada dia nos dai hoje,\r\nPerdoai as nossas dívidas,\r\nAssim como nós perdoamos aos nossos devedores.\r\nNão nos deixeis cair em tentação,\r\nMas livrai-nos de todo mal.\r\n\r\nPorque vosso é o reino,\r\nO poder e a glória,\r\nPara todo o sempre.\r\nSaravá!	1	1	Apostila Batuara 2024	1	t	2026-04-02 14:36:08.52365+00	2026-04-02 18:32:28.981706+00	t
2	A Caridade Segundo os Ensinamentos da Casa Batuara	A caridade é o fundamento de toda a nossa doutrina. Não se trata apenas de dar esmolas ou ajudar materialmente, mas sim de amar verdadeiramente ao próximo como a nós mesmos.\r\n\r\nA verdadeira caridade começa no coração. É preciso ter compaixão, compreensão e amor por todos os seres, independentemente de sua condição social, raça ou religião.\r\n\r\nNa Casa Batuara, praticamos a caridade de várias formas:\r\n- Através da assistência espiritual gratuita\r\n- Do atendimento aos necessitados\r\n- Da orientação e consolação aos aflitos\r\n- Do ensino da doutrina espírita e umbandista\r\n- Da promoção da fraternidade entre todos\r\n\r\nLembrem-se sempre: "Fora da caridade não há salvação".	2	3	Apostila Batuara 2024	2	t	2026-04-02 14:36:08.524446+00	2026-04-02 18:32:28.981706+00	t
7	Pai Nosso de Oxalá	Pai nosso que estais no infinito,\r\nTodo poder é vosso,\r\nSantificado seja o vosso nome,\r\nVenha a nós a vossa paz,\r\nPois só na paz podemos encontrar a luz.\r\n\r\nEu sou vosso filho (a) e busco vossa orientação,\r\nConcedei-me a sabedoria para seguir pelo caminho do bem,\r\nA paciência para aceitar o que não posso mudar,\r\nE a coragem para mudar o que posso.\r\n\r\nGuiai-me pela estrada da caridade,\r\nPara que eu possa servir aos meus irmãos,\r\nE assim encontrar a verdadeira paz,\r\nQue só vossa luz pode proporcionar.\r\n\r\nEpa babá! Oxalá!	1	4	Apostila Batuara 2024	3	f	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
8	Canto a Iemanjá	Iemanjá, mãe querida,\r\nRainha do mar e das águas,\r\nAcolhei-me em vossos braços,\r\nComo uma criança que volta para casa.\r\n\r\nÓ doce mãe, dai-me vossa bênção,\r\nPara viver com amor e esperança,\r\nQue vossa luz me guie,\r\nNas horas de escuridão.\r\n\r\nOdocya, Odocya, Odocya!\r\nMãe Iemanjá, abraça-me!\r\nEu sou seu filho (a),\r\nE volto para os seus braços!\r\n\r\nSalve Iemanjá!	4	1	Apostila Batuara 2024	4	t	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
\.


--
-- Data for Name: UmbandaLines; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."UmbandaLines" ("Id", "Name", "Description", "Characteristics", "BatuaraInterpretation", "DisplayOrder", "Entities", "WorkingDays", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
3	Linha dos Caboclos	A Linha dos Caboclos trabalha com as energias da natureza, da cura através das ervas, da força e da conexão com os elementos naturais.	Os Caboclos são espíritos de índios que trabalham com a força da natureza, conhecimento das ervas medicinais, proteção e cura. São guerreiros da luz que defendem a justiça e protegem os necessitados.	Na Casa Batuara, os Caboclos são nossos grandes protetores e curadores. Eles nos ensinam o respeito pela natureza e o uso das plantas para a cura. Nossos Caboclos trabalham com muita força e determinação, sempre prontos a defender seus filhos e a promover a justiça. Eles nos orientam sobre a importância de viver em harmonia com a natureza e de usar seus recursos com sabedoria e gratidão.	3	["Caboclo Pena Verde", "Cabocla Jurema", "Caboclo Sete Flechas", "Cabocla Jandira", "Caboclo Tupinambá"]	["Terça-feira", "Quinta-feira"]	2026-04-02 14:36:08.48552+00	2026-04-02 14:36:08.48552+00	t
5	Linha de Ogum (Linha da Lei e da Ordem)	Linha regida por Ogum, focada na manutenção da lei e ordem espiritual. Atua na quebra de demandas negativas e proteção através da força e justiça.	Quebra de demandas, justiça, força, desobsessão	Regida por Ogum. Entidades em destaque: Caboclos guerreiros, Soldados espirituais.	2	["Caboclos guerreiros", "Soldados espirituais"]	["Segunda-feira", "Quinta-feira"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
6	Linha de Oxóssi (Linha do Conhecimento)	Regida por Oxóssi, esta linha trabalha com a sabedoria ancestral, cura através da natureza e abertura de caminhos para o conhecimento espiritual.	Sabedoria, cura, abertura de caminhos, natureza	Regida por Oxóssi. Entidades em destaque: Caboclos caçadores, Mestres do conhecimento.	3	["Caboclos caçadores", "Mestres do conhecimento"]	["Terça-feira", "Quinta-feira"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
7	Linha de Xangô (Linha da Justiça)	Linha regida por Xangô, focada na aplicação da justiça divina e equilíbrio espiritual através da sabedoria ancestral dos Pretos-Velhos juristas.	Justiça, equilíbrio, sabedoria ancestral	Regida por Xangô. Entidades em destaque: Pretos-Velhos juristas, Juízes espirituais.	4	["Pretos-Velhos juristas", "Juízes espirituais"]	["Segunda-feira", "Quarta-feira"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
8	Linha de Iemanjá (Linha do Amor e da Geração)	Regida por Iemanjá, mãe de todos os Orixás. Esta linha trabalha com as emoções, proteção familiar, gestação e acolhimento maternal.	Emoções, família, gestação, acolhimento	Regida por Iemanjá. Entidades em destaque: Marinheiros, Iabás, Mães espirituais.	5	["Marinheiros", "Iabás", "Mães espirituais"]	["Sábado", "Segunda-feira"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
9	Linha de Iansã (Linha das Almas e Espíritos)	Linha regida por Iansã, senhora dos ventos e das almas. Trabalha com espíritos em trânsito, auxiliando no desencarne e purificação energética.	Desencarne, passagem, purificação energética	Regida por Iansã. Entidades em destaque: Eguns, Espíritos em trânsito, Mensageiros.	6	["Eguns", "Espíritos em trânsito", "Mensageiros"]	["Quarta-feira", "Domingo"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
10	Linha de Exu (Linha da Comunicação e Movimento)	Regida por Exu e Pomba Gira, esta linha trabalha como comunicadora entre os mundos espiritual e material, abrindo caminhos e oferecendo proteção.	Comunicação entre mundos, abertura de caminhos, proteção	Regida por Exu e Pomba Gira. Entidades em destaque: Exus, Pombas Giras, Guardiões.	7	["Exus", "Pombas Giras", "Guardiões"]	["Segunda-feira", "Quarta-feira"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
4	Linha de Oxalá (Linha da Fé)	Regida por Oxalá, o Pai maior e luz divina. Esta linha trabalha com a iluminação espiritual, fortalecimento da fé e promoção da paz interior através da caridade.	Iluminação, fé, equilíbrio, paz, caridade	Regida por Oxalá. Entidades em destaque: Cristos, Anjos, Espíritos elevados, Guias da luz.	1	["Cristos", "Anjos", "Espíritos elevados", "Guias da luz"]	["Domingo", "Sexta-feira"]	2026-04-02 18:32:28.981706+00	2026-06-20 20:04:24.9762+00	f
2	Linha de Yemanjá	A Linha de Yemanjá trabalha com as energias do amor maternal, da proteção, da cura emocional e da purificação através das águas.	Entidades desta linha são conhecidas por seu amor maternal, proteção às famílias, cura de traumas emocionais e limpeza espiritual. Trabalham especialmente com mulheres, crianças e questões familiares.	Na Casa Batuara, a Linha de Yemanjá é muito querida e respeitada. Nossos guias desta linha são verdadeiras mães espirituais que acolhem a todos com amor incondicional. Eles trabalham principalmente na cura emocional, na proteção das famílias e na orientação para as mães. Ensinam-nos que o amor de mãe é a força mais poderosa para a cura e transformação.	2	["Mãe Yara", "Sereia do Mar", "Cabocla Jurema", "Vovó Cambinda", "Mãe Oxum"]	["Sábado", "Segunda-feira"]	2026-04-02 14:36:08.485519+00	2026-06-20 20:08:13.924866+00	t
1	Linha de Oxalá	A Linha de Oxalá é a linha da paz, da fé e da elevação espiritual. Trabalha com a energia da criação, da purificação e da conexão com o divino.	Entidades desta linha trabalham com energias de paz, harmonia, fé, purificação espiritual e elevação da consciência. São espíritos de grande luz que auxiliam na cura espiritual e no desenvolvimento mediúnico.	Na Casa Batuara, a Linha de Oxalá é considerada a linha mestra, aquela que rege todas as outras. Nossos guias desta linha nos ensinam que a verdadeira força está na humildade e no amor. Eles trabalham principalmente na cura espiritual, no desenvolvimento da mediunidade e na orientação para a evolução espiritual. São espíritos de grande elevação que nos ajudam a compreender os ensinamentos de Jesus.	1	["Pai João de Oxalá", "Vovô Benedito", "Pai Francisco", "Vovó Maria Conga", "Caboclo Pena Branca"]	["Domingo", "Quinta-feira"]	2026-04-02 14:36:08.485323+00	2026-06-20 20:07:18.324943+00	t
\.


--
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: batuara; Owner: batuara_user
--

COPY batuara."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
20260522223141_AddPixQrCodeBase64	9.0.14
\.


--
-- Name: CalendarAttendances_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: batuara_user
--

SELECT pg_catalog.setval('batuara."CalendarAttendances_Id_seq"', 105, true);


--
-- Name: ContactMessages_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: batuara_user
--

SELECT pg_catalog.setval('batuara."ContactMessages_Id_seq"', 5, true);


--
-- Name: Events_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: batuara_user
--

SELECT pg_catalog.setval('batuara."Events_Id_seq"', 23, true);


--
-- Name: Guides_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: batuara_user
--

SELECT pg_catalog.setval('batuara."Guides_Id_seq"', 15, true);


--
-- Name: HouseMemberContributions_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: batuara_user
--

SELECT pg_catalog.setval('batuara."HouseMemberContributions_Id_seq"', 4, true);


--
-- Name: HouseMembers_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: batuara_user
--

SELECT pg_catalog.setval('batuara."HouseMembers_Id_seq"', 4, true);


--
-- Name: Orixas_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: batuara_user
--

SELECT pg_catalog.setval('batuara."Orixas_Id_seq"', 18, true);


--
-- Name: SiteSettings_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: batuara_user
--

SELECT pg_catalog.setval('batuara."SiteSettings_Id_seq"', 1, true);


--
-- Name: SpiritualContents_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: batuara_user
--

SELECT pg_catalog.setval('batuara."SpiritualContents_Id_seq"', 8, true);


--
-- Name: UmbandaLines_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: batuara_user
--

SELECT pg_catalog.setval('batuara."UmbandaLines_Id_seq"', 10, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 4HCL3ySJzVajOJSNiPCQnqePWOai7snV0cEGqCZndHDwZUIfGIfBagbWtgUIEUQ

