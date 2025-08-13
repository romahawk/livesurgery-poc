import { useState } from "react";
import Navbar from "./components/Navbar";

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
        <div className="w-64 bg-gray-200 p-4 rounded">Sidebar goes here</div>

        {/* Display Area */}
        <div className="flex-1 bg-white ml-4 p-4 rounded shadow">
          {currentTab === "Live" && <div>🔴 Live content goes here</div>}
          {currentTab === "Archive" && <div>📁 Archive content goes here</div>}
          {currentTab === "Analytics" && <div>📊 Analytics content goes here</div>}
        </div>
      </main>
    </div>
  );
}
