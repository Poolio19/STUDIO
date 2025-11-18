import { AppLayout } from '@/components/layout/app-layout';
import { FirebaseClientProvider } from '@/firebase';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AppLayout>{children}</AppLayout>
    </FirebaseClientProvider>
  );
}
