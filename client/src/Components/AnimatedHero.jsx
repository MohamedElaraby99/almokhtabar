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
    { icon: FaUsers, number: "5K+", label: "طلاب مسجلين", color: "text-blue-600" },
    { icon: FaFlask, number: "200+", label: "تجربة كيميائية", color: "text-green-600" },
    { icon: FaStar, number: "4.9", label: "متوسط التقييم", color: "text-blue-600" },
    { icon: FaAward, number: "15+", label: "سنوات خبرة", color: "text-purple-600" }
  ];

  const handleExploreCourses = () => {
    // Navigate to courses page
    window.location.href = '/courses';
  };

  return (
    <section
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImg})` }}
      dir="rtl"
    >   

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
            
            {/* Left Side - Photo */}
            <div className={`order-1 lg:order-2 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="flex justify-center lg:justify-start">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  {/* Photo with Creative Frame */}
                  <div className="relative">
                    {/* Image Container */}
                    <div className="relative rounded-full p-2 border border-white/20">
                      <img
                        src={mr}
                        alt="مستر أحمد السيد - مدرس في الكيمياء"
                        className="w-full h-full rounded-full object-cover shadow-2xl transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Floating Science Elements */}
                    <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-[#5b2233]/80 backdrop-blur-sm rounded-full p-2 sm:p-3 border border-white/20 animate-bounce">
                      <FaAtom className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 border border-white/20 animate-float">
                      <FaFlask className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="absolute top-1/2 -left-4 sm:-left-8 bg-[#5b2233]/60 backdrop-blur-sm rounded-full p-1.5 sm:p-2 border border-white/20 animate-pulse">
                      <FaMicroscope className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Text Content */}
            <div className={`order-2 lg:order-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="space-y-4 sm:space-y-6 text-right flex flex-col items-end">
                {/* Badge */}
                <div className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/80 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium border border-white/20">
                  🧪
                  <span className="hidden sm:inline">تعلم الكيمياء بطريقة علمية وممتعة!</span>
                  <span className="sm:hidden">تعلم الكيمياء!</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight">
                  <span className="block text-white">تعلم مع مستر</span>
                  <span className="block bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent">
                    أحمد السيد
                  </span>
                  <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white/90 mt-1 sm:mt-2">
                    مدرس الكيمياء والعلوم المتكاملة
                  </span>
                </h1>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 justify-end w-full sm:w-auto">
                  {user?.fullName ? (
                    <a
                      href="/courses"
                      className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-[#5b2233] to-[#7a2d43] hover:from-[#7a2d43] hover:to-[#5b2233] text-white rounded-xl font-bold text-base sm:text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20"
                    >
                      ابدأ التعلم الآن
                    </a>
                  ) : (
                    <a
                      href="/signup"
                      className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-[#5b2233] to-[#7a2d43] hover:from-[#7a2d43] hover:to-[#5b2233] text-white rounded-xl font-bold text-base sm:text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20"
                    >
                      سجل الآن مجاناً
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