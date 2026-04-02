export type DevMode = 'user' | 'admin';

export type AdminView =
	| 'dashboard'
	| 'users'
	| 'entries'
	| 'personas'
	| 'ai-config'
	| 'settings';

export interface AdminNavItem {
	id: AdminView;
	label: string;
	section: 'overview' | 'management' | 'configuration';
	badge?: string;
	badgeTone?: 'default' | 'green';
	icon: 'grid' | 'users' | 'book' | 'persona' | 'spark' | 'settings';
}

export interface AdminUser {
	id: string;
	name: string;
	email: string;
	status: 'active' | 'suspended';
	role?: 'user' | 'admin' | 'super_admin';
	entries: number;
	joined: string;
	lastActive: string;
	mood: string;
	color: string;
}

export interface AdminStat {
	label: string;
	value: string;
	delta: string;
	tone: 'blue' | 'green' | 'purple' | 'red';
	icon: string;
}

export interface AdminActivity {
	message: string;
	accent: string;
	time: string;
}

export interface AdminMoodDay {
	label: string;
	value: number;
	tone: 'good' | 'meh' | 'sad' | 'tired';
}

export interface AdminPersona {
	id: string;
	slug?: string;
	icon: string;
	name: string;
	users: number;
	description: string;
	tags: string[];
	status: 'active' | 'inactive';
	locked?: boolean;
	promptOverride?: string;
	tone?: string;
	toneModifier?: number;
}

export interface AdminEntryRow {
	id: string;
	user: string;
	mood: string;
	persona: string;
	length: string;
	time: string;
	status: 'normal' | 'review';
}

export interface AdminToast {
	id: string;
	message: string;
	tone: 'blue' | 'green' | 'red' | 'warn';
}

export interface AdminFeatureToggle {
	id: string;
	title: string;
	description: string;
	enabled: boolean;
}

export interface AppSettings {
	appName: string;
	tagline: string;
	systemPrompt: string;
	temperature: number;
	maxResponseLength: number;
	responseDelayMs: number;
	rateLimitPerHour: number;
	memoryHint: boolean;
	moodDetection: boolean;
	adaptiveTone: boolean;
	nightModeAi: boolean;
	maintenanceMode: boolean;
}
