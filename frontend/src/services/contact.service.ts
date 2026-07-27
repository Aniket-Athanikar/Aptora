import { apiClient } from './api-client';
import type { ApiResponse } from '@/types/api';
import type { ContactInput, NewsletterInput } from '@/types';

export const contactService = {
  async sendContact(data: ContactInput): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/api/contact', data);
  },

  async subscribeNewsletter(data: NewsletterInput): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/api/newsletter/subscribe', data);
  },
};
