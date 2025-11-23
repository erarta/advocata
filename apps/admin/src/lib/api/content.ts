// Content & Support API Client
import {
  DocumentTemplate,
  DocumentTemplateVersion,
  DocumentTemplateParams,
  DocumentPreview,
  DocumentStats,
  DocumentVariable,
  LegalInfoPage,
  LegalInfoPageParams,
  FAQ,
  FAQParams,
  FAQStats,
  FAQReorderItem,
  SupportTicket,
  SupportTicketDetail,
  SupportTicketParams,
  SupportStats,
  OnboardingSlide,
  OnboardingSlideParams,
  OnboardingReorderItem,
  PaginatedResponse,
  ApiResponse,
} from '@/lib/types/content';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add authentication header from session
      // 'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// ==================== DOCUMENT TEMPLATE APIs ====================

/**
 * Get document templates with optional filters
 */
export async function getDocumentTemplates(
  params?: DocumentTemplateParams
): Promise<PaginatedResponse<DocumentTemplate>> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  const endpoint = `/admin/content/documents?${queryParams.toString()}`;
  return apiCall<PaginatedResponse<DocumentTemplate>>(endpoint);
}

/**
 * Get a single document template by ID
 */
export async function getDocumentTemplate(id: string): Promise<DocumentTemplate> {
  return apiCall<DocumentTemplate>(`/admin/content/documents/${id}`);
}

/**
 * Create a new document template
 */
