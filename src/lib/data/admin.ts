import type {
	AdminActivity,
	AdminEntryRow,
	AdminFeatureToggle,
	AdminMoodDay,
	AdminNavItem,
	AdminPersona,
	AdminStat,
	AdminUser
} from '$lib/types/admin';

export const adminNavItems: AdminNavItem[] = [
	{ id: 'dashboard', label: 'Dashboard', section: 'overview', icon: 'grid' },
	{ id: 'users', label: 'Users', section: 'management', icon: 'users', badge: '3' },
	{ id: 'entries', label: 'Diary Entries', section: 'management', icon: 'book' },
	{
		id: 'personas',
		label: 'Personas',
		section: 'management',
		icon: 'persona',
		badge: '4',
		badgeTone: 'green'
	},
	{ id: 'ai-config', label: 'AI Config', section: 'configuration', icon: 'spark' },
	{ id: 'settings', label: 'Settings', section: 'configuration', icon: 'settings' }
];

export const adminStats: AdminStat[] = [
	{ label: 'Total Users', value: '847', delta: '▲ 12 hari ini', tone: 'blue', icon: '👤' },
	{ label: 'Total Entri', value: '4.2K', delta: '▲ 89 hari ini', tone: 'green', icon: '📖' },
	{ label: 'Persona Aktif', value: '3', delta: 'dari 4 total', tone: 'purple', icon: '🎭' },
	{ label: 'Perlu Perhatian', value: '3', delta: 'user terblokir', tone: 'red', icon: '⚠️' }
];

export const adminActivities: AdminActivity[] = [
	{ message: '<strong>rani@gmail.com</strong> mendaftar akun baru', accent: 'var(--success)', time: '2 menit lalu' },
	{ message: '<strong>budi_s</strong> menulis entri diary ke-47', accent: 'var(--accent)', time: '7 menit lalu' },
	{ message: 'Persona <strong>Reflector</strong> dipilih 23x dalam 1 jam', accent: 'var(--warn)', time: '12 menit lalu' },
	{ message: '<strong>user_xyz</strong> gagal login 5x berturut-turut', accent: 'var(--danger)', time: '18 menit lalu' },
	{ message: 'AI Config <strong>temperature</strong> diperbarui ke 0.7', accent: 'var(--success)', time: '25 menit lalu' }
];

export const adminMoodDistribution = [
	{ label: '😊 31%', tone: 'green' },
	{ label: '😐 28%', tone: 'warn' },
	{ label: '😢 18%', tone: 'red' },
	{ label: '😴 23%', tone: 'purple' }
] as const;

export const adminMoodDays: AdminMoodDay[] = [
	{ label: 'Sen', value: 80, tone: 'good' },
	{ label: 'Sel', value: 55, tone: 'meh' },
	{ label: 'Rab', value: 35, tone: 'sad' },
	{ label: 'Kam', value: 70, tone: 'good' },
	{ label: 'Jum', value: 45, tone: 'tired' },
	{ label: 'Sab', value: 90, tone: 'good' },
	{ label: 'Min', value: 60, tone: 'meh' }
];

export const adminPersonaUsage = [
	{ label: '🫂 Teman', value: 68, color: 'var(--accent)' },
	{ label: '🧠 Mentor', value: 20, color: 'var(--purple)' },
	{ label: '🪞 Reflect', value: 12, color: 'var(--success)' }
];

