-- =====================================================
-- DnDHero Schema Continuation
-- Rules, Content, Safety, Payments & Quotas
-- =====================================================

-- =====================================================
-- RULES & CONTENT
-- =====================================================

CREATE TABLE rulesets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_official BOOLEAN DEFAULT FALSE,  -- Official 5e SRD vs homebrew
  is_global BOOLEAN DEFAULT FALSE,  -- Available to all campaigns
  created_by UUID REFERENCES profiles(id),
  parent_ruleset_id UUID REFERENCES rulesets(id),  -- For homebrew extending official
  rules_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rulesets_official ON rulesets(is_official);
CREATE INDEX idx_rulesets_global ON rulesets(is_global);

CREATE TABLE rules_corpus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ruleset_id UUID NOT NULL REFERENCES rulesets(id) ON DELETE CASCADE,
  rule_key TEXT NOT NULL,  -- Unique identifier for rule lookup
  category TEXT NOT NULL,  -- 'combat', 'spells', 'conditions', etc
  content TEXT NOT NULL,  -- Licensed 5e text (server-side only)
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ruleset_id, rule_key)
);

CREATE INDEX idx_rules_corpus_ruleset ON rules_corpus(ruleset_id);
CREATE INDEX idx_rules_corpus_key ON rules_corpus(rule_key);
CREATE INDEX idx_rules_corpus_category ON rules_corpus(category);

CREATE TABLE rule_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  rule_key TEXT NOT NULL,
  override_content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, rule_key)
);

CREATE INDEX idx_rule_overrides_campaign ON rule_overrides(campaign_id);

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type asset_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,  -- Supabase Storage URL
  style_tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,  -- Scene type, mood, etc
  is_library BOOLEAN DEFAULT TRUE,  -- True for reusable assets
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_style ON assets USING GIN(style_tags);
CREATE INDEX idx_assets_library ON assets(is_library);

CREATE TABLE content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_type asset_type NOT NULL,
  name TEXT NOT NULL,
  prompt_template TEXT NOT NULL,  -- Template with placeholders
  style_params JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_templates_type ON content_templates(asset_type);

CREATE TABLE content_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  asset_type asset_type NOT NULL,
  status content_job_status NOT NULL DEFAULT 'pending',
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,

  -- Result
  asset_id UUID REFERENCES assets(id),
  error TEXT,
  retries INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_content_jobs_status ON content_jobs(status);
CREATE INDEX idx_content_jobs_campaign ON content_jobs(campaign_id);
CREATE INDEX idx_content_jobs_created ON content_jobs(created_at);

-- =====================================================
-- SAFETY & ADMIN
-- =====================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  target_user_id UUID REFERENCES profiles(id),  -- Reported user
  campaign_id UUID REFERENCES campaigns(id),  -- Reported campaign
  event_log_id UUID REFERENCES event_log(id),  -- Reported content

  report_type TEXT NOT NULL,  -- 'harassment', 'inappropriate_content', etc
  description TEXT NOT NULL,
  status report_status NOT NULL DEFAULT 'pending',

  -- Admin actions
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_user_id);
CREATE INDEX idx_reports_campaign ON reports(campaign_id);
CREATE INDEX idx_reports_created ON reports(created_at DESC);

CREATE TABLE bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  banned_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ,  -- NULL for permanent ban
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bans_user ON bans(user_id);
CREATE INDEX idx_bans_expires ON bans(expires_at);

CREATE TABLE admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Populate default admin settings
INSERT INTO admin_settings (key, value, description) VALUES
  -- Free tier defaults
  ('free_tier_max_campaigns_per_month', '2', 'Max campaigns a free user can join per month'),
  ('free_tier_max_hosted_campaigns', '1', 'Max campaigns a free user can host concurrently'),
  ('free_tier_dm_turns_monthly', '150', 'DM text turns per campaign per month'),
  ('free_tier_maps_monthly', '2', 'Map generations per campaign per month'),
  ('free_tier_portraits_monthly', '5', 'Portrait generations per campaign per month'),
  ('free_tier_stt_minutes_monthly', '30', 'Voice-to-text minutes per month'),

  -- Paid tier defaults
  ('paid_tier_max_campaigns_per_month', '-1', 'Max campaigns (-1 = unlimited)'),
  ('paid_tier_max_hosted_campaigns', '5', 'Max campaigns a paid user can host concurrently'),
  ('paid_tier_dm_turns_monthly', '600', 'DM text turns per campaign per month'),
  ('paid_tier_maps_monthly', '10', 'Map generations per campaign per month'),
  ('paid_tier_portraits_monthly', '25', 'Portrait generations per campaign per month'),
  ('paid_tier_stt_minutes_monthly', '180', 'Voice-to-text minutes per month'),

  -- Threshold defaults
  ('soft_threshold_percent', '70', 'Soft threshold percentage (invisible to users)'),
  ('hard_daily_cap_percent', '100', 'Hard daily cap percentage'),
  ('hard_monthly_cap_percent', '100', 'Hard monthly cap percentage'),
  ('asset_reuse_window_days', '30', 'Days before asset can be shown again to same user'),

  -- Turn timing defaults
  ('live_soft_nudge_seconds', '30', 'Soft nudge time in live mode'),
  ('async_soft_nudge_hours', '24', 'Soft nudge time in async mode'),

  -- Invite defaults
  ('invite_expiry_days', '7', 'Default invite expiry in days'),
  ('invite_max_uses', '5', 'Default max uses for invites'),

  -- Safety defaults
  ('log_retention_days', '30', 'Event log retention period'),
  ('minor_safe_auto_enforce', 'true', 'Auto-enforce minor-safe mode'),

  -- Kill switches
  ('disable_image_generation', 'false', 'Global kill switch for image generation'),
  ('force_library_only', 'false', 'Force library-only assets globally'),
  ('disable_stt', 'false', 'Disable voice-to-text globally'),
  ('force_short_dm_responses', 'false', 'Force shorter DM responses globally');

