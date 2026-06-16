import { useState, useEffect } from "react";
import { User, Loader2 } from "lucide-react";
import api from "../services/api";

interface DoctorAvatarProps {
  imageProfile?: string;
  firstName?: string;
  className?: string;
}

export default function DoctorAvatar({
  imageProfile,
  firstName,
  className = "w-14 h-14 text-xl",
}: DoctorAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let objectUrl = "";

    // 🐛 کد عیب‌یابی ۱: بررسی اینکه آیا اصلاً فیلد عکس از کامپوننت مادر پاس داده شده یا خیر
    console.log(`[Avatar Debug] برای پزشک ${firstName} فیلد imageProfile برابر است با:`, imageProfile);

    if (imageProfile) {
      const fetchAvatar = async () => {
        try {
          setLoading(true);
          setHasError(false);
          
          const response = await api.post(
            "/recive/api/reciveListFile",
            { minioObjectName: imageProfile },
            { responseType: "blob" }
          );

          // بررسی اینکه آیا حجمBlob دریافتی خیلی کم است (نشانه خطای متنی باینری شده)
          if (response.data.size < 200) {
            // فایل دریافتی احتمالا یک JSON حاوی پیام خطا است نه عکس واقعی
            console.warn(`[Avatar Debug] فایل دریافتی برای ${firstName} بسیار کوچک است و احتمالاً عکس نیست.`);
          }

          const blob = new Blob([response.data]);
          objectUrl = URL.createObjectURL(blob);
          setAvatarUrl(objectUrl);
        } catch (err) {
          // 🐛 کد عیب‌یابی ۲: ثبت خطای دانلود فایل از سرور مین‌أیو
          console.error(`[Avatar Debug] خطا در دانلود فایل ${imageProfile} برای ${firstName}:`, err);
          setHasError(true);
        } finally {
          setLoading(false);
        }
      };

      fetchAvatar();
    } else {
      setAvatarUrl("");
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageProfile, firstName]);

  return (
    <div
      className={`${className} rounded-2xl flex items-center justify-center font-bold shadow-sm shrink-0 overflow-hidden bg-linear-to-br from-gadget-light to-[#1f8c87] text-white`}
    >
      {loading ? (
        <Loader2 className="animate-spin opacity-70" size={20} />
      ) : avatarUrl && !hasError ? (
        <img 
          src={avatarUrl} 
          alt={firstName || "پزشک"} 
          className="w-full h-full object-cover"
          onError={() => {
            console.error(`[Avatar Debug] تگ img نتوانست سورس را رندر کند: ${avatarUrl}`);
            setHasError(true);
          }}
        />
      ) : firstName ? (
        firstName[0]
      ) : (
        <User size={20} />
      )}
    </div>
  );
}