import { fail, redirect } from '@sveltejs/kit';
import { LOGIN_FRIEND_SECRET } from '$env/static/private';

import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';

export const load = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Anmeldung fehlgeschlagen' });
			}
			return fail(500, { message: 'Unerwarteter Fehler' });
		}

		return redirect(302, '/');
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';
		const friendSecret = formData.get('friendsecret')?.toString() ?? '';
		const atHandle = formData.get('atname')?.toString() ?? '';

		if(!email || !password || !name || !atHandle || !friendSecret){
			return fail(400, { message: 'Alle Felder von Nöten!' });
		}

		if(friendSecret != LOGIN_FRIEND_SECRET){
			return fail(400, { message: 'Habubi falsches friend secret' });
		}

		if(!validateAtHandle(atHandle) || !validateEmail(email) || !validatePassword(password)){
			return fail(400, { message: 'Dein Benutzername enthält vermutlich falsche Zeichen (Oder dein Passwort ist zu schlecht)'});
		}

		const atHandleResult = await db.select().from(user).where(eq(user.atHandle, atHandle));

		if(atHandleResult.length != 0){
			return fail(400, { message: 'Benutzername vergeben!'})
		}

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					atHandle,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registrierung fehlgeschlagen' });
			}
			return fail(500, { message: 'Bizarrer Fehler 🤔' });
		}

		return redirect(302, '/welcome');
	},
	signInSocial: async (event) => {
		return fail(400, { message: 'Temporarily Disabled' });
		const formData = await event.request.formData();
		const provider = formData.get('provider')?.toString() ?? 'github';
		const callbackURL = formData.get('callbackURL')?.toString() ?? '/';

		const result = await auth.api.signInSocial({
			body: {
				provider: provider,
				callbackURL
			}
		});

		if (result.url) {
			return redirect(302, result.url);
		}
		return fail(400, { message: 'Social sign-in failed' });
	},
};

function validateAtHandle(input){
	return /^[a-z_öäüß]{2,30}$/.test(input);
}

function validateEmail(input){
	return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(input);
}

function validatePassword(input){
	return /^.{8,}$/.test(input);
}