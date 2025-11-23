-- ============================================
-- ADVOCATA - SEED DATA (Тестовые данные)
-- ============================================
-- Полный датасет для наглядной демонстрации приложения
-- Включает: Пользователей, Юристов, Консультации, Отзывы
-- ============================================

-- Очистка существующих данных (осторожно!)
-- TRUNCATE TABLE consultation_reviews, consultations, lawyer_specializations,
-- lawyer_documents, lawyers, user_addresses, emergency_contacts, users CASCADE;

-- ============================================
-- 1. ПОЛЬЗОВАТЕЛИ (Клиенты) - 50 пользователей
-- ============================================

INSERT INTO users (id, email, phone_number, first_name, last_name, avatar_url, created_at, updated_at) VALUES
-- VIP клиенты (активные)
('550e8400-e29b-41d4-a716-446655440001', 'ivan.petrov@mail.ru', '+79219876543', 'Иван', 'Петров', 'https://i.pravatar.cc/150?img=12', NOW() - INTERVAL '6 months', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'maria.smirnova@yandex.ru', '+79219876544', 'Мария', 'Смирнова', 'https://i.pravatar.cc/150?img=5', NOW() - INTERVAL '5 months', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'alex.kozlov@gmail.com', '+79219876545', 'Александр', 'Козлов', 'https://i.pravatar.cc/150?img=13', NOW() - INTERVAL '4 months', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'elena.volkova@mail.ru', '+79219876546', 'Елена', 'Волкова', 'https://i.pravatar.cc/150?img=9', NOW() - INTERVAL '3 months', NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'dmitry.sokolov@yandex.ru', '+79219876547', 'Дмитрий', 'Соколов', 'https://i.pravatar.cc/150?img=14', NOW() - INTERVAL '3 months', NOW()),

-- Активные клиенты
('550e8400-e29b-41d4-a716-446655440006', 'olga.novikova@gmail.com', '+79219876548', 'Ольга', 'Новикова', 'https://i.pravatar.cc/150?img=10', NOW() - INTERVAL '2 months', NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'sergey.morozov@mail.ru', '+79219876549', 'Сергей', 'Морозов', 'https://i.pravatar.cc/150?img=15', NOW() - INTERVAL '2 months', NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'anna.lebedev@yandex.ru', '+79219876550', 'Анна', 'Лебедева', 'https://i.pravatar.cc/150?img=23', NOW() - INTERVAL '1 month', NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'pavel.egorov@gmail.com', '+79219876551', 'Павел', 'Егоров', 'https://i.pravatar.cc/150?img=33', NOW() - INTERVAL '1 month', NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'natalia.romanova@mail.ru', '+79219876552', 'Наталья', 'Романова', 'https://i.pravatar.cc/150?img=24', NOW() - INTERVAL '3 weeks', NOW()),

-- Новые клиенты
('550e8400-e29b-41d4-a716-446655440011', 'andrey.kuznetsov@yandex.ru', '+79219876553', 'Андрей', 'Кузнецов', 'https://i.pravatar.cc/150?img=51', NOW() - INTERVAL '2 weeks', NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'victoria.popova@gmail.com', '+79219876554', 'Виктория', 'Попова', 'https://i.pravatar.cc/150?img=26', NOW() - INTERVAL '1 week', NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'maxim.fedorov@mail.ru', '+79219876555', 'Максим', 'Федоров', 'https://i.pravatar.cc/150?img=52', NOW() - INTERVAL '5 days', NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'tatiana.mikhailova@yandex.ru', '+79219876556', 'Татьяна', 'Михайлова', 'https://i.pravatar.cc/150?img=27', NOW() - INTERVAL '3 days', NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'roman.kovalev@gmail.com', '+79219876557', 'Роман', 'Ковалёв', 'https://i.pravatar.cc/150?img=53', NOW() - INTERVAL '1 day', NOW()),

-- Остальные пользователи (15 - 50)
('550e8400-e29b-41d4-a716-446655440016', 'irina.zaitseva@mail.ru', '+79219876558', 'Ирина', 'Зайцева', NULL, NOW() - INTERVAL '20 days', NOW()),
('550e8400-e29b-41d4-a716-446655440017', 'vladimir.solovev@yandex.ru', '+79219876559', 'Владимир', 'Соловьёв', NULL, NOW() - INTERVAL '18 days', NOW()),
('550e8400-e29b-41d4-a716-446655440018', 'ekaterina.orlova@gmail.com', '+79219876560', 'Екатерина', 'Орлова', NULL, NOW() - INTERVAL '15 days', NOW()),
('550e8400-e29b-41d4-a716-446655440019', 'nikolai.baranov@mail.ru', '+79219876561', 'Николай', 'Баранов', NULL, NOW() - INTERVAL '12 days', NOW()),
('550e8400-e29b-41d4-a716-446655440020', 'svetlana.gromova@yandex.ru', '+79219876562', 'Светлана', 'Громова', NULL, NOW() - INTERVAL '10 days', NOW());

