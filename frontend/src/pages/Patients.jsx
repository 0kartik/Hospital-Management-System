import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, X, AlertCircle, Heart, FileText, ChevronDown, ChevronUp, Trash2, Edit3 } from "lucide-react";

const API = `${import.meta.env.VITE_API_URL || ""}/api`;
const avatarColors = ["avatar-teal", "avatar-blue", "avatar-purple", "avatar-amber", "avatar-green"];
const initials = (name) => name ? name.split(" ").map(w => w[0]).join("").slice(0, 2) : "?";

const statusBadge = { Stable: "badge-green", Critical: "badge-red", Recovering: "badge-amber", Discharged: "badge-gray" };

const EMPTY_FORM = { name: "", age: "", gender: "Male", bloodType: "A+", phone: "", email: "", address: "", condition: "", status: "Stable", allergies: "" };

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState({ type: "Consultation", notes: "" });
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [p, d] = await Promise.all([axios.get(`${API}/patients`), axios.get(`${API}/doctors`)]);
      setPatients(p.data);
      setDoctors(d.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.condition?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, age: Number(form.age), allergies: form.allergies ? form.allergies.split(",").map(a => a.trim()) : [] };
    try {
      if (editing) {
        await axios.put(`${API}/patients/${editing}`, payload);
      } else {
        await axios.post(`${API}/patients`, payload);
      }
      setShowModal(false); setEditing(null); setForm(EMPTY_FORM);
      fetchAll();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this patient?")) return;
    await axios.delete(`${API}/patients/${id}`);
    if (selectedPatient?._id === id) setSelectedPatient(null);
    fetchAll();
  }

  function handleEdit(p) {
    setForm({ ...p, allergies: p.allergies?.join(", ") || "", doctor: p.doctor?._id || "" });
    setEditing(p._id); setShowModal(true);
  }

  async function handleAddRecord(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/patients/${selectedPatient._id}/records`, recordForm);
      setSelectedPatient(res.data);
      setShowRecordModal(false); setRecordForm({ type: "Consultation", notes: "" });
      fetchAll();
    } catch (e) { console.error(e); }
  }

  const statuses = ["All", "Stable", "Critical", "Recovering", "Discharged"];

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div>
          <h1>Patients</h1>
          <p>Manage patient health records, status, and medical history</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditing(null); setForm(EMPTY_FORM); }}>
          <Plus size={15} /> Add Patient
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {["Stable", "Critical", "Recovering", "Discharged"].map(s => (
          <div className="stat-card" key={s}>
            <div className="stat-label">{s}</div>
            <div className="stat-value">{patients.filter(p => p.status === s).length}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-12 mb-16">
        <div className="search-bar">
          <Search size={14} />
          <input placeholder="Search patients or conditions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-8">
          {statuses.map(s => (
            <button key={s} className={`btn btn-sm ${filterStatus === s ? "btn-primary" : "btn-outline"}`} onClick={() => setFilterStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Table */}
        <div className="card" style={{ gridColumn: selectedPatient ? "1" : "1 / -1" }}>
          <div className="card-header">
            <span className="card-title">Patient List ({filtered.length})</span>
          </div>
          <div className="card-body table-wrap">
            {loading ? <div className="empty-state"><p>Loading...</p></div> : filtered.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={32} />
                <p>No patients found</p>
                <span>Try adjusting your search or filters</span>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Patient</th><th>Age/Gender</th><th>Condition</th><th>Doctor</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p._id} style={{ cursor: "pointer", background: selectedPatient?._id === p._id ? "var(--teal-light)" : "" }}
                      onClick={() => setSelectedPatient(selectedPatient?._id === p._id ? null : p)}>
                      <td>
                        <div className="flex items-center gap-8">
                          <div className={`avatar ${avatarColors[i % avatarColors.length]}`}>{initials(p.name)}</div>
                          <div>
                            <div className="name-cell">{p.name}</div>
                            <div className="text-sm text-muted font-mono">{p.bloodType}</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.age}y / {p.gender}</td>
                      <td>{p.condition || "—"}</td>
                      <td>{p.doctor?.name || "Unassigned"}</td>
                      <td><span className={`badge ${statusBadge[p.status] || "badge-gray"}`}>{p.status}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="action-row">
                          <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(p)}><Edit3 size={13} /></button>
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} onClick={() => handleDelete(p._id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Patient Detail Panel */}
        {selectedPatient && (
          <div className="card" style={{ gridColumn: "2" }}>
            <div className="card-header">
              <span className="card-title">Patient Profile</span>
              <div className="flex gap-8">
                <button className="btn btn-sm btn-primary" onClick={() => setShowRecordModal(true)}><Plus size={12} /> Record</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedPatient(null)}><X size={14} /></button>
              </div>
            </div>
            <div className="card-body" style={{ padding: 20 }}>
              <div className="patient-info-header">
                <div className="avatar avatar-teal" style={{ width: 48, height: 48, fontSize: 18 }}>{initials(selectedPatient.name)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedPatient.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{selectedPatient.age} years • {selectedPatient.gender} • {selectedPatient.bloodType}</div>
                  <span className={`badge ${statusBadge[selectedPatient.status]}`} style={{ marginTop: 6 }}>{selectedPatient.status}</span>
                </div>
              </div>

              <div className="info-grid mb-16">
                <div className="info-item"><dt>Phone</dt><dd>{selectedPatient.phone || "—"}</dd></div>
                <div className="info-item"><dt>Email</dt><dd>{selectedPatient.email || "—"}</dd></div>
                <div className="info-item"><dt>Condition</dt><dd>{selectedPatient.condition || "—"}</dd></div>
                <div className="info-item"><dt>Doctor</dt><dd>{selectedPatient.doctor?.name || "Unassigned"}</dd></div>
                <div className="info-item"><dt>Allergies</dt><dd>{selectedPatient.allergies?.length ? selectedPatient.allergies.join(", ") : "None"}</dd></div>
                <div className="info-item"><dt>Admitted</dt><dd>{selectedPatient.admissionDate ? new Date(selectedPatient.admissionDate).toLocaleDateString() : "—"}</dd></div>
              </div>

              <div className="divider" />

              <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 13 }}>
                <FileText size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />Medical Records ({selectedPatient.records?.length || 0})
              </div>
              {selectedPatient.records?.length ? (
                <div className="timeline">
                  {selectedPatient.records.map((r, i) => (
                    <div className="timeline-item" key={i}>
                      <div className="timeline-date">{new Date(r.date).toLocaleDateString()}</div>
                      <div className="timeline-type">{r.type}</div>
                      <div className="timeline-notes">{r.notes}</div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ color: "var(--text3)", fontSize: 13 }}>No records yet</div>}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? "Edit Patient" : "New Patient"}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid form-grid-2">
                  <div className="form-group col-span-2">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Patient's full name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age *</label>
                    <input className="form-input" required type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="Age" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Type</label>
                    <select className="form-select" value={form.bloodType} onChange={e => setForm({ ...form, bloodType: e.target.value })}>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {["Stable","Critical","Recovering","Discharged"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input className="form-input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Contact number" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Condition</label>
                    <input className="form-input" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} placeholder="Primary diagnosis / condition" />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Assign Doctor</label>
                    <select className="form-select" value={form.doctor || ""} onChange={e => setForm({ ...form, doctor: e.target.value })}>
                      <option value="">— Unassigned —</option>
                      {doctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>)}
                    </select>
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Allergies (comma-separated)</label>
                    <input className="form-input" value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} placeholder="e.g. Penicillin, Latex" />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Address</label>
                    <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Home address" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? "Save Changes" : "Add Patient"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showRecordModal && selectedPatient && (
        <div className="modal-backdrop" onClick={() => setShowRecordModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Medical Record</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowRecordModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddRecord}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Record Type</label>
                    <select className="form-select" value={recordForm.type} onChange={e => setRecordForm({ ...recordForm, type: e.target.value })}>
                      {["Consultation","Follow-up","Emergency","Lab Result","Surgery","Physiotherapy","Progress","Discharge"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Clinical Notes *</label>
                    <textarea className="form-textarea" required value={recordForm.notes} onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })} placeholder="Enter clinical notes..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowRecordModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
