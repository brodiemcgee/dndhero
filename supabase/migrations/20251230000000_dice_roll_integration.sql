-- Migration: Interactive Dice Roll Integration
-- Adds support for the awaiting_rolls phase with complete roll tracking

-- Add result columns to dice_roll_requests if they don't exist
DO $$
BEGIN
    -- Check if dice_roll_requests table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dice_roll_requests') THEN
        -- Add result_total column
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'result_total') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN result_total INTEGER;
        END IF;

        -- Add result_breakdown column
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'result_breakdown') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN result_breakdown TEXT;
        END IF;

        -- Add result_rolls column (JSONB for individual dice)
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'result_rolls') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN result_rolls JSONB;
        END IF;

        -- Add result_critical column
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'result_critical') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN result_critical BOOLEAN DEFAULT false;
        END IF;

        -- Add result_fumble column
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'result_fumble') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN result_fumble BOOLEAN DEFAULT false;
        END IF;

        -- Add resolved column
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'resolved') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN resolved BOOLEAN DEFAULT false;
        END IF;

        -- Add resolved_at column
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'resolved_at') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;
        END IF;

        -- Add dc column for difficulty class
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'dc') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN dc INTEGER;
        END IF;

        -- Add success column (determined after roll)
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'success') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN success BOOLEAN;
        END IF;

        -- Add ability column
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'ability') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN ability TEXT;
        END IF;

        -- Add skill column
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'skill') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN skill TEXT;
        END IF;

        -- Add description column
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'description') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN description TEXT;
        END IF;

        -- Add reason column
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'reason') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN reason TEXT;
        END IF;

        -- Add roll_order column for sequential ordering
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'dice_roll_requests' AND column_name = 'roll_order') THEN
            ALTER TABLE dice_roll_requests ADD COLUMN roll_order INTEGER DEFAULT 0;
        END IF;
    END IF;
END $$;

-- Add pending_roll_ids to turn_contracts for tracking
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'turn_contracts') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = 'turn_contracts' AND column_name = 'pending_roll_ids') THEN
            ALTER TABLE turn_contracts ADD COLUMN pending_roll_ids UUID[] DEFAULT '{}';
        END IF;
    END IF;
END $$;

-- Create index for efficient pending roll queries
CREATE INDEX IF NOT EXISTS idx_dice_roll_requests_turn_pending
ON dice_roll_requests(turn_contract_id)
WHERE resolved = false;

-- Create index for roll ordering
CREATE INDEX IF NOT EXISTS idx_dice_roll_requests_order
ON dice_roll_requests(turn_contract_id, roll_order);

-- Add RLS policies for dice_roll_requests if not exists
DO $$
BEGIN
    -- Allow campaign members to view dice roll requests
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'dice_roll_requests' AND policyname = 'dice_roll_requests_select_policy'
    ) THEN
        CREATE POLICY dice_roll_requests_select_policy ON dice_roll_requests
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM turn_contracts tc
                    JOIN scenes s ON tc.scene_id = s.id
                    JOIN campaign_members cm ON s.campaign_id = cm.campaign_id
                    WHERE tc.id = dice_roll_requests.turn_contract_id
                    AND cm.user_id = auth.uid()
                )
            );
    END IF;

    -- Allow users to update their own character's rolls
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'dice_roll_requests' AND policyname = 'dice_roll_requests_update_policy'
    ) THEN
        CREATE POLICY dice_roll_requests_update_policy ON dice_roll_requests
            FOR UPDATE
            USING (
                -- User owns the character
                EXISTS (
                    SELECT 1 FROM characters c
                    WHERE c.id = dice_roll_requests.character_id
                    AND c.user_id = auth.uid()
                )
                OR
                -- User is host (can roll for NPCs)
                EXISTS (
                    SELECT 1 FROM turn_contracts tc
                    JOIN scenes s ON tc.scene_id = s.id
                    JOIN campaign_members cm ON s.campaign_id = cm.campaign_id
                    WHERE tc.id = dice_roll_requests.turn_contract_id
                    AND cm.user_id = auth.uid()
                    AND cm.role = 'host'
                )
            );
    END IF;
END $$;

-- Enable RLS on dice_roll_requests if not already enabled
ALTER TABLE dice_roll_requests ENABLE ROW LEVEL SECURITY;
