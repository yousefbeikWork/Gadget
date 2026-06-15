import { useState } from "react";
import {
  X,
  Activity,
  Pill,
  Save,
  Loader2,
  FileText,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

interface AddHealthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string; // برای نمایش در هدر مودال
  onSuccess?: () => void;
}

export default function AddHealthRecordModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  onSuccess,
}: AddHealthRecordModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prescription: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      toast.error("خطا: شناسه بیمار یافت نشد.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patientId: patientId,
        title: formData.title,
        description: formData.description,
        prescription: formData.prescription,
        attachments: [], // پیوست‌ها (در صورت نیاز به آپلود فایل در آینده)
      };

      const response = await api.post("/healthRecords/addHelthRecord", payload);

      if (response.data) {
        toast.success("پرونده ویزیت با موفقیت ثبت شد");
        setFormData({ title: "", description: "", prescription: "" }); // ریست فرم
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در ثبت پرونده سلامت");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* هدر مودال */}
        <div className="bg-gadget-dark p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-md">ثبت پرونده ویزیت</h3>
              <p className="text-xs text-gadget-light">بیمار: {patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors border-none outline-hidden cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* فرم ثبت */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form
            id="health-record-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> تاریخ ثبت پرونده:
              </span>
              <span className="font-bold text-gray-700">
                {new Date().toLocaleDateString("fa-IR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                عنوان ویزیت / علت مراجعه *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: چکاپ سالانه، سرماخوردگی شدید"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <Activity size={16} className="text-gray-400" /> شرح حال و تشخیص
                پزشک *
              </label>
              <textarea
                required
                rows={4}
                placeholder="علائم بیمار و تشخیص نهایی خود را بنویسید..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-gadget-light transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <Pill size={16} className="text-gadget-light" /> نسخه و داروی
                تجویزی
              </label>
              <textarea
                rows={3}
                placeholder="اقدامات درمانی یا لیست داروها (مثال: استامینوفن 500 هر 8 ساعت)"
                value={formData.prescription}
                onChange={(e) =>
                  setFormData({ ...formData, prescription: e.target.value })
                }
                className="w-full bg-gadget-light/5 border border-gadget-light/20 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-gadget-light transition-colors resize-none"
              />
            </div>
          </form>
        </div>

        {/* فوتر مودال */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            انصراف
          </button>
          <button
            form="health-record-form"
            type="submit"
            disabled={isSubmitting}
            className="flex-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 border-none outline-hidden"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {isSubmitting ? "در حال ثبت..." : "ثبت در پرونده بیمار"}
          </button>
        </div>
      </div>
    </div>
  );
}
