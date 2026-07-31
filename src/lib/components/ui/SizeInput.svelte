<script lang="ts">
	/** Manual width × height entry with a cm/in unit toggle. */
	let {
		label = 'Size',
		width = $bindable(''),
		height = $bindable(''),
		unit = $bindable('cm')
	}: { label?: string; width?: string; height?: string; unit?: 'cm' | 'in' } = $props();

	function setUnit(u: 'cm' | 'in') {
		unit = u;
	}

	const fieldClass =
		'w-full min-w-0 rounded-lg border border-line/80 bg-surface/50 px-3 py-1.5 text-sm outline-none transition-all placeholder:text-ink-faint focus:border-brand-ring focus:ring-2 focus:ring-brand-ring/30 dark:border-surface/10 dark:bg-surface/[0.03] dark:placeholder:text-ink-muted [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';
</script>

<div>
	<p class="mb-1.5 text-xs font-medium text-ink-muted dark:text-ink-faint">{label}</p>
	<div class="flex items-center gap-2">
		<input
			type="number"
			min="0"
			inputmode="decimal"
			placeholder="W"
			aria-label="Width"
			bind:value={width}
			class={fieldClass}
		/>
		<span class="shrink-0 text-sm text-ink-faint">×</span>
		<input
			type="number"
			min="0"
			inputmode="decimal"
			placeholder="H"
			aria-label="Height"
			bind:value={height}
			class={fieldClass}
		/>

		<!-- Unit toggle -->
		<div
			class="flex shrink-0 rounded-lg border border-line/80 p-0.5 dark:border-surface/10"
			role="group"
			aria-label="Unit"
		>
			{#each ['cm', 'in'] as const as u}
				<button
					type="button"
					onclick={() => setUnit(u)}
					aria-pressed={unit === u}
					class="rounded-md px-2.5 py-1 text-xs font-medium transition-all {unit === u
						? 'bg-gradient-to-r from-brand to-brand-accent text-surface shadow shadow-brand-soft/30'
						: 'text-ink-body hover:text-ink-strong dark:text-ink-dim'}"
				>
					{u}
				</button>
			{/each}
		</div>
	</div>
</div>
