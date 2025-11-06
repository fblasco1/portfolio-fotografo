import { Suspense } from "react";
import ContactForm from "../components/page-specific/ContactForm"

export default function ContactPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-28 pb-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600"></div>
          </div>
        }>
          <ContactForm />
        </Suspense>
      </div>
    </div>
  )
}

