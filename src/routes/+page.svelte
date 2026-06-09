<script lang="ts">
	import { fly, fade, scale } from 'svelte/transition';
	import { quintOut, backOut } from 'svelte/easing';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	const MEDIUMS = [
		'Oil',
		'Acrylic',
		'Watercolor',
		'Digital',
		'Photography',
		'Mixed Media'
	];
	const SIZES = ['Small', 'Medium', 'Large', 'X-Large'];

	let step = $state(1);
	let direction = $state(1); // 1 = forward, -1 = back (drives transition direction)
	let submitting = $state(false);
	let done = $state(false);

	// Step 1
	let name = $state('');
	let email = $state('');

	// Step 2
	let imageFile = $state<File | null>(null);
	let imagePreview = $state<string | null>(null);
	let dragOver = $state(false);
	let description = $state('');
	let size = $state('');
	let medium = $state('');

	const emailOk = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
	const step1Valid = $derived(name.trim().length > 1 && emailOk);
	const step2Valid = $derived(!!imagePreview && description.trim().length > 0 && !!size && !!medium);

	function handleFile(file: File | undefined | null) {
		if (!file || !file.type.startsWith('image/')) return;
		imageFile = file;
		const reader = new FileReader();
		reader.onload = (e) => (imagePreview = e.target?.result as string);
		reader.readAsDataURL(file);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		handleFile(e.dataTransfer?.files?.[0]);
	}

	function onPick(e: Event) {
		handleFile((e.target as HTMLInputElement).files?.[0]);
	}

	function clearImage() {
		imageFile = null;
		imagePreview = null;
	}

	function next() {
		if (!step1Valid) return;
		direction = 1;
		step = 2;
	}

	function back() {
		direction = -1;
		step = 1;
	}

	async function submit() {
		if (!step2Valid) return;
		submitting = true;

		// TODO(supabase): persist to the `users` / `submissions` tables here.
		// const { error } = await supabase.from('submissions').insert({
		//   name, email, description, size, medium, image: imageFile
		// });
		await new Promise((r) => setTimeout(r, 1100)); // simulate request

		submitting = false;
		done = true;
	}
</script>

<svelte:head>
	<title>Matr Labs</title>
</svelte:head>

