import React, { useState, useEffect, useRef } from "react";

const API_URL = "https://ainsg.newgensoftware.net/rm-agent/api/process-audio";

const PROC_STEP_LABELS = [
  "🎧 Loading recording",
  "📝 Speech-to-text conversion",
  "🎯 Intent & entity detection",
  "💡 Generating conversation summary",
  "✏️ Mapping to form fields",
];
const NAV_TABS = ["Intent", "Summary", "Transcript", "Auto-Fill"];

/* ── Map level to color/class ── */
const LEVEL_COLORS = {
  HIGH: "#c62828",
  MEDIUM: "#f57f17",
  WEAK: "#2e7d32",
  LOW: "#2e7d32",
};
const LEVEL_CLS = {
  HIGH: "ic-red",
  MEDIUM: "ic-yellow",
  WEAK: "ic-green",
  LOW: "ic-green",
};

/* ── Map intent code to chip color class (fallback) ── */
const INTENT_CLS = {
  DEBT_RESTRUCTURING: "ic-red",
  FUNDING: "ic-blue",
  CAPEX_EXPANSION: "ic-purple",
  REVOLVING_CREDIT: "ic-orange",
  FEDERAL_CONTRACT: "ic-green",
  FX_HEDGING: "ic-teal",
  CMS_INTEREST: "ic-yellow",
};

/* ── Format seconds to Xm Ys ── */
function fmtDuration(secs) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

/* ── Transform API response into UI-friendly shape ── */
function transformResponse(data) {
  const intentChips = (data.intent?.intents || []).map((i) => ({
    label: i.label,
    cls: INTENT_CLS[i.code] || "ic-blue",
  }));

  // Also add signal types as chips — color based on level
  (data.intent?.signals || []).forEach((s) => {
    intentChips.push({
      label: s.label,
      cls: LEVEL_CLS[s.level] || "ic-blue",
    });
  });

  const sentiment = {
    score: data.intent?.sentiment?.score ?? 50,
    label: data.intent?.sentiment?.label ?? "Neutral",
    max: 100,
  };

  // Signal dot color based on level
  const signals = (data.intent?.signals || []).map((s) => ({
    color: LEVEL_COLORS[s.level] || "#1565c0",
    cat: s.label,
    text: s.description,
  }));

  // Build extracted field groups
  const extractedGroups = [];

  // Call Details
  const cd = data.call_details;
  if (cd) {
    extractedGroups.push({
      title: "📞 Call Details",
      fields: [
        cd.duration && { field: "Duration", val: cd.duration.display_value, conf: cd.duration.verified ? "✓" : "" },
        cd.spoken_to && { field: "Spoken To", val: cd.spoken_to.display_value, conf: cd.spoken_to.verified ? "✓" : "" },
        cd.existing_banking && { field: "Existing Banking", val: cd.existing_banking.display_value, conf: cd.existing_banking.verified ? "✓" : "" },
        cd.existing_exposure && { field: "Existing Exposure", val: cd.existing_exposure.display_value, conf: cd.existing_exposure.verified ? "✓" : "" },
      ].filter(Boolean),
    });
  }

  // Action / Follow Up
  const afu = data.action_follow_up?.action_follow_up;
  if (afu) {
    const fields = [];
    if (afu.next_action) fields.push({ field: "Next Action", val: afu.next_action.display_value, valBold: true, conf: afu.next_action.ai_generated ? "✓ AI" : "✓", confCls: afu.next_action.ai_generated ? "mt-conf-blue" : "" });
    if (afu.follow_up_date?.display_value) fields.push({ field: "Follow Up Date", val: afu.follow_up_date.display_value, valBold: true, conf: afu.follow_up_date.ai_generated ? "✓ AI" : "✓", confCls: afu.follow_up_date.ai_generated ? "mt-conf-blue" : "" });
    if (afu.next_steps) fields.push({ field: "Next Steps", val: afu.next_steps.display_value, conf: afu.next_steps.ai_generated ? "✓ AI" : "✓", confCls: afu.next_steps.ai_generated ? "mt-conf-blue" : "" });
    if (fields.length) extractedGroups.push({ title: "📅 Action / Follow Up", fields });
  }

  // Cross-Sell
  const cs = data.cross_sell?.cross_sell;
  if (cs && cs.length > 0) {
    extractedGroups.push({
      title: "💡 Cross-Sell Opportunities",
      fields: cs.map((c) => ({
        field: c.label || c.type,
        val: c.display_value || c.description,
        conf: "✓ AI",
        confCls: "mt-conf-orange",
      })),
    });
  }

  // Borrower Intelligence
  const bi = data.borrower_intelligence?.borrower_intelligence;
  if (bi) {
    const fields = [];
    if (bi.promoter_background) fields.push({ field: "Promoter Background", val: bi.promoter_background.display_value, conf: "✓" });
    if (bi.future_capex) fields.push({ field: "Future Capex", val: bi.future_capex.display_value, conf: "✓" });
    if (bi.import_export_exposure) fields.push({ field: "Import / Export", val: bi.import_export_exposure.display_value, conf: "✓" });
    if (bi.distribution_model) fields.push({ field: "Distribution", val: bi.distribution_model.display_value, conf: "✓" });
    if (bi.subsidiaries_associates) fields.push({ field: "Associate / Subsidiary", val: bi.subsidiaries_associates.display_value, conf: "✓" });
    if (bi.overall_conclusion) fields.push({ field: "Conclusion", val: bi.overall_conclusion.display_value, conf: "✓" });
    if (fields.length) extractedGroups.push({ title: "🧠 Borrower Intelligence", fields });
  }

  const summaryText = data.summary?.summary?.text || "";

  const transcript = (data.transcript?.segments || []).map((seg, i) => ({
    time: "",
    speaker: seg.speaker === "BORROWER" ? "Borrower" : seg.speaker,
    text: seg.text,
  }));

  const transcriptMeta = {
    duration: fmtDuration(data.transcript?.duration),
    confidence: data.transcript?.confidence ? `${Math.round(data.transcript.confidence * 100)}%` : "—",
  };

  return { intentChips, sentiment, signals, extractedGroups, summary: summaryText, transcript, transcriptMeta };
}

