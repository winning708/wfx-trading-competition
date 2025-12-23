-- Create forex_factory_integrations table for tracking Forex Factory Trade Explorer accounts
-- This replaces the MT5 integration functionality

CREATE TABLE IF NOT EXISTS public.forex_factory_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES public.trading_credentials(id) ON DELETE CASCADE,
  ff_account_username VARCHAR(255) NOT NULL,
  ff_api_key TEXT NOT NULL,
  ff_system_id VARCHAR(255) NOT NULL,
  sync_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_forex_factory_credential_id ON public.forex_factory_integrations(credential_id);
CREATE INDEX idx_forex_factory_is_active ON public.forex_factory_integrations(is_active);
CREATE INDEX idx_forex_factory_sync_status ON public.forex_factory_integrations(sync_status);

-- Enable Row Level Security (RLS) if needed
-- ALTER TABLE public.forex_factory_integrations ENABLE ROW LEVEL SECURITY;

-- Grant permissions to service role
GRANT ALL PRIVILEGES ON public.forex_factory_integrations TO service_role;
GRANT ALL PRIVILEGES ON public.forex_factory_integrations TO anon;
