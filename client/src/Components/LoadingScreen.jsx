import React from 'react';
import logo from '../assets/logo.png';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#5b2233] via-[#7a2d43] to-[#5b2233] overflow-hidden" dir="rtl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Circles */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-white/15 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-white/8 rounded-full animate-pulse"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-white/5 to-transparent rounded-full blur-3xl animate-bounce"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Logo Container */}
        <div className="relative">
          {/* Glowing Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-full blur-2xl opacity-60 animate-pulse"></div>
          
          {/* Logo Container */}
          <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-8 shadow-2xl border-4 border-white/20 transform hover:scale-110 transition-all duration-500">
            <img 
              src={logo} 
              alt="منصة المختبر Logo" 
              className="w-20 h-20 object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Floating Decorative Elements */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/30 rounded-full animate-bounce z-10 shadow-lg"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white/20 rounded-full animate-pulse z-10 shadow-lg"></div>
        </div>

        {/* App Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white bg-gradient-to-r from-white via-white/90 to-white bg-clip-text text-transparent drop-shadow-lg">
            منصة المختبر
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-medium">
            منصة التعليم الإلكتروني المتطورة
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex flex-col items-center space-y-6">
          {/* Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-white/40 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          
          {/* Loading Text */}
          <div className="text-center space-y-2">
            <p className="text-white/90 text-lg font-medium animate-pulse">
              جاري التحميل...
            </p>
            <div className="flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-white/40 via-white to-white/40 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 text-white/60 text-sm">
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
          <span>© 2025 منصة المختبر</span>
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
