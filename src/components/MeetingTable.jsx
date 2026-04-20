import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAiFilled } from "../store/slices/uiSlice";

const EMPTY_CALL  = { duration:"", datetime:"", spokenTo:"", plant:"", banking:"", lenders:"", exposure:"", agenda:"" };
const EMPTY_VISIT = { datetime:"", place:"", acc1:"", acc2:"", acc3:"", official1:"", official2:"", plant:"", banking:"", lenders:"", exposure:"", agenda:"" };
const EMPTY_INTEL = { promoter:"", funding:"", capex:"", importExport:"", distribution:"", subsidiary:"", conclusion:"" };

/* Auto-fill constants */
const CALL_FILLS = { duration:"5m 12s", spokenTo:"Mr. James Hargrove, President & CEO", datetime:"03/25/2026 11:24", plant:"Austin, TX — 12-acre site (ground lease signed)", lenders:"Wells Fargo, JPMorgan Chase", exposure:"$42M (Rev. LOC $22M + Term Loan $20M)", agenda:"Austin facility expansion — financing $72–85M (Term Loan + equipment + revolving LOC). Federal contract $180M. Disbursement before June 2026. Credit meeting confirmed Friday March 28 11 AM with CFO.", banking:"Multiple" };
const VISIT_FILLS = { official1:"Mr. James Hargrove, President & CEO", plant:"Austin, TX — 12-acre site (ground lease signed)", lenders:"Wells Fargo, JPMorgan Chase", exposure:"$42M", agenda:"Site visit — Austin facility expansion. Financing $72–85M. Federal contract $180M.", banking:"Multiple" };
const INTEL_FILLS = {
  promoter:"James Hargrove (MBA, Wharton). Family business est. 1987; 35+ yrs in construction & infrastructure; 60+ projects across TX & AZ. Single-family enterprise.",
  funding:"$72–85M combined: Term Loan ($40–50M capex) + Equipment Financing ($18–20M) + Revolving LOC ($15M). Cross-sell: Structured FX hedging (EUR/JPY — $8–10M p.a. imports); Cash Management Services for Federal billing cycle.",
  capex:"Phase 1: Austin precast facility (Q3 2027). Phase 2: Phoenix, AZ facility (2028–29). FHWA highway project bids — addl. $25–30M equipment. Revenue target $600M by 2029.",
  importExport:"Imports: German & Japanese machinery components — $8–10M p.a.; EUR & JPY invoicing. Partial ad-hoc hedge via JPMorgan. Structured hedging facility requested. No export exposure.",
  distribution:"Direct-to-client (no dealer/subcontractor network). 65% Federal/Municipal (FHWA, TxDOT, Army Corps of Engineers), 35% private developers. Milestone-based billing.",
  subsidiary:"Hargrove Holdings LLC (promoter HoldCo). HG-Constructors (51% JV, Phoenix mixed-use development — ring-fenced, no cross-default).",
  conclusion:"Strong credit candidate. Secured Federal contract $180M (4-yr revenue visibility). Clean repayment history. Disbursement deadline June 2026. Recommend: $75M Term Loan + $10M revolving LOC; initiate FX hedging + CMS proposals alongside term sheet.",
};

/* Transcript data */
const TRANSCRIPT = [
  { time:"00:00", speaker:"RM", text:'Good afternoon Mr. Hargrove, Michael Chen here from the Commercial Banking team. Thanks for your time today. I wanted to follow up on the Austin facility expansion and formally kick off the credit assessment.' },
  { time:"00:17", speaker:"Borrower", text:'Good afternoon. Perfect timing — we just executed the ground lease yesterday. <span class="hl">12 acres in Austin, TX</span>. We\'re ready to move forward.' },
  { time:"00:32", speaker:"RM", text:'Excellent. Walk me through the complete financing requirement please.' },
  { time:"00:39", speaker:"Borrower", text:'Civil construction and site development is <span class="hl">$40–50M</span>. Equipment procurement for the precast machinery is another <span class="hl">$18–20M</span>. We\'ll need a <span class="hl">revolving line of credit of $15M</span> to manage the ramp-up period. All in, we\'re looking at roughly <span class="hl">$72–85M</span>.' },
  { time:"01:06", speaker:"RM", text:'Understood. And your existing banking — are you with a single lender or multiple?' },
  { time:"01:11", speaker:"Borrower", text:'<span class="hl">Multiple banks</span>. <span class="hl">Wells Fargo holds our revolving line of credit at $22M</span>, and <span class="hl">JPMorgan Chase has a term loan of $20M</span> maturing next year. Total existing exposure is about <span class="hl">$42M</span>. We have a clean repayment record on both.' },
  { time:"01:38", speaker:"RM", text:'Good to hear. Can you give me a brief background on the company\'s founding and your leadership history?' },
  { time:"01:44", speaker:"Borrower", text:'My father started the company in 1987 as a general contractor. We moved into full infrastructure and heavy civil by 2004. <span class="hl">I came on board in 2012 — MBA from Wharton</span>. We\'ve completed <span class="hl">60+ infrastructure projects</span> across Texas and Arizona. It\'s a family-owned enterprise — no other business interests.' },
  { time:"02:10", speaker:"RM", text:'Strong track record. What are your capital plans beyond the Austin facility?' },
  { time:"02:15", speaker:"Borrower", text:'Austin is Phase 1 — target commissioning Q3 2027. Phase 2 is a <span class="hl">second precast facility in Phoenix, Arizona in 24–30 months</span>. We\'re also bidding on FHWA highway projects — that could require <span class="hl">$25–30M additional equipment</span> if we win. We\'re projecting <span class="hl">revenues of $600M by 2029</span>.' },
  { time:"02:44", speaker:"RM", text:'That\'s strong growth. Any foreign currency exposure we should know about?' },
  { time:"02:49", speaker:"Borrower", text:'Yes — we import <span class="hl">specialized machinery components from Germany and Japan, around $8–10M annually in EUR and JPY</span>. We\'ve been hedging on an ad-hoc basis through JPMorgan. We\'d really welcome a <span class="hl-blue">structured FX hedging program</span> — it\'s something we\'ve been wanting to formalize.' },
  { time:"03:12", speaker:"RM", text:'Absolutely — our Treasury desk can build that out. Also, given your Federal contract receivables, have you considered a formal <span class="hl-blue">Cash Management Services arrangement</span>? It would centralize collections and give you much better working capital visibility.' },
  { time:"03:28", speaker:"Borrower", text:'That\'s something we\'ve actually been looking for. <span class="hl-blue">Yes, please include CMS in the proposal</span>. Our Federal billing cycle runs about 45 days — centralised collections would really help us manage cash flow.' },
  { time:"03:45", speaker:"RM", text:'How does your revenue model work — direct contracts or through a subcontracting network?' },
  { time:"03:51", speaker:"Borrower", text:'Entirely <span class="hl">direct-to-client</span> — no subcontractor or dealer network. About <span class="hl">65% Federal and Municipal</span> — FHWA, TxDOT, Army Corps of Engineers — and 35% private developers. Milestone-based billing on all contracts.' },
  { time:"04:10", speaker:"RM", text:'Any affiliated entities or subsidiaries we should include in the credit package?' },
  { time:"04:15", speaker:"Borrower", text:'Yes — <span class="hl">Hargrove Holdings LLC</span> is the promoter holding entity. And we have <span class="hl">HG-Constructors, a 51% JV</span> set up for a Phoenix mixed-use development. That\'s ring-fenced — no cross-default exposure. No other affiliates.' },
  { time:"04:28", speaker:"RM", text:'Perfect. On next steps — <span class="hl-green">I\'ll send you a formal document checklist by end of today</span>. Can we set up a credit meeting with my team and your CFO <span class="hl-green">this Friday at 11 AM</span>?' },
  { time:"04:42", speaker:"Borrower", text:'Friday works great. <span class="hl-green">Our CFO David Walsh</span> will be on that call too. We\'re keen to move quickly given our <span class="hl">June 2026 disbursement deadline</span>.' },
  { time:"04:58", speaker:"RM", text:'Confirmed. I\'ll send the calendar invite and document checklist right away. Thank you Mr. Hargrove — talk Friday.' },
];

