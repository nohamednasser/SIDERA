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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
        Relationships: []
      }
      capstone_projects: {
        Row: {
          created_at: string
          description: string | null
          grade: string
          grand_challenge: string | null
          id: string
          image_url: string | null
          material_type: string | null
          storage_path: string | null
          team_members: string | null
          title: string
          video_url: string | null
          year: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade?: string
          grand_challenge?: string | null
          id?: string
          image_url?: string | null
          material_type?: string | null
          storage_path?: string | null
          team_members?: string | null
          title: string
          video_url?: string | null
          year?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          grade?: string
          grand_challenge?: string | null
          id?: string
          image_url?: string | null
          material_type?: string | null
          storage_path?: string | null
          team_members?: string | null
          title?: string
          video_url?: string | null
          year?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          certificate_type: string
          created_at: string
          id: string
          reference_id: string | null
          reference_title: string
          score: number | null
          student_email: string
          student_name: string
        }
        Insert: {
          certificate_number: string
          certificate_type?: string
          created_at?: string
          id?: string
          reference_id?: string | null
          reference_title: string
          score?: number | null
          student_email: string
          student_name: string
        }
        Update: {
          certificate_number?: string
          certificate_type?: string
          created_at?: string
          id?: string
          reference_id?: string | null
          reference_title?: string
          score?: number | null
          student_email?: string
          student_name?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_email: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role?: string
          user_email: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_email?: string
        }
        Relationships: []
      }
      code_snippets: {
        Row: {
          code: string
          created_at: string
          id: string
          language: string
          student_email: string
          student_name: string
          title: string
          updated_at: string
        }
        Insert: {
          code?: string
          created_at?: string
          id?: string
          language?: string
          student_email: string
          student_name: string
          title?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          language?: string
          student_email?: string
          student_name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_answers: {
        Row: {
          answer_text: string | null
          id: string
          is_correct: boolean | null
          points_earned: number | null
          question_id: string
          submission_id: string
        }
        Insert: {
          answer_text?: string | null
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id: string
          submission_id: string
        }
        Update: {
          answer_text?: string | null
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "exam_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "exam_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          correct_answer: string | null
          created_at: string
          exam_id: string
          id: string
          image_url: string | null
          options: Json | null
          points: number | null
          question_text: string
          question_type: string
          sort_order: number | null
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          exam_id: string
          id?: string
          image_url?: string | null
          options?: Json | null
          points?: number | null
          question_text: string
          question_type?: string
          sort_order?: number | null
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          exam_id?: string
          id?: string
          image_url?: string | null
          options?: Json | null
          points?: number | null
          question_text?: string
          question_type?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_submissions: {
        Row: {
          exam_id: string
          id: string
          score: number | null
          security_violations: number
          started_at: string | null
          student_email: string
          student_name: string
          submitted_at: string | null
          total_points: number | null
        }
        Insert: {
          exam_id: string
          id?: string
          score?: number | null
          security_violations?: number
          started_at?: string | null
          student_email: string
          student_name: string
          submitted_at?: string | null
          total_points?: number | null
        }
        Update: {
          exam_id?: string
          id?: string
          score?: number | null
          security_violations?: number
          started_at?: string | null
          student_email?: string
          student_name?: string
          submitted_at?: string | null
          total_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_submissions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          description: string | null
          external_url: string | null
          grade: string
          id: string
          is_published: boolean | null
          subject: string
          time_limit_minutes: number | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          grade?: string
          id?: string
          is_published?: boolean | null
          subject?: string
          time_limit_minutes?: number | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          grade?: string
          id?: string
          is_published?: boolean | null
          subject?: string
          time_limit_minutes?: number | null
          title?: string
        }
        Relationships: []
      }
      lab_log_data_points: {
        Row: {
          created_at: string
          data_set: string
          id: string
          log_id: string
          sort_order: number | null
          x_label: string | null
          x_value: number
          y_label: string | null
          y_value: number
        }
        Insert: {
          created_at?: string
          data_set?: string
          id?: string
          log_id: string
          sort_order?: number | null
          x_label?: string | null
          x_value?: number
          y_label?: string | null
          y_value?: number
        }
        Update: {
          created_at?: string
          data_set?: string
          id?: string
          log_id?: string
          sort_order?: number | null
          x_label?: string | null
          x_value?: number
          y_label?: string | null
          y_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "lab_log_data_points_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "lab_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_logs: {
        Row: {
          conclusion: string | null
          created_at: string
          grade: string
          hypothesis: string | null
          id: string
          procedure_text: string | null
          student_email: string
          student_name: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          conclusion?: string | null
          created_at?: string
          grade?: string
          hypothesis?: string | null
          id?: string
          procedure_text?: string | null
          student_email: string
          student_name: string
          subject?: string
          title: string
          updated_at?: string
        }
        Update: {
          conclusion?: string | null
          created_at?: string
          grade?: string
          hypothesis?: string | null
          id?: string
          procedure_text?: string | null
          student_email?: string
          student_name?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_outcomes: {
        Row: {
          created_at: string
          description: string | null
          grade: string
          id: string
          lo_code: string
          sort_order: number | null
          subject: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade: string
          id?: string
          lo_code: string
          sort_order?: number | null
          subject: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade?: string
          id?: string
          lo_code?: string
          sort_order?: number | null
          subject?: string
          title?: string
        }
        Relationships: []
      }
      learning_path_items: {
        Row: {
          created_at: string
          description: string | null
          file_id: string | null
          id: string
          path_id: string
          sort_order: number | null
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_id?: string | null
          id?: string
          path_id: string
          sort_order?: number | null
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_id?: string | null
          id?: string
          path_id?: string
          sort_order?: number | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_items_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          description: string | null
          grade: string | null
          icon: string | null
          id: string
          sort_order: number | null
          subject: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade?: string | null
          icon?: string | null
          id?: string
          sort_order?: number | null
          subject?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade?: string | null
          icon?: string | null
          id?: string
          sort_order?: number | null
          subject?: string | null
          title?: string
        }
        Relationships: []
      }
      scanned_documents: {
        Row: {
          created_at: string
          file_size: number | null
          id: string
          page_count: number
          storage_path: string
          title: string
          user_email: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          id?: string
          page_count?: number
          storage_path: string
          title: string
          user_email: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          id?: string
          page_count?: number
          storage_path?: string
          title?: string
          user_email?: string
        }
        Relationships: []
      }
      stem_drive_files: {
        Row: {
          created_at: string
          description: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          grade: string
          id: string
          lo_id: string | null
          semester: string | null
          storage_path: string | null
          subject: string
          title: string
          type: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          grade: string
          id?: string
          lo_id?: string | null
          semester?: string | null
          storage_path?: string | null
          subject: string
          title: string
          type?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          grade?: string
          id?: string
          lo_id?: string | null
          semester?: string | null
          storage_path?: string | null
          subject?: string
          title?: string
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stem_drive_files_lo_id_fkey"
            columns: ["lo_id"]
            isOneToOne: false
            referencedRelation: "learning_outcomes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_reviews: {
        Row: {
          created_at: string
          grade: string | null
          id: string
          rating: number
          review_text: string
          student_email: string
          student_name: string
        }
        Insert: {
          created_at?: string
          grade?: string | null
          id?: string
          rating?: number
          review_text: string
          student_email: string
          student_name: string
        }
        Update: {
          created_at?: string
          grade?: string | null
          id?: string
          rating?: number
          review_text?: string
          student_email?: string
          student_name?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          selected_grade: string | null
          selected_semester: string | null
          selected_subject: string | null
          theme: string | null
          updated_at: string
          user_email: string
        }
        Insert: {
          id?: string
          selected_grade?: string | null
          selected_semester?: string | null
          selected_subject?: string | null
          theme?: string | null
          updated_at?: string
          user_email: string
        }
        Update: {
          id?: string
          selected_grade?: string | null
          selected_semester?: string | null
          selected_subject?: string | null
          theme?: string | null
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
