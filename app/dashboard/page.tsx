'use client';

import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';

interface Stats {
  totalCrimes: number;
  totalCriminals: number;
  totalOfficers: number;
  openCases: number;
}

interface ChartItem {
  count: number;
  [key: string]: unknown;
}

interface RecentCrime {
  crime_id: number;
  crime_type: string;
  crime_date: string;
  location_name: string;
  crime_status: string;
  officer_name: string | null;
  criminal_name: string | null;
}

interface DashboardData {
  stats: Stats;
  crimesByType: (ChartItem & { crime_type: string })[];
  crimesByLocation: (ChartItem & { location_name: string })[];
  recentCrimes: RecentCrime[];
  statusBreakdown: (ChartItem & { crime_status: string })[];
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
      </div>
    </div>
  );
}

function BarChart({
  data,
  nameKey,
  color,
}: {
  data: ChartItem[];
  nameKey: string;
  color: string;
}) {
  if (!data || data.length === 0)
    return <p className="text-gray-400 text-sm py-4">No data available</p>;

  const max = Math.max(...data.map((d) => Number(d.count)));

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-32 text-xs text-gray-600 truncate text-right shrink-0">
            {String(item[nameKey])}
          </div>
          <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
            <div
              className={`h-full ${color} rounded-full flex items-center justify-end pr-2 transition-all duration-700`}
              style={{ width: `${Math.max((Number(item.count) / max) * 100, 8)}%` }}
            >
              <span className="text-xs text-white font-semibold">{item.count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const statusMap: Record<string, number> = {};
  data?.statusBreakdown.forEach((s) => {
    statusMap[s.crime_status] = Number(s.count);
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of the Crime Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Crimes"
          value={data?.stats.totalCrimes ?? 0}
          color="bg-blue-100"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          label="Total Criminals"
          value={data?.stats.totalCriminals ?? 0}
          color="bg-red-100"
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <StatCard
          label="Total Officers"
          value={data?.stats.totalOfficers ?? 0}
          color="bg-green-100"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
        <StatCard
          label="Open Cases"
          value={data?.stats.openCases ?? 0}
          color="bg-yellow-100"
          icon={
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Crimes by Type</h2>
          <BarChart
            data={data?.crimesByType ?? []}
            nameKey="crime_type"
            color="bg-blue-500"
          />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Crimes by Location</h2>
          <BarChart
            data={data?.crimesByLocation ?? []}
            nameKey="location_name"
            color="bg-violet-500"
          />
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Open', color: 'border-red-200 bg-red-50', textColor: 'text-red-700' },
          { label: 'Closed', color: 'border-green-200 bg-green-50', textColor: 'text-green-700' },
          { label: 'Under Investigation', color: 'border-blue-200 bg-blue-50', textColor: 'text-blue-700' },
        ].map(({ label, color, textColor }) => (
          <div key={label} className={`rounded-xl border p-5 ${color}`}>
            <p className={`text-sm font-medium ${textColor}`}>{label}</p>
            <p className={`text-3xl font-bold mt-1 ${textColor}`}>
              {statusMap[label] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Crimes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Recent Crimes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Type', 'Date', 'Location', 'Status', 'Officer', 'Criminal'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.recentCrimes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No recent crimes
                  </td>
                </tr>
              ) : (
                data?.recentCrimes.map((crime) => (
                  <tr key={crime.crime_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">#{crime.crime_id}</td>
                    <td className="px-4 py-3 text-gray-700">{crime.crime_type}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(crime.crime_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{crime.location_name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={crime.crime_status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{crime.officer_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{crime.criminal_name ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
