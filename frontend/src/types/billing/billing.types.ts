// Billing Types
export interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  planDetails: PlanDetails;
}

export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';

export interface PlanDetails {
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: PlanFeature[];
  limits: PlanLimits;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  exams: number;
  questions: number;
  attempts: number;
  storage: number; // in MB
  teamMembers: number;
  apiCalls: number;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string;
  paidAt?: string;
  dueDate: string;
  pdfUrl?: string;
}

export type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Price {
  id: string;
  plan: PlanType;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  stripePriceId: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
