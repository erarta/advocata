import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicketOrmEntity, TicketStatus, TicketPriority, TicketCategory } from './support-ticket.orm-entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * SupportTicketRepository
 *
 * Repository for Support Ticket entity
 */
@Injectable()
export class SupportTicketRepository {
  constructor(
    @InjectRepository(SupportTicketOrmEntity)
    private readonly repository: Repository<SupportTicketOrmEntity>,
  ) {}

  async nextId(): Promise<string> {
    return uuidv4();
  }

  async findById(id: string): Promise<SupportTicketOrmEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<SupportTicketOrmEntity[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: TicketStatus): Promise<SupportTicketOrmEntity[]> {
    return this.repository.find({
      where: { status },
      order: { createdAt: 'ASC' },
    });
  }

  async findOpen(): Promise<SupportTicketOrmEntity[]> {
    return this.repository.find({
      where: [
        { status: TicketStatus.OPEN },
        { status: TicketStatus.ASSIGNED },
        { status: TicketStatus.IN_PROGRESS },
      ],
      order: { priority: 'DESC', createdAt: 'ASC' },
    });
  }

  async findAssignedTo(adminUserId: string): Promise<SupportTicketOrmEntity[]> {
    return this.repository.find({
      where: { assignedTo: adminUserId },
      order: { priority: 'DESC', createdAt: 'ASC' },
    });
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    assignedTo?: string;
  }): Promise<{ tickets: SupportTicketOrmEntity[]; total: number }> {
    const query = this.repository.createQueryBuilder('ticket');

    if (options?.status) {
      query.andWhere('ticket.status = :status', { status: options.status });
    }

    if (options?.priority) {
      query.andWhere('ticket.priority = :priority', {
        priority: options.priority,
      });
    }

    if (options?.category) {
      query.andWhere('ticket.category = :category', {
        category: options.category,
      });
    }

    if (options?.assignedTo) {
      query.andWhere('ticket.assignedTo = :assignedTo', {
        assignedTo: options.assignedTo,
      });
    }

    query.orderBy('ticket.createdAt', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const [tickets, total] = await query.getManyAndCount();
    return { tickets, total };
  }

  async save(ticket: SupportTicketOrmEntity): Promise<SupportTicketOrmEntity> {
    return this.repository.save(ticket);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
