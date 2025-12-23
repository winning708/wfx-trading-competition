import { supabase } from '@/lib/supabase';

export interface PaymentTransaction {
  id: string;
  trader_id: string;
  payment_method: 'flutterwave' | 'binance' | 'bybit';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference_id: string;
  external_reference: string;
  error_message: string | null;
  attempted_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  trader?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface PaymentStats {
  total_transactions: number;
  total_revenue: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  success_rate: number;
}

/**
 * Get all payment transactions with optional filtering
 */
export async function getPaymentTransactions(
  filters?: {
    status?: string;
    method?: string;
    limit?: number;
    offset?: number;
  }
): Promise<PaymentTransaction[]> {
  try {
    let query = supabase
      .from('payment_transactions')
      .select(`
        *,
        trader:trader_id(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.method) {
      query = query.eq('payment_method', filters.method);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payment transactions:', error);
      return [];
    }

    return (data || []) as PaymentTransaction[];
  } catch (error) {
    console.error('Error in getPaymentTransactions:', error);
    return [];
  }
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(): Promise<PaymentStats> {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('status, amount');

    if (error) {
      console.error('Error fetching payment stats:', error);
      return {
        total_transactions: 0,
        total_revenue: 0,
        successful_payments: 0,
        failed_payments: 0,
        pending_payments: 0,
        success_rate: 0,
      };
    }

    const transactions = (data || []) as any[];
    const total = transactions.length;
    const completed = transactions.filter((t) => t.status === 'completed').length;
    const failed = transactions.filter((t) => t.status === 'failed').length;
    const pending = transactions.filter((t) => t.status === 'pending').length;
    const totalRevenue = transactions
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      total_transactions: total,
      total_revenue: totalRevenue,
      successful_payments: completed,
      failed_payments: failed,
      pending_payments: pending,
      success_rate: total > 0 ? (completed / total) * 100 : 0,
    };
  } catch (error) {
    console.error('Error in getPaymentStats:', error);
    return {
      total_transactions: 0,
      total_revenue: 0,
      successful_payments: 0,
      failed_payments: 0,
      pending_payments: 0,
      success_rate: 0,
    };
  }
}

/**
 * Get failed payments (for alerts)
 */
export async function getFailedPayments(limit: number = 10): Promise<PaymentTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        trader:trader_id(id, full_name, email)
      `)
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching failed payments:', error);
      return [];
    }

    return (data || []) as PaymentTransaction[];
  } catch (error) {
    console.error('Error in getFailedPayments:', error);
    return [];
  }
}

/**
 * Get payment transactions by trader
 */
export async function getTraderPayments(traderId: string): Promise<PaymentTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        trader:trader_id(id, full_name, email)
      `)
      .eq('trader_id', traderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trader payments:', error);
      return [];
    }

    return (data || []) as PaymentTransaction[];
  } catch (error) {
    console.error('Error in getTraderPayments:', error);
    return [];
  }
}

/**
 * Get payment summary by method
 */
export async function getPaymentMethodStats(): Promise<
  Array<{
    method: string;
    count: number;
    total: number;
    success_rate: number;
  }>
> {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('payment_method, status, amount');

    if (error) {
      console.error('Error fetching payment method stats:', error);
      return [];
    }

    const transactions = (data || []) as any[];
    const methods = new Map<
      string,
      {
        count: number;
        completed: number;
        total: number;
      }
    >();

    transactions.forEach((t) => {
      if (!methods.has(t.payment_method)) {
        methods.set(t.payment_method, { count: 0, completed: 0, total: 0 });
      }

      const stats = methods.get(t.payment_method)!;
      stats.count++;
      stats.total += t.amount || 0;
      if (t.status === 'completed') {
        stats.completed++;
      }
    });

    return Array.from(methods.entries()).map(([method, stats]) => ({
      method,
      count: stats.count,
      total: stats.total,
      success_rate: stats.count > 0 ? (stats.completed / stats.count) * 100 : 0,
    }));
  } catch (error) {
    console.error('Error in getPaymentMethodStats:', error);
    return [];
  }
}
