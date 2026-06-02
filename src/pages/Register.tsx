import { useState } from 'react';
import { User, Stethoscope, Building2, UserPlus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Role = 'patient' | 'doctor' | 'center';

export default function Register() {
  const [role, setRole] = useState<Role>('patient');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ثبت نام برای نقش:', role);
    // منطق ارسال به بک‌اند
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 py-10" dir="rtl">
      
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* هدر فرم */}
        <div className="bg-gadget-dark p-6 text-center shrink-0">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">تشکیل پرونده و ثبت‌نام</h1>
          <p className="text-gadget-dark/40 text-gray-200 text-sm">لطفاً نوع کاربری خود را انتخاب کرده و اطلاعات را تکمیل نمایید</p>
        </div>

        {/* بخش محتوای اسکرول‌خور */}
        <div className="p-6 overflow-y-auto">
          {/* انتخابگر نقش */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-all ${
                role === 'patient' ? 'bg-white text-gadget-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={18} />
              <span>بیمار (شخص حقیقی)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-all ${
                role === 'doctor' ? 'bg-white text-gadget-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Stethoscope size={18} />
              <span>پزشک (شخص حقیقی)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('center')}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-all ${
                role === 'center' ? 'bg-white text-gadget-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 size={18} />
              <span>مرکز درمانی (شخص حقوقی)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ---------------- فیلدهای مشترک و اختصاصی ---------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* فیلدهای اشخاص (بیمار و پزشک) */}
              {(role === 'patient' || role === 'doctor') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی</label>
                    <input type="text" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">کد ملی / کد اتباع</label>
                    <input type="text" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نام پدر</label>
                    <input type="text" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
                    <input type="tel" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left" dir="ltr" placeholder="0912..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">جنسیت</label>
                    <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark bg-white">
                      <option value="مرد">مرد</option>
                      <option value="زن">زن</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت تاهل</label>
                    <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark bg-white">
                      <option value="مجرد">مجرد</option>
                      <option value="متاهل">متاهل</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">آدرس محل سکونت</label>
                    <textarea rows={2} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark"></textarea>
                  </div>
                </>
              )}

              {/* فیلدهای اختصاصی پزشک */}
              {role === 'doctor' && (
                <>
                  <div className="md:col-span-2 border-t border-gray-100 pt-5 mt-2">
                    <h3 className="text-sm font-bold text-gadget-dark mb-4">اطلاعات تخصصی پزشکی</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">کد نظام پزشکی</label>
                    <input type="text" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تلفن‌های دسترسی</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left" dir="ltr" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">آدرس محل کار سازمانی</label>
                    <textarea rows={1} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark"></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">آدرس محل کار شخصی (مطب)</label>
                    <textarea rows={1} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark"></textarea>
                  </div>
                </>
              )}

              {/* فیلدهای اختصاصی بیمار (قیم) */}
              {role === 'patient' && (
                <>
                  <div className="md:col-span-2 border-t border-gray-100 pt-5 mt-2">
                    <h3 className="text-sm font-bold text-gadget-dark mb-1">ثبت مشخصات قیم</h3>
                    <p className="text-xs text-gray-500 mb-4">در صورت نیاز به ثبت اطلاعات قیم، فیلدهای زیر را تکمیل کنید.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی قیم</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">کد ملی قیم</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل قیم</label>
                    <input type="tel" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">محل سکونت قیم</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark" />
                  </div>
                </>
              )}

              {/* فیلدهای اختصاصی مراکز درمانی */}
              {role === 'center' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">نام مرکز درمانی</label>
                    <input type="text" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark" placeholder="مثال: بیمارستان عرفان" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع مرکز</label>
                    <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark bg-white">
                      <option value="بیمارستان">بیمارستان</option>
                      <option value="کلینیک">کلینیک</option>
                      <option value="سازمان طرف قرارداد">سازمان طرف قرارداد</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">کد پروانه مرکز</label>
                    <input type="text" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تلفن‌های مرکز</label>
                    <input type="text" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left" dir="ltr" placeholder="021-..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">آدرس دقیق مرکز</label>
                    <textarea rows={3} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark"></textarea>
                  </div>
                </>
              )}

            </div>

            {/* بخش دکمه ثبت */}
            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="w-full md:w-auto md:min-w-[200px] float-left bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3 px-6 rounded-lg text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                تکمیل ثبت‌نام
                <ArrowRight size={18} />
              </button>
              <div className="clear-both"></div>
            </div>
            
          </form>

          {/* لینک بازگشت به ورود */}
          <div className="mt-8 text-center text-sm text-gray-600">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link to="/login" className="text-gadget-dark font-bold hover:underline">
              وارد شوید
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}