import { useState, useEffect } from "react";
import axios from "axios";
import { Users, Stethoscope, Calendar, Receipt, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

const API = "/api";

export default function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, bills: 0 });
  const [recentAppts, setRecentAppts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, d, a, b] = await Promise.all([
          axios.get(`${API}/patients`),
          axios.get(`${API}/doctors`),
          axios.get(`${API}/appointments`),
          axios.get(`${API}/bills`),
        ]);
        setStats({ patients: p.data.length, doctors: d.data.length, appointments: a.data.length, bills: b.data.length });
        setDoctors(d.data.slice(0, 5));
        setRecentAppts(a.data.slice(0, 6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    { label: "Total Patients", value: stats.patients, icon: Users, color: "teal", bg: "var(--teal-light)", fg: "var(--teal)" },
    { label: "Active Doctors", value: stats.doctors, icon: Stethoscope, color: "blue", bg: "var(--blue-light)", fg: "var(--blue)" },
    { label: "Appointments", value: stats.appointments, icon: Calendar, color: "purple", bg: "var(--purple-light)", fg: "var(--purple)" },
    { label: "Bills Issued", value: stats.bills, icon: Receipt, color: "amber", bg: "var(--amber-light)", fg: "var(--amber)" },
  ];

  const statusColor = (s) => {
    if (s === "Scheduled") return "badge-blue";
    if (s === "Completed") return "badge-green";
    if (s === "Cancelled") return "badge-red";
    return "badge-gray";
  };

  const docStatusColor = (s) => {
    if (s === "Available") return "badge-green";
    if (s === "Busy") return "badge-amber";
    return "badge-gray";
  };

  const avatarColors = ["avatar-teal", "avatar-blue", "avatar-purple", "avatar-amber", "avatar-green"];
  const initials = (name) => name ? name.split(" ").map(w => w[0]).join("").slice(0, 2) : "?";

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back — here's what's happening at MediCore today.</p>
      </div>

      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, bg, fg }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={18} color={fg} />
            </div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{loading ? "—" : value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Recent Appointments */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Appointments</span>
            <span className="badge badge-teal">{recentAppts.length} total</span>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="empty-state"><p>Loading...</p></div>
            ) : recentAppts.length === 0 ? (
              <div className="empty-state"><p>No appointments</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Patient</th><th>Doctor</th><th>Type</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {recentAppts.map((a, i) => (
                      <tr key={a._id}>
                        <td className="name-cell">{a.patient?.name || "—"}</td>
                        <td>{a.doctor?.name?.replace("Dr. ", "") || "—"}</td>
                        <td><span className="badge badge-gray">{a.type}</span></td>
                        <td><span className={`badge ${statusColor(a.status)}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Availability */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Doctor Availability</span>
          </div>
          <div className="card-body">
            <div style={{ padding: "8px 0" }}>
              {loading ? (
                <div className="empty-state"><p>Loading...</p></div>
              ) : doctors.map((d, i) => (
                <div key={d._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: i < doctors.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div className={`avatar ${avatarColors[i % avatarColors.length]}`}>{initials(d.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)" }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{d.specialization}</div>
                  </div>
                  <span className={`badge ${docStatusColor(d.status)}`}>{d.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
