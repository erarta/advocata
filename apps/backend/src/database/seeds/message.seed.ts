import { DataSource } from 'typeorm';

/**
 * Message ORM Entity Interface
 * (Define inline to avoid circular dependencies in seed files)
 */
interface MessageOrmEntity {
  id: string;
  consultationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: string;
  status: string;
  createdAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  deletedAt?: Date;
}

/**
 * Message Attachment ORM Entity Interface
 */
interface MessageAttachmentOrmEntity {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

/**
 * Message Seed Data
 *
 * Seeds the database with test message data for development/testing
 * Creates realistic chat conversations for test consultations
 */
export class MessageSeed {
  /**
   * Run seed
   */
  public static async run(dataSource: DataSource): Promise<void> {
    const messageRepository = dataSource.getRepository('messages');
    const attachmentRepository = dataSource.getRepository('message_attachments');

    // Clear existing data
    await attachmentRepository.query('DELETE FROM message_attachments');
    await messageRepository.query('DELETE FROM messages');

    // Test user IDs (match consultation.seed.ts)
    const clientId1 = '11111111-1111-1111-1111-111111111111';
    const clientId2 = '22222222-2222-2222-2222-222222222222';
    const lawyerId1 = '33333333-3333-3333-3333-333333333333';
    const lawyerId2 = '44444444-4444-4444-4444-444444444444';

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // ==========================================================================
    // Conversation 1: Active Emergency Consultation
    // Consultation ID: a0000000-0000-0000-0000-000000000003 (active, emergency)
    // Client 2 <-> Lawyer 1
    // ==========================================================================

    const conversation1: Partial<MessageOrmEntity>[] = [
      // System message: Consultation started
      {
        id: 'msg-0001-0000-0000-0000-000000000001',
        consultationId: 'a0000000-0000-0000-0000-000000000003',
        senderId: 'system',
        senderName: 'Система',
        content: 'Консультация началась',
        type: 'system',
        status: 'delivered',
        createdAt: fifteenMinAgo,
        deliveredAt: fifteenMinAgo,
      },

      // Client's initial message
      {
        id: 'msg-0001-0000-0000-0000-000000000002',
        consultationId: 'a0000000-0000-0000-0000-000000000003',
        senderId: clientId2,
        senderName: 'Иван Петров',
        senderAvatar: 'https://i.pravatar.cc/150?u=client2',
        content: 'Здравствуйте! Меня только что задержали сотрудники полиции в центре города. Говорят, что я похож на человека, которого разыскивают.',
        type: 'text',
        status: 'read',
        createdAt: new Date(fifteenMinAgo.getTime() + 30 * 1000),
        deliveredAt: new Date(fifteenMinAgo.getTime() + 31 * 1000),
        readAt: new Date(fifteenMinAgo.getTime() + 45 * 1000),
      },

      // Lawyer's response
      {
        id: 'msg-0001-0000-0000-0000-000000000003',
        consultationId: 'a0000000-0000-0000-0000-000000000003',
        senderId: lawyerId1,
        senderName: 'Александр Соколов',
        senderAvatar: 'https://i.pravatar.cc/150?u=lawyer1',
        content: 'Здравствуйте, Иван. Постарайтесь сохранять спокойствие. Сейчас разберемся. Скажите, вас уже доставили в отделение или вы еще на улице?',
        type: 'text',
        status: 'read',
        createdAt: new Date(fifteenMinAgo.getTime() + 60 * 1000),
        deliveredAt: new Date(fifteenMinAgo.getTime() + 61 * 1000),
        readAt: new Date(fifteenMinAgo.getTime() + 70 * 1000),
      },

      // Client response
      {
        id: 'msg-0001-0000-0000-0000-000000000004',
        consultationId: 'a0000000-0000-0000-0000-000000000003',
        senderId: clientId2,
        senderName: 'Иван Петров',
        senderAvatar: 'https://i.pravatar.cc/150?u=client2',
        content: 'Меня уже привезли в отделение. Сказали, что будут проверять документы и сличать с фотографиями.',
        type: 'text',
        status: 'read',
        createdAt: new Date(fifteenMinAgo.getTime() + 90 * 1000),
        deliveredAt: new Date(fifteenMinAgo.getTime() + 91 * 1000),
        readAt: new Date(fifteenMinAgo.getTime() + 100 * 1000),
      },

      // Lawyer's instructions
      {
        id: 'msg-0001-0000-0000-0000-000000000005',
        consultationId: 'a0000000-0000-0000-0000-000000000003',
        senderId: lawyerId1,
        senderName: 'Александр Соколов',
        senderAvatar: 'https://i.pravatar.cc/150?u=lawyer1',
        content: 'Хорошо. Главное — НЕ давайте никаких показаний без адвоката! Вы имеете полное право отказаться от дачи показаний до прибытия защитника. Вас уже официально задержали или просто доставили для проверки?',
        type: 'text',
        status: 'read',
        createdAt: new Date(fifteenMinAgo.getTime() + 120 * 1000),
        deliveredAt: new Date(fifteenMinAgo.getTime() + 121 * 1000),
        readAt: new Date(fifteenMinAgo.getTime() + 135 * 1000),
      },

      // Client clarification
      {
        id: 'msg-0001-0000-0000-0000-000000000006',
        consultationId: 'a0000000-0000-0000-0000-000000000003',
        senderId: clientId2,
        senderName: 'Иван Петров',
        senderAvatar: 'https://i.pravatar.cc/150?u=client2',
        content: 'Пока сказали "доставлены для проверки личности". Никаких протоколов не составляли.',
        type: 'text',
        status: 'read',
        createdAt: new Date(fifteenMinAgo.getTime() + 150 * 1000),
        deliveredAt: new Date(fifteenMinAgo.getTime() + 151 * 1000),
        readAt: new Date(fifteenMinAgo.getTime() + 160 * 1000),
      },

      // Lawyer's advice
      {
        id: 'msg-0001-0000-0000-0000-000000000007',
        consultationId: 'a0000000-0000-0000-0000-000000000003',
        senderId: lawyerId1,
        senderName: 'Александр Соколов',
        senderAvatar: 'https://i.pravatar.cc/150?u=lawyer1',
        content: 'Отлично. Это означает, что вас доставили по ст. 27.2 КоАП РФ. По закону проверка не должна превышать 3 часов. Требуйте составления протокола доставления. Не подписывайте никакие документы, которые не читали. Есть ли у вас при себе документы?',
        type: 'text',
        status: 'delivered',
        createdAt: new Date(fifteenMinAgo.getTime() + 180 * 1000),
        deliveredAt: new Date(fifteenMinAgo.getTime() + 181 * 1000),
      },

      // Latest unread message from client
      {
        id: 'msg-0001-0000-0000-0000-000000000008',
        consultationId: 'a0000000-0000-0000-0000-000000000003',
        senderId: clientId2,
        senderName: 'Иван Петров',
        senderAvatar: 'https://i.pravatar.cc/150?u=client2',
        content: 'Да, паспорт при мне. Спасибо за инструкции, буду следовать вашим рекомендациям.',
        type: 'text',
        status: 'delivered',
        createdAt: fiveMinAgo,
        deliveredAt: fiveMinAgo,
      },
    ];

    // ==========================================================================
    // Conversation 2: Completed Consultation with Rating
    // Consultation ID: a0000000-0000-0000-0000-000000000004 (completed)
    // Client 1 <-> Lawyer 1
    // ==========================================================================

    const conversation2: Partial<MessageOrmEntity>[] = [
      // System: Consultation started
      {
        id: 'msg-0002-0000-0000-0000-000000000001',
        consultationId: 'a0000000-0000-0000-0000-000000000004',
        senderId: 'system',
        senderName: 'Система',
        content: 'Консультация началась',
        type: 'system',
        status: 'delivered',
        createdAt: lastWeek,
        deliveredAt: lastWeek,
      },

      // Initial greeting
      {
        id: 'msg-0002-0000-0000-0000-000000000002',
        consultationId: 'a0000000-0000-0000-0000-000000000004',
        senderId: clientId1,
        senderName: 'Мария Иванова',
        senderAvatar: 'https://i.pravatar.cc/150?u=client1',
        content: 'Добрый день! У меня вопрос по наследству. Моя бабушка оставила завещание, но родственники оспаривают его.',
        type: 'text',
        status: 'read',
        createdAt: new Date(lastWeek.getTime() + 2 * 60 * 1000),
        deliveredAt: new Date(lastWeek.getTime() + 2 * 60 * 1000 + 1000),
        readAt: new Date(lastWeek.getTime() + 2 * 60 * 1000 + 10000),
      },

      // Lawyer greeting and questions
      {
        id: 'msg-0002-0000-0000-0000-000000000003',
        consultationId: 'a0000000-0000-0000-0000-000000000004',
        senderId: lawyerId1,
        senderName: 'Александр Соколов',
        senderAvatar: 'https://i.pravatar.cc/150?u=lawyer1',
        content: 'Здравствуйте, Мария! Давайте разберемся. Скажите, завещание было нотариально удостоверено? И на каком основании родственники его оспаривают?',
        type: 'text',
        status: 'read',
        createdAt: new Date(lastWeek.getTime() + 3 * 60 * 1000),
        deliveredAt: new Date(lastWeek.getTime() + 3 * 60 * 1000 + 1000),
        readAt: new Date(lastWeek.getTime() + 3 * 60 * 1000 + 15000),
      },

      // Client provides details
      {
        id: 'msg-0002-0000-0000-0000-000000000004',
        consultationId: 'a0000000-0000-0000-0000-000000000004',
        senderId: clientId1,
        senderName: 'Мария Иванова',
        senderAvatar: 'https://i.pravatar.cc/150?u=client1',
        content: 'Да, завещание заверено нотариусом. Родственники утверждают, что бабушка была недееспособной на момент составления завещания.',
        type: 'text',
        status: 'read',
        createdAt: new Date(lastWeek.getTime() + 5 * 60 * 1000),
        deliveredAt: new Date(lastWeek.getTime() + 5 * 60 * 1000 + 1000),
        readAt: new Date(lastWeek.getTime() + 5 * 60 * 1000 + 5000),
      },

      // Lawyer's explanation
      {
        id: 'msg-0002-0000-0000-0000-000000000005',
        consultationId: 'a0000000-0000-0000-0000-000000000004',
        senderId: lawyerId1,
        senderName: 'Александр Соколов',
        senderAvatar: 'https://i.pravatar.cc/150?u=lawyer1',
        content: 'Понятно. По закону (ст. 177 ГК РФ), завещание может быть оспорено, если будет доказано, что на момент его составления завещатель не понимал значения своих действий. Нотариус при удостоверении должен был убедиться в дееспособности. Есть ли у вас медицинские документы, подтверждающие состояние здоровья бабушки на тот момент?',
        type: 'text',
        status: 'read',
        createdAt: new Date(lastWeek.getTime() + 7 * 60 * 1000),
        deliveredAt: new Date(lastWeek.getTime() + 7 * 60 * 1000 + 1000),
        readAt: new Date(lastWeek.getTime() + 7 * 60 * 1000 + 20000),
      },

      // More discussion...
      {
        id: 'msg-0002-0000-0000-0000-000000000006',
        consultationId: 'a0000000-0000-0000-0000-000000000004',
        senderId: clientId1,
        senderName: 'Мария Иванова',
        senderAvatar: 'https://i.pravatar.cc/150?u=client1',
        content: 'У меня есть справки от её лечащего врача за тот период. Она была в здравом уме.',
        type: 'text',
        status: 'read',
        createdAt: new Date(lastWeek.getTime() + 10 * 60 * 1000),
        deliveredAt: new Date(lastWeek.getTime() + 10 * 60 * 1000 + 1000),
        readAt: new Date(lastWeek.getTime() + 10 * 60 * 1000 + 5000),
      },

      // Lawyer's action plan
      {
        id: 'msg-0002-0000-0000-0000-000000000007',
        consultationId: 'a0000000-0000-0000-0000-000000000004',
        senderId: lawyerId1,
        senderName: 'Александр Соколов',
        senderAvatar: 'https://i.pravatar.cc/150?u=lawyer1',
        content: 'Отлично! Это очень важные доказательства. Я рекомендую следующее:\n\n1. Собрать все медицинские документы за период составления завещания\n2. Получить от нотариуса копию дела, где должны быть его записи о проверке дееспособности\n3. При необходимости - запросить посмертную психиатрическую экспертизу\n\nВаши шансы отстоять завещание высоки, если есть медицинские подтверждения.',
        type: 'text',
        status: 'read',
        createdAt: new Date(lastWeek.getTime() + 15 * 60 * 1000),
        deliveredAt: new Date(lastWeek.getTime() + 15 * 60 * 1000 + 1000),
        readAt: new Date(lastWeek.getTime() + 15 * 60 * 1000 + 30000),
      },

      // Client thanks
      {
        id: 'msg-0002-0000-0000-0000-000000000008',
        consultationId: 'a0000000-0000-0000-0000-000000000004',
        senderId: clientId1,
        senderName: 'Мария Иванова',
        senderAvatar: 'https://i.pravatar.cc/150?u=client1',
        content: 'Огромное спасибо за подробную консультацию! Теперь понимаю, что нужно делать. Вы очень помогли!',
        type: 'text',
        status: 'read',
        createdAt: new Date(lastWeek.getTime() + 20 * 60 * 1000),
        deliveredAt: new Date(lastWeek.getTime() + 20 * 60 * 1000 + 1000),
        readAt: new Date(lastWeek.getTime() + 20 * 60 * 1000 + 5000),
      },

      // System: Consultation completed
      {
        id: 'msg-0002-0000-0000-0000-000000000009',
        consultationId: 'a0000000-0000-0000-0000-000000000004',
        senderId: 'system',
        senderName: 'Система',
        content: 'Консультация завершена',
        type: 'system',
        status: 'delivered',
        createdAt: new Date(lastWeek.getTime() + 55 * 60 * 1000),
        deliveredAt: new Date(lastWeek.getTime() + 55 * 60 * 1000),
      },
    ];

    // ==========================================================================
    // Conversation 3: Pending Consultation with Initial Message
    // Consultation ID: a0000000-0000-0000-0000-000000000001 (pending)
    // Client 1 <-> Lawyer 1
    // ==========================================================================

    const conversation3: Partial<MessageOrmEntity>[] = [
      // Client's initial booking message
      {
        id: 'msg-0003-0000-0000-0000-000000000001',
        consultationId: 'a0000000-0000-0000-0000-000000000001',
        senderId: clientId1,
        senderName: 'Мария Иванова',
        senderAvatar: 'https://i.pravatar.cc/150?u=client1',
        content: 'Добрый день! Произошло ДТП на перекрестке. Я ждала зеленый сигнал светофора, но другой водитель выехал на красный и врезался в мою машину. Нужна помощь в оформлении документов и защите моих прав. Жду консультации завтра.',
        type: 'text',
        status: 'delivered',
        createdAt: now,
        deliveredAt: now,
      },
    ];

    // ==========================================================================
    // Conversation 4: Chat Consultation with Document Attachment
    // Consultation ID: a0000000-0000-0000-0000-000000000010 (completed, chat)
    // Client 1 <-> Lawyer 1
    // ==========================================================================

    const conversation4: Partial<MessageOrmEntity>[] = [
      // System: Consultation started
      {
        id: 'msg-0004-0000-0000-0000-000000000001',
        consultationId: 'a0000000-0000-0000-0000-000000000010',
        senderId: 'system',
        senderName: 'Система',
        content: 'Консультация началась',
        type: 'system',
        status: 'delivered',
        createdAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000),
        deliveredAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000),
      },

