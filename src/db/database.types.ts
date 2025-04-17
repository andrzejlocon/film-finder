export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      film_status_logs: {
        Row: {
          film_id: number;
          id: number;
          next_status: string;
          prev_status: string;
          status_changed_at: string;
          user_id: string;
        };
        Insert: {
          film_id: number;
          id?: number;
          next_status: string;
          prev_status: string;
          status_changed_at?: string;
          user_id: string;
        };
        Update: {
          film_id?: number;
          id?: number;
          next_status?: string;
          prev_status?: string;
          status_changed_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "film_status_logs_film_id_fkey";
            columns: ["film_id"];
            isOneToOne: false;
            referencedRelation: "user_films";
            referencedColumns: ["id"];
          },
        ];
      };
      generation_error_logs: {
        Row: {
          created_at: string;
          criteria_hash: string;
          error_code: string;
          error_message: string;
          id: number;
          model: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          criteria_hash: string;
          error_code: string;
          error_message: string;
          id?: number;
          model: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          criteria_hash?: string;
          error_code?: string;
          error_message?: string;
          id?: number;
          model?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      generation_logs: {
        Row: {
          created_at: string;
          criteria_hash: string;
          generated_count: number;
          generation_duration: number;
          id: number;
          marked_as_rejected_count: number | null;
          marked_as_to_watch_count: number | null;
          marked_as_watched_count: number | null;
          model: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          criteria_hash: string;
          generated_count: number;
          generation_duration: number;
          id?: number;
          marked_as_rejected_count?: number | null;
          marked_as_to_watch_count?: number | null;
          marked_as_watched_count?: number | null;
          model: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          criteria_hash?: string;
          generated_count?: number;
          generation_duration?: number;
          id?: number;
          marked_as_rejected_count?: number | null;
          marked_as_to_watch_count?: number | null;
          marked_as_watched_count?: number | null;
          model?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_films: {
        Row: {
          actors: string[] | null;
          created_at: string;
          description: string | null;
          director: string;
          generation_id: number | null;
          genres: string[] | null;
          id: number;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
          year: number;
        };
        Insert: {
          actors?: string[] | null;
          created_at?: string;
          description?: string | null;
          director: string;
          generation_id?: number | null;
          genres?: string[] | null;
          id?: number;
          status: string;
          title: string;
          updated_at?: string;
          user_id: string;
          year: number;
        };
        Update: {
          actors?: string[] | null;
          created_at?: string;
          description?: string | null;
          director?: string;
          generation_id?: number | null;
          genres?: string[] | null;
          id?: number;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "user_films_generation_id_fkey";
            columns: ["generation_id"];
            isOneToOne: false;
            referencedRelation: "generation_logs";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: {
          actors: string[] | null;
          directors: string[] | null;
          genres: string[] | null;
          id: number;
          user_id: string;
          year_from: number | null;
          year_to: number | null;
        };
        Insert: {
          actors?: string[] | null;
          directors?: string[] | null;
          genres?: string[] | null;
          id?: number;
          user_id: string;
          year_from?: number | null;
          year_to?: number | null;
        };
        Update: {
          actors?: string[] | null;
          directors?: string[] | null;
          genres?: string[] | null;
          id?: number;
          user_id?: string;
          year_from?: number | null;
          year_to?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
