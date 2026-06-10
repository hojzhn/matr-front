<script lang="ts">
	let { current, total }: { current: number; total: number } = $props();
</script>

<div class="flex items-center gap-2">
	{#each Array(total), i}
		<div class="h-1 flex-1 overflow-hidden rounded-full bg-line/70 dark:bg-surface/10">
			<div
				class="h-full rounded-full bg-brand-soft transition-all duration-500 ease-out"
				style="width: {current >= i + 1 ? '100%' : '0%'}"
			></div>
		</div>
	{/each}
</div>
