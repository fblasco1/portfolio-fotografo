import Header from "./Header";
import Footer from "./Footer";

type Props = {
  children: React.ReactNode;
  locale: string;
  siteTitle?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
};

export default function MainLayout({ children, locale, siteTitle, socialMedia }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header siteTitle={siteTitle} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer locale={locale} socialMedia={socialMedia} />
    </div>
  );
}
