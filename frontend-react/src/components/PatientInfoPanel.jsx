import { useState } from "react";

export default function PatientInfoPanel({ role, patientInfo, onUpdate, onClose }) {
  const [localInfo, setLocalInfo] = useState(patientInfo);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(localInfo);
    onClose();
  };

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 border-l z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">🧑‍⚕️ Patient Info</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">&times;</button>
      </div>

      {role === "surgeon" ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={localInfo.name}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Patient ID</label>
            <input
              type="text"
              name="id"
              value={localInfo.id}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Age</label>
            <input
              type="number"
              name="age"
              value={localInfo.age}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              value={localInfo.notes}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <p><strong>Name:</strong> {patientInfo.name}</p>
          <p><strong>ID:</strong> {patientInfo.id}</p>
          <p><strong>Age:</strong> {patientInfo.age}</p>
          <p><strong>Notes:</strong> {patientInfo.notes}</p>
        </div>
      )}
    </div>
  );
}
