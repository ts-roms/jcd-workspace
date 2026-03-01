import Header from '@/app/components/layouts/Header';
import Sidenav from '@/app/components/layouts/Sidenav';
import Footer from '@/app/components/layouts/Footer';
import ProtectedRoute from '@/app/components/guards/ProtectedRoute';
import ProfileGuard from '@/app/components/guards/ProfileGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ProfileGuard>
        <div className="flex h-screen overflow-hidden">
          <Sidenav />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-6">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </ProfileGuard>
    </ProtectedRoute>
  );
}
