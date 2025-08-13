import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import SessionControls from "./components/SessionControls";
import DisplayGrid from "./components/DisplayGrid";

export default function App() {
  const [role, setRole] = useState("surgeon");
  const [currentTab, setCurrentTab] = useState("Live");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar
        role={role}
        setRole={setRole}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 w-full flex px-4 py-6">
        {/* Sidebar */}
        <Sidebar role={role} />

        {/* Main content area */}
        <div className="flex-1 bg-white ml-4 p-4 rounded shadow">
          {currentTab === "Live" && (
            <>
              <SessionControls role={role} />
              <DisplayGrid />
            </>
          )}
          {currentTab === "Archive" && <div>📁 Archive content</div>}
          {currentTab === "Analytics" && <div>📊 Analytics content</div>}
        </div>
      </main>
    </div>
  );
}
