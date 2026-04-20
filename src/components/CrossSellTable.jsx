import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const DEPARTMENTS = [
  "Select",
  "Treasury & FX",
  "Transaction Banking / CMS",
  "Trade Finance",
  "Retail Loans",
  "Credit Card Loans",
  "Insurance",
  "Wealth Management",
];

const EMPTY_FORM = { dept: "", email: "", contact: "", entityEmail: "", notes: "" };

export default function CrossSellTable() {
  const [rows, setRows]       = useState([]);
  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [aiBanner, setAiBanner] = useState(false);

  const aiFilled = useSelector(s => s.ui.aiFilled);
  const csRows   = useSelector(s => s.ui.csRows);

  useEffect(() => {
    if (aiFilled && csRows && csRows.length > 0) {
      const newRows = csRows.map((r, i) => ({
        id: Date.now() + i,
        dept: r.dept,
        notes: r.notes,
        email: r.email,
        contact: r.contact,
        aiRow: true,
      }));
      setRows(prev => [...prev, ...newRows]);
      setAiBanner(true);
    }
  }, [aiFilled, csRows]);

  function openModal()  { setModalOpen(true); setForm(EMPTY_FORM); }
  function closeModal() { setModalOpen(false); }

  function saveRecord() {
    if (!form.dept || form.dept === "Select") {
      alert("Please select a Department."); return;
    }
    setRows(prev => [...prev, { id: Date.now(), ...form }]);
    closeModal();
  }

  function toggleSelect(id) {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }
  function toggleAll(e) { setSelected(e.target.checked ? rows.map(r => r.id) : []); }
  function deleteSelected() { setRows(p => p.filter(r => !selected.includes(r.id))); setSelected([]); }

  const fld = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <>
      {aiBanner && (
        <div className="cs-ai-banner">
          🤖 AI Agent identified cross-sell opportunities from the call conversation
        </div>
      )}

      <div className="mt-table-wrap">
        <div className="mt-toolbar">
          <button className="los-icon-btn" onClick={deleteSelected} title="Delete selected">🗑</button>
          <button className="los-icon-btn" onClick={openModal} title="Add record">＋</button>
        </div>
        <table className="los-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input type="checkbox" onChange={toggleAll} checked={rows.length > 0 && selected.length === rows.length} />
              </th>
              <th>Department</th>
              <th>Cross Sell Opportunity</th>
              <th>Email Id</th>
              <th>Contact No.</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="mt-empty-row"><td colSpan={5}>Please click "+" to add record</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className={`cs-row-ai${selected.includes(r.id) ? " mt-row-selected" : ""}`}>
                <td><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} /></td>
                <td><strong style={{ fontSize: 11.5 }}>{r.dept}</strong></td>
                <td style={{ fontSize: 11.5, maxWidth: 220, lineHeight: 1.4 }}>{r.notes || "—"}</td>
                <td style={{ fontSize: 11.5 }}>{r.email || "—"}</td>
                <td style={{ fontSize: 11.5 }}>
                  {r.contact || "—"}
                  <span className="ai-row-badge ai-row-badge-green" style={{ marginLeft: 6 }}>🤖 AI</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="mt-modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="cs-modal">
            <div className="cs-modal-topbar">
              <div className="cs-modal-nav">
                <button className="cs-nav-btn">◀</button>
                <button className="cs-nav-btn">▶</button>
              </div>
              <button className="cs-save-btn" onClick={saveRecord}>Save Changes</button>
              <button className="cs-close-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="cs-modal-body">
              <div className="cs-form-row">
                <div className="cs-field">
                  <label className="cs-label">Department <span className="mt-req">*</span></label>
                  <select className="cs-select" value={form.dept} onChange={fld("dept")}>
                    {DEPARTMENTS.map(d => <option key={d} value={d === "Select" ? "" : d}>{d}</option>)}
                  </select>
                </div>
                <div className="cs-field">
                  <label className="cs-label">Email Id <span className="mt-req">*</span></label>
                  <input className="cs-input" placeholder="dept@bank.com" value={form.email} onChange={fld("email")} />
                </div>
                <div className="cs-field">
                  <label className="cs-label">Entity Contact No.</label>
                  <input className="cs-input" value={form.contact} onChange={fld("contact")} />
                </div>
              </div>
              <div className="cs-form-row cs-two-col">
                <div className="cs-field">
                  <label className="cs-label">Entity E-mail Id</label>
                  <input className="cs-input" value={form.entityEmail} onChange={fld("entityEmail")} />
                </div>
                <div />
              </div>
              <div className="cs-form-row cs-one-col">
                <div className="cs-field">
                  <label className="cs-label">Cross Sell Opportunities</label>
                  <textarea className="cs-textarea" rows={4} placeholder="Describe the cross-sell opportunity..." value={form.notes} onChange={fld("notes")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}