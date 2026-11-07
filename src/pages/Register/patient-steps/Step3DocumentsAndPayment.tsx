import { useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, FileText, ArrowLeft, Loader2 } from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import FileUpload from "../../../components/common/FileUpload";

export default function Step3DocumentsAndPayment() {
  const { login } = useAuth();
  const [nationalIdFront, setNationalIdFront] = useState("");
  const [nationalIdBack, setNationalIdBack] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nationalIdFront || !nationalIdBack) {
      toast.error("لطفاً تصویر هر دو طرف کارت ملی را بارگذاری فرمایید.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("در حال اعتبارسنجی مدارک کارت ملی...");

    try {
      // ۱. ارسال تصاویر کارت ملی به سرور
      await api.post("/users/updatePatientDocuments", {
        nationalIdFront,
        nationalIdBack,
      });

      toast.loading("مدارک ثبت شد. در حال اتصال به درگاه پرداخت بانکی...", {
        id: toastId,
      });

      // ۲. دریافت لینک درگاه پرداخت کارت RFID
      const paymentResponse = await api.post("/peyment/rfid/pay", {});

      if (
        paymentResponse.data?.success &&
        paymentResponse.data?.data?.paymentUrl
      ) {
        toast.success("در حال انتقال به درگاه بانک...", { id: toastId });

        login(localStorage.getItem("userRole") || "Patient");

        window.location.href = paymentResponse.data.data.paymentUrl;
      } else {
        toast.error("خطا در ایجاد درگاه پرداخت. لطفاً دوباره تلاش کنید.", {
          id: toastId,
        });
      }
    } catch (err: any) {
      const status = err.response?.status;
      const serverError =
        err.response?.data?.error || err.response?.data?.message;

      if (
        status === 400 &&
        (serverError?.includes("does not match") ||
          serverError?.includes("unclear"))
      ) {
        toast.error(
          "تصویر کارت ملی با کد ملی ثبت‌شده تطابق ندارد یا کیفیت تصویر تار است. لطفاً تصویر باکیفیت‌تری بارگذاری کنید.",
          { id: toastId, duration: 6000 },
        );
      } else {
        toast.error(serverError || "خطا در تایید مدارک شناسایی.", {
          id: toastId,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in">
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <p className="font-bold mb-0.5">
            تأیید هویت و صدور پرونده سلامت الکترونیک
          </p>
          <p className="text-emerald-800/80">
            تصویر رو و پشت کارت ملی توسط هوش مصنوعی و سامانه احراز هویت تطبیق
            داده می‌شود. لطفاً تصاویری واضح، بدون بازتاب نور و خوانا بارگذاری
            فرمایید.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* روی کارت ملی */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-gray-800 pb-2 border-b border-gray-100">
            <FileText size={17} className="text-gadget-light" />
            <h4 className="text-xs sm:text-sm font-bold">
              ۱. تصویر روی کارت ملی *
            </h4>
          </div>
          <FileUpload
            label="انتخاب تصویر روی کارت ملی"
            acceptedTypes="image/jpeg,image/png,image/jpg"
            onUploadSuccess={(minioName: string) =>
              setNationalIdFront(minioName)
            }
            onRemove={() => setNationalIdFront("")}
          />
        </div>

        {/* پشت کارت ملی */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-gray-800 pb-2 border-b border-gray-100">
            <FileText size={17} className="text-gadget-light" />
            <h4 className="text-xs sm:text-sm font-bold">
              ۲. تصویر پشت کارت ملی *
            </h4>
          </div>
          <FileUpload
            label="انتخاب تصویر پشت کارت ملی"
            acceptedTypes="image/jpeg,image/png,image/jpg"
            onUploadSuccess={(minioName: string) =>
              setNationalIdBack(minioName)
            }
            onRemove={() => setNationalIdBack("")}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !nationalIdFront || !nationalIdBack}
          className={`w-full sm:w-auto min-w-64 py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 text-white ${
            isLoading || !nationalIdFront || !nationalIdBack
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              : "bg-gadget-dark hover:bg-gadget-dark/90 cursor-pointer"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>در حال اعتبارسنجی و اتصال به بانک...</span>
            </>
          ) : (
            <>
              <span>تکمیل ثبت‌نام و پرداخت هزینه کارت سلامت</span>
              <ArrowLeft size={17} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
