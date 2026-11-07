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
  HeartPulse,
  AlertTriangle,
  ShieldAlert,
  Clock,
  ExternalLink,
  X,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import FileDownload from "../components/common/FileDownload";
import SecureImage from "../components/common/SecureImage";
import AddHealthRecordModal from "../components/modals/forms/AddHealthRecordModal";

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

interface PastIllness {
  diseaseName: string;
  isCured: boolean;
  description?: string;
}

interface Medication {
  drugName: string;
  dosage?: string;
  isCurrentlyTaking?: boolean;
  reason?: string;
}

interface MedicalDoc {
  title: string;
  fileUrl: string;
}

interface PatientMedicalProfile {
  bloodGroup?: string;
  familyMedicalHistory?: string;
  allergies?: string[];
  pastIllnesses?: PastIllness[];
  medications?: Medication[];
  documents?: MedicalDoc[];
}

export default function HealthRecords() {
  const { userProfile, userRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initialPatientId = location.state?.patientId || "";
  const initialPatientName = location.state?.patientName || "بیمار انتخاب شده";

  // استیت‌های نسخه‌ها و سوابق پزشک
  const [records, setRecords] = useState<HealthRecord[]>([]);
  // استیت سوابق خوداظهاری بیمار (سوابق پایه)
  const [medicalProfile, setMedicalProfile] =
    useState<PatientMedicalProfile | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [targetPatientId, setTargetPatientId] = useState<string>(
    userRole === "Patient" ? userProfile?._id || "" : initialPatientId,
  );
  const [searchInput, setSearchInput] = useState(initialPatientId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImageName, setPreviewImageName] = useState<string | null>(null);

  // فراخوانی هم‌زمان سوابق خوداظهاری و سوابق ویزیت
  const fetchAllData = useCallback(async () => {
    if (!targetPatientId) return;

    setLoading(true);
    setError(null);

    try {
      const queryParam =
        userRole === "Doctor" ? `?doctorId=${userProfile?._id}` : "";

      const [profileRes, recordsRes] = await Promise.allSettled([
        api.get(`/users/patientsMedicalProfile/${targetPatientId}`),
        api.get(
          `/healthRecords/historyPationtsHelthRecord/${targetPatientId}${queryParam}`,
        ),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value.data?.success) {
        setMedicalProfile(profileRes.value.data.data);
      } else {
        setMedicalProfile(null);
      }

      if (recordsRes.status === "fulfilled" && recordsRes.value.data?.records) {
        setRecords(recordsRes.value.data.records);
      } else {
        setRecords([]);
      }
    } catch {
      setError("خطا در دریافت اطلاعات پرونده سلامت.");
    } finally {
      setLoading(false);
    }
  }, [targetPatientId, userRole, userProfile?._id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return (
    <div
      className="flex-1 bg-white md:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar font-sans relative"
      dir="rtl"
    >
      {/* ================= هدر صفحه ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center shrink-0">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-800">
              پرونده سلامت بیمار
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              مشاهده سوابق و اطلاعات بالینی و ثبت نتیجه ویزیت
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {userRole === "Doctor" && (
            <button
              onClick={() => navigate("/patients")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              بازگشت به لیست بیماران
            </button>
          )}

          {userRole === "Doctor" && targetPatientId && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={18} /> ثبت ویزیت جدید
            </button>
          )}
        </div>
      </div>

      {/* ================= جستجوی شناسه بیمار (در صورت لزوم) ================= */}
      {userRole === "Doctor" && !initialPatientId && (
        <div className="bg-blue-50 border border-blue-100 p-4 sm:p-5 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs sm:text-sm font-bold text-blue-900 mb-2">
              شناسه اختصاصی بیمار (Patient ID) را وارد کنید:
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
                placeholder="مثال: 6ae1f310c102..."
                dir="ltr"
                className="w-full bg-white border border-blue-200 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm focus:border-blue-400 outline-hidden font-mono"
              />
            </div>
          </div>
          <button
            onClick={() => setTargetPatientId(searchInput.trim())}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            جستجوی پرونده
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {!targetPatientId ? (
          <div className="text-center py-16 text-gray-400">
            <User
              size={64}
              strokeWidth={1}
              className="mx-auto mb-4 opacity-50"
            />
            <p className="text-base font-bold text-gray-600">
              بیماری انتخاب نشده است
            </p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={38} />
            <p className="text-xs sm:text-sm font-bold text-gray-500">
              در حال بازخوانی پرونده سلامت و سوابق بالینی بیمار...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center text-xs sm:text-sm font-bold border border-red-100">
            {error}
          </div>
        ) : (
          <>
            {/* ================== ۱. بخش سوابق خوداظهاری بیمار (صرفاً خواندنی) ================== */}
            <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                    <HeartPulse size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900">
                      سوابق سلامت و شرح حال پایه بیمار
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      اطلاعات ثبت‌شده توسط خود بیمار (صرفاً جهت اطلاع کادر
                      درمان)
                    </p>
                  </div>
                </div>

                <span className="text-[10px] sm:text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
                  غیرقابل ویرایش
                </span>
              </div>

              {!medicalProfile ? (
                <div className="p-6 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex items-center gap-2 text-xs text-amber-800">
                  <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                  <span>
                    بیمار هنوز اطلاعات سوابق پزشکی و بیماری‌های زمینه‌ای خود را
                    تکمیل نکرده است.
                  </span>
                </div>
              ) : (
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* گروه خونی و سابقه خانوادگی */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-xs mb-1">
                        گروه خونی:
                      </span>
                      <strong className="text-gray-900 font-mono text-sm">
                        {medicalProfile.bloodGroup || "ثبت نشده"}
                      </strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-400 block text-xs mb-1">
                        سابقه بیماری‌های ارثی / خانوادگی:
                      </span>
                      <strong className="text-gray-800 leading-relaxed">
                        {medicalProfile.familyMedicalHistory || "ثبت نشده است"}
                      </strong>
                    </div>
                  </div>

                  {/* حساسیت‌ها */}
                  <div>
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5 mb-2">
                      <AlertTriangle size={15} className="text-amber-500" />{" "}
                      حساسیت‌های دارویی و غذایی:
                    </span>
                    {medicalProfile.allergies &&
                    medicalProfile.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {medicalProfile.allergies.map((allergy, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-2.5 py-1 rounded-lg font-bold"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        هیچ حساسیتی ثبت نشده است.
                      </p>
                    )}
                  </div>

                  {/* بیماری‌های زمینه‌ای */}
                  <div>
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5 mb-2">
                      <Activity size={15} className="text-rose-500" />{" "}
                      بیماری‌های زمینه‌ای:
                    </span>
                    {medicalProfile.pastIllnesses &&
                    medicalProfile.pastIllnesses.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {medicalProfile.pastIllnesses.map((illness, idx) => (
                          <div
                            key={idx}
                            className="border border-gray-200/80 bg-gray-50/50 p-3 rounded-xl flex justify-between items-center text-xs"
                          >
                            <div>
                              <strong className="text-gray-800">
                                {illness.diseaseName}
                              </strong>
                              {illness.description && (
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  {illness.description}
                                </p>
                              )}
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                illness.isCured
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {illness.isCured
                                ? "بهبود یافته"
                                : "در حال حاضر مبتلا"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        بیماری زمینه‌ای ثبت نشده است.
                      </p>
                    )}
                  </div>

                  {/* داروهای مصرفی */}
                  <div>
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5 mb-2">
                      <Pill size={15} className="text-blue-500" /> داروهای جاری
                      بیمار:
                    </span>
                    {medicalProfile.medications &&
                    medicalProfile.medications.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {medicalProfile.medications.map((med, idx) => (
                          <div
                            key={idx}
                            className="border border-gray-200/80 bg-gray-50/50 p-3 rounded-xl text-xs"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <strong className="text-gray-800">
                                {med.drugName}
                              </strong>
                              {med.dosage && (
                                <span
                                  className="font-mono text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200"
                                  dir="ltr"
                                >
                                  {med.dosage}
                                </span>
                              )}
                            </div>
                            {med.reason && (
                              <p className="text-[11px] text-gray-500">
                                علت مصرف: {med.reason}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        دارویی ثبت نشده است.
                      </p>
                    )}
                  </div>

                  {/* مدارک و آزمایش‌های بارگذاری‌شده توسط خود بیمار */}
                  {medicalProfile.documents &&
                    medicalProfile.documents.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5 mb-2">
                          <FileText size={15} className="text-indigo-600" />{" "}
                          مدارک و آزمایش‌های قبلی بیمار:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {medicalProfile.documents.map((doc, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex items-center justify-between gap-2"
                            >
                              <span
                                className="text-xs font-bold text-gray-800 truncate"
                                title={doc.title}
                              >
                                {doc.title}
                              </span>
                              <FileDownload
                                fileName={doc.fileUrl}
                                className="px-2.5 py-1 bg-white hover:bg-gray-100 text-indigo-700 rounded-lg text-xs font-bold border border-gray-200 shadow-2xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* ================== ۲. خط زمانی سوابق ویزیت و نسخه‌های پزشکان ================== */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h3 className="font-black text-sm sm:text-base text-gray-800 flex items-center gap-2">
                  <Stethoscope size={18} className="text-gadget-dark" />
                  سوابق ویزیت و نسخه‌های ثبت‌شده ({records.length} ویزیت)
                </h3>
              </div>

              {records.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                  <FileText size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-bold text-sm text-gray-700">
                    پرونده ویزیت خالی است
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    تاکنون هیچ نسخه یا شرح ویزیتی برای این بیمار ثبت نشده است.
                  </p>
                </div>
              ) : (
                <div className="relative border-r-2 border-gray-200 pr-5 sm:pr-6 space-y-6 py-2">
                  {records.map((record, index) => (
                    <div
                      key={record._id || index}
                      className="relative animate-in fade-in slide-in-from-bottom-2"
                    >
                      <span className="absolute -right-7 sm:-right-8 top-4 w-3.5 h-3.5 rounded-full bg-gadget-light ring-4 ring-white shadow-xs"></span>

                      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <h4 className="font-bold text-sm sm:text-base text-gray-900">
                              {record.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-500 font-medium">
                              <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                                <Calendar size={13} className="text-gray-400" />
                                {new Date(record.createdAt).toLocaleDateString(
                                  "fa-IR",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                              <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 font-mono">
                                <Clock size={13} className="text-gray-400" />
                                ساعت{" "}
                                {new Date(record.createdAt).toLocaleTimeString(
                                  "fa-IR",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </div>

                          {record.doctor && (
                            <span className="flex items-center gap-1.5 bg-teal-50 text-teal-800 border border-teal-100 px-3 py-1.5 rounded-xl text-xs font-bold w-fit">
                              <Stethoscope
                                size={14}
                                className="text-teal-600"
                              />
                              دکتر {record.doctor.firstName}{" "}
                              {record.doctor.lastName} (
                              {record.doctor.Expertise})
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-gray-400 mb-1 flex items-center gap-1">
                            <Activity size={13} /> شرح حال و تشخیص:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-700 bg-gray-50/70 p-3 rounded-xl border border-gray-100 leading-relaxed">
                            {record.description}
                          </p>
                        </div>

                        {record.prescription && (
                          <div>
                            <span className="text-[11px] font-bold text-gadget-dark mb-1 flex items-center gap-1">
                              <Pill size={13} /> نسخه و داروی تجویزی:
                            </span>
                            <p className="text-xs sm:text-sm text-gadget-dark bg-gadget-light/5 p-3 rounded-xl border border-gadget-light/20 font-bold leading-relaxed">
                              {record.prescription}
                            </p>
                          </div>
                        )}

                        {record.attachments &&
                          record.attachments.length > 0 && (
                            <div className="pt-2 border-t border-gray-100">
                              <span className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1">
                                <Paperclip size={13} /> مدارک پیوست این ویزیت:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {record.attachments.map((file, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-1.5"
                                  >
                                    <FileDownload
                                      fileName={file}
                                      className="text-xs text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-2xs"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setPreviewImageName(file)}
                                      className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 cursor-pointer"
                                      title="مشاهده مستقیم تصویر"
                                    >
                                      <ExternalLink size={13} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* مودال ثبت ویزیت جدید */}
      <AddHealthRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientId={targetPatientId}
        patientName={initialPatientName}
        onSuccess={fetchAllData}
      />

      {/* مودال پیش‌نمایش تصویر در ابعاد اصلی */}
      {previewImageName && (
        <div
          onClick={() => setPreviewImageName(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 sm:p-5 max-w-2xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="text-xs sm:text-sm font-bold text-gray-800">
                پیش‌نمایش مدرک پیوست
              </h4>
              <button
                type="button"
                onClick={() => setPreviewImageName(null)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
              <SecureImage
                fileName={previewImageName}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setPreviewImageName(null)}
                className="px-5 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
