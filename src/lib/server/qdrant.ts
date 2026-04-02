import { QDRANT_API_KEY, QDRANT_COLLECTION, QDRANT_URL } from '$env/static/private';

type QdrantDistance = 'Cosine' | 'Dot' | 'Euclid' | 'Manhattan';

const DEFAULT_DIMS = 256;
const DEFAULT_DISTANCE: QdrantDistance = 'Cosine';

type PayloadIndexSchema = 'keyword' | 'integer' | 'float' | 'bool' | 'datetime' | 'uuid';

function getQdrantConfigOrNull() {
	if (!QDRANT_URL || !QDRANT_COLLECTION) return null;
	return {
		url: QDRANT_URL.replace(/\/+$/, ''),
		apiKey: QDRANT_API_KEY || undefined,
		collection: QDRANT_COLLECTION,
		dims: DEFAULT_DIMS,
		distance: DEFAULT_DISTANCE
	};
}

function qdrantHeaders(apiKey?: string) {
	const headers = new Headers();
	headers.set('Content-Type', 'application/json');
	if (apiKey) headers.set('api-key', apiKey);
	return headers;
}

export function isQdrantConfigured() {
	return Boolean(getQdrantConfigOrNull());
}

async function ensurePayloadIndex(fieldName: string, fieldSchema: PayloadIndexSchema) {
	const cfg = getQdrantConfigOrNull();
	if (!cfg) return;

	// Qdrant requires payload indexes for some filters (especially on Cloud).
	// We'll attempt to create the index; if it already exists, Qdrant returns 409.
	const response = await fetch(`${cfg.url}/collections/${cfg.collection}/index`, {
		method: 'PUT',
		headers: qdrantHeaders(cfg.apiKey),
		body: JSON.stringify({
			field_name: fieldName,
			field_schema: fieldSchema
		})
	});

	if (response.ok || response.status === 409) return;

	const text = await response.text().catch(() => '');
	throw new Error(`Gagal membuat index payload "${fieldName}" (${response.status}). ${text}`);
}

async function ensureRequiredIndexes() {
	// used in filters
	await ensurePayloadIndex('user_id', 'keyword');
	await ensurePayloadIndex('diary_entry_id', 'keyword');
}

export async function ensureCollection() {
	const cfg = getQdrantConfigOrNull();
	if (!cfg) return;
	const base = cfg.url;
	const col = cfg.collection;

	const check = await fetch(`${base}/collections/${col}`, {
		method: 'GET',
		headers: qdrantHeaders(cfg.apiKey)
	});

	if (check.ok) {
		await ensureRequiredIndexes();
		return;
	}
	if (check.status !== 404) {
		throw new Error(`Gagal cek collection Qdrant (${check.status}).`);
	}

	const created = await fetch(`${base}/collections/${col}`, {
		method: 'PUT',
		headers: qdrantHeaders(cfg.apiKey),
		body: JSON.stringify({
			vectors: {
				size: cfg.dims,
				distance: cfg.distance
			}
		})
	});

	if (!created.ok) {
		const text = await created.text().catch(() => '');
		throw new Error(`Gagal membuat collection Qdrant (${created.status}). ${text}`);
	}

	await ensureRequiredIndexes();
}

export async function upsertDiaryPoint(args: {
	id: string;
	vector: number[];
	payload: Record<string, unknown>;
}) {
	const cfg = getQdrantConfigOrNull();
	if (!cfg) return;
	await ensureCollection();

	const response = await fetch(`${cfg.url}/collections/${cfg.collection}/points?wait=true`, {
		method: 'PUT',
		headers: qdrantHeaders(cfg.apiKey),
		body: JSON.stringify({
			points: [
				{
					id: args.id,
					vector: args.vector,
					payload: args.payload
				}
			]
		})
	});

	if (!response.ok) {
		const text = await response.text().catch(() => '');
		throw new Error(`Gagal upsert Qdrant (${response.status}). ${text}`);
	}
}

export async function searchDiaryPoints(args: {
	userId: string;
	vector: number[];
	limit?: number;
	excludeId?: string;
}) {
	const cfg = getQdrantConfigOrNull();
	if (!cfg) return [];
	await ensureCollection();

	const filter: any = {
		must: [{ key: 'user_id', match: { value: args.userId } }]
	};
	if (args.excludeId) {
		filter.must_not = [{ key: 'diary_entry_id', match: { value: args.excludeId } }];
	}

	const requestBody = {
		vector: args.vector,
		limit: args.limit ?? 5,
		with_payload: true,
		filter
	};

	let response = await fetch(`${cfg.url}/collections/${cfg.collection}/points/search`, {
		method: 'POST',
		headers: qdrantHeaders(cfg.apiKey),
		body: JSON.stringify(requestBody)
	});

	if (!response.ok) {
		const text = await response.text().catch(() => '');

		// Self-heal: if index is missing, create it and retry once.
		if (
			response.status === 400 &&
			(text.includes('Index required') || text.includes('index') || text.includes('payload'))
		) {
			await ensureRequiredIndexes();
			response = await fetch(`${cfg.url}/collections/${cfg.collection}/points/search`, {
				method: 'POST',
				headers: qdrantHeaders(cfg.apiKey),
				body: JSON.stringify(requestBody)
			});
			if (response.ok) {
				const json = (await response.json()) as {
					result?: Array<{ id: string; score: number; payload?: any }>;
				};
				return json.result ?? [];
			}
			const retryText = await response.text().catch(() => '');
			throw new Error(`Gagal search Qdrant (${response.status}). ${retryText}`);
		}

		throw new Error(`Gagal search Qdrant (${response.status}). ${text}`);
	}

	const json = (await response.json()) as {
		result?: Array<{ id: string; score: number; payload?: any }>;
	};
	return json.result ?? [];
}
