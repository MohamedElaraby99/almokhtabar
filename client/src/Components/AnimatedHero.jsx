import React, { useEffect, useState } from 'react';
import { FaArrowRight, FaPlay, FaStar, FaUsers, FaGraduationCap, FaAward, FaRocket, FaGlobe, FaFlask, FaAtom, FaMicroscope, FaGlasses } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
 
import mr from '../assets/mrr.png';

const AnimatedHero = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const user = useSelector((state) => state.auth.data);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: FaUsers, number: "5K+", label: "طلاب مسجلين", color: "text-[#5b2233]" },
    { icon: FaFlask, number: "200+", label: "تجربة كيميائية", color: "text-[#5b2233]" },
    { icon: FaStar, number: "4.9", label: "متوسط التقييم", color: "text-[#5b2233]" },
    { icon: FaAward, number: "15+", label: "سنوات خبرة", color: "text-[#5b2233]" }
  ];

  const handleExploreCourses = () => {
    // Navigate to courses page
    window.location.href = '/courses';
  };

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden pb-12 sm:pb-14 lg:pb-16 bg-[#361927]"
      dir="rtl"
    >   
      {/* Enhanced Background Overlay */}
      <div className="absolute inset-0  from-black/60 via-black/50 to-black/70"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 xl:w-40 xl:h-40 2xl:w-48 2xl:h-48 from-[#5b2233]/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 xl:w-48 xl:h-48 2xl:w-56 2xl:h-56 bg-gradient-to-tl from-[#5b2233]/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Floating Chemistry Icons */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <FaFlask size={40} className="absolute text-white/10 float-slow" style={{ top: '12%', left: '6%', animationDelay: '0s' }} />
        <FaAtom size={48} className="absolute text-white/10 drift" style={{ top: '28%', right: '10%', animationDelay: '1s' }} />
        <FaMicroscope size={44} className="absolute text-white/10 float-slower" style={{ bottom: '18%', left: '14%', animationDelay: '0.5s' }} />
        <FaFlask size={34} className="absolute text-white/10 drift" style={{ bottom: '12%', right: '8%', animationDelay: '1.5s' }} />
        <FaAtom size={36} className="absolute text-white/10 float-slow" style={{ top: '18%', right: '35%', animationDelay: '0.2s' }} />
        <FaMicroscope size={32} className="absolute text-white/10 float-slower" style={{ top: '55%', left: '30%', animationDelay: '0.8s' }} />
        <FaGlasses size={38} className="absolute text-white/10 drift" style={{ top: '65%', right: '22%', animationDelay: '1.2s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 items-center">
            
            {/* Left Side - Photo */}
            <div className={`order-1 lg:order-2 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="flex justify-center lg:justify-start xl:justify-center 2xl:justify-start">
                <div className="relative w-full max-w-[12rem] sm:max-w-[16rem] lg:max-w-[20rem] xl:max-w-[22rem] 2xl:max-w-[24rem]">
                  {/* Photo with Creative Frame */}
                  <div className="relative">
                    {/* Image Container */}
                   
                      {/* Creative layered borders */}
                      <div className="pointer-events-none absolute -inset-1 rounded-2xl border border-white/20"></div>
                      <div className="pointer-events-none absolute -inset-3 rounded-3xl border-2 border-white/20 border-dashed rotate-slow"></div>
                      <div className="pointer-events-none absolute -inset-0 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.12)]"></div>
                      <div className="pointer-events-none absolute -top-2 -left-2 w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-md"></div>
                      <div className="pointer-events-none absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-tr from-white/15 to-transparent blur-md"></div>
                      <img
                        src={mr}
                        alt="مستر أحمد السعيد - مدرس في الكيمياء"
                        className="w-full h-full object-cover transform hover:scale-105 transition-all duration-700 relative z-10"
                      />
                    </div>
                </div>
              </div>
            </div>

            {/* Right Side - Text Content */}
            <div className={`order-2 lg:order-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="space-y-4 lg:space-y-6 xl:space-y-8 2xl:space-y-10 text-right flex flex-col items-start">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-4 lg:py-2 xl:px-5 xl:py-2.5 2xl:px-6 2xl:py-3 bg-gradient-to-r from-[#5b2233]/90 to-[#5b2233]/70 backdrop-blur-md text-white rounded-full text-xs lg:text-sm xl:text-base 2xl:text-lg font-semibold border border-[#5b2233]/30 shadow-xl">
                  <span> منصّة المختبر</span>
                </div>

                {/* Main Heading */}
                <div className="space-y-2 lg:space-y-3 xl:space-y-4 2xl:space-y-6">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl 3xl:text-7xl font-bold leading-tight text-right">
                    <span className="block text-white drop-shadow-2xl">تعلّم مع دكتور</span>
                    <span className="block bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent drop-shadow-2xl">
                      أحمد السعيد
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl 3xl:text-3xl text-white/95 font-medium drop-shadow-lg text-right">
                    أستاذ الكيمياء، معاك خطوة بخطوة
                  </p>
                </div>
                {/* Enhanced CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 xl:gap-6 2xl:gap-8 pt-3 lg:pt-5 xl:pt-6 2xl:pt-8 justify-end w-full sm:w-auto">
                  {user?.fullName ? (
                    <a
                      href="/courses"
                      className="group inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 xl:px-9 xl:py-5 2xl:px-10 2xl:py-6 bg-gradient-to-r from-[#5b2233] to-[#7a2d43] hover:from-[#7a2d43] hover:to-[#5b2233] text-white rounded-2xl font-bold text-base lg:text-lg xl:text-xl 2xl:text-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-white/30 hover:border-white/50"
                    >
                      <span>ابدأ الحين</span>
                      <FaArrowRight className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  ) : (
                    <a
                      href="/signup"
                      className="group inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 xl:px-9 xl:py-5 2xl:px-10 2xl:py-6 bg-gradient-to-r from-[#5b2233] to-[#7a2d43] hover:from-[#7a2d43] hover:to-[#5b2233] text-white rounded-2xl font-bold text-base lg:text-lg xl:text-xl 2xl:text-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-white/30 hover:border-white/50"
                    >
                      <span>سجّل الحين مجانًا</span>
                      <FaArrowRight className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimatedHero; 
 
/* Scoped animations for floating icons */
const styles = `
@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes driftSlow {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(8px, -8px) rotate(3deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}
.rotate-slow { animation: spin 20s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.float-slow { animation: floatY 6s ease-in-out infinite; }
.float-slower { animation: floatY 9s ease-in-out infinite; }
.drift { animation: driftSlow 12s ease-in-out infinite; }
`;

// Inject styles once
if (typeof document !== 'undefined' && !document.getElementById('animated-hero-float-styles')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'animated-hero-float-styles';
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}