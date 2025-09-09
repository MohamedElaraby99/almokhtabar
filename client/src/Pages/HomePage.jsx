import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout/Layout";
import heroPng from "../assets/images/hero.png";
import { getAllBlogs } from "../Redux/Slices/BlogSlice";
import { getFeaturedSubjects } from "../Redux/Slices/SubjectSlice";
import { getFeaturedCourses } from "../Redux/Slices/CourseSlice";
import { generateImageUrl } from "../utils/fileUtils";
import AnimatedHero from "../Components/AnimatedHero";
import fikraLogo from "../assets/Asset 2@3x.png";
import logo from "../assets/logo.png";
// Lazy load components
const FAQAccordion = lazy(() => import("../Components/FAQAccordion"));
const SubjectCard = lazy(() => import("../Components/SubjectCard"));
const InstructorSection = lazy(() => import("../Components/InstructorSection"));
const NewsletterSection = lazy(() => import("../Components/NewsletterSection"));


import { 
  FaEye, 
  FaHeart, 
  FaCalendar, 
  FaUser, 
  FaArrowRight, 
  FaPlay, 
  FaStar, 
  FaUsers, 
  FaGraduationCap,
  FaRocket,
  FaLightbulb,
  FaShieldAlt,
  FaGlobe,
  FaCode,
  FaPalette,
  FaChartLine,
  FaBookOpen,
  FaAward,
  FaClock,
  FaCheckCircle,
  FaQuestionCircle,
  FaArrowUp,
  FaMobile,
  FaDownload,
  FaPhone,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaComments
} from "react-icons/fa";
import { placeholderImages } from "../utils/placeholderImages";
// Using a public URL for now - replace with your actual image URL
const fikraCharacter = "/fikra_character-removebg-preview.png";
import basicPlan from "../assets/basicPlan.png";
import premiumPlan from "../assets/premiumPlan.png";



