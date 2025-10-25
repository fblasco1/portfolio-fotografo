import Header from "./Header";
import Footer from "./Footer";

type Props = {
  children: React.ReactNode;
  locale: string;
  siteTitle?: string;
};

export default function MainLayout({ children, locale, siteTitle }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header siteTitle={siteTitle} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
