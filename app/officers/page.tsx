'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Officer {
  officer_id: number;
  officer_name: string;
  rank_name: string;
  station: string;
  contact: string;
}

const RANKS = ['Constable', 'Head Constable', 'ASI', 'SI', 'Inspector', 'DSP', 'SP', 'SSP', 'DIG', 'IG', 'DG'];

const emptyForm = { officer_name: '', rank_name: '', station: '', contact: '' };

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [filtered, setFiltered] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Officer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Officer | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/officers')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setOfficers(d);
        setFiltered(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      officers.filter(
        (o) =>
          o.officer_name.toLowerCase().includes(q) ||
          o.station.toLowerCase().includes(q),
      ),
    );
  }, [search, officers]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (o: Officer) => {
    setEditing(o);
    setForm({ officer_name: o.officer_name, rank_name: o.rank_name, station: o.station, contact: o.contact });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/officers/${editing.officer_id}` : '/api/officers';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setModalOpen(false);
      load();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/officers/${deleteTarget.officer_id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Officers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} records</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Officer
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or station..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
                  {['ID', 'Name', 'Rank', 'Station', 'Contact', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      No officers found
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.officer_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">#{o.officer_id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{o.officer_name}</td>
                      <td className="px-4 py-3 text-gray-600">{o.rank_name}</td>
                      <td className="px-4 py-3 text-gray-600">{o.station}</td>
                      <td className="px-4 py-3 text-gray-600">{o.contact}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(o)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(o)}
                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
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
        title={editing ? 'Edit Officer' : 'Add Officer'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={form.officer_name}
              onChange={(e) => setForm({ ...form, officer_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter officer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rank</label>
            <select
              required
              value={form.rank_name}
              onChange={(e) => setForm({ ...form, rank_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select rank</option>
              {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
            <input
              type="text"
              required
              value={form.station}
              onChange={(e) => setForm({ ...form, station: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter station"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <input
              type="text"
              required
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact number"
            />
          </div>
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
        message={`Are you sure you want to delete officer "${deleteTarget?.officer_name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
