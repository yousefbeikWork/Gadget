import { useState } from 'react';
import { User, Stethoscope, Building2, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
// در آینده می‌توانی Link را ایمپورت کنی تا دکمه ثبت‌نام را به مسیر /register متصل کنی

type Role = 'patient' | 'doctor' | 'center';

export default function Login() {
  const [role, setRole] = useState<Role>('patient');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // تغییر لیبل ورودی بر اساس نقش انتخاب شده (طبق فلوچارت‌ها)
  const getUsernameLabel = () => {
    switch (role) {
      case 'doctor': return 'شماره نظام پزشکی';
      case 'center': return 'نام کاربری مرکز';
      case 'patient': return 'کد ملی / کد اتباع';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { role, username, password });
    // منطق اتصال به بک‌اند بعداً اینجا قرار می‌گیرد
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      
      {/* کارت اصلی فرم ورود */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        
        {/* هدر فرم */}
        <div className="bg-gadget-dark p-6 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">ورود به سامانه</h1>
          <p className=" text-gray-200 text-sm">لطفاً نقش و اطلاعات کاربری خود را وارد کنید</p>
        </div>

        <div className="p-6">
          {/* انتخابگر نقش */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                role === 'patient' ? 'bg-white text-gadget-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={16} /> بیمار
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                role === 'doctor' ? 'bg-white text-gadget-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Stethoscope size={16} /> پزشک
            </button>
            <button
              type="button"
              onClick={() => setRole('center')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                role === 'center' ? 'bg-white text-gadget-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 size={16} /> مرکز
            </button>
          </div>

          {/* فرم ورود */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getUsernameLabel()}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-hidden focus:border-gadget-dark focus:ring-1 focus:ring-gadget-dark transition-colors"
                placeholder={role === 'patient' ? 'مثال: 0012345678' : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رمز عبور
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-hidden focus:border-gadget-dark focus:ring-1 focus:ring-gadget-dark transition-colors text-left"
                dir="ltr"
              />
            </div>

            <div className="flex items-center justify-between mt-2 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-gadget-dark focus:ring-gadget-dark" />
                <span className="text-xs text-gray-600">مرا به خاطر بسپار</span>
              </label>
              <a href="#" className="text-xs text-gadget-dark hover:underline font-medium">رمز عبور را فراموش کرده‌اید؟</a>
            </div>

            <button
              type="submit"
              className="w-full bg-gadget-dark hover:opacity-80 text-white py-3 rounded-lg text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              ورود به سیستم
              <ArrowRight size={18} />
            </button>
          </form>

          {/* هدایت به ثبت نام */}
          <div className="mt-6 text-center text-sm text-gray-600">
            حساب کاربری ندارید؟{' '}
            <Link to="/register" className="text-gadget-dark font-bold cursor-pointer hover:underline">
              ثبت‌نام کنید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}