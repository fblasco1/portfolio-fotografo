export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 lg:min-h-0 lg:max-h-[calc(100dvh-9rem)] lg:overflow-hidden">
      {children}
    </div>
  );
}