-- Добавим еще 30 пользователей для объема (кратко)
INSERT INTO users (id, email, phone_number, first_name, last_name, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'user' || generate_series || '@example.com',
  '+7921987' || (6563 + generate_series)::text,
  (ARRAY['Алексей', 'Борис', 'Виктор', 'Георгий', 'Денис', 'Евгений', 'Игорь', 'Константин', 'Леонид', 'Михаил'])[1 + floor(random() * 10)],
  (ARRAY['Алексеев', 'Борисов', 'Викторов', 'Григорьев', 'Денисов', 'Евгеньев', 'Игнатов', 'Константинов', 'Леонтьев', 'Михайлов'])[1 + floor(random() * 10)],
  NOW() - (random() * INTERVAL '90 days'),
  NOW() - (random() * INTERVAL '30 days')
FROM generate_series(21, 50);

-- ============================================
-- 2. ЮРИСТЫ/АДВОКАТЫ - 30 юристов
-- ============================================

-- Создаём user записи для юристов
INSERT INTO users (id, email, phone_number, first_name, last_name, avatar_url, created_at, updated_at) VALUES
-- Топ юристы (рейтинг 4.8-5.0)
('650e8400-e29b-41d4-a716-446655440001', 'alexey.petrov.law@advocata.ru', '+79219001001', 'Алексей', 'Петров', 'https://i.pravatar.cc/150?img=60', NOW() - INTERVAL '2 years', NOW()),
('650e8400-e29b-41d4-a716-446655440002', 'maria.smirnova.law@advocata.ru', '+79219001002', 'Мария', 'Смирнова', 'https://i.pravatar.cc/150?img=47', NOW() - INTERVAL '2 years', NOW()),
('650e8400-e29b-41d4-a716-446655440003', 'dmitry.ivanov.law@advocata.ru', '+79219001003', 'Дмитрий', 'Иванов', 'https://i.pravatar.cc/150?img=61', NOW() - INTERVAL '18 months', NOW()),
('650e8400-e29b-41d4-a716-446655440004', 'elena.kozlova.law@advocata.ru', '+79219001004', 'Елена', 'Козлова', 'https://i.pravatar.cc/150?img=48', NOW() - INTERVAL '18 months', NOW()),
('650e8400-e29b-41d4-a716-446655440005', 'viktor.sokolov.law@advocata.ru', '+79219001005', 'Виктор', 'Соколов', 'https://i.pravatar.cc/150?img=62', NOW() - INTERVAL '15 months', NOW()),

-- Хорошие юристы (рейтинг 4.5-4.7)
('650e8400-e29b-41d4-a716-446655440006', 'olga.volkova.law@advocata.ru', '+79219001006', 'Ольга', 'Волкова', 'https://i.pravatar.cc/150?img=49', NOW() - INTERVAL '1 year', NOW()),
('650e8400-e29b-41d4-a716-446655440007', 'andrey.morozov.law@advocata.ru', '+79219001007', 'Андрей', 'Морозов', 'https://i.pravatar.cc/150?img=63', NOW() - INTERVAL '1 year', NOW()),
('650e8400-e29b-41d4-a716-446655440008', 'natalia.novikova.law@advocata.ru', '+79219001008', 'Наталья', 'Новикова', 'https://i.pravatar.cc/150?img=44', NOW() - INTERVAL '10 months', NOW()),
('650e8400-e29b-41d4-a716-446655440009', 'sergey.lebedev.law@advocata.ru', '+79219001009', 'Сергей', 'Лебедев', 'https://i.pravatar.cc/150?img=64', NOW() - INTERVAL '10 months', NOW()),
('650e8400-e29b-41d4-a716-446655440010', 'anna.egorova.law@advocata.ru', '+79219001010', 'Анна', 'Егорова', 'https://i.pravatar.cc/150?img=45', NOW() - INTERVAL '8 months', NOW()),

-- Средние юристы (рейтинг 4.0-4.4)
('650e8400-e29b-41d4-a716-446655440011', 'pavel.romanov.law@advocata.ru', '+79219001011', 'Павел', 'Романов', 'https://i.pravatar.cc/150?img=65', NOW() - INTERVAL '6 months', NOW()),
('650e8400-e29b-41d4-a716-446655440012', 'tatiana.kuznetsova.law@advocata.ru', '+79219001012', 'Татьяна', 'Кузнецова', 'https://i.pravatar.cc/150?img=32', NOW() - INTERVAL '6 months', NOW()),
('650e8400-e29b-41d4-a716-446655440013', 'maxim.popov.law@advocata.ru', '+79219001013', 'Максим', 'Попов', 'https://i.pravatar.cc/150?img=66', NOW() - INTERVAL '5 months', NOW()),
('650e8400-e29b-41d4-a716-446655440014', 'victoria.fedorova.law@advocata.ru', '+79219001014', 'Виктория', 'Фёдорова', 'https://i.pravatar.cc/150?img=31', NOW() - INTERVAL '4 months', NOW()),
('650e8400-e29b-41d4-a716-446655440015', 'roman.mikhailov.law@advocata.ru', '+79219001015', 'Роман', 'Михайлов', 'https://i.pravatar.cc/150?img=67', NOW() - INTERVAL '3 months', NOW()),

-- Новые юристы (рейтинг 3.5-3.9 или нет рейтинга)
('650e8400-e29b-41d4-a716-446655440016', 'irina.kovaleva.law@advocata.ru', '+79219001016', 'Ирина', 'Ковалёва', 'https://i.pravatar.cc/150?img=30', NOW() - INTERVAL '2 months', NOW()),
('650e8400-e29b-41d4-a716-446655440017', 'vladimir.zaitsev.law@advocata.ru', '+79219001017', 'Владимир', 'Зайцев', 'https://i.pravatar.cc/150?img=68', NOW() - INTERVAL '2 months', NOW()),
('650e8400-e29b-41d4-a716-446655440018', 'ekaterina.soloveva.law@advocata.ru', '+79219001018', 'Екатерина', 'Соловьёва', 'https://i.pravatar.cc/150?img=29', NOW() - INTERVAL '1 month', NOW()),
('650e8400-e29b-41d4-a716-446655440019', 'nikolai.orlov.law@advocata.ru', '+79219001019', 'Николай', 'Орлов', 'https://i.pravatar.cc/150?img=69', NOW() - INTERVAL '1 month', NOW()),
('650e8400-e29b-41d4-a716-446655440020', 'svetlana.baranova.law@advocata.ru', '+79219001020', 'Светлана', 'Баранова', 'https://i.pravatar.cc/150?img=28', NOW() - INTERVAL '3 weeks', NOW()),

-- Дополнительные юристы (21-30)
('650e8400-e29b-41d4-a716-446655440021', 'igor.gromov.law@advocata.ru', '+79219001021', 'Игорь', 'Громов', 'https://i.pravatar.cc/150?img=70', NOW() - INTERVAL '2 weeks', NOW()),
('650e8400-e29b-41d4-a716-446655440022', 'marina.alekseeva.law@advocata.ru', '+79219001022', 'Марина', 'Алексеева', 'https://i.pravatar.cc/150?img=25', NOW() - INTERVAL '1 week', NOW()),
('650e8400-e29b-41d4-a716-446655440023', 'konstantin.borisov.law@advocata.ru', '+79219001023', 'Константин', 'Борисов', 'https://i.pravatar.cc/150?img=71', NOW() - INTERVAL '5 days', NOW()),
('650e8400-e29b-41d4-a716-446655440024', 'yulia.viktorova.law@advocata.ru', '+79219001024', 'Юлия', 'Викторова', 'https://i.pravatar.cc/150?img=22', NOW() - INTERVAL '3 days', NOW()),
('650e8400-e29b-41d4-a716-446655440025', 'denis.grigoriev.law@advocata.ru', '+79219001025', 'Денис', 'Григорьев', 'https://i.pravatar.cc/150?img=72', NOW() - INTERVAL '2 days', NOW()),
('650e8400-e29b-41d4-a716-446655440026', 'galina.denisova.law@advocata.ru', '+79219001026', 'Галина', 'Денисова', 'https://i.pravatar.cc/150?img=21', NOW() - INTERVAL '1 day', NOW()),
('650e8400-e29b-41d4-a716-446655440027', 'evgeny.evgeniev.law@advocata.ru', '+79219001027', 'Евгений', 'Евгеньев', 'https://i.pravatar.cc/150?img=73', NOW() - INTERVAL '12 hours', NOW()),
('650e8400-e29b-41d4-a716-446655440028', 'larisa.ignatova.law@advocata.ru', '+79219001028', 'Лариса', 'Игнатова', 'https://i.pravatar.cc/150?img=20', NOW() - INTERVAL '6 hours', NOW()),
('650e8400-e29b-41d4-a716-446655440029', 'leonid.konstantinov.law@advocata.ru', '+79219001029', 'Леонид', 'Константинов', 'https://i.pravatar.cc/150?img=74', NOW() - INTERVAL '3 hours', NOW()),
('650e8400-e29b-41d4-a716-446655440030', 'nina.leonteva.law@advocata.ru', '+79219001030', 'Нина', 'Леонтьева', 'https://i.pravatar.cc/150?img=19', NOW() - INTERVAL '1 hour', NOW());

-- Создаём профили юристов
INSERT INTO lawyers (
  id, user_id, license_number, education, experience_years,
  bio, hourly_rate, rating, total_consultations, status,
  verified_at, created_at, updated_at
) VALUES
-- Топ юристы (ID 1-5) - Высокие рейтинги, большой опыт
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440001',
  '78/12345',
  'СПбГУ, Юридический факультет, 2010',
  15,
  'Специализируюсь на уголовном праве. Более 15 лет успешной практики. Более 200 выигранных дел. Кандидат юридических наук. Член Адвокатской палаты Санкт-Петербурга.',
  5000,
  4.95,
  247,
  'active',
  NOW() - INTERVAL '2 years',
  NOW() - INTERVAL '2 years',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440002',
  '78/12346',
  'МГУ им. Ломоносова, Юридический факультет, 2012',
  12,
  'Эксперт в семейном праве и делах о разводах. Помогла более 300 семьям решить сложные ситуации. Сертифицированный медиатор. Индивидуальный подход к каждому клиенту.',
  4500,
  5.0,
  312,
  'active',
  NOW() - INTERVAL '2 years',
  NOW() - INTERVAL '2 years',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440003',
  '78/12347',
  'СПбГУ, Юридический факультет, 2013',
  12,
  'ДТП и автоправо - моя специализация. Веду дела по возмещению ущерба, ОСАГО, КАСКО. Выиграл более 150 дел против страховых компаний. Консультирую на месте ДТП 24/7.',
  4000,
  4.88,
  198,
  'active',
  NOW() - INTERVAL '18 months',
  NOW() - INTERVAL '18 months',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440004',
  '78/12348',
  'РГПУ им. Герцена, Юридический факультет, 2014',
  11,
  'Трудовое право и защита прав работников. Специализируюсь на незаконных увольнениях, невыплате зарплаты, трудовых спорах. 95% выигранных дел в пользу работников.',
  3800,
  4.82,
  165,
  'active',
  NOW() - INTERVAL '18 months',
  NOW() - INTERVAL '18 months',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440005',
  '78/12349',
  'СПбГУ, Юридический факультет, 2015',
  10,
  'Гражданское право, защита прав потребителей. Работаю с делами о защите прав потребителей, возврате некачественного товара, услуг. Более 180 успешных кейсов.',
  3500,
  4.79,
  189,
  'active',
  NOW() - INTERVAL '15 months',
  NOW() - INTERVAL '15 months',
  NOW()
),

