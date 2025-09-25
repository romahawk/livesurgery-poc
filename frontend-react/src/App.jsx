import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DisplayGrid from "./components/DisplayGrid";
import SessionControls from "./components/SessionControls";
import PatientInfoPanel, { PatientInfoButton } from "./components/PatientInfoPanel";
import LiveChatPanel, { LiveChatButton } from "./components/LiveChatPanel";
import ArchiveTab from "./components/ArchiveTab";
import AnalyticsTab from "./components/AnalyticsTab";

export default function App() {
  const [role, setRole] = useState("surgeon");
  const [currentTab, setCurrentTab] = useState("Live");

  const [showPatientInfoPanel, setShowPatientInfoPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);

  const [patientInfo, setPatientInfo] = useState({
    name: "",
    id: "",
    age: "",
    notes: "",
  });

  const [sessionStatus, setSessionStatus] = useState("idle");
  const [chatMessages, setChatMessages] = useState([]);

  const [archiveSessions] = useState([
    {
      id: 1,
      surgeon: "Dr. Ivanov",
      procedure: "Laparoscopic Cholecystectomy",
      date: "2025-08-10",
      duration: "01:45:00",
    },
    {
      id: 2,
      surgeon: "Dr. Müller",
      procedure: "Neurosurgical Debridement",
      date: "2025-08-09",
      duration: "02:15:00",
    },
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
                onStart={handleStart}
                onPause={handlePause}
                onStop={handleStop}
                status={sessionStatus}
              />

              <div className="flex justify-end gap-2 mb-2">
                <PatientInfoButton onClick={() => setShowPatientInfoPanel(true)} />
                <LiveChatButton onClick={() => setShowChatPanel(true)} />
              </div>

              <DisplayGrid />
            </>
          )}

          {currentTab === "Archive" && <ArchiveTab sessions={archiveSessions} />}
          {currentTab === "Analytics" && <AnalyticsTab />}
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
