import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../../infrastructure/persistence/audit-log.repository';
import {
  AuditAction,
  AuditEntityType,
} from '../../infrastructure/persistence/audit-log.orm-entity';

/**
 * AuditLogService
 *
 * Service for logging all admin actions for compliance and security
 *
 * CRITICAL: This service must be called for all admin actions that modify data
 */
@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  /**
   * Log an admin action
   */
  async log(params: {
    userId: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string;
    oldValue?: Record<string, any>;
    newValue?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.auditLogRepository.create({
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValue: params.oldValue,
        newValue: params.newValue,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        description: params.description,
        metadata: params.metadata,
      });
    } catch (error) {
      // Log error but don't throw - audit logging should not break operations
      console.error('[AuditLogService] Failed to create audit log:', error);
    }
  }

  /**
   * Log user suspension
   */
  async logUserSuspension(
    adminUserId: string,
    userId: string,
    reason: string,
    durationDays?: number,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId: adminUserId,
      action: AuditAction.SUSPEND,
      entityType: AuditEntityType.USER,
      entityId: userId,
      newValue: { reason, durationDays, status: 'suspended' },
      ipAddress,
      description: `User suspended. Reason: ${reason}${durationDays ? `, Duration: ${durationDays} days` : ''}`,
    });
  }

  /**
   * Log user ban
   */
  async logUserBan(
    adminUserId: string,
    userId: string,
    reason: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId: adminUserId,
      action: AuditAction.BAN,
      entityType: AuditEntityType.USER,
      entityId: userId,
      newValue: { reason, status: 'banned' },
      ipAddress,
      description: `User banned. Reason: ${reason}`,
    });
  }

  /**
   * Log user activation
   */
  async logUserActivation(
    adminUserId: string,
    userId: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId: adminUserId,
      action: AuditAction.ACTIVATE,
      entityType: AuditEntityType.USER,
      entityId: userId,
      newValue: { status: 'active' },
      ipAddress,
      description: 'User activated',
    });
  }

  /**
   * Log lawyer verification
   */
  async logLawyerVerification(
    adminUserId: string,
    lawyerId: string,
    approved: boolean,
    notes?: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId: adminUserId,
      action: approved ? AuditAction.APPROVE : AuditAction.REJECT,
      entityType: AuditEntityType.LAWYER,
      entityId: lawyerId,
      newValue: { approved, notes, status: approved ? 'active' : 'rejected' },
      ipAddress,
      description: approved ? 'Lawyer verified and approved' : 'Lawyer verification rejected',
    });
  }

  /**
   * Log payout processing
   */
  async logPayoutProcessing(
    adminUserId: string,
    payoutId: string,
    amount: number,
    lawyerId: string,
    method: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId: adminUserId,
      action: AuditAction.PAYOUT,
      entityType: AuditEntityType.PAYOUT,
      entityId: payoutId,
      newValue: { amount, lawyerId, method, status: 'processing' },
      ipAddress,
      description: `Payout of ${amount} RUB processed for lawyer ${lawyerId}`,
    });
  }

  /**
   * Log refund approval/rejection
   */
  async logRefundDecision(
    adminUserId: string,
    refundId: string,
    approved: boolean,
    amount: number,
    reason?: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId: adminUserId,
      action: approved ? AuditAction.APPROVE : AuditAction.REJECT,
      entityType: AuditEntityType.REFUND,
      entityId: refundId,
      newValue: { approved, amount, reason, status: approved ? 'approved' : 'rejected' },
      ipAddress,
      description: approved
        ? `Refund of ${amount} RUB approved`
        : `Refund of ${amount} RUB rejected${reason ? `: ${reason}` : ''}`,
    });
  }

  /**
   * Log content creation/update
   */
  async logContentChange(
    adminUserId: string,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    oldValue?: Record<string, any>,
    newValue?: Record<string, any>,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId: adminUserId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      description: `${entityType} ${action}d`,
    });
  }

  /**
   * Log settings update
   */
  async logSettingsUpdate(
    adminUserId: string,
    settingKey: string,
    oldValue: any,
    newValue: any,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId: adminUserId,
      action: AuditAction.UPDATE,
      entityType: AuditEntityType.PLATFORM_CONFIG,
      entityId: settingKey,
      oldValue: { value: oldValue },
      newValue: { value: newValue },
      ipAddress,
      description: `Platform setting '${settingKey}' updated`,
    });
  }
}
