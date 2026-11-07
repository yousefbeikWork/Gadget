import { useState } from "react";
import {
  HeartPulse,
  Pill,
  AlertTriangle,
  FilePlus,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  FileText,
  Activity,
  Check,
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";
import FileUpload from "../../../components/common/FileUpload";

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

interface Props {
  onSuccessNext: () => void;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Step2MedicalHistory({ onSuccessNext }: Props) {
  const [loading, setLoading] = useState(false);

  // استیت‌های اطلاعات پایه پزشکی
  const [bloodGroup, setBloodGroup] = useState("");
  const [familyMedicalHistory, setFamilyMedicalHistory] = useState("");

  // حساسیت‌ها (بصورت تگ/چیپ)
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");

  // بیماری‌های زمینه‌ای
  const [pastIllnesses, setPastIllnesses] = useState<PastIllness[]>([]);
  const [tempIllness, setTempIllness] = useState<PastIllness>({
    diseaseName: "",
    isCured: false,
    description: "",
  });

  // داروها
  const [medications, setMedications] = useState<Medication[]>([]);
  const [tempMed, setTempMed] = useState<Medication>({
    drugName: "",
    dosage: "",
    isCurrentlyTaking: true,
    reason: "",
  });

  // اسناد و مدارک پزشکی
  const [documents, setDocuments] = useState<MedicalDoc[]>([]);
  const [tempDocTitle, setTempDocTitle] = useState("");
  const [tempDocFile, setTempDocFile] = useState("");

  // افزودن حساسیت دارویی/غذایی
  const handleAddAllergy = () => {
    const val = allergyInput.trim();
    if (!val) return;
    if (allergies.includes(val)) {
      toast.error("این حساسیت قبلاً ثبت شده است.");
      return;
    }
    setAllergies([...allergies, val]);
    setAllergyInput("");
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  // افزودن بیماری زمینه‌ای
  const handleAddIllness = () => {
    if (!tempIllness.diseaseName.trim()) {
      toast.error("نام بیماری را وارد فرمایید.");
      return;
    }
    setPastIllnesses([...pastIllnesses, tempIllness]);
    setTempIllness({ diseaseName: "", isCured: false, description: "" });
  };

  // افزودن دارو
  const handleAddMedication = () => {
    if (!tempMed.drugName.trim()) {
      toast.error("نام دارو را وارد فرمایید.");
      return;
    }
    setMedications([...medications, tempMed]);
    setTempMed({
      drugName: "",
      dosage: "",
      isCurrentlyTaking: true,
      reason: "",
    });
  };

  // افزودن سند
  const handleAddDocument = () => {
    if (!tempDocTitle.trim() || !tempDocFile) {
      toast.error("عنوان سند و فایل آپلود شده هر دو الزامی هستند.");
      return;
    }
    setDocuments([
      ...documents,
      { title: tempDocTitle.trim(), fileUrl: tempDocFile },
    ]);
    setTempDocTitle("");
    setTempDocFile("");
  };

  // ارسال نهایی اطلاعات سوابق پزشکی با متد PUT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("در حال ثبت سوابق سلامت...");

    try {
      const payload = {
        pastIllnesses,
        medications,
        allergies,
        documents,
        bloodGroup: bloodGroup || undefined,
        familyMedicalHistory: familyMedicalHistory.trim() || undefined,
      };

      await api.put("/users/patientsMedicalProfile", payload);

      toast.success("سوابق پزشکی با موفقیت ثبت شد.", { id: toastId });
      onSuccessNext();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "خطا در ثبت پرونده سوابق پزشکی.",
        { id: toastId },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 animate-in fade-in text-xs sm:text-sm"
    >
      {/* پیام راهنما */}
      <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-4 flex items-start gap-3">
        <HeartPulse size={22} className="text-teal-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed text-teal-900">
          <p className="font-bold mb-0.5">
            ثبت سوابق پزشکی و پرونده سلامت الکترونیک
          </p>
          <p className="text-teal-800/80 text-xs">
            تکمیل این اطلاعات به پزشکان معالج در تشخیص دقیق‌تر و جلوگیری از
            تداخلات دارویی کمک می‌نماید. (در صورت نداشتن سابقه می‌توانید از
            بخش‌ها عبور کنید).
          </p>
        </div>
      </div>

      {/* ۱. گروه خونی و سابقه ژنتیکی خانواده */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <Activity size={17} className="text-gadget-light" />
          اطلاعات پایه و ژنتیکی
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              گروه خونی
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-hidden focus:border-gadget-light cursor-pointer font-bold"
            >
              <option value="">نامشخص / نمی‌دانم</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              سابقه بیماری‌های ارثی در خانواده
            </label>
            <input
              type="text"
              value={familyMedicalHistory}
              onChange={(e) => setFamilyMedicalHistory(e.target.value)}
              placeholder="مثال: سابقه فشار خون و بیماری قلبی در پدر"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 outline-hidden focus:border-gadget-light"
            />
          </div>
        </div>
      </div>

      {/* ۲. حساسیت‌ها و آلرژی‌ها */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
        <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <AlertTriangle size={17} className="text-amber-500" />
          حساسیت‌های دارویی و غذایی
        </h4>

        <div className="flex gap-2">
          <input
            type="text"
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddAllergy();
              }
            }}
            placeholder="نام ماده یا دارو (مثلاً: پنی‌سیلین، آسپرین، بادام‌زمینی)..."
            className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 outline-hidden focus:border-gadget-light"
          />
          <button
            type="button"
            onClick={handleAddAllergy}
            className="px-4 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus size={16} /> <span>افزودن</span>
          </button>
        </div>

        {allergies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {allergies.map((item, idx) => (
              <span
                key={idx}
                className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAllergy(idx)}
                  className="text-amber-600 hover:text-rose-600"
                >
                  <Trash2 size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ۳. بیماری‌های زمینه‌ای */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
        <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <HeartPulse size={17} className="text-rose-500" />
          بیماری‌های زمینه‌ای و سوابق قبلی
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
          <input
            type="text"
            placeholder="نام بیماری (مثلاً: دیابت نوع ۲)"
            value={tempIllness.diseaseName}
            onChange={(e) =>
              setTempIllness({ ...tempIllness, diseaseName: e.target.value })
            }
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 outline-hidden text-xs"
          />
          <input
            type="text"
            placeholder="توضیحات (مثلاً: تحت کنترل با رژیم)"
            value={tempIllness.description}
            onChange={(e) =>
              setTempIllness({ ...tempIllness, description: e.target.value })
            }
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 outline-hidden text-xs"
          />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={tempIllness.isCured}
                onChange={(e) =>
                  setTempIllness({ ...tempIllness, isCured: e.target.checked })
                }
                className="rounded-sm"
              />
              بهبود یافته
            </label>
            <button
              type="button"
              onClick={handleAddIllness}
              className="mr-auto px-3 py-1.5 bg-gadget-dark text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Plus size={14} /> ثبت
            </button>
          </div>
        </div>

        {pastIllnesses.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-white border border-gray-100 p-2.5 rounded-xl text-xs"
          >
            <div>
              <strong>{item.diseaseName}</strong>
              {item.description && (
                <span className="text-gray-400 mx-2">• {item.description}</span>
              )}
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${item.isCured ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
              >
                {item.isCured ? "بهبود یافته" : "در حال حاضر مبتلا"}
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setPastIllnesses(pastIllnesses.filter((_, i) => i !== idx))
              }
              className="text-rose-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ۴. داروها */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
        <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <Pill size={17} className="text-blue-500" />
          داروهای مصرفی
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
          <input
            type="text"
            placeholder="نام دارو (مثلاً: متفورمین)"
            value={tempMed.drugName}
            onChange={(e) =>
              setTempMed({ ...tempMed, drugName: e.target.value })
            }
            className="bg-white border border-gray-200 rounded-lg px-2.5 py-2 outline-hidden text-xs"
          />
          <input
            type="text"
            placeholder="دوز (مثلاً: 500mg)"
            value={tempMed.dosage}
            onChange={(e) => setTempMed({ ...tempMed, dosage: e.target.value })}
            className="bg-white border border-gray-200 rounded-lg px-2.5 py-2 outline-hidden text-xs"
          />
          <input
            type="text"
            placeholder="علت مصرف (مثلاً: قند خون)"
            value={tempMed.reason}
            onChange={(e) => setTempMed({ ...tempMed, reason: e.target.value })}
            className="bg-white border border-gray-200 rounded-lg px-2.5 py-2 outline-hidden text-xs"
          />
          <button
            type="button"
            onClick={handleAddMedication}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold py-2 flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus size={14} /> ثبت دارو
          </button>
        </div>

        {medications.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-white border border-gray-100 p-2.5 rounded-xl text-xs"
          >
            <div>
              <strong>{item.drugName}</strong>
              {item.dosage && (
                <span className="text-gray-500 font-mono mx-1.5">
                  ({item.dosage})
                </span>
              )}
              {item.reason && (
                <span className="text-gray-400">• علت: {item.reason}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() =>
                setMedications(medications.filter((_, i) => i !== idx))
              }
              className="text-rose-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ۵. اسناد پزشکی و نتایج آزمایشات قبلی */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
        <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <FilePlus size={17} className="text-indigo-600" />
          مدارک و پرونده‌های پیشین (آزمایش، سونوگرافی و...)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
          <div>
            <input
              type="text"
              placeholder="عنوان سند (مثلاً: آزمایش خون سال ۱۴۰۲)"
              value={tempDocTitle}
              onChange={(e) => setTempDocTitle(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-hidden text-xs mb-2"
            />
            <FileUpload
              label="انتخاب فایل مدرک (PDF یا تصویر)"
              onUploadSuccess={(name) => setTempDocFile(name)}
              onRemove={() => setTempDocFile("")}
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              type="button"
              disabled={!tempDocTitle || !tempDocFile}
              onClick={handleAddDocument}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Check size={16} /> ذخیره مدرک در پرونده
            </button>
          </div>
        </div>

        {documents.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-white border border-gray-100 p-2.5 rounded-xl text-xs"
          >
            <span className="flex items-center gap-1.5 font-bold text-gray-800">
              <FileText size={14} className="text-indigo-600" /> {item.title}
            </span>
            <button
              type="button"
              onClick={() =>
                setDocuments(documents.filter((_, i) => i !== idx))
              }
              className="text-rose-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* دکمه مرحله بعد */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onSuccessNext}
          className="text-xs font-bold text-gray-500 hover:text-gray-800 px-3 py-2"
        >
          رد کردن این مرحله و ادامه ⬅️
        </button>

        <button
          type="submit"
          disabled={loading}
          className="min-w-50 py-3 px-6 bg-gadget-dark hover:bg-gadget-dark/90 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ArrowLeft size={17} />
          )}
          <span>
            {loading
              ? "در حال ثبت سوابق..."
              : "ثبت سوابق و رفتن به مدارک هویتی"}
          </span>
        </button>
      </div>
    </form>
  );
}
