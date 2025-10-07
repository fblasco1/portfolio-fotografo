import { Suspense } from 'react';
import CheckoutPage from './components/CheckoutPage';

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function Checkout({ params }: CheckoutPageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600"></div>
        </div>
      }>
        <CheckoutPage locale={locale} />
      </Suspense>
    </div>
  );
}
