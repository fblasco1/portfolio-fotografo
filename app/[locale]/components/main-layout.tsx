import Header from "@/app/[locale]/components/Header";
import Footer from "@/app/[locale]/components/Footer";

type Props = {
  children: React.ReactNode;
  locale: string;
};

export default function MainLayout({ children, locale }: Props) {
  return (
    <div className="flex flex-col min-h-screen max-w-screen overflow-hidden bg-gray-50">
      <Header locale={locale} />
      <main className="grow p-4">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
