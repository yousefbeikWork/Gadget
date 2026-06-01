import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ClinicData {
  name: string;
  specialty: string;
  phone: string;
  address: string;
  status: 'فعال' | 'غیرفعال';
}

interface AddClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (clinic: ClinicData) => void;
  initialData?: ClinicData | null; // این پراپ برای دریافت اطلاعات کلینیک در حال ویرایش اضافه شد
}

export default function AddClinicModal({ isOpen, onClose, onAdd, initialData }: AddClinicModalProps) {
  const [formData, setFormData] = useState<ClinicData>({
    name: '',
    specialty: '',
    phone: '',
    address: '',
    status: 'فعال',
  });

  // هر بار که فرم باز می‌شود یا دیتای اولیه تغییر می‌کند، این هوک اجرا می‌شود
  useEffect(() => {
    if (initialData) {
      setFormData(initialData); // اگر دیتایی بود، فرم را با آن پر کن
    } else {
      setFormData({ name: '', specialty: '', phone: '', address: '', status: 'فعال' }); // در غیر این صورت فرم را خالی کن
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          {/* تغییر پویای عنوان */}
          <h2 className="text-lg font-bold text-gadget-dark">
            {initialData ? 'ویرایش اطلاعات کلینیک' : 'ثبت کلینیک جدید'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام کلینیک</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-1 focus:ring-gadget-light"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تخصص اصلی</label>
              <input 
                required
                type="text" 
                value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-1 focus:ring-gadget-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">شماره تماس</label>
              <input 
                required
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-1 focus:ring-gadget-light text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">آدرس دقیق</label>
            <textarea 
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-1 focus:ring-gadget-light"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت فعالیت</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as 'فعال' | 'غیرفعال'})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-1 focus:ring-gadget-light bg-white"
            >
              <option value="فعال">فعال</option>
              <option value="غیرفعال">غیرفعال</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-gadget-light hover:bg-[#209c96] rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {/* تغییر پویای دکمه */}
              {initialData ? 'ذخیره تغییرات' : 'ثبت اطلاعات'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}