import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

export type OrderEmail = {
	name: string;
	email: string;
	title: string;
	description: string;
	size: string;
	medium: string;
	imageKind: 'upload' | 'link';
	/** Storage public URL (upload) or the external link the user pasted (link). */
	imageUrl: string;
};

export type EmailAttachment = { filename: string; content: Buffer };

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function row(label: string, valueHtml: string): string {
	return `<tr>
		<td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;vertical-align:top;white-space:nowrap">${label}</td>
		<td style="padding:6px 0;color:#0f172a;font-size:14px">${valueHtml}</td>
	</tr>`;
}

/** The order-details table, shared by both the team and customer emails. */
function detailsTable(order: OrderEmail): string {
	const safe = {
		name: escapeHtml(order.name),
		email: escapeHtml(order.email),
		title: escapeHtml(order.title || '—'),
		description: escapeHtml(order.description || '—'),
		size: escapeHtml(order.size || '—'),
		medium: escapeHtml(order.medium || '—'),
		imageUrl: escapeHtml(order.imageUrl)
	};

	const artwork =
		order.imageKind === 'link'
			? row('Artwork', `<a href="${safe.imageUrl}" style="color:#0b8a3f">${safe.imageUrl}</a> (external link)`)
			: row(
					'Artwork',
					`<a href="${safe.imageUrl}" style="color:#0b8a3f">${safe.imageUrl}</a> (also attached)<br>
					 <img src="${safe.imageUrl}" alt="artwork" style="margin-top:8px;max-width:100%;border-radius:8px" />`
				);

	return `<table style="border-collapse:collapse;width:100%">
		${row('Title', `<strong>${safe.title}</strong>`)}
		${row('Name', safe.name)}
		${row('Email', `<a href="mailto:${safe.email}" style="color:#0b8a3f">${safe.email}</a>`)}
		${row('Description', safe.description)}
		${row('Size', safe.size)}
		${row('Medium', safe.medium)}
		${artwork}
	</table>`;
}

/** Wrap the details table with a heading + intro line (the part that differs). */
function buildHtml(order: OrderEmail, heading: string, intro: string): string {
	return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto">
		<h2 style="font-size:18px;color:#0f172a;margin:0 0 4px">${escapeHtml(heading)}</h2>
		<p style="color:#64748b;font-size:13px;margin:0 0 16px">${escapeHtml(intro)}</p>
		${detailsTable(order)}
	</div>`;
}

type SendArgs = {
	to: string;
	replyTo: string;
	subject: string;
	html: string;
	attachment?: EmailAttachment;
};

/**
 * Low-level Resend send. Returns `{ ok }` rather than throwing: the order row is
 * already persisted by the time we get here, so a mail failure must not fail the
 * whole request — it's logged and surfaced to the caller, which still reports
 * success to the user.
 */
async function send({ to, replyTo, subject, html, attachment }: SendArgs): Promise<{ ok: boolean; error?: string }> {
	const apiKey = env.RESEND_API_KEY;
	const from = env.ORDER_FROM_EMAIL;

	if (!apiKey || !from || !to) {
		const error = 'Email is not configured: set RESEND_API_KEY and ORDER_FROM_EMAIL.';
		console.error(error);
		return { ok: false, error };
	}

	try {
		const resend = new Resend(apiKey);
		const { error } = await resend.emails.send({
			from,
			to,
			replyTo,
			subject,
			html,
			attachments: attachment ? [{ filename: attachment.filename, content: attachment.content }] : undefined
		});

		if (error) {
			console.error('Resend send failed:', error);
			return { ok: false, error: error.message };
		}
		return { ok: true };
	} catch (err) {
		console.error('Resend threw:', err);
		return { ok: false, error: 'Email send failed.' };
	}
}

/** Internal notification to the team that a new order came in. */
export function sendOrderNotification(order: OrderEmail, attachment?: EmailAttachment) {
	const to = env.ORDER_NOTIFICATION_EMAIL;
	if (!to) {
		console.error('ORDER_NOTIFICATION_EMAIL is not set.');
		return Promise.resolve({ ok: false, error: 'ORDER_NOTIFICATION_EMAIL is not set.' });
	}
	const heading = order.title ? `New commission: ${order.title}` : `New commission from ${order.name}`;
	return send({
		to,
		replyTo: order.email, // replies go to the customer
		subject: heading,
		html: buildHtml(order, heading, `A new order was submitted on Matr by ${order.name}.`),
		attachment
	});
}

/** Confirmation copy sent to the customer for their own records. */
export function sendCustomerConfirmation(order: OrderEmail, attachment?: EmailAttachment) {
	const firstName = order.name.split(' ')[0] || 'there';
	return send({
		to: order.email,
		replyTo: env.ORDER_NOTIFICATION_EMAIL || env.ORDER_FROM_EMAIL || order.email, // replies reach the team
		subject: 'We received your commission request',
		html: buildHtml(
			order,
			`Thanks, ${firstName}!`,
			"We've received your commission request and will be in touch soon. Here's a copy for your records."
		),
		attachment
	});
}
