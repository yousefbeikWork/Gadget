import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Home,
  CalendarDays,
  Copy,
  Check,
  RotateCcw,
  Receipt,
  HelpCircle,
  Loader2,
  Clock,
  Hash,
  Printer,
  User,
  Building2,
  CreditCard,
  LayoutDashboard,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

interface DoctorInfo {
  _id?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

interface ClinicInfo {
  _id?: string;
  name?: string;
  centerName?: string;
}

interface AppointmentDetails {
  id?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  doctor?: DoctorInfo | string | null;
  clinic?: ClinicInfo | string | null;
}

interface PaymentReceipt {
  paymentId: string;
  status: "PAID" | "SUCCESS" | "CONFIRMED" | "FAILED" | string;
  amount: number;
  refNum?: string | null;
  resNum?: string | null;
  paidAt?: string | null;
  appointment?: AppointmentDetails;
  description?: string;
}

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // خواندن پارامترها از URL
  const urlStatus = searchParams.get("status");
  const paymentIdParam = searchParams.get("paymentId");
  const typeParam = searchParams.get("type");
  const resNumParam = searchParams.get("resNum") || searchParams.get("ResNum");

  const isRfidPayment =
    typeParam?.toLowerCase() === "rfid" ||
    resNumParam?.toUpperCase().startsWith("RFID");

  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false); // 👈 استیت لودینگ ساخت درگاه جدید

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!paymentIdParam) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const endpoint = isRfidPayment
          ? `/peyment/getRfidPaymentReceipt/${paymentIdParam}`
          : `/peyment/getPaymentReceipt/${paymentIdParam}`;

        const response = await api.get(endpoint);

        if (response.data?.success && response.data?.data) {
          setReceipt(response.data.data);
        } else if (response.data?.data) {
          setReceipt(response.data.data);
        }
      } catch (err: any) {
        console.error("خطا در دریافت رسید پرداخت:", err);
        setError("خطا در بارگذاری اطلاعات رسید از سرور.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [paymentIdParam, isRfidPayment]);

  const isSuccess = receipt?.status
    ? receipt.status === "PAID" ||
      receipt.status === "SUCCESS" ||
      receipt.status === "CONFIRMED"
    : urlStatus === "success";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatShamsiDate = (dateStr?: string | null) => {
    if (!dateStr) return "ثبت نشده";
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDoctorName = (doctor?: DoctorInfo | string | null) => {
    if (!doctor) return "نامشخص";
    if (typeof doctor === "object") {
      return `دکتر ${doctor.firstName || ""} ${doctor.lastName || ""}`.trim();
    }
    return doctor;
  };

  const getClinicName = (clinic?: ClinicInfo | string | null) => {
    if (!clinic) return "مطب شخصی";
    if (typeof clinic === "object") {
      return clinic.centerName || clinic.name || "کلینیک";
    }
    return clinic;
  };

  // 👈 تابع ساخت درگاه پرداخت جدید و انتقال به بانک
  const handleRetryPayment = async () => {
    setIsRetrying(true);
    const toastId = toast.loading("در حال ایجاد درگاه پرداخت جدید...");

    try {
      if (isRfidPayment) {
        // ۱. ایجاد تراکنش جدید کارت هوشمند RFID
        const response = await api.post("/peyment/rfid/pay", {});
        if (response.data?.success && response.data?.data?.paymentUrl) {
          toast.success("در حال انتقال به درگاه بانک...", { id: toastId });
          window.location.href = response.data.data.paymentUrl;
          return;
        }
        throw new Error(
          response.data?.message || "خطا در اتصال به درگاه بانکی.",
        );
      } else {
        // ۲. ایجاد تراکنش جدید برای رزرو نوبت پزشک
        const doctorId =
          typeof receipt?.appointment?.doctor === "object"
            ? receipt.appointment.doctor?._id
            : receipt?.appointment?.doctor;

        if (
          doctorId &&
          receipt?.appointment?.date &&
          receipt?.appointment?.startTime
        ) {
          const payload = {
            doctorId,
            date: receipt.appointment.date,
            startTime: receipt.appointment.startTime,
            endTime: receipt.appointment.endTime,
            notes: "",
            amount: receipt.amount || 0,
          };

          const response = await api.post("/book/bookslots", payload);
          if (response.data?.success && response.data?.data?.paymentUrl) {
            toast.success("در حال انتقال به درگاه بانک...", { id: toastId });
            window.location.href = response.data.data.paymentUrl;
            return;
          }
        }

        // اگر اطلاعات نوبت منقضی شده یا نوبت پر شده باشد
        toast.error(
          "این نوبت دیگر قابل تمدید نیست. لطفاً نوبت جدیدی انتخاب فرمایید.",
          { id: toastId },
        );
        navigate("/doctors");
      }
    } catch (err: any) {
      console.error("خطا در ایجاد درگاه پرداخت جدید:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "مشکلی در ایجاد درگاه پرداخت رخ داد.";
      toast.error(msg, { id: toastId });

      // در صورت پر شدن نوبت، هدایت به صفحه پزشکان
      if (!isRfidPayment) {
        navigate("/doctors");
      }
    } finally {
      setIsRetrying(false);
    }
  };

  if (loading) {
    return (
      <div
        className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full flex flex-col items-center justify-center p-6 text-gadget-light font-sans"
        dir="rtl"
      >
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="text-xs sm:text-sm font-bold text-gray-500">
          در حال استعلام وضعیت پرداخت و صدور رسید...
        </p>
      </div>
    );
  }

  const finalPaymentId = receipt?.paymentId || paymentIdParam || "---";
  const finalAmount = receipt?.amount;

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-3 sm:p-6 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="min-h-full flex flex-col items-center justify-start sm:justify-center py-2 sm:py-6 pb-10">
        {/* کارت اصلی رسید */}
        <div className="bg-white max-w-lg w-full rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
          {/* ================= هدر کارتی ================= */}
          <div
            className={`py-6 px-4 sm:py-7 sm:px-6 text-center text-white relative overflow-hidden ${
              isSuccess
                ? "bg-linear-to-br from-emerald-600 to-teal-700"
                : "bg-linear-to-br from-rose-600 to-red-700"
            }`}
          >
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm mb-2.5 border border-white/25">
                {isSuccess ? (
                  <CheckCircle2
                    size={34}
                    className="text-white sm:w-9 sm:h-9 drop-shadow-xs"
                  />
                ) : (
                  <XCircle
                    size={34}
                    className="text-white sm:w-9 sm:h-9 drop-shadow-xs"
                  />
                )}
              </div>

              <h1 className="text-lg sm:text-xl font-black mb-1">
                {isSuccess ? "پرداخت با موفقیت انجام شد" : "پرداخت ناموفق بود"}
              </h1>
              <p className="text-xs opacity-90 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
                {isSuccess
                  ? isRfidPayment
                    ? "هزینه صدور کارت هوشمند RFID پرداخت گردید و سفارش شما ثبت شد."
                    : "نوبت ویزیت شما تایید و در تقویم سیستم ثبت گردید."
                  : isRfidPayment
                    ? "تراکنش پرداخت هزینه کارت RFID انجام نشد یا توسط کاربر لغو گردید."
                    : "تراکنش انجام نشد و نوبت درخواستی رزرو نگردید."}
              </p>
            </div>
          </div>

          {/* ================= بدنه رسید ================= */}
          <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
            {error && (
              <div className="bg-amber-50 text-amber-700 text-xs font-bold p-3 rounded-xl border border-amber-200 text-center">
                {error}
              </div>
            )}

            {/* حالت ۱: کارت مشخصات خدمت برای RFID */}
            {isRfidPayment && (
              <div
                className={`rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border space-y-2.5 ${
                  isSuccess
                    ? "bg-emerald-50/50 border-emerald-100"
                    : "bg-gray-50/90 border-gray-200/80"
                }`}
              >
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <CreditCard
                      size={15}
                      className={
                        isSuccess ? "text-emerald-600" : "text-gray-500"
                      }
                    />
                    مشخصات خدمت دریافتی
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    کارت سلامت هوشمند
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                    <span className="text-gray-500 shrink-0">عنوان سفارش:</span>
                    <span className="font-bold text-gray-800 wrap-break-word leading-relaxed">
                      صدور و فعال‌سازی کارت هوشمند بیمار (RFID)
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500 shrink-0">وضعیت سفارش:</span>
                    <span
                      className={`font-bold ${isSuccess ? "text-emerald-700" : "text-rose-600"}`}
                    >
                      {isSuccess
                        ? "تایید شده (در صف صدور)"
                        : "در انتظار پرداخت مجدد"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* حالت ۲: کارت مشخصات نوبت پزشک */}
            {!isRfidPayment && receipt?.appointment && (
              <div
                className={`rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border space-y-3 ${
                  isSuccess
                    ? "bg-blue-50/50 border-blue-100"
                    : "bg-gray-50/90 border-gray-200/80"
                }`}
              >
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <CalendarDays
                      size={15}
                      className={isSuccess ? "text-blue-600" : "text-gray-500"}
                    />
                    مشخصات نوبت پزشک
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-gray-600 flex items-center gap-1 truncate max-w-35 sm:max-w-none">
                    <Building2 size={13} className="shrink-0" />
                    <span className="truncate">
                      {getClinicName(receipt.appointment.clinic)}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gadget-dark shrink-0" />
                    <span className="text-gray-500">پزشک معالج:</span>
                    <span className="font-bold text-gray-800">
                      {getDoctorName(receipt.appointment.doctor)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-orange-500 shrink-0" />
                    <span className="text-gray-500">ساعت ویزیت:</span>
                    <span
                      className="font-bold text-gray-800 font-mono"
                      dir="ltr"
                    >
                      {receipt.appointment.startTime} -{" "}
                      {receipt.appointment.endTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-2">
                    <CalendarDays
                      size={14}
                      className="text-teal-600 shrink-0"
                    />
                    <span className="text-gray-500">تاریخ نوبت:</span>
                    <span className="font-bold text-gray-800">
                      {new Date(receipt.appointment.date).toLocaleDateString(
                        "fa-IR",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* اطلاعات رسید بانکی */}
            <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <Receipt size={15} className="text-gray-400" />
                  اطلاعات رسید بانکی
                </span>
                {isSuccess && (
                  <button
                    onClick={() => window.print()}
                    className="text-xs font-bold text-gadget-dark hover:opacity-80 flex items-center gap-1 transition-opacity cursor-pointer"
                  >
                    <Printer size={13} /> چاپ رسید
                  </button>
                )}
              </div>

              {/* شناسه پرداخت */}
              <div className="flex items-center justify-between gap-2 text-xs py-0.5">
                <span className="text-gray-500 shrink-0">شناسه پرداخت:</span>
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-2 py-0.5 rounded-lg shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleCopy(finalPaymentId)}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                    title="کپی شناسه"
                  >
                    {copied ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                  <span
                    dir="ltr"
                    className="font-mono text-[11px] font-bold text-gray-800 truncate max-w-40 sm:max-w-55"
                  >
                    {finalPaymentId}
                  </span>
                </div>
              </div>

              {/* شماره ارجاع خرید (ResNum) */}
              {(receipt?.resNum || resNumParam) && (
                <div className="flex items-center justify-between gap-2 text-xs py-0.5">
                  <span className="text-gray-500 shrink-0">
                    شماره ارجاع (ResNum):
                  </span>
                  <span
                    className="font-mono font-bold text-[11px] text-gray-700 truncate max-w-45 sm:max-w-none"
                    dir="ltr"
                  >
                    {receipt?.resNum || resNumParam}
                  </span>
                </div>
              )}

              {/* کد رهگیری شاپرک (RefNum) */}
              {receipt?.refNum && (
                <div className="flex items-center justify-between gap-2 text-xs py-0.5">
                  <span className="text-gray-500 shrink-0 flex items-center gap-1">
                    <Hash size={12} className="text-gray-400" /> کد پیگیری
                    (RefNum):
                  </span>
                  <span
                    className="font-mono font-bold text-[11px] text-gray-800 truncate max-w-45 sm:max-w-none"
                    dir="ltr"
                  >
                    {receipt.refNum}
                  </span>
                </div>
              )}

              {/* مبلغ */}
              {finalAmount !== undefined && (
                <div className="flex items-center justify-between text-xs sm:text-sm pt-1.5 border-t border-gray-200/60">
                  <span className="text-gray-500 font-medium">
                    مبلغ تراکنش:
                  </span>
                  <span className="font-black text-gray-900 text-sm sm:text-base">
                    {new Intl.NumberFormat("fa-IR").format(finalAmount)}{" "}
                    <span className="text-[11px] font-normal text-gray-500">
                      ریال
                    </span>
                  </span>
                </div>
              )}

              {/* زمان تراکنش */}
              {receipt?.paidAt && (
                <div className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-gray-500">زمان تراکنش:</span>
                  <span className="font-medium text-gray-700 text-[11px] sm:text-xs">
                    {formatShamsiDate(receipt.paidAt)}
                  </span>
                </div>
              )}

              {/* وضعیت پرداخت */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60">
                <span className="text-gray-500">وضعیت پرداخت:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] ${
                    isSuccess
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {isSuccess ? "تایید و پرداخت شده" : "ناموفق / لغو شده"}
                </span>
              </div>
            </div>

            {/* باکس پیام راهنما */}
            {!isSuccess ? (
              <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-xl flex items-start gap-2 text-amber-900 text-[11px] sm:text-xs leading-relaxed">
                <HelpCircle
                  size={15}
                  className="shrink-0 text-amber-600 mt-0.5"
                />
                <span>
                  در صورت کسر وجه از حساب، مبلغ کسر شده حداکثر تا ۷۲ ساعت کاری
                  توسط شبکه بانکی به حسابتان بازگردانده خواهد شد.
                </span>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-2 text-emerald-800 text-[11px] sm:text-xs leading-relaxed">
                <CheckCircle2
                  size={15}
                  className="shrink-0 text-emerald-600 mt-0.5"
                />
                <span>
                  {isRfidPayment
                    ? "سفارش شما با موفقیت ثبت شد. کارت هوشمند سلامت شما به‌زودی فعال خواهد شد."
                    : "نوبت با موفقیت ثبت شد. می‌توانید جزئیات آن را در لیست نوبت‌های خود مشاهده کنید."}
                </span>
              </div>
            )}

            {/* ================= دکمه‌های ناوبری ================= */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              {isSuccess ? (
                isRfidPayment ? (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 bg-gadget-dark hover:bg-gadget-dark/90 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard size={17} />
                    ورود به داشبورد کاربری
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/my-appointments")}
                    className="flex-1 bg-gadget-dark hover:bg-gadget-dark/90 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CalendarDays size={17} />
                    مشاهده نوبت‌های من
                  </button>
                )
              ) : (
                /* 👈 دکمه هوشمند ایجاد درگاه جدید */
                <button
                  onClick={handleRetryPayment}
                  disabled={isRetrying}
                  className="flex-1 bg-gadget-dark hover:bg-gadget-dark/90 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>در حال اتصال به درگاه جدید...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw size={17} />
                      <span>پرداخت مجدد</span>
                    </>
                  )}
                </button>
              )}

              <Link
                to="/"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center"
              >
                <Home size={17} />
                صفحه اصلی
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