<!-- Backdrop -->
<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-fill-soft via-surface to-fill text-ink transition-colors duration-500 dark:from-canvas-from dark:via-canvas-via dark:to-canvas-to dark:text-fill"
>
	<!-- Animated color blobs -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="animate-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-glow-violet/40 blur-3xl dark:bg-glow-violet/20"
		></div>
		<div
			class="animate-blob absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-glow-sky/40 blur-3xl [animation-delay:-6s] dark:bg-glow-sky/20"
		></div>
		<div
			class="animate-blob absolute left-1/3 top-1/2 h-80 w-80 rounded-full bg-glow-fuchsia/30 blur-3xl [animation-delay:-12s] dark:bg-glow-fuchsia/15"
		></div>
	</div>

	<main class="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
		<div
			in:scale={{ duration: 600, start: 0.96, opacity: 0, easing: quintOut }}
			class="w-full max-w-md"
		>
			<!-- Glass card -->
			<div
				class="relative overflow-hidden rounded-3xl border border-surface/40 bg-surface/60 shadow-2xl shadow-ink/10 backdrop-blur-2xl dark:border-surface/10 dark:bg-surface/[0.04] dark:shadow-shade/40"
			>
				<!-- top accent line -->
				<div
					class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-surface/70 to-transparent dark:via-surface/20"
				></div>

				<!-- Header -->
				<header class="flex items-center justify-between gap-3 px-6 pt-6">
					<div class="flex items-center gap-3">
						<div
							class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-soft to-brand-accent text-surface shadow-lg shadow-brand-soft/30"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="h-5 w-5"
							>
								<path
									d="M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1z"
								/>
							</svg>
						</div>
						<div class="leading-tight">
							<p class="text-sm font-semibold">Commission Artwork</p>
							<p class="text-xs text-ink-muted dark:text-ink-faint">Let's set up your space</p>
						</div>
					</div>
					<ThemeToggle />
				</header>

				<!-- Progress -->
				<div class="flex items-center gap-2 px-6 pt-5">
					{#each [1, 2] as s}
						<div
							class="h-1 flex-1 overflow-hidden rounded-full bg-line/70 dark:bg-surface/10"
						>
							<div
								class="h-full rounded-full bg-gradient-to-r from-brand-soft to-brand-accent transition-all duration-500 ease-out"
								style="width: {step >= s ? '100%' : '0%'}"
							></div>
						</div>
					{/each}
				</div>

				<!-- Body -->
				<div class="relative px-6 pb-6 pt-5">
					{#if done}
						<div
							in:scale={{ duration: 500, start: 0.8, easing: backOut }}
							class="flex flex-col items-center py-10 text-center"
						>
							<div
								class="mb-5 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-success to-success-deep text-surface shadow-lg shadow-success/30"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="h-7 w-7"
								>
									<path d="M20 6L9 17l-5-5" />
								</svg>
							</div>
							<h2 class="text-xl font-semibold">You're all set, {name.split(' ')[0]}</h2>
							<p class="mt-1.5 max-w-xs text-sm text-ink-muted dark:text-ink-faint">
								Your piece is in. We'll reach out at <span class="font-medium text-ink-strong dark:text-ink-dim">{email}</span>.
							</p>
						</div>
					{:else}
						{#key step}
							<div
								in:fly={{ x: 24 * direction, duration: 350, easing: quintOut, delay: 120 }}
								out:fly={{ x: -24 * direction, duration: 200, easing: quintOut }}
							>
								{#if step === 1}
									<!-- STEP 1 -->
									<h1 class="text-lg font-semibold tracking-tight">Welcome 👋</h1>
									<p class="mt-1 text-sm text-ink-muted dark:text-ink-faint">
										Tell us who you are to get started.
									</p>

									<div class="mt-6 space-y-4">
										<label class="block">
											<span class="mb-1.5 block text-xs font-medium text-ink-muted dark:text-ink-faint">Name</span>
											<input
												bind:value={name}
												type="text"
												placeholder="Ada Lovelace"
												class="w-full rounded-xl border border-line/80 bg-surface/70 px-4 py-3 text-sm outline-none transition-all placeholder:text-ink-faint focus:border-brand-ring focus:ring-2 focus:ring-brand-ring/30 dark:border-surface/10 dark:bg-surface/[0.03] dark:placeholder:text-ink-muted"
											/>
										</label>
										<label class="block">
											<span class="mb-1.5 block text-xs font-medium text-ink-muted dark:text-ink-faint">Email</span>
											<input
												bind:value={email}
												type="email"
												placeholder="ada@example.com"
												class="w-full rounded-xl border border-line/80 bg-surface/70 px-4 py-3 text-sm outline-none transition-all placeholder:text-ink-faint focus:border-brand-ring focus:ring-2 focus:ring-brand-ring/30 dark:border-surface/10 dark:bg-surface/[0.03] dark:placeholder:text-ink-muted"
											/>
											{#if email && !emailOk}
												<span transition:fade class="mt-1 block text-xs text-danger">Enter a valid email</span>
											{/if}
										</label>
									</div>

									<button
										type="button"
										onclick={next}
										disabled={!step1Valid}
										class="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-accent px-4 py-3 text-sm font-semibold text-surface shadow-lg shadow-brand-soft/25 transition-all hover:shadow-brand-soft/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none enabled:hover:-translate-y-0.5 enabled:active:translate-y-0"
									>
										Continue
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 transition-transform group-enabled:group-hover:translate-x-0.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
									</button>
								{:else}
									<!-- STEP 2 — AI composer aesthetic -->
									<h1 class="text-lg font-semibold tracking-tight">Add your piece</h1>
									<p class="mt-1 text-sm text-ink-muted dark:text-ink-faint">
										Upload an image and describe it.
									</p>

									<!-- Composer -->
									<div
										class="mt-5 rounded-2xl border border-line/80 bg-surface/70 p-2 transition-all focus-within:border-brand-ring focus-within:ring-2 focus-within:ring-brand-ring/30 dark:border-surface/10 dark:bg-surface/[0.03]"
									>
										<!-- Image dropzone / preview -->
										{#if imagePreview}
											<div in:scale={{ duration: 300, start: 0.95, easing: quintOut }} class="relative">
												<img src={imagePreview} alt="preview" class="h-44 w-full rounded-xl object-cover" />
												<button
													type="button"
													onclick={clearImage}
													aria-label="Remove image"
													class="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-shade/50 text-surface backdrop-blur-md transition hover:bg-shade/70"
												>
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
												</button>
											</div>
										{:else}
											<label
												ondragover={(e) => {
													e.preventDefault();
													dragOver = true;
												}}
												ondragleave={() => (dragOver = false)}
												ondrop={onDrop}
												class="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center transition-all {dragOver
													? 'border-brand-ring bg-brand-ring/10 dark:bg-brand-soft/10'
													: 'border-ink-dim/80 dark:border-surface/15'}"
											>
												<input type="file" accept="image/*" class="hidden" onchange={onPick} />
												<div class="grid h-10 w-10 place-items-center rounded-full bg-fill text-ink-muted dark:bg-surface/10 dark:text-ink-dim">
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
												</div>
												<p class="text-sm font-medium">Drop an image or <span class="text-brand dark:text-brand-ring">browse</span></p>
												<p class="text-xs text-ink-faint">PNG, JPG up to 10MB</p>
											</label>
										{/if}

										<!-- Description -->
										<textarea
											bind:value={description}
											rows="2"
											placeholder="Describe your piece…"
											class="thin-scroll mt-2 w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-ink-faint dark:placeholder:text-ink-muted"
										></textarea>

										<!-- Meta chips -->
										<div class="space-y-2.5 px-1 pb-1">
											<div>
												<p class="mb-1.5 text-xs font-medium text-ink-muted dark:text-ink-faint">Size</p>
												<div class="flex flex-wrap gap-1.5">
													{#each SIZES as s}
														<button
															type="button"
															onclick={() => (size = s)}
															class="rounded-full border px-3 py-1 text-xs font-medium transition-all {size === s
																? 'border-transparent bg-gradient-to-r from-brand to-brand-accent text-surface shadow shadow-brand-soft/30'
																: 'border-line/80 bg-surface/50 text-ink-body hover:border-brand-edge dark:border-surface/10 dark:bg-surface/[0.03] dark:text-ink-dim'}"
														>
															{s}
														</button>
													{/each}
												</div>
											</div>
											<div>
												<p class="mb-1.5 text-xs font-medium text-ink-muted dark:text-ink-faint">Medium</p>
												<div class="flex flex-wrap gap-1.5">
													{#each MEDIUMS as m}
														<button
															type="button"
															onclick={() => (medium = m)}
															class="rounded-full border px-3 py-1 text-xs font-medium transition-all {medium === m
																? 'border-transparent bg-gradient-to-r from-brand to-brand-accent text-surface shadow shadow-brand-soft/30'
																: 'border-line/80 bg-surface/50 text-ink-body hover:border-brand-edge dark:border-surface/10 dark:bg-surface/[0.03] dark:text-ink-dim'}"
														>
															{m}
														</button>
													{/each}
												</div>
											</div>
										</div>
									</div>

									<!-- Actions -->
									<div class="mt-5 flex gap-3">
										<button
											type="button"
											onclick={back}
											class="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line/80 bg-surface/60 text-ink-body transition hover:bg-surface dark:border-surface/10 dark:bg-surface/[0.03] dark:text-ink-dim dark:hover:bg-surface/[0.07]"
											aria-label="Back"
										>
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M19 12H5M11 19l-7-7 7-7" /></svg>
										</button>
										<button
											type="button"
											onclick={submit}
											disabled={!step2Valid || submitting}
											class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-accent px-4 py-3 text-sm font-semibold text-surface shadow-lg shadow-brand-soft/25 transition-all hover:shadow-brand-soft/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none enabled:hover:-translate-y-0.5"
										>
											{#if submitting}
												<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" /></svg>
												Submitting…
											{:else}
												Submit
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
											{/if}
										</button>
									</div>
								{/if}
							</div>
						{/key}
					{/if}
				</div>
			</div>

			<p class="mt-4 text-center text-xs text-ink-faint dark:text-ink-muted">
				Step {step} of 2 · Your details stay private
			</p>
		</div>
	</main>
</div>
