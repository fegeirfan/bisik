import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchUserIdFromAccessToken } from '$lib/server/supabaseUser';
import { hashEmbedding } from '$lib/server/hashEmbed';
import { isQdrantConfigured, searchDiaryPoints } from '$lib/server/qdrant';
import { eliceChatCompletion } from '$lib/server/elice';

function buildMemoryBlock(results: Array<{ payload?: any }>) {
	const snippets = results
		.map((r) => r.payload)
		.filter(Boolean)
		.map((p: any) => {
			const title = p.title ? `Judul: ${p.title}\n` : '';
			const content = String(p.content ?? '').slice(0, 700);
			return `---\n${title}${content}`;
		});

	return snippets.length ? `\n\nMEMORI USER (ringkas):\n${snippets.join('\n')}` : '';
}

export const POST: RequestHandler = async ({ request }) => {
	const auth = request.headers.get('authorization') ?? '';
	const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';
	if (!token) return json({ error: 'Unauthorized' }, { status: 401 });

	const body = (await request.json().catch(() => null)) as
		| {
				messages: Array<{ role: 'user' | 'assistant'; content: string }>;
				persona?: { slug?: string; name?: string };
				mood?: string | null;
		  }
		| null;

	if (!body?.messages?.length) return json({ error: 'Bad Request' }, { status: 400 });

	const userId = await fetchUserIdFromAccessToken(token);
	const lastUser = [...body.messages].reverse().find((m) => m.role === 'user')?.content ?? '';
	const memory = isQdrantConfigured()
		? buildMemoryBlock(
				await searchDiaryPoints({
					userId,
					vector: hashEmbedding(lastUser),
					limit: 5
				})
			)
		: '';

	const personaLine = body.persona?.slug ? `Persona: ${body.persona.slug}` : 'Persona: friend';

	const system = [
		'Kamu adalah Bisik, pendamping journaling yang hangat, empatik, dan tidak menghakimi.',
		personaLine,
		`Mood user saat ini: ${body.mood ?? '-'}.`,
		memory ? `\n${memory}` : '',
		'Aturan: jangan memberi diagnosis medis; kalau ada tanda bahaya, sarankan mencari bantuan profesional.',
		'Beri respons singkat, lembut, dan ajak refleksi (maks 6-10 kalimat).'
	].join('\n');

	const mapped = body.messages.map((m) => ({
		role: m.role,
		content: m.content
	})) as any[];

	const content = await eliceChatCompletion({
		messages: [
			{ role: 'system', content: system },
			...mapped
		],
		maxTokens: 300,
		temperature: 0.7
	});

	return json({ reply: content.trim() });
};
