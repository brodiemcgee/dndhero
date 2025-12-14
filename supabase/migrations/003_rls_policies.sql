-- =====================================================
-- DnDHero Row-Level Security Policies
-- Comprehensive RLS for all tables
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_asset_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_removed_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE turn_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dice_roll_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rulesets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules_corpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT is_admin FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is campaign member
CREATE OR REPLACE FUNCTION is_campaign_member(user_id UUID, camp_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaign_members
    WHERE campaign_id = camp_id
    AND user_id = user_id
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is campaign host
CREATE OR REPLACE FUNCTION is_campaign_host(user_id UUID, camp_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaigns
    WHERE id = camp_id
    AND host_player_id = user_id
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user was removed from campaign
CREATE OR REPLACE FUNCTION was_removed_from_campaign(user_id UUID, camp_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaign_removed_users
    WHERE campaign_id = camp_id
    AND user_id = user_id
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is banned
CREATE OR REPLACE FUNCTION is_banned(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM bans
    WHERE user_id = user_id
    AND (expires_at IS NULL OR expires_at > NOW())
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- PROFILES
-- =====================================================

-- Users can read their own profile
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin(auth.uid()));

-- Users can update their own profile
CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (auth.uid() = id OR is_admin(auth.uid()));

-- Only admins can insert profiles (handled by auth trigger)
CREATE POLICY profiles_insert ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR is_admin(auth.uid()));

-- =====================================================
-- USER ASSET HISTORY
-- =====================================================

-- Users can read their own history
CREATE POLICY user_asset_history_select ON user_asset_history
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Service role can insert/update (tracking is server-side)
CREATE POLICY user_asset_history_insert ON user_asset_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY user_asset_history_update ON user_asset_history
  FOR UPDATE USING (true);

-- =====================================================
-- CAMPAIGNS
-- =====================================================

-- Campaign members can read campaign
CREATE POLICY campaigns_select ON campaigns
  FOR SELECT USING (
    is_campaign_member(auth.uid(), id)
    OR is_admin(auth.uid())
  );

-- Only hosts can update campaigns
CREATE POLICY campaigns_update ON campaigns
  FOR UPDATE USING (
    is_campaign_host(auth.uid(), id)
    OR is_admin(auth.uid())
  );

-- Authenticated users can create campaigns (if not banned)
CREATE POLICY campaigns_insert ON campaigns
  FOR INSERT WITH CHECK (
    auth.uid() = host_player_id
    AND NOT is_banned(auth.uid())
  );

-- Only admins can delete campaigns
CREATE POLICY campaigns_delete ON campaigns
  FOR DELETE USING (is_admin(auth.uid()));

-- =====================================================
-- CAMPAIGN MEMBERS
-- =====================================================

-- Campaign members can see other members
CREATE POLICY campaign_members_select ON campaign_members
  FOR SELECT USING (
    is_campaign_member(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

-- Service role handles member management (invite acceptance, etc)
CREATE POLICY campaign_members_insert ON campaign_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY campaign_members_update ON campaign_members
  FOR UPDATE USING (true);

-- Host can remove members (via service role)
CREATE POLICY campaign_members_delete ON campaign_members
  FOR DELETE USING (true);

-- =====================================================
-- CAMPAIGN INVITES
-- =====================================================

-- Campaign members can see invites
CREATE POLICY campaign_invites_select ON campaign_invites
  FOR SELECT USING (
    is_campaign_member(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

-- Only hosts can create invites
CREATE POLICY campaign_invites_insert ON campaign_invites
  FOR INSERT WITH CHECK (
    is_campaign_host(auth.uid(), campaign_id)
  );

-- Only hosts can update/revoke invites
CREATE POLICY campaign_invites_update ON campaign_invites
  FOR UPDATE USING (
    is_campaign_host(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

-- Only hosts can delete invites
CREATE POLICY campaign_invites_delete ON campaign_invites
  FOR DELETE USING (
    is_campaign_host(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

-- =====================================================
-- CAMPAIGN REMOVED USERS
-- =====================================================

-- Hosts and admins can see removed users
CREATE POLICY campaign_removed_users_select ON campaign_removed_users
  FOR SELECT USING (
    is_campaign_host(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

-- Service role handles removals
CREATE POLICY campaign_removed_users_insert ON campaign_removed_users
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- CHARACTERS
-- =====================================================

-- Campaign members can see all characters in campaign
CREATE POLICY characters_select ON characters
  FOR SELECT USING (
    is_campaign_member(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

-- Players can update their own characters
CREATE POLICY characters_update ON characters
  FOR UPDATE USING (
    auth.uid() = player_id
    OR is_admin(auth.uid())
  );

-- Players can create characters in campaigns they're in
CREATE POLICY characters_insert ON characters
  FOR INSERT WITH CHECK (
    auth.uid() = player_id
    AND is_campaign_member(auth.uid(), campaign_id)
    AND NOT was_removed_from_campaign(auth.uid(), campaign_id)
  );

-- Players can delete their own characters
CREATE POLICY characters_delete ON characters
  FOR DELETE USING (
    auth.uid() = player_id
    OR is_admin(auth.uid())
  );

-- =====================================================
-- CHARACTER PROGRESSION
-- =====================================================

-- Campaign members can see progression
CREATE POLICY character_progression_select ON character_progression
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_progression.character_id
      AND is_campaign_member(auth.uid(), characters.campaign_id)
    )
    OR is_admin(auth.uid())
  );

-- Service role handles progression updates
CREATE POLICY character_progression_insert ON character_progression
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- SCENES
-- =====================================================

-- Campaign members can see scenes
CREATE POLICY scenes_select ON scenes
  FOR SELECT USING (
    is_campaign_member(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

-- Service role handles scene updates (via DM)
CREATE POLICY scenes_insert ON scenes
  FOR INSERT WITH CHECK (true);

CREATE POLICY scenes_update ON scenes
  FOR UPDATE USING (true);

-- =====================================================
-- ENTITIES & ENTITY STATE
-- =====================================================

-- Campaign members can see entities
CREATE POLICY entities_select ON entities
  FOR SELECT USING (
    is_campaign_member(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

CREATE POLICY entities_insert ON entities
  FOR INSERT WITH CHECK (true);

CREATE POLICY entities_update ON entities
  FOR UPDATE USING (true);

-- Campaign members can see entity state
CREATE POLICY entity_state_select ON entity_state
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM entities
      WHERE entities.id = entity_state.entity_id
      AND is_campaign_member(auth.uid(), entities.campaign_id)
    )
    OR is_admin(auth.uid())
  );

CREATE POLICY entity_state_insert ON entity_state
  FOR INSERT WITH CHECK (true);

CREATE POLICY entity_state_update ON entity_state
  FOR UPDATE USING (true);

-- =====================================================
-- TURN CONTRACTS
-- =====================================================

-- Campaign members can see turn contracts
CREATE POLICY turn_contracts_select ON turn_contracts
  FOR SELECT USING (
    is_campaign_member(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

-- Service role handles turn contracts
CREATE POLICY turn_contracts_insert ON turn_contracts
  FOR INSERT WITH CHECK (true);

CREATE POLICY turn_contracts_update ON turn_contracts
  FOR UPDATE USING (true);

-- =====================================================
-- PLAYER INPUTS
-- =====================================================

-- Campaign members can see inputs
CREATE POLICY player_inputs_select ON player_inputs
  FOR SELECT USING (
    is_campaign_member(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

-- Players can submit their own inputs
CREATE POLICY player_inputs_insert ON player_inputs
  FOR INSERT WITH CHECK (
    auth.uid() = player_id
    AND is_campaign_member(auth.uid(), campaign_id)
  );

-- =====================================================
-- DICE ROLL REQUESTS
-- =====================================================

-- Campaign members can see rolls
CREATE POLICY dice_roll_requests_select ON dice_roll_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM turn_contracts
      WHERE turn_contracts.id = dice_roll_requests.turn_contract_id
      AND is_campaign_member(auth.uid(), turn_contracts.campaign_id)
    )
    OR is_admin(auth.uid())
  );

-- Service role handles roll creation
CREATE POLICY dice_roll_requests_insert ON dice_roll_requests
  FOR INSERT WITH CHECK (true);

-- Players can update their own rolls (resolving them)
CREATE POLICY dice_roll_requests_update ON dice_roll_requests
  FOR UPDATE USING (
    auth.uid() = player_id
    OR is_admin(auth.uid())
  );

-- =====================================================
-- EVENT LOG
-- =====================================================

-- Campaign members can read event log
CREATE POLICY event_log_select ON event_log
  FOR SELECT USING (
    is_campaign_member(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

-- Service role handles event logging
CREATE POLICY event_log_insert ON event_log
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- RULESETS & RULES CORPUS
-- =====================================================

-- Everyone can read global rulesets
CREATE POLICY rulesets_select ON rulesets
  FOR SELECT USING (
    is_global = true
    OR auth.uid() = created_by
    OR is_admin(auth.uid())
  );

-- Admins can create official rulesets
CREATE POLICY rulesets_insert ON rulesets
  FOR INSERT WITH CHECK (
    (is_official = false AND auth.uid() = created_by)
    OR is_admin(auth.uid())
  );

-- Everyone can read rules corpus (needed for gameplay)
CREATE POLICY rules_corpus_select ON rules_corpus
  FOR SELECT USING (true);

-- Only admins can manage rules corpus
CREATE POLICY rules_corpus_insert ON rules_corpus
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- =====================================================
-- RULE OVERRIDES
-- =====================================================

-- Campaign members can see overrides
CREATE POLICY rule_overrides_select ON rule_overrides
  FOR SELECT USING (
    is_campaign_member(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

-- Hosts can create overrides
CREATE POLICY rule_overrides_insert ON rule_overrides
  FOR INSERT WITH CHECK (
    is_campaign_host(auth.uid(), campaign_id)
    AND auth.uid() = created_by
  );

-- Hosts can update/delete overrides
CREATE POLICY rule_overrides_update ON rule_overrides
  FOR UPDATE USING (is_campaign_host(auth.uid(), campaign_id));

CREATE POLICY rule_overrides_delete ON rule_overrides
  FOR DELETE USING (is_campaign_host(auth.uid(), campaign_id));

-- =====================================================
-- ASSETS & CONTENT
-- =====================================================

-- Everyone can read library assets
CREATE POLICY assets_select ON assets
  FOR SELECT USING (
    is_library = true
    OR auth.uid() = created_by
    OR is_admin(auth.uid())
  );

-- Service role handles asset creation
CREATE POLICY assets_insert ON assets
  FOR INSERT WITH CHECK (true);

-- Only admins can manage content templates
CREATE POLICY content_templates_select ON content_templates
  FOR SELECT USING (true);

CREATE POLICY content_templates_insert ON content_templates
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Service role handles content jobs
CREATE POLICY content_jobs_select ON content_jobs
  FOR SELECT USING (
    is_campaign_member(auth.uid(), campaign_id)
    OR is_admin(auth.uid())
  );

CREATE POLICY content_jobs_insert ON content_jobs
  FOR INSERT WITH CHECK (true);

CREATE POLICY content_jobs_update ON content_jobs
  FOR UPDATE USING (true);

-- =====================================================
-- REPORTS & BANS
-- =====================================================

-- Users can see their own reports
CREATE POLICY reports_select ON reports
  FOR SELECT USING (
    auth.uid() = reporter_id
    OR is_admin(auth.uid())
  );

-- Users can create reports
CREATE POLICY reports_insert ON reports
  FOR INSERT WITH CHECK (
    auth.uid() = reporter_id
    AND NOT is_banned(auth.uid())
  );

-- Only admins can update reports
CREATE POLICY reports_update ON reports
  FOR UPDATE USING (is_admin(auth.uid()));

-- Only admins can see/manage bans
CREATE POLICY bans_select ON bans
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY bans_insert ON bans
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY bans_update ON bans
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY bans_delete ON bans
  FOR DELETE USING (is_admin(auth.uid()));

-- =====================================================
-- ADMIN SETTINGS
-- =====================================================

-- Everyone can read admin settings (needed for quotas)
CREATE POLICY admin_settings_select ON admin_settings
  FOR SELECT USING (true);

-- Only admins can update settings
CREATE POLICY admin_settings_update ON admin_settings
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY admin_settings_insert ON admin_settings
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- =====================================================
-- SUBSCRIPTIONS & PAYMENTS
-- =====================================================

-- Users can see their own subscription
CREATE POLICY subscriptions_select ON subscriptions
  FOR SELECT USING (
    auth.uid() = user_id
    OR is_admin(auth.uid())
  );

-- Service role handles subscription management (Stripe webhooks)
CREATE POLICY subscriptions_insert ON subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY subscriptions_update ON subscriptions
  FOR UPDATE USING (true);

-- Users can see their own credit ledger
CREATE POLICY credit_ledger_select ON credit_ledger
  FOR SELECT USING (
    auth.uid() = user_id
    OR is_admin(auth.uid())
  );

-- Service role handles credit transactions
CREATE POLICY credit_ledger_insert ON credit_ledger
  FOR INSERT WITH CHECK (true);

-- Users can see their own usage counters
CREATE POLICY usage_counters_select ON usage_counters
  FOR SELECT USING (
    auth.uid() = user_id
    OR is_admin(auth.uid())
  );

-- Service role handles usage tracking
CREATE POLICY usage_counters_insert ON usage_counters
  FOR INSERT WITH CHECK (true);

CREATE POLICY usage_counters_update ON usage_counters
  FOR UPDATE USING (true);

-- RLS policies complete!
