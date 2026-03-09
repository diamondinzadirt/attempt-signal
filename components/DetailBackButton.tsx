'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DetailBackButtonProps {
  className?: string;
}

const DetailBackButton = ({ className }: DetailBackButtonProps) => {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => router.back()}
      aria-label="Go back"
      className={`h-10 w-10 rounded-full border border-gray-600 bg-gray-800/80 text-gray-200 hover:bg-gray-700 hover:text-violet-400 ${className ?? ''}`}
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};

export default DetailBackButton;
