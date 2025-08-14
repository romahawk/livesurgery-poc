import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DisplayGrid from "./components/DisplayGrid";
import SessionControls from "./components/SessionControls";
import PatientInfoPanel from "./components/PatientInfoPanel";
import LiveChatPanel from "./components/LiveChatPanel";
import ArchiveTab from "./components/ArchiveTab";

export default function App() {
  const [role, setRole] = useState("surgeon");
  const [currentTab, setCurrentTab] = useState("Live");
  const [showPatientInfoPanel, setShowPatientInfoPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    id: "",
    age: "",
    notes: ""
  });
  const [sessionStatus, setSessionStatus] = useState("idle");
  const [chatMessages, setChatMessages] = useState([]);
  const [archiveSessions, setArchiveSessions] = useState([
    {
      id: 1,
      surgeon: "Dr. Ivanov",
      procedure: "Laparoscopic Cholecystectomy",
      date: "2025-08-10",
      duration: "01:45:00"
    },
    {
      id: 2,
      surgeon: "Dr. Müller",
      procedure: "Neurosurgical Debridement",
      date: "2025-08-09",
      duration: "02:15:00"
    }
  ]);

  const handleStart = () => setSessionStatus("running");
  const handlePause = () => setSessionStatus("paused");
  const handleStop = () => setSessionStatus("stopped");

  const handleSendMessage = (text) => {
    const newMsg = { sender: role, text };
    setChatMessages((prev) => [...prev, newMsg]);
  };

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
              <div className="flex justify-end gap-2 mb-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => setShowPatientInfoPanel(true)}
                >
                  Patient Info
                </button>
                <button
                  className="bg-indigo-500 text-white px-3 py-1 rounded"
                  onClick={() => setShowChatPanel(true)}
                >
                  Live Chat
                </button>
              </div>
              <DisplayGrid />
            </>
          )}
          {currentTab === "Archive" && <ArchiveTab sessions={archiveSessions} />}
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

        {showChatPanel && (
          <LiveChatPanel
            role={role}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onClose={() => setShowChatPanel(false)}
          />
        )}
      </main>
    </div>
  );
}
