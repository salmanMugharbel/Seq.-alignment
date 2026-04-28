import type { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
      <h1 className="text-3xl font-serif text-[#1e3a5f] mb-2">{title}</h1>
      {subtitle && (
        <p className="text-gray-500 mb-6 text-base">{subtitle}</p>
      )}
      <div className="mt-6">{children}</div>
    </main>
  );
}
