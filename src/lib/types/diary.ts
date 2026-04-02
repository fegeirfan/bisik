export type AppView = 'home' | 'write' | 'chat' | 'timeline';

export type PersonaId = 'friend' | 'mentor' | 'reflector' | 'night' | 'custom';

export type MoodValue = 'happy' | 'neutral' | 'sad' | 'tired' | 'frustrated';

export interface PersonaOption {
	id: string;
	slug: PersonaId | string;
	name: string;
	icon: string;
	description: string;
	tags?: string[];
}

export interface MoodOption {
	value: MoodValue;
	emoji: string;
	label: string;
	color: string;
	energy: number;
	defaultTag?: string;
}

export interface DiaryEntry {
	id: string;
	title?: string;
	content: string;
	mood: MoodValue;
	tag?: string;
	insight: string;
	createdAt: string;
	personaId?: string;
	refinedJournal?: RefinedJournal;
}

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: string;
	mood?: MoodValue;
}

export interface RefinedJournal {
	id: string;
	diaryEntryId: string;
	title?: string;
	content: string;
	summary?: string;
	createdAt: string;
}
