import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  PhoneCall,
  LifeBuoy,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      "پیام شما با موفقیت دریافت شد. تلاش می‌کنیم در سریع‌ترین زمان ممکن پاسخگوی شما باشیم."
    );
    setFormData({ name: "", mobile: "", subject: "", message: "" });
  };

  return (
    <div
      className="flex-1 bg-gray-50 md:rounded-2xl shadow-lg overflow-y-auto overflow-x-hidden font-sans"
      dir="rtl"
    >
      {/* ================= هدر ================= */}
      <div className="bg-linear-to-r from-gadget-dark to-gadget-light p-10 md:p-14 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold mb-4 border border-white/10">
            <PhoneCall size={16} /> ارتباط با Nourya Health
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight">
            همواره پاسخگوی شما هستیم
          </h1>
          <p className="text-gray-100 text-sm leading-relaxed max-w-2xl mx-auto">
            برای دریافت پشتیبانی، پیگیری درخواست‌ها، گزارش مشکلات فنی، اعلام مفقودی
            کارت سلامت هوشمند و دریافت اطلاعات درباره خدمات ما، از راه‌های
            ارتباطی زیر در تماس باشید.
          </p>
        </div>
      </div>

      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ================= ستون اطلاعات تماس و راهنماها ================= */}
          <div className="space-y-4">
            
            {/* کارت‌های اطلاعات تماس */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                <Phone size={22} />
              </div>
              <div>
                <h4 className="text-xs text-gray-400 font-medium">تلفن پشتیبانی</h4>
                <p className="text-sm font-bold text-gray-800 mt-1" dir="ltr">
                  0904 582 2130
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <h4 className="text-xs text-gray-400 font-medium">پست الکترونیکی</h4>
                <p className="text-sm font-bold text-gray-800 mt-1" dir="ltr">
                  nouryahealth@gmail.com
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <h4 className="text-xs text-gray-400 font-medium">آدرس دفتر مرکزی</h4>
                <p className="text-xs font-bold text-gray-800 mt-1 leading-relaxed">
                  مشهد، خیابان صاحب‌الزمان، مجتمع سبحان
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <h4 className="text-xs text-gray-400 font-medium">ساعات پاسخ‌گویی</h4>
                <p className="text-xs font-bold text-gray-800 mt-1">
                  شنبه تا پنجشنبه: ۸:۰۰ الی ۱۷:۰۰
                </p>
              </div>
            </div>

            {/* کارت راهنمای پشتیبانی کاربران */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-3 mt-6">
              <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                <LifeBuoy size={18} className="text-blue-600" />
                راهنمای پشتیبانی کاربران
              </h4>
              <p className="text-xs text-blue-900/80 leading-relaxed text-justify">
                برای پیگیری سریع‌تر مشکلات سامانه یا کارت سلامت، لطفاً <strong>نام و نام خانوادگی</strong>، <strong>شماره تماس ثبت‌شده</strong> و <strong>شماره درخواست/رزرو</strong> را در پیام خود ذکر کنید.
              </p>
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-[11px] font-medium leading-relaxed flex items-start gap-2 border border-red-100 mt-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>
                  لطفاً اطلاعات حساس پزشکی، رمز عبور، کدهای ورود یا اطلاعات بانکی خود را از این طریق ارسال نکنید.
                </span>
              </div>
            </div>

            {/* کارت گزارش مشکلات امنیتی */}
            <div className="bg-gray-800 text-white border border-gray-700 rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-400" />
                گزارش مشکلات امنیتی
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed text-justify">
                اگر متوجه مشکل امنیتی یا دسترسی غیرمجاز در سامانه شدید، در سریع‌ترین زمان ممکن به ما اطلاع دهید. لطفاً از ارسال اطلاعات شخصی یا پزشکی افراد دیگر در گزارش‌ها خودداری نمایید.
              </p>
            </div>
          </div>

          {/* ================= فرم ارسال پیام ================= */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6 h-fit">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">
              ارسال پیام مستقیم به پشتیبانی
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">
                    نام و نام خانوادگی
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-hidden focus:border-gadget-light focus:bg-white transition-colors"
                    placeholder="مثال: علی محمدی"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">
                    شماره موبایل ثبت‌شده
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-hidden focus:border-gadget-light focus:bg-white transition-colors text-left font-mono"
                    placeholder="09123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">
                  موضوع پیام (یا شماره پیگیری)
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-hidden focus:border-gadget-light focus:bg-white transition-colors"
                  placeholder="مثال: پیگیری مفقودی کارت هوشمند"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">
                  شرح مشکل یا درخواست
                </label>
                <textarea
                  rows={6}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-hidden focus:border-gadget-light focus:bg-white transition-colors resize-none leading-relaxed"
                  placeholder="توضیحات دقیق خود را اینجا بنویسید..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-gadget-dark hover:bg-gadget-dark/90 text-white font-bold py-3.5 px-8 rounded-xl text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Send size={18} /> ارسال پیام
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}