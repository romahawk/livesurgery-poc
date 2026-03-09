import { useState } from "react";

export default function Navbar({ role, setRole, currentTab, setCurrentTab }) {
  const tabs = ["Live", "Archive", "Analytics"];

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const isTabVisible = (tab) => {
    if (role === "viewer" && (tab === "Archive" || tab === "Analytics")) return false;
    return true;
  };

  return (
    <nav className="flex items-center justify-between bg-white border-b p-4 shadow-sm">
      {/* Logo */}
      <div className="text-xl font-bold text-blue-700">LiveSurgery</div>

      {/* Tabs */}
      <div className="space-x-4">
        {tabs.map(
          (tab) =>
            isTabVisible(tab) && (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-4 py-2 rounded hover:bg-blue-100 transition ${
                  currentTab === tab ? "bg-blue-500 text-white" : "text-gray-700"
                }`}
              >
                {tab}
              </button>
            )
        )}
      </div>

      {/* Role Selector */}
      <div className="flex items-center space-x-2">
        <label htmlFor="role" className="text-sm font-medium">
          Role:
        </label>
        <select
          id="role"
          value={role}
          onChange={handleRoleChange}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="surgeon">Surgeon</option>
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </nav>
  );
}