export default function CallToTextAgentPage() {
  const [phase, setPhase] = useState("upload"); // upload | processing | results | error
  const [procStep, setProcStep] = useState(0);
  const [procLabel, setProcLabel] = useState("Initialising...");
  const [activeTab, setActiveTab] = useState(0);
  const [sentimentAnimated, setSentimentAnimated] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileReady, setFileReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [aiData, setAiData] = useState(null);
  const fileRef = useRef(null);
  const selectedFileRef = useRef(null);
  const timersRef = useRef([]);
  const procIntervalRef = useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    selectedFileRef.current = file;
    setFileName(file.name);
    setFileReady(false);
    setUploadProgress(0);
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 18;
      if (pct >= 100) { pct = 100; clearInterval(iv); setFileReady(true); }
      setUploadProgress(Math.min(pct, 100));
    }, 80);
  }

  function startProcessing() {
    if (!selectedFileRef.current) return;
    setPhase("processing");
    setProcStep(0);
    setProcLabel("Uploading audio to AI Agent...");
    setActiveTab(0);
    setSentimentAnimated(false);

    // Animate processing steps while API call runs
    let step = 0;
    const labels = [
      "Uploading audio to AI Agent...",
      "Running speech-to-text conversion...",
      "Detecting entities, intent & cross-sell signals...",
      "Generating structured summary + follow-up actions...",
      "Mapping to form, action & cross-sell fields...",
    ];
    procIntervalRef.current = setInterval(() => {
      step++;
      if (step < labels.length) {
        setProcStep(step);
        setProcLabel(labels[step]);
        setActiveTab(Math.min(step, 3));
      }
    }, 3000);

    // Call API
    const formData = new FormData();
    formData.append("file", selectedFileRef.current);

    fetch(API_URL, { method: "POST", body: formData })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        clearInterval(procIntervalRef.current);
        if (data.status !== "success") throw new Error(data.message || "Processing failed");
        const transformed = transformResponse(data);
        setAiData(transformed);
        // Quick finish animation
        setProcStep(5);
        setProcLabel("Ready — launching AI Panel");
        setActiveTab(3);
        setTimeout(() => {
          setPhase("results");
          setActiveTab(0);
          setTimeout(() => setSentimentAnimated(true), 300);
        }, 600);
      })
      .catch((err) => {
        clearInterval(procIntervalRef.current);
        setErrorMsg(err.message);
        setPhase("error");
      });
  }

  function resetToUpload() {
    setPhase("upload");
    setFileName("");
    setUploadProgress(0);
    setFileReady(false);
    setAiData(null);
    setErrorMsg("");
    selectedFileRef.current = null;
    if (fileRef.current) fileRef.current.value = "";
  }

  useEffect(() => {
    return () => {
      clearInterval(procIntervalRef.current);
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="ctt-page">
      {/* Header */}
      <div className="mt-ai-header">
        <div className="mt-ai-title">
          🤖 Call to Text Agent <span className="mt-ai-badge">AI</span>
        </div>
        {phase === "results" && (
          <button className="ctt-new-btn" onClick={resetToUpload}>+ New Recording</button>
        )}
      </div>

      {/* Tab bar */}
      <div className="mt-ai-stepbar">
        {NAV_TABS.map((s, i) => (
          <div
            key={s}
            className={`mt-ai-step${phase === "results" ? (activeTab === i ? " active" : " done") : (activeTab > i ? " done" : activeTab === i ? " active" : "")}`}
            onClick={() => phase === "results" && setActiveTab(i)}
            style={phase === "results" ? { cursor: "pointer" } : {}}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="ctt-body">
        {/* Upload phase */}
        {phase === "upload" && (
          <div className="ctt-upload-screen">
            <div className="ctt-upload-icon">🎙️</div>
            <div className="ctt-upload-title">Upload Audio Recording</div>
            <div className="ctt-upload-sub">Upload a call recording to analyze with AI</div>
            <button className="ctt-upload-btn" onClick={() => fileRef.current.click()}>
              📎 Select Audio File
            </button>
            <input ref={fileRef} type="file" accept="audio/*" style={{ display: "none" }} onChange={handleFileSelect} />
            {fileName && (
              <div className="ctt-file-info">
                <div className="ctt-file-name" style={{ color: fileReady ? "#2e7d32" : "#666" }}>
                  {fileReady ? "✓" : "📎"} {fileName} {fileReady && "— Ready"}
                </div>
                <div className="mt-upload-progress">
                  <div className="mt-upload-fill" style={{ width: uploadProgress + "%", background: fileReady ? "#2e7d32" : "#1565c0" }} />
                </div>
              </div>
            )}
            {fileReady && (
              <button className="ctt-fetch-btn" onClick={startProcessing}>
                🤖 Fetch AI Response
              </button>
            )}
          </div>
        )}

        {/* Processing phase */}
        {phase === "processing" && (
          <div className="mt-ai-processing">
            <div className="mt-spinner" />
            <div className="mt-proc-label">{procLabel}</div>
            <div className="mt-proc-steps">
              {PROC_STEP_LABELS.map((l, i) => (
                <div
                  key={i}
                  className={`mt-proc-step${procStep > i ? " done" : procStep === i ? " active" : ""}`}
                >
                  {l}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error phase */}
        {phase === "error" && (
          <div className="ctt-upload-screen">
            <div className="ctt-upload-icon">⚠️</div>
            <div className="ctt-upload-title" style={{ color: "#c62828" }}>Processing Failed</div>
            <div className="ctt-upload-sub">{errorMsg}</div>
            <button className="ctt-upload-btn" onClick={resetToUpload}>Try Again</button>
          </div>
        )}

        {/* Results phase */}
        {phase === "results" && aiData && (
          <div className="mt-ai-results">
            {/* Intent tab */}
            {activeTab === 0 && (
              <div className="ctt-tab-content">
                <div className="mt-ai-sub-header" style={{ cursor: "default" }}>
                  <span>🎯 Intent &amp; Signals</span>
                </div>
                <div className="mt-ai-sub-body">
                  <div className="mt-intent-chips">
                    {aiData.intentChips.map((c, i) => (
                      <span key={i} className={`mt-intent-chip ${c.cls}`}>{c.label}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#888", margin: "10px 0 4px", letterSpacing: ".4px", textTransform: "uppercase" }}>
                    Borrower Sentiment
                  </div>
                  <div className="mt-sentiment-bar">
                    <div className="mt-sentiment-needle" style={{ left: sentimentAnimated ? `${aiData.sentiment.score}%` : "0%" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginBottom: 4 }}>
                    <span>Negative</span><span>Neutral</span><span>Positive</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#2e7d32", textAlign: "center", marginBottom: 12 }}>
                    {aiData.sentiment.label} — {aiData.sentiment.score} / {aiData.sentiment.max}
                  </div>
                  {aiData.signals.map((s, i) => (
                    <div key={i} className="mt-signal-item">
                      <div className="mt-signal-dot" style={{ background: s.color }} />
                      <div>
                        <div className="mt-signal-cat">{s.cat}</div>
                        <div className="mt-signal-text">{s.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary tab */}
            {activeTab === 1 && (
              <div className="ctt-tab-content">
                <div className="mt-ai-sub-header" style={{ cursor: "default" }}>
                  <span>💡 Conversation Summary</span>
                </div>
                <div className="mt-ai-sub-body">
                  <div className="mt-summary-box">{aiData.summary}</div>
                </div>
              </div>
            )}

            {/* Transcript tab */}
            {activeTab === 2 && (
              <div className="ctt-tab-content">
                <div className="mt-ai-sub-header" style={{ cursor: "default" }}>
                  <span>📝 Transcript <span style={{ fontWeight: 400, color: "#4a78c4", fontSize: 10, textTransform: "none", marginLeft: 4 }}>{aiData.transcriptMeta.duration} · {aiData.transcriptMeta.confidence} confidence</span></span>
                </div>
                <div className="mt-ai-sub-body">
                  <div className="mt-transcript-scroll" style={{ maxHeight: "none" }}>
                    {aiData.transcript.map((t, i) => (
                      <div key={i} className="mt-transcript-line" style={i === aiData.transcript.length - 1 ? { marginBottom: 0 } : {}}>
                        <span className={`mt-speaker-tag ${t.speaker === "RM" ? "mt-spk-rm" : "mt-spk-borrower"}`}>{t.speaker}</span>
                        <span className="mt-transcript-text">{t.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Auto-Fill tab */}
            {activeTab === 3 && (
              <div className="ctt-tab-content">
                <div className="mt-ai-sub-header" style={{ cursor: "default" }}>
                  <span>✏️ Extracted Field Values</span>
                </div>
                <div className="mt-ai-sub-body">
                  <table className="mt-extract-table">
                    <tbody>
                      {aiData.extractedGroups.map((g, gi) => (
                        <React.Fragment key={gi}>
                          <tr className="mt-ext-group"><td colSpan={2}>{g.title}</td></tr>
                          {g.fields.map((f, fi) => (
                            <tr key={fi}>
                              <td className="mt-ext-field">{f.field}</td>
                              <td>
                                {f.valBold ? <strong>{f.val}</strong> : f.val}
                                {f.extra || ""}{" "}
                                <span className={`mt-conf${f.confCls ? ` ${f.confCls}` : ""}`}>{f.conf}</span>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      {phase === "results" && (
        <div className="mt-ai-actions">
          <button className="mt-ai-action-btn mt-aab-primary">
            ✔ Accept &amp; Auto-Fill All Sections
          </button>
          <button className="mt-ai-action-btn mt-aab-outline">📤 Export</button>
        </div>
      )}
    </div>
  );
}
