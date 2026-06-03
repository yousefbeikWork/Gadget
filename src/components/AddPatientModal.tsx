import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface PatientData {
  name: string;
  nationalId: string;
  phone: string;
  gender: 'مرد' | 'زن';
  status: 'تحت درمان' | 'ترخیص شده' | 'در انتظار ویزیت';
}

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (patient: PatientData) => void;
  initialData?: PatientData | null;
}

export default function AddPatientModal({ isOpen, onClose, onAdd, initialData }: AddPatientModalProps) {
  const [formData, setFormData] = useState<PatientData>({
    name: '',
    nationalId: '',
    phone: '',
    gender: 'مرد',
    status: 'در انتظار ویزیت',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', nationalId: '', phone: '', gender: 'مرد', status: 'در انتظار ویزیت' });
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
          <h2 className="text-lg font-bold text-gadget-dark">
            {initialData ? 'ویرایش پرونده بیمار' : 'ثبت بیمار جدید'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark focus:ring-1 focus:ring-gadget-dark"
              placeholder="مثال: علی حسینی"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد ملی / کد اتباع</label>
              <input 
                required
                type="text" 
                value={formData.nationalId}
                onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark focus:ring-1 focus:ring-gadget-dark text-left"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">شماره تماس</label>
              <input 
                required
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark focus:ring-1 focus:ring-gadget-dark text-left"
                dir="ltr"
                placeholder="0912..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">جنسیت</label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value as 'مرد' | 'زن'})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark focus:ring-1 focus:ring-gadget-dark bg-white"
              >
                <option value="مرد">مرد</option>
                <option value="زن">زن</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت پرونده</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as PatientData['status']})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark focus:ring-1 focus:ring-gadget-dark bg-white"
              >
                <option value="در انتظار ویزیت">در انتظار ویزیت</option>
                <option value="تحت درمان">تحت درمان</option>
                <option value="ترخیص شده">ترخیص شده</option>
              </select>
            </div>
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
              className="px-5 py-2.5 text-sm font-medium text-white bg-gadget-dark hover:bg-gadget-dark/90 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {initialData ? 'ذخیره تغییرات' : 'ثبت بیمار'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}