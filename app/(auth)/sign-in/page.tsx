'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';
import { signInWithEmail } from '@/lib/actions/auth.actions';
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import LoadingSpinner from '@/components/LoadingSpinner';

const SignIn = () => {
    const router = useRouter()
    const [isRedirecting, setIsRedirecting] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);
            if (!result.success) {
                toast.error('Sign in failed', {
                    description: result.error || 'Failed to sign in.'
                });
                return;
            }

            setIsRedirecting(true);
            toast.success('Signed in successfully', {
                description: 'Redirecting to your dashboard...'
            });

            await new Promise((resolve) => setTimeout(resolve, 700));
            router.replace('/');
            router.refresh();
        } catch (e) {
            console.error(e);
            toast.error('Sign in failed', {
                description: e instanceof Error ? e.message : 'Failed to sign in.'
            })
        }
    }

    return (
        <>
            <div className="mb-8 sm:mb-10">
                <h1 className="form-title !mb-2">Welcome back</h1>
                <p className="text-sm font-normal text-gray-500 lg:hidden">Track your watchlist and get AI alerts.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="email"
                    label="Email"
                    placeholder="agent_tasie@gmail.com"
                    register={register}
                    error={errors.email}
                    validation={{ required: 'Email is required', pattern: /^\w+@\w+\.\w+$/ }}
                />

                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: 'Password is required', minLength: 8 }}
                />
                <div className="-mt-2 text-right">
                    <Link href="/forgot-password" className="text-sm text-violet-400 hover:text-violet-300">
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isRedirecting ? 'Redirecting...' : isSubmitting ? 'Signing In' : 'Sign In'}
                </Button>

                <FooterLink text="Don't have an account?" linkText="Create an account" href="/sign-up" />
            </form>

            {isSubmitting && <LoadingSpinner fullScreen label={isRedirecting ? "Sign in successful. Redirecting..." : "Signing you in..."} />}
        </>
    );
};
export default SignIn;
