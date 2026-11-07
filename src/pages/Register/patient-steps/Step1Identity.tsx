import { useState } from "react";
import toast from "react-hot-toast";
import {
  User,
  Phone,
  Lock,
  CreditCard,
  Users,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import api from "../../../services/api";

interface Props {
  onSuccessNext: () => void;
}

export default function Step1Identity({ onSuccessNext }: Props) {
  const [isLoading, setIsLoading] = useState(false);

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

  const toEnglishDigits = (str: string) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return str
      .split("")
      .map((c: string) =>
        persianNumbers.includes(c) ? persianNumbers.indexOf(c) : c,
      )
      .join("");
  };

  const handleProceedToStep2 = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.nationalId.length !== 10) {
      toast.error("کد ملی بیمار باید ۱۰ رقم باشد.");
      return;
    }
    if (formData.mobile.length !== 11) {
      toast.error("شماره موبایل باید ۱۱ رقم باشد.");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    const ageNum = Number(toEnglishDigits(formData.age));
    if (ageNum < 18) {
      if (
        !formData.guardianFirstName.trim() ||
        !formData.guardianLastName.trim() ||
        formData.guardianNationalId.length !== 10 ||
        formData.guardianMobile.length !== 11
      ) {
        toast.error("برای افراد زیر ۱۸ سال، تکمیل اطلاعات قیم الزامی است.");
        return;
      }
    }

    setIsLoading(true);
    const toastId = toast.loading("در حال ثبت اطلاعات کاربری...");

    try {
      const payload = {
        role: "Patient",
        mobile: toEnglishDigits(formData.mobile).trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        nationalId: toEnglishDigits(formData.nationalId).trim(),
        age: ageNum,
        fatherName: formData.fatherName.trim(),
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        guardian: {
          firstName: formData.guardianFirstName.trim(),
          lastName: formData.guardianLastName.trim(),
          nationalId: toEnglishDigits(formData.guardianNationalId).trim(),
          mobile: toEnglishDigits(formData.guardianMobile).trim(),
          address: formData.guardianAddress.trim(),
        },
      };

      const registerResponse = await api.post("/auth/register", payload);
      const {
        accessToken,
        refreshToken,
        role: userRole,
      } = registerResponse.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userRole", userRole);

      toast.success(
        "حساب کاربری ایجاد شد. اکنون سوابق پزشکی خود را تکمیل نمایید.",
        { id: toastId },
      );

      onSuccessNext();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "خطا در ایجاد حساب کاربری.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleProceedToStep2}
      className="space-y-6 animate-in fade-in"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div className="md:col-span-2">
          <h3 className="text-xs sm:text-sm font-bold text-gadget-light border-b border-gray-100 pb-2">
            اطلاعات هویتی و کاربری بیمار
          </h3>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            نام *
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
              placeholder="مثال: رضا"
              className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            نام خانوادگی *
          </label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            type="text"
            placeholder="مثال: محمدی"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            کد ملی (۱۰ رقم) *
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
              placeholder="0012345678"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden font-mono"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            سن *
          </label>
          <input
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            type="number"
            placeholder="مثال: 28"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden font-mono"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            شماره موبایل *
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
              placeholder="0912..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden font-mono"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            رمز عبور *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              type="password"
              placeholder="حداقل ۶ کاراکتر"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            نام پدر
          </label>
          <input
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            type="text"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              جنسیت
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden cursor-pointer"
            >
              <option value="MALE">مرد</option>
              <option value="FEMALE">زن</option>
              <option value="OTHER">سایر</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              وضعیت تأهل
            </label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden cursor-pointer"
            >
              <option value="SINGLE">مجرد</option>
              <option value="MARRIED">متأهل</option>
            </select>
          </div>
        </div>

        {/* بخش اطلاعات قیم */}
        <div className="md:col-span-2 border rounded-2xl p-4 sm:p-5 mt-2 border-gray-200/80 bg-gray-50/60 space-y-3.5">
          <div className="flex items-center gap-2 text-gray-800 border-b border-gray-200/60 pb-2">
            <Users size={17} className="text-gadget-light" />
            <h3 className="text-xs sm:text-sm font-bold">
              اطلاعات قیم / سرپرست قانونی (برای افراد زیر ۱۸ سال الزامی است)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                نام قیم
              </label>
              <input
                name="guardianFirstName"
                value={formData.guardianFirstName}
                onChange={handleChange}
                type="text"
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-white border border-gray-200 focus:border-gadget-light outline-hidden"
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
                type="text"
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-white border border-gray-200 focus:border-gadget-light outline-hidden"
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
                type="text"
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-white text-left border border-gray-200 focus:border-gadget-light outline-hidden font-mono"
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
                type="tel"
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-white text-left border border-gray-200 focus:border-gadget-light outline-hidden font-mono"
                dir="ltr"
                placeholder="09..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                آدرس سکونت قیم
              </label>
              <textarea
                name="guardianAddress"
                value={formData.guardianAddress}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-white border border-gray-200 focus:border-gadget-light outline-hidden resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto min-w-50 py-3 px-6 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 text-white bg-gadget-dark hover:bg-gadget-dark/90 cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>در حال ثبت...</span>
            </>
          ) : (
            <>
              <span>ادامه و ثبت سوابق پزشکی</span>
              <ArrowLeft size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
