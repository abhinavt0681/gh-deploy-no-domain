'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-700 mb-4">
          Grace Harbor Analytics
        </h1>
        <p className="text-gray-600 mb-8">
          Loading dashboard...
        </p>
      </div>
    </div>
  );
} 