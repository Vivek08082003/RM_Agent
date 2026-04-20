import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function ActionFollowup() {
  const [nextAction, setNextAction]     = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [immediatefu, setImmediatefu]   = useState("");
  const [nextSteps, setNextSteps]       = useState("");
  const [aiBanner, setAiBanner]         = useState(false);

  const aiFilled = useSelector(s => s.ui.aiFilled);
  const afuData  = useSelector(s => s.ui.afuData);

  useEffect(() => {
    if (aiFilled && afuData) {
      setNextAction(afuData.nextAction || "");
      setFollowUpDate(afuData.followUpDate || "");
      setImmediatefu(afuData.immediateFU || "");
      setNextSteps(afuData.nextSteps || "");
      setAiBanner(true);
    }
  }, [aiFilled, afuData]);

  return (
    <div>
      {aiBanner && (
        <div className="afu-ai-banner">
          🤖 AI Agent populated these fields based on the call transcript
        </div>
      )}

      <div className="afu-grid">
        <div className="afu-field">
          <label className="afu-label">Next Action</label>
          <select className="afu-select" value={nextAction} onChange={e => setNextAction(e.target.value)}>
            <option value="">Select</option>
            <option>Visit</option>
            <option>Call</option>
            <option>Email</option>
            <option>Wait</option>
            <option>Meeting</option>
          </select>
        </div>

        <div className="afu-field">
          <label className="afu-label">Follow Up Date</label>
          <div className="afu-date-wrap">
            <input
              className="afu-input"
              placeholder="DD/MM/YYYY"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
            />
            <span className="afu-cal-icon">📅</span>
          </div>
        </div>

        <div className="afu-field">
          <label className="afu-label">Immediate Follow-Up Required ?</label>
          <select className="afu-select" value={immediatefu} onChange={e => setImmediatefu(e.target.value)}>
            <option value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
      </div>

      <div className="afu-field">
        <label className="afu-label">Next Steps / Action Plans</label>
        <textarea
          className="afu-textarea"
          rows={4}
          value={nextSteps}
          onChange={e => setNextSteps(e.target.value)}
        />
      </div>
    </div>
  );
}