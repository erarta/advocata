// Content & Support Custom Hooks
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  DocumentTemplateParams,
  LegalInfoPageParams,
  FAQParams,
  FAQReorderItem,
  SupportTicketParams,
  OnboardingSlideParams,
  OnboardingReorderItem,
  DocumentTemplate,
  LegalInfoPage,
  FAQ,
  OnboardingSlide,
} from '@/lib/types/content';
import * as contentApi from '@/lib/api/content';

// Stale time constants (in milliseconds)
const FIVE_MINUTES = 5 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;
const THIRTY_SECONDS = 30 * 1000;

// ==================== DOCUMENT TEMPLATE HOOKS ====================

/**
 * Fetch document templates with filters
 */
export function useDocumentTemplates(params?: DocumentTemplateParams) {
  return useQuery({
    queryKey: ['documents', 'templates', params],
    queryFn: () => contentApi.getDocumentTemplates(params),
    staleTime: FIVE_MINUTES,
  });
}

/**
 * Fetch single document template
 */
export function useDocumentTemplate(id: string) {
  return useQuery({
    queryKey: ['documents', 'templates', id],
    queryFn: () => contentApi.getDocumentTemplate(id),
    enabled: !!id,
    staleTime: FIVE_MINUTES,
  });
}

/**
 * Fetch document template statistics
 */
export function useDocumentStats() {
  return useQuery({
    queryKey: ['documents', 'stats'],
    queryFn: () => contentApi.getDocumentStats(),
    staleTime: FIVE_MINUTES,
  });
}

/**
 * Fetch document version history
 */
export function useDocumentVersionHistory(id: string) {
  return useQuery({
    queryKey: ['documents', 'templates', id, 'versions'],
    queryFn: () => contentApi.getDocumentVersionHistory(id),
    enabled: !!id,
    staleTime: FIVE_MINUTES,
  });
}

/**
 * Create a new document template
 */
