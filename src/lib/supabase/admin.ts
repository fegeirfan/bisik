import type { AppSettings, AdminPersona, AdminUser } from '$lib/types/admin';
import type { DiaryEntry } from '$lib/types/diary';
import type { SupabaseSession } from '$lib/types/supabase';
import { supabaseRequest } from '$lib/supabase/client';
import { formatFullDate } from '$lib/utils/diary';

interface AdminProfileRow {
	id: string;
	email: string | null;
	display_name: string | null;
	role: 'user' | 'admin' | 'super_admin';
	account_status: 'active' | 'suspended';
	created_at: string;
	last_seen_at: string | null;
	selected_persona_id: string | null;
}

interface AdminPersonaRow {
	id: string;
	slug: string;
	name: string;
	icon: string;
	description: string;
	tags: string[] | null;
	status: 'active' | 'inactive';
	is_system: boolean;
	prompt_override: string | null;
	tone: string | null;
	tone_modifier: number | null;
}

interface DiaryAdminRow {
	id: string;
	user_id: string;
	persona_id: string | null;
	title: string | null;
	content: string;
	mood: DiaryEntry['mood'];
	tag: string | null;
	insight: string | null;
	created_at: string;
}

interface AppSettingsRow {
	id: number;
	app_name: string;
	tagline: string;
	system_prompt: string;
	temperature: number;
	max_response_length: number;
	response_delay_ms: number;
	rate_limit_per_hour: number;
	memory_hint: boolean;
	mood_detection: boolean;
	adaptive_tone: boolean;
	night_mode_ai: boolean;
	maintenance_mode: boolean;
}

function token(session: SupabaseSession) {
	return session.accessToken;
}

export async function fetchAdminProfile(session: SupabaseSession) {
	return supabaseRequest<AdminProfileRow>(
		`/rest/v1/profiles?select=id,email,display_name,role,account_status,created_at,last_seen_at,selected_persona_id&id=eq.${session.user.id}`,
		{
			token: token(session),
			singular: true
		}
	);
}

export async function fetchAdminUsers(session: SupabaseSession) {
	const [profiles, entries] = await Promise.all([
		supabaseRequest<AdminProfileRow[]>(
			'/rest/v1/profiles?select=id,email,display_name,role,account_status,created_at,last_seen_at,selected_persona_id&order=created_at.asc',
			{ token: token(session) }
		),
		supabaseRequest<DiaryAdminRow[]>(
			'/rest/v1/diary_entries?select=id,user_id,mood,created_at&order=created_at.desc',
			{ token: token(session) }
		)
	]);

	const entriesByUser = new Map<string, DiaryAdminRow[]>();
	for (const entry of entries) {
		const list = entriesByUser.get(entry.user_id) ?? [];
		list.push(entry);
		entriesByUser.set(entry.user_id, list);
	}

	const palette = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f43f5e', '#fb7185'];

	return profiles.map<AdminUser>((profile, index) => {
		const userEntries = entriesByUser.get(profile.id) ?? [];
		const dominantMood =
			userEntries[0]?.mood === 'happy'
				? '😊'
				: userEntries[0]?.mood === 'sad'
					? '😢'
					: userEntries[0]?.mood === 'tired'
						? '😴'
						: userEntries[0]?.mood === 'frustrated'
							? '😤'
							: '😐';

		return {
			id: profile.id,
			name: profile.display_name ?? profile.email?.split('@')[0] ?? 'User',
			email: profile.email ?? 'tanpa-email',
			status: profile.account_status,
			role: profile.role,
			entries: userEntries.length,
			joined: formatFullDate(profile.created_at),
			lastActive: profile.last_seen_at ? formatFullDate(profile.last_seen_at) : 'Belum ada',
			mood: dominantMood,
			color: palette[index % palette.length]
		};
	});
}

export async function updateUserStatus(
	session: SupabaseSession,
	userId: string,
	status: 'active' | 'suspended'
) {
	return supabaseRequest<AdminProfileRow>(`/rest/v1/profiles?id=eq.${userId}`, {
		method: 'PATCH',
		token: token(session),
		headers: {
			Prefer: 'return=representation'
		},
		body: {
			account_status: status
		},
		singular: true
	});
}

export async function fetchAdminEntries(session: SupabaseSession) {
	return supabaseRequest<DiaryAdminRow[]>(
		'/rest/v1/diary_entries?select=id,user_id,persona_id,title,content,mood,tag,insight,created_at&order=created_at.desc',
		{
			token: token(session)
		}
	);
}

