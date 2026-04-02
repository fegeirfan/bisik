export interface SupabaseUser {
	id: string;
	email?: string;
	user_metadata?: Record<string, unknown>;
}

export interface SupabaseSession {
	accessToken: string;
	refreshToken?: string;
	expiresAt?: number;
	user: SupabaseUser;
}

export interface AuthCredentials {
	email: string;
	password: string;
	displayName?: string;
}
