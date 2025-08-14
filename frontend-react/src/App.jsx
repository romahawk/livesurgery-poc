import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DisplayGrid from "./components/DisplayGrid";
import SessionControls from "./components/SessionControls";
import PatientInfoPanel from "./components/PatientInfoPanel";

export default function App() {
  const [role, setRole] = useState("surgeon");
  const [currentTab, setCurrentTab] = useState("Live");
  const [showPatientInfoPanel, setShowPatientInfoPanel] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    id: "",
    age: "",
    notes: ""
  });
  const [sessionStatus, setSessionStatus] = useState("idle");

  const handleStart = () => setSessionStatus("running");
  const handlePause = () => setSessionStatus("paused");
  const handleStop = () => setSessionStatus("stopped");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar
        role={role}
        setRole={setRole}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 w-full flex px-4 py-6">
        <Sidebar role={role} />

        <div className="flex-1 bg-white ml-4 p-4 rounded shadow relative">
          {currentTab === "Live" && (
            <>
              <SessionControls
                role={role}
                onStart={handleStart}
                onPause={handlePause}
                onStop={handleStop}
                status={sessionStatus}
                onTogglePatientInfo={() => setShowPatientInfoPanel(!showPatientInfoPanel)}
              />
              <DisplayGrid />
            </>
          )}
          {currentTab === "Archive" && <div>📁 Archive content</div>}
          {currentTab === "Analytics" && <div>📊 Analytics content</div>}
        </div>

        {showPatientInfoPanel && (
          <PatientInfoPanel
            role={role}
            patientInfo={patientInfo}
            onUpdate={setPatientInfo}
            onClose={() => setShowPatientInfoPanel(false)}
          />
        )}
      </main>
    </div>
  );
}
