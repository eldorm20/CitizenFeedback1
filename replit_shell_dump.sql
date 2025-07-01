--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comment_likes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comment_likes (
    id integer NOT NULL,
    comment_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comment_likes OWNER TO neondb_owner;

--
-- Name: comment_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.comment_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comment_likes_id_seq OWNER TO neondb_owner;

--
-- Name: comment_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.comment_likes_id_seq OWNED BY public.comment_likes.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    content text NOT NULL,
    post_id integer NOT NULL,
    author_id integer NOT NULL,
    likes integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comments OWNER TO neondb_owner;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO neondb_owner;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.post_likes (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.post_likes OWNER TO neondb_owner;

--
-- Name: post_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.post_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.post_likes_id_seq OWNER TO neondb_owner;

--
-- Name: post_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.post_likes_id_seq OWNED BY public.post_likes.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL,
    district text NOT NULL,
    status text DEFAULT 'new'::text,
    image_url text,
    author_id integer NOT NULL,
    likes integer DEFAULT 0,
    views integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text
);


ALTER TABLE public.posts OWNER TO neondb_owner;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO neondb_owner;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    avatar text,
    is_admin boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role text DEFAULT 'user'::text,
    district text,
    department text
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: comment_likes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_likes ALTER COLUMN id SET DEFAULT nextval('public.comment_likes_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: post_likes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.post_likes ALTER COLUMN id SET DEFAULT nextval('public.post_likes_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: comment_likes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.comment_likes (id, comment_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.comments (id, content, post_id, author_id, likes, created_at) FROM stdin;
1	Полностью поддерживаю! Эта дорога в ужасном состоянии. Уже несколько машин сломались из-за этих ям.	1	4	3	2025-06-30 09:53:26.526039
2	Когда планируется начало ремонтных работ? Ситуация критическая!	1	5	1	2025-06-30 21:53:26.526039
3	У нас такая же проблема! Надеюсь, власти обратят внимание.	2	3	2	2025-06-30 15:53:26.526039
4	Отличная инициатива! Наши дети тоже нуждаются в безопасном месте для игр.	4	5	5	2025-07-01 07:53:26.526039
5	Готов лично участвовать в финансировании детской площадки. Как можно связаться с инициативной группой?	4	3	2	2025-07-01 08:53:26.526039
6	Спасибо за оперативное решение проблемы с водой! Теперь все работает нормально.	3	4	8	2025-06-28 09:53:26.526039
\.


--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.post_likes (id, post_id, user_id, created_at) FROM stdin;
1	5	1	2025-07-01 09:53:59.584685
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.posts (id, title, content, category, district, status, image_url, author_id, likes, views, created_at, updated_at, description) FROM stdin;
1	Разбитая дорога на улице Навои	На улице Навои возле дома №15 образовались огромные ямы глубиной до 30 см. Это создает серьезную опасность для автомобилей и пешеходов. Проблема особенно критична в темное время суток.	Дороги	Юнусабадский	in_progress	\N	3	15	125	2025-06-29 09:53:15.659982	2025-07-01 09:53:15.659982	Огромные ямы на главной дороге создают опасность для водителей
2	Отсутствие освещения в микрорайоне	В микрорайоне "Олтин Водий" не работает уличное освещение. Жители вынуждены передвигаться в темноте, что создает угрозу безопасности, особенно для женщин и детей.	Безопасность	Сергелийский	new	\N	4	8	89	2025-06-30 09:53:15.659982	2025-07-01 09:53:15.659982	Уличные фонари не работают уже более месяца
3	Проблемы с водоснабжением	В 12-м микрорайоне Чиланзара уже неделю нет горячей воды. Управляющая компания не предоставляет четкой информации о сроках восстановления. Жители с маленькими детьми особенно страдают от этой ситуации.	Коммунальные услуги	Чиланзарский	resolved	\N	5	22	156	2025-06-26 09:53:15.659982	2025-07-01 09:53:15.659982	Перебои с горячей водой в 12-м микрорайоне
4	Инициатива: Детская площадка в Яшнабадском районе	Жители домов №45-55 по улице Бунёдкор просят рассмотреть возможность строительства детской площадки. В радиусе 500 метров нет места для детских игр. Готовы участвовать в финансировании проекта.	Благоустройство	Яшнабадский	new	\N	3	31	203	2025-07-01 06:53:15.659982	2025-07-01 09:53:15.659982	Предложение о строительстве современной детской площадки
5	Переполненные мусорные контейнеры	Мусорные контейнеры возле торгового центра "Саломат" переполнены. Мусор разбросан по территории, создавая антисанитарные условия и неприятный запах. Просим увеличить частоту вывоза с 2 до 3 раз в неделю.	Экология	Мирабадский	in_progress	\N	4	13	78	2025-07-01 03:53:15.659982	2025-07-01 09:53:15.659982	Необходимо увеличить частоту вывоза мусора
6	Svet	Assalomu aleykum, bizda svet yo'q	Коммунальные услуги	Юнусабадский	new	\N	1	0	0	2025-07-01 10:32:17.007735	2025-07-01 10:32:17.007735	Svet yo'q
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
f0FW5Rs82OjxGYUz6N3NwUN2-PRkNwf5	{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-02T10:43:15.486Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":9}}	2025-07-02 10:50:53
FtqNt3_HcI64eIblcH_4dVOhyvjehfWt	{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-02T09:42:54.744Z","secure":false,"httpOnly":true,"path":"/"}}	2025-07-02 09:42:55
OsL9373-rsiq2t0YNBkJKjbjuk2MntSY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-02T09:42:54.973Z","secure":false,"httpOnly":true,"path":"/"}}	2025-07-02 09:42:55
Kl3FPiIzs3Knqqtv8TIySaVlKgrZwIoC	{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-02T09:42:55.058Z","secure":false,"httpOnly":true,"path":"/"}}	2025-07-02 09:42:56
jA6Jn_OB5jsQCzrJr5ljienHP9ljnuZn	{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-02T09:42:55.059Z","secure":false,"httpOnly":true,"path":"/"}}	2025-07-02 09:42:56
hvRAQJ43kQcPohUFBjQQry1knS6Qo5pw	{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-02T10:22:19.429Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":7}}	2025-07-02 10:22:20
ynH36XGLMQDjlHJcFbg1zq_-Z8s6z2ae	{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-02T10:22:26.530Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":8}}	2025-07-02 10:22:27
TPpmf9srVEFZMmXcKyqE0DHZmLQFYxOp	{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-02T10:22:32.420Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":7}}	2025-07-02 10:22:33
cCMmU0vfibNvA7XXcZf6MgAnWHMIQCRf	{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-02T06:13:59.132Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-07-02 10:50:36
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, email, password, first_name, last_name, avatar, is_admin, created_at, role, district, department) FROM stdin;
1	alderson22	eldorbekmukhammadjonov@gmail.com	464f09131b338115366267122ae165dd8b6466fee15fab8ab7cd1e82a5257b5e02b6191fac44d630182b3342e43a7b6c8040059d5c24b104168e7be6c5da4012.afdabadfe7d74e5030d1e7fbce9f42e5	Eldorbek	Mukhammadjonov	\N	f	2025-07-01 06:13:59.089288	user	\N	\N
2	admin	admin@muloqotplus.uz	$2b$10$example_hash	Администратор	Системы	\N	f	2025-07-01 09:52:50.436774	admin	\N	\N
3	gov_user	gov@tashkent.uz	$2b$10$example_hash	Азиз	Каримов	\N	f	2025-07-01 09:52:50.436774	government	Юнусабадский	ЖКХ
4	citizen1	citizen1@mail.ru	$2b$10$example_hash	Анвар	Усманов	\N	f	2025-07-01 09:52:50.436774	user	\N	\N
5	citizen2	citizen2@gmail.com	$2b$10$example_hash	Дилноза	Абдуллаева	\N	f	2025-07-01 09:52:50.436774	user	\N	\N
6	citizen3	citizen3@mail.ru	$2b$10$example_hash	Фаррух	Нуриддинов	\N	f	2025-07-01 09:52:50.436774	user	\N	\N
8	admin_test	admin@test.uz	f0fcb69b43998eb75da53c60b29d9cd5a3412eef0292df62df725301cea8f691e347edba956bd2b253bcfd4aa59ceb41100d93a4e6faab736dd56ede54ffbd06.45b0f4b325054ef1841a21d5f2d2849b	Admin	User	\N	f	2025-07-01 10:22:26.491645	admin	\N	Ministry of Digital Technologies
9	vmahkama	vmahkama1@gmail.com	cce29123bea659964e0cf5b8e2f40b902e1bd4545abb11f26d26b6e0bdf05285255aecc0b5250334b933b7a2a00579b16d36da5228ee556b66a475d62069e77f.9acd2a001f6dda8d46bc5e6ee4c6f0e0	Vazirlar	Mahkamasi	\N	f	2025-07-01 10:23:55.032246	government	\N	O'zbekiston Respublikasi Vazirlar Mahkamasi
10	admin22	admin22@gmail.com	f347bb2f2101cb1bc630246b9ac5d748633ff31fc9128a59c3b61e289fdcbce46b80222f5f5e702760a4f516dbfeb1f797f025a8048378c1a72a8c8a6059d0ab.855de904fedb280354a732aa1adcf734	admin	admin	\N	t	2025-07-01 10:24:34.470279	admin	\N	administrator
7	gov_test	gov@test.uz	a43ad0636c6d1e817eae284291d8f3cd0572e5bdd3ab33dab08e091fa0b31070111551b54cba12542bd1b2f5533afca4e949929a3297bd19b504177540e0baa6.9984d9055ad5717e4ded020539ad1af1	Government	User	\N	f	2025-07-01 10:22:19.37348	government	\N	Test Department
\.


--
-- Name: comment_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.comment_likes_id_seq', 1, false);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.comments_id_seq', 6, true);


--
-- Name: post_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.post_likes_id_seq', 1, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.posts_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- Name: comment_likes comment_likes_comment_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_comment_id_user_id_key UNIQUE (comment_id, user_id);


--
-- Name: comment_likes comment_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_post_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: comment_likes comment_likes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comment_likes comment_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

