<script lang="ts">
	let {
		label,
		options,
		value = $bindable('')
	}: { label: string; options: readonly string[]; value?: string } = $props();
</script>

<div>
	<p class="mb-1.5 text-xs font-medium text-ink-muted dark:text-ink-faint">{label}</p>
	<div class="flex flex-wrap gap-1.5">
		{#each options as opt}
			<button
				type="button"
				onclick={() => (value = opt)}
				class="rounded-full border px-3 py-1 text-xs font-medium transition-all {value === opt
					? 'border-transparent bg-gradient-to-r from-brand to-brand-accent text-surface shadow shadow-brand-soft/30'
					: 'border-line/80 bg-surface/50 text-ink-body hover:border-brand-edge dark:border-surface/10 dark:bg-surface/[0.03] dark:text-ink-dim'}"
			>
				{opt}
			</button>
		{/each}
	</div>
</div>
