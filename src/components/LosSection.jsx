import { useState } from "react";
export default function LosSection({ title, children, defaultOpen=false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span>{open ? "▲" : "▼"}</span>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}