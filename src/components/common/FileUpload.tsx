import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Loader2, X, Eye, FileSpreadsheet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export interface FileUploadProps {
  label: string;
  onUploadSuccess: (minioObjectName: string, originalName?: string) => void;
  onRemove?: () => void;
  acceptedTypes?: string;
  helperText?: string; // متن راهنمای اختیاری
}

export default function FileUpload({ 
  label, 
  onUploadSuccess, 
  onRemove,
  acceptedTypes = "image/jpeg,image/png,image/jpg",
  helperText
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // بررسی نوع فایل مجاز برای نمایش متن و آیکون مناسب
  const isExcel = acceptedTypes.includes('excel') || acceptedTypes.includes('.xls') || acceptedTypes.includes('.xlsx');
  const isPdf = acceptedTypes.includes('pdf');

  // متن راهنمای پیش‌فرض در صورت پاس ندادن helperText
  const getHintText = () => {
    if (helperText) return helperText;
    if (isExcel) return "فرمت‌های مجاز: XLSX, XLS";
    if (isPdf) return "فرمت‌های مجاز: PDF, JPG, PNG";
    return "فرمت‌های مجاز: JPG, PNG";
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const processFile = async (file: File) => {
    // ایجاد پیش‌نمایش فقط در صورتی که فایل واقعاً عکس باشد
    if (file.type.startsWith('image/')) {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    } else {
      setPreviewUrl(null);
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadedFileName(null);

    try {
      const response = await api.post('/upload/api/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.minioObjectName) {
        const fileName = response.data.originalFilename || file.name;
        setUploadedFileName(fileName);
        onUploadSuccess(response.data.minioObjectName, fileName);
        toast.success('فایل با موفقیت بارگذاری شد');
      }
    } catch (err) {
      toast.error('خطا در بارگذاری فایل. لطفاً حجم و فرمت فایل را بررسی کنید.');
      handleRemove();
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // رویدادهای Drag & Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // ریست کردن استیت‌ها و اطلاع به کامپوننت والد
  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove(); // 👈 پاک شدن استیت در والد تا دکمه پردازش مخفی شود
  };

  // تشخیص آیکون مناسب برای فایل‌های غیرتصویری
  const renderFileIcon = () => {
    if (isExcel || uploadedFileName?.endsWith('.xlsx') || uploadedFileName?.endsWith('.xls')) {
      return (
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
          <FileSpreadsheet size={24} />
        </div>
      );
    }
    if (uploadedFileName?.endsWith('.pdf')) {
      return (
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
          <FileText size={24} />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center shrink-0">
        <UploadCloud size={24} />
      </div>
    );
  };

  return (
    <div className="w-full font-sans">
      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">{label}</label>
      
      {/* ۱. باکس انتخاب / درگ فایل */}
      {!uploadedFileName && !isUploading && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer group select-none ${
            isDragging
              ? "border-gadget-dark bg-gadget-light/15 ring-4 ring-gadget-dark/20 scale-[1.01] shadow-md"
              : "border-gray-300 hover:border-gadget-light bg-gray-50/70 hover:bg-gadget-light/5 hover:scale-[1.005]"
          }`}
        >
          <div 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs transition-all duration-200 ${
              isDragging
                ? "bg-gadget-dark text-white animate-bounce shadow-md scale-110"
                : "bg-white text-gray-400 group-hover:text-gadget-light group-hover:scale-105"
            }`}
          >
            {isExcel ? <FileSpreadsheet size={24} /> : <UploadCloud size={24} />}
          </div>

          <div className="text-center">
            <p className={`text-xs sm:text-sm font-bold transition-colors ${isDragging ? "text-gadget-dark font-black" : "text-gray-700"}`}>
              {isDragging ? "فایل را اینجا رها کنید..." : "برای انتخاب کلیک کنید یا فایل را اینجا بکشید"}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{getHintText()}</p>
          </div>
        </div>
      )}

      {/* ۲. لودینگ حین آپلود */}
      {isUploading && (
        <div className="w-full border-2 border-dashed border-gadget-light bg-gadget-light/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 animate-pulse">
          <Loader2 className="animate-spin text-gadget-light" size={28} />
          <p className="text-xs font-bold text-gadget-light">در حال ارسال و بارگذاری فایل...</p>
        </div>
      )}

      {/* ۳. پیش‌نمایش فایل بارگذاری‌شده */}
      {uploadedFileName && !isUploading && (
        <div className="w-full border border-emerald-200 bg-emerald-50/50 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            {previewUrl ? (
              <div className="relative group shrink-0">
                <img 
                  src={previewUrl} 
                  alt="پیش‌نمایش" 
                  className="w-14 h-14 object-cover rounded-xl border border-emerald-200 shadow-2xs"
                />
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  title="مشاهده اندازه بزرگ"
                >
                  <Eye size={16} />
                </a>
              </div>
            ) : (
              renderFileIcon()
            )}

            <div className="truncate min-w-0">
              <p className="text-xs font-bold text-emerald-900 truncate">
                {previewUrl ? "تصویر بارگذاری شد" : "فایل با موفقیت بارگذاری شد"}
              </p>
              <p className="text-[11px] text-emerald-700 font-mono truncate mt-0.5" dir="ltr">
                {uploadedFileName}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleRemove}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
            title="حذف و بارگذاری فایل دیگر"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept={acceptedTypes}
        className="hidden" 
      />
    </div>
  );
}