'use server';

import {auth} from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";

const resolveAppBaseUrl = () => {
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || '';
    return configuredUrl.replace(/\/api\/auth\/?$/, '').replace(/\/$/, '');
};

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({ body: { email, password, name: fullName } })

        if(response) {
            await inngest.send({
                name: 'app/user.created',
                data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
            })
        }

        return { success: true, data: response }
    } catch (e) {
        console.log('Sign up failed', e)
        return { success: false, error: 'Sign up failed' }
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({ body: { email, password } })

        return { success: true, data: response }
    } catch (e) {
        console.log('Sign in failed', e)
        return { success: false, error: 'Sign in failed' }
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
    } catch (e) {
        console.log('Sign out failed', e)
        return { success: false, error: 'Sign out failed' }
    }
}

export const requestPasswordResetWithEmail = async ({ email }: ForgotPasswordFormData) => {
    try {
        const appBaseUrl = resolveAppBaseUrl();
        const redirectTo = appBaseUrl ? `${appBaseUrl}/reset-password` : undefined;

        await auth.api.requestPasswordReset({
            body: {
                email,
                redirectTo,
            },
        });

        return {
            success: true,
            message: 'If an account exists for this email, a reset link has been sent.',
        };
    } catch (e) {
        console.log('Request password reset failed', e);
        return { success: false, error: 'Unable to request password reset right now.' };
    }
};

export const resetPasswordWithToken = async ({ token, newPassword }: ResetPasswordFormData) => {
    try {
        await auth.api.resetPassword({
            body: {
                token,
                newPassword,
            },
        });

        return { success: true };
    } catch (e) {
        console.log('Reset password failed', e);
        return { success: false, error: 'Unable to reset password. The link may be invalid or expired.' };
    }
};
