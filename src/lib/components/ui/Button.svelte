<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		onclick,
		disabled = false,
		loading = false,
		type = 'button',
		class: cls = 'w-full',
		children
	}: {
		onclick?: (e: MouseEvent) => void;
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		children: Snippet;
	} = $props();
</script>

<button
	{type}
	{onclick}
	disabled={disabled || loading}
	class="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-accent px-4 py-3 text-sm font-semibold text-surface shadow-lg shadow-brand-soft/25 transition-all hover:shadow-brand-soft/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none enabled:hover:-translate-y-0.5 enabled:active:translate-y-0 {cls}"
>
	{@render children()}
</button>
