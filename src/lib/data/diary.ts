import type { DiaryEntry, MoodOption, PersonaOption } from '$lib/types/diary';

export const personas: PersonaOption[] = [
	{
		id: 'friend',
		slug: 'friend',
		name: 'Teman',
		icon: '🫂',
		description: 'Hangat, suportif, dan mendengarkan.'
	},
	{
		id: 'mentor',
		slug: 'mentor',
		name: 'Mentor',
		icon: '🧠',
		description: 'Membantu menata pikiran dengan tenang.'
	},
	{
		id: 'reflector',
		slug: 'reflector',
		name: 'Reflector',
		icon: '🪞',
		description: 'Mengajak melihat pola dan makna.'
	}
];

export const moods: MoodOption[] = [
	{ value: 'happy', emoji: '😊', label: 'Bahagia', color: '#4ade80', energy: 72, defaultTag: 'produktif' },
	{ value: 'neutral', emoji: '😐', label: 'Netral', color: '#6366f1', energy: 48, defaultTag: 'berat' },
	{ value: 'sad', emoji: '😢', label: 'Sedih', color: '#f87171', energy: 20 },
	{ value: 'tired', emoji: '😴', label: 'Lelah', color: '#facc15', energy: 34 },
	{
		value: 'frustrated',
		emoji: '😤',
		label: 'Frustrasi',
		color: '#fb7185',
		energy: 58,
		defaultTag: 'penuh tekanan'
	}
];

export const initialEntries: DiaryEntry[] = [
	{
		id: 'entry-2026-04-01',
		content:
			'Hari ini capek banget. Rapat dari pagi, tugasku numpuk, dan kayaknya nggak ada yang bisa aku kontrol. Bahkan mau minum kopi aja harus nunggu meeting selesai dulu. Rasanya kayak hari yang panjang banget, dan aku nggak tau kapan ini akan berakhir.',
		mood: 'neutral',
		tag: 'berat',
		insight: 'Kamu menyebut kebutuhan akan kontrol cukup sering hari ini.',
		createdAt: '2026-04-01T22:14:00+07:00'
	},
	{
		id: 'entry-2026-03-31',
		content:
			'Lumayan produktif hari ini. Berhasil menyelesaikan projek yang udah stuck berminggu-minggu. Rasanya lega banget, kayak ada beban yang terangkat. Besok mau lanjut yang lain, semoga bisa konsisten.',
		mood: 'happy',
		tag: 'produktif',
		insight: 'Ini salah satu hari paling produktifmu dalam beberapa minggu terakhir.',
		createdAt: '2026-03-31T20:05:00+07:00'
	},
	{
		id: 'entry-2026-03-28',
		content:
			'Ada hal yang bikin aku sedih hari ini. Nggak bisa cerita banyak, tapi rasanya berat. Semoga besok lebih baik.',
		mood: 'sad',
		insight: 'Dari pola tulisanmu, hari ini kamu tampaknya lebih butuh ruang daripada solusi.',
		createdAt: '2026-03-28T21:12:00+07:00'
	},
	{
		id: 'entry-2026-03-25',
		content:
			'Nggak bisa tidur semalam. Pikiran terlalu ramai, akhirnya nulis ini jam 2 pagi. Kadang nulis ini lebih melegakan daripada coba tidur paksa.',
		mood: 'tired',
		insight: 'Malam hari sering jadi waktu kamu paling jujur pada diri sendiri.',
		createdAt: '2026-03-25T02:05:00+07:00'
	}
];

export const starterReplies = [
	'Sepertinya hari ini cukup berat ya. Kalau kamu mau, kita bisa uraikan satu hal yang paling menguras energimu dulu.',
	'Wajar kalau rasanya menumpuk seperti itu. Kamu tidak harus menyelesaikan semuanya sekaligus malam ini.',
	'Aku dengar ada rasa lelah dan kehilangan kendali di situ. Mau mulai dari bagian yang paling bikin sesak?',
	'Terima kasih sudah menuliskannya. Kadang menamai rasa yang ada saja sudah jadi langkah yang penting.'
];
