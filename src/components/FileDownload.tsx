import { useState } from "react";
import { DownloadCloud, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

interface FileDownloadProps {
  fileName: string;
  className?: string; // برای دریافت استایل‌های سفارشی از بیرون
}

export default function FileDownload({ fileName, className = "" }: FileDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    const loadingToast = toast.loading("در حال دریافت فایل...");

    try {
      const response = await api.post(
        "/recive/api/reciveListFile",
        { minioObjectName: fileName },
        {
          responseType: "blob", // ضروری برای دریافت فایل‌های باینری
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // ساخت URL موقت و دانلود فایل
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      
      // پاکسازی مموری
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("دانلود با موفقیت انجام شد", { id: loadingToast });
    } catch (err) {
      toast.error("خطا در دانلود فایل. لطفاً دوباره تلاش کنید.", { id: loadingToast });
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 ${className}`}
      title="دانلود این فایل"
    >
      {isDownloading ? (
        <Loader2 size={14} className="animate-spin shrink-0" />
      ) : (
        <DownloadCloud size={14} className="shrink-0" />
      )}
      <span className="truncate max-w-45 font-medium" dir="ltr">
        {fileName}
      </span>
    </button>
  );
}