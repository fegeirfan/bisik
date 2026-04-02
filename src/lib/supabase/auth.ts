import { supabaseRequest, readStoredSession, writeStoredSession } from '$lib/supabase/client';
import type { AuthCredentials, SupabaseSession, SupabaseUser } from '$lib/types/supabase';

interface AuthResponse {
	access_token?: string;
	refresh_token?: string;
	expires_at?: number;
	user: SupabaseUser;
}

function normalizeSession(payload: AuthResponse) {
	if (!payload.access_token) {
		return null;
	}

	const session: SupabaseSession = {
		accessToken: payload.access_token,
		refreshToken: payload.refresh_token,
		expiresAt: payload.expires_at,
		user: payload.user
	};

	writeStoredSession(session);
	return session;
}

export async function registerWithPassword(credentials: AuthCredentials) {
	const payload = await supabaseRequest<AuthResponse>('/auth/v1/signup', {
		method: 'POST',
		body: {
			email: credentials.email,
			password: credentials.password,
			data: {
				display_name: credentials.displayName ?? credentials.email.split('@')[0]
			}
		}
	});

	return normalizeSession(payload);
}

export async function loginWithPassword(credentials: AuthCredentials) {
	const payload = await supabaseRequest<AuthResponse>('/auth/v1/token?grant_type=password', {
		method: 'POST',
		body: {
			email: credentials.email,
			password: credentials.password
		}
	});

	return normalizeSession(payload);
}

export async function fetchCurrentUser(token: string) {
	return supabaseRequest<SupabaseUser>('/auth/v1/user', {
		token
	});
}

export async function refreshSession() {
	const stored = readStoredSession();
	if (!stored?.refreshToken) return null;

	const payload = await supabaseRequest<AuthResponse>('/auth/v1/token?grant_type=refresh_token', {
		method: 'POST',
		body: {
			refresh_token: stored.refreshToken
		}
	});

	return normalizeSession(payload);
}

export async function restoreSession() {
	const stored = readStoredSession();
	if (!stored) return null;

	try {
		if (stored.expiresAt && stored.expiresAt * 1000 <= Date.now() + 60_000 && stored.refreshToken) {
			return await refreshSession();
		}

		const user = await fetchCurrentUser(stored.accessToken);
		const session = { ...stored, user };
		writeStoredSession(session);
		return session;
	} catch {
		writeStoredSession(null);
		return null;
	}
}

export async function logout(token?: string) {
	if (token) {
		try {
			await supabaseRequest('/auth/v1/logout', {
				method: 'POST',
				token
			});
		} catch {
			// local session should still be cleared even if remote logout fails
		}
	}

	writeStoredSession(null);
}
