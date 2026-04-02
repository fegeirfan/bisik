import type { DiaryEntry, PersonaOption, RefinedJournal } from '$lib/types/diary';
import type { SupabaseSession } from '$lib/types/supabase';
import { supabaseRequest } from '$lib/supabase/client';

interface PersonaRow {
	id: string;
	slug: string;
	name: string;
	icon: string;
	description: string;
	tags: string[] | null;
}

interface ProfileRow {
	id: string;
	email: string | null;
	display_name: string | null;
	selected_persona_id: string | null;
	role: 'user' | 'admin' | 'super_admin';
	account_status: 'active' | 'suspended';
	last_seen_at: string | null;
}

interface DiaryEntryRow {
	id: string;
	title: string | null;
	content: string;
	mood: DiaryEntry['mood'];
	tag: string | null;
	insight: string | null;
	persona_id: string | null;
	created_at: string;
}

interface RefinedJournalRow {
	id: string;
	diary_entry_id: string;
	title: string | null;
	content: string;
	summary: string | null;
	created_at: string;
}

function getToken(session: SupabaseSession) {
	return session.accessToken;
}

export async function fetchPersonas(session?: SupabaseSession | null) {
	const personaRows = await supabaseRequest<PersonaRow[]>(
		'/rest/v1/personas?select=id,slug,name,icon,description,tags&status=eq.active&order=is_system.desc,created_at.asc',
		{
			token: session?.accessToken
		}
	);

	return personaRows.map<PersonaOption>((row) => ({
		id: row.id,
		slug: row.slug,
		name: row.name,
		icon: row.icon,
		description: row.description,
		tags: row.tags ?? []
	}));
}

export async function fetchProfile(session: SupabaseSession) {
	return supabaseRequest<ProfileRow>(`/rest/v1/profiles?select=id,email,display_name,selected_persona_id,role,account_status,last_seen_at&id=eq.${session.user.id}`, {
		token: getToken(session),
		singular: true
	});
}

export async function updateLastSeen(session: SupabaseSession) {
	return supabaseRequest<ProfileRow>(`/rest/v1/profiles?id=eq.${session.user.id}`, {
		method: 'PATCH',
		token: getToken(session),
		headers: {
			Prefer: 'return=representation'
		},
		body: {
			last_seen_at: new Date().toISOString()
		},
		singular: true
	});
}

export async function saveSelectedPersona(session: SupabaseSession, personaId: string) {
	return supabaseRequest<ProfileRow>(`/rest/v1/profiles?id=eq.${session.user.id}`, {
		method: 'PATCH',
		token: getToken(session),
		headers: {
			Prefer: 'return=representation'
		},
		body: {
			selected_persona_id: personaId
		},
		singular: true
	});
}

export async function fetchDiaryEntries(session: SupabaseSession) {
	const [entryRows, refinedRows] = await Promise.all([
		supabaseRequest<DiaryEntryRow[]>(
			'/rest/v1/diary_entries?select=id,title,content,mood,tag,insight,persona_id,created_at&order=created_at.desc',
			{
				token: getToken(session)
			}
		),
		supabaseRequest<RefinedJournalRow[]>(
			'/rest/v1/refined_journals?select=id,diary_entry_id,title,content,summary,created_at&order=created_at.desc',
			{
				token: getToken(session)
			}
		)
	]);

	const refinedMap = new Map(
		refinedRows.map((row) => [
			row.diary_entry_id,
			{
				id: row.id,
				diaryEntryId: row.diary_entry_id,
				title: row.title ?? undefined,
				content: row.content,
				summary: row.summary ?? undefined,
				createdAt: row.created_at
			} satisfies RefinedJournal
		])
	);

	return entryRows.map<DiaryEntry>((row) => ({
		id: row.id,
		title: row.title ?? undefined,
		content: row.content,
		mood: row.mood,
		tag: row.tag ?? undefined,
		insight: row.insight ?? 'Catatan ini tersimpan tanpa insight tambahan.',
		createdAt: row.created_at,
		personaId: row.persona_id ?? undefined,
		refinedJournal: refinedMap.get(row.id)
	}));
}

export async function createDiaryEntry(
	session: SupabaseSession,
	entry: Omit<DiaryEntry, 'createdAt'> & { createdAt?: string }
) {
	return supabaseRequest<DiaryEntryRow>('/rest/v1/diary_entries', {
		method: 'POST',
		token: getToken(session),
		headers: {
			Prefer: 'return=representation'
		},
		body: {
			user_id: session.user.id,
			persona_id: entry.personaId ?? null,
			title: entry.title ?? null,
			content: entry.content,
			mood: entry.mood,
			tag: entry.tag ?? null,
			insight: entry.insight,
			created_at: entry.createdAt ?? new Date().toISOString()
		},
		singular: true
	});
}

export async function createRefinedJournal(session: SupabaseSession, journal: RefinedJournal) {
	return supabaseRequest<RefinedJournalRow>('/rest/v1/refined_journals', {
		method: 'POST',
		token: getToken(session),
		headers: {
			Prefer: 'return=representation'
		},
		body: {
			user_id: session.user.id,
			diary_entry_id: journal.diaryEntryId,
			title: journal.title ?? null,
			content: journal.content,
			summary: journal.summary ?? null,
			created_at: journal.createdAt
		},
		singular: true
	});
}
