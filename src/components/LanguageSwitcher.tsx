import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  // این تابع زبان رو عوض می‌کنه
  const toggleLanguage = () => {
    const newLang = i18n.language === 'fa' ? 'en' : 'fa';
    i18n.changeLanguage(newLang);
  };

  // این بخش برای تغییر جهت کل سایت (راست‌چین/چپ‌چین) استفاده میشه
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'fa' ? 'rtl' : 'ltr';
    // در صورت نیاز فونت رو هم میشه اینجا عوض کرد
  }, [i18n.language]);

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
    >
      <Globe size={18} />
      {i18n.language === 'fa' ? 'English' : 'فارسی'}
    </button>
  );
}