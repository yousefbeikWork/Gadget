import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  HeartPulse, 
  MapPin, 
  Phone, 
  Mail, 
} from "lucide-react";
import EnamadBadge from "./EnamadBadge";

export default function Footer() {
  const {  i18n } = useTranslation();
//   const isLtr = i18n.dir() === "ltr";

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-12 w-full" dir={i18n.dir()}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* بخش اصلی فوتر */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* ستون اول: درباره ما و شبکه‌های اجتماعی (عرض بیشتر) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 text-gadget-dark">
              <HeartPulse size={32} strokeWidth={2.5} />
              <span className="text-2xl font-black tracking-tight">پلتفرم نوریا</span>
            </div>
            <p className="text-sm text-gray-500 leading-loose text-justify">
              سامانه جامع نوبت‌دهی آنلاین و مدیریت مراکز درمانی. هدف ما دسترسی سریع، امن و آسان شما به بهترین پزشکان، کلینیک‌ها و بیمارستان‌های کشور است. با ما، سلامت شما در اولویت است.
            </p>
            {/* <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gadget-dark hover:text-white transition-colors">
                <LucideSwitchCamera size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gadget-dark hover:text-white transition-colors">
                <Send size={18} className={isLtr ? "" : "-ml-1"} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gadget-dark hover:text-white transition-colors">
                <LucideChartColumnStacked size={18} />
              </a>
            </div> */}
          </div>

          {/* ستون دوم: دسترسی سریع */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-gray-800">دسترسی سریع</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-sm text-gray-500 hover:text-gadget-dark transition-colors font-medium">صفحه اصلی</Link></li>
              <li><Link to="/about" className="text-sm text-gray-500 hover:text-gadget-dark transition-colors font-medium">درباره ما</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-500 hover:text-gadget-dark transition-colors font-medium">تماس با ما</Link></li>
              <li><Link to="/faq" className="text-sm text-gray-500 hover:text-gadget-dark transition-colors font-medium">سوالات متداول</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-gadget-dark transition-colors font-medium">قوانین و مقررات</Link></li>
            </ul>
          </div>

          {/* ستون سوم: خدمات */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-base font-bold text-gray-800">خدمات سامانه</h3>
            <ul className="space-y-4">
              <li><Link to="/doctors" className="text-sm text-gray-500 hover:text-gadget-dark transition-colors font-medium">نوبت‌دهی پزشکان</Link></li>
              <li><Link to="/hospitals" className="text-sm text-gray-500 hover:text-gadget-dark transition-colors font-medium">مراکز درمانی و بیمارستان‌ها</Link></li>
              <li><Link to="/clinics" className="text-sm text-gray-500 hover:text-gadget-dark transition-colors font-medium">کلینیک‌های تخصصی</Link></li>
            </ul>
          </div>

          {/* ستون چهارم: ارتباط با ما و نمادها */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-base font-bold text-gray-800">ارتباط با ما</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <MapPin size={18} className="text-gadget-light shrink-0 mt-0.5" />
                <span className="leading-relaxed">مشهد، خیابان صاحب‌الزمان، مجتمع سبحان</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <Phone size={18} className="text-gadget-light shrink-0" />
                <span dir="ltr" className="font-medium">0904 582 2130</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <Mail size={18} className="text-gadget-light shrink-0" />
                <span dir="ltr" className="font-medium">info@nouryahealth.com</span>
              </li>
            </ul>

            {/* بخش نماد اعتماد */}
            <div className="pt-4 flex gap-3">
              <EnamadBadge />
              {/* جایگاهی برای نماد ساماندهی در آینده */}
              <div className="w-25 h-25 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 text-center p-2 shadow-sm">
                نماد ساماندهی (به زودی)
              </div>
            </div>
          </div>

        </div>

        {/* کپی رایت */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 font-medium text-center md:text-left">
            تمامی حقوق مادی و معنوی این وب‌سایت متعلق به <span className="font-bold text-gray-600">نوریا هلث</span> می‌باشد. © ۲۰۲۶
          </p>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
            <span className="hover:text-gadget-dark transition-colors cursor-pointer">حریم خصوصی</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="hover:text-gadget-dark transition-colors cursor-pointer">شرایط استفاده</span>
          </div>
        </div>

      </div>
    </footer>
  );
}