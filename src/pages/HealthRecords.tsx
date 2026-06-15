import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Activity,
  Pill,
  Loader2,
  Calendar,
  User,
  Search,
  Stethoscope,
  Paperclip,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import AddHealthRecordModal from "../components/AddHealthRecordModal";
import FileDownload from "../components/FileDownload"; // 👈 ایمپورت کامپوننت دانلود

interface DoctorInfo {
  _id: string;
  role: string;
  firstName: string;
  lastName: string;
  Expertise: string;
}

interface HealthRecord {
  _id: string;
  title: string;
  description: string;
  prescription: string;
  attachments?: string[];
  createdAt: string;
  doctor?: DoctorInfo;
}

export default function HealthRecords() {
  const { userProfile, userRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initialPatientId = location.state?.patientId || "";

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [targetPatientId, setTargetPatientId] = useState<string>(
    userRole === "Patient" ? userProfile?._id || "" : initialPatientId,
  );
  const [searchInput, setSearchInput] = useState(initialPatientId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRecords = useCallback(async () => {
    if (!targetPatientId) return;

    setLoading(true);
    setError(null);
    try {
      const queryParam =
        userRole === "Doctor" ? `?doctorId=${userProfile?._id}` : "";
      const response = await api.get(
        `/healthRecords/historyPationtsHelthRecord/${targetPatientId}${queryParam}`,
      );

      if (response.data && response.data.records) {
        setRecords(response.data.records);
      } else {
        setRecords([]);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setRecords([]);
      } else {
        setError("خطا در دریافت پرونده سلامت.");
      }
    } finally {
      setLoading(false);
    }
  }, [targetPatientId, userRole, userProfile?._id]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <div
      className="flex-1 bg-white md:rounded-2xl shadow-lg p-6 md:p-8 overflow-y-auto custom-scrollbar font-sans relative"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gadget-light/10 text-gadget-light rounded-2xl flex items-center justify-center shrink-0">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">پرونده سلامت</h1>
            <p className="text-gray-500 text-sm mt-1">
              ثبت نتیجه ویزیت و مشاهده سوابق بیمار
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {userRole === "Doctor" && (
            <button
              onClick={() => navigate("/patients")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              بازگشت به لیست بیماران
            </button>
          )}

          {userRole === "Doctor" && targetPatientId && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={18} /> ثبت ویزیت جدید
            </button>
          )}
        </div>
      </div>

      {userRole === "Doctor" && !initialPatientId && (
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-blue-900 mb-2">
              شناسه بیمار (Patient ID) را وارد کنید:
            </label>
            <div className="relative">
              <Search
                className="absolute right-3 top-3 text-blue-400"
                size={18}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="مثال: 6a27ace14c..."
                dir="ltr"
                className="w-full bg-white border border-blue-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-blue-400 text-left font-mono"
              />
            </div>
          </div>
          <button
            onClick={() => setTargetPatientId(searchInput)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            جستجوی پرونده
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {!targetPatientId ? (
          <div className="text-center py-16 text-gray-400">
            <User
              size={64}
              strokeWidth={1}
              className="mx-auto mb-4 opacity-50"
            />
            <p className="text-lg font-medium text-gray-600">
              بیماری انتخاب نشده است
            </p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">
              در حال بارگذاری پرونده سلامت...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
            {error}
          </div>
        ) : records.length === 0 ? (
          <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-white text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">
              پرونده خالی است
            </h3>
            <p className="text-gray-500 text-sm">
              هیچ سابقه ویزیت یا نسخه‌ای برای این بیمار ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="relative border-r-2 border-gray-100 pr-6 space-y-8 py-4">
            {records.map((record, index) => (
              <div
                key={record._id || index}
                className="relative animate-in fade-in slide-in-from-bottom-4"
              >
                <span className="absolute -right-8.75 top-4 w-4 h-4 rounded-full bg-gadget-light ring-4 ring-white shadow-xs"></span>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 border-b border-gray-50 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {record.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                          <Calendar size={14} />
                          {new Date(record.createdAt).toLocaleDateString(
                            "fa-IR",
                            { year: "numeric", month: "long", day: "numeric" },
                          )}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          ساعت{" "}
                          {new Date(record.createdAt).toLocaleTimeString(
                            "fa-IR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        {record.doctor && (
                          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-bold">
                            <Stethoscope size={14} />
                            دکتر {record.doctor.firstName}{" "}
                            {record.doctor.lastName} ({record.doctor.Expertise})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={14} /> شرح حال و تشخیص
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                        {record.description}
                      </p>
                    </div>

                    {record.prescription && (
                      <div>
                        <h4 className="text-xs font-bold text-gadget-light mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill size={14} /> نسخه و تجویز
                        </h4>
                        <p className="text-sm text-gadget-dark leading-relaxed bg-gadget-light/5 p-3 rounded-xl border border-gadget-light/20 font-bold">
                          {record.prescription}
                        </p>
                      </div>
                    )}

                    {/* 👈 استفاده از کامپوننت جدید دانلود فایل */}
                    {record.attachments && record.attachments.length > 0 && (
                      <div className="pt-2 border-t border-gray-50 mt-4">
                        <h4 className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                          <Paperclip size={14} /> مدارک پیوست:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {record.attachments.map((file, i) => (
                            <FileDownload
                              key={i}
                              fileName={file}
                              className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg hover:bg-blue-100 hover:shadow-sm"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddHealthRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientId={targetPatientId}
        patientName="بیمار انتخاب شده"
        onSuccess={fetchRecords}
      />
    </div>
  );
}
