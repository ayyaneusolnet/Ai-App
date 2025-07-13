/*
  # Enhanced Database Schema for Complete AI Business Platform

  1. New Tables
    - `portfolios` - Business portfolio/website builder
    - `leads` - CRM and lead management
    - `team_members` - Team management
    - `notifications` - In-app notifications
    - `email_templates` - Email template management
    - `projects` - Project management
    - `budgets` - Budget planning and tracking

  2. Enhanced Tables
    - Add tax configuration to invoices
    - Add payment details to invoices
    - Enhanced user settings
    - Subscription management

  3. Security & Performance
    - RLS policies for all new tables
    - Indexes for performance
    - Triggers for timestamps
*/

-- Business Portfolios
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  tagline text,
  description text,
  services jsonb DEFAULT '[]',
  contact_info jsonb DEFAULT '{}',
  social_links jsonb DEFAULT '{}',
  is_public boolean DEFAULT false,
  slug text UNIQUE,
  theme_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CRM Leads
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  source text DEFAULT 'website' CHECK (source IN ('website', 'referral', 'social', 'email', 'phone', 'event', 'other')),
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes text,
  tags jsonb DEFAULT '[]',
  custom_fields jsonb DEFAULT '{}',
  last_contact_date timestamptz,
  next_follow_up timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member')),
  permissions jsonb DEFAULT '[]',
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('success', 'warning', 'error', 'info')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  action_url text,
  action_label text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('welcome', 'payment_confirmation', 'payment_failed', 'upgrade', 'reminder', 'custom')),
  variables jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'in-progress', 'completed', 'on-hold', 'cancelled')),
  start_date date,
  end_date date,
  budget decimal(12,2),
  spent decimal(12,2) DEFAULT 0,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  team_members jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_amount decimal(12,2) NOT NULL,
  period text DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  categories jsonb NOT NULL DEFAULT '[]',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions (Enhanced)
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  tier text NOT NULL CHECK (tier IN ('free', 'pro', 'business')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced invoice structure
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate decimal(5,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount decimal(10,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_info jsonb DEFAULT '{}';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurring_settings jsonb DEFAULT '{}';

-- Enhanced user settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS tax_settings jsonb DEFAULT '{}';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS invoice_settings jsonb DEFAULT '{}';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{}';

-- Enable RLS
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Portfolios
CREATE POLICY "Users can manage own portfolios"
  ON portfolios
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public portfolios are viewable by everyone"
  ON portfolios
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- Leads
CREATE POLICY "Users can manage own leads"
  ON leads
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Team Members
CREATE POLICY "Users can manage own team"
  ON team_members
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Email Templates
CREATE POLICY "Users can manage own email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Projects
CREATE POLICY "Users can manage own projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Budgets
CREATE POLICY "Users can manage own budgets"
  ON budgets
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Subscriptions
CREATE POLICY "Users can read own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_public ON portfolios(is_public);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Triggers for updated_at
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for business logic

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_action_url text DEFAULT NULL,
  p_action_label text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, action_url, action_label)
  VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_action_label)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update subscription
CREATE OR REPLACE FUNCTION update_user_subscription(
  p_user_id uuid,
  p_tier text,
  p_period_start timestamptz DEFAULT now(),
  p_period_end timestamptz DEFAULT (now() + interval '1 month')
) RETURNS void AS $$
BEGIN
  -- Update user tier
  UPDATE users SET tier = p_tier, updated_at = now() WHERE id = p_user_id;
  
  -- Update or create subscription
  INSERT INTO subscriptions (user_id, tier, current_period_start, current_period_end)
  VALUES (p_user_id, p_tier, p_period_start, p_period_end)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    tier = p_tier,
    current_period_start = p_period_start,
    current_period_end = p_period_end,
    status = 'active',
    updated_at = now();
    
  -- Create notification
  PERFORM create_notification(
    p_user_id,
    'success',
    'Subscription Updated',
    'Your subscription has been successfully updated to ' || p_tier || ' plan.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;