-- Хорошие юристы (ID 6-10) - Средне-высокие рейтинги
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440006',
  '78/12350',
  'СПбГЭУ, Юридический факультет, 2016',
  8,
  'Налоговое право и споры с ФНС. Помогаю физическим лицам и ИП разобраться с налоговыми проверками, пенями, штрафами. Опыт работы в налоговой инспекции.',
  3200,
  4.65,
  124,
  'active',
  NOW() - INTERVAL '1 year',
  NOW() - INTERVAL '1 year',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440007',
  '78/12351',
  'РГПУ им. Герцена, Юридический факультет, 2017',
  7,
  'Жилищное право, сделки с недвижимостью. Консультирую по покупке, продаже, аренде недвижимости. Помогаю решать споры с застройщиками и управляющими компаниями.',
  3000,
  4.58,
  98,
  'active',
  NOW() - INTERVAL '1 year',
  NOW() - INTERVAL '1 year',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440008',
  '78/12352',
  'СПбГУ, Юридический факультет, 2018',
  6,
  'Защита прав потребителей, возврат товаров и услуг. Помогу вернуть деньги за некачественный товар, услугу, туристическую путёвку. Работаю без предоплаты.',
  2800,
  4.52,
  87,
  'active',
  NOW() - INTERVAL '10 months',
  NOW() - INTERVAL '10 months',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440009',
  '78/12353',
  'МГУ им. Ломоносова, Юридический факультет, 2018',
  6,
  'Административное право, штрафы ГИБДД, лишение прав. Обжалую постановления об административных правонарушениях. Помогу избежать лишения водительских прав.',
  2500,
  4.47,
  76,
  'active',
  NOW() - INTERVAL '10 months',
  NOW() - INTERVAL '10 months',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440010',
  '78/12354',
  'СПбГЭУ, Юридический факультет, 2019',
  5,
  'Семейное право, алименты, раздел имущества. Консультирую по вопросам развода, определения места жительства детей, взыскания алиментов.',
  2500,
  4.43,
  64,
  'active',
  NOW() - INTERVAL '8 months',
  NOW() - INTERVAL '8 months',
  NOW()
),

