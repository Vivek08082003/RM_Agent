import React, { useState, useEffect, useRef } from "react";
import aiData from "../data/callToTextData.json";

const AI_STEPS_CONFIG = [
  { d: 400, label: "Loading recording — 5m 12s detected...", nav: 0 },
  { d: 1200, label: "Running speech-to-text conversion...", nav: 0 },
  { d: 2400, label: "Detecting entities, intent & cross-sell signals...", nav: 1 },
  { d: 3500, label: "Generating structured summary + follow-up actions...", nav: 2 },
  { d: 4500, label: "Mapping to form, action & cross-sell fields...", nav: 3 },
];
const PROC_STEP_LABELS = [
  "🎧 Loading recording",
  "📝 Speech-to-text conversion",
  "🎯 Intent & entity detection",
  "💡 Generating conversation summary",
  "✏️ Mapping to form fields",
];
const NAV_TABS = ["Intent", "Summary", "Transcript", "Auto-Fill"];

export default function CallToTextAgentPage() {
  const [phase, setPhase] = useState("processing");
  const [procStep, setProcStep] = useState(0);
  const [procLabel, setProcLabel] = useState("Initialising...");
  const [activeTab, setActiveTab] = useState(0);
  const [sentimentAnimated, setSentimentAnimated] = useState(false);
  const timersRef = useRef([]);

  const {
    intentChips,
    sentiment,
    signals,
    extractedGroups,
    summary,
    transcript,
    transcriptMeta,
  } = aiData;

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    AI_STEPS_CONFIG.forEach((s, i) => {
      const t = setTimeout(() => {
        setProcStep(i + 1);
        setProcLabel(s.label);
        setActiveTab(s.nav);
      }, s.d);
      timersRef.current.push(t);
    });
    const done = setTimeout(() => {
      setPhase("results");
      setActiveTab(0);
      setTimeout(() => setSentimentAnimated(true), 300);
    }, 5600);
    timersRef.current.push(done);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  return (
    <div className="ctt-page">
      {/* Header */}
      <div className="mt-ai-header">
        <div className="mt-ai-title">
          🤖 Call to Text Agent <span className="mt-ai-badge">AI</span>
        </div>
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
        {phase === "processing" ? (
          <div className="mt-ai-processing">
            <div className="mt-spinner" />
            <div className="mt-proc-label">{procLabel}</div>
            <div className="mt-proc-steps">
              {PROC_STEP_LABELS.map((l, i) => (
                <div
                  key={i}
                  className={`mt-proc-step${procStep > i + 1 ? " done" : procStep === i + 1 ? " active" : ""}`}
                >
                  {l}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-ai-results">
            {/* Intent tab */}
            {activeTab === 0 && (
              <div className="ctt-tab-content">
                <div className="mt-ai-sub-header" style={{ cursor: "default" }}>
                  <span>🎯 Intent &amp; Signals</span>
                </div>
                <div className="mt-ai-sub-body">
                  <div className="mt-intent-chips">
                    {intentChips.map((c, i) => (
                      <span key={i} className={`mt-intent-chip ${c.cls}`}>
                        {c.label}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#888", margin: "10px 0 4px", letterSpacing: ".4px", textTransform: "uppercase" }}>
                    Borrower Sentiment
                  </div>
                  <div className="mt-sentiment-bar">
                    <div className="mt-sentiment-needle" style={{ left: sentimentAnimated ? `${sentiment.score}%` : "0%" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginBottom: 4 }}>
                    <span>Negative</span><span>Neutral</span><span>Positive</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#2e7d32", textAlign: "center", marginBottom: 12 }}>
                    {sentiment.label} — {sentiment.score} / {sentiment.max}
                  </div>
                  {signals.map((s, i) => (
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
                  <div className="mt-summary-box" dangerouslySetInnerHTML={{ __html: summary }} />
                </div>
              </div>
            )}

            {/* Transcript tab */}
            {activeTab === 2 && (
              <div className="ctt-tab-content">
                <div className="mt-ai-sub-header" style={{ cursor: "default" }}>
                  <span dangerouslySetInnerHTML={{ __html: `📝 Transcript <span style="font-weight:400;color:#4a78c4;font-size:10px;text-transform:none;margin-left:4px;">${transcriptMeta.duration} · ${transcriptMeta.confidence} confidence</span>` }} />
                </div>
                <div className="mt-ai-sub-body">
                  <div className="mt-transcript-scroll" style={{ maxHeight: "none" }}>
                    {transcript.map((t, i) => (
                      <div key={i} className="mt-transcript-line" style={i === transcript.length - 1 ? { marginBottom: 0 } : {}}>
                        <div className="mt-transcript-time">{t.time}</div>
                        <span className={`mt-speaker-tag ${t.speaker === "RM" ? "mt-spk-rm" : "mt-spk-borrower"}`}>{t.speaker}</span>
                        <span className="mt-transcript-text" dangerouslySetInnerHTML={{ __html: t.text }} />
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
                      {extractedGroups.map((g, gi) => (
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
