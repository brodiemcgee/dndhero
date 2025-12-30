export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      ai_turn_history: {
        Row: {
          created_at: string | null
          estimated_cost: number | null
          id: string
          input_tokens: number | null
          model: string | null
          output_tokens: number | null
          total_tokens: number | null
          turn_contract_id: string
        }
        Insert: {
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          total_tokens?: number | null
          turn_contract_id: string
        }
        Update: {
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          total_tokens?: number | null
          turn_contract_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_turn_history_turn_contract_id_fkey"
            columns: ["turn_contract_id"]
            isOneToOne: false
            referencedRelation: "turn_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_library: boolean | null
          metadata: Json | null
          name: string | null
          style_tags: string[] | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_library?: boolean | null
          metadata?: Json | null
          name?: string | null
          style_tags?: string[] | null
          type: string
          url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_library?: boolean | null
          metadata?: Json | null
          name?: string | null
          style_tags?: string[] | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bans: {
        Row: {
          banned_by: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_invites: {
        Row: {
          campaign_id: string
          code: string | null
          created_at: string | null
          created_by: string
          email: string | null
          expires_at: string
          id: string
          max_uses: number | null
          token: string | null
          type: Database["public"]["Enums"]["invite_type"]
          uses: number | null
        }
        Insert: {
          campaign_id: string
          code?: string | null
          created_at?: string | null
          created_by: string
          email?: string | null
          expires_at: string
          id?: string
          max_uses?: number | null
          token?: string | null
          type: Database["public"]["Enums"]["invite_type"]
          uses?: number | null
        }
        Update: {
          campaign_id?: string
          code?: string | null
          created_at?: string | null
          created_by?: string
          email?: string | null
          expires_at?: string
          id?: string
          max_uses?: number | null
          token?: string | null
          type?: Database["public"]["Enums"]["invite_type"]
          uses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_invites_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "campaign_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_members: {
        Row: {
          active: boolean | null
          campaign_id: string
          id: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          campaign_id: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          campaign_id?: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_members_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "campaign_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_removed_users: {
        Row: {
          campaign_id: string
          id: string
          reason: string | null
          removed_at: string | null
          removed_by: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          id?: string
          reason?: string | null
          removed_at?: string | null
          removed_by: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          id?: string
          reason?: string | null
          removed_at?: string | null
          removed_by?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_removed_users_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_removed_users_removed_by_fkey"
            columns: ["removed_by"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "campaign_removed_users_removed_by_fkey"
            columns: ["removed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_removed_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "campaign_removed_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          adult_content_enabled: boolean | null
          art_style: string | null
          created_at: string | null
          description: string | null
          dm_config: Json | null
          host_id: string
          id: string
          mode: Database["public"]["Enums"]["turn_contract_mode"]
          name: string
          setting: string | null
          started_at: string | null
          state: Database["public"]["Enums"]["campaign_state"]
          strict_mode: boolean | null
          updated_at: string | null
        }
        Insert: {
          adult_content_enabled?: boolean | null
          art_style?: string | null
          created_at?: string | null
          description?: string | null
          dm_config?: Json | null
          host_id: string
          id?: string
          mode: Database["public"]["Enums"]["turn_contract_mode"]
          name: string
          setting?: string | null
          started_at?: string | null
          state?: Database["public"]["Enums"]["campaign_state"]
          strict_mode?: boolean | null
          updated_at?: string | null
        }
        Update: {
          adult_content_enabled?: boolean | null
          art_style?: string | null
          created_at?: string | null
          description?: string | null
          dm_config?: Json | null
          host_id?: string
          id?: string
          mode?: Database["public"]["Enums"]["turn_contract_mode"]
          name?: string
          setting?: string | null
          started_at?: string | null
          state?: Database["public"]["Enums"]["campaign_state"]
          strict_mode?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "campaigns_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      character_state_changes: {
        Row: {
          campaign_id: string
          change_type: string
          character_id: string
          created_at: string | null
          dm_message_id: string | null
          field_name: string
          id: string
          is_reversed: boolean | null
          new_value: Json | null
          old_value: Json | null
          reason: string
          reversed_at: string | null
          reversed_by: string | null
        }
        Insert: {
          campaign_id: string
          change_type: string
          character_id: string
          created_at?: string | null
          dm_message_id?: string | null
          field_name: string
          id?: string
          is_reversed?: boolean | null
          new_value?: Json | null
          old_value?: Json | null
          reason: string
          reversed_at?: string | null
          reversed_by?: string | null
        }
        Update: {
          campaign_id?: string
          change_type?: string
          character_id?: string
          created_at?: string | null
          dm_message_id?: string | null
          field_name?: string
          id?: string
          is_reversed?: boolean | null
          new_value?: Json | null
          old_value?: Json | null
          reason?: string
          reversed_at?: string | null
          reversed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "character_state_changes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_state_changes_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_state_changes_dm_message_id_fkey"
            columns: ["dm_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_state_changes_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "character_state_changes_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          additional_features: string | null
          age: string | null
          alignment: string | null
          allies_and_organizations: Json | null
          armor_class: number | null
          attacks: Json | null
          background: string | null
          backstory: string | null
          bonds: string[] | null
          build: string | null
          campaign_id: string | null
          charisma: number | null
          class: string | null
          clothing_style: string | null
          conditions: string[] | null
          constitution: number | null
          created_at: string | null
          currency: Json | null
          current_hp: number | null
          death_save_failures: number | null
          death_save_successes: number | null
          dexterity: number | null
          distinguishing_features: string | null
          equipment: Json | null
          eye_color: string | null
          flaws: string[] | null
          gender: string | null
          hair_color: string | null
          hair_style: string | null
          height: string | null
          hit_dice_remaining: number | null
          id: string
          ideals: string[] | null
          inspiration: boolean | null
          intelligence: number | null
          inventory: Json | null
          known_spells: string[] | null
          level: number | null
          max_hp: number | null
          name: string
          passive_perception: number | null
          personality_traits: string[] | null
          portrait_asset_id: string | null
          portrait_url: string | null
          proficiency_bonus: number | null
          race: string | null
          saving_throw_proficiencies: string[] | null
          skill_proficiencies: string[] | null
          skin_tone: string | null
          spell_attack_bonus: number | null
          spell_save_dc: number | null
          spell_slots: Json | null
          spell_slots_used: Json | null
          spellcasting_ability: string | null
          spellcasting_class: string | null
          strength: number | null
          temp_hp: number | null
          treasure: Json | null
          updated_at: string | null
          user_id: string
          weight: string | null
          wisdom: number | null
        }
        Insert: {
          additional_features?: string | null
          age?: string | null
          alignment?: string | null
          allies_and_organizations?: Json | null
          armor_class?: number | null
          attacks?: Json | null
          background?: string | null
          backstory?: string | null
          bonds?: string[] | null
          build?: string | null
          campaign_id?: string | null
          charisma?: number | null
          class?: string | null
          clothing_style?: string | null
          conditions?: string[] | null
          constitution?: number | null
          created_at?: string | null
          currency?: Json | null
          current_hp?: number | null
          death_save_failures?: number | null
          death_save_successes?: number | null
          dexterity?: number | null
          distinguishing_features?: string | null
          equipment?: Json | null
          eye_color?: string | null
          flaws?: string[] | null
          gender?: string | null
          hair_color?: string | null
          hair_style?: string | null
          height?: string | null
          hit_dice_remaining?: number | null
          id?: string
          ideals?: string[] | null
          inspiration?: boolean | null
          intelligence?: number | null
          inventory?: Json | null
          known_spells?: string[] | null
          level?: number | null
          max_hp?: number | null
          name: string
          passive_perception?: number | null
          personality_traits?: string[] | null
          portrait_asset_id?: string | null
          portrait_url?: string | null
          proficiency_bonus?: number | null
          race?: string | null
          saving_throw_proficiencies?: string[] | null
          skill_proficiencies?: string[] | null
          skin_tone?: string | null
          spell_attack_bonus?: number | null
          spell_save_dc?: number | null
          spell_slots?: Json | null
          spell_slots_used?: Json | null
          spellcasting_ability?: string | null
          spellcasting_class?: string | null
          strength?: number | null
          temp_hp?: number | null
          treasure?: Json | null
          updated_at?: string | null
          user_id: string
          weight?: string | null
          wisdom?: number | null
        }
        Update: {
          additional_features?: string | null
          age?: string | null
          alignment?: string | null
          allies_and_organizations?: Json | null
          armor_class?: number | null
          attacks?: Json | null
          background?: string | null
          backstory?: string | null
          bonds?: string[] | null
          build?: string | null
          campaign_id?: string | null
          charisma?: number | null
          class?: string | null
          clothing_style?: string | null
          conditions?: string[] | null
          constitution?: number | null
          created_at?: string | null
          currency?: Json | null
          current_hp?: number | null
          death_save_failures?: number | null
          death_save_successes?: number | null
          dexterity?: number | null
          distinguishing_features?: string | null
          equipment?: Json | null
          eye_color?: string | null
          flaws?: string[] | null
          gender?: string | null
          hair_color?: string | null
          hair_style?: string | null
          height?: string | null
          hit_dice_remaining?: number | null
          id?: string
          ideals?: string[] | null
          inspiration?: boolean | null
          intelligence?: number | null
          inventory?: Json | null
          known_spells?: string[] | null
          level?: number | null
          max_hp?: number | null
          name?: string
          passive_perception?: number | null
          personality_traits?: string[] | null
          portrait_asset_id?: string | null
          portrait_url?: string | null
          proficiency_bonus?: number | null
          race?: string | null
          saving_throw_proficiencies?: string[] | null
          skill_proficiencies?: string[] | null
          skin_tone?: string | null
          spell_attack_bonus?: number | null
          spell_save_dc?: number | null
          spell_slots?: Json | null
          spell_slots_used?: Json | null
          spellcasting_ability?: string | null
          spellcasting_class?: string | null
          strength?: number | null
          temp_hp?: number | null
          treasure?: Json | null
          updated_at?: string | null
          user_id?: string
          weight?: string | null
          wisdom?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_portrait_asset_id_fkey"
            columns: ["portrait_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "characters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          campaign_id: string
          character_id: string | null
          character_name: string | null
          content: string
          created_at: string | null
          dm_response_id: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          scene_id: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          campaign_id: string
          character_id?: string | null
          character_name?: string | null
          content: string
          created_at?: string | null
          dm_response_id?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          scene_id?: string | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          campaign_id?: string
          character_id?: string | null
          character_name?: string | null
          content?: string
          created_at?: string | null
          dm_response_id?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          scene_id?: string | null
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_dm_response_id_fkey"
            columns: ["dm_response_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      combat_instances: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_turn_index: number | null
          id: string
          round_number: number | null
          scene_id: string
          state: string
          turn_order: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_turn_index?: number | null
          id?: string
          round_number?: number | null
          scene_id: string
          state?: string
          turn_order?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_turn_index?: number | null
          id?: string
          round_number?: number | null
          scene_id?: string
          state?: string
          turn_order?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "combat_instances_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_purchases: {
        Row: {
          amount: number
          id: string
          price_paid: number | null
          purchased_at: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          id?: string
          price_paid?: number | null
          purchased_at?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          id?: string
          price_paid?: number | null
          purchased_at?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "credit_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dice_roll_requests: {
        Row: {
          ability: string | null
          advantage: boolean | null
          character_id: string | null
          created_at: string | null
          dc: number | null
          description: string | null
          disadvantage: boolean | null
          id: string
          notation: string
          player_id: string | null
          reason: string | null
          resolved: boolean | null
          resolved_at: string | null
          result_breakdown: string | null
          result_critical: boolean | null
          result_fumble: boolean | null
          result_rolls: Json | null
          result_total: number | null
          roll_order: number | null
          roll_type: string
          skill: string | null
          success: boolean | null
          turn_contract_id: string | null
        }
        Insert: {
          ability?: string | null
          advantage?: boolean | null
          character_id?: string | null
          created_at?: string | null
          dc?: number | null
          description?: string | null
          disadvantage?: boolean | null
          id?: string
          notation: string
          player_id?: string | null
          reason?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          result_breakdown?: string | null
          result_critical?: boolean | null
          result_fumble?: boolean | null
          result_rolls?: Json | null
          result_total?: number | null
          roll_order?: number | null
          roll_type: string
          skill?: string | null
          success?: boolean | null
          turn_contract_id?: string | null
        }
        Update: {
          ability?: string | null
          advantage?: boolean | null
          character_id?: string | null
          created_at?: string | null
          dc?: number | null
          description?: string | null
          disadvantage?: boolean | null
          id?: string
          notation?: string
          player_id?: string | null
          reason?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          result_breakdown?: string | null
          result_critical?: boolean | null
          result_fumble?: boolean | null
          result_rolls?: Json | null
          result_total?: number | null
          roll_order?: number | null
          roll_type?: string
          skill?: string | null
          success?: boolean | null
          turn_contract_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dice_roll_requests_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dice_roll_requests_turn_contract_id_fkey"
            columns: ["turn_contract_id"]
            isOneToOne: false
            referencedRelation: "turn_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      dice_roll_results: {
        Row: {
          advantage: boolean | null
          breakdown: string | null
          character_id: string | null
          created_at: string | null
          critical: boolean | null
          disadvantage: boolean | null
          fumble: boolean | null
          id: string
          notation: string
          rolls: Json | null
          total: number
          user_id: string
        }
        Insert: {
          advantage?: boolean | null
          breakdown?: string | null
          character_id?: string | null
          created_at?: string | null
          critical?: boolean | null
          disadvantage?: boolean | null
          fumble?: boolean | null
          id?: string
          notation: string
          rolls?: Json | null
          total: number
          user_id: string
        }
        Update: {
          advantage?: boolean | null
          breakdown?: string | null
          character_id?: string | null
          created_at?: string | null
          critical?: boolean | null
          disadvantage?: boolean | null
          fumble?: boolean | null
          id?: string
          notation?: string
          rolls?: Json | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dice_roll_results_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dice_roll_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "dice_roll_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_debounce_state: {
        Row: {
          campaign_id: string
          is_processing: boolean | null
          last_dm_response_at: string | null
          last_player_message_at: string | null
          pending_message_count: number | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          is_processing?: boolean | null
          last_dm_response_at?: string | null
          last_player_message_at?: string | null
          pending_message_count?: number | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          is_processing?: boolean | null
          last_dm_response_at?: string | null
          last_player_message_at?: string | null
          pending_message_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dm_debounce_state_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          name: string
          stat_block: Json | null
          type: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          name: string
          stat_block?: Json | null
          type: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          name?: string
          stat_block?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "entities_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_state: {
        Row: {
          armor_class: number | null
          conditions: string[] | null
          current_hp: number | null
          entity_id: string
          id: string
          initiative: number | null
          max_hp: number | null
          position_x: number | null
          position_y: number | null
          scene_id: string
          temp_hp: number | null
        }
        Insert: {
          armor_class?: number | null
          conditions?: string[] | null
          current_hp?: number | null
          entity_id: string
          id?: string
          initiative?: number | null
          max_hp?: number | null
          position_x?: number | null
          position_y?: number | null
          scene_id: string
          temp_hp?: number | null
        }
        Update: {
          armor_class?: number | null
          conditions?: string[] | null
          current_hp?: number | null
          entity_id?: string
          id?: string
          initiative?: number | null
          max_hp?: number | null
          position_x?: number | null
          position_y?: number | null
          scene_id?: string
          temp_hp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_state_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_state_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      event_log: {
        Row: {
          campaign_id: string | null
          content: Json | null
          created_at: string | null
          entity_ids: Json | null
          id: string
          metadata: Json | null
          player_id: string | null
          scene_id: string
          turn_contract_id: string | null
          type: string
        }
        Insert: {
          campaign_id?: string | null
          content?: Json | null
          created_at?: string | null
          entity_ids?: Json | null
          id?: string
          metadata?: Json | null
          player_id?: string | null
          scene_id: string
          turn_contract_id?: string | null
          type: string
        }
        Update: {
          campaign_id?: string | null
          content?: Json | null
          created_at?: string | null
          entity_ids?: Json | null
          id?: string
          metadata?: Json | null
          player_id?: string | null
          scene_id?: string
          turn_contract_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_log_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_log_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_log_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_log_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_log_turn_contract_id_fkey"
            columns: ["turn_contract_id"]
            isOneToOne: false
            referencedRelation: "turn_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_b269c2dd: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      player_inputs: {
        Row: {
          campaign_id: string | null
          character_id: string | null
          classification:
            | Database["public"]["Enums"]["input_classification"]
            | null
          content: string
          created_at: string | null
          id: string
          player_id: string | null
          state_version: number | null
          turn_contract_id: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          character_id?: string | null
          classification?:
            | Database["public"]["Enums"]["input_classification"]
            | null
          content: string
          created_at?: string | null
          id?: string
          player_id?: string | null
          state_version?: number | null
          turn_contract_id: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          character_id?: string | null
          classification?:
            | Database["public"]["Enums"]["input_classification"]
            | null
          content?: string
          created_at?: string | null
          id?: string
          player_id?: string | null
          state_version?: number | null
          turn_contract_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_inputs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_inputs_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_inputs_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "player_inputs_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_inputs_turn_contract_id_fkey"
            columns: ["turn_contract_id"]
            isOneToOne: false
            referencedRelation: "turn_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_inputs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "player_inputs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          adult_content_opt_in: boolean | null
          avatar_url: string | null
          bio: string | null
          birthdate: string | null
          created_at: string | null
          email: string | null
          id: string
          interests: string[] | null
          is_admin: boolean | null
          lines_veils: Json | null
          name: string | null
          stripe_customer_id: string | null
          tts_auto_play: boolean | null
          tts_enabled: boolean | null
          tts_speed: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          adult_content_opt_in?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          interests?: string[] | null
          is_admin?: boolean | null
          lines_veils?: Json | null
          name?: string | null
          stripe_customer_id?: string | null
          tts_auto_play?: boolean | null
          tts_enabled?: boolean | null
          tts_speed?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          adult_content_opt_in?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          interests?: string[] | null
          is_admin?: boolean | null
          lines_veils?: Json | null
          name?: string | null
          stripe_customer_id?: string | null
          tts_auto_play?: boolean | null
          tts_enabled?: boolean | null
          tts_speed?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      quest_objectives: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_completed: boolean | null
          quest_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_completed?: boolean | null
          quest_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_completed?: boolean | null
          quest_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quest_objectives_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          campaign_id: string
          created_at: string | null
          description: string | null
          id: string
          priority: number | null
          quest_giver: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          quest_giver?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          quest_giver?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      scenes: {
        Row: {
          active_entities: Json | null
          campaign_id: string
          created_at: string | null
          current_state: string | null
          description: string | null
          environment: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string | null
          objectives: Json | null
          state: string | null
          state_version: number | null
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          active_entities?: Json | null
          campaign_id: string
          created_at?: string | null
          current_state?: string | null
          description?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string | null
          objectives?: Json | null
          state?: string | null
          state_version?: number | null
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          active_entities?: Json | null
          campaign_id?: string
          created_at?: string | null
          current_state?: string | null
          description?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string | null
          objectives?: Json | null
          state?: string | null
          state_version?: number | null
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          tier: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      turn_contracts: {
        Row: {
          ai_task: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          mode: string
          pending_roll_ids: string[] | null
          phase: Database["public"]["Enums"]["turn_phase"]
          prompt: string | null
          scene_id: string
          state_version: number | null
          turn_number: number | null
        }
        Insert: {
          ai_task?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          mode?: string
          pending_roll_ids?: string[] | null
          phase?: Database["public"]["Enums"]["turn_phase"]
          prompt?: string | null
          scene_id: string
          state_version?: number | null
          turn_number?: number | null
        }
        Update: {
          ai_task?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          mode?: string
          pending_roll_ids?: string[] | null
          phase?: Database["public"]["Enums"]["turn_phase"]
          prompt?: string | null
          scene_id?: string
          state_version?: number | null
          turn_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "turn_contracts_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_counters: {
        Row: {
          ai_turns_used_this_month: number | null
          campaigns_created_this_month: number | null
          content_jobs_this_month: number | null
          credit_balance: number | null
          dm_turns_this_month: number | null
          last_reset_at: string | null
          portraits_generated_this_month: number | null
          user_id: string
        }
        Insert: {
          ai_turns_used_this_month?: number | null
          campaigns_created_this_month?: number | null
          content_jobs_this_month?: number | null
          credit_balance?: number | null
          dm_turns_this_month?: number | null
          last_reset_at?: string | null
          portraits_generated_this_month?: number | null
          user_id: string
        }
        Update: {
          ai_turns_used_this_month?: number | null
          campaigns_created_this_month?: number | null
          content_jobs_this_month?: number | null
          credit_balance?: number | null
          dm_turns_this_month?: number | null
          last_reset_at?: string | null
          portraits_generated_this_month?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_counters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "entitlements"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "usage_counters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      entitlements: {
        Row: {
          max_ai_turns_per_month: number | null
          max_campaigns_per_month: number | null
          max_content_jobs_per_month: number | null
          tier: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_create_character: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      check_portrait_limit: {
        Args: { check_user_id: string }
        Returns: {
          can_generate: boolean
          max_limit: number
          tier: string
          used: number
        }[]
      }
      get_character_limits: {
        Args: { check_user_id: string }
        Returns: {
          current_count: number
          max_characters: number
          tier: string
        }[]
      }
      increment_portrait_usage: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_banned: { Args: { check_user_id: string }; Returns: boolean }
      is_campaign_member: {
        Args: { camp_id: string; check_user_id: string }
        Returns: boolean
      }
      is_campaign_member_direct: {
        Args: { p_campaign_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      campaign_mode: "live" | "async"
      campaign_state: "setup" | "active" | "paused" | "completed"
      input_classification: "authoritative" | "ambient"
      invite_type: "magic_link" | "code" | "email"
      turn_contract_mode:
        | "single_player"
        | "vote"
        | "first_response_wins"
        | "freeform"
      turn_phase: "awaiting_input" | "awaiting_rolls" | "resolving" | "complete"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      campaign_mode: ["live", "async"],
      campaign_state: ["setup", "active", "paused", "completed"],
      input_classification: ["authoritative", "ambient"],
      invite_type: ["magic_link", "code", "email"],
      turn_contract_mode: [
        "single_player",
        "vote",
        "first_response_wins",
        "freeform",
      ],
      turn_phase: ["awaiting_input", "awaiting_rolls", "resolving", "complete"],
    },
  },
} as const
