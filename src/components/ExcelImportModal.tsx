import { useState } from "react";
import {
  X,
  FileSpreadsheet,
  AlertTriangle,
  Loader2,
  Upload,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import FileUpload from "./FileUpload";

interface FailedRecord {
  rowNumber: number;
  fullName: string;
  errorReason: string;
}

interface ImportResponse {
  message: string;
  stats: {
    totalRowsFound: number;
    successCount: number;
    failedCount: number;
  };
  failedDoctors?: FailedRecord[];
  failedPatients?: FailedRecord[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRefresh: () => void;
  importType?: "doctors" | "patients"; // 👈 پراپ تعیین‌کننده نوع ایمپورت (پیش‌فرض: پزشکان)
}

// تنظیمات داینامیک بر اساس نوع کاربری
const IMPORT_CONFIG = {
  doctors: {
    title: "افزودن دسته‌جمعی پزشکان",
    endpoint: "/Admin/import-doctors",
    loadingText: "در حال پردازش و استخراج اطلاعات پزشکان...",
    buttonLoadingText: "در حال خواندن و ثبت پزشکان...",
    guideText:
      "فایل اکسل باید شامل ستون‌های مشخصات هویتی (نام، نام خانوادگی، کدملی، شماره موبایل) و مشخصات کاری (کد نظام پزشکی، تخصص، تلفن مطب و نشانی) باشد.",
  },
  patients: {
    title: "افزودن دسته‌جمعی بیماران",
    endpoint: "/Admin/import-patients",
    loadingText: "در حال پردازش و استخراج اطلاعات بیماران...",
    buttonLoadingText: "در حال خواندن و ثبت بیماران...",
    guideText:
      "فایل اکسل باید شامل ستون‌های مشخصات هویتی بیمار (نام، نام خانوادگی، کدملی، موبایل، سن، نام پدر، جنسیت، وضعیت تاهل) باشد.",
  },
};

export default function ExcelImportModal({
  isOpen,
  onClose,
  onSuccessRefresh,
  importType = "doctors",
}: Props) {
  const [minioObjectName, setMinioObjectName] = useState<string | null>(null);
  const [, setOriginalFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);

  if (!isOpen) return null;

  const config = IMPORT_CONFIG[importType];

  // استخراج هوشمند لیست خطاها (چه پزشک باشد چه بیمار)
  const failedList: FailedRecord[] =
    importResult?.failedDoctors || importResult?.failedPatients || [];

  const handleReset = () => {
    setMinioObjectName(null);
    setOriginalFileName(null);
    setImportResult(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleProcessExcel = async () => {
    if (!minioObjectName) {
      toast.error("لطفاً ابتدا فایل اکسل را بارگذاری کنید.");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading(config.loadingText);

    try {
      const response = await api.post(config.endpoint, {
        minioObjectName,
      });

      if (response.data) {
        setImportResult(response.data);
        toast.success(
          response.data.message || "فایل اکسل با موفقیت پردازش شد.",
          { id: toastId },
        );
        onSuccessRefresh();
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "خطایی در پردازش فایل اکسل رخ داد.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs font-sans"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* هدر مودال */}
        <div className="bg-gadget-dark p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">{config.title}</h3>
              <p className="text-[11px] text-gray-300">
                بارگذاری از طریق فایل اکسل (.xlsx, .xls)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* محتوای مودال */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          {/* راهنمای ستون‌ها */}
          {!importResult && (
            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed space-y-1">
              <p className="font-bold">نکات ساختار فایل اکسل:</p>
              <p className="text-blue-800/80">{config.guideText}</p>
            </div>
          )}

          {/* کامپوننت آپلود فایل */}
          {!importResult && (
            <div className="space-y-4">
              <FileUpload
                label="انتخاب یا رها کردن فایل اکسل"
                acceptedTypes=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onUploadSuccess={(objectName, origName) => {
                  setMinioObjectName(objectName);
                  setOriginalFileName(origName);
                }}
              />

              {minioObjectName && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProcessExcel}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{config.buttonLoadingText}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>پردازش و ثبت نهایی در دیتابیس</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* نمایش گزارش نتایج پردازش اکسل */}
          {importResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                  <span className="block text-[11px] text-gray-500 font-bold mb-1">
                    کل سطرها
                  </span>
                  <span className="text-lg font-black text-gray-800">
                    {importResult.stats.totalRowsFound}
                  </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                  <span className="block text-[11px] text-emerald-700 font-bold mb-1">
                    ثبت موفق
                  </span>
                  <span className="text-lg font-black text-emerald-700">
                    {importResult.stats.successCount}
                  </span>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl">
                  <span className="block text-[11px] text-rose-700 font-bold mb-1">
                    خطا / تکراری
                  </span>
                  <span className="text-lg font-black text-rose-700">
                    {importResult.stats.failedCount}
                  </span>
                </div>
              </div>

              {/* لیست سطرهای ناموفق */}
              {failedList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-amber-500" />
                    سطرهای با خطا مواجه‌شده:
                  </h4>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {failedList.map((item, index) => (
                      <div
                        key={index}
                        className="bg-rose-50/60 border border-rose-100 p-2.5 rounded-xl text-xs flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between font-bold text-rose-900">
                          <span>
                            سطر {item.rowNumber -1 }: {item.fullName || "نامشخص"}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-700 leading-relaxed">
                          {item.errorReason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>بارگذاری فایل دیگر</span>
              </button>
            </div>
          )}
        </div>

        {/* فوتر مودال */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
          {/* <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            بستن
          </button> */}
        </div>
      </div>
    </div>
  );
}
