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
			// LeasePoints tables as per PRD
			tenants: {
				Row: {
					id: string;
					legal_name: string;
					email: string;
					abn: string | null;
					stripe_customer_id: string | null;
					default_payment_method_id: string | null;
					timezone: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					legal_name: string;
					email: string;
					abn?: string | null;
					stripe_customer_id?: string | null;
					default_payment_method_id?: string | null;
					timezone?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					legal_name?: string;
					email?: string;
					abn?: string | null;
					stripe_customer_id?: string | null;
					default_payment_method_id?: string | null;
					timezone?: string;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			agencies: {
				Row: {
					id: string;
					name: string;
					abn: string | null;
					stripe_account_id: string | null;
					onboarding_status: string;
					payout_schedule: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					abn?: string | null;
					stripe_account_id?: string | null;
					onboarding_status?: string;
					payout_schedule?: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					abn?: string | null;
					stripe_account_id?: string | null;
					onboarding_status?: string;
					payout_schedule?: string;
					created_at?: string;
				};
				Relationships: [];
			};
			properties: {
				Row: {
					id: string;
					agency_id: string;
					address_line: string;
					suburb: string;
					state: string;
					postcode: string;
					external_ref: string | null;
				};
				Insert: {
					id?: string;
					agency_id: string;
					address_line: string;
					suburb: string;
					state: string;
					postcode: string;
					external_ref?: string | null;
				};
				Update: {
					id?: string;
					agency_id?: string;
					address_line?: string;
					suburb?: string;
					state?: string;
					postcode?: string;
					external_ref?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "properties_agency_id_fkey";
						columns: ["agency_id"];
						isOneToOne: false;
						referencedRelation: "agencies";
						referencedColumns: ["id"];
					},
				];
			};
			leases: {
				Row: {
					id: string;
					property_id: string;
					tenant_id: string;
					agency_ref: string;
					rent_amount_cents: number;
					rent_currency: string;
					frequency: string;
					next_due_at: string | null;
					status: string;
				};
				Insert: {
					id?: string;
					property_id: string;
					tenant_id: string;
					agency_ref: string;
					rent_amount_cents: number;
					rent_currency?: string;
					frequency: string;
					next_due_at?: string | null;
					status?: string;
				};
				Update: {
					id?: string;
					property_id?: string;
					tenant_id?: string;
					agency_ref?: string;
					rent_amount_cents?: number;
					rent_currency?: string;
					frequency?: string;
					next_due_at?: string | null;
					status?: string;
				};
				Relationships: [
					{
						foreignKeyName: "leases_property_id_fkey";
						columns: ["property_id"];
						isOneToOne: false;
						referencedRelation: "properties";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "leases_tenant_id_fkey";
						columns: ["tenant_id"];
						isOneToOne: false;
						referencedRelation: "tenants";
						referencedColumns: ["id"];
					},
				];
			};
			payment_schedules: {
				Row: {
					id: string;
					lease_id: string;
					frequency: string;
					day_of_week: number | null;
					day_of_month: number | null;
					start_date: string;
					end_date: string | null;
					next_run_at: string | null;
					status: string;
					failure_count: number;
				};
				Insert: {
					id?: string;
					lease_id: string;
					frequency: string;
					day_of_week?: number | null;
					day_of_month?: number | null;
					start_date: string;
					end_date?: string | null;
					next_run_at?: string | null;
					status?: string;
					failure_count?: number;
				};
				Update: {
					id?: string;
					lease_id?: string;
					frequency?: string;
					day_of_week?: number | null;
					day_of_month?: number | null;
					start_date?: string;
					end_date?: string | null;
					next_run_at?: string | null;
					status?: string;
					failure_count?: number;
				};
				Relationships: [
					{
						foreignKeyName: "payment_schedules_lease_id_fkey";
						columns: ["lease_id"];
						isOneToOne: false;
						referencedRelation: "leases";
						referencedColumns: ["id"];
					},
				];
			};
			payments: {
				Row: {
					id: string;
					lease_id: string;
					schedule_id: string | null;
					scheduled_for: string;
					processed_at: string | null;
					status: string;
					stripe_payment_intent_id: string | null;
					stripe_transfer_id: string | null;
					amount_cents: number;
					platform_fee_cents: number;
					receipt_url: string | null;
					failure_reason: string | null;
					retry_count: number;
				};
				Insert: {
					id?: string;
					lease_id: string;
					schedule_id?: string | null;
					scheduled_for: string;
					processed_at?: string | null;
					status: string;
					stripe_payment_intent_id?: string | null;
					stripe_transfer_id?: string | null;
					amount_cents: number;
					platform_fee_cents: number;
					receipt_url?: string | null;
					failure_reason?: string | null;
					retry_count?: number;
				};
				Update: {
					id?: string;
					lease_id?: string;
					schedule_id?: string | null;
					scheduled_for?: string;
					processed_at?: string | null;
					status?: string;
					stripe_payment_intent_id?: string | null;
					stripe_transfer_id?: string | null;
					amount_cents?: number;
					platform_fee_cents?: number;
					receipt_url?: string | null;
					failure_reason?: string | null;
					retry_count?: number;
				};
				Relationships: [
					{
						foreignKeyName: "payments_lease_id_fkey";
						columns: ["lease_id"];
						isOneToOne: false;
						referencedRelation: "leases";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "payments_schedule_id_fkey";
						columns: ["schedule_id"];
						isOneToOne: false;
						referencedRelation: "payment_schedules";
						referencedColumns: ["id"];
					},
				];
			};
			trust_accounts: {
				Row: {
					id: string;
					agency_id: string;
					account_name: string;
					bsb: string;
					account_number_last4: string;
					is_default: boolean;
				};
				Insert: {
					id?: string;
					agency_id: string;
					account_name: string;
					bsb: string;
					account_number_last4: string;
					is_default?: boolean;
				};
				Update: {
					id?: string;
					agency_id?: string;
					account_name?: string;
					bsb?: string;
					account_number_last4?: string;
					is_default?: boolean;
				};
				Relationships: [
					{
						foreignKeyName: "trust_accounts_agency_id_fkey";
						columns: ["agency_id"];
						isOneToOne: false;
						referencedRelation: "agencies";
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
