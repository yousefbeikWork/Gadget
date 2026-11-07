import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Step1Identity from "./patient-steps/Step1Identity";
import Step2MedicalHistory from "./patient-steps/Step2MedicalHistory";
import Step3DocumentsAndPayment from "./patient-steps/Step3DocumentsAndPayment";

export default function PatientForm() {
  // مراحل سه‌گانه: ۱: هویتی | ۲: سوابق پزشکی | ۳: مدارک شناسایی و پرداخت
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const stepsConfig = [
    { step: 1, label: "اطلاعات هویتی" },
    { step: 2, label: "سوابق پزشکی" },
    { step: 3, label: "مدارک و صدور کارت" },
  ];

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-200">
      
      {/* ================== نوار ۳ مرحله‌ای (Stepper) ================== */}
      <div className="bg-gray-50/80 border border-gray-200/70 p-3 sm:p-4 rounded-2xl mb-6">
        <div className="flex items-center justify-between max-w-md mx-auto relative">
          
          {/* خط اتصال */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-gray-200 z-0">
            <div
              className={`h-full bg-gadget-dark transition-all duration-300 ${
                currentStep === 2 ? "w-1/2" : currentStep === 3 ? "w-full" : "w-0"
              }`}
            />
          </div>

          {/* نشانگرهای ۳ مرحله */}
          {stepsConfig.map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div key={item.step} className="flex items-center gap-1.5 relative z-10 bg-gray-50 px-1 select-none">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-gadget-dark text-white ring-4 ring-gadget-dark/20"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : item.step}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-bold hidden sm:inline ${
                    isCurrent
                      ? "text-gadget-dark"
                      : isCompleted
                      ? "text-emerald-700"
                      : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================== رندر مرحله فعال ================== */}
      {currentStep === 1 && (
        <Step1Identity
          onSuccessNext={() => {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {currentStep === 2 && (
        <Step2MedicalHistory
          onSuccessNext={() => {
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {currentStep === 3 && <Step3DocumentsAndPayment />}

    </div>
  );
}