'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';
import LoadingSpinner from '@/components/LoadingSpinner';
import { resetPasswordWithToken } from '@/lib/actions/auth.actions';

type ResetPasswordClientForm = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordClientForm>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: ResetPasswordClientForm) => {
    if (!token) {
      toast.error('Invalid reset link', {
        description: 'Request a new password reset email and try again.',
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'validate',
        message: 'Passwords do not match.',
      });
      return;
    }

    const result = await resetPasswordWithToken({
      token,
      newPassword: data.password,
    });

    if (!result.success) {
      toast.error('Reset failed', {
        description: result.error || 'Unable to reset password.',
      });
      return;
    }

    toast.success('Password updated', {
      description: 'You can now sign in with your new password.',
    });
    router.push('/sign-in');
  };

  return (
    <>
      <div className="mb-8 sm:mb-10">
        <h1 className="form-title !mb-2">Set a new password</h1>
        <p className="text-sm font-normal text-gray-500">Choose a strong password for your account.</p>
      </div>

      {!token && (
        <div className="mb-5 rounded-md border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">This reset link is invalid or incomplete.</p>
          <Link href="/forgot-password" className="mt-2 inline-block text-sm text-violet-400 hover:text-violet-300">
            Request a new reset link
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="password"
          label="New Password"
          placeholder="Enter a new password"
          type="password"
          register={register}
          error={errors.password}
          validation={{ required: 'New password is required', minLength: 8 }}
        />

        <InputField
          name="confirmPassword"
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          type="password"
          register={register}
          error={errors.confirmPassword}
          validation={{ required: 'Please confirm your password', minLength: 8 }}
        />

        <Button type="submit" disabled={isSubmitting || !token} className="yellow-btn w-full mt-5">
          {isSubmitting ? 'Updating password' : 'Update password'}
        </Button>

        <FooterLink text="Back to account access?" linkText="Sign in" href="/sign-in" />
      </form>

      {isSubmitting && <LoadingSpinner fullScreen label="Updating your password..." />}
    </>
  );
};

export default ResetPassword;

