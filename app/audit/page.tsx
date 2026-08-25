'use client';

import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';

interface AuditRecord {
  audit_id: number;
  crime_id: number;
  old_status: string;
  new_status: string;
  change_date: string;
  crime_type: string | null;
}

export default function AuditPage() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/audit')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setRecords(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Auto-recorded status changes via SQL trigger — read-only
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Audit ID', 'Crime ID', 'Crime Type', 'Old Status', 'New Status', 'Changed At'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      No audit records found
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.audit_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">#{r.audit_id}</td>
                      <td className="px-4 py-3 text-gray-600">#{r.crime_id}</td>
                      <td className="px-4 py-3 text-gray-700">{r.crime_type ?? '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.old_status} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.new_status} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(r.change_date).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
