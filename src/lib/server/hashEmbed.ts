import crypto from 'node:crypto';

export function hashEmbedding(text: string, dims = 256) {
	const vector = new Array<number>(dims).fill(0);
	const tokens = text
		.toLowerCase()
		.replace(/[^a-z0-9\u00C0-\u024f\u1e00-\u1eff\s]+/g, ' ')
		.split(/\s+/)
		.filter((t) => t.length >= 2 && t.length <= 32);

	for (const token of tokens) {
		const hash = crypto.createHash('sha256').update(token).digest();
		const idx = hash.readUInt32LE(0) % dims;
		const sign = hash[4] % 2 === 0 ? 1 : -1;
		vector[idx] += sign;
	}

	let norm = 0;
	for (const x of vector) norm += x * x;
	norm = Math.sqrt(norm) || 1;
	return vector.map((x) => x / norm);
}

