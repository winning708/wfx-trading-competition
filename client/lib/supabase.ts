import { createClient } from '@supabase/supabase-js';

// Use environment variables with VITE_ prefix for Vite client exposure
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cujdemfiikeoamryjwza.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1amRlbWZpaWtlb2Ftcnlqd3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTE1OTEsImV4cCI6MjA4MjA2NzU5MX0.yfO_neHiPBBWx7AzYuk5sd4sIocv2BSvtkdzgmpDjC4';

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('Supabase Config:', { SUPABASE_URL });
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Trader {
  rank: number;
  username: string;
  startingBalance: number;
  currentBalance: number;
  profitPercentage: number;
}

export interface TraderRegistration {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  paymentMethod: string;
}
