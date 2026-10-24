'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UnassignedRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/inbox');
  }, [router]);
  return null;
}