/* Intent chips */
const INTENT_CHIPS = [
  { label:"💰 $72–85M Funding", cls:"ic-blue" },
  { label:"🏗️ Capex Expansion", cls:"ic-purple" },
  { label:"🔄 Revolving Credit", cls:"ic-orange" },
  { label:"📋 Federal Contract", cls:"ic-green" },
  { label:"⏰ June 2026 Deadline", cls:"ic-red" },
  { label:"💱 FX Hedging", cls:"ic-teal" },
  { label:"🏦 CMS Interest", cls:"ic-yellow" },
  { label:"📅 Friday Credit Meet", cls:"ic-green" },
];

/* Signals */
const SIGNALS = [
  { color:"#c62828", cat:"Urgency", text:"June 2026 disbursement deadline — Federal contract commencement locked" },
  { color:"#2e7d32", cat:"Revenue Assurance", text:"$180M Federal contract; 65% Federal/Municipal revenue — strong repayment visibility" },
  { color:"#1565c0", cat:"Cross-Sell — FX Hedging", text:"EUR/JPY imports $8–10M p.a.; explicitly requested structured hedging facility" },
  { color:"#f57f17", cat:"Cross-Sell — CMS", text:"Confirmed interest in Cash Management Services; 45-day Federal billing cycle — high suitability" },
  { color:"#2e7d32", cat:"Next Action Confirmed", text:"Credit meeting booked — Friday, 11 AM with RM + CFO Mr. David Walsh" },
];

/* Extracted field groups */
const EXTRACTED_GROUPS = [
  { title:"📞 Call Details", fields:[
    { field:"Duration", val:"5m 12s", conf:"✓" },
    { field:"Spoken To", val:"Mr. James Hargrove, President & CEO", conf:"✓" },
    { field:"Existing Banking", val:"Multiple — Wells Fargo + JPMorgan Chase", conf:"✓" },
    { field:"Existing Exposure", val:"$42M (Rev. LOC $22M + Term Loan $20M)", conf:"✓" },
  ]},
  { title:"📅 Action / Follow Up", fields:[
    { field:"Next Action", val:"Meeting", valBold:true, extra:" — Credit discussion", conf:"✓ AI", confCls:"mt-conf-blue" },
    { field:"Follow Up Date", val:"03/28/2026 (Friday, 11:00 AM)", valBold:true, conf:"✓ AI", confCls:"mt-conf-blue" },
    { field:"Immediate F/U Required", val:"Yes", valBold:true, extra:" — June deadline, document checklist to be sent today", conf:"✓ AI", confCls:"mt-conf-blue" },
    { field:"Next Steps", val:"1. Send document checklist today · 2. Credit meeting Fri 11 AM with CFO Mr. David Walsh · 3. Propose FX hedging + CMS alongside term sheet", conf:"✓ AI", confCls:"mt-conf-blue" },
  ]},
  { title:"💡 Cross-Sell Opportunities", fields:[
    { field:"FX Hedging", val:"Treasury Dept · EUR/JPY · $8–10M p.a. imports · Borrower explicitly requested", conf:"✓ AI", confCls:"mt-conf-orange" },
    { field:"Cash Mgmt. Services", val:"Transaction Banking · 45-day Federal billing cycle · Borrower confirmed interest", conf:"✓ AI", confCls:"mt-conf-orange" },
  ]},
  { title:"🧠 Borrower Intelligence", fields:[
    { field:"Promoter Background", val:"2nd gen; MBA Wharton; est. 1987; 60+ infrastructure projects in TX & AZ", conf:"✓" },
    { field:"Future Capex", val:"Phoenix Phase 2 (2029); FHWA highway bids; Rev target $600M by 2029", conf:"✓" },
    { field:"Import / Export", val:"Imports $8–10M p.a. (DE & JP machinery, EUR/JPY); No exports", conf:"✓" },
    { field:"Distribution", val:"Direct-to-client; 65% Federal/Municipal (FHWA, TxDOT, Army Corps); 35% private", conf:"✓" },
    { field:"Associate / Subsidiary", val:"Hargrove Holdings LLC (promoter HoldCo); HG-Constructors JV 51% (Phoenix, ring-fenced)", conf:"✓" },
  ]},
];

