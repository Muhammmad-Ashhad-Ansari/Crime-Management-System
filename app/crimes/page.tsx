'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';

interface Crime {
  crime_id: number;
  crime_type: string;
  crime_date: string;
  location_name: string;
  crime_status: string;
  officer_id: number | null;
  criminal_id: number | null;
  evidence_details: string | null;
  officer_name: string | null;
  criminal_name: string | null;
}

interface Officer {
  officer_id: number;
  officer_name: string;
}

interface Criminal {
  criminal_id: number;
  criminal_name: string;
}

const STATUSES = ['Open', 'Closed', 'Under Investigation'];

const emptyForm = {
  crime_type: '',
  crime_date: '',
  location_name: '',
  crime_status: '',
  officer_id: '',
  criminal_id: '',
  evidence_details: '',
};

export default function CrimesPage() {
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [filtered, setFiltered] = useState<Crime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Crime | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Crime | null>(null);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [criminals, setCriminals] = useState<Criminal[]>([]);

  const loadCrimes = () => {
    setLoading(true);
    fetch('/api/crimes')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setCrimes(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCrimes();
    Promise.all([
      fetch('/api/officers').then((r) => r.json()),
      fetch('/api/criminals').then((r) => r.json()),
    ]).then(([o, c]) => {
      setOfficers(o.error ? [] : o);
      setCriminals(c.error ? [] : c);
    });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      crimes.filter(
        (c) =>
          (c.crime_type.toLowerCase().includes(q) || c.location_name.toLowerCase().includes(q)) &&
          (statusFilter === '' || c.crime_status === statusFilter),
      ),
    );
  }, [search, statusFilter, crimes]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c: Crime) => {
    setEditing(c);
    setForm({
      crime_type: c.crime_type,
      crime_date: c.crime_date ? c.crime_date.split('T')[0] : '',
      location_name: c.location_name,
      crime_status: c.crime_status,
      officer_id: c.officer_id ? String(c.officer_id) : '',
      criminal_id: c.criminal_id ? String(c.criminal_id) : '',
      evidence_details: c.evidence_details ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/crimes/${editing.crime_id}` : '/api/crimes';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setModalOpen(false);
      loadCrimes();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/crimes/${deleteTarget.crime_id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDeleteTarget(null);
      loadCrimes();
    } catch (e: unknown) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crimes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} records</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Crime
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by type or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
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
                  {['ID', 'Type', 'Date', 'Location', 'Status', 'Officer', 'Criminal', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                      No crimes found
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.crime_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">#{c.crime_id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.crime_type}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(c.crime_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.location_name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.crime_status} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.officer_name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{c.criminal_name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Crime' : 'Add Crime'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crime Type</label>
              <input
                type="text"
                required
                value={form.crime_type}
                onChange={(e) => setForm({ ...form, crime_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Robbery"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crime Date</label>
              <input
                type="date"
                required
                value={form.crime_date}
                onChange={(e) => setForm({ ...form, crime_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                required
                value={form.location_name}
                onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                required
                value={form.crime_status}
                onChange={(e) => setForm({ ...form, crime_status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Officer <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                value={form.officer_id}
                onChange={(e) => setForm({ ...form, officer_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {officers.map((o) => (
                  <option key={o.officer_id} value={o.officer_id}>
                    {o.officer_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Criminal <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                value={form.criminal_id}
                onChange={(e) => setForm({ ...form, criminal_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {criminals.map((c) => (
                  <option key={c.criminal_id} value={c.criminal_id}>
                    {c.criminal_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Evidence Details <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={form.evidence_details}
              onChange={(e) => setForm({ ...form, evidence_details: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe any evidence..."
            />
          </div>
          {editing && (
            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
              Changing the status will automatically create an audit log entry via SQL trigger.
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`Are you sure you want to delete crime #${deleteTarget?.crime_id} (${deleteTarget?.crime_type})?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
