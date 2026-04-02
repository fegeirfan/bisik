<script lang="ts">
	import { tick } from 'svelte';
	import type { ChatMessage, MoodOption, MoodValue, PersonaOption } from '$lib/types/diary';
	import { formatFullDate, formatTime, getMoodMeta } from '$lib/utils/diary';
	import Icons from '$lib/components/icons/Icons.svelte';

	let {
		messages,
		persona,
		selectedMood,
		typing,
		input,
		onInput,
		onSend
	} = $props<{
		messages: ChatMessage[];
		persona: PersonaOption;
		selectedMood?: MoodValue;
		typing: boolean;
		input: string;
		onInput: (value: string) => void;
		onSend: () => void;
	}>();

	let chatContainer: HTMLDivElement | undefined;
	let textarea: HTMLTextAreaElement | undefined;

	$effect(() => {
		messages.length;
		typing;
		void tick().then(() => {
			chatContainer?.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
		});
	});

	function resizeInput() {
		if (!textarea) return;
		textarea.style.height = 'auto';
		textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
	}

	$effect(() => {
		input;
		void tick().then(resizeInput);
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onSend();
		}
	}
</script>

<section class="page page-chat active">
	<div class="chat-container" bind:this={chatContainer}>
		<div class="chat-date-divider">Hari ini · {formatFullDate(new Date().toISOString())}</div>

		{#each messages as message}
			<div class:msg-user={message.role === 'user'} class="msg">
				<div class:user={message.role === 'user'} class:ai={message.role === 'assistant'} class="msg-avatar">
					{#if message.role === 'user'}
						K
					{:else}
						{persona.icon}
					{/if}
				</div>

				<div class:align-right={message.role === 'user'} class="msg-stack">
					<div class:user={message.role === 'user'} class:ai={message.role === 'assistant'} class="msg-bubble">
						{message.content}
					</div>
					<div class:user={message.role === 'user'} class="msg-meta">
						<span>{formatTime(message.timestamp)}</span>
						{#if message.mood}
							<span>· {getMoodMeta(message.mood).emoji}</span>
						{:else if message.role === 'assistant'}
							<span>· bisik</span>
						{/if}
					</div>
				</div>
			</div>
		{/each}

		{#if typing}
			<div class="typing-indicator">
				<div class="msg-avatar ai">{persona.icon}</div>
				<div class="typing-dots">
					<div class="dot"></div>
					<div class="dot"></div>
					<div class="dot"></div>
				</div>
			</div>
		{/if}
	</div>

	<div class="chat-input-bar">
		<div class="chat-input-inner">
			<div class="chat-input-wrap">
				<textarea
					bind:this={textarea}
					class="chat-input"
					placeholder={selectedMood ? `Lanjut cerita soal rasa ${getMoodMeta(selectedMood).label.toLowerCase()} ini...` : 'Ceritakan lebih lanjut...'}
					rows="1"
					value={input}
					oninput={(event) => onInput((event.currentTarget as HTMLTextAreaElement).value)}
					onkeydown={handleKeydown}
				></textarea>
			</div>

			<button class="send-btn" type="button" onclick={onSend}>
				<Icons name="send" size={16} />
			</button>
		</div>
	</div>
</section>
