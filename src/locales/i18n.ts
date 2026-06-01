import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fa: {
    translation: {
      // کلمات سایدبار
      "home": "خانه",
      "doctors": "پزشک",
      "hospitals": "بیمارستان",
      "clinics": "کلینیک",
      "airplanes": "هواپیما",
      "travel": "سفر",
      "guides": "راهنما",
      "search": "جست و جو",
      
      // کلمات صفحه اصلی (Home)
      "welcome": "سلام حسین، به گجت خوش اومدی! 👋",
      "subtitle": "امروز دوشنبه است، بیا یک نگاه سریع به وضعیت سیستم بندازیم.",
      "active_clinics": "کلینیک‌های فعال",
      "registered_doctors": "پزشکان ثبت‌شده",
      "todays_flights": "پروازهای امروز",
      "system_visits": "بازدیدهای سیستم",
      "ready_to_start": "آماده‌ای برای شروع کار؟",
      "system_ready_desc": "سیستم آماده بهره‌برداری است. می‌توانی از بخش کلینیک‌ها شروع کنی، اطلاعات جدیدی ثبت کنی و یا داده‌های قبلی را مدیریت کنی.",
      "go_to_clinics": "رفتن به مدیریت کلینیک‌ها"
    }
  },
  en: {
    translation: {
      // کلمات سایدبار
      "home": "Home",
      "doctors": "Doctors",
      "hospitals": "Hospitals",
      "clinics": "Clinics",
      "airplanes": "Airplanes",
      "travel": "Travel",
      "guides": "Guides",
      "search": "Search",
      
      // کلمات صفحه اصلی (Home)
      "welcome": "Hello Hossein, Welcome to Gadget! 👋",
      "subtitle": "Today is Monday, let's take a quick look at the system status.",
      "active_clinics": "Active Clinics",
      "registered_doctors": "Registered Doctors",
      "todays_flights": "Today's Flights",
      "system_visits": "System Visits",
      "ready_to_start": "Ready to get started?",
      "system_ready_desc": "The system is ready to use. You can start from the clinics section, register new information, or manage previous data.",
      "go_to_clinics": "Go to Clinics Management"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fa", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;