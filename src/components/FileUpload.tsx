import { useState, useRef } from 'react';
import { UploadCloud, Loader2, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface FileUploadProps {
  label: string;
  onUploadSuccess: (minioObjectName: string, originalName: string) => void;
  acceptedTypes?: string; // مثلاً "image/*,application/pdf"
}

export default function FileUpload({ 
  label, 
  onUploadSuccess, 
  acceptedTypes = "image/*,application/pdf" 
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ۱. ساخت فرم‌دیتا برای ارسال فایل
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadedFileName(null);

    try {
      // ۲. ارسال ریکوئست به API آپلود
      const response = await api.post('/upload/api/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.minioObjectName) {
        setUploadedFileName(response.data.originalFilename);
        
        // ۳. پاس دادن نام فایل ذخیره شده در سرور (MinIO) به کامپوننت پدر
        onUploadSuccess(response.data.minioObjectName, response.data.originalFilename);
        toast.success('فایل با موفقیت آپلود شد');
      }
    } catch (err) {
      toast.error('خطا در آپلود فایل. لطفاً حجم و فرمت فایل را بررسی کنید.');
      // ریست کردن اینپوت برای تلاش مجدد
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setUploadedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // در صورت نیاز می‌تونی یک پراپ onRemove هم اضافه کنی تا کامپوننت پدر مطلع بشه
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      
      {!uploadedFileName && !isUploading && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 hover:border-gadget-light bg-gray-50 hover:bg-gadget-light/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:text-gadget-light transition-colors">
            <UploadCloud size={24} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700">برای انتخاب فایل کلیک کنید</p>
            <p className="text-xs text-gray-500 mt-1">فرمت‌های مجاز: PDF, PNG, JPG</p>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="w-full border-2 border-dashed border-gadget-light bg-gadget-light/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-gadget-light" size={32} />
          <p className="text-sm font-bold text-gadget-light">در حال آپلود فایل...</p>
        </div>
      )}

      {uploadedFileName && !isUploading && (
        <div className="w-full border border-green-200 bg-green-50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-green-800 truncate">فایل آپلود شد</p>
              <p className="text-xs text-green-600 truncate mt-0.5" dir="ltr">{uploadedFileName}</p>
            </div>
          </div>
          <button 
            onClick={handleRemove}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
            title="حذف و انتخاب فایل دیگر"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* اینپوت مخفی */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept={acceptedTypes}
        className="hidden" 
        multiple
      />
    </div>
  );
}