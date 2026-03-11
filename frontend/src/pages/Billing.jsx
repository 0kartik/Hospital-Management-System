import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, X, Receipt, DollarSign, CreditCard, Trash2, Edit3, Printer } from "lucide-react";

const API = "/api";
const statusBadge = { Paid: "badge-green", Pending: "badge-amber", Partial: "badge-blue", Overdue: "badge-red" };
const EMPTY_ITEM = { description: "", quantity: 1, unitPrice: "" };
const EMPTY = { patient: "", doctor: "", status: "Pending", paymentMethod: "Cash", notes: "", items: [{ ...EMPTY_ITEM }] };

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewBill, setViewBill] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [b, p, d] = await Promise.all([
        axios.get(`${API}/bills`),
        axios.get(`${API}/patients`),
        axios.get(`${API}/doctors`),
      ]);
      setBills(b.data);
      setPatients(p.data);
      setDoctors(d.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const billTotal = (bill) => bill.items?.reduce((s, i) => s + (Number(i.quantity) * Number(i.unitPrice)), 0) || 0;
  const formTotal = () => form.items.reduce((s, i) => s + (Number(i.quantity || 0) * Number(i.unitPrice || 0)), 0);

  const filtered = bills.filter(b => {
    const matchSearch = b.patient?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = bills.filter(b => b.status === "Paid").reduce((s, b) => s + billTotal(b), 0);
  const totalPending = bills.filter(b => b.status === "Pending" || b.status === "Partial").reduce((s, b) => s + billTotal(b), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) await axios.put(`${API}/bills/${editing}`, form);
      else await axios.post(`${API}/bills`, form);
      setShowModal(false); setEditing(null); setForm(EMPTY); fetchAll();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this bill?")) return;
    await axios.delete(`${API}/bills/${id}`);
    if (viewBill?._id === id) setViewBill(null);
    fetchAll();
  }

  function handleEdit(b) {
    setForm({ ...b, patient: b.patient?._id, doctor: b.doctor?._id });
    setEditing(b._id); setShowModal(true);
  }

  const updateItem = (idx, field, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    setForm({ ...form, items });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { ...EMPTY_ITEM }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const fmtCurrency = (v) => `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div>
          <h1>Billing</h1>
          <p>Manage invoices, payments, and financial records</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditing(null); setForm({ ...EMPTY, items: [{ ...EMPTY_ITEM }] }); }}>
          <Plus size={15} /> New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{fmtCurrency(totalRevenue)}</div>
          <div className="stat-sub">From paid bills</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ fontSize: 22, color: "var(--amber)" }}>{fmtCurrency(totalPending)}</div>
          <div className="stat-sub">Awaiting payment</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Invoices</div>
          <div className="stat-value">{bills.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{ color: "var(--red)" }}>{bills.filter(b => b.status === "Overdue").length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-12 mb-16">
        <div className="search-bar">
          <Search size={14} />
          <input placeholder="Search by patient name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {["All", "Paid", "Pending", "Partial", "Overdue"].map(s => (
          <button key={s} className={`btn btn-sm ${filterStatus === s ? "btn-primary" : "btn-outline"}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Bills Table */}
        <div className="card" style={{ gridColumn: viewBill ? "1" : "1 / -1" }}>
          <div className="card-header">
            <span className="card-title">Invoices ({filtered.length})</span>
          </div>
          <div className="card-body table-wrap">
            {loading ? <div className="empty-state"><p>Loading...</p></div> : filtered.length === 0 ? (
              <div className="empty-state">
                <Receipt size={32} />
                <p>No invoices found</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b._id} style={{ cursor: "pointer", background: viewBill?._id === b._id ? "var(--teal-light)" : "" }}
                      onClick={() => setViewBill(viewBill?._id === b._id ? null : b)}>
                      <td className="name-cell">{b.patient?.name || "—"}</td>
                      <td>{b.doctor?.name?.replace("Dr. ", "") || "—"}</td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 12.5 }}>{b.date ? new Date(b.date).toLocaleDateString() : "—"}</td>
                      <td style={{ color: "var(--text3)", fontSize: 12.5 }}>{b.items?.length} item{b.items?.length !== 1 ? "s" : ""}</td>
                      <td style={{ fontWeight: 700, fontFamily: "var(--mono)" }}>{fmtCurrency(billTotal(b))}</td>
                      <td>
                        <div className="flex items-center gap-8" style={{ fontSize: 12.5, color: "var(--text3)" }}>
                          <CreditCard size={12} />{b.paymentMethod || "—"}
                        </div>
                      </td>
                      <td><span className={`badge ${statusBadge[b.status] || "badge-gray"}`}>{b.status}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="action-row">
                          <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(b)}><Edit3 size={13} /></button>
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} onClick={() => handleDelete(b._id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Bill Detail / Invoice View */}
        {viewBill && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Invoice Detail</span>
              <div className="flex gap-8">
                <button className="btn btn-outline btn-sm" onClick={() => window.print()}><Printer size={13} /> Print</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setViewBill(null)}><X size={14} /></button>
              </div>
            </div>
            <div style={{ padding: "20px 22px" }}>
              {/* Invoice header */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.5 }}>MediCore General</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>123 Health Ave, Medical District</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>INVOICE</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>{viewBill._id?.slice(-8).toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{viewBill.date ? new Date(viewBill.date).toLocaleDateString() : "—"}</div>
                </div>
              </div>
              <div className="divider" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16, fontSize: 13 }}>
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--text3)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 4 }}>Bill To</div>
                  <div style={{ fontWeight: 700 }}>{viewBill.patient?.name}</div>
                  <div style={{ color: "var(--text3)" }}>{viewBill.patient?.age}y, {viewBill.patient?.gender}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--text3)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 4 }}>Attending Doctor</div>
                  <div style={{ fontWeight: 700 }}>{viewBill.doctor?.name || "—"}</div>
                  <div style={{ color: "var(--text3)" }}>{viewBill.doctor?.specialization}</div>
                </div>
              </div>
              <div className="divider" />
              {/* Items */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", fontSize: 11, color: "var(--text3)", fontWeight: 600, letterSpacing: "0.5px", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>Description</th>
                    <th style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", fontWeight: 600, letterSpacing: "0.5px", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>Qty</th>
                    <th style={{ textAlign: "right", fontSize: 11, color: "var(--text3)", fontWeight: 600, letterSpacing: "0.5px", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>Unit Price</th>
                    <th style={{ textAlign: "right", fontSize: 11, color: "var(--text3)", fontWeight: 600, letterSpacing: "0.5px", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewBill.items?.map((item, i) => (
                    <tr key={i}>
                      <td style={{ padding: "8px 0", fontSize: 13 }}>{item.description}</td>
                      <td style={{ padding: "8px 0", fontSize: 13, textAlign: "center", color: "var(--text3)" }}>{item.quantity}</td>
                      <td style={{ padding: "8px 0", fontSize: 13, textAlign: "right", fontFamily: "var(--mono)" }}>{fmtCurrency(item.unitPrice)}</td>
                      <td style={{ padding: "8px 0", fontSize: 13, textAlign: "right", fontFamily: "var(--mono)", fontWeight: 600 }}>{fmtCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span className={`badge ${statusBadge[viewBill.status] || "badge-gray"}`}>{viewBill.status}</span>
                  {viewBill.paymentMethod && <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: 8 }}>via {viewBill.paymentMethod}</span>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11.5, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Amount</div>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--mono)", letterSpacing: -0.5, color: "var(--text)" }}>{fmtCurrency(billTotal(viewBill))}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? "Edit Invoice" : "New Invoice"}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Patient *</label>
                    <select className="form-select" required value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })}>
                      <option value="">Select patient</option>
                      {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Doctor</label>
                    <select className="form-select" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })}>
                      <option value="">Select doctor</option>
                      {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {["Pending","Paid","Partial","Overdue"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                      {["Cash","Card","Insurance","Online"].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                {/* Line Items */}
                <div style={{ marginBottom: 8, fontWeight: 700, fontSize: 13 }}>Line Items</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                  {form.items.map((item, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 60px 90px 32px", gap: 8, alignItems: "center" }}>
                      <input className="form-input" placeholder="Description" value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} required />
                      <input className="form-input" type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, "quantity", e.target.value)} required />
                      <input className="form-input" type="number" min="0" step="0.01" placeholder="Price" value={item.unitPrice} onChange={e => updateItem(idx, "unitPrice", e.target.value)} required />
                      <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--red)", padding: "6px" }} onClick={() => removeItem(idx)} disabled={form.items.length === 1}><X size={13} /></button>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={addItem}><Plus size={12} /> Add Item</button>

                <div className="divider" />
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, color: "var(--text3)" }}>Total:</span>
                  <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--mono)" }}>{fmtCurrency(formTotal())}</span>
                </div>

                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? "Save Changes" : "Create Invoice"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
