import Header from "@/app/[locale]/components/Header";
import SubLayout from "../client/layout";

type Props = {
  children: React.ReactNode;
  locale: string;
};

export default function MainLayout({ children, locale }: Props) {
  return (
    <div className="flex flex-col h-full bg-slate-800 items-center">
      <SubLayout params={{ locale }}>
        <Header />
      </SubLayout>
      <main className="flex-grow flex justify-center">{children}</main>
    </div>
  );
}