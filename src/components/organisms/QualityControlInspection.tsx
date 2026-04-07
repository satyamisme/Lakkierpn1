import React, { useState } from "react";
import { ShieldCheck, CheckCircle, XCircle, Save, Loader2, ClipboardList } from "lucide-react";
import { qualityControlService, Inspection } from "../../api/services/qualityControl";
import { toast } from "sonner";

interface QualityControlInspectionProps {
  type: "incoming" | "outgoing" | "repair";
  referenceId: string;
  onSuccess?: () => void;
}

export const QualityControlInspection: React.FC<QualityControlInspectionProps> = ({ type, referenceId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState([
    { item: "Physical Damage Check", passed: false },
    { item: "Functionality Test", passed: false },
    { item: "IMEI/Serial Verification", passed: false },
    { item: "Accessories Included", passed: false },
  ]);
  const [notes, setNotes] = useState("");

  const toggleItem = (idx: number) => {
    const newChecklist = [...checklist];
    newChecklist[idx].passed = !newChecklist[idx].passed;
    setChecklist(newChecklist);
  };

  const handleSubmit = async (result: Inspection["result"]) => {
    setLoading(true);
    try {
      await qualityControlService.createInspection({
        type,
        referenceId,
        checklist,
        result,
        inspectorId: "current-user-id", // Should be from auth context
      });
      toast.success(`Inspection completed: ${result}`);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to submit inspection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-card p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <ShieldCheck className="text-primary w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter italic">Quality Inspection</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{type} • Ref: {referenceId}</p>
        </div>
      </div>

      <div className="space-y-3">
        {checklist.map((item, idx) => (
          <button
            key={idx}
            onClick={() => toggleItem(idx)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
              item.passed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <ClipboardList size={16} />
              <span className="text-xs font-black uppercase tracking-widest">{item.item}</span>
            </div>
            {item.passed ? <CheckCircle size={18} /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-border" />}
          </button>
        ))}
      </div>

      <textarea
        placeholder="Inspection Notes (Optional)..."
        className="w-full bg-muted border-none px-4 py-3 text-sm font-medium min-h-[80px] outline-none"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSubmit("fail")}
          disabled={loading}
          className="bg-red-500 text-white py-3 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-600 transition-all"
        >
          <XCircle size={14} /> Reject / Fail
        </button>
        <button
          onClick={() => handleSubmit("pass")}
          disabled={loading || !checklist.every(i => i.passed)}
          className="bg-green-600 text-white py-3 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-green-700 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />} Approve / Pass
        </button>
      </div>
    </div>
  );
};