/* ─── Waveform canvas hook ─── */
function useWaveform(canvasRef, active, leadColor) {
  const dataRef = useRef([]);
  const animRef = useRef(null);
  useEffect(() => {
    if (!active) { clearInterval(animRef.current); dataRef.current = []; return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
    dataRef.current = [];
    animRef.current = setInterval(() => {
      const W = rect.width, H = rect.height, barW = 2, gap = 1, step = barW + gap;
      const maxBars = Math.floor(W / step), mid = H / 2;
      const amp = Math.random() < 0.15 ? 0.05 + Math.random() * 0.1 : 0.2 + Math.random() * 0.75;
      dataRef.current.push(amp);
      if (dataRef.current.length > maxBars) dataRef.current.shift();
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, W, H);
      ctx.beginPath(); ctx.strokeStyle = "#e8ecf5"; ctx.lineWidth = 1;
      ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
      const startX = Math.max(0, W - dataRef.current.length * step);
      const total = dataRef.current.length;
      dataRef.current.forEach((a, i) => {
        const x = startX + i * step;
        const barH = Math.max(2, a * (H * 0.82));
        const alpha = 0.35 + a * 0.65;
        if (leadColor === "red") {
          const recency = i / total;
          const r = Math.round(21 + (234 - 21) * Math.max(0, recency - 0.8) / 0.2);
          const g = Math.round(101 + (83 - 101) * Math.max(0, recency - 0.8) / 0.2);
          const b = Math.round(192 + (80 - 192) * Math.max(0, recency - 0.8) / 0.2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        } else {
          ctx.fillStyle = `rgba(21,101,192,${alpha})`;
        }
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, mid - barH / 2, barW, barH, 1);
        else ctx.rect(x, mid - barH / 2, barW, barH);
        ctx.fill();
      });
      if (dataRef.current.length > 0) {
        const headX = startX + (dataRef.current.length - 1) * step + barW + 1;
        ctx.beginPath(); ctx.strokeStyle = leadColor === "red" ? "#ef5350" : "#1565c0";
        ctx.lineWidth = 1.5; ctx.setLineDash([2, 2]);
        ctx.moveTo(headX, 2); ctx.lineTo(headX, H - 2); ctx.stroke(); ctx.setLineDash([]);
      }
    }, leadColor === "red" ? 100 : 120);
    return () => clearInterval(animRef.current);
  }, [active, leadColor]);
}

/* ─── Upload Recording ─── */
function UploadArea({ onAiReady }) {
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const fileRef = useRef();
  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return;
    setFileName(file.name); setProgress(0); setReady(false);
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 14;
      if (pct >= 100) { pct = 100; clearInterval(iv); setReady(true); }
      setProgress(Math.min(pct, 100));
    }, 100);
  }
  return (
    <div className="mt-upload-area">
      <div className="mt-upload-row">
        <button className="los-btn los-btn-primary" style={{ fontSize:12, padding:"5px 14px" }} onClick={() => fileRef.current.click()}>📎 Upload Audio File</button>
        <input ref={fileRef} type="file" accept="audio/*" style={{ display:"none" }} onChange={handleFile} />
        <button className={`mt-fetch-btn${ready ? " ready" : ""}`} disabled={!ready} onClick={onAiReady}>🤖 Fetch AI Response</button>
      </div>
      {fileName && (<>
        <div className="mt-upload-name" style={{ color: ready ? "#2e7d32" : "#666" }}>{ready ? `✓ ${fileName} — Ready` : `📎 ${fileName}`}</div>
        <div className="mt-upload-progress"><div className="mt-upload-fill" style={{ width: progress + "%", background: ready ? "#2e7d32" : "#1565c0" }} /></div>
      </>)}
    </div>
  );
}

