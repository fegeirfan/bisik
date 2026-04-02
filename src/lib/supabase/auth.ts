import { browser } from '$app/environment';
import { writeStoredSession } from '$lib/supabase/client';
import { supabase } from '$lib/supabase/sdk';
import type { AuthCredentials, SupabaseSession } from '$lib/types/supabase';

function normalizeSdkSession(payload: { access_token: string; refresh_token?: string; expires_at?: number; user: any }) {
	const session: SupabaseSession = {
		accessToken: payload.access_token,
		refreshToken: payload.refresh_token,
		expiresAt: payload.expires_at,
		user: {
			id: payload.user.id,
			email: payload.user.email ?? undefined,
			user_metadata: payload.user.user_metadata ?? undefined
		}
	};

	writeStoredSession(session);
	return session;
}

type AuthGuardAction = 'login' | 'register';

interface AuthGuardStateV1 {
	v: 1;
	lastAttemptAt?: number;
	login?: number[];
	register?: number[];
}

const AUTH_GUARD_STORAGE_KEY = 'bisik.auth.guard.v1';

function enforceAuthGuard(action: AuthGuardAction) {
	if (!browser) return;

	const now = Date.now();
	const minIntervalMs = 3000;
	const windowMs = 60 * 60 * 1000;
	const limit = action === 'register' ? 5 : 20;

	let state: AuthGuardStateV1 = { v: 1 };

	try {
		const raw = window.localStorage.getItem(AUTH_GUARD_STORAGE_KEY);
		if (raw) state = JSON.parse(raw) as AuthGuardStateV1;
	} catch {
		state = { v: 1 };
	}

	if (state.lastAttemptAt && now - state.lastAttemptAt < minIntervalMs) {
		throw new Error('Tunggu sebentar sebelum mencoba lagi.');
	}

	const list = (state[action] ?? []).filter((ts) => typeof ts === 'number' && ts > now - windowMs);
	if (list.length >= limit) {
		throw new Error('Terlalu banyak percobaan. Coba lagi nanti.');
	}

	list.push(now);
	state[action] = list;
	state.lastAttemptAt = now;

	try {
		window.localStorage.setItem(AUTH_GUARD_STORAGE_KEY, JSON.stringify(state));
	} catch {
		// ignore storage failures
	}
}

export async function registerWithPassword(credentials: AuthCredentials) {
	enforceAuthGuard('register');
	const { data, error } = await supabase.auth.signUp({
		email: credentials.email,
		password: credentials.password,
		options: {
			data: {
				display_name: credentials.displayName ?? credentials.email.split('@')[0]
			}
		}
	});

	if (error) throw error;
	if (!data.session || !data.user) return null;

	return normalizeSdkSession({ ...data.session, user: data.user });
}

export async function loginWithPassword(credentials: AuthCredentials) {
	enforceAuthGuard('login');
	const { data, error } = await supabase.auth.signInWithPassword({
		email: credentials.email,
		password: credentials.password
	});

	if (error) throw error;
	if (!data.session || !data.user) return null;

	return normalizeSdkSession({ ...data.session, user: data.user });
}

export async function loginWithGoogle(redirectTo?: string) {
	if (!browser) return;

	const { error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: redirectTo ?? window.location.origin
		}
	});

	if (error) throw error;
}

export async function restoreSession() {
	try {
		const { data, error } = await supabase.auth.getSession();
		if (error) throw error;
		if (!data.session) {
			writeStoredSession(null);
			return null;
		}

		const { data: userData, error: userError } = await supabase.auth.getUser();
		if (userError) throw userError;
		if (!userData.user) {
			writeStoredSession(null);
			return null;
		}

		return normalizeSdkSession({ ...data.session, user: userData.user });
	} catch {
		writeStoredSession(null);
		return null;
	}
}

export async function logout(token?: string) {
	try {
		await supabase.auth.signOut();
	} catch {
		// ignore
	}

	writeStoredSession(null);
}