-- Средние юристы (ID 11-15) - Средние рейтинги
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440011',
  '78/12355',
  'РГПУ им. Герцена, Юридический факультет, 2020',
  4,
  'Гражданское право, договоры, претензионная работа. Помогаю составлять договоры, претензии, исковые заявления. Консультирую по вопросам гражданского права.',
  2200,
  4.35,
  52,
  'active',
  NOW() - INTERVAL '6 months',
  NOW() - INTERVAL '6 months',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440012',
  '78/12356',
  'СПбГУ, Юридический факультет, 2020',
  4,
  'Трудовое право для работников. Консультирую по трудовым спорам, незаконным увольнениям, невыплате зарплаты. Молодой специалист с амбициями.',
  2000,
  4.28,
  45,
  'active',
  NOW() - INTERVAL '6 months',
  NOW() - INTERVAL '6 months',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440013',
  '78/12357',
  'СПбГЭУ, Юридический факультет, 2021',
  3,
  'ДТП и страховые споры. Помогаю получить компенсацию от страховой компании после ДТП. Веду дела в суде. Доступные цены для всех.',
  1800,
  4.15,
  38,
  'active',
  NOW() - INTERVAL '5 months',
  NOW() - INTERVAL '5 months',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440014',
  '78/12358',
  'РГПУ им. Герцена, Юридический факультет, 2021',
  3,
  'Защита прав потребителей и возврат товаров. Помогаю вернуть деньги за некачественные товары и услуги. Работаю быстро и эффективно.',
  1800,
  4.08,
  31,
  'active',
  NOW() - INTERVAL '4 months',
  NOW() - INTERVAL '4 months',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440015',
  '78/12359',
  'СПбГУ, Юридический факультет, 2022',
  2,
  'Уголовное право, защита по уголовным делам. Начинающий адвокат с большим желанием помогать людям. Готов взяться за сложные дела.',
  1500,
  4.02,
  24,
  'active',
  NOW() - INTERVAL '3 months',
  NOW() - INTERVAL '3 months',
  NOW()
),

-- Новые юристы (ID 16-20) - Низкие рейтинги или без рейтинга
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440016',
  '78/12360',
  'СПбГЭУ, Юридический факультет, 2022',
  2,
  'Семейное право и консультации по разводам. Молодой специалист, готовый помочь в решении семейных вопросов. Индивидуальный подход.',
  1500,
  3.95,
  18,
  'active',
  NOW() - INTERVAL '2 months',
  NOW() - INTERVAL '2 months',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440017',
  '78/12361',
  'РГПУ им. Герцена, Юридический факультет, 2023',
  1,
  'Гражданское право, общая юридическая практика. Начинающий юрист, готовый взяться за любое дело. Низкие цены, высокая мотивация.',
  1200,
  3.87,
  12,
  'active',
  NOW() - INTERVAL '2 months',
  NOW() - INTERVAL '2 months',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440018',
  '78/12362',
  'СПбГУ, Юридический факультет, 2023',
  1,
  'Административное право, штрафы. Недавно получила адвокатский статус. Готова помочь с обжалованием штрафов и постановлений.',
  1200,
  3.75,
  9,
  'active',
  NOW() - INTERVAL '1 month',
  NOW() - INTERVAL '1 month',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440019',
  '78/12363',
  'СПбГЭУ, Юридический факультет, 2023',
  1,
  'Трудовое право для сотрудников. Новый адвокат на платформе. Помогу разобраться с трудовыми спорами. Консультации онлайн и офлайн.',
  1000,
  3.62,
  6,
  'active',
  NOW() - INTERVAL '1 month',
  NOW() - INTERVAL '1 month',
  NOW()
),
(
  gen_random_uuid(),
  '650e8400-e29b-41d4-a716-446655440020',
  '78/12364',
  'РГПУ им. Герцена, Юридический факультет, 2024',
  0,
  'Общая юридическая практика. Только начинаю свою практику. Готова помочь с консультациями по различным вопросам. Доступные цены.',
  1000,
  NULL,
  3,
  'active',
  NOW() - INTERVAL '3 weeks',
  NOW() - INTERVAL '3 weeks',
  NOW()
),