/* ─── Digital Dialer ─── */
function DialerArea({ onAiReady }) {
  const [dialState, setDialState] = useState("idle");
  const [rawDigits, setRawDigits] = useState("15128473291");
  const [timer, setTimer] = useState("0:00");
  const [procPct, setProcPct] = useState(0);
  const [procLabel, setProcLabel] = useState("Sending recording to AI Agent...");
  const timerRef = useRef(null); const procRef = useRef(null);
  const waveCanvasRef = useRef(null);
  useWaveform(waveCanvasRef, dialState === "active", "blue");

  function fmt(digits) {
    const d = digits.replace(/\D/g, "");
    if (!d) return "";
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    if (d.length <= 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
    return `+${d.slice(0,1)} (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7,11)}`;
  }
  const dialNumber = fmt(rawDigits);
  function dialKey(k) { setRawDigits(p => p.length < 11 ? p + k : p); }
  function dialClear() { setRawDigits(p => p.slice(0, -1)); }
  function startCall() {
    setDialState("active"); setTimer("0:00");
    let secs = 0;
    timerRef.current = setInterval(() => { secs++; setTimer(`${Math.floor(secs/60)}:${String(secs%60).padStart(2,"0")}`); }, 1000);
  }
  function endCall() {
    clearInterval(timerRef.current); setDialState("done");
    let pct = 0; const labels = ["Sending recording to AI Agent...","Converting speech to text...","Analysing conversation...","Ready — launching AI Panel"]; let li = 0;
    procRef.current = setInterval(() => {
      pct += 1.6; setProcPct(Math.min(pct, 100));
      if (pct > 25 && li === 0) { li = 1; setProcLabel(labels[1]); }
      if (pct > 55 && li === 1) { li = 2; setProcLabel(labels[2]); }
      if (pct > 85 && li === 2) { li = 3; setProcLabel(labels[3]); }
      if (pct >= 100) { clearInterval(procRef.current); setTimeout(onAiReady, 400); }
    }, 60);
  }
  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(procRef.current); }, []);

  if (dialState === "done") return (
    <div className="mt-proc-state"><div className="mt-proc-icon">🎙️</div><div className="mt-proc-text"><div className="mt-proc-title">Call Ended — Processing Recording</div><div className="mt-proc-sub">{procLabel}</div><div className="mt-proc-bar"><div className="mt-proc-fill" style={{ width:procPct+"%" }} /></div></div></div>
  );
  if (dialState === "active") return (
    <div className="mt-dialer-calling">
      <div className="mt-calling-header">
        <div className="mt-calling-avatar">👤</div>
        <div className="mt-calling-info"><div className="mt-calling-contact">Mr. James Hargrove — Hargrove Construction Inc.</div><div className="mt-calling-number">{dialNumber}</div></div>
        <div className="mt-call-timer-row"><div className="mt-rec-dot" /><div className="mt-call-timer">{timer}</div></div>
      </div>
      <div style={{ padding:"8px 14px 6px", borderBottom:"1px solid #f0f0f0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div className="mt-live-rec-badge-sm"><div className="mt-live-dot-sm" /><span className="mt-live-rec-text-sm">REC</span></div>
          <div style={{ flex:1, position:"relative", height:34, background:"#f8fafc", borderRadius:4, overflow:"hidden", border:"1px solid #e8ecf5" }}>
            <canvas ref={waveCanvasRef} style={{ display:"block", width:"100%", height:"100%" }} />
          </div>
        </div>
      </div>
      <div className="mt-call-controls">
        <button className="mt-ctrl-btn mt-ctrl-mute">🔇 Mute</button>
        <button className="mt-ctrl-btn mt-ctrl-hold">⏸ Hold</button>
        <button className="mt-ctrl-btn mt-ctrl-end" onClick={endCall}>📵 End Call</button>
      </div>
    </div>
  );
  return (
    <div className="mt-dialer-box">
      <div className="mt-dialer-header"><div className="mt-dialer-title">📞 CRM DIALER</div><div className="mt-conn-badge"><div className="mt-conn-dot" />CONNECTED</div></div>
      <div className="mt-dialer-body">
        <div className="mt-dialer-left">
          <div className="mt-di-block"><div className="mt-di-label">Company</div><div className="mt-di-row"><div className="mt-di-icon">🏢</div><div><div className="mt-di-name">Hargrove Construction Inc.</div><div className="mt-di-sub">ID: CLOS-36776</div></div></div></div>
          <div className="mt-di-block"><div className="mt-di-label">Contact</div><div className="mt-di-row"><div className="mt-di-icon">👤</div><div><div className="mt-di-name">Mr. James Hargrove</div><div className="mt-di-sub">President &amp; CEO</div></div></div></div>
          <div className="mt-dial-num-block"><div className="mt-di-label">Dialing Number</div><div className="mt-dial-number"><span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{dialNumber}</span><button className="mt-dial-clear" onClick={dialClear} title="Backspace">⌫</button></div></div>
        </div>
        <div className="mt-dialer-right">
          <div className="mt-dialpad">
            {[["1",""],["2","ABC"],["3","DEF"],["4","GHI"],["5","JKL"],["6","MNO"],["7","PQRS"],["8","TUV"],["9","WXYZ"],["*",""],["0","+"],["#",""]].map(([n,s]) => (
              <div key={n} className="mt-dialpad-key" onClick={() => dialKey(n)}><div className="mt-dk-num">{n}</div><div className="mt-dk-sub">{s||"\u00a0"}</div></div>
            ))}
          </div>
          <div className="mt-dialer-actions">
            <button className="mt-dial-btn mt-dial-clear-btn" onClick={dialClear}>⌫ Clear</button>
            <button className="mt-dial-btn mt-dial-call-btn" onClick={startCall}>📞 Call Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Live Recording ─── */
function LiveArea({ onAiReady }) {
  const [liveState, setLiveState] = useState("idle");
  const [paused, setPaused] = useState(false);
  const [timer, setTimer] = useState("0:00");
  const [procPct, setProcPct] = useState(0);
  const [procLabel, setProcLabel] = useState("Sending to AI Agent...");
  const timerRef = useRef(null); const procRef = useRef(null);
  const secsRef = useRef(0); const pausedRef = useRef(false);
  const liveCanvasRef = useRef(null);
  useWaveform(liveCanvasRef, liveState === "recording" && !paused, "red");

  function startRecording() {
    setLiveState("recording"); setPaused(false); setTimer("0:00");
    secsRef.current = 0; pausedRef.current = false;
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) { secsRef.current++; const m = Math.floor(secsRef.current/60); const s = String(secsRef.current%60).padStart(2,"0"); setTimer(`${m}:${s}`); }
    }, 1000);
  }
  function togglePause() { setPaused(p => { pausedRef.current = !p; return !p; }); }
  function stopRecording() {
    clearInterval(timerRef.current); setLiveState("done");
    let pct = 0; const labels = ["Sending audio to AI Agent...","Converting speech to text...","Analysing conversation...","Ready — launching AI Panel"]; let li = 0;
    procRef.current = setInterval(() => {
      pct += 1.6; setProcPct(Math.min(pct, 100));
      if (pct > 25 && li === 0) { li = 1; setProcLabel(labels[1]); }
      if (pct > 55 && li === 1) { li = 2; setProcLabel(labels[2]); }
      if (pct > 85 && li === 2) { li = 3; setProcLabel(labels[3]); }
      if (pct >= 100) { clearInterval(procRef.current); setTimeout(onAiReady, 400); }
    }, 60);
  }
  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(procRef.current); }, []);

  if (liveState === "done") return (
    <div className="mt-proc-state"><div className="mt-proc-icon">🎙️</div><div className="mt-proc-text"><div className="mt-proc-title">Recording Complete — Processing Audio</div><div className="mt-proc-sub">{procLabel}</div><div className="mt-proc-bar"><div className="mt-proc-fill" style={{ width:procPct+"%" }} /></div></div></div>
  );
  if (liveState === "recording") return (
    <div className="mt-live-box mt-live-box-active">
      <div className="mt-live-header mt-live-header-rec">
        <div style={{ display:"flex", alignItems:"center", gap:8 }}><div className="mt-live-rec-dot" /><span className="mt-live-header-title" style={{ color:"#fff" }}>RECORDING IN PROGRESS</span></div>
        <span className="mt-live-timer">{timer}</span>
      </div>
      <div style={{ padding:"10px 14px 10px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <div className="mt-live-rec-badge-sm"><div className="mt-live-dot-sm" /><span className="mt-live-rec-text-sm">REC</span></div>
          <div style={{ flex:1, position:"relative", height:34, background:"#f8fafc", borderRadius:4, overflow:"hidden", border:"1px solid #e8ecf5" }}>
            <canvas ref={liveCanvasRef} style={{ display:"block", width:"100%", height:"100%" }} />
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button className={`mt-live-ctrl-btn mt-live-pause${paused ? " paused" : ""}`} onClick={togglePause}
            style={paused ? { background:"#e8f5e9", color:"#2e7d32", borderColor:"#a5d6a7" } : {}}>
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button className="mt-live-ctrl-btn mt-live-stop" onClick={stopRecording}>⏹ Stop Recording</button>
        </div>
      </div>
    </div>
  );
  return (
    <div className="mt-live-box">
      <div className="mt-live-header"><div className="mt-live-header-title">🎙️ LIVE RECORDING</div><div className="mt-live-ready-badge">● Ready</div></div>
      <div className="mt-live-idle-body">
        <div style={{ fontSize:28 }}>🎙️</div>
        <div className="mt-live-idle-title">Start Recording</div>
        <div className="mt-live-idle-sub">Your microphone will be used to capture the conversation in real time</div>
        <button className="mt-live-start-btn" onClick={startRecording}>⏺ Start Recording</button>
      </div>
    </div>
  );
}

/* ─── AI steps config ─── */
const AI_STEPS_CONFIG = [
  { d:400,  label:"Loading recording — 5m 12s detected...", nav:0 },
  { d:1200, label:"Running speech-to-text conversion...", nav:0 },
  { d:2400, label:"Detecting entities, intent & cross-sell signals...", nav:1 },
  { d:3500, label:"Generating structured summary + follow-up actions...", nav:2 },
  { d:4500, label:"Mapping to form, action & cross-sell fields...", nav:3 },
];
const PROC_STEP_LABELS = ["🎧 Loading recording","📝 Speech-to-text conversion","🎯 Intent & entity detection","💡 Generating conversation summary","✏️ Mapping to form fields"];
const NAV_STEPS = ["Intent","Summary","Transcript","Auto-Fill"];

/* ─── Collapsible sub-section ─── */
function AiResultSub({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mt-ai-sub">
      <div className="mt-ai-sub-header" onClick={() => setOpen(o => !o)}>
        <span dangerouslySetInnerHTML={{ __html: title }} />
        <span className="mt-ai-chevron">{open ? "▲" : "▼"}</span>
      </div>
      {open && <div className="mt-ai-sub-body">{children}</div>}
    </div>
  );
}

/* ─── AI Panel ─── */
function AiPanel({ open, onClose, onAccept, accepted }) {
  const [phase, setPhase] = useState("processing");
  const [procStep, setProcStep] = useState(0);
  const [procLabel, setProcLabel] = useState("Initialising...");
  const [navStep, setNavStep] = useState(0);
  const [sentimentAnimated, setSentimentAnimated] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    if (!open) return;
    setPhase("processing"); setProcStep(0); setProcLabel("Initialising..."); setNavStep(0); setSentimentAnimated(false);
    timersRef.current.forEach(clearTimeout); timersRef.current = [];
    AI_STEPS_CONFIG.forEach((s, i) => {
      const t = setTimeout(() => { setProcStep(i + 1); setProcLabel(s.label); setNavStep(s.nav); }, s.d);
      timersRef.current.push(t);
    });
    const done = setTimeout(() => { setPhase("results"); setNavStep(4); setTimeout(() => setSentimentAnimated(true), 300); }, 5600);
    timersRef.current.push(done);
    return () => timersRef.current.forEach(clearTimeout);
  }, [open]);

  if (!open) return null;

  return (
    <div className="mt-ai-panel open">
      <div className="mt-ai-header">
        <div className="mt-ai-title">🤖 Call to Text Agent <span className="mt-ai-badge">AI</span></div>
        <button className="mt-ai-close" onClick={onClose}>✕</button>
      </div>
      <div className="mt-ai-stepbar">
        {NAV_STEPS.map((s, i) => (
          <div key={s} className={`mt-ai-step${navStep > i ? " done" : navStep === i ? " active" : ""}`}>{s}</div>
        ))}
      </div>
      <div className="mt-ai-body">
        {phase === "processing" ? (
          <div className="mt-ai-processing">
            <div className="mt-spinner" />
            <div className="mt-proc-label">{procLabel}</div>
            <div className="mt-proc-steps">
              {PROC_STEP_LABELS.map((l, i) => (
                <div key={i} className={`mt-proc-step${procStep > i + 1 ? " done" : procStep === i + 1 ? " active" : ""}`}>{l}</div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-ai-results">
            {/* Intent & Signals */}
            <AiResultSub title="🎯 Intent &amp; Signals">
              <div className="mt-intent-chips">
                {INTENT_CHIPS.map((c, i) => <span key={i} className={`mt-intent-chip ${c.cls}`}>{c.label}</span>)}
              </div>
              <div style={{ fontSize:10, fontWeight:700, color:"#888", margin:"10px 0 4px", letterSpacing:".4px", textTransform:"uppercase" }}>Borrower Sentiment</div>
              <div className="mt-sentiment-bar"><div className="mt-sentiment-needle" style={{ left: sentimentAnimated ? "85%" : "0%" }} /></div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#aaa", marginBottom:4 }}><span>Negative</span><span>Neutral</span><span>Positive</span></div>
              <div style={{ fontSize:11, fontWeight:700, color:"#2e7d32", textAlign:"center", marginBottom:12 }}>Positive — 85 / 100</div>
              {SIGNALS.map((s, i) => (
                <div key={i} className="mt-signal-item">
                  <div className="mt-signal-dot" style={{ background:s.color }} />
                  <div><div className="mt-signal-cat">{s.cat}</div><div className="mt-signal-text">{s.text}</div></div>
                </div>
              ))}
            </AiResultSub>

            {/* Extracted Fields */}
            <AiResultSub title="✏️ Extracted Field Values">
              <table className="mt-extract-table"><tbody>
                {EXTRACTED_GROUPS.map((g, gi) => (
                  <React.Fragment key={gi}>
                    <tr className="mt-ext-group"><td colSpan={2}>{g.title}</td></tr>
                    {g.fields.map((f, fi) => (
                      <tr key={fi}>
                        <td className="mt-ext-field">{f.field}</td>
                        <td>{f.valBold ? <strong>{f.val}</strong> : f.val}{f.extra || ""} <span className={`mt-conf${f.confCls ? ` ${f.confCls}` : ""}`}>{f.conf}</span></td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody></table>
            </AiResultSub>

            {/* Summary */}
            <AiResultSub title="💡 Conversation Summary">
              <div className="mt-summary-box">
                RM spoke with <strong>Mr. James Hargrove</strong> (President &amp; CEO, Hargrove Construction Inc.) to formally initiate credit assessment for a combined facility of <strong>$72–85M</strong> ($40–50M term loan capex, $18–20M equipment financing, $15M revolving line of credit). Austin, TX site lease signed — 12 acres. Existing banking: Wells Fargo + JPMorgan Chase ($42M total, clean). Disbursement deadline: <strong>June 2026</strong>.<br /><br />
                <strong>Cross-sell confirmed:</strong> Borrower explicitly requested a structured <strong>FX hedging facility</strong> (EUR/JPY, $8–10M p.a.) and expressed clear interest in <strong>Cash Management Services</strong> for Federal billing cycle optimisation.<br /><br />
                <strong>Next action agreed:</strong> Credit meeting <strong>Friday March 28, 11 AM</strong> — RM + CFO Mr. David Walsh. Document checklist to be sent same day. Recommend expedited credit evaluation with FX hedging and CMS proposals included in term sheet package.
              </div>
            </AiResultSub>

            {/* Transcript */}
            <AiResultSub title={'📝 Transcript <span style="font-weight:400;color:#4a78c4;font-size:10px;text-transform:none;margin-left:4px;">5m 12s · 96% confidence</span>'}>
              <div className="mt-transcript-scroll">
                {TRANSCRIPT.map((t, i) => (
                  <div key={i} className="mt-transcript-line" style={i === TRANSCRIPT.length - 1 ? { marginBottom:0 } : {}}>
                    <div className="mt-transcript-time">{t.time}</div>
                    <span className={`mt-speaker-tag ${t.speaker === "RM" ? "mt-spk-rm" : "mt-spk-borrower"}`}>{t.speaker}</span>
                    <span className="mt-transcript-text" dangerouslySetInnerHTML={{ __html: t.text }} />
                  </div>
                ))}
              </div>
            </AiResultSub>
          </div>
        )}
      </div>
      {phase === "results" && (
        <div className="mt-ai-actions">
          <button className="mt-ai-action-btn mt-aab-primary" onClick={onAccept} disabled={accepted}
            style={accepted ? { opacity:.6, cursor:"not-allowed", background:"#2e7d32" } : {}}>
            {accepted ? "✓ Form Filled Successfully" : "✔ Accept & Auto-Fill All Sections"}
          </button>
          <button className="mt-ai-action-btn mt-aab-outline" onClick={() => alert("Export feature — SheetJS integration")}>📤 Export</button>
        </div>
      )}
    </div>
  );
}

/* ─── Main MeetingTable ─── */
export default function MeetingTable() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("");
  const [callTab, setCallTab] = useState("upload");
  const [callForm, setCallForm] = useState(EMPTY_CALL);
  const [visitForm, setVisitForm] = useState(EMPTY_VISIT);
  const [intelForm, setIntelForm] = useState(EMPTY_INTEL);
  const [aiOpen, setAiOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  function openModal() {
    setModalOpen(true); setMode(""); setCallTab("upload");
    setCallForm(EMPTY_CALL); setVisitForm(EMPTY_VISIT); setIntelForm(EMPTY_INTEL);
    setAiOpen(false); setAccepted(false);
  }
  function closeModal() { setModalOpen(false); setAiOpen(false); }
  function saveRow() {
    const dt = mode === "Call" ? callForm.datetime : visitForm.datetime;
    const agenda = mode === "Call" ? callForm.agenda : visitForm.agenda;
    setRows(prev => [...prev, { id: Date.now(), type: mode || "Call", date: dt, agenda }]);
  }
  function handleSaveClose() { saveRow(); closeModal(); }
  function handleSaveNext() { saveRow(); setMode(""); setCallTab("upload"); setCallForm(EMPTY_CALL); setVisitForm(EMPTY_VISIT); setIntelForm(EMPTY_INTEL); setAiOpen(false); setAccepted(false); }
  function toggleSelect(id) { setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }
  function toggleAll(e) { setSelected(e.target.checked ? rows.map(r => r.id) : []); }
  function deleteSelected() { setRows(p => p.filter(r => !selected.includes(r.id))); setSelected([]); }
  function onModeChange(m) { setMode(m); if (m === "Call") setCallTab("upload"); setAiOpen(false); }

  function handleAccept() {
    setAccepted(true);
    if (mode === "Call") setCallForm(prev => ({ ...prev, ...CALL_FILLS }));
    else setVisitForm(prev => ({ ...prev, ...VISIT_FILLS }));
    setIntelForm(prev => ({ ...prev, ...INTEL_FILLS }));
    dispatch(setAiFilled({
      afuData: { nextAction:"Meeting", followUpDate:"03/28/2026", immediateFU:"Yes",
        nextSteps:"1. Send document checklist to Mr. James Hargrove today (03/25/2026)\n2. Credit meeting — Friday 03/28/2026, 11:00 AM with Mr. James Hargrove (CEO) & CFO Mr. David Walsh\n3. Prepare term sheet: $75M Term Loan (7yr) + $10M Revolving LOC\n4. Include FX Hedging proposal (EUR/JPY, $8–10M p.a.) from Treasury desk\n5. Include Cash Management Services proposal from Transaction Banking" },
      csRows: [
        { dept:"Treasury & FX", notes:"Structured FX Hedging Facility (EUR/JPY) — import exposure $8–10M p.a. Borrower explicitly requested. Currently ad-hoc hedged via JPMorgan Chase.", email:"treasury@firstcapitalbank.com", contact:"+1 (212) 555-4001" },
        { dept:"Transaction Banking / CMS", notes:"Cash Management Services — centralized Federal billing collection (45-day cycle). Borrower confirmed strong interest. 65% revenue from Federal/Municipal clients.", email:"cms@firstcapitalbank.com", contact:"+1 (212) 555-4010" },
      ],
    }));
  }

  const cfld = k => e => setCallForm(p => ({ ...p, [k]: e.target.value }));
  const vfld = k => e => setVisitForm(p => ({ ...p, [k]: e.target.value }));
  const ifld = k => e => setIntelForm(p => ({ ...p, [k]: e.target.value }));
  const bankingOpts = ["","Sole","Multiple","Consortium","No Limits"];

  return (
    <>
      <div className="mt-table-wrap">
        <div className="mt-toolbar">
          <button className="los-icon-btn" onClick={deleteSelected} title="Delete selected">🗑</button>
          <button className="los-icon-btn" onClick={openModal} title="Add record">＋</button>
        </div>
        <table className="los-table">
          <thead><tr><th style={{ width:36 }}><input type="checkbox" onChange={toggleAll} checked={rows.length > 0 && selected.length === rows.length} /></th><th>Visit/Call</th><th>Date</th><th>Agenda</th><th>Generate Report</th></tr></thead>
          <tbody>
            {rows.length === 0
              ? <tr className="mt-empty-row"><td colSpan={5}>Please click "+" to add record</td></tr>
              : rows.map(r => (
                <tr key={r.id} className={selected.includes(r.id) ? "mt-row-selected" : ""} style={{ background:"#f1f8ff" }}>
                  <td><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} /></td>
                  <td>{r.type}</td><td>{r.date}</td><td className="mt-agenda-cell">{r.agenda}</td>
                  <td><span className="ai-row-badge">📄 AI Report</span></td>
                </tr>))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="mt-modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={`mt-modal${aiOpen ? " mt-modal-expanded" : ""}`}>
            <div className="mt-modal-topbar">
              <button className="los-btn los-btn-primary" onClick={handleSaveNext}>Save and Next</button>
              <button className="los-btn los-btn-primary" onClick={handleSaveClose}>Save and Close</button>
              <button className="mt-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="mt-modal-body-wrap">
              <div className="mt-modal-form">
                <div style={{ display:"flex", alignItems:"flex-end", gap:16, marginBottom:14, flexWrap:"wrap" }}>
                  <div className="mt-field" style={{ width:200, flexShrink:0 }}>
                    <label className="mt-label">Visit/Call <span className="mt-req">*</span></label>
                    <select className="mt-select" value={mode} onChange={e => onModeChange(e.target.value)}>
                      <option value="">Select</option><option value="Visit">Visit</option><option value="Call">Call</option>
                    </select>
                  </div>
                  {mode === "Call" && (
                    <div className="mt-call-tabs">
                      {[["upload","📂","Upload Recording"],["dialer","📞","Digital Dialer"],["live","🎙️","Live Recording"]].map(([k,icon,label]) => (
                        <div key={k} className={`mt-call-tab${callTab === k ? " active" : ""}`} onClick={() => setCallTab(k)}><span>{icon}</span><span>{label}</span></div>
                      ))}
                    </div>
                  )}
                </div>
                {mode === "Call" && callTab === "upload" && <UploadArea onAiReady={() => setAiOpen(true)} />}
                {mode === "Call" && callTab === "dialer" && <DialerArea onAiReady={() => setAiOpen(true)} />}
                {mode === "Call" && callTab === "live" && <LiveArea onAiReady={() => setAiOpen(true)} />}
                {mode === "Call" && (<>
                  <div className="mt-form-row">
                    <div className="mt-field"><label className="mt-label">Call Duration</label><input className="mt-input" value={callForm.duration} onChange={cfld("duration")} /></div>
                    <div className="mt-field"><label className="mt-label">Date and Time <span className="mt-req">*</span></label><div className="mt-date-wrap"><input className="mt-input" placeholder="DD/MM/YYYY HH:MM" value={callForm.datetime} onChange={cfld("datetime")} /><span className="mt-cal-icon">📅</span></div></div>
                    <div className="mt-field"><label className="mt-label">Spoken To <span className="mt-req">*</span></label><input className="mt-input" value={callForm.spokenTo} onChange={cfld("spokenTo")} /></div>
                  </div>
                  <div className="mt-form-row mt-one-col"><div className="mt-field"><label className="mt-label">Plant / Factory Locations</label><input className="mt-input" value={callForm.plant} onChange={cfld("plant")} /></div></div>
                  <div className="mt-form-row">
                    <div className="mt-field"><label className="mt-label">Existing Banking Arrangement</label><select className="mt-select" value={callForm.banking} onChange={cfld("banking")}>{bankingOpts.map(o => <option key={o} value={o}>{o||"Select"}</option>)}</select></div>
                    <div className="mt-field"><label className="mt-label">Existing Lenders</label><input className="mt-input" value={callForm.lenders} onChange={cfld("lenders")} /></div>
                    <div className="mt-field"><label className="mt-label">Existing Exposure</label><input className="mt-input" value={callForm.exposure} onChange={cfld("exposure")} /></div>
                  </div>
                  <div className="mt-form-row mt-one-col"><div className="mt-field"><label className="mt-label">Agenda <span className="mt-req">*</span></label><textarea className="mt-textarea" rows={2} value={callForm.agenda} onChange={cfld("agenda")} /></div></div>
                </>)}
                {mode === "Visit" && (<>
                  <div className="mt-form-row" style={{ gridTemplateColumns:"220px 1fr" }}><div className="mt-field"><label className="mt-label">Date and Time <span className="mt-req">*</span></label><div className="mt-date-wrap"><input className="mt-input" placeholder="DD/MM/YYYY HH:MM" value={visitForm.datetime} onChange={vfld("datetime")} /><span className="mt-cal-icon">📅</span></div></div></div>
                  <div className="mt-form-row">
                    <div className="mt-field"><label className="mt-label">Place of Visit <span className="mt-req">*</span></label><input className="mt-input" value={visitForm.place} onChange={vfld("place")} /></div>
                    <div className="mt-field"><label className="mt-label">Accompanied By 1</label><input className="mt-input" value={visitForm.acc1} onChange={vfld("acc1")} /></div>
                    <div className="mt-field"><label className="mt-label">Accompanied By 2</label><input className="mt-input" value={visitForm.acc2} onChange={vfld("acc2")} /></div>
                  </div>
                  <div className="mt-form-row">
                    <div className="mt-field"><label className="mt-label">Accompanied By 3</label><input className="mt-input" value={visitForm.acc3} onChange={vfld("acc3")} /></div>
                    <div className="mt-field"><label className="mt-label">Company Official Met 1 <span className="mt-req">*</span></label><input className="mt-input" value={visitForm.official1} onChange={vfld("official1")} /></div>
                    <div className="mt-field"><label className="mt-label">Company Official Met 2</label><input className="mt-input" value={visitForm.official2} onChange={vfld("official2")} /></div>
                  </div>
                  <div className="mt-form-row mt-one-col"><div className="mt-field"><label className="mt-label">Plant / Factory Locations</label><input className="mt-input" value={visitForm.plant} onChange={vfld("plant")} /></div></div>
                  <div className="mt-form-row">
                    <div className="mt-field"><label className="mt-label">Existing Banking Arrangement</label><select className="mt-select" value={visitForm.banking} onChange={vfld("banking")}>{bankingOpts.map(o => <option key={o} value={o}>{o||"Select"}</option>)}</select></div>
                    <div className="mt-field"><label className="mt-label">Existing Lenders</label><input className="mt-input" value={visitForm.lenders} onChange={vfld("lenders")} /></div>
                    <div className="mt-field"><label className="mt-label">Existing Exposure</label><input className="mt-input" value={visitForm.exposure} onChange={vfld("exposure")} /></div>
                  </div>
                  <div className="mt-form-row mt-one-col"><div className="mt-field"><label className="mt-label">Agenda <span className="mt-req">*</span></label><textarea className="mt-textarea" rows={2} value={visitForm.agenda} onChange={vfld("agenda")} /></div></div>
                </>)}
                {(mode === "Call" || mode === "Visit") && (<>
                  <div className="mt-section-label">Borrower Intelligence</div>
                  <div className="mt-form-row mt-two-col">
                    <div className="mt-field"><label className="mt-label">Promoter Background</label><textarea className="mt-textarea" rows={3} value={intelForm.promoter} onChange={ifld("promoter")} /></div>
                    <div className="mt-field"><label className="mt-label">Any Funding / Cross Sell Requirements</label><textarea className="mt-textarea" rows={3} value={intelForm.funding} onChange={ifld("funding")} /></div>
                  </div>
                  <div className="mt-form-row mt-two-col">
                    <div className="mt-field"><label className="mt-label">Future Business / Capex Plans</label><textarea className="mt-textarea" rows={3} value={intelForm.capex} onChange={ifld("capex")} /></div>
                    <div className="mt-field"><label className="mt-label">Import / Export Transactions</label><textarea className="mt-textarea" rows={3} value={intelForm.importExport} onChange={ifld("importExport")} /></div>
                  </div>
                  <div className="mt-form-row mt-two-col">
                    <div className="mt-field"><label className="mt-label">Distribution Network</label><textarea className="mt-textarea" rows={3} value={intelForm.distribution} onChange={ifld("distribution")} /></div>
                    <div className="mt-field"><label className="mt-label">Any Associate / Subsidiary Details</label><textarea className="mt-textarea" rows={3} value={intelForm.subsidiary} onChange={ifld("subsidiary")} /></div>
                  </div>
                  <div className="mt-form-row mt-one-col">
                    <div className="mt-field"><label className="mt-label">Conclusion <span className="mt-req">*</span></label><textarea className="mt-textarea" rows={3} value={intelForm.conclusion} onChange={ifld("conclusion")} /></div>
                  </div>
                </>)}
              </div>
              <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} onAccept={handleAccept} accepted={accepted} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
