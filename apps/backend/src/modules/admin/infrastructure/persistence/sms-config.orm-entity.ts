import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SmsProvider {
  TWILIO = 'twilio',
  SMS_RU = 'sms_ru',
  SMSC = 'smsc',
}

/**
 * SmsConfigOrmEntity
 *
 * TypeORM entity for SMS Configuration
 * SMS provider settings
 */
@Entity('sms_configs')
export class SmsConfigOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SmsProvider,
    default: SmsProvider.TWILIO,
  })
  provider: SmsProvider;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountSid: string | null; // Twilio

  @Column({ type: 'varchar', length: 500, nullable: true })
  authToken: string | null; // Encrypted

  @Column({ type: 'varchar', length: 500, nullable: true })
  apiKey: string | null; // Encrypted - for SMS.ru, SMSC

  @Column({ type: 'varchar', length: 20, nullable: true })
  fromNumber: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  senderId: string | null; // Sender name for some providers

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
