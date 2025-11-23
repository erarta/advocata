import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { USER_IDS } from './user.seed';

/**
 * Lawyer Seed Data
 *
 * Creates 8 lawyer profiles linked to user accounts.
 * Covers various specializations, verification states, and rating ranges.
 */

interface LawyerSeed {
  id: string;
  userId: string;
  licenseNumber: string;
  specializations: string[];
  experienceYears: number;
  ratingValue: number;
  reviewCount: number;
  bio: string;
  education: string;
  status:
    | 'pending_verification'
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'banned'
    | 'deleted';
  verificationStatus:
    | 'not_submitted'
    | 'pending'
    | 'in_review'
    | 'approved'
    | 'rejected'
    | 'documents_requested';
  verificationNotes: string | null;
  hourlyRate: number | null; // in kopecks
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Pre-defined lawyer IDs for reference in other seeds
export const LAWYER_IDS = {
  LAWYER_1: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Alexander Gromov - Traffic
  LAWYER_2: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaabaaa', // Ekaterina Belova - Criminal
  LAWYER_3: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaacaa', // Vladimir Sorokin - Labor
  LAWYER_4: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaadaa', // Tatiana Zakharova - Family
  LAWYER_5: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaeaa', // Roman Pavlov - Civil
  LAWYER_6: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaafaa', // Marina Karpova - Corporate
  LAWYER_7: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaagaa', // Nikolai Stepanov - Tax
  LAWYER_8: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaahaa', // Irina Bogdanova - Real estate
};

const lawyers: LawyerSeed[] = [
  // 1. Alexander Gromov - Traffic Accidents Specialist
  {
    id: LAWYER_IDS.LAWYER_1,
    userId: USER_IDS.LAWYER_1,
    licenseNumber: '78/12345',
    specializations: ['traffic_accidents', 'civil_law'],
    experienceYears: 12,
    ratingValue: 4.85,
    reviewCount: 156,
    bio: 'Специализируюсь на ДТП и страховых спорах. Более 12 лет успешной практики. Помогу отстоять ваши права после аварии, взыскать ущерб с виновника или страховой компании. Работаю быстро и результативно.',
    education:
      'СПбГУ, Юридический факультет, 2012. Аспирантура по гражданскому праву, 2015.',
    status: 'active',
    verificationStatus: 'approved',
    verificationNotes: 'Verified on 2024-09-02. All documents confirmed.',
    hourlyRate: 350000, // 3,500 RUB/hour
    isAvailable: true,
    createdAt: new Date('2024-09-01 10:30:00'),
    updatedAt: new Date('2024-11-18 09:00:00'),
  },

  // 2. Ekaterina Belova - Criminal Law Expert
  {
    id: LAWYER_IDS.LAWYER_2,
    userId: USER_IDS.LAWYER_2,
    licenseNumber: '78/23456',
    specializations: ['criminal_law'],
    experienceYears: 15,
    ratingValue: 4.92,
    reviewCount: 203,
    bio: 'Адвокат по уголовным делам. Защищаю права на всех стадиях уголовного процесса. Опыт работы 15 лет, более 400 успешных дел. Специализируюсь на экономических преступлениях, защите бизнеса, делах о превышении полномочий.',
    education:
      'МГУ им. М.В. Ломоносова, Юридический факультет, 2009. Кандидат юридических наук, 2013.',
    status: 'active',
    verificationStatus: 'approved',
    verificationNotes:
      'Verified on 2024-09-06. Excellent credentials. Top-rated lawyer.',
    hourlyRate: 500000, // 5,000 RUB/hour
    isAvailable: true,
    createdAt: new Date('2024-09-05 11:15:00'),
    updatedAt: new Date('2024-11-18 08:30:00'),
  },

  // 3. Vladimir Sorokin - Labor Law Specialist
  {
    id: LAWYER_IDS.LAWYER_3,
    userId: USER_IDS.LAWYER_3,
    licenseNumber: '78/34567',
    specializations: ['labor_law', 'civil_law'],
    experienceYears: 8,
    ratingValue: 4.65,
    reviewCount: 89,
    bio: 'Помогаю в трудовых спорах: незаконное увольнение, невыплата зарплаты, дискриминация на работе. Консультирую по трудовым договорам, коллективным переговорам, защите прав работников. 8 лет практики.',
    education:
      'СПбГУ, Юридический факультет, 2016. Магистратура по трудовому праву, 2018.',
    status: 'active',
    verificationStatus: 'approved',
    verificationNotes: 'Verified on 2024-09-11. Clean background check.',
    hourlyRate: 280000, // 2,800 RUB/hour
    isAvailable: true,
    createdAt: new Date('2024-09-10 09:45:00'),
    updatedAt: new Date('2024-11-17 20:00:00'),
  },

  // 4. Tatiana Zakharova - Family Law Expert
  {
    id: LAWYER_IDS.LAWYER_4,
    userId: USER_IDS.LAWYER_4,
    licenseNumber: '78/45678',
    specializations: ['family_law', 'civil_law'],
    experienceYears: 10,
    ratingValue: 4.78,
    reviewCount: 134,
    bio: 'Специалист по семейному праву. Помогу в вопросах развода, раздела имущества, алиментов, определения места жительства детей. Деликатный подход, защита интересов детей. 10 лет опыта, более 200 дел.',
    education:
      'МГЮА (Московская государственная юридическая академия), 2014. Специализация: семейное право.',
    status: 'active',
    verificationStatus: 'approved',
    verificationNotes: 'Verified on 2024-09-13. Strong family law background.',
    hourlyRate: 320000, // 3,200 RUB/hour
    isAvailable: true,
    createdAt: new Date('2024-09-12 14:20:00'),
    updatedAt: new Date('2024-11-18 10:15:00'),
  },

  // 5. Roman Pavlov - Civil Law Generalist
  {
    id: LAWYER_IDS.LAWYER_5,
    userId: USER_IDS.LAWYER_5,
    licenseNumber: '78/56789',
    specializations: ['civil_law', 'real_estate'],
    experienceYears: 7,
    ratingValue: 4.55,
    reviewCount: 67,
    bio: 'Юрист широкого профиля. Гражданские споры, договоры, недвижимость, наследство. Помогу составить иск, представлю интересы в суде. Индивидуальный подход к каждому клиенту. 7 лет практики.',
    education:
      'Российская академия правосудия, 2017. Повышение квалификации по медиации, 2020.',
    status: 'active',
    verificationStatus: 'approved',
    verificationNotes: 'Verified on 2024-09-16. Standard verification passed.',
    hourlyRate: 250000, // 2,500 RUB/hour
    isAvailable: true,
    createdAt: new Date('2024-09-15 10:45:00'),
    updatedAt: new Date('2024-11-18 07:00:00'),
  },

  // 6. Marina Karpova - Corporate Law Expert
  {
    id: LAWYER_IDS.LAWYER_6,
    userId: USER_IDS.LAWYER_6,
    licenseNumber: '78/67890',
    specializations: ['corporate_law', 'tax_law'],
    experienceYears: 13,
    ratingValue: 4.88,
    reviewCount: 178,
    bio: 'Корпоративный юрист. Консультирую по вопросам создания и реорганизации бизнеса, M&A сделкам, корпоративным спорам, защите активов. Опыт работы с крупными компаниями. 13 лет практики.',
    education:
      'ВШЭ (Высшая школа экономики), 2011. MBA, London Business School, 2015.',
    status: 'active',
    verificationStatus: 'approved',
    verificationNotes:
      'Verified on 2024-09-19. Premium tier. International experience.',
    hourlyRate: 600000, // 6,000 RUB/hour
    isAvailable: false, // Currently busy
    createdAt: new Date('2024-09-18 13:30:00'),
    updatedAt: new Date('2024-11-17 18:00:00'),
  },

  // 7. Nikolai Stepanov - Tax Law Specialist
  {
    id: LAWYER_IDS.LAWYER_7,
    userId: USER_IDS.LAWYER_7,
    licenseNumber: '78/78901',
    specializations: ['tax_law', 'corporate_law'],
    experienceYears: 11,
    ratingValue: 4.72,
    reviewCount: 95,
    bio: 'Налоговый юрист. Помогаю оптимизировать налоги, защищаю от необоснованных доначислений, представляю интересы в налоговых спорах. Работаю с физлицами и компаниями. 11 лет опыта.',
    education:
      'Финансовый университет при Правительстве РФ, 2013. Аттестация налогового консультанта, 2015.',
    status: 'active',
    verificationStatus: 'approved',
    verificationNotes:
      'Verified on 2024-09-21. Tax law certification confirmed.',
    hourlyRate: 400000, // 4,000 RUB/hour
    isAvailable: true,
    createdAt: new Date('2024-09-20 11:45:00'),
    updatedAt: new Date('2024-11-18 09:45:00'),
  },

  // 8. Irina Bogdanova - Real Estate Law
  {
    id: LAWYER_IDS.LAWYER_8,
    userId: USER_IDS.LAWYER_8,
    licenseNumber: '78/89012',
    specializations: ['real_estate', 'civil_law'],
    experienceYears: 9,
    ratingValue: 4.60,
    reviewCount: 112,
    bio: 'Специалист по недвижимости. Помогу с покупкой, продажей, арендой, регистрацией прав, оспариванием сделок. Проверка юридической чистоты объектов. Защита от мошенничества. 9 лет практики.',
    education:
      'СПбГУ, Юридический факультет, 2015. Специализация: вещное право, сделки с недвижимостью.',
    status: 'active',
    verificationStatus: 'approved',
    verificationNotes:
      'Verified on 2024-09-23. Real estate specialization confirmed.',
    hourlyRate: 300000, // 3,000 RUB/hour
    isAvailable: true,
    createdAt: new Date('2024-09-22 15:15:00'),
    updatedAt: new Date('2024-11-17 16:00:00'),
  },
];

/**
 * Seed lawyers table
 */
export async function seedLawyers(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log('🌱 Seeding lawyers...');

    // Clear existing lawyers
    await queryRunner.query('DELETE FROM lawyers');
    console.log('   Cleared existing lawyers');

    // Insert lawyers
    for (const lawyer of lawyers) {
      await queryRunner.query(
        `
        INSERT INTO lawyers (
          id, "userId", "licenseNumber", specializations,
          "experienceYears", "ratingValue", "reviewCount",
          bio, education, status, "verificationStatus",
          "verificationNotes", "hourlyRate", "isAvailable",
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
      `,
        [
          lawyer.id,
          lawyer.userId,
          lawyer.licenseNumber,
          lawyer.specializations.join(','),
          lawyer.experienceYears,
          lawyer.ratingValue,
          lawyer.reviewCount,
          lawyer.bio,
          lawyer.education,
          lawyer.status,
          lawyer.verificationStatus,
          lawyer.verificationNotes,
          lawyer.hourlyRate,
          lawyer.isAvailable,
          lawyer.createdAt,
          lawyer.updatedAt,
        ],
      );
    }

    console.log(`   ✓ Created ${lawyers.length} lawyers`);
    console.log('   Specializations:');
    console.log('   - Traffic accidents: 1');
    console.log('   - Criminal law: 1');
    console.log('   - Labor law: 1');
    console.log('   - Family law: 1');
    console.log('   - Civil law: 1');
    console.log('   - Corporate law: 1');
    console.log('   - Tax law: 1');
    console.log('   - Real estate: 1');

    await queryRunner.commitTransaction();
    console.log('✅ Lawyers seeded successfully\n');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding lawyers:', error);
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
      await seedLawyers(dataSource);
      await dataSource.destroy();

      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}
