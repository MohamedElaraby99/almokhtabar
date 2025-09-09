import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaVideo, FaFilePdf, FaClipboardList } from 'react-icons/fa';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';

const BasicPlan = () => {
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">الباقة الأساسية</h1>
            <p className="mt-3 text-white/80">كل اللي تحتاجه للتعلّم الذاتي بكفاءة</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/5 rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold mb-4">شنو بتستفيد؟</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><FaVideo className="mt-1 text-white/70" /><span>فيديوهات مرتّبة على المنهج بشكل بسيط</span></li>
                <li className="flex items-start gap-3"><FaClipboardList className="mt-1 text-white/70" /><span>اختبارات تفاعلية بتصحيح فوري</span></li>
                <li className="flex items-start gap-3"><FaFilePdf className="mt-1 text-white/70" /><span>ملفّات PDF وملخّصات للمذاكرة</span></li>
                <li className="flex items-start gap-3"><FaCheckCircle className="mt-1 text-white/70" /><span>تدريبات وأسئلة متدرجة لين تثبّت المعلومة</span></li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 text-gray-900 border border-white/20">
              <h3 className="text-xl font-bold mb-2 text-right">ابدأ الحين</h3>
              <p className="text-right text-gray-700 mb-6">انضم وتمتّع بكل محتوى الباقة الأساسية.</p>
              <div className="space-y-3">
                <a href="/signup" className="block w-full text-center px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#5b2233] to-[#7a2d43] hover:from-[#7a2d43] hover:to-[#5b2233] transition-all">سجّل حساب جديد</a>
                <a href="/courses" className="block w-full text-center px-6 py-3 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50">تصفّح المحتوى</a>
              </div>
              <p className="text-xs text-right text-gray-600 mt-4">وتقدر ترقّي للباقة المميّزة بأي وقت.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default BasicPlan;


