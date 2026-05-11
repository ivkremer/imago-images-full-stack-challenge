import type { PropsWithChildren } from 'react';
import { Separator } from '@/components/ui/separator';

type Props = {
  title: string;
} & PropsWithChildren;

export const PageLayout = async ({ children, title }: Props) => (
  <>
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col flex-grow-1 bg-background shadow-container shadow-muted-foreground/50">
      <main className="my-8 flex-grow-1 flex flex-col">
        <h1 className="text-center wrap-break-word">{title}</h1>
        <div className="flex flex-grow-1">{children}</div>
      </main>
      <Separator />
      <footer className="py-8">Ilya Kremer, 2026</footer>
    </div>
  </>
);
