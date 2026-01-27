'use client';

export default function RootPage() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <h1 className="text-2xl font-bold">Welcome to PremPred</h1>
        <p>If you see this, the root page is working correctly.</p>
      </div>
    </div>
  );
}
