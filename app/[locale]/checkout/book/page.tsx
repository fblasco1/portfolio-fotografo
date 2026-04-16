import { Suspense } from "react";
import BookCheckoutPage from "./components/BookCheckoutPage";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function BookCheckout({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64 pt-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600" />
          </div>
        }
      >
        <BookCheckoutPage locale={locale} />
      </Suspense>
    </div>
  );
}