export async function fetchAdminPersonas(session: SupabaseSession) {
	const [rows, users] = await Promise.all([
		supabaseRequest<AdminPersonaRow[]>(
			'/rest/v1/personas?select=id,slug,name,icon,description,tags,status,is_system,prompt_override,tone,tone_modifier&order=is_system.desc,created_at.asc',
			{ token: token(session) }
		),
		supabaseRequest<AdminProfileRow[]>(
			'/rest/v1/profiles?select=id,selected_persona_id',
			{ token: token(session) }
		)
	]);

	const usage = new Map<string, number>();
	for (const user of users) {
		if (!user.selected_persona_id) continue;
		usage.set(user.selected_persona_id, (usage.get(user.selected_persona_id) ?? 0) + 1);
	}

	return rows.map<AdminPersona>((row) => ({
		id: row.id,
		slug: row.slug,
		icon: row.icon,
		name: row.name,
		users: usage.get(row.id) ?? 0,
		description: row.description,
		tags: row.tags ?? [],
		status: row.status,
		locked: row.is_system,
		promptOverride: row.prompt_override ?? undefined,
		tone: row.tone ?? undefined,
		toneModifier: row.tone_modifier ?? undefined
	}));
}

export async function createAdminPersona(
	session: SupabaseSession,
	payload: Pick<AdminPersona, 'name' | 'icon' | 'description' | 'tags'> & {
		slug: string;
		tone?: string;
		promptOverride?: string;
	}
) {
	return supabaseRequest<AdminPersonaRow>('/rest/v1/personas', {
		method: 'POST',
		token: token(session),
		headers: {
			Prefer: 'return=representation'
		},
		body: {
			owner_id: session.user.id,
			slug: payload.slug,
			name: payload.name,
			icon: payload.icon,
			description: payload.description,
			tags: payload.tags,
			tone: payload.tone ?? 'supportive',
			prompt_override: payload.promptOverride ?? null,
			status: 'active'
		},
		singular: true
	});
}

export async function updateAdminPersona(
	session: SupabaseSession,
	personaId: string,
	payload: Partial<{
		name: string;
		icon: string;
		description: string;
		tags: string[];
		status: 'active' | 'inactive';
		tone: string;
		toneModifier: number;
		promptOverride: string;
	}>
) {
	return supabaseRequest<AdminPersonaRow>(`/rest/v1/personas?id=eq.${personaId}`, {
		method: 'PATCH',
		token: token(session),
		headers: {
			Prefer: 'return=representation'
		},
		body: {
			name: payload.name,
			icon: payload.icon,
			description: payload.description,
			tags: payload.tags,
			status: payload.status,
			tone: payload.tone,
			tone_modifier: payload.toneModifier,
			prompt_override: payload.promptOverride
		},
		singular: true
	});
}

export async function fetchAppSettings(session: SupabaseSession) {
	const row = await supabaseRequest<AppSettingsRow>(
		'/rest/v1/app_settings?select=id,app_name,tagline,system_prompt,temperature,max_response_length,response_delay_ms,rate_limit_per_hour,memory_hint,mood_detection,adaptive_tone,night_mode_ai,maintenance_mode&id=eq.1',
		{
			token: token(session),
			singular: true
		}
	);

	return mapSettings(row);
}

export async function updateAppSettings(
	session: SupabaseSession,
	settings: AppSettings
) {
	const row = await supabaseRequest<AppSettingsRow>('/rest/v1/app_settings?id=eq.1', {
		method: 'PATCH',
		token: token(session),
		headers: {
			Prefer: 'return=representation'
		},
		body: {
			app_name: settings.appName,
			tagline: settings.tagline,
			system_prompt: settings.systemPrompt,
			temperature: settings.temperature,
			max_response_length: settings.maxResponseLength,
			response_delay_ms: settings.responseDelayMs,
			rate_limit_per_hour: settings.rateLimitPerHour,
			memory_hint: settings.memoryHint,
			mood_detection: settings.moodDetection,
			adaptive_tone: settings.adaptiveTone,
			night_mode_ai: settings.nightModeAi,
			maintenance_mode: settings.maintenanceMode
		},
		singular: true
	});

	return mapSettings(row);
}

function mapSettings(row: AppSettingsRow): AppSettings {
	return {
		appName: row.app_name,
		tagline: row.tagline,
		systemPrompt: row.system_prompt,
		temperature: row.temperature,
		maxResponseLength: row.max_response_length,
		responseDelayMs: row.response_delay_ms,
		rateLimitPerHour: row.rate_limit_per_hour,
		memoryHint: row.memory_hint,
		moodDetection: row.mood_detection,
		adaptiveTone: row.adaptive_tone,
		nightModeAi: row.night_mode_ai,
		maintenanceMode: row.maintenance_mode
	};
}
