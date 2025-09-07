import React, { useEffect, useState } from 'react';
import { FaArrowRight, FaPlay, FaStar, FaUsers, FaGraduationCap, FaAward, FaRocket, FaGlobe, FaFlask, FaAtom, FaMicroscope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import backgroundImg from '../assets/background.jpeg';
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
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden pb-[135px]"
      style={{ backgroundImage: `url(${backgroundImg})` }}
      dir="rtl"
    >   
      {/* Enhanced Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#5b2233]/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-tl from-[#5b2233]/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            
            {/* Left Side - Photo */}
            <div className={`order-1 lg:order-2 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="flex justify-center lg:justify-start">
                <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg">
                  {/* Photo with Creative Frame */}
                  <div className="relative">
                    {/* Image Container */}
                    <div className="relative rounded-full p-3 lg:p-4 border-2 border-white/30 shadow-2xl">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
                      <img
                        src={mr}
                        alt="مستر أحمد السيد - مدرس في الكيمياء"
                        className="w-full h-full rounded-full object-cover shadow-2xl transform hover:scale-105 transition-all duration-700 relative z-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Text Content */}
            <div className={`order-2 lg:order-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="space-y-6 lg:space-y-8 text-right flex flex-col items-start">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 lg:py-3 bg-gradient-to-r from-[#5b2233]/90 to-[#5b2233]/70 backdrop-blur-md text-white rounded-full text-sm lg:text-base font-semibold border border-[#5b2233]/30 shadow-xl">
                  <span> منصة المختبر!</span>
                </div>

                {/* Main Heading */}
                <div className="space-y-2 lg:space-y-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight text-right">
                    <span className="block text-white drop-shadow-2xl">تعلم مع مستر</span>
                    <span className="block bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent drop-shadow-2xl">
                      أحمد السيد
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/95 font-medium drop-shadow-lg text-right">
                    مدرس الكيمياء والعلوم المتكاملة
                  </p>
                </div>
                {/* Enhanced CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6 lg:pt-8 justify-end w-full sm:w-auto">
                  {user?.fullName ? (
                    <a
                      href="/courses"
                      className="group inline-flex items-center justify-center px-8 py-4 lg:px-10 lg:py-5 bg-gradient-to-r from-[#5b2233] to-[#7a2d43] hover:from-[#7a2d43] hover:to-[#5b2233] text-white rounded-2xl font-bold text-lg lg:text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-white/30 hover:border-white/50"
                    >
                      <span>ابدأ التعلم الآن</span>
                      <FaArrowRight className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  ) : (
                    <a
                      href="/signup"
                      className="group inline-flex items-center justify-center px-8 py-4 lg:px-10 lg:py-5 bg-gradient-to-r from-[#5b2233] to-[#7a2d43] hover:from-[#7a2d43] hover:to-[#5b2233] text-white rounded-2xl font-bold text-lg lg:text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-white/30 hover:border-white/50"
                    >
                      <span>سجل الآن مجاناً</span>
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