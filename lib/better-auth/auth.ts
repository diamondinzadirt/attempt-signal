import { betterAuth } from "better-auth";
import { mongodbAdapter} from "better-auth/adapters/mongodb";
import { connectToDatabase} from "@/database/mongoose";
import { nextCookies} from "better-auth/next-js";
import type { Db } from "mongodb";

const resolveAppBaseUrl = () => {
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || '';
    return configuredUrl.replace(/\/api\/auth\/?$/, '').replace(/\/$/, '');
};

const createAuthInstance = (db: Db) => betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
        enabled: true,
        disableSignUp: false,
        requireEmailVerification: false,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
        sendResetPassword: async ({ user, url, token }) => {
            const { sendResetPasswordEmail } = await import("@/lib/nodemailer");
            const appBaseUrl = resolveAppBaseUrl();
            const resetUrl = appBaseUrl
                ? `${appBaseUrl}/reset-password?token=${encodeURIComponent(token)}`
                : url;

            await sendResetPasswordEmail({
                email: user.email,
                name: user.name,
                resetUrl,
            });
        },
    },
    plugins: [nextCookies()],
});

let authInstance: ReturnType<typeof createAuthInstance> | null = null;

export const getAuth = async (): Promise<ReturnType<typeof createAuthInstance>> => {
    if(authInstance) return authInstance;

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if(!db) throw new Error('MongoDB connection not found');

    authInstance = createAuthInstance(db as unknown as Db);

    return authInstance;
}

export const auth = await getAuth();
