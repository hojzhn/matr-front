import type { PageServerLoad } from './$types';
import { signSession } from '$lib/server/security';

// Issue a fresh signed timing token on each page render. The form returns it on
// submit so the endpoint can reject implausibly fast (bot) submissions.
export const load: PageServerLoad = async () => {
	return { formToken: signSession() };
};
