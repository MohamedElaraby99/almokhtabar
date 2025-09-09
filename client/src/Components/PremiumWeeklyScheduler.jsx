import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../Helpers/axiosInstance';

export default function PremiumWeeklyScheduler() {
  const [slots, setSlots] = useState(() => {
    try {
      const saved = localStorage.getItem('premiumWeeklySchedule');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [newSlot, setNewSlot] = useState({ dayOfWeek: '', startTime: '', duration: 60 });
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Persist locally for convenience
    localStorage.setItem('premiumWeeklySchedule', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    // Load existing schedule from backend
    (async () => {
      try {
        const res = await axiosInstance.get('/live-schedules/me', { withCredentials: true });
        if (res.data?.success && res.data?.data) {
          const sched = res.data.data;
          setStatus(sched.status || '');
          if (Array.isArray(sched.slots) && sched.slots.length > 0) {
            setSlots(sched.slots.map(s => ({
              dayOfWeek: String(s.dayOfWeek),
              startTime: s.startTime,
              duration: Number(s.duration) || 60
            })));
          }
        }
      } catch (e) {
        // ignore if no schedule yet
      }
    })();
  }, []);

  const addSlot = () => {
    if (newSlot.dayOfWeek === '' || !newSlot.startTime || !newSlot.duration) return;
    const t = newSlot.startTime;
    if (t < '10:00' || t > '22:00') {
      toast.error('الوقت يجب أن يكون بين 10:00 صباحاً و 10:00 مساءً');
      return;
    }
    const uniqueByDay = new Set(slots.map(s => String(s.dayOfWeek)));
    const newDay = String(newSlot.dayOfWeek);
    const willHaveDays = uniqueByDay.has(newDay) ? uniqueByDay.size : uniqueByDay.size + 1;
    if (willHaveDays > 3) {
      toast.error('اختار يومين أو ثلاثة فقط في الأسبوع');
      return;
    }
    const timeToMin = (val) => {
      const [h, m] = (val || '00:00').split(':').map(Number);
      return (h * 60) + (m || 0);
    };
    const newStart = timeToMin(newSlot.startTime);
    const newEnd = newStart + parseInt(newSlot.duration, 10);
    const overlap = slots.some(s => {
      if (String(s.dayOfWeek) !== newDay) return false;
      const sStart = timeToMin(s.startTime);
      const sEnd = sStart + parseInt(s.duration, 10);
      return Math.max(sStart, newStart) < Math.min(sEnd, newEnd);
    });
    if (overlap) {
      toast.error('يوجد تعارض مع موعد آخر في نفس اليوم');
      return;
    }
    setSlots(prev => [...prev, { ...newSlot, duration: parseInt(newSlot.duration) }]);
    setNewSlot({ dayOfWeek: '', startTime: '', duration: 60 });
  };

  const removeSlot = (idx) => {
    setSlots(prev => prev.filter((_, i) => i !== idx));
  };

  const saveSchedule = async () => {
    if (slots.length < 2 || slots.length > 3) {
      toast.error('يجب اختيار يومين أو ثلاثة أيام');
      return;
    }
    try {
      const payload = { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, slots };
      const res = await axiosInstance.put('/live-schedules/me', payload, { withCredentials: true });
      if (res.data?.success) {
        toast.success('تم إرسال الجدول للمراجعة (قيد الانتظار)');
        setStatus('pending');
      } else {
        toast.error('تعذر حفظ الجدول');
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'خطأ أثناء حفظ الجدول');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">إعداد جدولك الأسبوعي للجلسات المميزة</h2>
        {status && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${status === 'approved' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'}`}>
            {status === 'approved' ? 'موافق عليه' : status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">اختر يومين أو ثلاثة فقط في الأسبوع. سنراجع الجدول ونتأكد من توفر المواعيد.</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">اليوم</label>
          <select
            value={newSlot.dayOfWeek}
            onChange={e => setNewSlot({ ...newSlot, dayOfWeek: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">اختر اليوم</option>
            <option value="6">السبت</option>
            <option value="0">الأحد</option>
            <option value="1">الاثنين</option>
            <option value="2">الثلاثاء</option>
            <option value="3">الأربعاء</option>
            <option value="4">الخميس</option>
            <option value="5">الجمعة</option>
          </select>
        </div>
        <div>
            <div className='flex items-center gap-2'>   
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">الوقت</label>
          {newSlot.dayOfWeek !== '' && newSlot.startTime && (
            (() => {
              const timeToMin = (val) => {
                const [h, m] = (val || '00:00').split(':').map(Number);
                return (h * 60) + (m || 0);
              };
              const newStart = timeToMin(newSlot.startTime);
              const newEnd = newStart + parseInt(newSlot.duration || 60, 10);
              const conflict = slots.some(s => {
                if (String(s.dayOfWeek) !== String(newSlot.dayOfWeek)) return false;
                const sStart = timeToMin(s.startTime);
                const sEnd = sStart + parseInt(s.duration, 10);
                return Math.max(sStart, newStart) < Math.min(sEnd, newEnd);
              });
              return (
                <div className={`rounded-full px-2 py-1 text-xs ${conflict ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                  {conflict ? 'غير متاح (تعارض في نفس اليوم والوقت)' : 'متاح'}
                </div>
              );
            })()
          )}
            </div>
          <input
            type="time"
            min="10:00"
            max="22:00"
            step="900"
            value={newSlot.startTime}
            onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">المدة</label>
          <select
            value={newSlot.duration}
            onChange={e => setNewSlot({ ...newSlot, duration: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={60}>ساعة</option>
            <option value={90}>ساعة ونصف</option>
            <option value={120}>ساعتان</option>
          </select>
        </div>
        <div className="flex items-end gap-3">
          <button onClick={addSlot} className="px-4 py-2 rounded-lg bg-[#5b2233] text-white hover:opacity-90">إضافة موعد</button>
          <button onClick={saveSchedule} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">حفظ الجدول</button>
        </div>
      </div>
      <div className="mt-6">
        {slots.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">لم تضف أي مواعيد بعد.</p>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {slots.map((s, idx) => {
              const dayNames = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
              const dayLabel = dayNames[parseInt(s.dayOfWeek)];
              const timeLabel = (() => {
                const [hh, mm] = (s.startTime || '00:00').split(':').map(Number);
                const period = hh >= 12 ? 'PM' : 'AM';
                const hour12 = ((hh % 12) || 12).toString().padStart(2, '0');
                const mins = (mm || 0).toString().padStart(2, '0');
                return `${hour12}:${mins}  ${period}`;
              })();
              const durationLabel = `${s.duration} دقيقة`;
              return (
                <div key={idx} className="flex items-center justify-between py-3">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{dayLabel}</span>
                    <span className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">الوقت: {timeLabel}</span>
                    <span className="px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">المدة: {durationLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}


