import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Constants ─── */
const BAR_COLORS = ["#7B5EA7","#4A90D9","#D44F3E","#E8882A","#3BAA6E","#E8AA2A","#7B5EA7","#4A90D9","#D44F3E"];
const LS_COLORS  = {
  "Hot Lead":  { bg:"#FFF0E6", text:"#C85A1A", border:"#F5C8A8" },
  "Warm Lead": { bg:"#FFF8E1", text:"#9A6800", border:"#F5DFA0" },
  "Cold Lead": { bg:"#EEF4FF", text:"#2255B0", border:"#B8CCF0" },
};
const FALLBACK = {
  conversion_status:"Converted", conversion_probability:91.5,
  conversion_params:[
    {name:"Age of Lead Days",value:"0",contribution_pct:12.0},{name:"Deal Size ($M)",value:"85",contribution_pct:11.2},
    {name:"FICO Score",value:"782",contribution_pct:10.8},{name:"Revenue / Deal Size",value:"3.67",contribution_pct:9.5},
    {name:"Lead Source",value:"RM Referral",contribution_pct:8.1},{name:"S&P Rating",value:"BBB+",contribution_pct:7.6},
    {name:"Engagement Count",value:"5",contribution_pct:6.9},
  ],
  lead_status:"Hot Lead", lead_score:87,
  lead_params:[
    {name:"Lead Source",value:"RM Referral",contribution_pct:9.2},{name:"Entity Type",value:"Private Corporation",contribution_pct:8.4},
    {name:"Publicly Listed",value:"No",contribution_pct:4.1},{name:"Company State",value:"Texas",contribution_pct:5.3},
    {name:"Industry",value:"Infrastructure",contribution_pct:7.8},{name:"S&P Rating",value:"BBB+",contribution_pct:6.9},
    {name:"Conversion Status",value:"Converted",contribution_pct:10.1},{name:"Loan Purpose",value:"Capex",contribution_pct:7.2},
    {name:"FICO Score",value:"782",contribution_pct:6.5},{name:"Business Vintage (Yrs)",value:"35",contribution_pct:5.8},
    {name:"Age of Lead Days",value:"0",contribution_pct:5.1},{name:"Revenue / Deal Size",value:"3.67",contribution_pct:4.7},
    {name:"Annual Revenue ($M)",value:"312",contribution_pct:4.4},{name:"Total Calls / Meetings",value:"3",contribution_pct:3.9},
    {name:"Deal Size ($M)",value:"85",contribution_pct:5.6},{name:"Last Interaction Days",value:"0",contribution_pct:4.2},
    {name:"Type of Touchpoints",value:"2",contribution_pct:3.6},{name:"Previous Engagement Count",value:"5",contribution_pct:7.1},
  ],
  next_action:"Expedite credit evaluation and propose FX hedging", priority_score:5.8, urgency:"High",
  action_params:[
    {name:"Lead Source",value:"RM Referral",contribution_pct:8.6},{name:"Entity Type",value:"Private Corporation",contribution_pct:7.4},
    {name:"Company State",value:"Texas",contribution_pct:5.2},{name:"S&P Rating",value:"BBB+",contribution_pct:9.1},
    {name:"Loan Purpose",value:"Capex",contribution_pct:7.8},{name:"Conversion Status",value:"Converted",contribution_pct:10.3},
    {name:"Lead Status",value:"Hot Lead",contribution_pct:8.9},{name:"Type of Touchpoints",value:"2",contribution_pct:4.7},
    {name:"FICO Score",value:"782",contribution_pct:6.2},{name:"Age of Lead Days",value:"0",contribution_pct:4.8},
    {name:"Previous Engagement Count",value:"5",contribution_pct:5.5},{name:"Annual Revenue ($M)",value:"312",contribution_pct:7.1},
    {name:"Revenue / Deal Size",value:"3.67",contribution_pct:4.3},{name:"Business Vintage (Yrs)",value:"35",contribution_pct:6.8},
    {name:"Total Calls / Meetings",value:"3",contribution_pct:5.9},{name:"Deal Size ($M)",value:"85",contribution_pct:4.6},
    {name:"Last Interaction Days",value:"0",contribution_pct:4.2},{name:"Publicly Listed",value:"No",contribution_pct:3.5},
  ],
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const calcWait = n => 2500 + n * 100 + n * 200 + 400;

/* ─── SVG Gauge ─── */
function Gauge({ value }) {
  const cx=140, cy=128, R=104, iR=62;
  const pt = (a, r) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  const arc = (a1, a2) => {
    const s=pt(a1,R), e=pt(a2,R), si=pt(a2,iR), ei=pt(a1,iR);
    const lf = a2-a1>Math.PI ? 1 : 0;
    return `M${s.x},${s.y} A${R},${R} 0 ${lf},1 ${e.x},${e.y} L${si.x},${si.y} A${iR},${iR} 0 ${lf},0 ${ei.x},${ei.y} Z`;
  };
  const zones = [
    {from:Math.PI,       to:Math.PI*1.22, color:"#3BAA6E"},
    {from:Math.PI*1.22,  to:Math.PI*1.44, color:"#8BC34A"},
    {from:Math.PI*1.44,  to:Math.PI*1.57, color:"#CDDC39"},
    {from:Math.PI*1.57,  to:Math.PI*1.68, color:"#FFEB3B"},
    {from:Math.PI*1.68,  to:Math.PI*1.79, color:"#FFC107"},
    {from:Math.PI*1.79,  to:Math.PI*1.89, color:"#FF9800"},
    {from:Math.PI*1.89,  to:Math.PI*2,    color:"#E53935"},
  ];
  const pct = Math.min(Math.max(value, 0), 100) / 100;
  const nTip = pt(Math.PI + pct * Math.PI, R - 16);
  const labels = [0,20,40,60,80,100];
  return (
    <svg viewBox="0 0 280 148" width="100%" style={{ display:"block" }}>
      {zones.map((z,i) => <path key={i} d={arc(z.from,z.to)} fill={z.color} />)}
      {labels.map(t => {
        const tp = pt(Math.PI+(t/100)*Math.PI, R+13);
        return <text key={t} x={tp.x} y={tp.y} textAnchor="middle" dominantBaseline="central" style={{fontSize:10,fill:"#888",fontFamily:"Arial,sans-serif"}}>{t}</text>;
      })}
      <circle cx={cx} cy={cy} r={iR-1} fill="white" />
      <line x1={cx} y1={cy} x2={nTip.x} y2={nTip.y} stroke="#555" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="7" fill="#555" />
      <rect x={cx-36} y={cy-30} width="72" height="24" rx="4" fill="white" stroke="#DDD" strokeWidth="0.5" />
      <text x={cx} y={cy-17} textAnchor="middle" dominantBaseline="central" style={{fontSize:13,fontWeight:700,fill:"#1a1a1a",fontFamily:"Arial,sans-serif"}}>{value.toFixed(2)}</text>
      <text x={cx} y={cy-6} textAnchor="middle" dominantBaseline="central" style={{fontSize:8,fill:"#AAA",fontFamily:"Arial,sans-serif"}}>Probability</text>
    </svg>
  );
}

/* ─── Param list for a step column ─── */
function ParamList({ params, visible }) {
  const [animated, setAnimated] = useState([]);
  useEffect(() => {
    if (!visible || !params) return;
    const INIT=2500, PER=100, DUR=200;
    const timers = params.map((_, i) =>
      setTimeout(() => setAnimated(prev => [...prev, i]), INIT + i*PER + DUR)
    );
    return () => timers.forEach(clearTimeout);
  }, [params, visible]);

  if (!visible || !params) return <div className="ov-idle-msg">Awaiting input…</div>;
  return (
    <>
      {params.map((p, i) => {
        const color = BAR_COLORS[i % BAR_COLORS.length];
        const filled = animated.includes(i);
        return (
          <div key={i} className="ov-param-row" style={{ animationDelay: ((2500+i*100)/1000)+"s" }}>
            <div className="ov-param-bar-wrap">
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span className="ov-param-name">{p.name}</span>
                {filled && <span className="ov-param-pct" style={{ color }}>{p.contribution_pct}%</span>}
              </div>
              <div className="ov-param-bar">
                <div className="ov-param-bar-fill" style={{ width: filled ? Math.min(p.contribution_pct*6,100)+"%" : "0%", background: color }} />
              </div>
              <div className="ov-param-contrib">Contribution to Score</div>
            </div>
            {filled && <div className="ov-param-val-box">{p.value}</div>}
            <div className="ov-param-check">✓</div>
          </div>
        );
      })}
    </>
  );
}

/* ─── Step Column ─── */
function StepCol({ num, title, subtitle, state, badge, params }) {
  return (
    <div className={`ov-step-col${state==="running"?" running":state==="done"?" done":""}`}>
      <div className={`ov-step-header ${state==="running"?"ov-step-run":state==="done"?"ov-step-done":"ov-step-idle"}`}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div className={`ov-step-num${state==="running"?" running":state==="done"?" done":""}`}>
            {state==="done" ? "✓" : num}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <span className={`ov-step-title ${state==="running"?"ov-title-run":state==="done"?"ov-title-done":"ov-title-idle"}`}>{title}</span>
            </div>
            <div style={{ fontSize:9, color:"#bbb", marginTop:1 }}>{subtitle}</div>
          </div>
          {state==="running" && <span className="ov-running-tag">RUNNING…</span>}
        </div>
        {badge && <div style={{ marginTop:7 }}><span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:14, fontSize:10, fontWeight:700, background:badge.bg, color:badge.text, border:`1px solid ${badge.border}` }}>✓ {badge.label}: <strong>{badge.val}</strong></span></div>}
      </div>
      {params && (
        <div className="ov-param-thead">
          <div style={{ flex:1, padding:"5px 12px", fontSize:10, fontWeight:700, color:"#7B5EA7" }}>Parameters</div>
          <div style={{ width:108, padding:"5px 12px", fontSize:10, fontWeight:700, color:"#7B5EA7", flexShrink:0 }}>Values</div>
        </div>
      )}
      <div className="ov-param-list">
        <ParamList params={params} visible={!!params} />
      </div>
    </div>
  );
}

