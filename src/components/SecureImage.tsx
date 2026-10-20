import { useState, useEffect } from "react";
import { Loader2, ImageOff } from "lucide-react";
import api from "../services/api";

interface SecureImageProps {
  fileName?: string | null;
  alt?: string;
  className?: string;
}

export default function SecureImage({
  fileName,
  alt = "تصویر",
  className = "w-full h-full object-contain",
}: SecureImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    if (!fileName) {
      setImageSrc(null);
      return;
    }

    const fetchImage = async () => {
      setLoading(true);
      setError(false);

      try {
        const response = await api.post(
          "/recive/api/reciveListFile",
          { minioObjectName: fileName },
          { responseType: "blob" }
        );

        if (active) {
          const blob = new Blob([response.data], {
            type: (response.headers["content-type"] as string) || "image/jpeg",
          });
          objectUrl = URL.createObjectURL(blob);
          setImageSrc(objectUrl);
        }
      } catch (err) {
        if (active) {
          console.error("خطا در بارگذاری تصویر امن:", err);
          setError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchImage();

    // پاکسازی حافظه مرورگر در زمان Unmount
    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileName]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-4">
        <Loader2 className="animate-spin mb-1 text-gadget-light" size={20} />
        <span className="text-[10px]">در حال دریافت...</span>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-4">
        <ImageOff size={22} className="mb-1 text-gray-300" />
        <span className="text-[10px]">تصویر در دسترس نیست</span>
      </div>
    );
  }

  return <img src={imageSrc} alt={alt} className={className} />;
}