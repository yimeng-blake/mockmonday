'use client';

import { useGoogleStore } from '@/store/googleStore';
import { Link2, Unlink, Loader2 } from 'lucide-react';

export default function ConnectGoogleButton({ collapsed = false }: { collapsed?: boolean }) {
  const isConnected = useGoogleStore((s) => s.isConnected);
  const isConfigured = useGoogleStore((s) => s.isConfigured);
  const connectedEmail = useGoogleStore((s) => s.connectedEmail);
  const disconnect = useGoogleStore((s) => s.disconnect);

  if (!isConfigured) return null;

  if (collapsed) {
    return (
      <a
        href={isConnected ? undefined : '/api/auth/google'}
        onClick={isConnected ? () => disconnect() : undefined}
        className="flex items-center justify-center p-2 mx-2 rounded-md text-[#9699A6] hover:bg-[#383D5C] hover:text-white transition-colors cursor-pointer"
        title={isConnected ? `Connected: ${connectedEmail}` : 'Connect Google'}
      >
        {isConnected ? (
          <div className="w-2 h-2 rounded-full bg-[#00C875]" />
        ) : (
          <Link2 size={18} />
        )}
      </a>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 mx-2 text-[13px]">
        <div className="w-2 h-2 rounded-full bg-[#00C875] shrink-0" />
        <span className="text-[#9699A6] truncate flex-1" title={connectedEmail || ''}>
          {connectedEmail || 'Google connected'}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-[#9699A6] hover:text-white transition-colors shrink-0"
          title="Disconnect Google"
        >
          <Unlink size={14} />
        </button>
      </div>
    );
  }

  return (
    <a
      href="/api/auth/google"
      className="flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-[14px] text-[#D5D8DF] hover:bg-[#383D5C] transition-colors"
    >
      <Link2 size={18} />
      <span>Connect Google</span>
    </a>
  );
}
