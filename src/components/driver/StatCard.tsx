// src/components/driver/StatCard.tsx
'use client';
import { ReactNode } from 'react';

export function StatCard({
  title,
  value,
  hint,
  icon,
  tone = 'default',
}: {
  title: string;
  value: string | ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: 'default' | 'success' | 'warning';
}) {
  const ring =
    tone === 'success' ? 'ring-1 ring-green-200 bg-green-50' :
    tone === 'warning' ? 'ring-1 ring-yellow-200 bg-yellow-50' :
    'ring-1 ring-gray-200 bg-white';

  return (
    <div className={`rounded-xl p-4 ${ring}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
