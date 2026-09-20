import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getDepartments,
  createDepartment,
  updateDepartment
} from '../../services/admin.service';

export default function DepartmentsManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    code: '',
    name: '',
    description: '',
    contactEmail: '',
    issueTypes: '',
    escalationDepartmentId: ''
  });

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    contactEmail: '',
    issueTypes: '',
    escalationDepartmentId: '',
    isActive: true
  });

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDepartments();
      if (res.success) {
        setDepartments(res.data || res.departments || []);
      } else {
        throw new Error(res.message || 'Failed to load departments');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setCreateForm({
      code: '',
      name: '',
      description: '',
      contactEmail: '',
      issueTypes: '',
      escalationDepartmentId: ''
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setSelectedDept(dept);
    const typesStr = Array.isArray(dept.issueTypes)
      ? dept.issueTypes.join(', ')
      : dept.issueTypes || '';

    setEditForm({
      name: dept.name || '',
      description: dept.description || '',
      contactEmail: dept.contactEmail || '',
      issueTypes: typesStr,
      escalationDepartmentId: dept.escalationDepartmentId
        ? (dept.escalationDepartmentId._id || dept.escalationDepartmentId)
        : '',
      isActive: dept.isActive !== undefined ? dept.isActive : true
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        code: createForm.code.trim().toUpperCase(),
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        contactEmail: createForm.contactEmail.trim(),
        issueTypes: createForm.issueTypes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      };
      if (createForm.escalationDepartmentId) {
        payload.escalationDepartmentId = createForm.escalationDepartmentId;
      }

      const res = await createDepartment(payload);
      if (res.success) {
        setIsCreateOpen(false);
        setActionSuccess(`Department ${payload.name} created successfully.`);
        setTimeout(() => setActionSuccess(null), 4000);
        fetchDepartments();
      } else {
        throw new Error(res.message || 'Failed to create department');
      }
    } catch (err) {
      setError(err.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        contactEmail: editForm.contactEmail.trim(),
        issueTypes: editForm.issueTypes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        escalationDepartmentId: editForm.escalationDepartmentId || null,
        isActive: editForm.isActive
      };

      const res = await updateDepartment(selectedDept._id, payload);
      if (res.success) {
        setIsEditOpen(false);
        setActionSuccess(`Department ${selectedDept.name} updated successfully.`);
        setTimeout(() => setActionSuccess(null), 4000);
        fetchDepartments();
      } else {
        throw new Error(res.message || 'Failed to update department');
      }
    } catch (err) {
      setError(err.message || 'Failed to update department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (dept) => {
    const updatedStatus = !dept.isActive;
    try {
      const res = await updateDepartment(dept._id, { isActive: updatedStatus });
      if (res.success) {
        setActionSuccess(`Department ${dept.name} is now ${updatedStatus ? 'Active' : 'Inactive'}.`);
        setTimeout(() => setActionSuccess(null), 3000);
        fetchDepartments();
      }
    } catch (err) {
      alert(`Could not update department status: ${err.message}`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Department Architecture & Routing
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Configure civic departments, auto-classification issue types, and autonomous escalation routing.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Department
          </button>
        </div>

        {/* Notifications */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
              ✕
            </button>
          </div>
        )}

        {/* Departments Grid */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-slate-500 font-medium">Loading civic departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-sm font-bold text-slate-800">No departments found</h3>
            <p className="text-xs text-slate-500 mt-1">Add your municipality's operational departments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => {
              const escDept = dept.escalationDepartmentId
                ? (typeof dept.escalationDepartmentId === 'object'
                    ? dept.escalationDepartmentId.name || dept.escalationDepartmentId.code
                    : departments.find((d) => d._id === dept.escalationDepartmentId)?.name || 'Configured')
                : null;

              return (
                <div
                  key={dept._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {dept.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          {dept.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleToggleActive(dept)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition ${
                          dept.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dept.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {dept.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {dept.description || 'No description provided.'}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Auto-Routed Issue Types:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(dept.issueTypes) && dept.issueTypes.length > 0 ? (
                            dept.issueTypes.map((type, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-medium bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                              >
                                {type}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">None configured</span>
                          )}
                        </div>
                      </div>

                      {escDept && (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Escalates To:
                          </span>
                          <span className="text-xs font-semibold text-purple-700 flex items-center gap-1 mt-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            {escDept}
                          </span>
                        </div>
                      )}

                      {dept.contactEmail && (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Contact:
                          </span>
                          <span className="text-xs font-mono text-slate-600">
                            {dept.contactEmail}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                    >
                      Configure Department
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Department Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-base font-bold text-slate-900">Add Civic Department</h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Department Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ROADS"
                      value={createForm.code}
                      onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono uppercase text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Roads & Bridges"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Brief scope of departmental responsibilities..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="dept@city.gov"
                    value={createForm.contactEmail}
                    onChange={(e) => setCreateForm({ ...createForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Issue Types (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Pothole, Damaged Road, Streetlight"
                    value={createForm.issueTypes}
                    onChange={(e) => setCreateForm({ ...createForm, issueTypes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400">
                    AI engine uses these tags for autonomous department matching.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Escalation Department (Optional)
                  </label>
                  <select
                    value={createForm.escalationDepartmentId}
                    onChange={(e) => setCreateForm({ ...createForm, escalationDepartmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">No Escalation Routing</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow disabled:opacity-50 transition"
                  >
                    {submitting ? 'Creating...' : 'Create Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Department Modal */}
        {isEditOpen && selectedDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Configure Department</h3>
                  <p className="text-xs text-slate-500 font-mono">Code: {selectedDept.code}</p>
                </div>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows="2"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={editForm.contactEmail}
                    onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Issue Types (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.issueTypes}
                    onChange={(e) => setEditForm({ ...editForm, issueTypes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Autonomous Escalation Department
                  </label>
                  <select
                    value={editForm.escalationDepartmentId}
                    onChange={(e) => setEditForm({ ...editForm, escalationDepartmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">No Escalation Routing</option>
                    {departments
                      .filter((d) => d._id !== selectedDept._id)
                      .map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="deptIsActive"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="deptIsActive" className="text-sm font-semibold text-slate-700">
                    Active Department Status
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow disabled:opacity-50 transition"
                  >
                    {submitting ? 'Saving...' : 'Save Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
