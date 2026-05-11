export type ToolType = "indicator" | "ea";
export type ToolStatus = "draft" | "published";
export type Platform = "MT4" | "MT5" | "MT4 & MT5";
export type UserRole = "student" | "admin";

export type Database = {
  public: {
    Tables: {
      tools: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          type: ToolType;
          platform: Platform;
          version: string;
          description_en: string | null;
          description_km: string | null;
          install_guide_url: string | null;
          file_url: string | null;
          status: ToolStatus;
        };
        Insert: Omit<
          Database["public"]["Tables"]["tools"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["tools"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          email: string | null;
          full_name: string | null;
          role: UserRole;
        };
        Insert: Omit<
          Database["public"]["Tables"]["profiles"]["Row"],
          "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
