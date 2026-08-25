'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

interface FIR {
  fir_id: number;
  crime_id: number;
  victim_id: number;
  report_date: string;
  fir_description: string;
  victim_name: string | null;
  crime_type: string | null;
}

interface CrimeOption {
  crime_id: number;
  crime_type: string;
  crime_date: string;
}

interface VictimOption {
  victim_id: number;
  victim_name: string;
}

const emptyForm = { crime_id: '', victim_id: '', report_date: '', fir_description: '' };

export default function FIRPage() {
  const [firs, setFirs] = useState<FIR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FIR | null>(null);
  const [crimes, setCrimes] = useState<CrimeOption[]>([]);
  const [victims, setVictims] = useState<VictimOption[]>([]);

  const loadFirs = () => {
    setLoading(true);
    fetch('/api/fir')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setFirs(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFirs();
    // Load dropdown options
    Promise.all([fetch('/api/crimes').then((r) => r.json()), fetch('/api/victims').then((r) => r.json())]).then(
      ([c, v]) => {
        setCrimes(c.error ? [] : c);
        setVictims(v.error ? [] : v);
      },
    );
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/fir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setModalOpen(false);
      loadFirs();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/fir/${deleteTarget.fir_id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDeleteTarget(null);
      loadFirs();
    } catch (e: unknown) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FIR</h1>
          <p className="text-sm text-gray-500 mt-0.5">{firs.length} records</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add FIR
        </button>
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
                  {['FIR ID', 'Crime Type', 'Victim', 'Report Date', 'Description', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {firs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      No FIRs found
                    </td>
                  </tr>
                ) : (
                  firs.map((f) => (
                    <tr key={f.fir_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">#{f.fir_id}</td>
                      <td className="px-4 py-3 text-gray-700">{f.crime_type ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{f.victim_name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(f.report_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {f.fir_description}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteTarget(f)}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add FIR">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crime</label>
            <select
              required
              value={form.crime_id}
              onChange={(e) => setForm({ ...form, crime_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select crime</option>
              {crimes.map((c) => (
                <option key={c.crime_id} value={c.crime_id}>
                  #{c.crime_id} – {c.crime_type} ({new Date(c.crime_date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Victim</label>
            <select
              required
              value={form.victim_id}
              onChange={(e) => setForm({ ...form, victim_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select victim</option>
              {victims.map((v) => (
                <option key={v.victim_id} value={v.victim_id}>
                  #{v.victim_id} – {v.victim_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
            <input
              type="date"
              required
              value={form.report_date}
              onChange={(e) => setForm({ ...form, report_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={form.fir_description}
              onChange={(e) => setForm({ ...form, fir_description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter FIR description..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Add FIR'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`Are you sure you want to delete FIR #${deleteTarget?.fir_id}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
