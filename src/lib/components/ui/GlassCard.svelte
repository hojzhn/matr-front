<script lang="ts">
	import type { Snippet } from 'svelte';

	let { class: cls = '', children }: { class?: string; children: Snippet } = $props();
</script>

<div
	class="relative overflow-hidden rounded-3xl border border-surface/40 bg-surface/60 shadow-2xl shadow-ink/10 backdrop-blur-2xl dark:border-surface/10 dark:bg-surface/[0.04] dark:shadow-shade/40 {cls}"
>
	<!-- top accent line -->
	<div
		class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-surface/70 to-transparent dark:via-surface/20"
	></div>
	{@render children()}
</div>
