import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

/**
 * User Seed Data
 *
 * Creates realistic test users for development:
 * - 15 clients (various verification states)
 * - 8 lawyers (linked to lawyer profiles)
 * - 2 admins
 *
 * Total: 25 users
 */

interface UserSeed {
  id: string;
  phoneNumber: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: 'client' | 'lawyer' | 'admin';
  status:
    | 'pending_verification'
    | 'active'
    | 'suspended'
    | 'banned'
    | 'deleted';
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Pre-defined user IDs for reference in other seeds
export const USER_IDS = {
  // Clients
  CLIENT_1: '11111111-1111-1111-1111-111111111111', // Ivan Petrov - Active
  CLIENT_2: '11111111-1111-1111-1111-111111111112', // Maria Sidorova - Active
  CLIENT_3: '11111111-1111-1111-1111-111111111113', // Alexey Kozlov - Pending
  CLIENT_4: '11111111-1111-1111-1111-111111111114', // Olga Kuznetsova - Active
  CLIENT_5: '11111111-1111-1111-1111-111111111115', // Dmitry Volkov - Active
  CLIENT_6: '11111111-1111-1111-1111-111111111116', // Elena Morozova - Active
  CLIENT_7: '11111111-1111-1111-1111-111111111117', // Sergey Novikov - Suspended
  CLIENT_8: '11111111-1111-1111-1111-111111111118', // Anna Sokolova - Active
  CLIENT_9: '11111111-1111-1111-1111-111111111119', // Pavel Ivanov - Active
  CLIENT_10: '11111111-1111-1111-1111-11111111111a', // Natalia Popova - Active
  CLIENT_11: '11111111-1111-1111-1111-11111111111b', // Mikhail Lebedev - Pending
  CLIENT_12: '11111111-1111-1111-1111-11111111111c', // Yulia Smirnova - Active
  CLIENT_13: '11111111-1111-1111-1111-11111111111d', // Andrey Fedorov - Active
  CLIENT_14: '11111111-1111-1111-1111-11111111111e', // Victoria Orlova - Banned
  CLIENT_15: '11111111-1111-1111-1111-11111111111f', // Igor Egorov - Active

  // Lawyers
  LAWYER_1: '22222222-2222-2222-2222-222222222221', // Alexander Gromov - Traffic accidents
  LAWYER_2: '22222222-2222-2222-2222-222222222222', // Ekaterina Belova - Criminal law
  LAWYER_3: '22222222-2222-2222-2222-222222222223', // Vladimir Sorokin - Labor law
  LAWYER_4: '22222222-2222-2222-2222-222222222224', // Tatiana Zakharova - Family law
  LAWYER_5: '22222222-2222-2222-2222-222222222225', // Roman Pavlov - Civil law
  LAWYER_6: '22222222-2222-2222-2222-222222222226', // Marina Karpova - Corporate law
  LAWYER_7: '22222222-2222-2222-2222-222222222227', // Nikolai Stepanov - Tax law
  LAWYER_8: '22222222-2222-2222-2222-222222222228', // Irina Bogdanova - Real estate

  // Admins
  ADMIN_1: '33333333-3333-3333-3333-333333333331', // Admin User 1
  ADMIN_2: '33333333-3333-3333-3333-333333333332', // Admin User 2
};

const users: UserSeed[] = [
  // ===== CLIENTS =====
  {
    id: USER_IDS.CLIENT_1,
    phoneNumber: '+79991234567',
    email: 'ivan.petrov@example.com',
    firstName: 'Иван',
    lastName: 'Петров',
    role: 'client',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-17 15:30:00'),
    createdAt: new Date('2024-10-01 10:00:00'),
    updatedAt: new Date('2024-11-17 15:30:00'),
  },
  {
    id: USER_IDS.CLIENT_2,
    phoneNumber: '+79991234568',
    email: 'maria.sidorova@example.com',
    firstName: 'Мария',
    lastName: 'Сидорова',
    role: 'client',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-18 09:15:00'),
    createdAt: new Date('2024-10-05 14:20:00'),
    updatedAt: new Date('2024-11-18 09:15:00'),
  },
  {
    id: USER_IDS.CLIENT_3,
    phoneNumber: '+79991234569',
    email: null,
    firstName: 'Алексей',
    lastName: 'Козлов',
    role: 'client',
    status: 'pending_verification',
    isPhoneVerified: false,
    isEmailVerified: false,
    lastLoginAt: null,
    createdAt: new Date('2024-11-18 08:00:00'),
    updatedAt: new Date('2024-11-18 08:00:00'),
  },
  {
    id: USER_IDS.CLIENT_4,
    phoneNumber: '+79991234570',
    email: 'olga.kuznetsova@example.com',
    firstName: 'Ольга',
    lastName: 'Кузнецова',
    role: 'client',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-16 18:45:00'),
    createdAt: new Date('2024-10-10 12:30:00'),
    updatedAt: new Date('2024-11-16 18:45:00'),
  },
  {
    id: USER_IDS.CLIENT_5,
    phoneNumber: '+79991234571',
    email: 'dmitry.volkov@example.com',
    firstName: 'Дмитрий',
    lastName: 'Волков',
    role: 'client',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: false,
    lastLoginAt: new Date('2024-11-15 11:20:00'),
    createdAt: new Date('2024-10-12 16:00:00'),
    updatedAt: new Date('2024-11-15 11:20:00'),
  },
  {
    id: USER_IDS.CLIENT_6,
    phoneNumber: '+79991234572',
    email: 'elena.morozova@example.com',
    firstName: 'Елена',
    lastName: 'Морозова',
    role: 'client',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-18 10:00:00'),
    createdAt: new Date('2024-10-15 09:30:00'),
    updatedAt: new Date('2024-11-18 10:00:00'),
  },
  {
    id: USER_IDS.CLIENT_7,
    phoneNumber: '+79991234573',
    email: 'sergey.novikov@example.com',
    firstName: 'Сергей',
    lastName: 'Новиков',
    role: 'client',
    status: 'suspended',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-10 14:00:00'),
    createdAt: new Date('2024-10-08 11:00:00'),
    updatedAt: new Date('2024-11-11 10:00:00'),
  },
  {
    id: USER_IDS.CLIENT_8,
    phoneNumber: '+79991234574',
    email: 'anna.sokolova@example.com',
    firstName: 'Анна',
    lastName: 'Соколова',
    role: 'client',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-17 16:30:00'),
    createdAt: new Date('2024-10-20 13:45:00'),
    updatedAt: new Date('2024-11-17 16:30:00'),
  },
  {
    id: USER_IDS.CLIENT_9,
    phoneNumber: '+79991234575',
    email: null,
    firstName: 'Павел',
    lastName: 'Иванов',
    role: 'client',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: false,
    lastLoginAt: new Date('2024-11-18 08:20:00'),
    createdAt: new Date('2024-10-22 10:15:00'),
    updatedAt: new Date('2024-11-18 08:20:00'),
  },
  {
    id: USER_IDS.CLIENT_10,
    phoneNumber: '+79991234576',
    email: 'natalia.popova@example.com',
    firstName: 'Наталья',
    lastName: 'Попова',
    role: 'client',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-16 12:00:00'),
    createdAt: new Date('2024-10-25 15:30:00'),
    updatedAt: new Date('2024-11-16 12:00:00'),
  },
  {
    id: USER_IDS.CLIENT_11,
    phoneNumber: '+79991234577',
    email: null,
    firstName: 'Михаил',
    lastName: 'Лебедев',
    role: 'client',
    status: 'pending_verification',
    isPhoneVerified: false,
    isEmailVerified: false,
    lastLoginAt: null,
    createdAt: new Date('2024-11-17 20:00:00'),
    updatedAt: new Date('2024-11-17 20:00:00'),
  },
  {
    id: USER_IDS.CLIENT_12,
    phoneNumber: '+79991234578',
    email: 'yulia.smirnova@example.com',
    firstName: 'Юлия',
    lastName: 'Смирнова',
    role: 'client',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-18 07:45:00'),
    createdAt: new Date('2024-10-28 11:20:00'),
    updatedAt: new Date('2024-11-18 07:45:00'),
  },
  {
    id: USER_IDS.CLIENT_13,
    phoneNumber: '+79991234579',
    email: 'andrey.fedorov@example.com',
    firstName: 'Андрей',
    lastName: 'Федоров',
    role: 'client',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: false,
    lastLoginAt: new Date('2024-11-15 17:00:00'),
    createdAt: new Date('2024-10-30 14:00:00'),
    updatedAt: new Date('2024-11-15 17:00:00'),
  },
  {
    id: USER_IDS.CLIENT_14,
    phoneNumber: '+79991234580',
    email: 'victoria.orlova@example.com',
    firstName: 'Виктория',
    lastName: 'Орлова',
    role: 'client',
    status: 'banned',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-05 10:00:00'),
    createdAt: new Date('2024-09-15 09:00:00'),
    updatedAt: new Date('2024-11-06 11:00:00'),
  },
  {
    id: USER_IDS.CLIENT_15,
    phoneNumber: '+79991234581',
    email: 'igor.egorov@example.com',
    firstName: 'Игорь',
    lastName: 'Егоров',
    role: 'client',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-17 19:30:00'),
    createdAt: new Date('2024-11-01 10:00:00'),
    updatedAt: new Date('2024-11-17 19:30:00'),
  },

  // ===== LAWYERS =====
  {
    id: USER_IDS.LAWYER_1,
    phoneNumber: '+79991111111',
    email: 'alexander.gromov@lawfirm.ru',
    firstName: 'Александр',
    lastName: 'Громов',
    role: 'lawyer',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-18 09:00:00'),
    createdAt: new Date('2024-09-01 10:00:00'),
    updatedAt: new Date('2024-11-18 09:00:00'),
  },
  {
    id: USER_IDS.LAWYER_2,
    phoneNumber: '+79991111112',
    email: 'ekaterina.belova@lawfirm.ru',
    firstName: 'Екатерина',
    lastName: 'Белова',
    role: 'lawyer',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-18 08:30:00'),
    createdAt: new Date('2024-09-05 11:00:00'),
    updatedAt: new Date('2024-11-18 08:30:00'),
  },
  {
    id: USER_IDS.LAWYER_3,
    phoneNumber: '+79991111113',
    email: 'vladimir.sorokin@lawfirm.ru',
    firstName: 'Владимир',
    lastName: 'Сорокин',
    role: 'lawyer',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-17 20:00:00'),
    createdAt: new Date('2024-09-10 09:30:00'),
    updatedAt: new Date('2024-11-17 20:00:00'),
  },
  {
    id: USER_IDS.LAWYER_4,
    phoneNumber: '+79991111114',
    email: 'tatiana.zakharova@lawfirm.ru',
    firstName: 'Татьяна',
    lastName: 'Захарова',
    role: 'lawyer',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-18 10:15:00'),
    createdAt: new Date('2024-09-12 14:00:00'),
    updatedAt: new Date('2024-11-18 10:15:00'),
  },
  {
    id: USER_IDS.LAWYER_5,
    phoneNumber: '+79991111115',
    email: 'roman.pavlov@lawfirm.ru',
    firstName: 'Роман',
    lastName: 'Павлов',
    role: 'lawyer',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-18 07:00:00'),
    createdAt: new Date('2024-09-15 10:30:00'),
    updatedAt: new Date('2024-11-18 07:00:00'),
  },
  {
    id: USER_IDS.LAWYER_6,
    phoneNumber: '+79991111116',
    email: 'marina.karpova@lawfirm.ru',
    firstName: 'Марина',
    lastName: 'Карпова',
    role: 'lawyer',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-17 18:00:00'),
    createdAt: new Date('2024-09-18 13:00:00'),
    updatedAt: new Date('2024-11-17 18:00:00'),
  },
  {
    id: USER_IDS.LAWYER_7,
    phoneNumber: '+79991111117',
    email: 'nikolai.stepanov@lawfirm.ru',
    firstName: 'Николай',
    lastName: 'Степанов',
    role: 'lawyer',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-18 09:45:00'),
    createdAt: new Date('2024-09-20 11:30:00'),
    updatedAt: new Date('2024-11-18 09:45:00'),
  },
  {
    id: USER_IDS.LAWYER_8,
    phoneNumber: '+79991111118',
    email: 'irina.bogdanova@lawfirm.ru',
    firstName: 'Ирина',
    lastName: 'Богданова',
    role: 'lawyer',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-17 16:00:00'),
    createdAt: new Date('2024-09-22 15:00:00'),
    updatedAt: new Date('2024-11-17 16:00:00'),
  },

  // ===== ADMINS =====
  {
    id: USER_IDS.ADMIN_1,
    phoneNumber: '+79999999991',
    email: 'admin@advocata.ru',
    firstName: 'Админ',
    lastName: 'Основной',
    role: 'admin',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-18 08:00:00'),
    createdAt: new Date('2024-08-01 09:00:00'),
    updatedAt: new Date('2024-11-18 08:00:00'),
  },
  {
    id: USER_IDS.ADMIN_2,
    phoneNumber: '+79999999992',
    email: 'support@advocata.ru',
    firstName: 'Админ',
    lastName: 'Поддержка',
    role: 'admin',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2024-11-18 07:30:00'),
    createdAt: new Date('2024-08-01 09:30:00'),
    updatedAt: new Date('2024-11-18 07:30:00'),
  },
];

/**
 * Seed users table
 */
export async function seedUsers(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log('🌱 Seeding users...');

    // Clear existing users
    await queryRunner.query('DELETE FROM users');
    console.log('   Cleared existing users');

    // Insert users
    for (const user of users) {
      await queryRunner.query(
        `
        INSERT INTO users (
          id, "phoneNumber", email, "firstName", "lastName",
          role, status, "isPhoneVerified", "isEmailVerified",
          "lastLoginAt", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
      `,
        [
          user.id,
          user.phoneNumber,
          user.email,
          user.firstName,
          user.lastName,
          user.role,
          user.status,
          user.isPhoneVerified,
          user.isEmailVerified,
          user.lastLoginAt,
          user.createdAt,
          user.updatedAt,
        ],
      );
    }

    console.log(`   ✓ Created ${users.length} users`);
    console.log('   - 15 clients');
    console.log('   - 8 lawyers');
    console.log('   - 2 admins');

    await queryRunner.commitTransaction();
    console.log('✅ Users seeded successfully\n');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding users:', error);
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
      await seedUsers(dataSource);
      await dataSource.destroy();

      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}
