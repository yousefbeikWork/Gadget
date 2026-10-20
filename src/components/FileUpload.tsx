import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Loader2, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export interface FileUploadProps {
  label: string;
  onUploadSuccess: (minioObjectName: string, originalName?: string) => void;
  onRemove?: () => void;
  acceptedTypes?: string;
}

export default function FileUpload({ 
  label, 
  onUploadSuccess, 
  onRemove,
  acceptedTypes = "image/jpeg,image/png,image/jpg" 
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // 👈 استیت پیش‌نمایش تصویر
  const fileInputRef = useRef<HTMLInputElement>(null);

  // آزادسازی حافظه مرورگر هنگام تغییر یا حذف کامپوننت
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ۱. ایجاد پیش‌نمایش محلی تصویر
    if (file.type.startsWith('image/')) {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    } else {
      setPreviewUrl(null);
    }

    // ۲. ارسال فایل به سرور
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
        setUploadedFileName(response.data.originalFilename || file.name);
        onUploadSuccess(response.data.minioObjectName, response.data.originalFilename || file.name);
        toast.success('فایل با موفقیت بارگذاری شد');
      }
    } catch (err) {
      toast.error('خطا در آپلود فایل. لطفاً دوباره تلاش کنید.');
      handleRemove();
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove();
  };

  return (
    <div className="w-full font-sans">
      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">{label}</label>
      
      {/* حالت ۱: باکس انتخاب فایل (قبل از آپلود) */}
      {!uploadedFileName && !isUploading && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 hover:border-gadget-light bg-gray-50/70 hover:bg-gadget-light/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xs text-gray-400 group-hover:text-gadget-light group-hover:scale-105 transition-all">
            <UploadCloud size={24} />
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm font-bold text-gray-700">برای انتخاب تصویر کلیک کنید</p>
            <p className="text-[11px] text-gray-400 mt-0.5">فرمت‌های مجاز: JPG, PNG</p>
          </div>
        </div>
      )}

      {/* حالت ۲: لودینگ هنگام آپلود */}
      {isUploading && (
        <div className="w-full border-2 border-dashed border-gadget-light bg-gadget-light/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-2">
          <Loader2 className="animate-spin text-gadget-light" size={28} />
          <p className="text-xs font-bold text-gadget-light">در حال بارگذاری و ذخیره تصویر...</p>
        </div>
      )}

      {/* حالت ۳: نمایش پیش‌نمایش تصویر آپلودشده */}
      {uploadedFileName && !isUploading && (
        <div className="w-full border border-emerald-200 bg-emerald-50/50 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            {previewUrl ? (
              <div className="relative group shrink-0">
                <img 
                  src={previewUrl} 
                  alt="پیش‌نمایش مدرک" 
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
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <UploadCloud size={20} />
              </div>
            )}

            <div className="truncate min-w-0">
              <p className="text-xs font-bold text-emerald-900 truncate">تصویر بارگذاری شد</p>
              <p className="text-[11px] text-emerald-700 font-mono truncate mt-0.5" dir="ltr">
                {uploadedFileName}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleRemove}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
            title="حذف و بارگذاری مجدد"
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