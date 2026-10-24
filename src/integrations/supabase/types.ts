export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      attempts: {
        Row: {
          answers: Json;
          exam_id: string;
          guest_id: string | null;
          id: string;
          score: number;
          submitted_at: string;
          total: number;
          user_id: string | null;
        };
        Insert: {
          answers?: Json;
          exam_id: string;
          guest_id?: string | null;
          id?: string;
          score?: number;
          submitted_at?: string;
          total?: number;
          user_id?: string | null;
        };
        Update: {
          answers?: Json;
          exam_id?: string;
          guest_id?: string | null;
          id?: string;
          score?: number;
          submitted_at?: string;
          total?: number;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attempts_guest_id_fkey";
            columns: ["guest_id"];
            isOneToOne: false;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attempts_exam_id_fkey";
            columns: ["exam_id"];
            isOneToOne: false;
            referencedRelation: "exams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      exams: {
        Row: {
          created_at: string;
          description: string;
          duration_minutes: number;
          featured: boolean;
          id: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          duration_minutes?: number;
          featured?: boolean;
          id?: string;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          duration_minutes?: number;
          featured?: boolean;
          id?: string;
          title?: string;
        };
        Relationships: [];
      };
      guests: {
        Row: {
          created_at: string;
          id: string;
          key_hash: string;
          nama: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          key_hash: string;
          nama: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          key_hash?: string;
          nama?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          id: string;
          nama: string;
          username: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          nama?: string;
          username: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          nama?: string;
          username?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          correct_option: string;
          exam_id: string;
          id: string;
          image_path: string | null;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          order_index: number;
          text: string;
        };
        Insert: {
          correct_option: string;
          exam_id: string;
          id?: string;
          image_path?: string | null;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          order_index?: number;
          text: string;
        };
        Update: {
          correct_option?: string;
          exam_id?: string;
          id?: string;
          image_path?: string | null;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          order_index?: number;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey";
            columns: ["exam_id"];
            isOneToOne: false;
            referencedRelation: "exams";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_catalog: {
        Args: { p_guest_id?: string; p_guest_key?: string };
        Returns: {
          attempt_count: number;
          description: string;
          duration_minutes: number;
          id: string;
          my_best_score: number | null;
          my_best_total: number | null;
          question_count: number;
          title: string;
        }[];
      };
      get_exam_for_taking: {
        Args: { p_exam_id: string };
        Returns: Json;
      };
      get_leaderboard: {
        Args: { p_exam_id: string };
        Returns: {
          nama: string;
          participant_id: string;
          rank: number;
          score: number;
          submitted_at: string;
          total: number;
        }[];
      };
      get_my_attempts: {
        Args: { p_exam_id: string; p_guest_id: string; p_guest_key: string };
        Returns: {
          id: string;
          score: number;
          submitted_at: string;
          total: number;
        }[];
      };
      submit_attempt: {
        Args: {
          p_answers: Json;
          p_exam_id: string;
          p_guest_id?: string;
          p_guest_key?: string;
          p_nama: string;
        };
        Returns: {
          attempt_id: string;
          guest_id: string;
          nama: string;
          score: number;
          total: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
