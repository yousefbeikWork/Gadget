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
  const typeParam = searchParams.get("type"); // 👈 خواندن type از URL
  const resNumParam = searchParams.get("resNum") || searchParams.get("ResNum");

  // بررسی نوع پرداخت بر اساس پارامتر type یا پیشوند resNum
  const isRfidPayment =
    typeParam?.toLowerCase() === "rfid" ||
    resNumParam?.toUpperCase().startsWith("RFID");

  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!paymentIdParam) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // 👈 تعیین اندپوینت بر اساس نوع پرداخت
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

  if (loading) {
    return (
      <div
        className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 text-gadget-light font-sans"
        dir="rtl"
      >
        <Loader2 className="animate-spin mb-4" size={44} />
        <p className="text-sm font-bold text-gray-600">
          در حال استعلام وضعیت پرداخت و دریافت رسید...
        </p>
      </div>
    );
  }

  const finalPaymentId = receipt?.paymentId || paymentIdParam || "---";
  const finalAmount = receipt?.amount;

  return (
    <div
      className="bg-gray-50 min-h-full w-full flex items-center justify-center p-4 md:p-8 font-sans rounded-2xl"
      dir="rtl"
    >
      <div className="bg-white max-w-xl w-full rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ================= هدر کارتی ================= */}
        <div
          className={`p-8 text-center text-white relative overflow-hidden ${
            isSuccess
              ? "bg-linear-to-br from-emerald-500 to-teal-600"
              : "bg-linear-to-br from-rose-500 to-red-600"
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-lg mb-4 border border-white/30">
              {isSuccess ? (
                <CheckCircle2 size={44} className="text-white drop-shadow-sm" />
              ) : (
                <XCircle size={44} className="text-white drop-shadow-sm" />
              )}
            </div>

            <h1 className="text-2xl font-black mb-1">
              {isSuccess ? "پرداخت با موفقیت انجام شد" : "پرداخت ناموفق بود"}
            </h1>
            <p className="text-sm opacity-90 leading-relaxed max-w-sm">
              {isSuccess
                ? isRfidPayment
                  ? "هزینه صدور کارت هوشمند RFID پرداخت گردید و سفارش شما ثبت شد."
                  : "نوبت ویزیت شما تایید و در تقویم سیستم ثبت گردید."
                : isRfidPayment
                  ? "تراکنش پرداخت هزینه کارت هوشمند RFID انجام نشد یا لغو گردید."
                  : "تراکنش انجام نشد و نوبت درخواستی رزرو نگردید."}
            </p>
          </div>
        </div>

        {/* ================= بدنه رسید ================= */}
        <div className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="bg-amber-50 text-amber-700 text-xs font-bold p-3 rounded-xl border border-amber-200 text-center">
              {error}
            </div>
          )}

          {/* حالت ۱: نمایش کارت مشخصات خدمت برای RFID */}
          {isRfidPayment && (
            <div
              className={`rounded-2xl p-5 border space-y-3 ${
                isSuccess
                  ? "bg-emerald-50/60 border-emerald-100"
                  : "bg-gray-50/80 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <CreditCard
                    size={16}
                    className={isSuccess ? "text-emerald-600" : "text-gray-500"}
                  />
                  مشخصات خدمت دریافتی
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  کارت سلامت هوشمند
                </span>
              </div>

              <div className="text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">عنوان سفارش:</span>
                  <span className="font-bold text-gray-800">
                    صدور و فعال‌سازی کارت هوشمند بیمار (RFID)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">وضعیت سفارش:</span>
                  <span className="font-bold text-gray-800">
                    {isSuccess ? "تایید شده - در صف صدور" : "در انتظار پرداخت مجدد"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* حالت ۲: نمایش کارت مشخصات نوبت پزشک */}
          {!isRfidPayment && receipt?.appointment && (
            <div
              className={`rounded-2xl p-5 border space-y-3.5 ${
                isSuccess
                  ? "bg-blue-50/60 border-blue-100"
                  : "bg-gray-50/80 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <CalendarDays
                    size={16}
                    className={isSuccess ? "text-blue-600" : "text-gray-500"}
                  />
                  مشخصات نوبت پزشک
                </span>
                <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                  <Building2 size={13} />
                  {getClinicName(receipt.appointment.clinic)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <User size={15} className="text-gadget-dark shrink-0" />
                  <span className="text-gray-500">پزشک معالج:</span>
                  <span className="font-bold text-gray-800">
                    {getDoctorName(receipt.appointment.doctor)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-orange-500 shrink-0" />
                  <span className="text-gray-500">ساعت ویزیت:</span>
                  <span className="font-bold text-gray-800" dir="ltr">
                    {receipt.appointment.startTime} - {receipt.appointment.endTime}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                  <CalendarDays size={15} className="text-teal-600 shrink-0" />
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

          {/* مشخصات تراکنش بانکی */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                <Receipt size={16} className="text-gray-400" />
                اطلاعات رسید بانکی
              </span>
              {isSuccess && (
                <button
                  onClick={() => window.print()}
                  className="text-xs font-bold text-gadget-dark hover:opacity-80 flex items-center gap-1 transition-opacity cursor-pointer"
                >
                  <Printer size={14} /> چاپ رسید
                </button>
              )}
            </div>

            {/* شناسه پرداخت */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 text-xs">شناسه پرداخت:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-gray-800 text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
                <button
                  onClick={() => handleCopy(finalPaymentId)}
                  className="text-gray-400 hover:text-gadget-dark transition-colors cursor-pointer"
                  title="کپی شناسه"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
                <span dir="ltr" className="select-all">
                  {finalPaymentId}
                </span>
              </div>
            </div>

            {/* کد رهگیری شاپرک (RefNum) */}
            {receipt?.refNum && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <Hash size={12} className="text-gray-400" /> شماره پیگیری بانک (RefNum):
                </span>
                <span
                  className="font-mono font-bold text-gray-800 text-xs"
                  dir="ltr"
                >
                  {receipt.refNum}
                </span>
              </div>
            )}

            {/* شماره ارجاع خرید (ResNum) */}
            {(receipt?.resNum || resNumParam) && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 text-xs">
                  شماره ارجاع خرید (ResNum):
                </span>
                <span
                  className="font-mono font-medium text-gray-700 text-xs"
                  dir="ltr"
                >
                  {receipt?.resNum || resNumParam}
                </span>
              </div>
            )}

            {/* مبلغ */}
            {finalAmount !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 text-xs">مبلغ تراکنش:</span>
                <span className="font-black text-gray-800 text-sm">
                  {new Intl.NumberFormat("fa-IR").format(finalAmount)} ریال
                </span>
              </div>
            )}

            {/* تاریخ و زمان پرداخت */}
            {receipt?.paidAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 text-xs">زمان تراکنش:</span>
                <span className="font-medium text-gray-700 text-xs">
                  {formatShamsiDate(receipt.paidAt)}
                </span>
              </div>
            )}

            {/* وضعیت */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 text-xs">وضعیت پرداخت:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  isSuccess
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {isSuccess ? "تایید و پرداخت شده" : "ناموفق / لغو شده"}
              </span>
            </div>
          </div>

          {/* پیام راهنما */}
          {!isSuccess ? (
            <div className="bg-amber-50 border border-amber-200/70 p-3.5 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs leading-relaxed">
              <HelpCircle
                size={18}
                className="shrink-0 text-amber-600 mt-0.5"
              />
              <span>
                در صورت کسر وجه از حساب، مبلغ کسر شده حداکثر تا ۷۲ ساعت کاری
                توسط شبکه بانکی به حسابتان بازگردانده خواهد شد.
              </span>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs leading-relaxed">
              <CheckCircle2
                size={18}
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
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {isSuccess ? (
              isRfidPayment ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 bg-gadget-dark hover:bg-gadget-dark/90 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard size={18} />
                  ورود به داشبورد کاربری
                </button>
              ) : (
                <button
                  onClick={() => navigate("/my-appointments")}
                  className="flex-1 bg-gadget-dark hover:bg-gadget-dark/90 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CalendarDays size={18} />
                  مشاهده نوبت‌های من
                </button>
              )
            ) : (
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-gadget-dark hover:bg-gadget-dark/90 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={18} />
                تلاش مجدد
              </button>
            )}

            <Link
              to="/"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 text-center"
            >
              <Home size={18} />
              صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}