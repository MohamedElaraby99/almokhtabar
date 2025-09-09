import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaVideo, FaFilePdf, FaClipboardList, FaUserTie, FaHeadset } from 'react-icons/fa';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';

const PremiumPlan = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Navbar />
      <section className={`min-h-screen bg-[#361927] text-white pb-16 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700`} dir="rtl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">الباقة المميّزة</h1>
            <p className="mt-3 text-white/80">كل محتوى المنصّة + جلسات خاصة أونلاين ومتابعة على طول</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/5 rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold mb-4">شنو بتستفيد؟</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><FaVideo className="mt-1 text-white/70" /><span>فيديوهات مرتّبة على المنهج، تمشي معك خطوة بخطوة</span></li>
                <li className="flex items-start gap-3"><FaClipboardList className="mt-1 text-white/70" /><span>اختبارات تفاعلية بتصحيح فوري وتقارير أداء واضحة</span></li>
                <li className="flex items-start gap-3"><FaFilePdf className="mt-1 text-white/70" /><span>ملفّات PDF وملخّصات مرتّبة وسهلة التحميل</span></li>
                <li className="flex items-start gap-3"><FaCheckCircle className="mt-1 text-white/70" /><span>تدريبات وأسئلة تتصعّب بالتدريج لين تتقن</span></li>
                <li className="flex items-start gap-3"><FaUserTie className="mt-1 text-white/70" /><span>جلسات خاصة فردية أونلاين مع الدكتور مباشرة</span></li>
                <li className="flex items-start gap-3"><FaHeadset className="mt-1 text-white/70" /><span>دعم سريع ومتابعة أسبوعية وخطّة على مقاسك</span></li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 text-gray-900 border border-white/20">
              <h3 className="text-xl font-bold mb-2 text-right">اشترك الحين</h3>
              <p className="text-right text-gray-700 mb-6">ابدأ مشوارك مع الباقة المميّزة وخلك على متابعة دايمًا.</p>
              <div className="space-y-3">
                <a href="/signup" className="block w-full text-center px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#5b2233] to-[#7a2d43] hover:from-[#7a2d43] hover:to-[#5b2233] transition-all">سجّل حساب جديد</a>
                <a href="/contact" className="block w-full text-center px-6 py-3 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50">استفسر عن الجلسات الخاصة</a>
              </div>
              <p className="text-xs text-right text-gray-600 mt-4">إذا أنت مشترك من قبل، كلمنا ونرقّي لك خطتك.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default PremiumPlan;


