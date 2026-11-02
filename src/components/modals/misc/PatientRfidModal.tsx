import { useState, useEffect } from "react";
import { ScanLine, X, Loader2, Save } from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  onSuccess: (patientId: string, newRfid: string) => void;
}

export default function PatientRfidModal({ isOpen, onClose, patient, onSuccess }: Props) {
  const [rfidInput, setRfidInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      setRfidInput(patient.rfid || "");
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleSetRfid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidInput.trim()) {
      toast.error("لطفاً کد RFID را وارد فرمایید.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/RfId/setRfid", {
        patientId: patient._id,
        rfidCode: rfidInput.trim(),
      });

      if (response.status === 200 || response.data) {
        toast.success(response.data?.message || "کارت با موفقیت به بیمار اختصاص یافت.");
        onSuccess(patient._id, rfidInput.trim());
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در ثبت کارت RFID.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs font-sans animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 border border-gray-100">
        
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
            <ScanLine className="text-gadget-light" size={19} />
            {patient.rfid ? "ویرایش کارت سلامت (RFID)" : "اختصاص کارت سلامت (RFID)"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSetRfid} className="p-5 sm:p-6 space-y-4">
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/70 text-xs">
            <p className="text-gray-400 mb-0.5">بیمار:</p>
            <p className="font-black text-gray-900 text-sm">{patient.firstName} {patient.lastName}</p>
            <p className="text-gray-500 mt-1 font-mono" dir="ltr">کد ملی: {patient.nationalId}</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">کد یکتای کارت RFID *</label>
            <input
              type="text"
              required
              autoFocus
              dir="ltr"
              value={rfidInput}
              onChange={(e) => setRfidInput(e.target.value)}
              placeholder="مثال: RFID123456"
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:border-gadget-dark outline-hidden font-mono"
            />
            <p className="text-[11px] text-gray-400">کد خوانده‌شده توسط دستگاه کارت‌خوان را وارد کنید.</p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !rfidInput.trim()}
              className="flex-2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-gadget-dark hover:bg-gadget-dark/90 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{isSubmitting ? "در حال ثبت..." : "ثبت و تخصیص کارت"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}