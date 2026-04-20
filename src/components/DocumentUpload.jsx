import { useState, useRef } from "react";

const DOC_TYPES = [
  "Select",
  "Identity Proof",
  "Address Proof",
  "Financial Statement",
  "ITR",
  "Bank Statement",
  "Business Registration",
  "GST Certificate",
  "Property Document",
  "Other",
];

export default function DocumentUpload() {
  const [rows, setRows]       = useState([]);
  const [selected, setSelected] = useState([]);
  const [docType, setDocType] = useState("");
  const fileRef = useRef();

  function handleFile(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const type = docType || "Other";
    const newRows = files.map(f => ({
      id: Date.now() + Math.random(),
      type,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + " KB",
      status: "Uploaded",
    }));
    setRows(prev => [...prev, ...newRows]);
    setDocType("");
    e.target.value = "";
  }

  function toggleSelect(id) {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }
  function toggleAll(e) { setSelected(e.target.checked ? rows.map(r => r.id) : []); }
  function deleteSelected() { setRows(p => p.filter(r => !selected.includes(r.id))); setSelected([]); }

  return (
    <div className="mt-table-wrap">
      <div className="mt-toolbar">
        <select
          className="du-type-select"
          value={docType}
          onChange={e => setDocType(e.target.value)}
        >
          {DOC_TYPES.map(t => <option key={t} value={t === "Select" ? "" : t}>{t}</option>)}
        </select>
        <button className="los-icon-btn" onClick={deleteSelected} title="Delete selected">🗑</button>
        <button className="los-icon-btn" onClick={() => fileRef.current.click()} title="Upload document">＋</button>
        <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={handleFile} />
      </div>
      <table className="los-table">
        <thead>
          <tr>
            <th style={{ width: 36 }}>
              <input type="checkbox" onChange={toggleAll} checked={rows.length > 0 && selected.length === rows.length} />
            </th>
            <th>Document Type</th>
            <th>File Name</th>
            <th>Size</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="mt-empty-row"><td colSpan={5}>No documents uploaded.</td></tr>
          ) : rows.map(r => (
            <tr key={r.id} className={selected.includes(r.id) ? "mt-row-selected" : ""}>
              <td><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} /></td>
              <td>{r.type}</td>
              <td>{r.name}</td>
              <td>{r.size}</td>
              <td><span className="du-status-badge">{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
