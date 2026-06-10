import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin, SUBMISSIONS_BUCKET } from '$lib/server/supabase';
import {
	sendOrderNotification,
	sendCustomerConfirmation,
	type EmailAttachment
} from '$lib/server/email';
import { verifySession, verifyTurnstile, MIN_SUBMIT_MS } from '$lib/server/security';
import { MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from '$lib/constants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(error: string, status = 400) {
	return json({ ok: false, error }, { status });
}

/** Pretend success so bots get no signal to adapt. */
function decoy() {
	return json({ ok: true, id: null });
}

function isValidUrl(value: string): boolean {
	try {
		const u = new URL(value);
		return u.protocol === 'http:' || u.protocol === 'https:';
	} catch {
		return false;
	}
}

/** Strip directory parts and unsafe characters from an uploaded filename. */
function safeFilename(name: string): string {
	const base = name.split(/[/\\]/).pop() || 'artwork';
	return base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100) || 'artwork';
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return fail('Expected multipart/form-data.');
	}

	// --- Anti-spam (cheap, silent checks first) -----------------------------
	// Honeypot: a hidden field only bots fill.
	if (String(form.get('company') ?? '').trim() !== '') {
		console.warn('[submissions] decoy: honeypot filled');
		return decoy();
	}

	// Timing: reject implausibly fast submits (and forged/missing tokens).
	const session = verifySession(String(form.get('formToken') ?? ''));
	if (!session.ok) {
		console.warn('[submissions] decoy: invalid/missing timing token (likely a key mismatch across deploys, or no token sent)');
		return decoy();
	}
	if (session.ageMs < MIN_SUBMIT_MS) {
		console.warn(`[submissions] decoy: submitted too fast (${session.ageMs}ms < ${MIN_SUBMIT_MS}ms)`);
		return decoy();
	}

	// Turnstile: real CAPTCHA gate. A failure can be a real user, so it's visible.
	const turnstileOk = await verifyTurnstile(
		String(form.get('turnstileToken') ?? ''),
		getClientAddress()
	);
	if (!turnstileOk) return fail('Verification failed. Please try again.', 403);

	const name = String(form.get('name') ?? '').trim();
	const email = String(form.get('email') ?? '').trim();
	const title = String(form.get('title') ?? '').trim();
	const description = String(form.get('description') ?? '').trim();
	const size = String(form.get('size') ?? '').trim();
	const medium = String(form.get('medium') ?? '').trim();
	const artworkLink = String(form.get('artworkLink') ?? '').trim();
	const image = form.get('image');

	// --- Validation ---------------------------------------------------------
	if (name.length < 2) return fail('Please provide your name.');
	if (!EMAIL_RE.test(email)) return fail('Please provide a valid email.');
	if (!title) return fail('Please give your piece a title.');
	if (!description) return fail('Please describe your piece.');

	const hasImage = image instanceof File && image.size > 0;
	const hasLink = artworkLink.length > 0;

	if (!hasImage && !hasLink) return fail('Attach an image or paste a link to your artwork.');

	if (hasImage) {
		if (!image.type.startsWith('image/')) return fail('The uploaded file must be an image.');
		if (image.size > MAX_IMAGE_BYTES) return fail(`Image is too large (max ${MAX_IMAGE_LABEL}).`);
	} else if (!isValidUrl(artworkLink)) {
		return fail('The artwork link must be a valid http(s) URL.');
	}

	const imageKind: 'upload' | 'link' = hasImage ? 'upload' : 'link';

	// --- Persist ------------------------------------------------------------
	let supabase;
	try {
		supabase = getSupabaseAdmin();
	} catch (err) {
		console.error(err);
		return fail('Server is not configured to accept orders yet.', 500);
	}

	// Insert first to get a stable id for the storage path.
	const { data: inserted, error: insertError } = await supabase
		.from('submissions')
		.insert({ name, email, title, description, size, medium, image_kind: imageKind })
		.select('id')
		.single();

	if (insertError || !inserted) {
		console.error('Insert failed:', insertError);
		return fail('Could not save your order. Please try again.', 500);
	}

	const id: string = inserted.id;
	let imageUrl = artworkLink;
	let attachment: EmailAttachment | undefined;

	if (hasImage) {
		const filename = safeFilename(image.name);
		const path = `${id}/${filename}`;
		const buffer = Buffer.from(await image.arrayBuffer());

		const { error: uploadError } = await supabase.storage
			.from(SUBMISSIONS_BUCKET)
			.upload(path, buffer, { contentType: image.type, upsert: false });

		if (uploadError) {
			console.error('Upload failed:', uploadError);
			return fail('Could not upload your image. Please try again.', 500);
		}

		imageUrl = supabase.storage.from(SUBMISSIONS_BUCKET).getPublicUrl(path).data.publicUrl;
		attachment = { filename, content: buffer };

		const { error: updateError } = await supabase
			.from('submissions')
			.update({ image_url: imageUrl, image_name: filename })
			.eq('id', id);
		if (updateError) console.error('Row image_url update failed (non-fatal):', updateError);
	} else {
		const { error: updateError } = await supabase
			.from('submissions')
			.update({ image_url: imageUrl })
			.eq('id', id);
		if (updateError) console.error('Row link update failed (non-fatal):', updateError);
	}

	// --- Notify (best-effort; order is already saved) -----------------------
	const order = { name, email, title, description, size, medium, imageKind, imageUrl };
	const [team, customer] = await Promise.all([
		sendOrderNotification(order, attachment),
		sendCustomerConfirmation(order, attachment)
	]);
	if (!team.ok) console.error('Team notification not sent:', team.error);
	if (!customer.ok) console.error('Customer confirmation not sent:', customer.error);

	console.log(`[submissions] saved ${id} (${imageKind}); email team=${team.ok} customer=${customer.ok}`);
	return json({ ok: true, id });
};
