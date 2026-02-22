export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex" style={{ background: '#292F4C' }}>
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[480px] flex-col items-center justify-center px-12">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6161FF] to-[#FF158A] flex items-center justify-center mb-6">
          <span className="text-white text-4xl font-bold">M</span>
        </div>
        <h1 className="text-white text-[32px] font-bold mb-3 text-center">MockMonday</h1>
        <p className="text-[#9699A6] text-[16px] text-center leading-relaxed max-w-[320px]">
          A work OS that lets you shape workflows your way. Manage projects, tasks, and teamwork with ease.
        </p>
      </div>

      {/* Right panel - auth form */}
      <div className="flex-1 flex items-center justify-center bg-white rounded-l-[32px] lg:rounded-l-[32px] min-h-screen">
        <div className="w-full max-w-[400px] px-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6161FF] to-[#FF158A] flex items-center justify-center">
              <span className="text-white text-xl font-bold">M</span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
