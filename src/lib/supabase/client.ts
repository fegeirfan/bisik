import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { SupabaseSession } from '$lib/types/supabase';

const SESSION_STORAGE_KEY = 'bisik.supabase.session';

export const supabaseUrl = env.PUBLIC_SUPABASE_URL ?? '';
export const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY ?? '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

interface SupabaseRequestOptions {
	method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
	body?: unknown;
	token?: string;
	headers?: HeadersInit;
	singular?: boolean;
}

function getBaseHeaders(token?: string, singular = false, extraHeaders?: HeadersInit) {
	const headers = new Headers(extraHeaders);
	headers.set('apikey', supabaseAnonKey);
	headers.set('Content-Type', 'application/json');

	if (singular) {
		headers.set('Accept', 'application/vnd.pgrst.object+json');
	}

	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	return headers;
}

export async function supabaseRequest<T>(path: string, options: SupabaseRequestOptions = {}) {
	if (!isSupabaseConfigured) {
		throw new Error('Supabase belum dikonfigurasi. Isi PUBLIC_SUPABASE_URL dan PUBLIC_SUPABASE_ANON_KEY.');
	}

	const response = await fetch(`${supabaseUrl}${path}`, {
		method: options.method ?? 'GET',
		headers: getBaseHeaders(options.token, options.singular, options.headers),
		body: options.body ? JSON.stringify(options.body) : undefined
	});

	if (!response.ok) {
		let message = 'Terjadi kesalahan saat menghubungi Supabase.';

		try {
			const payload = (await response.json()) as {
				error?: string;
				message?: string;
				msg?: string;
				error_description?: string;
			};
			message =
				payload.msg ??
				payload.message ??
				payload.error_description ??
				payload.error ??
				message;
		} catch {
			message = response.statusText || message;
		}

		throw new Error(message);
	}

	if (response.status === 204) {
		return null as T;
	}

	return (await response.json()) as T;
}

export function readStoredSession() {
	if (!browser) return null;

	const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
	if (!raw) return null;

	try {
		return JSON.parse(raw) as SupabaseSession;
	} catch {
		window.localStorage.removeItem(SESSION_STORAGE_KEY);
		return null;
	}
}

export function writeStoredSession(session: SupabaseSession | null) {
	if (!browser) return;

	if (session) {
		window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
		return;
	}

	window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