/* ─── Arrow between steps ─── */
function StepArrow({ done }) {
  return (
    <div className="ov-arrow-wrap">
      <svg width="44" height="44" viewBox="0 0 52 44">
        <path d="M4 22 Q26 5 48 22" fill="none" stroke="#e0e0e0" strokeWidth="1.8" strokeDasharray="4 3"/>
        <path d="M4 22 Q26 5 48 22" fill="none" stroke={done?"#3baa6e":"#ccc"} strokeWidth="2.5" strokeLinecap="round"
          style={{ strokeDasharray:66, strokeDashoffset: done?0:66, transition:"stroke-dashoffset .85s ease" }}/>
      </svg>
    </div>
  );
}

/* ─── Lead Eval Overlay ─── */
function LeadEvalOverlay({ onClose, onSave }) {
  const [steps, setSteps]       = useState([null, null, null]); // idle | running | done
  const [badges, setBadges]     = useState([null, null, null]);
  const [arrows, setArrows]     = useState([false, false]);
  const [paramData, setParamData] = useState([null, null, null]);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusColor, setStatusColor] = useState("#e8a22a");
  const [footerMsg, setFooterMsg] = useState("Run Evaluate Lead to generate profiling results");
  const [footerColor, setFooterColor] = useState("#aaa");
  const [result, setResult]     = useState(null);
  const [panelReady, setPanelReady] = useState(false);
  const [probPct, setProbPct]   = useState(0);
  const [canSave, setCanSave]   = useState(false);
  const loading = useRef(true);

  const setStep = (i, s) => setSteps(p => { const a=[...p]; a[i]=s; return a; });
  const setBadge = (i, b) => setBadges(p => { const a=[...p]; a[i]=b; return a; });
  const setArrow = (i, v) => setArrows(p => { const a=[...p]; a[i]=v; return a; });
  const setParams = (i, v) => setParamData(p => { const a=[...p]; a[i]=v; return a; });

  useEffect(() => {
    (async () => {
      const r = FALLBACK;
      setResult(r);
      const lsc = LS_COLORS[r.lead_status] || LS_COLORS["Hot Lead"];

      setStep(0,"running");
      setStatusMsg("Analysing conversion signals…");
      setFooterMsg("⏳ AI pipeline in progress — please wait before saving");
      setFooterColor("#e8a22a");
      setParams(0, r.conversion_params);
      await sleep(calcWait(r.conversion_params.length));
      setStep(0,"done");
      setBadge(0,{ label:"Probability", val:"High", bg:"#e8f5e9", text:"#1b5e20", border:"#b8dfc0" });
      setStatusMsg("Conversion determined. Classifying lead temperature…");
      await sleep(350); setArrow(0,true); await sleep(900);

      setStep(1,"running");
      setStatusMsg("Classifying lead temperature…");
      setParams(1, r.lead_params);
      await sleep(calcWait(r.lead_params.length));
      setStep(1,"done");
      setBadge(1,{ label:"Category", val:r.lead_status, bg:lsc.bg, text:lsc.text, border:lsc.border });
      setStatusMsg("Lead status set. Computing next best action…");
      await sleep(350); setArrow(1,true); await sleep(900);

      setStep(2,"running");
      setStatusMsg("Computing next best action for RM…");
      setParams(2, r.action_params);
      await sleep(calcWait(r.action_params.length));
      setStep(2,"done");
      setBadge(2,{ label:"Action", val:r.next_action, bg:"#eef2ff", text:"#3730a3", border:"#c7d2fe" });
      setStatusColor("#3baa6e");
      setStatusMsg("✓ AI analysis complete");
      await sleep(500);

      setProbPct(r.conversion_probability);
      setPanelReady(true);
      loading.current = false;
      setCanSave(true);
      setFooterColor("#3baa6e");
      setFooterMsg("✓ Analysis complete — results ready to save");

      // Propagate to outer decision panel
      const ps = r.priority_score || 0;
      const suggested = ps>=5.0?"Approve":ps>=3.5?"Refer to Credit":ps>=2.0?"Hold":"Pending Information";
      const remarks = `AI Profiling: ${r.lead_status}. Probability of conversion: ${r.conversion_probability.toFixed(2)}%. Suggested action: ${r.next_action}.`;
      onSave({ decision: suggested, remarks, profilingStatus: r.lead_status, lsc, aiTag: true });
    })();
  }, []);

  function handleClose() {
    if (loading.current) return;
    onClose();
  }

  const r = result;
  const lsc = r ? (LS_COLORS[r.lead_status] || LS_COLORS["Hot Lead"]) : {};
  const isConv = r?.conversion_status === "Converted";

  return (
    <div className="dec-overlay-backdrop">
      <div className="dec-overlay">

        {/* Chrome bar */}
        <div className="dec-chrome-bar">
          <div className="dec-dot dec-dot-red" onClick={handleClose} />
          <div className="dec-dot dec-dot-yellow" />
          <div className="dec-dot dec-dot-green" />
          <div className="dec-chrome-url">
            clos.firstcapitalbank.com/lead-origination/CLOS-36776 · Lead Profiling
          </div>
        </div>

        {/* Header */}
        <div className="dec-ov-header">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span className="dec-ov-title">Lead Profiling</span>
            <span className="dec-ai-powered">✦ Powered by AI</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:11, color:statusColor, fontWeight:600 }}>{statusMsg}</span>
          </div>
        </div>

        {/* Body */}
        <div className="dec-ov-body">

          {/* Pipeline */}
          <div className="dec-pipeline">
            <StepCol num={1} title="Conversion Probability" subtitle="Predicts conversion likelihood"
              state={steps[0]||"idle"} badge={badges[0]} params={paramData[0]} />
            <StepArrow done={arrows[0]} />
            <StepCol num={2} title="Lead Status" subtitle="Classifies lead temperature"
              state={steps[1]||"idle"} badge={badges[1]} params={paramData[1]} />
            <StepArrow done={arrows[1]} />
            <StepCol num={3} title="Next Best Action" subtitle="Recommends RM follow-up"
              state={steps[2]||"idle"} badge={badges[2]} params={paramData[2]} />
          </div>

          {/* Right panel */}
          <div className="dec-right-panel">
            <div className="dec-right-label">Probability</div>

            <div style={{ width:"100%", opacity: panelReady?1:.14, transition:"opacity 1s" }}>
              <Gauge value={probPct} />
            </div>

            <div style={{ width:"100%", marginTop:8, marginBottom:12, opacity: panelReady?1:.14, transition:"opacity 1s .2s" }}>
              <div style={{ fontSize:11, color:"#555", marginBottom:4 }}>Probability of Conversion</div>
              <div style={{ height:20, background:"#eee", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width: probPct+"%", background:"#e8c43a", transition:"width 1.4s ease .4s", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {panelReady && <span style={{ fontSize:11, fontWeight:700, color:"white" }}>{probPct.toFixed(2)}%</span>}
                </div>
              </div>
            </div>

            <div style={{ width:"100%", display:"flex", alignItems:"center", gap:8, marginBottom:12, opacity: panelReady?1:.14, transition:"opacity 1s .4s" }}>
              <span style={{ fontSize:11, color:"#555" }}>Category</span>
              {r && <span style={{ padding:"4px 14px", borderRadius:20, fontSize:11, fontWeight:700, background:lsc.bg, color:lsc.text, border:`1px solid ${lsc.border}` }}>{r.lead_status}</span>}
            </div>

            <div style={{ width:"100%", background:"#f5f0ff", border:"1px solid #e0d0f5", borderRadius:5, padding:"10px 12px", marginBottom:10, opacity: panelReady?1:.14, transition:"opacity 1s .6s" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#444", marginBottom:6 }}>Suggestions</div>
              <div style={{ display:"flex", gap:5, alignItems:"flex-start", marginBottom:8 }}>
                <span style={{ color:"#7B5EA7", fontSize:13, lineHeight:1.3 }}>•</span>
                <span style={{ fontSize:11, color:"#333", lineHeight:1.4 }}>{r?.next_action||"—"}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                <span style={{ fontSize:10, color:"#888" }}>Priority Score:</span>
                <span style={{ fontSize:13, fontWeight:700, color:"#7B5EA7" }}>{r?.priority_score?.toFixed(1)||"—"}</span>
                {r?.urgency && (
                  <span style={{
                    fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:10,
                    background: r.urgency==="High"?"#ffebee":r.urgency==="Medium"?"#fff8e1":"#e8f5e9",
                    color: r.urgency==="High"?"#c62828":r.urgency==="Medium"?"#e65100":"#2e7d32",
                  }}>{r.urgency} Urgency</span>
                )}
              </div>
            </div>

            <div style={{ width:"100%", padding:"9px 12px", borderRadius:5, display:"flex", alignItems:"center", justifyContent:"space-between", background: isConv?"#f1fbf4":"#fff3f3", border:`1px solid ${isConv?"#b8e8c4":"#ffcdd2"}`, opacity: panelReady?1:.14, transition:"opacity 1s .8s" }}>
              <span style={{ fontSize:11, color:"#555" }}>Conversion Status</span>
              <span style={{ padding:"3px 10px", borderRadius:12, fontSize:10, fontWeight:700, background: isConv?"#c8e6c9":"#ffcdd2", color: isConv?"#1b5e20":"#b71c1c" }}>{r?.conversion_status||"—"}</span>
            </div>

            {!panelReady && (
              <div style={{ width:"100%", marginTop:14, padding:14, background:"#f8f8f8", border:"1px solid #eee", borderRadius:5, textAlign:"center" }}>
                <div style={{ fontSize:10, color:"#ccc", lineHeight:1.7 }}>Results will appear<br/>after AI completes<br/>all 3 steps</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="dec-ov-footer">
          <div style={{ fontSize:11, color:footerColor }}>{footerMsg}</div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="dec-close-btn" onClick={handleClose}>✕ Close</button>
            <button className="dec-save-btn" disabled={!canSave} onClick={() => { onClose(); }}>
              💾 Save &amp; Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Decision Panel (outer) ─── */
export default function DecisionPanel() {
  const [overlayOpen, setOverlayOpen]   = useState(false);
  const [decision, setDecision]         = useState("");
  const [remarks, setRemarks]           = useState("");
  const [profilingStatus, setProfilingStatus] = useState(null);
  const [lsc, setLsc]                   = useState(null);
  const [aiDecTag, setAiDecTag]         = useState(false);
  const [aiRmkTag, setAiRmkTag]         = useState(false);
  const [saved, setSaved]               = useState(false);

  function handleEval() { setOverlayOpen(true); setSaved(false); }
  function handleClose() { setOverlayOpen(false); }
  function handleSave({ decision: d, remarks: rm, profilingStatus: ps, lsc: l, aiTag }) {
    setDecision(d); setRemarks(rm); setProfilingStatus(ps); setLsc(l);
    setAiDecTag(!!aiTag); setAiRmkTag(!!aiTag);
    setSaved(true);
  }

  return (
    <>
      <div style={{ display:"flex", alignItems:"flex-end", gap:20, flexWrap:"wrap" }}>

        {/* Evaluate Lead */}
        <button className="los-btn los-btn-primary" onClick={handleEval} style={{ flexShrink:0 }}>
          Evaluate Lead
        </button>

        {/* Lead Profiling Status */}
        <div style={{ flex:1, minWidth:160 }}>
          <div style={{ fontSize:11, color:"#777", marginBottom:3 }}>Lead Profiling Status</div>
          <div className="dec-profiling-status" style={{ background: lsc ? lsc.bg : "#f5f5f5" }}>
            {profilingStatus
              ? <><span style={{ fontSize:12, fontWeight:700, color:lsc?.text }}>{profilingStatus}</span><span style={{ fontSize:10, color:"#999", marginLeft:"auto" }}>AI assigned</span></>
              : <span style={{ color:"#bbb", fontSize:12 }}>Pending evaluation…</span>
            }
          </div>
        </div>

        {/* Decision select */}
        <div style={{ flex:1, minWidth:160 }}>
          <div style={{ fontSize:11, color:"#777", marginBottom:3 }}>
            Decision <span style={{ color:"red" }}>*</span>
            {aiDecTag && <span className="dec-ai-tag">AI suggested</span>}
          </div>
          <select
            className="dec-select"
            value={decision}
            onChange={e => { setDecision(e.target.value); setAiDecTag(false); }}
            style={{ boxShadow: aiDecTag ? "0 0 0 2px rgba(123,94,167,.25)" : "none" }}
          >
            <option value="">Select</option>
            <option>Approve</option>
            <option>Reject</option>
            <option>Refer to Credit</option>
            <option>Hold</option>
            <option>Pending Information</option>
          </select>
        </div>
      </div>

      {/* Remarks */}
      <div style={{ marginTop:12 }}>
        <div style={{ fontSize:11, color:"#777", marginBottom:3 }}>
          Remarks
          {aiRmkTag && <span className="dec-ai-tag">AI generated</span>}
        </div>
        <textarea
          className="dec-remarks"
          rows={3}
          placeholder="Enter remarks..."
          value={remarks}
          onChange={e => { setRemarks(e.target.value); setAiRmkTag(false); }}
          style={{ boxShadow: aiRmkTag ? "0 0 0 2px rgba(123,94,167,.15)" : "none" }}
        />
      </div>

      {/* Saved banner */}
      {saved && (
        <div className="dec-saved-banner">
          ✓ Lead evaluation saved successfully.
        </div>
      )}

      {/* Overlay */}
      {overlayOpen && (
        <LeadEvalOverlay onClose={handleClose} onSave={handleSave} />
      )}
    </>
  );
}