<script lang="ts">
	import { onMount } from 'svelte';

	let {
		siteKey,
		token = $bindable(''),
		theme = 'auto'
	}: { siteKey: string; token?: string; theme?: 'auto' | 'light' | 'dark' } = $props();

	let el: HTMLDivElement;
	let widgetId: string | undefined;

	/** Reset the widget so a fresh, single-use token is issued (call after submit). */
	export function reset() {
		const ts = (window as unknown as { turnstile?: any }).turnstile;
		if (widgetId && ts) ts.reset(widgetId);
		token = '';
	}

	function ensureScript(): Promise<void> {
		return new Promise((resolve, reject) => {
			if ((window as unknown as { turnstile?: any }).turnstile) return resolve();
			const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
			if (existing) {
				existing.addEventListener('load', () => resolve());
				existing.addEventListener('error', () => reject());
				return;
			}
			const s = document.createElement('script');
			s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			s.async = true;
			s.defer = true;
			s.dataset.turnstile = 'true';
			s.onload = () => resolve();
			s.onerror = () => reject();
			document.head.appendChild(s);
		});
	}

	onMount(() => {
		let removed = false;
		ensureScript()
			.then(() => {
				if (removed) return;
				const ts = (window as unknown as { turnstile?: any }).turnstile;
				widgetId = ts.render(el, {
					sitekey: siteKey,
					theme,
					callback: (t: string) => (token = t),
					'expired-callback': () => (token = ''),
					'error-callback': () => (token = '')
				});
			})
			.catch(() => {});
		return () => {
			removed = true;
			const ts = (window as unknown as { turnstile?: any }).turnstile;
			if (widgetId && ts) ts.remove(widgetId);
		};
	});
</script>

<div bind:this={el}></div>
