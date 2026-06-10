<script lang="ts">
	import Logo from './ui/Logo.svelte';

	let { title, subtitle }: { title: string; subtitle?: string } = $props();
</script>

<div class="flex items-center gap-3">
	<Logo class="h-9 w-auto text-ink dark:text-surface" />
	<div class="leading-tight">
		<p class="text-sm font-semibold">{title}</p>
		{#if subtitle}
			<p class="text-xs text-ink-muted dark:text-ink-faint">{subtitle}</p>
		{/if}
	</div>
</div>
