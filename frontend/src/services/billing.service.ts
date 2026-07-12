/**
 * ExamForge AI — Billing Service
 * API calls for billing endpoints.
 */
import { apiClient } from "./api-client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

export const billingService = {
  sendInvoice: (data: {
    email: string;
    planName: string;
    cycle: string;
    amount: string;
    txnId: string;
  }) => apiClient.post(API_ENDPOINTS.BILLING.SEND_INVOICE, data),

  getHistory: (email: string) =>
    apiClient.get(`${API_ENDPOINTS.BILLING.HISTORY}?email=${email}`),
};
