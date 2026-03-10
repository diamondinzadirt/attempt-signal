'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';
import LoadingSpinner from '@/components/LoadingSpinner';
import { requestPasswordResetWithEmail } from '@/lib/actions/auth.actions';

const ForgotPassword = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const result = await requestPasswordResetWithEmail(data);

    if (!result.success) {
      toast.error('Reset email failed', {
        description: result.error || 'Unable to send reset instructions right now.',
      });
      return;
    }

    toast.success('Check your email', {
      description: result.message,
    });

    router.push('/sign-in');
  };

  return (
    <>
      <div className="mb-8 sm:mb-10">
        <h1 className="form-title !mb-2">Reset your password</h1>
        <p className="text-sm font-normal text-gray-500">Enter your email and we&apos;ll send a reset link.</p>
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

        <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
          {isSubmitting ? 'Sending reset link' : 'Send reset link'}
        </Button>

        <FooterLink text="Remembered your password?" linkText="Sign in" href="/sign-in" />
      </form>

      {isSubmitting && <LoadingSpinner fullScreen label="Sending reset link..." />}
    </>
  );
};

export default ForgotPassword;

