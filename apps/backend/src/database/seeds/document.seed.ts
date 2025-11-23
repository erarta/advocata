import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { LAWYER_IDS } from './lawyer.seed';

/**
 * Document Seed Data
 *
 * Creates 20 sample documents across various categories:
 * - Contracts (5)
 * - Court decisions (4)
 * - Laws (3)
 * - Regulations (3)
 * - Templates (3)
 * - Guides (2)
 *
 * Includes both public (knowledge base) and private documents.
 */

interface DocumentSeed {
  id: string;
  lawyerId: string;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  type: 'pdf' | 'image' | 'text';
  category:
    | 'contract'
    | 'court_decision'
    | 'law'
    | 'regulation'
    | 'template'
    | 'guide'
    | 'other';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  isPublic: boolean;
  tags: string[];
  metadata: Record<string, any>;
  processedAt: Date | null;
  errorMessage: string | null;
  chunkCount: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const documents: DocumentSeed[] = [
  // ===== CONTRACTS =====
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_5,
    title: 'Образец договора купли-продажи квартиры',
    description:
      'Типовой договор купли-продажи жилого помещения с комментариями юриста. Включает все необходимые условия и защитные механизмы.',
    fileName: 'dogovor-kupli-prodazhi-kvartiry.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/contracts/dogovor-kupli-prodazhi-kvartiry.pdf',
    fileSize: 245000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'contract',
    status: 'completed',
    isPublic: true,
    tags: ['купля-продажа', 'недвижимость', 'квартира', 'шаблон'],
    metadata: {
      author: 'Роман Павлов',
      jurisdiction: 'Российская Федерация',
      year: 2024,
      pageCount: 8,
    },
    processedAt: new Date('2024-10-15 14:30:00'),
    errorMessage: null,
    chunkCount: 12,
    createdAt: new Date('2024-10-15 10:00:00'),
    updatedAt: new Date('2024-10-15 14:30:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_3,
    title: 'Трудовой договор с сотрудником (образец)',
    description:
      'Типовой трудовой договор, соответствующий ТК РФ. С учетом последних изменений законодательства 2024 года.',
    fileName: 'trudovoy-dogovor-obrazets-2024.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/contracts/trudovoy-dogovor-obrazets-2024.pdf',
    fileSize: 180000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'contract',
    status: 'completed',
    isPublic: true,
    tags: ['трудовой договор', 'трудовое право', 'ТК РФ', 'шаблон'],
    metadata: {
      author: 'Владимир Сорокин',
      jurisdiction: 'Российская Федерация',
      year: 2024,
      pageCount: 6,
    },
    processedAt: new Date('2024-10-18 16:00:00'),
    errorMessage: null,
    chunkCount: 9,
    createdAt: new Date('2024-10-18 11:00:00'),
    updatedAt: new Date('2024-10-18 16:00:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_6,
    title: 'Договор аренды нежилого помещения (коммерческая)',
    description:
      'Договор аренды нежилого помещения для коммерческих целей. Подробные условия, расчет арендной платы, ответственность сторон.',
    fileName: 'arenda-nezhilogo-pomescheniya.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/contracts/arenda-nezhilogo-pomescheniya.pdf',
    fileSize: 320000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'contract',
    status: 'completed',
    isPublic: true,
    tags: ['аренда', 'коммерческая недвижимость', 'договор'],
    metadata: {
      author: 'Марина Карпова',
      jurisdiction: 'Российская Федерация',
      year: 2024,
      pageCount: 12,
    },
    processedAt: new Date('2024-10-20 12:45:00'),
    errorMessage: null,
    chunkCount: 18,
    createdAt: new Date('2024-10-20 09:00:00'),
    updatedAt: new Date('2024-10-20 12:45:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_4,
    title: 'Соглашение о разделе имущества супругов',
    description:
      'Образец соглашения о разделе совместно нажитого имущества. Альтернатива судебному разделу.',
    fileName: 'soglashenie-razdel-imuschestva.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/contracts/soglashenie-razdel-imuschestva.pdf',
    fileSize: 195000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'contract',
    status: 'completed',
    isPublic: true,
    tags: ['раздел имущества', 'семейное право', 'развод', 'соглашение'],
    metadata: {
      author: 'Татьяна Захарова',
      jurisdiction: 'Российская Федерация',
      year: 2024,
      pageCount: 5,
    },
    processedAt: new Date('2024-10-22 15:20:00'),
    errorMessage: null,
    chunkCount: 8,
    createdAt: new Date('2024-10-22 10:30:00'),
    updatedAt: new Date('2024-10-22 15:20:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_1,
    title: 'Договор ОСАГО - бланк и инструкция',
    description:
      'Бланк полиса ОСАГО с подробными инструкциями по заполнению и комментариями по страховым случаям.',
    fileName: 'osago-blank-instruktsiya.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/contracts/osago-blank-instruktsiya.pdf',
    fileSize: 280000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'contract',
    status: 'completed',
    isPublic: true,
    tags: ['ОСАГО', 'страхование', 'ДТП', 'автомобиль'],
    metadata: {
      author: 'Александр Громов',
      jurisdiction: 'Российская Федерация',
      year: 2024,
      pageCount: 10,
    },
    processedAt: new Date('2024-10-25 11:15:00'),
    errorMessage: null,
    chunkCount: 15,
    createdAt: new Date('2024-10-25 08:00:00'),
    updatedAt: new Date('2024-10-25 11:15:00'),
  },

  // ===== COURT DECISIONS =====
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_2,
    title:
      'Определение ВС РФ № 18-КГ23-147 по уголовному делу о мошенничестве',
    description:
      'Важное определение Верховного Суда по квалификации мошенничества в сфере предпринимательской деятельности.',
    fileName: 'vs-rf-18-kg23-147-moshennichestvo.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/court-decisions/vs-rf-18-kg23-147-moshennichestvo.pdf',
    fileSize: 450000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'court_decision',
    status: 'completed',
    isPublic: true,
    tags: [
      'Верховный Суд',
      'мошенничество',
      'предпринимательство',
      'уголовное дело',
    ],
    metadata: {
      court: 'Верховный Суд РФ',
      caseNumber: '18-КГ23-147',
      date: '2023-11-15',
      judge: 'Иванов И.И.',
      outcome: 'Кассационная жалоба удовлетворена частично',
    },
    processedAt: new Date('2024-10-28 13:30:00'),
    errorMessage: null,
    chunkCount: 22,
    createdAt: new Date('2024-10-28 09:00:00'),
    updatedAt: new Date('2024-10-28 13:30:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_1,
    title: 'Решение по делу о возмещении ущерба после ДТП',
    description:
      'Кейс успешного взыскания материального и морального вреда после ДТП. Интересная судебная практика.',
    fileName: 'reshenie-dtp-vozmeschenie-usherba-2024.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/court-decisions/reshenie-dtp-vozmeschenie-usherba-2024.pdf',
    fileSize: 380000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'court_decision',
    status: 'completed',
    isPublic: true,
    tags: ['ДТП', 'возмещение ущерба', 'моральный вред', 'судебная практика'],
    metadata: {
      court: 'Смольнинский районный суд г. Санкт-Петербурга',
      caseNumber: '2-1456/2024',
      date: '2024-09-20',
      outcome: 'Иск удовлетворен полностью',
    },
    processedAt: new Date('2024-10-30 14:00:00'),
    errorMessage: null,
    chunkCount: 18,
    createdAt: new Date('2024-10-30 10:00:00'),
    updatedAt: new Date('2024-10-30 14:00:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_3,
    title: 'Апелляционное определение по трудовому спору о незаконном увольнении',
    description:
      'Восстановление на работе, взыскание заработка за время вынужденного прогула. Положительное решение для работника.',
    fileName: 'apellyatsiya-trudovoy-spor-uvolnenie-2024.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/court-decisions/apellyatsiya-trudovoy-spor-uvolnenie-2024.pdf',
    fileSize: 295000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'court_decision',
    status: 'completed',
    isPublic: true,
    tags: [
      'трудовой спор',
      'незаконное увольнение',
      'восстановление на работе',
    ],
    metadata: {
      court: 'Санкт-Петербургский городской суд',
      caseNumber: '33-7890/2024',
      date: '2024-10-10',
      outcome: 'Апелляция удовлетворена, работник восстановлен',
    },
    processedAt: new Date('2024-11-01 16:45:00'),
    errorMessage: null,
    chunkCount: 14,
    createdAt: new Date('2024-11-01 11:00:00'),
    updatedAt: new Date('2024-11-01 16:45:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_8,
    title: 'Решение о признании сделки с недвижимостью недействительной',
    description:
      'Интересный кейс оспаривания сделки купли-продажи квартиры по мотивам введения в заблуждение.',
    fileName: 'osparivanie-sdelki-nedvizhimost-2024.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/court-decisions/osparivanie-sdelki-nedvizhimost-2024.pdf',
    fileSize: 410000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'court_decision',
    status: 'completed',
    isPublic: true,
    tags: [
      'недвижимость',
      'оспаривание сделки',
      'введение в заблуждение',
      'купля-продажа',
    ],
    metadata: {
      court: 'Московский районный суд г. Санкт-Петербурга',
      caseNumber: '2-3421/2024',
      date: '2024-10-05',
      outcome: 'Сделка признана недействительной',
    },
    processedAt: new Date('2024-11-03 12:20:00'),
    errorMessage: null,
    chunkCount: 20,
    createdAt: new Date('2024-11-03 09:00:00'),
    updatedAt: new Date('2024-11-03 12:20:00'),
  },

  // ===== LAWS =====
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_2,
    title: 'Уголовный кодекс РФ (УК РФ) - актуальная редакция 2024',
    description:
      'Полный текст Уголовного кодекса Российской Федерации с последними изменениями на ноябрь 2024 года.',
    fileName: 'uk-rf-2024-aktualnaya-redaktsiya.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/laws/uk-rf-2024-aktualnaya-redaktsiya.pdf',
    fileSize: 2800000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'law',
    status: 'completed',
    isPublic: true,
    tags: ['УК РФ', 'уголовный кодекс', 'законодательство', 'уголовное право'],
    metadata: {
      lawNumber: '63-ФЗ',
      adoptedDate: '1996-06-13',
      effectiveDate: '1997-01-01',
      lastAmendment: '2024-10-15',
      pageCount: 420,
    },
    processedAt: new Date('2024-11-05 18:00:00'),
    errorMessage: null,
    chunkCount: 350,
    createdAt: new Date('2024-11-05 10:00:00'),
    updatedAt: new Date('2024-11-05 18:00:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_3,
    title: 'Трудовой кодекс РФ (ТК РФ) - редакция 2024',
    description:
      'Действующая редакция Трудового кодекса РФ с комментариями по последним изменениям.',
    fileName: 'tk-rf-2024-s-izmeneniyami.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/laws/tk-rf-2024-s-izmeneniyami.pdf',
    fileSize: 1950000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'law',
    status: 'completed',
    isPublic: true,
    tags: ['ТК РФ', 'трудовой кодекс', 'трудовое право', 'законодательство'],
    metadata: {
      lawNumber: '197-ФЗ',
      adoptedDate: '2001-12-30',
      effectiveDate: '2002-02-01',
      lastAmendment: '2024-09-25',
      pageCount: 310,
    },
    processedAt: new Date('2024-11-06 15:30:00'),
    errorMessage: null,
    chunkCount: 280,
    createdAt: new Date('2024-11-06 09:00:00'),
    updatedAt: new Date('2024-11-06 15:30:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_4,
    title: 'Семейный кодекс РФ (СК РФ) - актуальная версия',
    description:
      'Семейный кодекс Российской Федерации. Регулирование семейных отношений, брака, развода, алиментов.',
    fileName: 'sk-rf-2024-aktualnaya-versiya.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/laws/sk-rf-2024-aktualnaya-versiya.pdf',
    fileSize: 980000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'law',
    status: 'completed',
    isPublic: true,
    tags: ['СК РФ', 'семейный кодекс', 'семейное право', 'законодательство'],
    metadata: {
      lawNumber: '223-ФЗ',
      adoptedDate: '1995-12-29',
      effectiveDate: '1996-03-01',
      lastAmendment: '2024-07-10',
      pageCount: 125,
    },
    processedAt: new Date('2024-11-07 13:00:00'),
    errorMessage: null,
    chunkCount: 110,
    createdAt: new Date('2024-11-07 10:00:00'),
    updatedAt: new Date('2024-11-07 13:00:00'),
  },

  // ===== REGULATIONS =====
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_1,
    title: 'ПП РФ № 1090 "О правилах дорожного движения"',
    description:
      'Постановление Правительства РФ о Правилах дорожного движения. Актуальная редакция.',
    fileName: 'pp-rf-1090-pdd-2024.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/regulations/pp-rf-1090-pdd-2024.pdf',
    fileSize: 750000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'regulation',
    status: 'completed',
    isPublic: true,
    tags: ['ПДД', 'правила дорожного движения', 'ДТП', 'автомобиль'],
    metadata: {
      regulationType: 'Постановление Правительства РФ',
      number: '1090',
      adoptedDate: '1993-10-23',
      lastAmendment: '2024-08-20',
      pageCount: 95,
    },
    processedAt: new Date('2024-11-08 14:45:00'),
    errorMessage: null,
    chunkCount: 85,
    createdAt: new Date('2024-11-08 10:00:00'),
    updatedAt: new Date('2024-11-08 14:45:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_7,
    title: 'НК РФ часть 1 и 2 - Налоговый кодекс с изменениями 2024',
    description:
      'Налоговый кодекс РФ (обе части). Все виды налогов, налоговый контроль, ответственность.',
    fileName: 'nk-rf-chasti-1-2-izmeneniya-2024.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/regulations/nk-rf-chasti-1-2-izmeneniya-2024.pdf',
    fileSize: 3200000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'regulation',
    status: 'completed',
    isPublic: true,
    tags: ['НК РФ', 'налоговый кодекс', 'налоги', 'законодательство'],
    metadata: {
      lawNumber: '146-ФЗ (часть 1), 117-ФЗ (часть 2)',
      part1AdoptedDate: '1998-07-31',
      part2AdoptedDate: '2000-08-05',
      lastAmendment: '2024-10-01',
      pageCount: 580,
    },
    processedAt: new Date('2024-11-09 17:30:00'),
    errorMessage: null,
    chunkCount: 480,
    createdAt: new Date('2024-11-09 09:00:00'),
    updatedAt: new Date('2024-11-09 17:30:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_6,
    title:
      'ФЗ "Об обществах с ограниченной ответственностью" (ФЗ-14) редакция 2024',
    description:
      'Федеральный закон об ООО. Создание, управление, реорганизация, ликвидация обществ.',
    fileName: 'fz-14-ob-ooo-redaktsiya-2024.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/regulations/fz-14-ob-ooo-redaktsiya-2024.pdf',
    fileSize: 650000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'regulation',
    status: 'completed',
    isPublic: true,
    tags: ['ООО', 'корпоративное право', 'бизнес', 'законодательство'],
    metadata: {
      lawNumber: '14-ФЗ',
      adoptedDate: '1998-02-08',
      effectiveDate: '1998-03-01',
      lastAmendment: '2024-06-15',
      pageCount: 78,
    },
    processedAt: new Date('2024-11-10 12:00:00'),
    errorMessage: null,
    chunkCount: 68,
    createdAt: new Date('2024-11-10 09:00:00'),
    updatedAt: new Date('2024-11-10 12:00:00'),
  },

  // ===== TEMPLATES =====
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_1,
    title: 'Исковое заявление о возмещении ущерба после ДТП (шаблон)',
    description:
      'Готовый шаблон искового заявления о взыскании ущерба с виновника ДТП или страховой компании.',
    fileName: 'iskovoe-zayavlenie-uscherb-dtp-shablon.docx',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/templates/iskovoe-zayavlenie-uscherb-dtp-shablon.docx',
    fileSize: 45000,
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    type: 'text',
    category: 'template',
    status: 'completed',
    isPublic: true,
    tags: ['исковое заявление', 'ДТП', 'возмещение ущерба', 'шаблон'],
    metadata: {
      author: 'Александр Громов',
      documentType: 'Исковое заявление',
      jurisdiction: 'Российская Федерация',
    },
    processedAt: new Date('2024-11-11 11:30:00'),
    errorMessage: null,
    chunkCount: 6,
    createdAt: new Date('2024-11-11 09:00:00'),
    updatedAt: new Date('2024-11-11 11:30:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_3,
    title: 'Заявление о восстановлении на работе (образец)',
    description:
      'Шаблон заявления о восстановлении на работе после незаконного увольнения.',
    fileName: 'zayavlenie-vosstanovlenie-na-rabote-obrazets.docx',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/templates/zayavlenie-vosstanovlenie-na-rabote-obrazets.docx',
    fileSize: 38000,
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    type: 'text',
    category: 'template',
    status: 'completed',
    isPublic: true,
    tags: [
      'восстановление на работе',
      'увольнение',
      'трудовое право',
      'шаблон',
    ],
    metadata: {
      author: 'Владимир Сорокин',
      documentType: 'Заявление',
      jurisdiction: 'Российская Федерация',
    },
    processedAt: new Date('2024-11-12 10:15:00'),
    errorMessage: null,
    chunkCount: 5,
    createdAt: new Date('2024-11-12 09:00:00'),
    updatedAt: new Date('2024-11-12 10:15:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_4,
    title: 'Исковое заявление о разводе (с детьми)',
    description:
      'Образец искового заявления о расторжении брака при наличии несовершеннолетних детей.',
    fileName: 'iskovoe-zayavlenie-razvod-s-detmi.docx',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/templates/iskovoe-zayavlenie-razvod-s-detmi.docx',
    fileSize: 42000,
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    type: 'text',
    category: 'template',
    status: 'completed',
    isPublic: true,
    tags: ['развод', 'семейное право', 'дети', 'исковое заявление', 'шаблон'],
    metadata: {
      author: 'Татьяна Захарова',
      documentType: 'Исковое заявление',
      jurisdiction: 'Российская Федерация',
    },
    processedAt: new Date('2024-11-13 14:00:00'),
    errorMessage: null,
    chunkCount: 7,
    createdAt: new Date('2024-11-13 10:00:00'),
    updatedAt: new Date('2024-11-13 14:00:00'),
  },

  // ===== GUIDES =====
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_1,
    title: 'Пошаговая инструкция: Что делать при ДТП?',
    description:
      'Подробная инструкция для водителей: действия на месте ДТП, документы, взаимодействие со страховой, обращение в суд.',
    fileName: 'poshagovaya-instruktsiya-chto-delat-pri-dtp.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/guides/poshagovaya-instruktsiya-chto-delat-pri-dtp.pdf',
    fileSize: 520000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'guide',
    status: 'completed',
    isPublic: true,
    tags: ['ДТП', 'инструкция', 'авария', 'страховая', 'европротокол'],
    metadata: {
      author: 'Александр Громов',
      year: 2024,
      pageCount: 18,
    },
    processedAt: new Date('2024-11-14 16:30:00'),
    errorMessage: null,
    chunkCount: 24,
    createdAt: new Date('2024-11-14 10:00:00'),
    updatedAt: new Date('2024-11-14 16:30:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_5,
    title: 'Руководство: Покупка квартиры - как избежать мошенничества',
    description:
      'Полное руководство по безопасной покупке недвижимости. Проверка документов, юридическая чистота, типичные схемы обмана.',
    fileName: 'rukovodstvo-pokupka-kvartiry-bezopasnost.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/guides/rukovodstvo-pokupka-kvartiry-bezopasnost.pdf',
    fileSize: 680000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'guide',
    status: 'completed',
    isPublic: true,
    tags: [
      'покупка квартиры',
      'недвижимость',
      'мошенничество',
      'безопасность',
      'проверка документов',
    ],
    metadata: {
      author: 'Роман Павлов',
      year: 2024,
      pageCount: 25,
    },
    processedAt: new Date('2024-11-15 15:00:00'),
    errorMessage: null,
    chunkCount: 32,
    createdAt: new Date('2024-11-15 09:00:00'),
    updatedAt: new Date('2024-11-15 15:00:00'),
  },

  // ===== PRIVATE DOCUMENTS (not in knowledge base) =====
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_2,
    title: 'Материалы дела №А40-123456/24 (конфиденциально)',
    description: 'Частные материалы по текущему уголовному делу клиента.',
    fileName: 'delo-a40-123456-24-materialy.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/private/delo-a40-123456-24-materialy.pdf',
    fileSize: 1250000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'other',
    status: 'completed',
    isPublic: false, // Private document
    tags: ['конфиденциально', 'уголовное дело', 'клиент'],
    metadata: {
      caseNumber: 'А40-123456/24',
      confidential: true,
    },
    processedAt: new Date('2024-11-16 12:00:00'),
    errorMessage: null,
    chunkCount: 45,
    createdAt: new Date('2024-11-16 09:00:00'),
    updatedAt: new Date('2024-11-16 12:00:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_6,
    title: 'Устав ООО "Клиент-Компания" (рабочая версия)',
    description: 'Проект устава для регистрации ООО клиента.',
    fileName: 'ustav-ooo-klient-kompaniya-proekt.docx',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/private/ustav-ooo-klient-kompaniya-proekt.docx',
    fileSize: 95000,
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    type: 'text',
    category: 'other',
    status: 'completed',
    isPublic: false,
    tags: ['устав', 'ООО', 'клиент', 'проект'],
    metadata: {
      clientName: 'ООО "Клиент-Компания"',
      confidential: true,
    },
    processedAt: new Date('2024-11-17 11:30:00'),
    errorMessage: null,
    chunkCount: 12,
    createdAt: new Date('2024-11-17 09:00:00'),
    updatedAt: new Date('2024-11-17 11:30:00'),
  },

  // ===== PROCESSING / FAILED DOCUMENTS =====
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_7,
    title: 'Налоговая декларация 3-НДФЛ (образец заполнения)',
    description:
      'Пример заполнения налоговой декларации 3-НДФЛ для физических лиц.',
    fileName: 'nalogovaya-deklaratsiya-3-ndfl-obrazets.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/templates/nalogovaya-deklaratsiya-3-ndfl-obrazets.pdf',
    fileSize: 420000,
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'template',
    status: 'processing', // Currently being processed
    isPublic: true,
    tags: ['3-НДФЛ', 'налоговая декларация', 'налоги', 'образец'],
    metadata: {
      author: 'Николай Степанов',
      year: 2024,
    },
    processedAt: null,
    errorMessage: null,
    chunkCount: null,
    createdAt: new Date('2024-11-18 09:00:00'),
    updatedAt: new Date('2024-11-18 09:15:00'),
  },
  {
    id: uuidv4(),
    lawyerId: LAWYER_IDS.LAWYER_8,
    title: 'Сканы свидетельств о праве собственности',
    description: 'Коллекция примеров свидетельств о праве собственности.',
    fileName: 'svidetelstva-pravo-sobstvennosti-skany.pdf',
    fileUrl:
      'https://advocata-storage.supabase.co/documents/guides/svidetelstva-pravo-sobstvennosti-skany.pdf',
    fileSize: 8500000, // Very large file
    mimeType: 'application/pdf',
    type: 'pdf',
    category: 'guide',
    status: 'failed', // Processing failed
    isPublic: true,
    tags: ['свидетельство', 'право собственности', 'недвижимость'],
    metadata: {
      author: 'Ирина Богданова',
    },
    processedAt: null,
    errorMessage: 'File size exceeds maximum limit. Processing failed.',
    chunkCount: null,
    createdAt: new Date('2024-11-17 14:00:00'),
    updatedAt: new Date('2024-11-17 14:05:00'),
  },
];

/**
 * Seed documents table
 */
export async function seedDocuments(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log('🌱 Seeding documents...');

    // Clear existing documents
    await queryRunner.query('DELETE FROM documents');
    console.log('   Cleared existing documents');

    // Insert documents
    for (const doc of documents) {
      await queryRunner.query(
        `
        INSERT INTO documents (
          id, "lawyerId", title, description, "fileName", "fileUrl",
          "fileSize", "mimeType", type, category, status, "isPublic",
          tags, metadata, "processedAt", "errorMessage", "chunkCount",
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
      `,
        [
          doc.id,
          doc.lawyerId,
          doc.title,
          doc.description,
          doc.fileName,
          doc.fileUrl,
          doc.fileSize,
          doc.mimeType,
          doc.type,
          doc.category,
          doc.status,
          doc.isPublic,
          doc.tags.join(','),
          JSON.stringify(doc.metadata),
          doc.processedAt,
          doc.errorMessage,
          doc.chunkCount,
          doc.createdAt,
          doc.updatedAt,
        ],
      );
    }

    const publicDocs = documents.filter((d) => d.isPublic).length;
    const privateDocs = documents.filter((d) => !d.isPublic).length;

    console.log(`   ✓ Created ${documents.length} documents`);
    console.log(`   - Public (knowledge base): ${publicDocs}`);
    console.log(`   - Private: ${privateDocs}`);
    console.log('   Categories:');
    console.log('   - Contracts: 5');
    console.log('   - Court decisions: 4');
    console.log('   - Laws: 3');
    console.log('   - Regulations: 3');
    console.log('   - Templates: 3');
    console.log('   - Guides: 2');
    console.log('   - Other: 2');

    await queryRunner.commitTransaction();
    console.log('✅ Documents seeded successfully\n');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding documents:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Run seed if executed directly
 */
if (require.main === module) {
  import('typeorm')
    .then(async ({ DataSource }) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'advocata',
        password: process.env.DB_PASSWORD || 'advocata_dev_password',
        database: process.env.DB_DATABASE || 'advocata',
      });

      await dataSource.initialize();
      await seedDocuments(dataSource);
      await dataSource.destroy();

      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}
