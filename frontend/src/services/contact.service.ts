import { apiClient } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { ContactInput, BugReportInput, FeedbackInput, NewsletterInput } from '@/types';

export const contactService = {
  async sendContact(data: ContactInput): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/contact', data);
  },

  async submitBugReport(data: BugReportInput): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/feedback/bug-report', data);
  },

  async submitFeedback(data: FeedbackInput): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/feedback', data);
  },

  async subscribeNewsletter(data: NewsletterInput): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/newsletter/subscribe', data);
  },

  async unsubscribeNewsletter(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/newsletter/unsubscribe', { email });
  },
};
