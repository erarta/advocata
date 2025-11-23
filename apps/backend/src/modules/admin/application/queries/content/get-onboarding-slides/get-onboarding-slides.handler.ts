import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetOnboardingSlidesQuery } from './get-onboarding-slides.query';

interface OnboardingSlide {
  id: string;
  targetAudience: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText?: string;
  order: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetOnboardingSlidesQuery)
export class GetOnboardingSlidesHandler implements IQueryHandler<GetOnboardingSlidesQuery> {
  private readonly logger = new Logger(GetOnboardingSlidesHandler.name);

  async execute(query: GetOnboardingSlidesQuery): Promise<OnboardingSlide[]> {
    const { targetAudience, status } = query.dto;

    this.logger.log(`Getting onboarding slides with filters: ${JSON.stringify(query.dto)}`);

    // TODO: Replace with actual database query
    const mockSlides: OnboardingSlide[] = [
      {
        id: '1',
        targetAudience: 'client',
        title: 'Добро пожаловать в Advocata',
        description: 'Найдите юриста для решения любого вопроса за несколько минут',
        imageUrl: 'https://example.com/images/onboarding-client-1.png',
        buttonText: 'Далее',
        order: 1,
        status: 'active',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: '2',
        targetAudience: 'client',
        title: 'Выберите специалиста',
        description: 'Все юристы проверены и имеют подтверждённую квалификацию',
        imageUrl: 'https://example.com/images/onboarding-client-2.png',
        buttonText: 'Далее',
        order: 2,
        status: 'active',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: '3',
        targetAudience: 'client',
        title: 'Получите консультацию',
        description: 'Консультируйтесь онлайн или лично, в удобное для вас время',
        imageUrl: 'https://example.com/images/onboarding-client-3.png',
        buttonText: 'Начать',
        order: 3,
        status: 'active',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: '4',
        targetAudience: 'lawyer',
        title: 'Присоединяйтесь к Advocata',
        description: 'Платформа для юристов с постоянным потоком клиентов',
        imageUrl: 'https://example.com/images/onboarding-lawyer-1.png',
        buttonText: 'Далее',
        order: 1,
        status: 'active',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: '5',
        targetAudience: 'lawyer',
        title: 'Пройдите верификацию',
        description: 'Подтвердите квалификацию и начните принимать заказы',
        imageUrl: 'https://example.com/images/onboarding-lawyer-2.png',
        buttonText: 'Далее',
        order: 2,
        status: 'active',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: '6',
        targetAudience: 'lawyer',
        title: 'Зарабатывайте больше',
        description: 'Управляйте графиком, устанавливайте свои цены и получайте оплату сразу',
        imageUrl: 'https://example.com/images/onboarding-lawyer-3.png',
        buttonText: 'Начать',
        order: 3,
        status: 'active',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ];

    // Apply filters
    let filteredSlides = mockSlides;

    if (targetAudience) {
      filteredSlides = filteredSlides.filter(s => s.targetAudience === targetAudience);
    }

    if (status) {
      filteredSlides = filteredSlides.filter(s => s.status === status);
    }

    // Sort by order
    filteredSlides.sort((a, b) => a.order - b.order);

    return filteredSlides;
  }
}
