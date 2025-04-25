export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          delivery_note: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          delivery_note?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          delivery_note?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      fonts: {
        Row: {
          created_at: string | null
          file_path: string
          file_type: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_type: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_type?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      logos: {
        Row: {
          created_at: string | null
          file_path: string
          id: string
          order_id: string | null
          position: string
          scale: number | null
          x_position: number | null
          y_position: number | null
        }
        Insert: {
          created_at?: string | null
          file_path: string
          id?: string
          order_id?: string | null
          position?: string
          scale?: number | null
          x_position?: number | null
          y_position?: number | null
        }
        Update: {
          created_at?: string | null
          file_path?: string
          id?: string
          order_id?: string | null
          position?: string
          scale?: number | null
          x_position?: number | null
          y_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "logos_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string | null
          design_data: Json | null
          design_image: string | null
          design_image_back: string | null
          design_image_front: string | null
          id: string
          logo_ids: string[] | null
          notes: string | null
          reference_images: Json | null
          status: string
          team_name: string | null
          total_cost: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          design_data?: Json | null
          design_image?: string | null
          design_image_back?: string | null
          design_image_front?: string | null
          id?: string
          logo_ids?: string[] | null
          notes?: string | null
          reference_images?: Json | null
          status?: string
          team_name?: string | null
          total_cost?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          design_data?: Json | null
          design_image?: string | null
          design_image_back?: string | null
          design_image_front?: string | null
          id?: string
          logo_ids?: string[] | null
          notes?: string | null
          reference_images?: Json | null
          status?: string
          team_name?: string | null
          total_cost?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          chest_number: boolean | null
          created_at: string | null
          design_image: string | null
          id: string
          line_1: string | null
          line_3: string | null
          logo_chest_center: boolean | null
          logo_chest_left: boolean | null
          logo_chest_right: boolean | null
          logo_pants: boolean | null
          logo_sleeve_left: boolean | null
          logo_sleeve_right: boolean | null
          lower_text: string | null
          lower_text_enabled: boolean | null
          name: string | null
          note: string | null
          number: string
          order_id: string | null
          pants_number: boolean | null
          print_image: boolean | null
          print_style: string
          size: string
          uniform_type: string
          upper_text: string | null
          upper_text_enabled: boolean | null
        }
        Insert: {
          chest_number?: boolean | null
          created_at?: string | null
          design_image?: string | null
          id?: string
          line_1?: string | null
          line_3?: string | null
          logo_chest_center?: boolean | null
          logo_chest_left?: boolean | null
          logo_chest_right?: boolean | null
          logo_pants?: boolean | null
          logo_sleeve_left?: boolean | null
          logo_sleeve_right?: boolean | null
          lower_text?: string | null
          lower_text_enabled?: boolean | null
          name?: string | null
          note?: string | null
          number: string
          order_id?: string | null
          pants_number?: boolean | null
          print_image?: boolean | null
          print_style?: string
          size: string
          uniform_type?: string
          upper_text?: string | null
          upper_text_enabled?: boolean | null
        }
        Update: {
          chest_number?: boolean | null
          created_at?: string | null
          design_image?: string | null
          id?: string
          line_1?: string | null
          line_3?: string | null
          logo_chest_center?: boolean | null
          logo_chest_left?: boolean | null
          logo_chest_right?: boolean | null
          logo_pants?: boolean | null
          logo_sleeve_left?: boolean | null
          logo_sleeve_right?: boolean | null
          lower_text?: string | null
          lower_text_enabled?: boolean | null
          name?: string | null
          note?: string | null
          number?: string
          order_id?: string | null
          pants_number?: boolean | null
          print_image?: boolean | null
          print_style?: string
          size?: string
          uniform_type?: string
          upper_text?: string | null
          upper_text_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "players_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      print_configs: {
        Row: {
          back_color: string | null
          back_material: string | null
          created_at: string | null
          font: string | null
          font_file: string | null
          front_color: string | null
          front_material: string | null
          id: string
          leg_color: string | null
          leg_material: string | null
          logo_positions: Json | null
          lower_text_material: string | null
          order_id: string | null
          sleeve_color: string | null
          sleeve_material: string | null
          upper_text_material: string | null
        }
        Insert: {
          back_color?: string | null
          back_material?: string | null
          created_at?: string | null
          font?: string | null
          font_file?: string | null
          front_color?: string | null
          front_material?: string | null
          id?: string
          leg_color?: string | null
          leg_material?: string | null
          logo_positions?: Json | null
          lower_text_material?: string | null
          order_id?: string | null
          sleeve_color?: string | null
          sleeve_material?: string | null
          upper_text_material?: string | null
        }
        Update: {
          back_color?: string | null
          back_material?: string | null
          created_at?: string | null
          font?: string | null
          font_file?: string | null
          front_color?: string | null
          front_material?: string | null
          id?: string
          leg_color?: string | null
          leg_material?: string | null
          logo_positions?: Json | null
          lower_text_material?: string | null
          order_id?: string | null
          sleeve_color?: string | null
          sleeve_material?: string | null
          upper_text_material?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "print_configs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_lines: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          material: string
          order_id: string | null
          points: number | null
          position: string
          product: string
          size: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          material: string
          order_id?: string | null
          points?: number | null
          position: string
          product: string
          size: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          material?: string
          order_id?: string | null
          points?: number | null
          position?: string
          product?: string
          size?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_lines_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sizes: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          size_id: string
          size_value: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          size_id?: string
          size_value: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          size_id?: string
          size_value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_by_email: {
        Args: { email: string }
        Returns: string
      }
      has_role: {
        Args: {
          user_id: string
          requested_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: "customer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["customer", "admin"],
    },
  },
} as const
