import Topbar from "../components/Topbar";
import Rail from "../components/Rail";
import LosSection from "../components/LosSection";
import MeetingTable from "../components/MeetingTable";
import ActionFollowup from "../components/ActionFollowup";
import CrossSellTable from "../components/CrossSellTable";
import DocumentUpload from "../components/DocumentUpload";
import DecisionPanel from "../components/DecisionPanel";

export default function LeadInitiationPage() {
  return (
    <div className="app-shell">
      <Topbar />
      <div className="workspace">
        <Rail />
        <div className="content">
          <div className="score-block">
            <div><button className="los-btn los-btn-primary">Check Credit Score</button></div>
            <div>
              <div className="score-label">Score</div>
              <div className="score-input" />
            </div>
            <div style={{ marginLeft: 24 }}><button className="los-btn los-btn-primary">Check Eligibility</button></div>
            <div>
              <div className="score-label">Result</div>
              <div className="score-input" />
            </div>
          </div>
          <LosSection title="Meeting Details" defaultOpen>
            <MeetingTable />
          </LosSection>
          <LosSection title="Action / Follow Up" defaultOpen>
            <ActionFollowup />
          </LosSection>
          <LosSection title="Document Upload">
            <DocumentUpload />
          </LosSection>
          <LosSection title="Cross Selling Opportunities" defaultOpen>
            <CrossSellTable />
          </LosSection>
          <LosSection title="Decision" defaultOpen>
            <DecisionPanel />
          </LosSection>
        </div>
      </div>
    </div>
  );
}