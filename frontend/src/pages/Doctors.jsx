import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, X, Star, Users, Phone, Mail, Clock, Trash2, Edit3 } from "lucide-react";

const API = `${import.meta.env.VITE_API_URL || ""}/api`;
const avatarColors = ["avatar-teal", "avatar-blue", "avatar-purple", "avatar-amber", "avatar-green"];
const initials = (name) => name ? name.split(" ").map(w => w[0]).join("").slice(0, 2) : "?";
const statusBadge = { Available: "badge-green", Busy: "badge-amber", "Off Duty": "badge-gray" };

const EMPTY = { name: "", specialization: "", department: "", experience: "", status: "Available", phone: "", email: "", schedule: "", patients: "", rating: "" };

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => { fetchDoctors(); }, []);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/doctors`);
      setDoctors(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const filtered = doctors.filter(d => {
    const match = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
    const status = filterStatus === "All" || d.status === filterStatus;
    return match && status;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, experience: Number(form.experience), patients: Number(form.patients), rating: Number(form.rating) };
    try {
      if (editing) await axios.put(`${API}/doctors/${editing}`, payload);
      else await axios.post(`${API}/doctors`, payload);
      setShowModal(false); setEditing(null); setForm(EMPTY); fetchDoctors();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this doctor?")) return;
    await axios.delete(`${API}/doctors/${id}`);
    fetchDoctors();
  }

  function handleEdit(d) {
    setForm({ ...d }); setEditing(d._id); setShowModal(true);
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} fill={i < Math.floor(rating) ? "var(--amber)" : "none"} color={i < Math.floor(rating) ? "var(--amber)" : "var(--border2)"} />
    ));
  };

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div>
          <h1>Doctors</h1>
          <p>Manage medical staff, specializations, and availability</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditing(null); setForm(EMPTY); }}>
          <Plus size={15} /> Add Doctor
        </button>
      </div>

      {/* Quick stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {["Available", "Busy", "Off Duty"].map(s => (
          <div className="stat-card" key={s}>
            <div className="stat-label">{s}</div>
            <div className="stat-value">{doctors.filter(d => d.status === s).length}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-12 mb-16">
        <div className="search-bar">
          <Search size={14} />
          <input placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {["All", "Available", "Busy", "Off Duty"].map(s => (
          <button key={s} className={`btn btn-sm ${filterStatus === s ? "btn-primary" : "btn-outline"}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map((d, i) => (
            <div key={d._id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ height: 6, background: d.status === "Available" ? "var(--teal)" : d.status === "Busy" ? "var(--amber)" : "var(--border2)" }} />
              <div style={{ padding: "20px" }}>
                <div className="flex items-center gap-12" style={{ marginBottom: 16 }}>
                  <div className={`avatar ${avatarColors[i % avatarColors.length]}`} style={{ width: 50, height: 50, fontSize: 18 }}>{initials(d.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{d.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{d.specialization}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>{renderStars(d.rating)}<span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 2 }}>{d.rating?.toFixed(1)}</span></div>
                  </div>
                  <span className={`badge ${statusBadge[d.status] || "badge-gray"}`}>{d.status}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 10.5, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Department</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{d.department}</div>
                  </div>
                  <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 10.5, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Experience</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{d.experience} yrs</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                  {d.phone && <div className="flex items-center gap-8" style={{ fontSize: 12.5, color: "var(--text3)" }}><Phone size={12} />{d.phone}</div>}
                  {d.email && <div className="flex items-center gap-8" style={{ fontSize: 12.5, color: "var(--text3)" }}><Mail size={12} />{d.email}</div>}
                  {d.schedule && <div className="flex items-center gap-8" style={{ fontSize: 12.5, color: "var(--text3)" }}><Clock size={12} />{d.schedule}</div>}
                  <div className="flex items-center gap-8" style={{ fontSize: 12.5, color: "var(--text3)" }}><Users size={12} />{d.patients} patients seen</div>
                </div>

                <div className="flex gap-8">
                  <button className="btn btn-outline btn-sm flex-1" onClick={() => handleEdit(d)}><Edit3 size={12} /> Edit</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} onClick={() => handleDelete(d._id)}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? "Edit Doctor" : "Add Doctor"}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid form-grid-2">
                  <div className="form-group col-span-2">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dr. Jane Smith" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialization *</label>
                    <input className="form-input" required value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Cardiologist" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <input className="form-input" required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. Cardiology" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience (years)</label>
                    <input className="form-input" type="number" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="Years of experience" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      <option>Available</option><option>Busy</option><option>Off Duty</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Contact number" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Doctor email" />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Schedule</label>
                    <input className="form-input" value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} placeholder="e.g. Mon-Fri 9AM-5PM" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Patients</label>
                    <input className="form-input" type="number" value={form.patients} onChange={e => setForm({ ...form, patients: e.target.value })} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rating (0–5)</label>
                    <input className="form-input" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} placeholder="4.5" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? "Save Changes" : "Add Doctor"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
