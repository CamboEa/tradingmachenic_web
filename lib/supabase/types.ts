export type ToolType = "indicator" | "ea";
export type ToolStatus = "draft" | "published";
export type PodcastStatus = "draft" | "published";
export type LessonStatus = "draft" | "published";
export type LessonType = "free" | "paid";
export type Platform = "MT4" | "MT5" | "MT4 & MT5";
export type UserRole = "student" | "admin";

export type CurriculumAccent = "gold" | "teal";

export type Database = {
  public: {
    Tables: {
      curriculum_phases: {
        Row: {
          id: string;
          created_at: string;
          sort_order: number;
          slug: string;
          accent: CurriculumAccent;
          label_en: string;
          label_km: string;
          sublabel_en: string;
          sublabel_km: string;
        };
        Insert: Omit<Database["public"]["Tables"]["curriculum_phases"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["curriculum_phases"]["Insert"]>;
        Relationships: [];
      };
      curriculum_modules: {
        Row: {
          id: string;
          created_at: string;
          phase_id: string;
          sort_order: number;
          title_en: string;
          title_km: string;
          focus_en: string;
          focus_km: string;
          activities_en: string;
          activities_km: string;
        };
        Insert: Omit<Database["public"]["Tables"]["curriculum_modules"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["curriculum_modules"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "curriculum_modules_phase_id_fkey";
            columns: ["phase_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_phases";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          email: string | null;
          full_name: string | null;
          role: UserRole;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      tools: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          type: ToolType;
          platform: Platform;
          pricing: "free" | "paid";
          version: string;
          description_en: string | null;
          description_km: string | null;
          requirements_en: string | null;
          requirements_km: string | null;
          how_it_works_en: string | null;
          how_it_works_km: string | null;
          key_features_en: string | null;
          key_features_km: string | null;
          usage_notes_en: string | null;
          usage_notes_km: string | null;
          proof_of_testing_en: string | null;
          proof_of_testing_km: string | null;
          gallery: unknown;
          install_guide_url: string | null;
          file_url: string | null;
          image_url: string | null;
          status: ToolStatus;
        };
        Insert: Omit<Database["public"]["Tables"]["tools"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["tools"]["Insert"]>;
        Relationships: [];
      };
      podcasts: {
        Row: {
          id: string;
          created_at: string;
          youtube_url: string;
          title_en: string;
          title_km: string;
          description_en: string | null;
          description_km: string | null;
          sort_order: number;
          status: PodcastStatus;
        };
        Insert: Omit<Database["public"]["Tables"]["podcasts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["podcasts"]["Insert"]>;
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          slug: string;
          title_en: string;
          title_km: string;
          excerpt_en: string | null;
          excerpt_km: string | null;
          body_en: string;
          body_km: string;
          featured_image_url: string | null;
          published_at: string;
          status: PodcastStatus;
          videos: unknown;
        };
        Insert: Omit<Database["public"]["Tables"]["blog_posts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          created_at: string;
          slug: string;
          title_en: string;
          title_km: string;
          summary_en: string | null;
          summary_km: string | null;
          thumbnail_url: string | null;
          approximate_minutes: number | null;
          type: LessonType | null;
          objectives_en: string[];
          objectives_km: string[];
          status: LessonStatus;
        };
        Insert: Omit<Database["public"]["Tables"]["lessons"]["Row"], "id" | "created_at" | "thumbnail_url" | "objectives_en" | "objectives_km"> & {
          thumbnail_url?: string | null;
          objectives_en?: string[];
          objectives_km?: string[];
        };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
        Relationships: [];
      };
      lesson_videos: {
        Row: {
          id: string;
          created_at: string;
          lesson_id: string;
          embed_url: string;
          title_en: string | null;
          title_km: string | null;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["lesson_videos"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["lesson_videos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "lesson_videos_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