export const adminUsers: AdminUser[] = [
	{ id: 'usr_8a2f', name: 'Rani Pratiwi', email: 'rani@gmail.com', status: 'active', entries: 47, joined: '12 Mar 2025', lastActive: 'Baru saja', mood: '😊', color: '#38bdf8' },
	{ id: 'usr_3c1e', name: 'Budi Santoso', email: 'budi_s@mail.com', status: 'active', entries: 128, joined: '1 Jan 2025', lastActive: '2j lalu', mood: '😐', color: '#a78bfa' },
	{ id: 'usr_7b9d', name: 'Dewi Lestari', email: 'dewi@email.com', status: 'active', entries: 23, joined: '20 Mar 2025', lastActive: '5j lalu', mood: '😢', color: '#34d399' },
	{ id: 'usr_2a4f', name: 'Ahmad Fauzi', email: 'ahmad.f@mail.com', status: 'suspended', entries: 8, joined: '5 Feb 2025', lastActive: '2h lalu', mood: '😤', color: '#fbbf24' },
	{ id: 'usr_5k2m', name: 'Sari Dewi', email: 'sari@gmail.com', status: 'active', entries: 64, joined: '15 Feb 2025', lastActive: '1h lalu', mood: '😴', color: '#f43f5e' },
	{ id: 'usr_9p1q', name: 'Riko Firmansyah', email: 'riko@mail.id', status: 'suspended', entries: 3, joined: '28 Mar 2025', lastActive: '3h lalu', mood: '😐', color: '#38bdf8' }
];

export const adminEntries: AdminEntryRow[] = [
	{ id: '#e-4218', user: 'usr_8a2f', mood: '😐', persona: 'Teman', length: '342 chr', time: '22:14 · Hari ini', status: 'normal' },
	{ id: '#e-4217', user: 'usr_3c1e', mood: '😊', persona: 'Mentor', length: '521 chr', time: '21:50 · Hari ini', status: 'normal' },
	{ id: '#e-4216', user: 'usr_7b9d', mood: '😢', persona: 'Teman', length: '189 chr', time: '21:33 · Hari ini', status: 'review' },
	{ id: '#e-4215', user: 'usr_2a4f', mood: '😴', persona: 'Reflect', length: '78 chr', time: '21:10 · Hari ini', status: 'normal' }
];

export const adminPersonas: AdminPersona[] = [
	{
		id: 'friend',
		icon: '🫂',
		name: 'Teman Hangat',
		users: 578,
		description: 'Responsif, empatik, tidak menghakimi. Cocok untuk curhat sehari-hari.',
		tags: ['tone: santai', 'empati tinggi', 'default'],
		status: 'active',
		locked: true
	},
	{
		id: 'mentor',
		icon: '🧠',
		name: 'Mentor',
		users: 169,
		description: 'Analitis, berbasis insight, mendorong refleksi mendalam dan pertumbuhan.',
		tags: ['tone: logis', 'insight', 'structured'],
		status: 'active'
	},
	{
		id: 'reflector',
		icon: '🪞',
		name: 'Reflector',
		users: 100,
		description: 'Memantulkan kembali apa yang user ceritakan tanpa judgment dan tanpa saran.',
		tags: ['tone: netral', 'mirror', 'minimal'],
		status: 'active'
	},
	{
		id: 'night',
		icon: '🌙',
		name: 'Night Mode',
		users: 0,
		description: 'Versi lebih sunyi dan meditatif untuk malam hari. Masih dalam pengembangan.',
		tags: ['tone: pelan', 'malam', 'beta'],
		status: 'inactive'
	}
];

export const adminFeatureToggles: AdminFeatureToggle[] = [
	{ id: 'memory', title: 'Memory Hint', description: 'AI referensikan entri lama', enabled: true },
	{ id: 'mood-detection', title: 'Mood Detection', description: 'Auto-deteksi mood dari teks', enabled: true },
	{ id: 'adaptive-tone', title: 'Adaptive Tone', description: 'Tone menyesuaikan pola user', enabled: false },
	{ id: 'night-tone', title: 'Night Mode AI', description: 'Lebih pelan setelah jam 21', enabled: true }
];

export const mockPromptResponses = [
	'Kedengarannya berat ya. Mau cerita lebih lanjut? Aku di sini dan tidak ke mana-mana.',
	'Wajar kalau kamu merasa seperti itu. Perasaanmu valid sepenuhnya.',
	'Aku dengar kamu. Kadang hari memang seperti itu, dan itu oke.'
];
