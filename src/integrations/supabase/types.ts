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
      code_engine_ai_blocks: {
        Row: {
          created_at: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      code_engine_projects: {
        Row: {
          approved: boolean
          created_at: string
          files: Json
          id: string
          idea: string
          name: string
          plan: Json | null
          profession: string
          publish_slug: string | null
          published_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          files?: Json
          id?: string
          idea?: string
          name?: string
          plan?: Json | null
          profession?: string
          publish_slug?: string | null
          published_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          files?: Json
          id?: string
          idea?: string
          name?: string
          plan?: Json | null
          profession?: string
          publish_slug?: string | null
          published_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      code_engine_versions: {
        Row: {
          created_at: string
          files: Json
          id: string
          project_id: string
          summary: string
          user_id: string
        }
        Insert: {
          created_at?: string
          files: Json
          id?: string
          project_id: string
          summary: string
          user_id: string
        }
        Update: {
          created_at?: string
          files?: Json
          id?: string
          project_id?: string
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_engine_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "code_engine_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cookie_consent: {
        Row: {
          analytics: boolean
          created_at: string
          essential: boolean
          id: string
          ip: string | null
          marketing: boolean
          user_id: string | null
        }
        Insert: {
          analytics?: boolean
          created_at?: string
          essential?: boolean
          id?: string
          ip?: string | null
          marketing?: boolean
          user_id?: string | null
        }
        Update: {
          analytics?: boolean
          created_at?: string
          essential?: boolean
          id?: string
          ip?: string | null
          marketing?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      creator_feedback: {
        Row: {
          created_at: string
          feedback: string
          id: string
          preference: string | null
          prompt: string
          style_used: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          preference?: string | null
          prompt: string
          style_used: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          preference?: string | null
          prompt?: string
          style_used?: string
          user_id?: string | null
        }
        Relationships: []
      }
      credit_balances: {
        Row: {
          balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_ledger: {
        Row: {
          balance_after: number
          created_at: string
          credits: number
          id: string
          job_id: string | null
          metadata: Json
          payment_id: string
          type: string
          user_id: string
        }
        Insert: {
          balance_after: number
          created_at?: string
          credits: number
          id?: string
          job_id?: string | null
          metadata?: Json
          payment_id: string
          type: string
          user_id: string
        }
        Update: {
          balance_after?: number
          created_at?: string
          credits?: number
          id?: string
          job_id?: string | null
          metadata?: Json
          payment_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "studio_video_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          deadline_at: string
          evidence_bundle_json: Json
          id: string
          payment_id: string
          provider_event_id: string
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          deadline_at: string
          evidence_bundle_json?: Json
          id?: string
          payment_id: string
          provider_event_id: string
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          deadline_at?: string
          evidence_bundle_json?: Json
          id?: string
          payment_id?: string
          provider_event_id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_evidence: {
        Row: {
          completed_at: string | null
          created_at: string
          credits_used: number
          failed_at: string | null
          id: string
          job_id: string
          payment_id: string
          prompt_hash: string
          refunded_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credits_used?: number
          failed_at?: string | null
          id?: string
          job_id: string
          payment_id: string
          prompt_hash: string
          refunded_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credits_used?: number
          failed_at?: string | null
          id?: string
          job_id?: string
          payment_id?: string
          prompt_hash?: string
          refunded_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_evidence_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "studio_video_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_evidence_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_kobo: number
          created_at: string
          credit_delivered_at: string | null
          credit_value_snapshot: Json | null
          currency: string
          email: string
          expected_credits: number
          id: string
          ip: string | null
          pricing_version: string | null
          product_code: string | null
          provider: string
          reference: string
          status: string
          subscription_id: string | null
          terms_version: string | null
          user_agent: string | null
          user_id: string
          value_protected_until: string | null
        }
        Insert: {
          amount_kobo: number
          created_at?: string
          credit_delivered_at?: string | null
          credit_value_snapshot?: Json | null
          currency?: string
          email: string
          expected_credits: number
          id?: string
          ip?: string | null
          pricing_version?: string | null
          product_code?: string | null
          provider: string
          reference: string
          status?: string
          subscription_id?: string | null
          terms_version?: string | null
          user_agent?: string | null
          user_id: string
          value_protected_until?: string | null
        }
        Update: {
          amount_kobo?: number
          created_at?: string
          credit_delivered_at?: string | null
          credit_value_snapshot?: Json | null
          currency?: string
          email?: string
          expected_credits?: number
          id?: string
          ip?: string | null
          pricing_version?: string | null
          product_code?: string | null
          provider?: string
          reference?: string
          status?: string
          subscription_id?: string | null
          terms_version?: string | null
          user_agent?: string | null
          user_id?: string
          value_protected_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "studio_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          display_name: string
          id: string
          photo_path: string | null
          updated_at: string
        }
        Insert: {
          display_name?: string
          id: string
          photo_path?: string | null
          updated_at?: string
        }
        Update: {
          display_name?: string
          id?: string
          photo_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      studio_group_seats: {
        Row: {
          created_at: string
          id: string
          subscription_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_group_seats_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "studio_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          credits_per_period: number
          id: string
          period_end: string | null
          period_start: string | null
          plan_code: string
          price_kobo: number
          provider: string
          provider_subscription_id: string | null
          seat_limit: number
          status: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          credits_per_period: number
          id?: string
          period_end?: string | null
          period_start?: string | null
          plan_code: string
          price_kobo: number
          provider: string
          provider_subscription_id?: string | null
          seat_limit?: number
          status?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          credits_per_period?: number
          id?: string
          period_end?: string | null
          period_start?: string | null
          plan_code?: string
          price_kobo?: number
          provider?: string
          provider_subscription_id?: string | null
          seat_limit?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      studio_uploads: {
        Row: {
          created_at: string
          engine: string
          id: string
          mime_type: string
          name: string
          path: string
          size_bytes: number
          user_id: string
        }
        Insert: {
          created_at?: string
          engine: string
          id?: string
          mime_type: string
          name: string
          path: string
          size_bytes: number
          user_id: string
        }
        Update: {
          created_at?: string
          engine?: string
          id?: string
          mime_type?: string
          name?: string
          path?: string
          size_bytes?: number
          user_id?: string
        }
        Relationships: []
      }
      studio_video_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          gateway_id: string | null
          id: string
          progress: number
          prompt: string
          settings: Json
          status: string
          storage_path: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          gateway_id?: string | null
          id?: string
          progress?: number
          prompt: string
          settings: Json
          status?: string
          storage_path?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          gateway_id?: string | null
          id?: string
          progress?: number
          prompt?: string
          settings?: Json
          status?: string
          storage_path?: string | null
          user_id?: string
        }
        Relationships: []
      }
      studio_video_service_state: {
        Row: {
          blocked: boolean
          id: string
          message: string | null
          status_code: number | null
          updated_at: string
        }
        Insert: {
          blocked?: boolean
          id: string
          message?: string | null
          status_code?: number | null
          updated_at?: string
        }
        Update: {
          blocked?: boolean
          id?: string
          message?: string | null
          status_code?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      terms_acceptance: {
        Row: {
          accepted_at: string
          id: string
          ip: string | null
          privacy_version: string
          refund_version: string
          terms_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          ip?: string | null
          privacy_version?: string
          refund_version?: string
          terms_version?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          ip?: string | null
          privacy_version?: string
          refund_version?: string
          terms_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          consent_at: string
          created_at: string
          email: string
          id: string
          name: string | null
          plan_code: string | null
          source: string
        }
        Insert: {
          consent_at?: string
          created_at?: string
          email: string
          id?: string
          name?: string | null
          plan_code?: string | null
          source: string
        }
        Update: {
          consent_at?: string
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          plan_code?: string | null
          source?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_refund_failed: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      public_waitlist_total: { Args: never; Returns: number }
      purchase_credits: {
        Args: {
          p_amount: number
          p_currency: string
          p_email: string
          p_provider: string
          p_reference: string
        }
        Returns: number
      }
      use_credit: {
        Args: { p_job_id: string; p_payment_id: string; p_user_id: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "user"
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
      app_role: ["owner", "admin", "user"],
    },
  },
} as const
