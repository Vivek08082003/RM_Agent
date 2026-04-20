export default function Rail() {
  const tabs = ["Info", "Document List", "Document Layout", "Collapse Layout"];
  return (
    <div className="rail">
      {tabs.map((tab) => (
        <div key={tab} className="rail-tab">{tab}</div>
      ))}
    </div>
  );
}