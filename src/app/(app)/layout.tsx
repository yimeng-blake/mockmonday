import AuthProvider from "@/components/auth/AuthProvider";
import StoreProvider from "@/components/StoreProvider";
import Sidebar from "@/components/sidebar/Sidebar";
import MobileHeader from "@/components/sidebar/MobileHeader";
import KeyboardShortcutListener from "@/components/KeyboardShortcutListener";

export const dynamic = 'force-dynamic';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <StoreProvider>
        <KeyboardShortcutListener />
        <div className="flex h-screen overflow-hidden">
          {/* Desktop sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Mobile header with hamburger - shown only on mobile */}
            <MobileHeader />
            <main className="flex-1 flex flex-col overflow-hidden">
              {children}
            </main>
          </div>
        </div>
      </StoreProvider>
    </AuthProvider>
  );
}