export async function createDocumentTemplate(
  data: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'version'>
): Promise<DocumentTemplate> {
  return apiCall<DocumentTemplate>('/admin/content/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing document template
 */
export async function updateDocumentTemplate(
  id: string,
  data: Partial<DocumentTemplate>
): Promise<DocumentTemplate> {
  return apiCall<DocumentTemplate>(`/admin/content/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a document template
 */
export async function deleteDocumentTemplate(id: string): Promise<void> {
  await apiCall<void>(`/admin/content/documents/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Duplicate a document template
 */
export async function duplicateDocumentTemplate(id: string): Promise<DocumentTemplate> {
  return apiCall<DocumentTemplate>(`/admin/content/documents/${id}/duplicate`, {
    method: 'POST',
  });
}

/**
 * Get version history for a document template
 */
export async function getDocumentVersionHistory(
  id: string
): Promise<DocumentTemplateVersion[]> {
  return apiCall<DocumentTemplateVersion[]>(
    `/admin/content/documents/${id}/versions`
  );
}

/**
 * Preview a document with sample data
 */
export async function previewDocument(
  id: string,
  variables: Record<string, string>
): Promise<DocumentPreview> {
  return apiCall<DocumentPreview>(`/admin/content/documents/${id}/preview`, {
    method: 'POST',
    body: JSON.stringify({ variables }),
  });
}

/**
 * Get document template statistics
 */
export async function getDocumentStats(): Promise<DocumentStats> {
  return apiCall<DocumentStats>('/admin/content/documents/stats');
}

// ==================== LEGAL INFO PAGE APIs ====================

/**
 * Get legal info pages with optional filters
 */
export async function getLegalInfoPages(
  params?: LegalInfoPageParams
): Promise<PaginatedResponse<LegalInfoPage>> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  const endpoint = `/admin/content/legal-info?${queryParams.toString()}`;
  return apiCall<PaginatedResponse<LegalInfoPage>>(endpoint);
}

/**
 * Get a single legal info page by ID
 */
export async function getLegalInfoPage(id: string): Promise<LegalInfoPage> {
  return apiCall<LegalInfoPage>(`/admin/content/legal-info/${id}`);
}

/**
 * Create a new legal info page
 */
export async function createLegalInfoPage(
  data: Omit<LegalInfoPage, 'id' | 'createdAt' | 'updatedAt' | 'version'>
): Promise<LegalInfoPage> {
  return apiCall<LegalInfoPage>('/admin/content/legal-info', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing legal info page
 */
export async function updateLegalInfoPage(
  id: string,
  data: Partial<LegalInfoPage>
): Promise<LegalInfoPage> {
  return apiCall<LegalInfoPage>(`/admin/content/legal-info/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a legal info page
 */
export async function deleteLegalInfoPage(id: string): Promise<void> {
  await apiCall<void>(`/admin/content/legal-info/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Publish a legal info page
 */
export async function publishLegalInfoPage(id: string): Promise<LegalInfoPage> {
  return apiCall<LegalInfoPage>(`/admin/content/legal-info/${id}/publish`, {
    method: 'POST',
  });
}

/**
 * Unpublish a legal info page
 */
export async function unpublishLegalInfoPage(id: string): Promise<LegalInfoPage> {
  return apiCall<LegalInfoPage>(`/admin/content/legal-info/${id}/unpublish`, {
    method: 'POST',
  });
}

/**
 * Schedule a legal info page for publishing
 */
export async function scheduleLegalInfoPage(
  id: string,
  scheduledFor: string
): Promise<LegalInfoPage> {
  return apiCall<LegalInfoPage>(`/admin/content/legal-info/${id}/schedule`, {
    method: 'POST',
    body: JSON.stringify({ scheduledFor }),
  });
}

/**
 * Preview a legal info page
 */
export async function previewLegalInfoPage(id: string): Promise<string> {
  return apiCall<string>(`/admin/content/legal-info/${id}/preview`);
}

// ==================== FAQ APIs ====================

/**
 * Get FAQs with optional filters
 */
export async function getFAQs(
  params?: FAQParams
): Promise<PaginatedResponse<FAQ>> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  const endpoint = `/admin/content/faq?${queryParams.toString()}`;
  return apiCall<PaginatedResponse<FAQ>>(endpoint);
}

/**
 * Get a single FAQ by ID
 */
export async function getFAQ(id: string): Promise<FAQ> {
  return apiCall<FAQ>(`/admin/content/faq/${id}`);
}

/**
 * Create a new FAQ
 */
export async function createFAQ(
  data: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'helpfulCount' | 'notHelpfulCount'>
): Promise<FAQ> {
  return apiCall<FAQ>('/admin/content/faq', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing FAQ
 */
export async function updateFAQ(id: string, data: Partial<FAQ>): Promise<FAQ> {
  return apiCall<FAQ>(`/admin/content/faq/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a FAQ
 */
export async function deleteFAQ(id: string): Promise<void> {
  await apiCall<void>(`/admin/content/faq/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Reorder FAQs within a category
 */
export async function reorderFAQs(
  category: string,
  items: FAQReorderItem[]
): Promise<void> {
  await apiCall<void>('/admin/content/faq/reorder', {
    method: 'POST',
    body: JSON.stringify({ category, items }),
  });
}

/**
 * Get FAQ statistics
 */
export async function getFAQStats(): Promise<FAQStats> {
  return apiCall<FAQStats>('/admin/content/faq/stats');
}

// ==================== SUPPORT TICKET APIs ====================

/**
 * Get support tickets with filters
 */
export async function getSupportTickets(
  params?: SupportTicketParams
): Promise<PaginatedResponse<SupportTicket>> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  const endpoint = `/admin/content/support?${queryParams.toString()}`;
  return apiCall<PaginatedResponse<SupportTicket>>(endpoint);
}

/**
 * Get a single support ticket with full details
 */
export async function getSupportTicket(id: string): Promise<SupportTicketDetail> {
  return apiCall<SupportTicketDetail>(`/admin/content/support/${id}`);
}

/**
 * Assign a support ticket to an admin
 */
export async function assignSupportTicket(
  id: string,
  adminId: string
): Promise<void> {
  await apiCall<void>(`/admin/content/support/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ adminId }),
  });
}

/**
 * Reply to a support ticket
 */
export async function replySupportTicket(
  id: string,
  message: string,
  attachments?: File[]
): Promise<void> {
  // TODO: Implement file upload for attachments
  await apiCall<void>(`/admin/content/support/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

/**
 * Add an internal note to a support ticket
 */
export async function addInternalNote(id: string, note: string): Promise<void> {
  await apiCall<void>(`/admin/content/support/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

/**
 * Update support ticket status
 */
export async function updateSupportTicketStatus(
  id: string,
  status: string
): Promise<void> {
  await apiCall<void>(`/admin/content/support/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/**
 * Update support ticket priority
 */
export async function updateSupportTicketPriority(
  id: string,
  priority: string
): Promise<void> {
  await apiCall<void>(`/admin/content/support/${id}/priority`, {
    method: 'PATCH',
    body: JSON.stringify({ priority }),
  });
}

/**
 * Get support ticket statistics
 */
export async function getSupportTicketStats(): Promise<SupportStats> {
  return apiCall<SupportStats>('/admin/content/support/stats');
}

// ==================== ONBOARDING APIs ====================

/**
 * Get onboarding slides with optional filters
 */
export async function getOnboardingSlides(
  params?: OnboardingSlideParams
): Promise<OnboardingSlide[]> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  const endpoint = `/admin/content/onboarding?${queryParams.toString()}`;
  return apiCall<OnboardingSlide[]>(endpoint);
}

/**
 * Get a single onboarding slide by ID
 */
export async function getOnboardingSlide(id: string): Promise<OnboardingSlide> {
  return apiCall<OnboardingSlide>(`/admin/content/onboarding/${id}`);
}

/**
 * Create a new onboarding slide
 */
export async function createOnboardingSlide(
  data: Omit<OnboardingSlide, 'id' | 'createdAt' | 'updatedAt'>
): Promise<OnboardingSlide> {
  return apiCall<OnboardingSlide>('/admin/content/onboarding', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing onboarding slide
 */
export async function updateOnboardingSlide(
  id: string,
  data: Partial<OnboardingSlide>
): Promise<OnboardingSlide> {
  return apiCall<OnboardingSlide>(`/admin/content/onboarding/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete an onboarding slide
 */
export async function deleteOnboardingSlide(id: string): Promise<void> {
  await apiCall<void>(`/admin/content/onboarding/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Reorder onboarding slides for a target audience
 */
export async function reorderOnboardingSlides(
  targetAudience: string,
  items: OnboardingReorderItem[]
): Promise<void> {
  await apiCall<void>('/admin/content/onboarding/reorder', {
    method: 'POST',
    body: JSON.stringify({ targetAudience, items }),
  });
}

/**
 * Upload an image for onboarding slide
 */
export async function uploadOnboardingImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/admin/content/onboarding/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      // TODO: Add authentication header
      // Note: Don't set Content-Type for FormData
    },
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  return response.json();
}
