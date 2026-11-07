import { useState, useEffect } from "react";
import {
  Activity,
  HeartPulse,
  Pill,
  AlertTriangle,
  Stethoscope,
  Calendar,
  Clock,
  FileText,
  Edit3,
  X,
  Plus,
  Trash2,
  Save,
  Loader2,
  FileDown,
  Paperclip,
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";
import FileUpload from "../../../components/common/FileUpload";
import FileDownload from "../../../components/common/FileDownload";

interface PastIllness {
  diseaseName: string;
  isCured: boolean;
  description: string;
}

interface Medication {
  drugName: string;
  dosage: string;
  isCurrentlyTaking: boolean;
  reason: string;
}

interface MedicalDoc {
  title: string;
  fileUrl: string;
}

interface HealthRecord {
  _id: string;
  title: string;
  description: string;
  prescription: string;
  attachments?: string[];
  createdAt: string;
  doctor?: {
    _id: string;
    firstName: string;
    lastName: string;
    Expertise: string;
  };
}

interface Props {
  patientId: string;
  isReadOnly?: boolean; // برای استفاده پزشک یا ادمین
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientMedicalRecord({ patientId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [medicalProfile, setMedicalProfile] = useState<any>(null);
  const [doctorRecords, setDoctorRecords] = useState<HealthRecord[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // استیت‌های فرم ویرایش سوابق بیمار (PUT)
  const [editForm, setEditForm] = useState({
    bloodGroup: "",
    familyMedicalHistory: "",
    allergies: [] as string[],
    pastIllnesses: [] as PastIllness[],
    medications: [] as Medication[],
    documents: [] as MedicalDoc[],
  });

  const [allergyInput, setAllergyInput] = useState("");
  const [tempIllness, setTempIllness] = useState<PastIllness>({ diseaseName: "", isCured: false, description: "" });
  const [tempMed, setTempMed] = useState<Medication>({ drugName: "", dosage: "", isCurrentlyTaking: true, reason: "" });
  const [tempDocTitle, setTempDocTitle] = useState("");
  const [tempDocFile, setTempDocFile] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, recordsRes] = await Promise.allSettled([
        api.get(`/users/patientsMedicalProfile/${patientId}`),
        api.get(`/healthRecords/historyPationtsHelthRecord/${patientId}`),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value.data?.success) {
        const data = profileRes.value.data.data;
        setMedicalProfile(data);
        setEditForm({
          bloodGroup: data.bloodGroup || "",
          familyMedicalHistory: data.familyMedicalHistory || "",
          allergies: data.allergies || [],
          pastIllnesses: data.pastIllnesses || [],
          medications: data.medications || [],
          documents: data.documents || [],
        });
      }

      if (recordsRes.status === "fulfilled" && recordsRes.value.data?.records) {
        setDoctorRecords(recordsRes.value.data.records);
      }
    } catch {
      toast.error("خطا در بارگذاری پرونده جامع سلامت.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  // ثبت ویرایش سوابق بیمار با متد PUT
  const handleSaveMedicalProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("در حال ذخیره سوابق پزشکی...");

    try {
      const payload = {
        bloodGroup: editForm.bloodGroup || undefined,
        familyMedicalHistory: editForm.familyMedicalHistory.trim() || undefined,
        allergies: editForm.allergies,
        pastIllnesses: editForm.pastIllnesses,
        medications: editForm.medications,
        documents: editForm.documents,
      };

      await api.put("/users/patientsMedicalProfile", payload);
      toast.success("سوابق سلامت با موفقیت بروزرسانی شد.", { id: toastId });
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در بروزرسانی پرونده سلامت.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gadget-light">
        <Loader2 className="animate-spin mb-3" size={34} />
        <p className="text-xs font-bold text-gray-500">در حال فراخوانی پرونده سلامت الکترونیک...</p>
      </div>
    );
  }

  // تجمیع اسناد بخش بیمار و پیوست‌های نسخ پزشکان برای بخش سوم
  const patientDocs: MedicalDoc[] = medicalProfile?.documents || [];
  const doctorAttachments: string[] = doctorRecords.flatMap((r) => r.attachments || []);

  return (
    <div className="space-y-6 sm:space-y-8 font-sans" dir="rtl">
      
      {/* ================== بخش ۱: اطلاعات اولیه و سوابق خوداظهاری بیمار ================== */}
      <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <HeartPulse size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900">سوابق پزشکی و پرونده پایه بیمار</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">اطلاعات بیماری‌های زمینه‌ای، حساسیت‌ها و داروهای جاری</p>
            </div>
          </div>

          {!isReadOnly && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Edit3 size={14} /> <span>ویرایش سوابق</span>
            </button>
          )}
        </div>

        {/* گروه خونی و سابقه ژنتیک */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 block mb-0.5">گروه خونی:</span>
            <strong className="text-gray-900 font-mono text-sm">{medicalProfile?.bloodGroup || "ثبت نشده"}</strong>
          </div>
          <div className="sm:col-span-2">
            <span className="text-gray-400 block mb-0.5">سابقه ژنتیکی / بیماری‌های ارثی:</span>
            <strong className="text-gray-900 leading-relaxed">{medicalProfile?.familyMedicalHistory || "ثبت نشده است"}</strong>
          </div>
        </div>

        {/* حساسیت‌ها */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-500" /> حساسیت‌های دارویی و غذایی:
          </span>
          {medicalProfile?.allergies?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {medicalProfile.allergies.map((item: string, idx: number) => (
                <span key={idx} className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-2.5 py-1 rounded-lg font-bold">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">هیچ حساسیتی ثبت نشده است.</p>
          )}
        </div>

        {/* بیماری‌های زمینه‌ای */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
            <Activity size={15} className="text-rose-500" /> بیماری‌های زمینه‌ای:
          </span>
          {medicalProfile?.pastIllnesses?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {medicalProfile.pastIllnesses.map((illness: any, idx: number) => (
                <div key={idx} className="border border-gray-100 bg-gray-50/50 p-2.5 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <strong className="text-gray-800">{illness.diseaseName}</strong>
                    {illness.description && <p className="text-[11px] text-gray-500 mt-0.5">{illness.description}</p>}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${illness.isCured ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                    {illness.isCured ? "بهبود یافته" : "در حال درمان"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">بیماری زمینه‌ای ثبت نشده است.</p>
          )}
        </div>

        {/* داروهای مصرفی */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
            <Pill size={15} className="text-blue-500" /> داروهای جاری:
          </span>
          {medicalProfile?.medications?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {medicalProfile.medications.map((med: any, idx: number) => (
                <div key={idx} className="border border-gray-100 bg-gray-50/50 p-2.5 rounded-xl text-xs">
                  <div className="flex justify-between">
                    <strong className="text-gray-800">{med.drugName}</strong>
                    <span className="font-mono text-gray-500" dir="ltr">{med.dosage}</span>
                  </div>
                  {med.reason && <p className="text-[11px] text-gray-500 mt-0.5">علت مصرف: {med.reason}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">دارویی ثبت نشده است.</p>
          )}
        </div>
      </div>

      {/* ================== بخش ۲: ویزیت‌ها و نسخه‌های پزشکان ================== */}
      <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Stethoscope size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900">سوابق ویزیت و نسخه‌های پزشک</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">نسخه‌ها و تشخیص‌های ثبت‌شده توسط کادر درمان</p>
          </div>
        </div>

        {doctorRecords.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 p-8 text-center rounded-2xl text-gray-400 text-xs">
            هنوز نسخه یا تشخیصی از طرف پزشکان برای این پرونده ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-4">
            {doctorRecords.map((record) => (
              <div key={record._id} className="border border-gray-200/80 rounded-2xl p-4 space-y-3 bg-gray-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{record.title}</span>
                    {record.doctor && (
                      <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        دکتر {record.doctor.firstName} {record.doctor.lastName} ({record.doctor.Expertise})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(record.createdAt).toLocaleDateString("fa-IR")}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(record.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-gray-400 block mb-1">شرح و تشخیص پزشک:</span>
                  <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-100 leading-relaxed">{record.description}</p>
                </div>

                {record.prescription && (
                  <div>
                    <span className="text-[11px] font-bold text-gadget-dark block mb-1">نسخه تجویزشده:</span>
                    <p className="text-xs text-gadget-dark bg-gadget-light/5 p-3 rounded-xl border border-gadget-light/20 font-medium leading-relaxed">{record.prescription}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================== بخش ۳: پیوست‌ها و مدارک پزشکی آپلودشده ================== */}
      <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Paperclip size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900">مدارک، آزمایش‌ها و فایل‌های پیوست</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">آزمایش‌ها، تصاویر رادیولوژی و اسناد بارگذاری‌شده</p>
          </div>
        </div>

        {patientDocs.length === 0 && doctorAttachments.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 p-8 text-center rounded-2xl text-gray-400 text-xs">
            هیچ سند یا آزمایشی در این پرونده پیوست نشده است.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* اسناد خود بیمار */}
            {patientDocs.map((doc, idx) => (
              <div key={idx} className="bg-gray-50/80 border border-gray-200 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-2xs">
                <span className="text-xs font-bold text-gray-800 truncate" title={doc.title}>
                  <FileText size={14} className="inline text-indigo-600 ml-1" /> {doc.title}
                </span>
                <FileDownload fileName={doc.fileUrl} className="w-full justify-center py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold shadow-2xs" />
              </div>
            ))}

            {/* پیوست‌های نسخ پزشکان */}
            {doctorAttachments.map((fileName, idx) => (
              <div key={idx} className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-2xs">
                <span className="text-xs font-bold text-blue-900 truncate" title={fileName}>
                  <FileText size={14} className="inline text-blue-600 ml-1" /> پیوست نسخه پزشک
                </span>
                <FileDownload fileName={fileName} className="w-full justify-center py-2 bg-white hover:bg-gray-100 text-blue-800 rounded-xl text-xs font-bold shadow-2xs" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================== مودال ویرایش سوابق بیمار (PUT) ================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/90 shrink-0">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">ویرایش سوابق سلامت بیمار</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-xl cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMedicalProfile} className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1 text-xs">
              {/* گروه خونی و ژنتیک */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">گروه خونی</label>
                  <select
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-hidden font-bold"
                  >
                    <option value="">نامشخص</option>
                    {BLOOD_GROUPS.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">سابقه خانوادگی</label>
                  <input
                    type="text"
                    value={editForm.familyMedicalHistory}
                    onChange={(e) => setEditForm({ ...editForm, familyMedicalHistory: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 outline-hidden"
                  />
                </div>
              </div>

              {/* حساسیت‌ها */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700">حساسیت‌ها</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    placeholder="نام حساسیت را بنویسید..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (allergyInput.trim() && !editForm.allergies.includes(allergyInput.trim())) {
                        setEditForm({ ...editForm, allergies: [...editForm.allergies, allergyInput.trim()] });
                        setAllergyInput("");
                      }
                    }}
                    className="px-4 bg-amber-100 text-amber-900 rounded-xl font-bold cursor-pointer"
                  >
                    افزودن
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {editForm.allergies.map((a, i) => (
                    <span key={i} className="bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      {a}
                      <X size={12} className="cursor-pointer" onClick={() => setEditForm({ ...editForm, allergies: editForm.allergies.filter((_, idx) => idx !== i) })} />
                    </span>
                  ))}
                </div>
              </div>

              {/* بیماری‌ها */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700">بیماری‌های زمینه‌ای</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  <input
                    type="text"
                    placeholder="نام بیماری"
                    value={tempIllness.diseaseName}
                    onChange={(e) => setTempIllness({ ...tempIllness, diseaseName: e.target.value })}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1.5"
                  />
                  <input
                    type="text"
                    placeholder="توضیحات"
                    value={tempIllness.description}
                    onChange={(e) => setTempIllness({ ...tempIllness, description: e.target.value })}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempIllness.diseaseName.trim()) {
                        setEditForm({ ...editForm, pastIllnesses: [...editForm.pastIllnesses, tempIllness] });
                        setTempIllness({ diseaseName: "", isCured: false, description: "" });
                      }
                    }}
                    className="bg-gadget-dark text-white rounded-lg font-bold py-1.5 cursor-pointer"
                  >
                    ثبت بیماری
                  </button>
                </div>
                {editForm.pastIllnesses.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <span>{item.diseaseName} ({item.description || "بدون توضیح"})</span>
                    <Trash2 size={14} className="text-rose-500 cursor-pointer" onClick={() => setEditForm({ ...editForm, pastIllnesses: editForm.pastIllnesses.filter((_, idx) => idx !== i) })} />
                  </div>
                ))}
              </div>

              {/* داروها */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700">داروها</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  <input
                    type="text"
                    placeholder="نام دارو"
                    value={tempMed.drugName}
                    onChange={(e) => setTempMed({ ...tempMed, drugName: e.target.value })}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1.5"
                  />
                  <input
                    type="text"
                    placeholder="دوز مصرفی"
                    value={tempMed.dosage}
                    onChange={(e) => setTempMed({ ...tempMed, dosage: e.target.value })}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempMed.drugName.trim()) {
                        setEditForm({ ...editForm, medications: [...editForm.medications, tempMed] });
                        setTempMed({ drugName: "", dosage: "", isCurrentlyTaking: true, reason: "" });
                      }
                    }}
                    className="bg-blue-600 text-white rounded-lg font-bold py-1.5 cursor-pointer"
                  >
                    ثبت دارو
                  </button>
                </div>
                {editForm.medications.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <span>{item.drugName} - {item.dosage}</span>
                    <Trash2 size={14} className="text-rose-500 cursor-pointer" onClick={() => setEditForm({ ...editForm, medications: editForm.medications.filter((_, idx) => idx !== i) })} />
                  </div>
                ))}
              </div>

              {/* اسناد پزشکی */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700">افزودن سند یا مدرک جدید</label>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                  <input
                    type="text"
                    placeholder="عنوان مدرک (مثلاً: نتیجه MRI سال ۱۴۰۳)"
                    value={tempDocTitle}
                    onChange={(e) => setTempDocTitle(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-hidden"
                  />
                  <FileUpload
                    label="انتخاب فایل مدرک"
                    onUploadSuccess={(name) => setTempDocFile(name)}
                    onRemove={() => setTempDocFile("")}
                  />
                  <button
                    type="button"
                    disabled={!tempDocTitle || !tempDocFile}
                    onClick={() => {
                      setEditForm({ ...editForm, documents: [...editForm.documents, { title: tempDocTitle.trim(), fileUrl: tempDocFile }] });
                      setTempDocTitle("");
                      setTempDocFile("");
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                  >
                    افزودن به لیست اسناد
                  </button>
                </div>
                {editForm.documents.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <span>{item.title}</span>
                    <Trash2 size={14} className="text-rose-500 cursor-pointer" onClick={() => setEditForm({ ...editForm, documents: editForm.documents.filter((_, idx) => idx !== i) })} />
                  </div>
                ))}
              </div>

              {/* فوتر مودال */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-gadget-dark text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>ذخیره نهایی تغییرات</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}