export default function HomePage() {
  const dispatch = useDispatch();
  const { blogs } = useSelector((state) => state.blog);
  const { featuredSubjects } = useSelector((state) => state.subject);
  const { courses, featuredCourses, featuredLoading } = useSelector((state) => state.course);

  const { role } = useSelector((state) => state.auth);
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Hero entrance animation state
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    // Progressive loading - fetch data in sequence for better performance
    const loadData = async () => {
      // First, fetch essential data (subjects and courses)
      await Promise.all([
        dispatch(getFeaturedSubjects()),
        dispatch(getFeaturedCourses())
      ]);
      
      // Then fetch blogs after a short delay for better perceived performance
      setTimeout(() => {
        dispatch(getAllBlogs({ page: 1, limit: 3 }));
      }, 500);
    };

    loadData();
    
    // Trigger animations
    setIsVisible(true);

    // Hero entrance animation
    const timer = setTimeout(() => {
      setHeroVisible(true);
      setTimeout(() => {
        setHeroLoaded(true);
      }, 300);
    }, 100);

    // Add scroll event listener
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setShowScrollTop(scrolled > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [dispatch]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Get Started Handler
  const onGetStarted = () => {
    // Navigate to signup page
    window.location.href = '/signup';
  };

  // APK Download Handler
  const handleAPKDownload = () => {
    // Create a download link for the APK file
    const link = document.createElement('a');
    link.href = '/downloads/Almoktabar.apk'; // Update this path to your APK file location
    link.download = 'Almoktabar.apk';
    link.target = '_blank';
    
    // Fallback for mobile browsers
    if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
      // For Android devices, open the download directly
      window.open('/downloads/Almoktabar.apk', '_blank');
    } else {
      // For other devices, trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Show download started message
    if (window.toast) {
      window.toast.success('بدأ تحميل التطبيق...');
    }
  };

  // Google Play Store redirect (for future when app is published)
  const handlePlayStoreRedirect = () => {
    // Replace with your actual Google Play Store URL when published
    // Show a "Coming Soon" message instead of redirecting
    if (window.toast) {
      window.toast.info('قريباً على Google Play!');
    } else {
      alert('قريباً على Google Play!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = [
    { icon: FaUsers, number: "10K+", label: "طالب مسجل", color: "text-[#5b2233]" },
    { icon: FaGraduationCap, number: "100+", label: "مادة متاحة", color: "text-[#5b2233]" },
    { icon: FaStar, number: "4.9", label: "متوسط التقييم", color: "text-[#5b2233]" },
    { icon: FaAward, number: "50+", label: "مدرس مدرس", color: "text-[#5b2233]" }
  ];

  const features = [
    {
      icon: FaRocket,
      title: "تعلم بوتيرتك الخاصة",
      description: "جداول تعلم مرنة تناسب نمط حياتك والتزاماتك.",
      color: "text-[#5b2233]",
      bgColor: "bg-[#5b2233]/10 dark:bg-[#5b2233]/20"
    },
    {
      icon: FaLightbulb,
      title: "مواد بقيادة الخبراء",
      description: "تعلم من المحترفين في المجال مع سنوات من الخبرة العملية.",
      color: "text-[#5b2233]",
      bgColor: "bg-[#5b2233]/10 dark:bg-[#5b2233]/20"
    },
    {
      icon: FaShieldAlt,
      title: "التعلم المعتمد",
      description: "احصل على شهادات معترف بها من أفضل الشركات في العالم.",
      color: "text-[#5b2233]",
      bgColor: "bg-[#5b2233]/10 dark:bg-[#5b2233]/20"
    },
    {
      icon: FaGlobe,
      title: "المجتمع العالمي",
      description: "تواصل مع المتعلمين من جميع أنحاء العالم وشارك الخبرات.",
      color: "text-[#5b2233]",
      bgColor: "bg-[#5b2233]/10 dark:bg-[#5b2233]/20"
    }
  ];

  const categories = [
    { icon: FaCode, name: "البرمجة", count: "150+ دورة", color: "bg-[#5b2233]" },
    { icon: FaPalette, name: "التصميم", count: "120+ دورة", color: "bg-[#5b2233]" },
    { icon: FaChartLine, name: "الأعمال", count: "200+ دورة", color: "bg-[#5b2233]" },
    { icon: FaBookOpen, name: "التسويق", count: "180+ دورة", color: "bg-[#5b2233]" }
  ];

  return (
    <Layout>
      {/* Hero Section - Clean & Modern RTL */}
      <div className={`transition-all duration-1000 ease-out ${
        heroVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}>
        <AnimatedHero onGetStarted={onGetStarted} />
      </div>


       {/* Paths Section: Choose Your Plan */}
       <section className={`py-20 bg-gray-50 dark:bg-gray-900 transition-all duration-700 ease-out ${
        heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} dir="rtl" style={{ transitionDelay: '500ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-14 transition-all duration-700 ease-out ${
            heroLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`} style={{ transitionDelay: '650ms' }}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              اختَر مسارك
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              مسار تعليمي يناسب احتياجاتك، مع إمكانية الترقية في أي وقت
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Path 1: Standard Access */}
            <div className={`relative rounded-2xl p-8 bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/60 shadow-lg transition-all duration-500 overflow-hidden group ${
              heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            } hover:shadow-2xl hover:-translate-y-1 hover:rotate-[0.25deg]`} style={{ transitionDelay: '800ms' }}>
              {/* Decorative glow blobs */}
              <div className="pointer-events-none absolute -top-16 -left-16 w-40 h-40 rounded-full bg-[#5b2233]/10 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
              <div className="pointer-events-none absolute -bottom-24 -right-20 w-56 h-56 rounded-full bg-[#361927]/10 blur-3xl group-hover:scale-110 transition-transform duration-700 delay-150"></div>

              {/* Shine on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -inset-x-10 -top-24 h-40 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>

              <div className="absolute -top-0 -right-1 px-2 py-1 rounded-full text-xs font-semibold bg-[#5b2233] text-white">
                المسار الأساسي
              </div>
              <img
                src={basicPlan}
                alt="المختبر"
                className="absolute -left-0 bottom-2 h-36 md:h-44 pointer-events-none select-none"
                loading="lazy"
              />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-right">
                محتوى كامل للتعلّم الذاتي
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-right">
                احصل على وصول إلى جميع الفيديوهات، نماذج الامتحانات، ملفات الـPDF، والتدريبات التفاعلية.
              </p>
              <ul className="space-y-2 mb-8 text-right">
                <li className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-200">
                  <FaCheckCircle className="text-[#5b2233]" />
                  <span>فيديوهات دراسية مرتبة بحسب المنهج</span>
                </li>
                <li className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-200">
                  <FaCheckCircle className="text-[#5b2233]" />
                  <span>امتحانات تفاعلية مع تصحيح فوري</span>
                </li>
                <li className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-200">
                  <FaCheckCircle className="text-[#5b2233]" />
                  <span>ملفات PDF وملخصات</span>
                </li>
                <li className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-200">
                  <FaCheckCircle className="text-[#5b2233]" />
                  <span>تدريبات وأسئلة متدرجة المستوى</span>
                </li>
              </ul>
              {/* subtle gradient separator */}
              <div className="h-px bg-gradient-to-l from-transparent via-[#5b2233]/30 to-transparent mb-6"></div>
              <div className="flex justify-start">
                <a href="/plans/basic" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#5b2233] to-[#7a2d43] hover:from-[#7a2d43] hover:to-[#5b2233] transition-all">
                  ابدأ هذا المسار
                </a>
              </div>
            </div>

            {/* Path 2: Premium with Private Sessions */}
            <div className={`relative rounded-2xl p-8 bg-white dark:bg-gray-800 border border-[#5b2233]/40 shadow-xl transition-all duration-500 overflow-hidden group ${
              heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            } hover:shadow-2xl hover:-translate-y-1 hover:-rotate-[0.25deg]`} style={{ transitionDelay: '900ms' }}>
              {/* Decorative glow blobs */}
              <div className="pointer-events-none absolute -top-16 -right-12 w-48 h-48 rounded-full bg-yellow-400/10 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
              <div className="pointer-events-none absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-[#5b2233]/10 blur-3xl group-hover:scale-110 transition-transform duration-700 delay-150"></div>

              {/* #361927  bg on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -inset-x-10 -top-24 h-40 -rotate-12 bg-gradient-to-r from-transparent via-[#361927]/20 to-transparent"></div>
              </div>

              <div className="absolute -top-0 -right-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow-md flex items-center gap-1">
                <FaStar className="w-3 h-3" />
                <span>المُوصى به</span>
              </div>
              <img
                src={premiumPlan}
                alt="المختبر"
                className="absolute -left-1 bottom-2 h-36 md:h-44 pointer-events-none select-none"
                loading="lazy"
              />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-right">
                كل شيء + جلسات خاصة مع الدكتور
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-right">
                استمتع بجميع مزايا المحتوى، بالإضافة إلى جلسات أونلاين خاصة ومتابعة مباشرة مع الدكتور.
              </p>
              <ul className="space-y-2 mb-20 text-right">
                <li className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-200">
                  <FaCheckCircle className="text-[#5b2233]" />
                  <span>كل ما في المسار الأساسي</span>
                </li>
                <li className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-200">
                  <FaCheckCircle className="text-[#5b2233]" />
                  <span>جلسات خاصة فردية أونلاين</span>
                </li>
                <li className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-200">
                  <FaCheckCircle className="text-[#5b2233]" />
                  <span>متابعة أسبوعية وتقييم للأداء</span>
                </li>
                <li className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-200">
                  <FaCheckCircle className="text-[#5b2233]" />
                  <span>دعم سريع وإجابات مباشرة على أسئلتك</span>
                </li>
              </ul>
              {/* subtle gradient separator */}
              <div className="h-px bg-gradient-to-l from-transparent via-[#5b2233]/40 to-transparent mb-6"></div>
              <div className="flex justify-start gap-3">
                <a href="/plans/premium" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#5b2233] to-[#7a2d43] hover:from-[#7a2d43] hover:to-[#5b2233] transition-all">
                  اختر المسار المميز
                </a>
                <a href="/contact" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border border-white/40 dark:border-gray-600 text-[#5b2233] dark:text-white hover:bg-white/10 transition-all">
                اسأل عن الجلسات 
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className={`py-20 bg-white dark:bg-gray-800 transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`} 
      dir="rtl"
      style={{ transitionDelay: '2200ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '2400ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              المواد المتاحة
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف مجموعة واسعة من المواد التعليمية المميزة بقيادة خبراء الصناعة
            </p>
          </div>

          {featuredLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b2233] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل المواد المميزة...</p>
            </div>
          ) : featuredCourses && featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(() => {
                console.log('🎯 HomePage rendering featuredCourses from Redux state:', {
                  totalCourses: featuredCourses.length,
                  allCourses: featuredCourses.map(c => ({
                    id: c._id,
                    title: c.title,
                    stage: c.stage,
                    stageName: c.stage?.name,
                    hasStage: !!c.stage,
                    hasName: !!c.stage?.name
                  }))
                });
                return null;
              })()}
              {featuredCourses.slice(0, 6).map((course, index) => (
                <div
                  key={course._id}
                  className={`relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 ease-out group h-80 ${
                    heroLoaded 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: `${2600 + (index * 100)}ms`,
                    transitionProperty: 'opacity, transform, scale'
                  }}
                >
                  {/* Full Background Image */}
                  <div className="absolute inset-0">
                    {course.image?.secure_url ? (
                      <img
                        src={generateImageUrl(course.image.secure_url)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback gradient for missing/broken images */}
                    <div className={`w-full h-full bg-gradient-to-br from-[#5b2233] via-[#5b2233] to-[#5b2233] ${course.image?.secure_url ? 'hidden' : 'flex'} items-center justify-center`}>
                      <FaBookOpen className="text-8xl text-white opacity-40" />
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all duration-500"></div>

                  {/* Stage Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold rounded-full shadow-lg border border-white/20">
                      {(() => {
                        const stageName = course.stage?.name;
                        const fallback = 'غير محدد';
                        const result = stageName || fallback;
                        
                        console.log('🏷️ HomePage Stage Debug for course:', course.title, {
                          stage: course.stage,
                          stageName: stageName,
                          stageType: typeof course.stage,
                          hasStage: !!course.stage,
                          hasName: !!stageName,
                          finalResult: result,
                          willShowFallback: result === fallback
                        });
                        
                        if (result === fallback && course.stage) {
                          console.error('🚨 ISSUE: Stage exists but name is missing!', {
                            courseTitle: course.title,
                            stage: course.stage,
                            stageKeys: Object.keys(course.stage || {}),
                            stageName: course.stage?.name,
                            stageNameType: typeof course.stage?.name
                          });
                        }
                        
                        return result;
                      })()}
                    </span>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                    {/* Course Meta Info */}
                    <div className="mb-3 space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-4 text-white/80 text-sm">
                        <div className="flex items-center gap-1.5">
                          <FaUser className="w-3 h-3" />
                          <span className="font-medium">{course.instructor?.name || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FaPlay className="w-3 h-3" />
                          <span className="font-medium">
                            {(course.directLessons?.length || 0) + 
                             (course.units?.reduce((total, unit) => total + (unit.lessons?.length || 0), 0) || 0)} درس
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 leading-tight drop-shadow-lg">
                      {course.title}
                    </h3>

                    {/* Subject */}
                    <p className="text-white/80 text-sm mb-4 font-semibold tracking-wide">
                      {course.subject?.title || 'غير محدد'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                      <Link
                        to={`/courses/${course._id}`}
                        className="flex-1 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-center py-3.5 px-5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-white/30 hover:border-white/50 hover:scale-105 shadow-lg"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>شوف التفاصيل</span>
                      </Link>
                      <Link
                        to="/courses"
                        className="p-3.5 bg-[#5b2233]/90 backdrop-blur-md hover:bg-[#5b2233] text-white rounded-xl transition-all duration-300 flex items-center justify-center border border-[#5b2233]/50 hover:border-[#5b2233] hover:scale-105 shadow-lg"
                      >
                        <FaArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Hover Effect Indicator */}
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                    <div className="w-3 h-3 bg-[#5b2233] rounded-full animate-pulse shadow-lg"></div>
                  </div>

                  {/* Bottom gradient for better text readability */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-5"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد مواد متاحة حالياً
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                سيتم إضافة مواد جديدة قريباً!
              </p>
            </div>
          )}

          {/* View All Courses Button */}
          {featuredCourses && featuredCourses.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5b2233] via-[#5b2233] to-[#5b2233] hover:from-[#5b2233] hover:via-[#5b2233] hover:to-[#5b2233] text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span>عرض جميع المواد  </span>
                <FaArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Mobile App Download Section */}
      <section className="py-20 bg-gradient-to-br from-[#5b2233]/5 via-[#5b2233]/5 to-[#5b2233]/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
      
          <div className="items-center">
          
            {/* Phone Mockup Side */}
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="bg-gray-50 h-12 flex items-center justify-between px-6 text-sm">
                      <span className="font-medium">9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-2 bg-gray-900 rounded-sm"></div>
                        <div className="w-1 h-2 bg-gray-900 rounded-sm"></div>
                        <div className="w-6 h-2 bg-[#5b2233] rounded-sm"></div>
                      </div>
                    </div>
                    
                    {/* App Content Preview */}
                    <div className="p-6 space-y-6">
                      {/* App Header */}
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#5b2233] to-[#5b2233] rounded-xl flex items-center justify-center">
                          <img src={logo} alt="logo" className="w-12 h-12" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">منصة المختبر</h3>
                          <p className="text-sm text-gray-600">منصة التعلم الذكية</p>
                        </div>
                      </div>

                      {/* Course Cards Preview */}
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-[#5b2233]/10 to-[#5b2233]/10 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">الكيمياء</h4>
                            <span className="text-xs bg-[#5b2233]/10 text-[#5b2233] px-2 py-1 rounded-full">جديد</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3"> الكيمياء </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#5b2233] font-medium">30% مكتمل</span>
                            <button className="bg-[#5b2233] text-white px-4 py-1 rounded-full text-xs">متابعة</button>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-[#5b2233]/10 to-[#5b2233]/10 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">الكيمياء </h4>
                            <span className="text-xs bg-[#5b2233]/10 text-[#5b2233] px-2 py-1 rounded-full">شائع</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">  الكيمياء </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#5b2233] font-medium">75% مكتمل</span>
                            <button className="bg-[#5b2233] text-white px-4 py-1 rounded-full text-xs">متابعة</button>
                          </div>
                        </div>
                      </div>

                      {/* Features Preview */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">مميزات  المنصة</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FaCheckCircle className="text-[#5b2233] w-4 h-4 ml-2" />
                            <span className="text-sm text-gray-700">دروس تفاعلية</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCheckCircle className="text-[#5b2233] w-4 h-4 ml-2" />
                            <span className="text-sm text-gray-700">اختبارات ذكية</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCheckCircle className="text-[#5b2233] w-4 h-4 ml-2" />
                            <span className="text-sm text-gray-700">شهادات معتمدة</span>
                          </div>
                        </div>
                   
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-[#5b2233] to-[#5b2233] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <FaDownload className="text-white text-2xl" />
                </div>
                
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-[#5b2233] to-[#5b2233] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <FaMobile className="text-white text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - What You'll Find on the Platform */}
      <section className={`py-20 bg-white dark:bg-gray-800 transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`} 
      dir="rtl"
      style={{ transitionDelay: '400ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* blue Strip */}
          <div className="w-full h-2 bg-[#5b2233] mb-8"></div>
          
          {/* Section Header */}
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '600ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              إيه اللي هتلاقيه على المنصة؟
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Periodic Follow-up */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '800ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#5b2233] rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                متابعة دورية وتقييم مستمر
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                تقدمك بيتراجع أسبوعياً، وبنقدملك توصيات حسب احتياجك، ومتابعة أول بأول.
              </p>
            </div>

            {/* Feature 2 - Exam Models */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '900ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#5b2233] rounded-lg flex items-center justify-center">
                  <FaAward className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                نماذج امتحانات بنفس النظام
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                امتحانات تفاعلية بنفس شكل امتحانات الثانوية العامة، عشان تعيش جو الامتحان على المنصة.
              </p>
            </div>

            {/* Feature 3 - Simplified Explanation */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '1000ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#5b2233] rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                شرح مبسط ومركز
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                شرح النظريات والمفاهيم زي ما بتفهمها في حياتك اليومية، بعيد عن التعقيد الأكاديمي.
              </p>
            </div>

            {/* Feature 4 - Focused Review Videos */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '1100ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#5b2233] rounded-lg flex items-center justify-center">
                  <FaClock className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                فيديوهات مراجعة مركزة ليالي الامتحان
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                فيديوهات مراجعة قصيرة مركزة على أهم النقاط اللي محتاج تذاكرها قبل ما تدخل قاعة الامتحان.
              </p>
            </div>

            {/* Feature 5 - Direct Interaction */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '1200ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#5b2233] rounded-lg flex items-center justify-center">
                  <FaComments className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                تفاعل مباشر مع المدرسين
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                أي استفسار أو نقطة مش واضحة تسأل عنها وإحنا هنرد عليها بشكل فوري، وكده مش هتحس إنك لوحدك.
              </p>
            </div>

            {/* Feature 6 - Organized Study Plan */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '1300ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#5b2233] rounded-lg flex items-center justify-center">
                  <FaGraduationCap className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                خطة مذاكرة منظمة
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                المنصة بتديك جدول مذاكرة جاهز حسب وقتك ومستواك، عشان تذاكر بتركيز وراحة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Subjects Section */}
      {/* <section className={`py-20 bg-gray-50 dark:bg-gray-900 transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`} 
      dir="rtl"
      style={{ transitionDelay: '1400ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '1600ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              المواد الدراسية
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف موادنا الأكثر شعبية وأعلى تقييماً
            </p>
          </div>

          {featuredSubjects && featuredSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredSubjects.slice(0, 6).map((subject, index) => (
                <div 
                  key={subject._id} 
                  className={`transform hover:scale-105 transition-all duration-500 ease-out ${
                    heroLoaded 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: `${1800 + (index * 100)}ms`,
                    transitionProperty: 'opacity, transform, scale'
                  }}
                >
                  <Suspense fallback={
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  }>
                    <SubjectCard subject={subject} />
                  </Suspense>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد مواد مميزة بعد
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                عد قريباً لمواد رائعة!
              </p>
            </div>
          )}
        </div>
      </section> */}
      
      {/* Instructor Section */}
      {/* <Suspense fallback={
        <div className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }>
        <InstructorSection />
      </Suspense> */}
      {/* Latest Blogs Section */}
      <section className={`py-20 bg-gray-50 dark:bg-gray-900 transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`} 
      dir="rtl"
      style={{ transitionDelay: '3000ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '3200ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              أحدث الأخبار من مدونتنا
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف الأفكار والنصائح والقصص من مجتمع التعلم لدينا
            </p>
          </div>

          {blogs && blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.slice(0, 3).map((blog, index) => (
                <div 
                  key={blog._id} 
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-2 ${
                    heroLoaded 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: `${3400 + (index * 100)}ms`,
                    transitionProperty: 'opacity, transform, scale'
                  }}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={generateImageUrl(blog.image?.secure_url)}
                      alt={blog.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = placeholderImages.blog;
                      }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <FaUser />
                        {blog.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendar />
                        {formatDate(blog.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 text-right">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-right">
                      {blog.excerpt || blog.content.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaEye />
                          {blog.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaHeart />
                          {blog.likes || 0}
                        </span>
                      </div>
                      
                      <Link
                        to={`/blog/${blog._id}`}
                        className="text-[#5b2233] hover:text-[#5b2233] dark:text-[#5b2233] dark:hover:text-[#5b2233] font-medium flex items-center gap-1 group"
                      >
                        اقرأ المزيد
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">📝</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد منشورات مدونة حتى الآن
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                تابعونا قريبا للحصول على محتوى مذهل!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Static FAQ Section */}
      <section className="py-16 px-4 lg:px-20 bg-gradient-to-br from-gray-50 to-[#5b2233]/5 dark:from-gray-900 dark:to-gray-800" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 text-right">
              الأسئلة الشائعة
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 text-right">
              كل ما تحتاج معرفته عن منصتنا
            </p>
          </div>
          <Suspense fallback={
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse text-right">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 mr-auto"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mr-auto"></div>
                </div>
              ))}
            </div>
          }>
            <FAQAccordion />
          </Suspense>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                تواصل معنا
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                لديك أسئلة؟ نحب أن نسمع منك. تواصل معنا من خلال أي من هذه القنوات. نحن هنا لمساعدتك!
              </p>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-[#5b2233]/10 dark:bg-[#5b2233]/20 rounded-full flex items-center justify-center mr-4">
                  <FaPhone className="text-[#5b2233] dark:text-[#5b2233] text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">الهاتف</h3>
                  <a href="tel:01023530513" className="text-[#5b2233] dark:text-[#5b2233] hover:underline">
                    01023530513
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-[#5b2233]/10 dark:bg-[#5b2233]/20 rounded-full flex items-center justify-center mr-4">
                  <FaWhatsapp className="text-[#5b2233] dark:text-[#5b2233] text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">واتساب</h3>
                  <a href="https://wa.me/+201023530513" className="text-[#5b2233] dark:text-[#5b2233] hover:underline">
                  +201023530513
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
                تابعنا
              </h3>
              <div className="flex flex-wrap justify-center gap-6 max-w-md mx-auto">
                <a
                  href="https://www.facebook.com/share/1BJhG243hw/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-[#5b2233] hover:scale-105"
                  title="Facebook"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaFacebook className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Facebook
                  </span>
                </a>
                <a
                  href="https://www.instagram.com/elsaied_0?igsh=bnpjMWl5d3lmOXA3&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-[#5b2233] hover:scale-105"
                  title="Instagram"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaInstagram className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Instagram
                  </span>
                </a>
                <a
                  href="https://wa.me/01023530513"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-green-500 hover:scale-105"
                  title="WhatsApp"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaWhatsapp className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    WhatsApp
                  </span>
                </a>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-[#5b2233]/10 to-[#5b2233]/10 dark:from-[#5b2233]/20 dark:to-[#5b2233]/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  لماذا تختار منصتنا؟
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#5b2233]/10 dark:bg-[#5b2233]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUser className="text-2xl text-[#5b2233] dark:text-[#5b2233]" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">دعم متخصص</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      دعم العملاء على مدار الساعة لمساعدتك في أي أسئلة
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#5b2233]/10 dark:bg-[#5b2233]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaGlobe className="text-2xl text-[#5b2233] dark:text-[#5b2233]" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">مجتمع عالمي</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      تواصل مع المتعلمين من جميع أنحاء العالم
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#5b2233]/10 dark:bg-[#5b2233]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaComments className="text-2xl text-[#5b2233] dark:text-[#5b2233]" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">استجابة سريعة</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      احصل على إجابات لأسئلتك خلال 24 ساعة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Partner Section */}
        <section className="py-16 bg-white dark:bg-gray-800" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              شركاؤنا
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              شريكنا التقني: 
              <a
                href="https://fikra.solutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#5b2233] hover:text-[#5b2233] dark:text-[#5b2233] dark:hover:text-[#5b2233]"
              >
                Fikra Software
              </a>
            </p>
          </div>
          <div className="flex items-center justify-center">
            <a href="https://fikra.solutions/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
              <img
                src={fikraLogo}
                alt="Fikra Software Logo"
                className="h-24 md:h-32 object-contain drop-shadow-lg hover:opacity-90 transition"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-[#5b2233] to-[#5b2233] hover:from-[#5b2233] hover:to-[#5b2233] text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="w-5 h-5 group-hover:animate-bounce" />
        </button>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/+201023530513"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed left-8 bottom-8 z-50 p-4 bg-[#5b2233] hover:bg-[#5b2233] text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group animate-bounce"
        aria-label="Contact us on WhatsApp"
        title="تواصل معنا على واتساب"
      >
        <FaWhatsapp className="w-6 h-6" />
      </a>
    </Layout>
  );
}
