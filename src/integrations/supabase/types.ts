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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_audit: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          key: string | null
          new_value: Json | null
          old_value: Json | null
          role: Database["public"]["Enums"]["app_role"] | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          key?: string | null
          new_value?: Json | null
          old_value?: Json | null
          role?: Database["public"]["Enums"]["app_role"] | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          key?: string | null
          new_value?: Json | null
          old_value?: Json | null
          role?: Database["public"]["Enums"]["app_role"] | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      class_members: {
        Row: {
          class_session_id: string
          joined_at: string
          student_id: string
        }
        Insert: {
          class_session_id: string
          joined_at?: string
          student_id: string
        }
        Update: {
          class_session_id?: string
          joined_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_members_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          controller: Database["public"]["Enums"]["controller"]
          created_at: string
          ended_at: string | null
          id: string
          instructor_id: string
          instructor_last_seen_at: string | null
          join_code: string
          paused: boolean
          status: Database["public"]["Enums"]["class_status"]
          topic_id: string
        }
        Insert: {
          controller?: Database["public"]["Enums"]["controller"]
          created_at?: string
          ended_at?: string | null
          id?: string
          instructor_id: string
          instructor_last_seen_at?: string | null
          join_code: string
          paused?: boolean
          status?: Database["public"]["Enums"]["class_status"]
          topic_id: string
        }
        Update: {
          controller?: Database["public"]["Enums"]["controller"]
          created_at?: string
          ended_at?: string | null
          id?: string
          instructor_id?: string
          instructor_last_seen_at?: string | null
          join_code?: string
          paused?: boolean
          status?: Database["public"]["Enums"]["class_status"]
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      clip_checks: {
        Row: {
          at_seconds: number
          clip_id: string
          item_id: string
        }
        Insert: {
          at_seconds: number
          clip_id: string
          item_id: string
        }
        Update: {
          at_seconds?: number
          clip_id?: string
          item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clip_checks_clip_id_fkey"
            columns: ["clip_id"]
            isOneToOne: false
            referencedRelation: "clips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clip_checks_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      clips: {
        Row: {
          captions: Json
          captions_url: string | null
          duration_s: number | null
          flow: Json
          id: string
          misconception_ids: string[]
          poster_url: string | null
          segments: Json
          skill_ids: string[]
          title: string | null
          topic_id: string
          url_low: string | null
          url_standard: string | null
        }
        Insert: {
          captions?: Json
          captions_url?: string | null
          duration_s?: number | null
          flow?: Json
          id: string
          misconception_ids?: string[]
          poster_url?: string | null
          segments?: Json
          skill_ids?: string[]
          title?: string | null
          topic_id: string
          url_low?: string | null
          url_standard?: string | null
        }
        Update: {
          captions?: Json
          captions_url?: string | null
          duration_s?: number | null
          flow?: Json
          id?: string
          misconception_ids?: string[]
          poster_url?: string | null
          segments?: Json
          skill_ids?: string[]
          title?: string | null
          topic_id?: string
          url_low?: string | null
          url_standard?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clips_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          created_at: string
          granted: boolean
          guardian_id: string
          id: string
          scope: Database["public"]["Enums"]["consent_scope"]
          student_id: string
          version: string
        }
        Insert: {
          created_at?: string
          granted: boolean
          guardian_id: string
          id?: string
          scope: Database["public"]["Enums"]["consent_scope"]
          student_id: string
          version: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          guardian_id?: string
          id?: string
          scope?: Database["public"]["Enums"]["consent_scope"]
          student_id?: string
          version?: string
        }
        Relationships: []
      }
      content_imports: {
        Row: {
          created_at: string
          dry_run: boolean
          id: string
          imported_by: string | null
          pack_version: string | null
          report: Json
          status: string
          topic_id: string | null
        }
        Insert: {
          created_at?: string
          dry_run?: boolean
          id?: string
          imported_by?: string | null
          pack_version?: string | null
          report?: Json
          status: string
          topic_id?: string | null
        }
        Update: {
          created_at?: string
          dry_run?: boolean
          id?: string
          imported_by?: string | null
          pack_version?: string | null
          report?: Json
          status?: string
          topic_id?: string | null
        }
        Relationships: []
      }
      escalations: {
        Row: {
          attempt: number
          id: string
          item_id: string
          script: Json
        }
        Insert: {
          attempt: number
          id: string
          item_id: string
          script?: Json
        }
        Update: {
          attempt?: number
          id?: string
          item_id?: string
          script?: Json
        }
        Relationships: [
          {
            foreignKeyName: "escalations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          actor: string
          client_ts: string | null
          created_at: string
          id: number
          payload: Json
          seq: number
          session_id: string
          step: Database["public"]["Enums"]["lesson_step"] | null
          type: string
        }
        Insert: {
          actor: string
          client_ts?: string | null
          created_at?: string
          id?: number
          payload?: Json
          seq: number
          session_id: string
          step?: Database["public"]["Enums"]["lesson_step"] | null
          type: string
        }
        Update: {
          actor?: string
          client_ts?: string | null
          created_at?: string
          id?: number
          payload?: Json
          seq?: number
          session_id?: string
          step?: Database["public"]["Enums"]["lesson_step"] | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence: {
        Row: {
          attempt: number
          confidence: Database["public"]["Enums"]["confidence"] | null
          correct: boolean | null
          created_at: string
          hint_rung: number | null
          id: string
          is_first_try: boolean
          item_id: string | null
          misconception_id: string | null
          opted_out: boolean
          response: Json | null
          session_id: string
          skill_id: string | null
          status: string | null
          step: Database["public"]["Enums"]["lesson_step"] | null
          strength: Database["public"]["Enums"]["evidence_strength"]
          student_id: string
        }
        Insert: {
          attempt?: number
          confidence?: Database["public"]["Enums"]["confidence"] | null
          correct?: boolean | null
          created_at?: string
          hint_rung?: number | null
          id?: string
          is_first_try?: boolean
          item_id?: string | null
          misconception_id?: string | null
          opted_out?: boolean
          response?: Json | null
          session_id: string
          skill_id?: string | null
          status?: string | null
          step?: Database["public"]["Enums"]["lesson_step"] | null
          strength?: Database["public"]["Enums"]["evidence_strength"]
          student_id: string
        }
        Update: {
          attempt?: number
          confidence?: Database["public"]["Enums"]["confidence"] | null
          correct?: boolean | null
          created_at?: string
          hint_rung?: number | null
          id?: string
          is_first_try?: boolean
          item_id?: string | null
          misconception_id?: string | null
          opted_out?: boolean
          response?: Json | null
          session_id?: string
          skill_id?: string | null
          status?: string | null
          step?: Database["public"]["Enums"]["lesson_step"] | null
          strength?: Database["public"]["Enums"]["evidence_strength"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      fallback_lines: {
        Row: {
          audio_url: string | null
          decision_key: string
          id: string
          script: Json
          step: Database["public"]["Enums"]["lesson_step"] | null
          topic_id: string | null
        }
        Insert: {
          audio_url?: string | null
          decision_key: string
          id: string
          script?: Json
          step?: Database["public"]["Enums"]["lesson_step"] | null
          topic_id?: string | null
        }
        Update: {
          audio_url?: string | null
          decision_key?: string
          id?: string
          script?: Json
          step?: Database["public"]["Enums"]["lesson_step"] | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fallback_lines_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          id: string
          item_id: string
          misconception_id: string | null
          script: Json
          trigger: string
        }
        Insert: {
          id: string
          item_id: string
          misconception_id?: string | null
          script?: Json
          trigger: string
        }
        Update: {
          id?: string
          item_id?: string
          misconception_id?: string | null
          script?: Json
          trigger?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_misconception_id_fkey"
            columns: ["misconception_id"]
            isOneToOne: false
            referencedRelation: "misconceptions"
            referencedColumns: ["id"]
          },
        ]
      }
      flags: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          note: string | null
          session_id: string | null
          turn_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          note?: string | null
          session_id?: string | null
          turn_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          note?: string | null
          session_id?: string | null
          turn_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flags_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flags_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "turns"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_links: {
        Row: {
          created_at: string
          guardian_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          guardian_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          guardian_id?: string
          student_id?: string
        }
        Relationships: []
      }
      hints: {
        Row: {
          id: string
          item_id: string
          rung: number
          script: Json
        }
        Insert: {
          id: string
          item_id: string
          rung: number
          script?: Json
        }
        Update: {
          id?: string
          item_id?: string
          rung?: number
          script?: Json
        }
        Relationships: [
          {
            foreignKeyName: "hints_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      home_conversations: {
        Row: {
          created_at: string
          id: string
          student_id: string
          title: string | null
          title_source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          student_id: string
          title?: string | null
          title_source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          student_id?: string
          title?: string | null
          title_source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      home_messages: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          meta: Json
          role: string
          student_id: string
          text: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          meta?: Json
          role: string
          student_id: string
          text: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          meta?: Json
          role?: string
          student_id?: string
          text?: string
        }
        Relationships: []
      }
      hooks: {
        Row: {
          answered_by: string | null
          asset_url: string | null
          close_script: Json
          id: string
          is_active: boolean
          prediction: Json | null
          script: Json
          topic_id: string
          type: Database["public"]["Enums"]["hook_type"]
        }
        Insert: {
          answered_by?: string | null
          asset_url?: string | null
          close_script?: Json
          id: string
          is_active?: boolean
          prediction?: Json | null
          script?: Json
          topic_id: string
          type: Database["public"]["Enums"]["hook_type"]
        }
        Update: {
          answered_by?: string | null
          asset_url?: string | null
          close_script?: Json
          id?: string
          is_active?: boolean
          prediction?: Json | null
          script?: Json
          topic_id?: string
          type?: Database["public"]["Enums"]["hook_type"]
        }
        Relationships: [
          {
            foreignKeyName: "hooks_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      item_keys: {
        Row: {
          accepted_forms: Json | null
          accepted_methods: Json | null
          answer: Json | null
          item_id: string
          marking_guide: Json | null
          worked_solution: Json | null
          wrong_paths: Json | null
        }
        Insert: {
          accepted_forms?: Json | null
          accepted_methods?: Json | null
          answer?: Json | null
          item_id: string
          marking_guide?: Json | null
          worked_solution?: Json | null
          wrong_paths?: Json | null
        }
        Update: {
          accepted_forms?: Json | null
          accepted_methods?: Json | null
          answer?: Json | null
          item_id?: string
          marking_guide?: Json | null
          worked_solution?: Json | null
          wrong_paths?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "item_keys_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          config: Json
          fields: Json | null
          id: string
          kind: Database["public"]["Enums"]["item_kind"]
          options: Json | null
          prompt: Json
          sequence: number
          skill_ids: string[]
          step: Database["public"]["Enums"]["lesson_step"]
          tags: Json
          topic_id: string
        }
        Insert: {
          config?: Json
          fields?: Json | null
          id: string
          kind: Database["public"]["Enums"]["item_kind"]
          options?: Json | null
          prompt?: Json
          sequence?: number
          skill_ids?: string[]
          step: Database["public"]["Enums"]["lesson_step"]
          tags?: Json
          topic_id: string
        }
        Update: {
          config?: Json
          fields?: Json | null
          id?: string
          kind?: Database["public"]["Enums"]["item_kind"]
          options?: Json | null
          prompt?: Json
          sequence?: number
          skill_ids?: string[]
          step?: Database["public"]["Enums"]["lesson_step"]
          tags?: Json
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      misconceptions: {
        Row: {
          id: string
          label: string
          plain_words: string | null
          skill_id: string | null
        }
        Insert: {
          id: string
          label: string
          plain_words?: string | null
          skill_id?: string | null
        }
        Update: {
          id?: string
          label?: string
          plain_words?: string | null
          skill_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "misconceptions_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_changes: {
        Row: {
          action: string
          created_at: string
          id: string
          new_value: Json | null
          old_value: Json | null
          plan_item_id: string | null
          student_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          plan_item_id?: string | null
          student_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          plan_item_id?: string | null
          student_id?: string
        }
        Relationships: []
      }
      plan_items: {
        Row: {
          created_at: string
          created_by: string | null
          done: boolean
          due_at: string | null
          id: string
          label: string | null
          planned_for: string | null
          sample: boolean
          source: string
          student_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          done?: boolean
          due_at?: string | null
          id?: string
          label?: string | null
          planned_for?: string | null
          sample?: boolean
          source?: string
          student_id: string
          topic_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          done?: boolean
          due_at?: string | null
          id?: string
          label?: string | null
          planned_for?: string | null
          sample?: boolean
          source?: string
          student_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_items_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      repairs: {
        Row: {
          id: string
          micro_lesson: Json
          practice_item_id: string | null
          skill_id: string
          topic_id: string
        }
        Insert: {
          id: string
          micro_lesson?: Json
          practice_item_id?: string | null
          skill_id: string
          topic_id: string
        }
        Update: {
          id?: string
          micro_lesson?: Json
          practice_item_id?: string | null
          skill_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repairs_practice_item_id_fkey"
            columns: ["practice_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repairs_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repairs_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      rules: {
        Row: {
          description: string | null
          key: string
          topic_id: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          topic_id?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          topic_id?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "rules_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          field: string
          id: string
          owner_id: string
          owner_table: string
          script: Json
          topic_id: string | null
        }
        Insert: {
          field: string
          id: string
          owner_id: string
          owner_table: string
          script?: Json
          topic_id?: string | null
        }
        Update: {
          field?: string
          id?: string
          owner_id?: string
          owner_table?: string
          script?: Json
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          attempt: number
          band: Database["public"]["Enums"]["band"] | null
          channel: Database["public"]["Enums"]["channel"]
          class_session_id: string | null
          completed_at: string | null
          controller: Database["public"]["Enums"]["controller"]
          id: string
          mode: Database["public"]["Enums"]["session_mode"]
          pack_version: string | null
          paused: boolean
          started_at: string
          state: Json
          status: Database["public"]["Enums"]["session_status"]
          step: Database["public"]["Enums"]["lesson_step"]
          student_id: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          attempt?: number
          band?: Database["public"]["Enums"]["band"] | null
          channel?: Database["public"]["Enums"]["channel"]
          class_session_id?: string | null
          completed_at?: string | null
          controller?: Database["public"]["Enums"]["controller"]
          id?: string
          mode?: Database["public"]["Enums"]["session_mode"]
          pack_version?: string | null
          paused?: boolean
          started_at?: string
          state?: Json
          status?: Database["public"]["Enums"]["session_status"]
          step?: Database["public"]["Enums"]["lesson_step"]
          student_id: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          attempt?: number
          band?: Database["public"]["Enums"]["band"] | null
          channel?: Database["public"]["Enums"]["channel"]
          class_session_id?: string | null
          completed_at?: string | null
          controller?: Database["public"]["Enums"]["controller"]
          id?: string
          mode?: Database["public"]["Enums"]["session_mode"]
          pack_version?: string | null
          paused?: boolean
          started_at?: string
          state?: Json
          status?: Database["public"]["Enums"]["session_status"]
          step?: Database["public"]["Enums"]["lesson_step"]
          student_id?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      settings_audit: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          key: string
          new_value: Json | null
          old_value: Json | null
          topic_id: string | null
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          key: string
          new_value?: Json | null
          old_value?: Json | null
          topic_id?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          key?: string
          new_value?: Json | null
          old_value?: Json | null
          topic_id?: string | null
        }
        Relationships: []
      }
      sim_tasks: {
        Row: {
          completion_script: Json | null
          goal: string
          hint_script: Json | null
          id: string
          required: boolean
          sequence: number
          simulation_id: string
        }
        Insert: {
          completion_script?: Json | null
          goal: string
          hint_script?: Json | null
          id: string
          required?: boolean
          sequence?: number
          simulation_id: string
        }
        Update: {
          completion_script?: Json | null
          goal?: string
          hint_script?: Json | null
          id?: string
          required?: boolean
          sequence?: number
          simulation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sim_tasks_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          band: Database["public"]["Enums"]["band"]
          closing: Json
          id: string
          init: Json
          opening_lines: Json
          topic_id: string
          url: string | null
        }
        Insert: {
          band: Database["public"]["Enums"]["band"]
          closing?: Json
          id: string
          init?: Json
          opening_lines?: Json
          topic_id: string
          url?: string | null
        }
        Update: {
          band?: Database["public"]["Enums"]["band"]
          closing?: Json
          id?: string
          init?: Json
          opening_lines?: Json
          topic_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      slug_history: {
        Row: {
          created_at: string
          id: string
          kind: string
          new_slug: string
          old_slug: string
          topic_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          new_slug: string
          old_slug: string
          topic_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          new_slug?: string
          old_slug?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slug_history_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      student_prefs: {
        Row: {
          hardest_area: string | null
          intro_done_at: string | null
          last_opening_line_id: string | null
          last_visit_at: string | null
          low_data: boolean | null
          maths_feeling: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          hardest_area?: string | null
          intro_done_at?: string | null
          last_opening_line_id?: string | null
          last_visit_at?: string | null
          low_data?: boolean | null
          maths_feeling?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          hardest_area?: string | null
          intro_done_at?: string | null
          last_opening_line_id?: string | null
          last_visit_at?: string | null
          low_data?: boolean | null
          maths_feeling?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      summaries: {
        Row: {
          content: Json
          created_at: string
          id: string
          session_id: string
          student_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          session_id: string
          student_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          session_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "summaries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_skills: {
        Row: {
          role: Database["public"]["Enums"]["skill_role"]
          skill_id: string
          topic_id: string
        }
        Insert: {
          role: Database["public"]["Enums"]["skill_role"]
          skill_id: string
          topic_id: string
        }
        Update: {
          role?: Database["public"]["Enums"]["skill_role"]
          skill_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_skills_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          chapter: string | null
          chapter_slug: string | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          quest: string | null
          quest_slug: string | null
          subject: string | null
          topic_slug: string | null
        }
        Insert: {
          chapter?: string | null
          chapter_slug?: string | null
          created_at?: string
          display_name: string
          id: string
          is_active?: boolean
          quest?: string | null
          quest_slug?: string | null
          subject?: string | null
          topic_slug?: string | null
        }
        Update: {
          chapter?: string | null
          chapter_slug?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          quest?: string | null
          quest_slug?: string | null
          subject?: string | null
          topic_slug?: string | null
        }
        Relationships: []
      }
      turns: {
        Row: {
          ai_reply: Json | null
          ai_request: Json | null
          checks: Json
          created_at: string
          decision: Json
          first_audio_ms: number | null
          flagged: boolean
          id: string
          latency_ms: number | null
          session_id: string
          trigger: string
          used_fallback: boolean
        }
        Insert: {
          ai_reply?: Json | null
          ai_request?: Json | null
          checks?: Json
          created_at?: string
          decision?: Json
          first_audio_ms?: number | null
          flagged?: boolean
          id?: string
          latency_ms?: number | null
          session_id: string
          trigger: string
          used_fallback?: boolean
        }
        Update: {
          ai_reply?: Json | null
          ai_request?: Json | null
          checks?: Json
          created_at?: string
          decision?: Json
          first_audio_ms?: number | null
          flagged?: boolean
          id?: string
          latency_ms?: number | null
          session_id?: string
          trigger?: string
          used_fallback?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "turns_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          granted_via: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          granted_via?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          granted_via?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_clips: {
        Row: {
          audio_b64: string
          clip_key: string
          created_at: string
        }
        Insert: {
          audio_b64: string
          clip_key: string
          created_at?: string
        }
        Update: {
          audio_b64?: string
          clip_key?: string
          created_at?: string
        }
        Relationships: []
      }
      voice_shown: {
        Row: {
          noted_at: string
          text_hash: string
          user_id: string
        }
        Insert: {
          noted_at?: string
          text_hash: string
          user_id: string
        }
        Update: {
          noted_at?: string
          text_hash?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_content_pack: {
        Args: { _import: Json; _ops: Json }
        Returns: string
      }
      cleanup_dev_open_access_roles: { Args: never; Returns: number }
      count_dev_open_access_roles: { Args: never; Returns: number }
      has_learning_consent: { Args: { _student_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_class_member: { Args: { _class_session_id: string }; Returns: boolean }
      owns_class: { Args: { _class_session_id: string }; Returns: boolean }
      session_in_owned_class: {
        Args: { _session_id: string }
        Returns: boolean
      }
      slugify: { Args: { _s: string }; Returns: string }
    }
    Enums: {
      ai_provider: "mock" | "lovable_ai" | "ai_team"
      app_role: "student" | "instructor" | "parent" | "admin"
      band: "rebuild" | "bridge" | "stretch"
      channel: "voice" | "text"
      class_status: "open" | "live" | "paused" | "closed"
      confidence: "sure" | "think_so" | "guessing"
      consent_scope: "learning_data" | "voice" | "transcript"
      controller: "ai" | "instructor"
      evidence_strength: "strong" | "moderate" | "weak" | "none"
      hook_type:
        | "prediction"
        | "puzzling_question"
        | "real_life"
        | "surprising_fact"
      item_kind:
        | "mcq"
        | "numeric"
        | "structured"
        | "line_work"
        | "theory"
        | "prediction"
      lesson_step:
        | "readiness"
        | "hook"
        | "video"
        | "simulation"
        | "worksheet"
        | "guided"
        | "exit_ticket"
        | "reflection"
      session_mode: "autopilot" | "override"
      session_status: "active" | "paused" | "completed" | "abandoned"
      skill_role: "prerequisite" | "taught"
      voice_provider: "mock" | "elevenlabs"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      ai_provider: ["mock", "lovable_ai", "ai_team"],
      app_role: ["student", "instructor", "parent", "admin"],
      band: ["rebuild", "bridge", "stretch"],
      channel: ["voice", "text"],
      class_status: ["open", "live", "paused", "closed"],
      confidence: ["sure", "think_so", "guessing"],
      consent_scope: ["learning_data", "voice", "transcript"],
      controller: ["ai", "instructor"],
      evidence_strength: ["strong", "moderate", "weak", "none"],
      hook_type: [
        "prediction",
        "puzzling_question",
        "real_life",
        "surprising_fact",
      ],
      item_kind: [
        "mcq",
        "numeric",
        "structured",
        "line_work",
        "theory",
        "prediction",
      ],
      lesson_step: [
        "readiness",
        "hook",
        "video",
        "simulation",
        "worksheet",
        "guided",
        "exit_ticket",
        "reflection",
      ],
      session_mode: ["autopilot", "override"],
      session_status: ["active", "paused", "completed", "abandoned"],
      skill_role: ["prerequisite", "taught"],
      voice_provider: ["mock", "elevenlabs"],
    },
  },
} as const
