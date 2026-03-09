import { useEffect, useState } from "react";
import { User, X, AlertTriangle } from "lucide-react";

export function PatientInfoButton({ onClick, className = "", hasUnsaved = false }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded text-white shadow-sm
                  bg-[#15B8A6] hover:bg-[#12a291] focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-[#15B8A6] ${className}`}
      aria-label="Open patient info"
      title="Patient Info (I)"
    >
      <User className="h-4 w-4" aria-hidden />
      Patient Info
      {hasUnsaved && <span className="ml-2 h-2 w-2 rounded-full bg-white/80" title="Unsaved" />}
    </button>
  );
}

export default function PatientInfoPanel({ role, patientInfo, onUpdate, onClose }) {
  const [localInfo, setLocalInfo] = useState(patientInfo);
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key !== "Escape") return;
      if (dirty) setConfirmDiscard(true);
      else onClose?.();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [dirty, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalInfo((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate?.(localInfo);
    setDirty(false);
    onClose?.();
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed top-0 right-0 w-80 h-full theme-panel p-4 border-l border-default z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold inline-flex items-center gap-2 text-default">
          <User className="h-5 w-5 text-[var(--ls-teal,#15B8A6)]" aria-hidden />
          <span>Patient Info</span>
          {dirty && <span className="ml-2 h-2 w-2 rounded-full bg-amber-400" title="Unsaved changes" />}
        </h2>
        <button
          onClick={() => dirty ? setConfirmDiscard(true) : onClose?.()}
          className="text-subtle hover:opacity-90 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ls-teal,#15B8A6)]"
          aria-label="Close patient info (Esc)"
          title="Close (Esc)"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {confirmDiscard && (
        <div className="mb-4 rounded-lg border border-amber-400/50 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            Discard unsaved changes?
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmDiscard(false)}
              className="px-3 py-1 rounded border border-default text-xs text-default hover:opacity-80"
            >
              Keep editing
            </button>
            <button
              onClick={() => { setConfirmDiscard(false); onClose?.(); }}
              className="px-3 py-1 rounded bg-amber-500 text-white text-xs hover:bg-amber-600"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {role === "surgeon" ? (
        <div className="space-y-3">
          <Field label="Name">
            <input
              type="text"
              name="name"
              value={localInfo.name}
              onChange={handleChange}
              className="searchbar w-full rounded px-2 py-1"
            />
          </Field>

          <Field label="Patient ID">
            <input
              type="text"
              name="id"
              value={localInfo.id}
              onChange={handleChange}
              className="searchbar w-full rounded px-2 py-1"
            />
          </Field>

          <Field label="Age">
            <input
              type="number"
              name="age"
              value={localInfo.age}
              onChange={handleChange}
              className="searchbar w-full rounded px-2 py-1"
            />
          </Field>

          <Field label="Notes">
            <textarea
              name="notes"
              value={localInfo.notes}
              onChange={handleChange}
              className="searchbar w-full rounded px-2 py-1"
              rows={3}
            />
          </Field>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-1 rounded text-white shadow-sm
                         bg-[#15B8A6] hover:bg-[#12a291] focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-[#15B8A6]"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="text-default"><strong>Name:</strong> {patientInfo.name}</p>
          <p className="text-default"><strong>ID:</strong> {patientInfo.id}</p>
          <p className="text-default"><strong>Age:</strong> {patientInfo.age}</p>
          <p className="text-default"><strong>Notes:</strong> {patientInfo.notes}</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-default">{label}</label>
      {children}
    </div>
  );
}