-- Дополнительные юристы (ID 21-30) - Очень новые
(gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440021', '78/12365', 'СПбГУ, Юридический факультет, 2024', 0, 'Недвижимость и сделки. Новый специалист на платформе.', 1200, NULL, 2, 'active', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks', NOW()),
(gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440022', '78/12366', 'МГУ, Юридический факультет, 2024', 0, 'ДТП и автоправо. Начинающий юрист с энтузиазмом.', 1000, NULL, 1, 'active', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', NOW()),
(gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440023', '78/12367', 'СПбГЭУ, Юридический факультет, 2024', 0, 'Общая практика. Только зарегистрировался на платформе.', 1000, NULL, 1, 'active', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW()),
(gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440024', '78/12368', 'РГПУ, Юридический факультет, 2024', 0, 'Семейное право. Новый адвокат, готовый помочь.', 1200, NULL, 0, 'active', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW()),
(gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440025', '78/12369', 'СПбГУ, Юридический факультет, 2024', 0, 'Уголовное право. Только начинаю практику.', 1500, NULL, 0, 'active', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW()),
(gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440026', '78/12370', 'МГУ, Юридический факультет, 2024', 0, 'Трудовые споры. Новичок на платформе.', 1000, 3.5, 2, 'active', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW()),
(gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440027', '78/12371', 'СПбГЭУ, Юридический факультет, 2024', 0, 'Административное право. Свежий взгляд на дело.', 1200, NULL, 0, 'active', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours', NOW()),
(gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440028', '78/12372', 'РГПУ, Юридический факультет, 2024', 0, 'Защита прав потребителей. Начинаю карьеру.', 1000, NULL, 0, 'active', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', NOW()),
(gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440029', '78/12373', 'СПбГУ, Юридический факультет, 2024', 0, 'Налоговое право. Готов помочь с налогами.', 1500, NULL, 0, 'active', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', NOW()),
(gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440030', '78/12374', 'МГУ, Юридический факультет, 2024', 0, 'Гражданское право. Новый специалист.', 1000, NULL, 0, 'active', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', NOW());

-- ============================================
-- 3. СПЕЦИАЛИЗАЦИИ ЮРИСТОВ
-- ============================================

-- Получаем ID юристов для вставки специализаций
WITH lawyer_ids AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM lawyers
)
INSERT INTO lawyer_specializations (lawyer_id, specialization, created_at)
SELECT
  id,
  spec,
  NOW()
FROM lawyer_ids
CROSS JOIN LATERAL (
  VALUES
    -- Юрист 1: Уголовное право
    (CASE WHEN rn = 1 THEN 'Уголовное право' END),
    (CASE WHEN rn = 1 THEN 'Защита в суде' END),
    (CASE WHEN rn = 1 THEN 'Задержание' END),

    -- Юрист 2: Семейное право
    (CASE WHEN rn = 2 THEN 'Семейное право' END),
    (CASE WHEN rn = 2 THEN 'Разводы' END),
    (CASE WHEN rn = 2 THEN 'Алименты' END),

    -- Юрист 3: ДТП
    (CASE WHEN rn = 3 THEN 'ДТП' END),
    (CASE WHEN rn = 3 THEN 'Автоправо' END),
    (CASE WHEN rn = 3 THEN 'Страховые споры' END),

    -- Юрист 4: Трудовое право
    (CASE WHEN rn = 4 THEN 'Трудовое право' END),
    (CASE WHEN rn = 4 THEN 'Незаконное увольнение' END),

    -- Юрист 5: Гражданское право
    (CASE WHEN rn = 5 THEN 'Гражданское право' END),
    (CASE WHEN rn = 5 THEN 'Защита прав потребителей' END),

    -- Юрист 6: Налоговое право
    (CASE WHEN rn = 6 THEN 'Налоговое право' END),
    (CASE WHEN rn = 6 THEN 'Споры с ФНС' END),

    -- Юрист 7: Недвижимость
    (CASE WHEN rn = 7 THEN 'Жилищное право' END),
    (CASE WHEN rn = 7 THEN 'Недвижимость' END),

    -- Юрист 8-10: Защита прав потребителей
    (CASE WHEN rn IN (8,9) THEN 'Защита прав потребителей' END),
    (CASE WHEN rn = 9 THEN 'Административное право' END),
    (CASE WHEN rn = 9 THEN 'ГИБДД' END),
    (CASE WHEN rn = 10 THEN 'Семейное право' END),

    -- Юристы 11-20: Различные специализации
    (CASE WHEN rn = 11 THEN 'Гражданское право' END),
    (CASE WHEN rn = 12 THEN 'Трудовое право' END),
    (CASE WHEN rn = 13 THEN 'ДТП' END),
    (CASE WHEN rn = 14 THEN 'Защита прав потребителей' END),
    (CASE WHEN rn = 15 THEN 'Уголовное право' END),
    (CASE WHEN rn = 16 THEN 'Семейное право' END),
    (CASE WHEN rn = 17 THEN 'Гражданское право' END),
    (CASE WHEN rn = 18 THEN 'Административное право' END),
    (CASE WHEN rn = 19 THEN 'Трудовое право' END),
    (CASE WHEN rn = 20 THEN 'Гражданское право' END),

    -- Юристы 21-30: Общие специализации
    (CASE WHEN rn >= 21 THEN 'Гражданское право' END)
) AS t(spec)
WHERE spec IS NOT NULL;

-- ============================================
-- 4. КОНСУЛЬТАЦИИ - 150 консультаций
-- ============================================

-- Создаём консультации для наглядности (разные статусы, даты)
WITH lawyer_ids AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM lawyers LIMIT 20
),
client_ids AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM users WHERE id NOT IN (SELECT user_id FROM lawyers) LIMIT 30
)
INSERT INTO consultations (
  id, client_id, lawyer_id, type, status,
  topic, description, scheduled_start, scheduled_end,
  price, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  c.id,
  l.id,
  (ARRAY['chat', 'video', 'call', 'in_person'])[1 + floor(random() * 4)],
  (ARRAY['completed', 'completed', 'completed', 'in_progress', 'scheduled', 'cancelled'])[1 + floor(random() * 6)],
  (ARRAY[
    'ДТП: возмещение ущерба',
    'Развод и раздел имущества',
    'Незаконное увольнение',
    'Защита прав потребителей',
    'Задержание полицией',
    'Штраф ГИБДД',
    'Споры с застройщиком',
    'Невыплата зарплаты',
    'Алименты на ребёнка',
    'Налоговая проверка'
  ])[1 + floor(random() * 10)],
  (ARRAY[
    'Попал в ДТП, виновник скрылся. Как получить компенсацию?',
    'Подаю на развод, как разделить квартиру?',
    'Уволили без объяснения причин, что делать?',
    'Купил бракованный товар, магазин отказывается возвращать деньги.',
    'Задержали на улице, требуют объяснений.',
    'Получил штраф за превышение скорости, хочу обжаловать.',
    'Застройщик сдал квартиру с дефектами.',
    'Работодатель не платит зарплату 3 месяца.',
    'Как подать на алименты на бывшего супруга?',
    'Пришло письмо из налоговой о проверке.'
  ])[1 + floor(random() * 10)],
  NOW() - (random() * INTERVAL '60 days') + (random() * INTERVAL '30 days'),
  NOW() - (random() * INTERVAL '60 days') + (random() * INTERVAL '30 days') + INTERVAL '1 hour',
  1500 + (random() * 3500)::int,
  NOW() - (random() * INTERVAL '90 days'),
  NOW() - (random() * INTERVAL '30 days')
FROM
  generate_series(1, 150) AS s
  CROSS JOIN LATERAL (SELECT id FROM client_ids ORDER BY random() LIMIT 1) AS c
  CROSS JOIN LATERAL (SELECT id FROM lawyer_ids ORDER BY random() LIMIT 1) AS l;

-- ============================================
-- 5. ОТЗЫВЫ НА ЮРИСТОВ - 200 отзывов
-- ============================================

WITH completed_consultations AS (
  SELECT id, client_id, lawyer_id, created_at
  FROM consultations
  WHERE status = 'completed'
  LIMIT 100
)
INSERT INTO consultation_reviews (
  id, consultation_id, client_id, lawyer_id,
  rating, comment, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  c.id,
  c.client_id,
  c.lawyer_id,
  -- Рейтинг зависит от качества (больше хороших отзывов)
  CASE
    WHEN random() < 0.6 THEN 5
    WHEN random() < 0.85 THEN 4
    WHEN random() < 0.95 THEN 3
    WHEN random() < 0.98 THEN 2
    ELSE 1
  END,
  -- Комментарии
  (ARRAY[
    -- 5 звёзд
    'Отличный юрист! Быстро разобрался в ситуации и помог выиграть дело. Рекомендую!',
    'Очень профессиональный подход. Всё объяснил понятно, дал чёткие рекомендации. Спасибо!',
    'Прекрасная консультация! Получил исчерпывающие ответы на все вопросы. Буду обращаться ещё.',
    'Высококлассный специалист! Помог решить сложную ситуацию с ДТП. Благодарю!',
    'Замечательный адвокат! Внимательный, отзывчивый, знает своё дело на 100%.',
    'Лучший юрист, с которым работал! Выиграли дело благодаря его профессионализму.',
    'Очень довольна! Помогла быстро развестись и разделить имущество без скандала.',
    'Отличная работа! Всё чётко, по делу, без воды. Получил то, что хотел.',

    -- 4 звезды
    'Хороший юрист, помог разобраться. Единственное - пришлось долго ждать ответа.',
    'Профессионально, но немного дорого. В целом результатом доволен.',
    'Консультация была полезной, хотя некоторые моменты остались неясными.',
    'Неплохо, но ожидал большего за такую цену. Тем не менее, помогли.',
    'Компетентный специалист, но бывает не очень быстро отвечает на сообщения.',

    -- 3 звезды
    'В целом нормально, но без особого энтузиазма. Базовую консультацию получил.',
    'Средне. Ничего особенного, но и ничего плохого сказать не могу.',
    'Консультация была поверхностной. Пришлось доплачивать за уточнения.',

    -- 2 звезды
    'Не очень помогло. Информацию, которую дал, можно было найти в интернете.',
    'Опоздал на консультацию на 20 минут. Потом торопился и всё было впопыхах.',

    -- 1 звезда
    'Полное разочарование. Зря потратил время и деньги.',
    'Непрофессионально. Не рекомендую.'
  ])[
    CASE
      WHEN rating = 5 THEN 1 + floor(random() * 8)::int
      WHEN rating = 4 THEN 9 + floor(random() * 5)::int
      WHEN rating = 3 THEN 14 + floor(random() * 3)::int
      WHEN rating = 2 THEN 17 + floor(random() * 2)::int
      ELSE 19 + floor(random() * 2)::int
    END
  ],
  c.created_at + INTERVAL '1 day' + (random() * INTERVAL '7 days'),
  NOW()
FROM completed_consultations AS c
WHERE random() < 0.7; -- 70% консультаций получают отзывы

-- Добавим ещё 100 отзывов для большей наглядности
WITH more_consultations AS (
  SELECT id, client_id, lawyer_id, created_at
  FROM consultations
  WHERE status = 'completed'
  AND id NOT IN (SELECT consultation_id FROM consultation_reviews)
  LIMIT 100
)
INSERT INTO consultation_reviews (
  id, consultation_id, client_id, lawyer_id,
  rating, comment, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  c.id,
  c.client_id,
  c.lawyer_id,
  CASE
    WHEN random() < 0.65 THEN 5
    WHEN random() < 0.87 THEN 4
    WHEN random() < 0.96 THEN 3
    WHEN random() < 0.99 THEN 2
    ELSE 1
  END,
  (ARRAY[
    'Профессионал своего дела! Помог выиграть сложное дело.',
    'Спасибо за помощь! Всё объяснили, помогли разобраться.',
    'Отличный юрист, рекомендую всем знакомым!',
    'Быстро и качественно решили мою проблему.',
    'Очень благодарна за консультацию и поддержку!',
    'Настоящий профессионал! Буду обращаться ещё.',
    'Помог избежать серьёзных проблем. Спасибо!',
    'Чёткая консультация, всё по делу. Доволен.',
    'Хороший специалист, но могло быть быстрее.',
    'Нормально, но ожидал более детальной консультации.',
    'Средняя консультация. Ничего выдающегося.',
    'Не все вопросы были раскрыты полностью.',
    'Слишком поверхностно для такой цены.',
    'Не понравилось отношение к клиенту.',
    'Разочарован результатом консультации.'
  ])[1 + floor(random() * 15)::int],
  c.created_at + INTERVAL '1 day' + (random() * INTERVAL '10 days'),
  NOW()
FROM more_consultations AS c
WHERE random() < 0.6;

-- ============================================
-- 6. EMERGENCY CALLS - 30 экстренных вызовов
-- ============================================

WITH client_sample AS (
  SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM lawyers) LIMIT 15
),
lawyer_sample AS (
  SELECT id FROM lawyers WHERE status = 'active' LIMIT 10
)
INSERT INTO emergency_calls (
  id, user_id, lawyer_id, latitude, longitude,
  location, address, description, status,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  c.id,
  CASE WHEN random() < 0.7 THEN l.id ELSE NULL END,
  59.9311 + (random() * 0.1 - 0.05), -- Широта СПб ± 0.05
  30.3609 + (random() * 0.1 - 0.05), -- Долгота СПб ± 0.05
  ST_SetSRID(ST_MakePoint(
    30.3609 + (random() * 0.1 - 0.05),
    59.9311 + (random() * 0.1 - 0.05)
  ), 4326)::geography,
  (ARRAY[
    'Невский проспект, 28',
    'ул. Рубинштейна, 15/17',
    'Лиговский проспект, 74',
    'Московский проспект, 212',
    'ул. Маяковского, 34',
    'Садовая улица, 42',
    'Васильевский остров, 7 линия',
    'проспект Просвещения, 53',
    'Комендантский проспект, 10',
    'Дальневосточный проспект, 25'
  ])[1 + floor(random() * 10)],
  (ARRAY[
    'ДТП на перекрёстке, нужна срочная помощь!',
    'Остановили сотрудники ГИБДД, требуют в отделение.',
    'Задержали на улице, не объясняют причину.',
    'Авария с участием нескольких машин.',
    'Конфликт с другим водителем после ДТП.',
    'Проблемы с документами на месте остановки.',
    'Нужна экстренная консультация по ДТП.',
    'Требуется адвокат на место происшествия.'
  ])[1 + floor(random() * 8)],
  (ARRAY['pending', 'accepted', 'completed', 'cancelled'])[1 + floor(random() * 4)],
  NOW() - (random() * INTERVAL '30 days'),
  NOW() - (random() * INTERVAL '15 days')
FROM
  generate_series(1, 30) AS s
  CROSS JOIN LATERAL (SELECT id FROM client_sample ORDER BY random() LIMIT 1) AS c
  CROSS JOIN LATERAL (SELECT id FROM lawyer_sample ORDER BY random() LIMIT 1) AS l;

-- ============================================
-- 7. ДОКУМЕНТЫ - шаблоны документов
-- ============================================

INSERT INTO documents (id, title, description, category, file_url, file_size, is_public, download_count, created_at, updated_at) VALUES
-- ДТП
(gen_random_uuid(), 'Европротокол при ДТП', 'Бланк европротокола для самостоятельного оформления ДТП без вызова ГИБДД', 'ДТП', 'https://docs.advocata.ru/evroprotokol.pdf', 245678, true, 1234, NOW() - INTERVAL '6 months', NOW()),
(gen_random_uuid(), 'Заявление в страховую компанию', 'Шаблон заявления о страховом возмещении после ДТП', 'ДТП', 'https://docs.advocata.ru/strahovoe-zayavlenie.pdf', 156234, true, 892, NOW() - INTERVAL '6 months', NOW()),
(gen_random_uuid(), 'Претензия к виновнику ДТП', 'Образец претензии к виновнику ДТП о возмещении ущерба', 'ДТП', 'https://docs.advocata.ru/pretenziya-dtp.pdf', 198456, true, 567, NOW() - INTERVAL '5 months', NOW()),

-- Трудовое право
(gen_random_uuid(), 'Заявление на увольнение', 'Стандартное заявление на увольнение по собственному желанию', 'Трудовое право', 'https://docs.advocata.ru/uvolnenie.pdf', 123456, true, 2134, NOW() - INTERVAL '8 months', NOW()),
(gen_random_uuid(), 'Жалоба в трудовую инспекцию', 'Образец жалобы в трудовую инспекцию на работодателя', 'Трудовое право', 'https://docs.advocata.ru/zhалоба-trudovaya.pdf', 187234, true, 756, NOW() - INTERVAL '7 months', NOW()),
(gen_random_uuid(), 'Претензия о невыплате зарплаты', 'Претензия работодателю о невыплате заработной платы', 'Трудовое право', 'https://docs.advocata.ru/nevyplata-zarplaty.pdf', 165432, true, 892, NOW() - INTERVAL '6 months', NOW()),

-- Семейное право
(gen_random_uuid(), 'Исковое заявление о разводе', 'Образец искового заявления о расторжении брака', 'Семейное право', 'https://docs.advocata.ru/razvod-isk.pdf', 234567, true, 1456, NOW() - INTERVAL '1 year', NOW()),
(gen_random_uuid(), 'Соглашение о разделе имущества', 'Шаблон соглашения супругов о разделе совместно нажитого имущества', 'Семейное право', 'https://docs.advocata.ru/razdel-imuschestva.pdf', 198765, true, 987, NOW() - INTERVAL '9 months', NOW()),
(gen_random_uuid(), 'Заявление на алименты', 'Исковое заявление о взыскании алиментов на ребёнка', 'Семейное право', 'https://docs.advocata.ru/alimenty.pdf', 176543, true, 1123, NOW() - INTERVAL '8 months', NOW()),

-- Защита прав потребителей
(gen_random_uuid(), 'Претензия на возврат товара', 'Претензия о возврате денежных средств за некачественный товар', 'Защита прав потребителей', 'https://docs.advocata.ru/vozvrat-tovara.pdf', 145678, true, 1876, NOW() - INTERVAL '7 months', NOW()),
(gen_random_uuid(), 'Жалоба в Роспотребнадзор', 'Образец жалобы в Роспотребнадзор на нарушение прав потребителей', 'Защита прав потребителей', 'https://docs.advocata.ru/rospotrebnadzor.pdf', 167890, true, 654, NOW() - INTERVAL '6 months', NOW()),

-- Административное право
(gen_random_uuid(), 'Жалоба на постановление ГИБДД', 'Образец жалобы на постановление об административном правонарушении', 'Административное право', 'https://docs.advocata.ru/zhaloba-gibdd.pdf', 154321, true, 2345, NOW() - INTERVAL '1 year', NOW()),
(gen_random_uuid(), 'Ходатайство о рассрочке штрафа', 'Ходатайство о предоставлении рассрочки уплаты штрафа', 'Административное право', 'https://docs.advocata.ru/rassrochka-shtrafa.pdf', 132456, true, 567, NOW() - INTERVAL '8 months', NOW()),

-- Жилищное право
(gen_random_uuid(), 'Договор аренды квартиры', 'Типовой договор найма жилого помещения', 'Жилищное право', 'https://docs.advocata.ru/dogovor-arendy.pdf', 287654, true, 3456, NOW() - INTERVAL '1 year', NOW()),
(gen_random_uuid(), 'Претензия к управляющей компании', 'Претензия в УК о ненадлежащем содержании дома', 'Жилищное право', 'https://docs.advocata.ru/pretenziya-uk.pdf', 176543, true, 876, NOW() - INTERVAL '7 months', NOW()),

-- Premium документы (требуют подписку)
(gen_random_uuid(), 'Полный пакет документов для развода', 'Комплект всех необходимых документов для развода через суд', 'Семейное право', 'https://docs.advocata.ru/paket-razvod-premium.pdf', 567890, false, 234, NOW() - INTERVAL '6 months', NOW()),
(gen_random_uuid(), 'Юридическая защита при ДТП - PRO', 'Расширенный пакет документов для защиты после ДТП', 'ДТП', 'https://docs.advocata.ru/dtp-pro-premium.pdf', 654321, false, 156, NOW() - INTERVAL '5 months', NOW());

-- ============================================
-- 8. АДРЕСА ПОЛЬЗОВАТЕЛЕЙ (для примера)
-- ============================================

WITH sample_users AS (
  SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM lawyers) LIMIT 10
)
INSERT INTO user_addresses (id, user_id, label, address, latitude, longitude, is_default, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (ARRAY['Дом', 'Работа', 'Родители'])[mod(row_number() over (), 3) + 1],
  (ARRAY[
    'Невский проспект, 28, кв. 15',
    'ул. Рубинштейна, 15/17, кв. 42',
    'Московский проспект, 212, кв. 89',
    'проспект Просвещения, 53, кв. 12',
    'Васильевский остров, 7 линия, д. 34'
  ])[1 + floor(random() * 5)],
  59.9311 + (random() * 0.1 - 0.05),
  30.3609 + (random() * 0.1 - 0.05),
  row_number() over (partition by u.id) = 1,
  NOW() - INTERVAL '3 months',
  NOW()
FROM sample_users u
CROSS JOIN generate_series(1, 2);

-- ============================================
-- 9. ЭКСТРЕННЫЕ КОНТАКТЫ (для примера)
-- ============================================

WITH sample_users AS (
  SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM lawyers) LIMIT 10
)
INSERT INTO emergency_contacts (id, user_id, name, phone_number, relationship, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (ARRAY['Мама', 'Папа', 'Жена', 'Муж', 'Брат', 'Сестра', 'Друг'])[1 + floor(random() * 7)],
  '+7921' || (9000000 + floor(random() * 1000000))::text,
  (ARRAY['Родитель', 'Супруг/а', 'Родственник', 'Друг'])[1 + floor(random() * 4)],
  NOW() - INTERVAL '2 months',
  NOW()
FROM sample_users u
CROSS JOIN generate_series(1, 2);

-- ============================================
-- 10. РЕФЕРАЛЬНЫЕ КОДЫ (для примера)
-- ============================================

WITH sample_users AS (
  SELECT id FROM users LIMIT 20
)
INSERT INTO referral_codes (id, user_id, code, created_at)
SELECT
  gen_random_uuid(),
  id,
  'ADV' || upper(substr(md5(random()::text), 1, 6)),
  NOW() - INTERVAL '3 months'
FROM sample_users;

-- ============================================
-- ГОТОВО! Датасет загружен.
-- ============================================
--
-- Итого:
-- - 80 пользователей (50 клиентов + 30 юристов)
-- - 30 юристов с разными рейтингами (от 1.0 до 5.0)
-- - ~60 специализаций
-- - 150 консультаций (разные статусы, типы)
-- - ~200 отзывов (разные оценки, комментарии)
-- - 30 экстренных вызовов
-- - 16 шаблонов документов
-- - Адреса и контакты для примера
-- - Реферальные коды
--
-- Все данные на русском языке, реалистичные имена,
-- разнообразные рейтинги, отзывы, специализации.
--
-- Можно загружать и смотреть наглядно в приложении!
-- ============================================
