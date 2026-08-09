// import React from "react";

export default function EnamadBadge() {
  // کد خام اینماد را دقیقاً به شکل یک رشته (String) اینجا قرار می‌دهیم
  const enamadCode = `<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=7085309&Code=1C8FL0Bt6wU5qsjjnX7splo4Pk5Mz15d'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=7085309&Code=1C8FL0Bt6wU5qsjjnX7splo4Pk5Mz15d' alt='' style='cursor:pointer' code='1C8FL0Bt6wU5qsjjnX7splo4Pk5Mz15d'></a>`;

  return (
    <div
      // می‌توانید با کلاس‌های تیل‌ویند بک‌گراند، سایز و پدینگ دلخواه به آن بدهید
      className="bg-white p-2 rounded-xl shadow-sm hover:shadow-md transition-shadow inline-flex items-center justify-center overflow-hidden w-30 h-auto"
      dangerouslySetInnerHTML={{ __html: enamadCode }}
    />
  );
}
