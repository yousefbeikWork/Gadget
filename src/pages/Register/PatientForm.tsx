import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Phone, Lock, CreditCard, Users, ArrowRight } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function PatientForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    age: "",
    mobile: "",
    password: "",
    fatherName: "",
    gender: "MALE",
    maritalStatus: "SINGLE",
    guardianFirstName: "",
    guardianLastName: "",
    guardianNationalId: "",
    guardianMobile: "",
    guardianAddress: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // 👈 اضافه کردن تایپ React.ChangeEvent برای ورودی‌های input، select و textarea
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    const numericFields = [
      "nationalId",
      "mobile",
      "guardianNationalId",
      "guardianMobile",
      "age",
    ];
    const finalValue = numericFields.includes(name)
      ? value.replace(/\D/g, "")
      : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  // 👈 مشخص کردن تایپ string برای ورودی str
  const toEnglishDigits = (str: string) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return str
      .split("")
      .map((c: string) =>
        persianNumbers.includes(c) ? persianNumbers.indexOf(c) : c,
      )
      .join("");
  };

  // 👈 اضافه کردن تایپ React.FormEvent برای سابمیت فرم
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("در حال ایجاد حساب کاربری...");

    try {
      // 1. آماده‌سازی دیتای ثبت‌نام
      const payload = {
        role: "Patient",
        mobile: toEnglishDigits(formData.mobile).trim(),
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        nationalId: toEnglishDigits(formData.nationalId).trim(),
        age: Number(toEnglishDigits(formData.age)) || 0,
        fatherName: formData.fatherName,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        guardian: {
          firstName: formData.guardianFirstName,
          lastName: formData.guardianLastName,
          nationalId: toEnglishDigits(formData.guardianNationalId).trim(),
          mobile: toEnglishDigits(formData.guardianMobile).trim(),
          address: formData.guardianAddress,
        },
      };

      // 2. ارسال درخواست ثبت‌نام
      const registerResponse = await api.post("/auth/register", payload);
      const {
        accessToken,
        refreshToken,
        role: userRole,
      } = registerResponse.data;

      // 3. ذخیره توکن‌ها و لاگین در کانتکست
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userRole", userRole);
      login(userRole);

      toast.loading("ثبت‌نام موفق! در حال انتقال به درگاه پرداخت...", {
        id: toastId,
      });

      // 4. ارسال درخواست ساخت فاکتور RFID
      const paymentResponse = await api.post(
        "/peyment/rfid/pay",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      // 5. انتقال به درگاه سامان
      if (paymentResponse.data.success) {
        toast.success("در حال انتقال به بانک...", { id: toastId });
        window.location.href = paymentResponse.data.data.paymentUrl;
      }
    } catch (err: any) {
      // 👈 تایپ err به صورت any مشخص شد
      console.error(err);

      // بررسی اینکه آیا کاربر ساخته شده ولی درگاه خطا داده است یا کلا ثبت نام خطا داده
      if (localStorage.getItem("accessToken")) {
        toast.error("ثبت‌نام انجام شد اما در ارتباط با درگاه مشکلی پیش آمد.", {
          id: toastId,
        });
        navigate("/dashboard");
      } else {
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "خطا در ثبت‌نام.";
        toast.error(errorMsg, { id: toastId });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 animate-in fade-in duration-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <h3 className="text-sm font-bold text-gadget-light border-b border-gray-100 pb-2 mb-2">
            اطلاعات هویتی و کاربری بیمار
          </h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نام
          </label>
          <div className="relative">
            <User
              className="absolute right-3 top-2.5 text-gray-400"
              size={16}
            />
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              type="text"
              className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نام خانوادگی
          </label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            type="text"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            کد ملی
          </label>
          <div className="relative">
            <CreditCard
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
            <input
              name="nationalId"
              maxLength={10}
              value={formData.nationalId}
              onChange={handleChange}
              required
              type="text"
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden"
              dir="ltr"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            سن
          </label>
          <input
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            type="number"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            شماره موبایل
          </label>
          <div className="relative">
            <Phone
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
            <input
              name="mobile"
              maxLength={11}
              value={formData.mobile}
              onChange={handleChange}
              required
              type="tel"
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden"
              dir="ltr"
              placeholder="0912..."
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            رمز عبور
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              type="password"
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden"
              dir="ltr"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نام پدر
          </label>
          <input
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            required
            type="text"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              جنسیت
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-gadget-light outline-hidden cursor-pointer"
            >
              <option value="MALE">مرد</option>
              <option value="FEMALE">زن</option>
              <option value="OTHER">سایر</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              وضعیت تاهل
            </label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-gadget-light outline-hidden cursor-pointer"
            >
              <option value="SINGLE">مجرد</option>
              <option value="MARRIED">متاهل</option>
            </select>
          </div>
        </div>

        {/* بخش قیم */}
        <div className="md:col-span-2 border rounded-xl p-4 mt-2 border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <Users size={18} />
            <h3 className="text-sm font-bold">اطلاعات قیم بیمار</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                نام قیم
              </label>
              <input
                name="guardianFirstName"
                value={formData.guardianFirstName}
                onChange={handleChange}
                required
                type="text"
                className="w-full rounded-lg px-3 py-2 text-sm bg-white border border-gray-200 focus:border-gadget-light outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                نام خانوادگی قیم
              </label>
              <input
                name="guardianLastName"
                value={formData.guardianLastName}
                onChange={handleChange}
                required
                type="text"
                className="w-full rounded-lg px-3 py-2 text-sm bg-white border border-gray-200 focus:border-gadget-light outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                کد ملی قیم
              </label>
              <input
                name="guardianNationalId"
                maxLength={10}
                value={formData.guardianNationalId}
                onChange={handleChange}
                required
                type="text"
                className="w-full rounded-lg px-3 py-2 text-sm bg-white text-left border border-gray-200 focus:border-gadget-light outline-hidden"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                شماره موبایل قیم
              </label>
              <input
                name="guardianMobile"
                maxLength={11}
                value={formData.guardianMobile}
                onChange={handleChange}
                required
                type="tel"
                className="w-full rounded-lg px-3 py-2 text-sm bg-white text-left border border-gray-200 focus:border-gadget-light outline-hidden"
                dir="ltr"
                placeholder="09"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                آدرس سکونت قیم
              </label>
              <textarea
                name="guardianAddress"
                value={formData.guardianAddress}
                onChange={handleChange}
                required
                rows={2}
                className="w-full rounded-lg px-3 py-2 text-sm bg-white border border-gray-200 focus:border-gadget-light outline-hidden resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end items-center gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 text-white ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gadget-dark hover:bg-gadget-dark/90 cursor-pointer"}`}
        >
          {isLoading ? "لطفا صبر کنید..." : "ثبت‌نام و پرداخت هزینه کارت RFID"}
          {!isLoading && <ArrowRight size={18} />}
        </button>
      </div>
    </form>
  );
}
