export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			users: {
				Row: {
					id: string;
					clerk_id: string;
					email: string;
					name: string | null;
					image_url: string | null;
					roles: string[];
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					clerk_id: string;
					email: string;
					name?: string | null;
					image_url?: string | null;
					roles?: string[];
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					clerk_id?: string;
					email?: string;
					name?: string | null;
					image_url?: string | null;
					roles?: string[];
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			todos: {
				Row: {
					id: string;
					user_id: string;
					text: string;
					completed: boolean;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					text: string;
					completed?: boolean;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					text?: string;
					completed?: boolean;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "todos_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}