      // Client question
      {
        id: 'msg-0004-0000-0000-0000-000000000002',
        consultationId: 'a0000000-0000-0000-0000-000000000010',
        senderId: clientId1,
        senderName: 'Мария Иванова',
        senderAvatar: 'https://i.pravatar.cc/150?u=client1',
        content: 'Здравствуйте! Кто-то использует мои фотографии в коммерческих целях без разрешения. Что можно сделать?',
        type: 'text',
        status: 'read',
        createdAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 60 * 1000),
        deliveredAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 61 * 1000),
        readAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 120 * 1000),
      },

      // Lawyer response
      {
        id: 'msg-0004-0000-0000-0000-000000000003',
        consultationId: 'a0000000-0000-0000-0000-000000000010',
        senderId: lawyerId1,
        senderName: 'Александр Соколов',
        senderAvatar: 'https://i.pravatar.cc/150?u=lawyer1',
        content: 'Здравствуйте! Это нарушение ваших авторских прав. Можете:\n1. Направить досудебную претензию с требованием прекратить использование\n2. Обратиться в Роскомнадзор\n3. Подать иск о защите авторских прав\n\nЕсть ли у вас доказательства, что фото принадлежат вам?',
        type: 'text',
        status: 'read',
        createdAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 180 * 1000),
        deliveredAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 181 * 1000),
        readAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 300 * 1000),
      },

      // Client with screenshot
      {
        id: 'msg-0004-0000-0000-0000-000000000004',
        consultationId: 'a0000000-0000-0000-0000-000000000010',
        senderId: clientId1,
        senderName: 'Мария Иванова',
        senderAvatar: 'https://i.pravatar.cc/150?u=client1',
        content: 'Да, у меня есть оригиналы с более ранней датой. Вот скриншот где они используют мои фото.',
        type: 'image',
        status: 'read',
        createdAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 420 * 1000),
        deliveredAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 421 * 1000),
        readAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 480 * 1000),
      },

      // Lawyer sends template
      {
        id: 'msg-0004-0000-0000-0000-000000000005',
        consultationId: 'a0000000-0000-0000-0000-000000000010',
        senderId: lawyerId1,
        senderName: 'Александр Соколов',
        senderAvatar: 'https://i.pravatar.cc/150?u=lawyer1',
        content: 'Отлично! Отправляю вам шаблон претензии. Заполните и направьте нарушителю заказным письмом с уведомлением.',
        type: 'document',
        status: 'read',
        createdAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 600 * 1000),
        deliveredAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 601 * 1000),
        readAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 720 * 1000),
      },

      // Client thanks
      {
        id: 'msg-0004-0000-0000-0000-000000000006',
        consultationId: 'a0000000-0000-0000-0000-000000000010',
        senderId: clientId1,
        senderName: 'Мария Иванова',
        senderAvatar: 'https://i.pravatar.cc/150?u=client1',
        content: 'Спасибо большое! Все четко и по делу. Сейчас займусь оформлением претензии.',
        type: 'text',
        status: 'read',
        createdAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 900 * 1000),
        deliveredAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 901 * 1000),
        readAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 960 * 1000),
      },

      // System: Consultation completed
      {
        id: 'msg-0004-0000-0000-0000-000000000007',
        consultationId: 'a0000000-0000-0000-0000-000000000010',
        senderId: 'system',
        senderName: 'Система',
        content: 'Консультация завершена',
        type: 'system',
        status: 'delivered',
        createdAt: new Date(lastWeek.getTime() - 21 * 60 * 60 * 1000),
        deliveredAt: new Date(lastWeek.getTime() - 21 * 60 * 60 * 1000),
      },
    ];

    // Combine all conversations
    const allMessages = [
      ...conversation1,
      ...conversation2,
      ...conversation3,
      ...conversation4,
    ];

    // Insert all messages
    await messageRepository.save(allMessages);

    console.log(`✅ Seeded ${allMessages.length} messages across 4 conversations`);

    // ==========================================================================
    // Seed Message Attachments
    // ==========================================================================

    const attachments: Partial<MessageAttachmentOrmEntity>[] = [
      // Attachment 1: Screenshot for conversation 4
      {
        id: 'att-0001-0000-0000-0000-000000000001',
        messageId: 'msg-0004-0000-0000-0000-000000000004',
        fileName: 'copyright-violation-screenshot.png',
        fileUrl: 'consultations/a0000000-0000-0000-0000-000000000010/11111111-1111-1111-1111-111111111111/20250118_120000_abc123.png',
        fileSize: 245678,
        mimeType: 'image/png',
        createdAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 420 * 1000),
      },

      // Attachment 2: Pretension template document
      {
        id: 'att-0002-0000-0000-0000-000000000001',
        messageId: 'msg-0004-0000-0000-0000-000000000005',
        fileName: 'pretension-template.docx',
        fileUrl: 'consultations/a0000000-0000-0000-0000-000000000010/33333333-3333-3333-3333-333333333333/20250118_121000_def456.docx',
        fileSize: 18432,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        createdAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000 + 600 * 1000),
      },
    ];

    await attachmentRepository.save(attachments);

    console.log(`✅ Seeded ${attachments.length} message attachments`);
  }
}

/**
 * Run seed if executed directly
 */
if (require.main === module) {
  (async () => {
    const { DataSource } = await import('typeorm');

    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'advocata',
      password: process.env.DB_PASSWORD || 'advocata_dev_password',
      database: process.env.DB_DATABASE || 'advocata',
      entities: ['src/**/*.orm-entity.ts'],
      synchronize: false,
    });

    try {
      await dataSource.initialize();
      console.log('🔌 Database connected');

      await MessageSeed.run(dataSource);

      await dataSource.destroy();
      console.log('✅ Seed completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    }
  })();
}
