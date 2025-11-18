// User Types
export enum SubscriptionType {
  NONE = 'none',
  FREE_TRIAL = 'free_trial',
  BASIC = 'basic',
  PREMIUM = 'premium',
  VIP = 'vip',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SubscriptionInfo {
  type: SubscriptionType;
  status: SubscriptionStatus;
  startDate: Date;
  renewalDate: Date;
  cancelDate?: Date;
  amount: number;
  paymentMethod: string;
}

export interface UserStatistics {
  totalConsultations: number;
  completedConsultations: number;
  cancelledConsultations: number;
  completionRate: number;
  averageRatingGiven: number;
  totalSpent: number;
  lastConsultationAt?: Date;
}

export interface ReferralInfo {
  code: string;
  referredBy?: {
    userId: string;
    name: string;
  };
  referralCount: number;
  bonusEarned: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface UserSettings {
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    showProfile: boolean;
    shareLocation: boolean;
  };
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  phoneVerified: boolean;
  dateOfBirth: Date;
  address: Address;
  avatar?: string;
  status: UserStatus;
  registeredAt: Date;
  lastActiveAt: Date;
  subscription: SubscriptionInfo;
  statistics: UserStatistics;
  referral: ReferralInfo;
  emergencyContacts: EmergencyContact[];
  savedAddresses: SavedAddress[];
  settings: UserSettings;
}

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  subscriptionType: SubscriptionType;
  subscriptionStatus: SubscriptionStatus;
  status: UserStatus;
  registeredAt: Date;
  lastActiveAt: Date;
  consultationCount: number;
  totalSpent: number;
}
