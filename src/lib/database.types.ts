export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          topic: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
