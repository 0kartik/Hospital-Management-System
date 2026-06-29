import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, X, Calendar, Clock, User, Stethoscope, Trash2, Edit3, CheckCircle } from "lucide-react";

const API = `${import.meta.env.VITE_API_URL || ""}/api`;
const statusBadge = { Scheduled: "badge-blue", Completed: "badge-green", Cancelled: "badge-red", "No-Show": "badge-amber" };
const typeBadge = { Consultation: "badge-teal", "Follow-up": "badge-blue", "Check-up": "badge-gray", Emergency: "badge-red", Physiotherapy: "badge-purple", "Lab Review": "badge-amber", Surgery: "badge-red" };

const EMPTY = { patient: "", doctor: "", date: "", type: "Consultation", status: "Scheduled", notes: "", duration: 30 };

export default function Appointments() {
  const [appts, setAppts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [a, p, d] = await Promise.all([
        axios.get(`${API}/appointments`),
        axios.get(`${API}/patients`),
        axios.get(`${API}/doctors`),
      ]);
      setAppts(a.data);
      setPatients(p.data);
      setDoctors(d.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const filtered = appts.filter(a => {
    const matchSearch = a.patient?.name?.toLowerCase().includes(search.toLowerCase()) || a.doctor?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) await axios.put(`${API}/appointments/${editing}`, form);
      else await axios.post(`${API}/appointments`, form);
      setShowModal(false); setEditing(null); setForm(EMPTY); fetchAll();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this appointment?")) return;
    await axios.delete(`${API}/appointments/${id}`);
    fetchAll();
  }

  async function markComplete(a) {
    await axios.put(`${API}/appointments/${a._id}`, { ...a, patient: a.patient?._id, doctor: a.doctor?._id, status: "Completed" });
    fetchAll();
  }

  function handleEdit(a) {
    setForm({ ...a, patient: a.patient?._id, doctor: a.doctor?._id, date: a.date ? new Date(a.date).toISOString().slice(0, 16) : "" });
    setEditing(a._id); setShowModal(true);
  }

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  const formatTime = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const statuses = ["All", "Scheduled", "Completed", "Cancelled", "No-Show"];

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div>
          <h1>Appointments</h1>
          <p>Schedule, manage, and track patient appointments</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditing(null); setForm(EMPTY); }}>
          <Plus size={15} /> New Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {["Scheduled", "Completed", "Cancelled", "No-Show"].map(s => (
          <div className="stat-card" key={s}>
            <div className="stat-label">{s}</div>
            <div className="stat-value">{appts.filter(a => a.status === s).length}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-12 mb-16">
        <div className="search-bar">
          <Search size={14} />
          <input placeholder="Search by patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {statuses.map(s => (
          <button key={s} className={`btn btn-sm ${filterStatus === s ? "btn-primary" : "btn-outline"}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Appointment Schedule ({filtered.length})</span>
        </div>
        <div className="card-body table-wrap">
          {loading ? <div className="empty-state"><p>Loading...</p></div> : filtered.length === 0 ? (
            <div className="empty-state">
              <Calendar size={32} />
              <p>No appointments found</p>
              <span>Schedule a new appointment to get started</span>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Type</th><th>Duration</th><th>Status</th><th>Notes</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div className="flex items-center gap-8">
                        <User size={14} color="var(--text3)" />
                        <span className="name-cell">{a.patient?.name || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{a.doctor?.name || "—"}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text3)" }}>{a.doctor?.specialization}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{formatDate(a.date)}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text3)", fontFamily: "var(--mono)" }}>{formatTime(a.date)}</div>
                    </td>
                    <td><span className={`badge ${typeBadge[a.type] || "badge-gray"}`}>{a.type}</span></td>
                    <td>
                      <div className="flex items-center gap-8" style={{ color: "var(--text3)", fontSize: 12.5 }}>
                        <Clock size={11} />{a.duration} min
                      </div>
                    </td>
                    <td><span className={`badge ${statusBadge[a.status] || "badge-gray"}`}>{a.status}</span></td>
                    <td style={{ maxWidth: 160 }}>
                      <span style={{ fontSize: 12.5, color: "var(--text3)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.notes || "—"}</span>
                    </td>
                    <td>
                      <div className="action-row">
                        {a.status === "Scheduled" && (
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--green)" }} onClick={() => markComplete(a)} title="Mark Complete"><CheckCircle size={13} /></button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(a)}><Edit3 size={13} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} onClick={() => handleDelete(a._id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? "Edit Appointment" : "Schedule Appointment"}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Patient *</label>
                    <select className="form-select" required value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })}>
                      <option value="">Select patient</option>
                      {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Doctor *</label>
                    <select className="form-select" required value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })}>
                      <option value="">Select doctor</option>
                      {doctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date & Time *</label>
                    <input className="form-input" required type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input className="form-input" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} placeholder="30" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      {["Consultation","Follow-up","Check-up","Emergency","Physiotherapy","Lab Review","Surgery"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {["Scheduled","Completed","Cancelled","No-Show"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Notes</label>
                    <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Appointment notes or reason for visit..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? "Save Changes" : "Schedule"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
