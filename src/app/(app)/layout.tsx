import AuthProvider from "@/components/auth/AuthProvider";
import StoreProvider from "@/components/StoreProvider";
import Sidebar from "@/components/sidebar/Sidebar";
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
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-hidden bg-white">
            {children}
          </main>
        </div>
      </StoreProvider>
    </AuthProvider>
  );
}
