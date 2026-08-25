'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';

interface Criminal {
  criminal_id: number;
  criminal_name: string;
  city: string;
  status_name: string;
  age: number;
}

const STATUSES = ['Arrested', 'Wanted', 'Released', 'Under Investigation'];
const emptyForm = { criminal_name: '', city: '', status_name: '', age: '' };

export default function CriminalsPage() {
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [filtered, setFiltered] = useState<Criminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Criminal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Criminal | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/criminals')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setCriminals(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      criminals.filter(
        (c) =>
          (c.criminal_name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)) &&
          (statusFilter === '' || c.status_name === statusFilter),
      ),
    );
  }, [search, statusFilter, criminals]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c: Criminal) => {
    setEditing(c);
    setForm({
      criminal_name: c.criminal_name,
      city: c.city,
      status_name: c.status_name,
      age: String(c.age),
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(form.age) < 18) {
      alert('Age must be at least 18');
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/criminals/${editing.criminal_id}` : '/api/criminals';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, age: parseInt(form.age) }),
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
      const res = await fetch(`/api/criminals/${deleteTarget.criminal_id}`, { method: 'DELETE' });
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
          <h1 className="text-2xl font-bold text-gray-900">Criminals</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} records</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Criminal
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or city..."
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
                  {['ID', 'Name', 'City', 'Status', 'Age', 'Actions'].map((h) => (
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
                      No criminals found
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.criminal_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">#{c.criminal_id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.criminal_name}</td>
                      <td className="px-4 py-3 text-gray-600">{c.city}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status_name} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.age}</td>
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
        title={editing ? 'Edit Criminal' : 'Add Criminal'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={form.criminal_name}
              onChange={(e) => setForm({ ...form, criminal_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              required
              value={form.status_name}
              onChange={(e) => setForm({ ...form, status_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select status</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age (min. 18)</label>
            <input
              type="number"
              required
              min={18}
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        message={`Are you sure you want to delete "${deleteTarget?.criminal_name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
