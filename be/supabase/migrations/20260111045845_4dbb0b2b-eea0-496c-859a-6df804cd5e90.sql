-- Create affiliate_programs table to store supported affiliate networks
CREATE TABLE public.affiliate_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  program_type TEXT NOT NULL, -- amazon, flipkart, myntra, ajio, cuelinks, etc.
  api_key TEXT,
  api_secret TEXT,
  affiliate_id TEXT,
  tracking_param TEXT,
  base_url TEXT,
  commission_rate NUMERIC,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_programs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own affiliate programs" 
ON public.affiliate_programs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own affiliate programs" 
ON public.affiliate_programs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate programs" 
ON public.affiliate_programs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own affiliate programs" 
ON public.affiliate_programs FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_affiliate_programs_updated_at
BEFORE UPDATE ON public.affiliate_programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();