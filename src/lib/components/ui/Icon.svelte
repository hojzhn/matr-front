<script lang="ts" module>
	export type IconName =
		| 'sparkle'
		| 'check'
		| 'arrow-right'
		| 'arrow-left'
		| 'close'
		| 'upload'
		| 'send'
		| 'link'
		| 'sun'
		| 'moon';

	type IconDef = { body: string; fill?: boolean; strokeWidth?: number };

	/** Single source of truth for the app's inline SVG icons (24×24 viewBox). */
	const ICONS: Record<IconName, IconDef> = {
		sparkle: {
			fill: true,
			body: '<path d="M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1z" />'
		},
		check: { strokeWidth: 3, body: '<path d="M20 6L9 17l-5-5" />' },
		'arrow-right': { strokeWidth: 2.5, body: '<path d="M5 12h14M13 5l7 7-7 7" />' },
		'arrow-left': { strokeWidth: 2.5, body: '<path d="M19 12H5M11 19l-7-7 7-7" />' },
		close: { strokeWidth: 2.5, body: '<path d="M18 6L6 18M6 6l12 12" />' },
		upload: { body: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />' },
		send: { strokeWidth: 2.5, body: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />' },
		link: {
			body: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />'
		},
		sun: {
			body: '<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />'
		},
		moon: { body: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />' }
	};
</script>

<script lang="ts">
	let {
		name,
		class: cls = 'h-5 w-5',
		strokeWidth
	}: { name: IconName; class?: string; strokeWidth?: number } = $props();

	const def = $derived(ICONS[name]);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill={def.fill ? 'currentColor' : 'none'}
	stroke={def.fill ? 'none' : 'currentColor'}
	stroke-width={strokeWidth ?? def.strokeWidth ?? 2}
	stroke-linecap="round"
	stroke-linejoin="round"
	class={cls}
>
	{@html def.body}
</svg>