-- =====================================================
-- PAYMENTS & QUOTAS
-- =====================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  tier subscription_tier NOT NULL,
  status TEXT NOT NULL,  -- 'active', 'canceled', 'past_due', etc
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)  -- One subscription per user
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE TABLE credit_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  campaign_id UUID REFERENCES campaigns(id),  -- NULL for user-level transactions

  transaction_type TEXT NOT NULL,  -- 'purchase', 'usage', 'refund', 'monthly_grant'
  amount INTEGER NOT NULL,  -- Positive for additions, negative for usage
  balance_after INTEGER NOT NULL,

  -- Related data
  stripe_payment_intent_id TEXT,
  usage_metadata JSONB DEFAULT '{}'::jsonb,  -- What was consumed

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_ledger_user ON credit_ledger(user_id);
CREATE INDEX idx_credit_ledger_campaign ON credit_ledger(campaign_id);
CREATE INDEX idx_credit_ledger_created ON credit_ledger(created_at DESC);

CREATE TABLE usage_counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  campaign_id UUID REFERENCES campaigns(id),  -- NULL for user-level counters

  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Usage tracking
  dm_turns_used INTEGER DEFAULT 0,
  dm_turns_limit INTEGER NOT NULL,

  maps_generated INTEGER DEFAULT 0,
  maps_limit INTEGER NOT NULL,

  portraits_generated INTEGER DEFAULT 0,
  portraits_limit INTEGER NOT NULL,

  stt_minutes_used REAL DEFAULT 0,
  stt_minutes_limit REAL NOT NULL,

  -- Soft threshold tracking (for invisible adjustments)
  soft_threshold_crossed BOOLEAN DEFAULT FALSE,
  soft_threshold_crossed_at TIMESTAMPTZ,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, campaign_id, period_start)
);

CREATE INDEX idx_usage_counters_user ON usage_counters(user_id);
CREATE INDEX idx_usage_counters_campaign ON usage_counters(campaign_id);
CREATE INDEX idx_usage_counters_period ON usage_counters(period_start, period_end);

-- View for entitlements (derived from subscriptions + credits)
CREATE VIEW entitlements AS
SELECT
  p.id AS user_id,
  COALESCE(s.tier, 'free') AS tier,
  COALESCE(s.status, 'inactive') AS subscription_status,

  -- Credit balance (sum of all transactions for this user)
  COALESCE((
    SELECT SUM(amount)
    FROM credit_ledger
    WHERE user_id = p.id
  ), 0) AS credit_balance,

  -- Campaign limits
  CASE
    WHEN COALESCE(s.tier, 'free') = 'paid' THEN
      (SELECT value::integer FROM admin_settings WHERE key = 'paid_tier_max_campaigns_per_month')
    ELSE
      (SELECT value::integer FROM admin_settings WHERE key = 'free_tier_max_campaigns_per_month')
  END AS max_campaigns_per_month,

  CASE
    WHEN COALESCE(s.tier, 'free') = 'paid' THEN
      (SELECT value::integer FROM admin_settings WHERE key = 'paid_tier_max_hosted_campaigns')
    ELSE
      (SELECT value::integer FROM admin_settings WHERE key = 'free_tier_max_hosted_campaigns')
  END AS max_hosted_campaigns,

  -- Monthly limits
  CASE
    WHEN COALESCE(s.tier, 'free') = 'paid' THEN
      (SELECT value::integer FROM admin_settings WHERE key = 'paid_tier_dm_turns_monthly')
    ELSE
      (SELECT value::integer FROM admin_settings WHERE key = 'free_tier_dm_turns_monthly')
  END AS dm_turns_monthly,

  CASE
    WHEN COALESCE(s.tier, 'free') = 'paid' THEN
      (SELECT value::integer FROM admin_settings WHERE key = 'paid_tier_maps_monthly')
    ELSE
      (SELECT value::integer FROM admin_settings WHERE key = 'free_tier_maps_monthly')
  END AS maps_monthly,

  CASE
    WHEN COALESCE(s.tier, 'free') = 'paid' THEN
      (SELECT value::integer FROM admin_settings WHERE key = 'paid_tier_portraits_monthly')
    ELSE
      (SELECT value::integer FROM admin_settings WHERE key = 'free_tier_portraits_monthly')
  END AS portraits_monthly,

  CASE
    WHEN COALESCE(s.tier, 'free') = 'paid' THEN
      (SELECT value::integer FROM admin_settings WHERE key = 'paid_tier_stt_minutes_monthly')
    ELSE
      (SELECT value::integer FROM admin_settings WHERE key = 'free_tier_stt_minutes_monthly')
  END AS stt_minutes_monthly

FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to increment state version
CREATE OR REPLACE FUNCTION increment_state_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.state_version = OLD.state_version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for scene state version
CREATE TRIGGER scene_state_version_trigger
  BEFORE UPDATE ON scenes
  FOR EACH ROW
  EXECUTE FUNCTION increment_state_version();

-- Trigger for campaign state version
CREATE TRIGGER campaign_state_version_trigger
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION increment_state_version();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER characters_updated_at BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER scenes_updated_at BEFORE UPDATE ON scenes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Schema complete!