export function useCreateDocumentTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'version'>) =>
      contentApi.createDocumentTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['documents', 'stats'] });
      toast({
        title: 'Шаблон создан',
        description: 'Шаблон документа успешно создан.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка создания',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a document template
 */
export function useUpdateDocumentTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DocumentTemplate> }) =>
      contentApi.updateDocumentTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'templates'] });
      toast({
        title: 'Шаблон обновлён',
        description: 'Шаблон документа успешно обновлён.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a document template
 */
export function useDeleteDocumentTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => contentApi.deleteDocumentTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['documents', 'stats'] });
      toast({
        title: 'Шаблон удалён',
        description: 'Шаблон документа успешно удалён.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка удаления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Duplicate a document template
 */
export function useDuplicateDocumentTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => contentApi.duplicateDocumentTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'templates'] });
      toast({
        title: 'Шаблон дублирован',
        description: 'Шаблон документа успешно дублирован.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка дублирования',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Preview a document with variables
 */
export function usePreviewDocument() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, variables }: { id: string; variables: Record<string, string> }) =>
      contentApi.previewDocument(id, variables),
    onError: (error: Error) => {
      toast({
        title: 'Ошибка предпросмотра',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== LEGAL INFO PAGE HOOKS ====================

/**
 * Fetch legal info pages with filters
 */
export function useLegalInfoPages(params?: LegalInfoPageParams) {
  return useQuery({
    queryKey: ['legal-info', 'pages', params],
    queryFn: () => contentApi.getLegalInfoPages(params),
    staleTime: TEN_MINUTES,
  });
}

/**
 * Fetch single legal info page
 */
export function useLegalInfoPage(id: string) {
  return useQuery({
    queryKey: ['legal-info', 'pages', id],
    queryFn: () => contentApi.getLegalInfoPage(id),
    enabled: !!id,
    staleTime: TEN_MINUTES,
  });
}

/**
 * Create a new legal info page
 */
export function useCreateLegalInfoPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<LegalInfoPage, 'id' | 'createdAt' | 'updatedAt' | 'version'>) =>
      contentApi.createLegalInfoPage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-info', 'pages'] });
      toast({
        title: 'Страница создана',
        description: 'Страница успешно создана.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка создания',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a legal info page
 */
export function useUpdateLegalInfoPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LegalInfoPage> }) =>
      contentApi.updateLegalInfoPage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-info', 'pages'] });
      toast({
        title: 'Страница обновлена',
        description: 'Страница успешно обновлена.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a legal info page
 */
export function useDeleteLegalInfoPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => contentApi.deleteLegalInfoPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-info', 'pages'] });
      toast({
        title: 'Страница удалена',
        description: 'Страница успешно удалена.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка удаления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Publish a legal info page
 */
export function usePublishLegalInfoPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => contentApi.publishLegalInfoPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-info', 'pages'] });
      toast({
        title: 'Страница опубликована',
        description: 'Страница успешно опубликована.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка публикации',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Unpublish a legal info page
 */
export function useUnpublishLegalInfoPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => contentApi.unpublishLegalInfoPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-info', 'pages'] });
      toast({
        title: 'Публикация отменена',
        description: 'Страница снята с публикации.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Schedule a legal info page for publishing
 */
export function useScheduleLegalInfoPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, scheduledFor }: { id: string; scheduledFor: string }) =>
      contentApi.scheduleLegalInfoPage(id, scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-info', 'pages'] });
      toast({
        title: 'Публикация запланирована',
        description: 'Страница будет опубликована в указанное время.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка планирования',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== FAQ HOOKS ====================

/**
 * Fetch FAQs with filters
 */
export function useFAQs(params?: FAQParams) {
  return useQuery({
    queryKey: ['faq', params],
    queryFn: () => contentApi.getFAQs(params),
    staleTime: FIVE_MINUTES,
  });
}

/**
 * Fetch single FAQ
 */
export function useFAQ(id: string) {
  return useQuery({
    queryKey: ['faq', id],
    queryFn: () => contentApi.getFAQ(id),
    enabled: !!id,
    staleTime: FIVE_MINUTES,
  });
}

/**
 * Fetch FAQ statistics
 */
export function useFAQStats() {
  return useQuery({
    queryKey: ['faq', 'stats'],
    queryFn: () => contentApi.getFAQStats(),
    staleTime: FIVE_MINUTES,
  });
}

/**
 * Create a new FAQ
 */
export function useCreateFAQ() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'helpfulCount' | 'notHelpfulCount'>) =>
      contentApi.createFAQ(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      toast({
        title: 'FAQ создан',
        description: 'Вопрос успешно создан.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка создания',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a FAQ
 */
export function useUpdateFAQ() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FAQ> }) =>
      contentApi.updateFAQ(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      toast({
        title: 'FAQ обновлён',
        description: 'Вопрос успешно обновлён.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a FAQ
 */
export function useDeleteFAQ() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => contentApi.deleteFAQ(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      toast({
        title: 'FAQ удалён',
        description: 'Вопрос успешно удалён.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка удаления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Reorder FAQs within a category
 */
export function useReorderFAQs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ category, items }: { category: string; items: FAQReorderItem[] }) =>
      contentApi.reorderFAQs(category, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      toast({
        title: 'Порядок обновлён',
        description: 'Порядок вопросов успешно обновлён.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка изменения порядка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== SUPPORT TICKET HOOKS ====================

/**
 * Fetch support tickets with filters
 */
export function useSupportTickets(params?: SupportTicketParams) {
  return useQuery({
    queryKey: ['support', 'tickets', params],
    queryFn: () => contentApi.getSupportTickets(params),
    staleTime: THIRTY_SECONDS,
  });
}

/**
 * Fetch single support ticket with details
 */
export function useSupportTicket(id: string) {
  return useQuery({
    queryKey: ['support', 'tickets', id],
    queryFn: () => contentApi.getSupportTicket(id),
    enabled: !!id,
    staleTime: THIRTY_SECONDS,
  });
}

/**
 * Fetch support ticket statistics
 */
export function useSupportTicketStats() {
  return useQuery({
    queryKey: ['support', 'stats'],
    queryFn: () => contentApi.getSupportTicketStats(),
    staleTime: THIRTY_SECONDS,
  });
}

/**
 * Assign a support ticket to an admin
 */
export function useAssignSupportTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, adminId }: { id: string; adminId: string }) =>
      contentApi.assignSupportTicket(id, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
      toast({
        title: 'Тикет назначен',
        description: 'Тикет успешно назначен администратору.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка назначения',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Reply to a support ticket
 */
export function useReplySupportTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      contentApi.replySupportTicket(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
      toast({
        title: 'Ответ отправлен',
        description: 'Ваш ответ успешно отправлен.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка отправки',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Add an internal note to a support ticket
 */
export function useAddInternalNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      contentApi.addInternalNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
      toast({
        title: 'Заметка добавлена',
        description: 'Внутренняя заметка успешно добавлена.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка добавления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update support ticket status
 */
export function useUpdateSupportTicketStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      contentApi.updateSupportTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'stats'] });
      toast({
        title: 'Статус обновлён',
        description: 'Статус тикета успешно обновлён.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update support ticket priority
 */
export function useUpdateSupportTicketPriority() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: string }) =>
      contentApi.updateSupportTicketPriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
      toast({
        title: 'Приоритет обновлён',
        description: 'Приоритет тикета успешно обновлён.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== ONBOARDING HOOKS ====================

/**
 * Fetch onboarding slides with filters
 */
export function useOnboardingSlides(params?: OnboardingSlideParams) {
  return useQuery({
    queryKey: ['onboarding', 'slides', params],
    queryFn: () => contentApi.getOnboardingSlides(params),
    staleTime: TEN_MINUTES,
  });
}

/**
 * Fetch single onboarding slide
 */
export function useOnboardingSlide(id: string) {
  return useQuery({
    queryKey: ['onboarding', 'slides', id],
    queryFn: () => contentApi.getOnboardingSlide(id),
    enabled: !!id,
    staleTime: TEN_MINUTES,
  });
}

/**
 * Create a new onboarding slide
 */
export function useCreateOnboardingSlide() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<OnboardingSlide, 'id' | 'createdAt' | 'updatedAt'>) =>
      contentApi.createOnboardingSlide(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'slides'] });
      toast({
        title: 'Слайд создан',
        description: 'Слайд онбординга успешно создан.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка создания',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update an onboarding slide
 */
export function useUpdateOnboardingSlide() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OnboardingSlide> }) =>
      contentApi.updateOnboardingSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'slides'] });
      toast({
        title: 'Слайд обновлён',
        description: 'Слайд онбординга успешно обновлён.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete an onboarding slide
 */
export function useDeleteOnboardingSlide() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => contentApi.deleteOnboardingSlide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'slides'] });
      toast({
        title: 'Слайд удалён',
        description: 'Слайд онбординга успешно удалён.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка удаления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Reorder onboarding slides
 */
export function useReorderOnboardingSlides() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ targetAudience, items }: { targetAudience: string; items: OnboardingReorderItem[] }) =>
      contentApi.reorderOnboardingSlides(targetAudience, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'slides'] });
      toast({
        title: 'Порядок обновлён',
        description: 'Порядок слайдов успешно обновлён.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка изменения порядка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Upload an image for onboarding slide
 */
export function useUploadOnboardingImage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => contentApi.uploadOnboardingImage(file),
    onSuccess: () => {
      toast({
        title: 'Изображение загружено',
        description: 'Изображение успешно загружено.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка загрузки',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
