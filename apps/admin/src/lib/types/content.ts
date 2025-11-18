// Content Management & Support Types

// ==================== DOCUMENT TEMPLATE TYPES ====================

export type DocumentCategory =
  | 'traffic_accident' // ДТП
  | 'labor_law' // Трудовое право
  | 'family_law' // Семейное право
  | 'criminal_law' // Уголовное право
  | 'housing_law' // Жилищное право
  | 'civil_law' // Гражданское право
  | 'administrative_law' // Административное право
  | 'other'; // Прочее

export type DocumentStatus = 'active' | 'inactive' | 'draft';

export interface DocumentVariable {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number';
  required: boolean;
  defaultValue?: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  content: string; // Rich text/Markdown
  variables: DocumentVariable[];
  isPremium: boolean;
  price?: number; // If premium
  downloadCount: number;
  status: DocumentStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName?: string;
}

export interface DocumentTemplateVersion {
  id: string;
  templateId: string;
  version: number;
  content: string;
  changedBy: string;
  changedByName: string;
  changeNotes?: string;
  createdAt: string;
}

export interface DocumentTemplateParams {
  category?: DocumentCategory;
  status?: DocumentStatus;
  isPremium?: boolean;
  search?: string;
  sort_by?: 'title' | 'downloads' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DocumentPreview {
  content: string;
  variables: Record<string, string>;
}

export interface DocumentStats {
  totalTemplates: number;
  activeTemplates: number;
  premiumTemplates: number;
  totalDownloads: number;
  downloadsByCategory: Record<DocumentCategory, number>;
}

// ==================== LEGAL INFO PAGE TYPES ====================

export type LegalInfoStatus = 'draft' | 'published' | 'scheduled';

export type LegalInfoPageType =
  | 'about' // О нас
  | 'privacy_policy' // Политика конфиденциальности
  | 'terms_of_service' // Условия использования
  | 'user_agreement' // Пользовательское соглашение
  | 'lawyer_agreement' // Соглашение с юристами
  | 'refund_policy' // Политика возврата
  | 'cookies_policy' // Политика cookies
  | 'custom'; // Пользовательская страница

export interface LegalInfoPage {
  id: string;
  title: string;
  slug: string;
  pageType: LegalInfoPageType;
  content: string; // Rich text
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  status: LegalInfoStatus;
  publishedAt?: string;
  scheduledFor?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName?: string;
}

export interface LegalInfoPageParams {
  status?: LegalInfoStatus;
  pageType?: LegalInfoPageType;
  search?: string;
  sort_by?: 'title' | 'updated_at' | 'published_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ==================== FAQ TYPES ====================

export type FAQCategory =
  | 'general' // Общие вопросы
  | 'for_lawyers' // Юристам
  | 'for_clients' // Клиентам
  | 'payments' // Оплата
  | 'technical'; // Технические вопросы

export type FAQStatus = 'active' | 'inactive';

export interface FAQ {
  id: string;
  question: string;
  answer: string; // Rich text
  category: FAQCategory;
  order: number;
  status: FAQStatus;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FAQParams {
  category?: FAQCategory;
  status?: FAQStatus;
  search?: string;
  sort_by?: 'order' | 'views' | 'helpful';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FAQStats {
  totalFAQs: number;
  activeFAQs: number;
  totalViews: number;
  averageHelpfulness: number; // percentage
  faqsByCategory: Record<FAQCategory, number>;
}

export interface FAQReorderItem {
  id: string;
  order: number;
}

// ==================== SUPPORT TICKET TYPES ====================

export type SupportStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_for_user'
  | 'resolved'
  | 'closed';

export type SupportPriority = 'low' | 'medium' | 'high' | 'urgent';

export type SupportCategory =
  | 'technical' // Технические проблемы
  | 'payment' // Оплата
  | 'account' // Учётная запись
  | 'consultation' // Консультация
  | 'lawyer_issue' // Проблема с юристом
  | 'refund' // Возврат средств
  | 'other'; // Прочее

export type UserRole = 'client' | 'lawyer';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: 'user' | 'admin';
  message: string;
  attachments?: Attachment[];
  createdAt: string;
}

export interface InternalNote {
  id: string;
  ticketId: string;
  adminId: string;
  adminName: string;
  note: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: UserRole;
  subject: string;
  description: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  assignedTo?: string;
  assignedToName?: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SupportTicketDetail extends SupportTicket {
  messages: SupportMessage[];
  internalNotes: InternalNote[];
}

export interface SupportTicketParams {
  status?: SupportStatus;
  priority?: SupportPriority;
  category?: SupportCategory;
  assignedTo?: string;
  userRole?: UserRole;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'updated_at' | 'priority';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SupportStats {
  openTickets: number;
  inProgressTickets: number;
  resolvedToday: number;
  averageResponseTime: number; // in hours
  ticketsByPriority: Record<SupportPriority, number>;
  ticketsByCategory: Record<SupportCategory, number>;
}

// ==================== ONBOARDING TYPES ====================

export type OnboardingAudience = 'client' | 'lawyer';

export type OnboardingStatus = 'active' | 'inactive';

export interface OnboardingSlide {
  id: string;
  targetAudience: OnboardingAudience;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  order: number;
  status: OnboardingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingSlideParams {
  targetAudience?: OnboardingAudience;
  status?: OnboardingStatus;
}

export interface OnboardingReorderItem {
  id: string;
  order: number;
}

// ==================== SHARED TYPES ====================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
