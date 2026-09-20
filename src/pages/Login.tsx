import { useState } from "react";
import { Lock, ArrowRight, Eye, EyeOff, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 استیت نمایش یا پنهان‌سازی رمز عبور

  const toEnglishDigits = (str: string) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return str
      .split("")
      .map((c) => (persianNumbers.includes(c) ? persianNumbers.indexOf(c) : c))
      .join("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = toEnglishDigits(username).trim();

    const loginPromise = api.post("/auth/login", {
      mobile: cleanMobile,
      password: password,
    });

    toast.promise(loginPromise, {
      loading: "در حال بررسی اطلاعات...",
      success: (response) => {
        const { accessToken, refreshToken, role: userRole } = response.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userRole", userRole);
        login(userRole);

        setTimeout(() => {
          navigate("/");
        }, 800);

        return "ورود موفقیت‌آمیز بود! در حال انتقال...";
      },
      error: (err) => {
        return (
          err.response?.data?.error ||
          err.response?.data?.message ||
          "شماره موبایل یا رمز عبور اشتباه است."
        );
      },
    });
  };

  return (
    <div
      className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-3 sm:p-4 py-8 md:py-10 font-sans"
      dir="rtl"
    >
      {/* کارت اصلی ورود هماهنگ با فرم ثبت‌نام */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* ================= هدر هماهنگ با ثبت‌نام ================= */}
        <div className="bg-linear-to-r from-gadget-dark to-gadget-light p-6 md:p-8 text-center shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/cubes.png')] opacity-20 mix-blend-overlay"></div>

          <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center mb-3 md:mb-4 border border-white/20 shadow-inner">
            <Lock className="text-white" size={28} />
          </div>
          <h1 className="relative z-10 text-xl md:text-2xl font-black text-white mb-1">
            ورود به سامانه
          </h1>
          <p className="relative z-10 text-gray-100 text-xs md:text-sm">
            لطفاً اطلاعات کاربری خود را وارد فرمایید
          </p>
        </div>

        {/* ================= بدنه فرم ================= */}
        <div className="p-5 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* فیلد نام کاربری (موبایل) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                شماره موبایل (نام کاربری)
              </label>
              <div className="relative">
                <Phone
                  className="absolute right-3.5 top-3 text-gray-400"
                  size={17}
                />
                <input
                  type="tel"
                  required
                  dir="ltr"
                  maxLength={11}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 sm:py-3 text-sm focus:outline-hidden focus:border-gadget-light text-left transition-colors font-medium text-gray-800"
                  placeholder="0912..."
                />
              </div>
            </div>

            {/* فیلد رمز عبور به همراه دکمه نمایش/مخفی‌سازی */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 sm:py-3 text-sm focus:outline-hidden focus:border-gadget-light text-left transition-colors font-medium text-gray-800"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-0.5"
                  title={showPassword ? "پنهان‌کردن رمز" : "نمایش رمز"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* دکمه سابمیت */}
            <button
              type="submit"
              className="w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>ورود به سیستم</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* لینک هدایت به ثبت نام */}
          <div className="mt-8 text-center text-xs sm:text-sm text-gray-600 border-t border-gray-100 pt-6">
            حساب کاربری ندارید؟{" "}
            <Link
              to="/register"
              className="text-gadget-dark font-bold hover:underline"
            >
              ثبت‌نام کنید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
