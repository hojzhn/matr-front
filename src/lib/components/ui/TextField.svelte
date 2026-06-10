<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		label,
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		error = ''
	}: {
		label: string;
		value?: string;
		type?: 'text' | 'email' | 'password' | 'url' | 'tel';
		placeholder?: string;
		error?: string;
	} = $props();
</script>

<label class="block">
	<span class="mb-1.5 block text-xs font-medium text-ink-muted dark:text-ink-faint">{label}</span>
	<input
		{type}
		{placeholder}
		{value}
		oninput={(e) => (value = e.currentTarget.value)}
		class="w-full rounded-xl border border-line/80 bg-surface/70 px-4 py-3 text-sm outline-none transition-all placeholder:text-ink-faint focus:border-brand-ring focus:ring-2 focus:ring-brand-ring/30 dark:border-surface/10 dark:bg-surface/[0.03] dark:placeholder:text-ink-muted"
	/>
	{#if error}
		<span transition:fade class="mt-1 block text-xs text-danger">{error}</span>
	{/if}
</label>
