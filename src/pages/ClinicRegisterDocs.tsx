import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FileCheck, Loader2, CheckSquare, ShieldAlert 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import FileUpload from '../components/FileUpload';

export default function ClinicRegisterDocs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // دریافت clinicId از مرحله اول
  const clinicId = location.state?.clinicId;

  // استیت نگهداری نام‌های ذخیره‌شده فایل‌ها (minioObjectName)
  const [documents, setDocuments] = useState({
    establishmentLicenseFile: '',
    exploitationLicenseFile: '',
    managerIdFront: '',
    managerIdBack: '',
    introductionLetterFile: '',
    liabilityInsuranceFile: '',
  });

  // اگر کاربر مستقیماً (بدون گذراندن مرحله ۱) وارد این صفحه شد، برش می‌گردانیم
  useEffect(() => {
    if (!clinicId) {
      toast.error('ابتدا باید اطلاعات اولیه مرکز درمانی را ثبت کنید.');
      navigate('/register-clinic', { replace: true });
    }
  }, [clinicId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // اعتبارسنجی سفت و سخت: هیچ فایلی نباید خالی بماند
    const requiredFiles = Object.values(documents);
    if (requiredFiles.some(file => file === '')) {
      toast.error('لطفاً تمامی مدارک خواسته‌شده را بارگذاری کنید. هیچ فیلدی نباید خالی بماند.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        clinicId: clinicId,
        establishmentLicenseFile: documents.establishmentLicenseFile,
        exploitationLicenseFile: documents.exploitationLicenseFile,
        // ترکیب کردن عکس رو و پشت کارت در یک آرایه برای ارسال به سرور
        managerIdFiles: [documents.managerIdFront, documents.managerIdBack],
        introductionLetterFile: documents.introductionLetterFile,
        liabilityInsuranceFile: documents.liabilityInsuranceFile
      };

      const response = await api.post('/clinic/updateClinicDocuments', payload);
      
      if (response.data) {
        toast.success(response.data.message || 'مدارک با موفقیت تایید و ثبت شدند.');
        // بعد از پایان کامل ثبت‌نام، مدیر به صفحه لاگین هدایت می‌شود
        navigate('/login', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ثبت نهایی مدارک. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  // تابع کمکی برای آپدیت کردن استیت مدارک
  const handleUploadSuccess = (field: keyof typeof documents) => (minioObjectName: string) => {
    setDocuments(prev => ({ ...prev, [field]: minioObjectName }));
  };

  if (!clinicId) return null; // جلوگیری از رندر شدن صفحه در صورت نبود ID

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-10 font-sans" dir="rtl">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* هدر فرم */}
        <div className="bg-gadget-dark p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
              <FileCheck size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">بارگذاری مدارک هویتی و ثبتی (مرحله ۲ از ۲)</h1>
            <p className="text-gadget-light text-sm">برای تکمیل ثبت‌نام، تصاویر اسناد اصلی را آپلود نمایید</p>
          </div>
        </div>

        {/* بدنه فرم */}
        <div className="p-6 md:p-8">
          
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 mb-8 flex items-start gap-3 text-sm font-medium">
            <ShieldAlert size={20} className="shrink-0 mt-0.5 text-amber-600" />
            <p>
              توجه: بارگذاری <span className="font-bold underline">تمامی</span> مدارک زیر الزامی است. 
              حساب کاربری شما پس از بررسی و تایید این مدارک توسط کارشناسان سامانه فعال خواهد شد.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <FileUpload 
                label="تصویر مجوز تأسیس از وزارت بهداشت *"
                onUploadSuccess={handleUploadSuccess('establishmentLicenseFile')}
              />

              <FileUpload 
                label="پروانه بهره‌برداری *"
                onUploadSuccess={handleUploadSuccess('exploitationLicenseFile')}
              />

              {/* کارت ملی به دو بخش تقسیم شده تا کاربر هر دو طرف را آپلود کند */}
              <FileUpload 
                label="تصویر روی کارت ملی مدیر / مسئول فنی *"
                onUploadSuccess={handleUploadSuccess('managerIdFront')}
                acceptedTypes="image/jpeg,image/png,image/jpg"
              />

              <FileUpload 
                label="تصویر پشت کارت ملی مدیر / مسئول فنی *"
                onUploadSuccess={handleUploadSuccess('managerIdBack')}
                acceptedTypes="image/jpeg,image/png,image/jpg"
              />

              <FileUpload 
                label="معرفی‌نامه رسمی (در صورت نمایندگی حقوقی) *"
                onUploadSuccess={handleUploadSuccess('introductionLetterFile')}
              />

              <FileUpload 
                label="بیمه مسئولیت مرکز (در صورت وجود) *"
                onUploadSuccess={handleUploadSuccess('liabilityInsuranceFile')}
              />

            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3.5 px-10 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckSquare size={20} />}
                {loading ? 'در حال ارسال و ثبت نهایی...' : 'تایید نهایی و پایان ثبت‌نام'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}