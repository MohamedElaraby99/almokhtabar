import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllLiveMeetings,
  createLiveMeeting,
  updateLiveMeeting,
  deleteLiveMeeting,
  addAttendees,
  removeAttendee,
  getLiveMeetingStats
} from '../../Redux/Slices/LiveMeetingSlice';
import { getAllUsers } from '../../Redux/Slices/AdminUserSlice';
import { getAllInstructors } from '../../Redux/Slices/InstructorSlice';
import { getAllStages } from '../../Redux/Slices/StageSlice';
import { getAllSubjects } from '../../Redux/Slices/SubjectSlice';
import Layout from '../../Layout/Layout';
import { axiosInstance } from '../../Helpers/axiosInstance';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaUsers,
  FaVideo,
  FaCalendarAlt,
  FaClock,
  FaChalkboardTeacher,
  FaBookOpen,
  FaGraduationCap,
  FaSearch,
  FaFilter,
  FaExternalLinkAlt,
  FaUserPlus,
  FaUserMinus,
  FaPlay,
  FaStop,
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const LiveMeetingDashboard = () => {
  const dispatch = useDispatch();
  const { liveMeetings, loading, stats, pagination } = useSelector(state => state.liveMeeting);
  const { users } = useSelector(state => state.adminUser);
  const { instructors } = useSelector(state => state.instructor);
  const { stages } = useSelector(state => state.stage);
  const { subjects } = useSelector(state => state.subject);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const formatTo12h = (hhmm) => {
    if (!hhmm || typeof hhmm !== 'string' || !hhmm.includes(':')) return hhmm || '';
    const [hStr, mStr] = hhmm.split(':');
    let hours = parseInt(hStr, 10);
    if (Number.isNaN(hours)) return hhmm;
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${mStr} ${suffix}`;
  };

  const getNextDateForDayTime = (dayOfWeek, hhmm) => {
    try {
      const [h, m] = hhmm.split(':').map(n => parseInt(n, 10));
      if (Number.isNaN(h) || Number.isNaN(m)) return '';
      const now = new Date();
      const result = new Date(now);
      const currentDow = result.getDay(); // 0=Sunday
      let diff = dayOfWeek - currentDow;
      if (diff < 0 || (diff === 0 && (result.getHours() > h || (result.getHours() === h && result.getMinutes() >= m)))) {
        diff += 7;
      }
      result.setDate(result.getDate() + diff);
      result.setHours(h, m, 0, 0);
      // Return ISO local without seconds for datetime-local input
      const pad = (n) => String(n).padStart(2, '0');
      return `${result.getFullYear()}-${pad(result.getMonth() + 1)}-${pad(result.getDate())}T${pad(result.getHours())}:${pad(result.getMinutes())}`;
    } catch {
      return '';
    }
  };

  // Weekly schedules (premium users) admin review
  const [schedules, setSchedules] = useState([]); // list panel (filterable)
  const [approvedSchedules, setApprovedSchedules] = useState([]); // always-approved for weekly overview
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('pending');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    googleMeetLink: '',
    scheduledDate: '',
    duration: 60,
    instructor: '',
    stage: '',
    subject: '',
    attendees: [],
    isRecorded: false,
    tags: ''
  });

  const [attendeesFormData, setAttendeesFormData] = useState({
    selectedUsers: []
  });

  // Create modal: use approved schedules to prefill date/time and attendee from student's weekly schedule
  const approvedSchedulesForCreate = schedules.filter(s => s.status === 'approved');
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [selectedScheduleSlotIdxs, setSelectedScheduleSlotIdxs] = useState([]);
  const [selectedSlotsMeta, setSelectedSlotsMeta] = useState({});

  const isAnySelectedSlotMissingMeta = () => {
    if (!selectedScheduleId || selectedScheduleSlotIdxs.length === 0) return false;
    for (const idxStr of selectedScheduleSlotIdxs) {
      const meta = selectedSlotsMeta[idxStr];
      if (!meta || !meta.link || !meta.description) return true;
    }
    return false;
  };

  // Search and filter states for attendees modal
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [attendeeStageFilter, setAttendeeStageFilter] = useState('');
  const [showStudentsOnly, setShowStudentsOnly] = useState(true);

  useEffect(() => {
    console.log('🔍 useEffect triggered - fetching data...');
    dispatch(getAllLiveMeetings({ page: currentPage, limit: 10, status: statusFilter, stage: stageFilter, subject: subjectFilter }));
    dispatch(getLiveMeetingStats());
    dispatch(getAllUsers({ limit: 1000 }));
    dispatch(getAllInstructors());
    dispatch(getAllStages());
    dispatch(getAllSubjects());
  }, [dispatch, currentPage, statusFilter, stageFilter, subjectFilter]);

  const fetchSchedules = async (status) => {
    try {
      setSchedulesLoading(true);
      const params = status ? { status } : {};
      const res = await axiosInstance.get('/live-schedules', { params, withCredentials: true });
      const list = res.data?.data || res.data?.liveSchedules || [];
      setSchedules(list);
    } catch (e) {
      console.error('فشل تحميل جداول الجلسات:', e);
      toast.error('تعذر تحميل جداول الجلسات');
    } finally {
      setSchedulesLoading(false);
    }
  };

  const fetchApprovedSchedules = async () => {
    try {
      const res = await axiosInstance.get('/live-schedules', { params: { status: 'approved' }, withCredentials: true });
      const list = res.data?.data || res.data?.liveSchedules || [];
      setApprovedSchedules(list);
    } catch (e) {
      console.error('فشل تحميل الجداول المعتمدة:', e);
    }
  };

  useEffect(() => {
    fetchSchedules(scheduleStatusFilter);
  }, [scheduleStatusFilter]);

  useEffect(() => {
    fetchApprovedSchedules();
  }, []);

  useEffect(() => {
    // keep per-slot meta in sync with selected indexes
    setSelectedSlotsMeta(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (!selectedScheduleSlotIdxs.includes(k)) delete next[k]; });
      selectedScheduleSlotIdxs.forEach(k => { if (!next[k]) next[k] = { link: '', description: '' }; });
      return next;
    });
  }, [selectedScheduleSlotIdxs]);

  const approveSchedule = async (scheduleId) => {
    try {
      await axiosInstance.patch(`/live-schedules/${scheduleId}/status`, { status: 'approved' }, { withCredentials: true });
      toast.success('تمت الموافقة على الجدول');
      await fetchSchedules(scheduleStatusFilter);
      await fetchApprovedSchedules();
    } catch (e) {
      console.error('خطأ في الموافقة على الجدول:', e);
      toast.error('تعذر الموافقة على الجدول');
    }
  };

  const rejectSchedule = async (scheduleId) => {
    const adminNote = window.prompt('أدخل سبب الرفض (اختياري):') || '';
    try {
      await axiosInstance.patch(`/live-schedules/${scheduleId}/status`, { status: 'rejected', adminNote }, { withCredentials: true });
      toast.success('تم رفض الجدول');
      await fetchSchedules(scheduleStatusFilter);
      await fetchApprovedSchedules();
    } catch (e) {
      console.error('خطأ في رفض الجدول:', e);
      toast.error('تعذر رفض الجدول');
    }
  };

  const deleteSchedule = async (scheduleId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الجدول؟ سيتم اعتباره مرفوضاً.')) return;
    try {
      await axiosInstance.patch(`/live-schedules/${scheduleId}/status`, { status: 'rejected', adminNote: 'حذف بواسطة المدير' }, { withCredentials: true });
      toast.success('تم حذف الجدول');
      await fetchSchedules(scheduleStatusFilter);
      await fetchApprovedSchedules();
    } catch (e) {
      console.error('خطأ في حذف الجدول:', e);
      toast.error('تعذر حذف الجدول');
    }
  };

  const editSchedule = async (schedule) => {
    const nextStatus = window.prompt('تغيير الحالة إلى (pending/approved/rejected):', schedule.status || 'approved');
    if (!nextStatus || !['pending','approved','rejected'].includes(nextStatus)) {
      toast.error('حالة غير صالحة');
      return;
    }
    const adminNote = window.prompt('ملاحظة المدير (اختياري):', schedule.adminNote || '') || '';
    try {
      await axiosInstance.patch(`/live-schedules/${schedule._id}/status`, { status: nextStatus, adminNote }, { withCredentials: true });
      toast.success('تم تحديث الجدول');
      await fetchSchedules(scheduleStatusFilter);
      await fetchApprovedSchedules();
    } catch (e) {
      console.error('خطأ في تعديل الجدول:', e);
      toast.error('تعذر تعديل الجدول');
    }
  };

  // Debug logging for state changes
  useEffect(() => {
    console.log('📊 Current Redux State:', {
      instructors: instructors?.length || 0,
      subjects: subjects?.length || 0,
      stages: stages?.length || 0,
      users: users?.length || 0
    });
  }, [instructors, subjects, stages, users]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      googleMeetLink: '',
      scheduledDate: '',
      duration: 60,
      instructor: '',
      stage: '',
      subject: '',
      attendees: [],
      isRecorded: false,
      tags: ''
    });
    setSelectedScheduleId('');
    setSelectedScheduleSlotIdxs([]);
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      // Basic required fields
      if (!formData.title || !formData.scheduledDate || !formData.duration || !formData.stage || !formData.subject) {
        toast.error('يرجى تعبئة العنوان والمرحلة والمادة والموعد والمدة');
        return;
      }
      // Link/description validation (single flow)
      if ((!selectedScheduleId || selectedScheduleSlotIdxs.length === 0)) {
        if (!formData.googleMeetLink || !/^https:\/\/meet\.google\.com\/[a-z0-9\-]+$/i.test(formData.googleMeetLink)) {
          toast.error('ضع رابط Google Meet صالح بالشكل https://meet.google.com/xxx-xxxx-xxx');
          return;
        }
        if (!formData.description) {
          toast.error('الوصف مطلوب');
          return;
        }
      }
      if (selectedScheduleId && selectedScheduleSlotIdxs.length > 0) {
        if (isAnySelectedSlotMissingMeta()) {
          toast.error('يرجى إدخال الرابط والوصف لكل موعد محدد');
          return;
        }
      }
      if (selectedScheduleId && selectedScheduleSlotIdxs.length > 0) {
        const schedule = approvedSchedulesForCreate.find(s => s._id === selectedScheduleId);
        if (!schedule) return;
        const uid = schedule.user?._id || schedule.user?.id;
        const created = [];
        for (const idxStr of selectedScheduleSlotIdxs) {
          const idx = parseInt(idxStr, 10);
          const slot = schedule.slots?.[idx];
          if (!slot) continue;
          const iso = getNextDateForDayTime(slot.dayOfWeek, slot.startTime);
          const meta = selectedSlotsMeta[idxStr] || { link: formData.googleMeetLink, description: formData.description };
          if (!meta.link || !meta.description) {
            toast.error('الرابط والوصف مطلوبان لكل موعد');
            continue;
          }
      const meetingData = {
        ...formData,
            googleMeetLink: meta.link || formData.googleMeetLink,
            description: meta.description || formData.description,
            scheduledDate: iso || formData.scheduledDate,
            duration: slot.duration,
            attendees: uid ? Array.from(new Set([...(formData.attendees || []), uid])) : (formData.attendees || []),
            tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
          };
          await dispatch(createLiveMeeting(meetingData)).unwrap();
          created.push(idx);
        }
        toast.success(`تم إنشاء ${created.length} اجتماع`);
        setShowCreateModal(false);
        resetForm();
        dispatch(getAllLiveMeetings({ page: currentPage, limit: 10 }));
        return;
      }

      const meetingData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      await dispatch(createLiveMeeting(meetingData)).unwrap();
      setShowCreateModal(false);
      resetForm();
      dispatch(getAllLiveMeetings({ page: currentPage, limit: 10 }));
    } catch (error) {
      console.error('خطأ في إنشاء الالجلسةالمباشر:', error);
    }
  };

  const handleEditMeeting = async (e) => {
    e.preventDefault();
    try {
      const meetingData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      console.log('🔍 Frontend - Data being sent to update meeting:', {
        meetingId: selectedMeeting._id,
        meetingData: meetingData,
        attendees: meetingData.attendees,
        attendeesType: typeof meetingData.attendees,
        isArray: Array.isArray(meetingData.attendees)
      });
      
      await dispatch(updateLiveMeeting({ meetingId: selectedMeeting._id, meetingData })).unwrap();
      setShowEditModal(false);
      setSelectedMeeting(null);
      resetForm();
      dispatch(getAllLiveMeetings({ page: currentPage, limit: 10 }));
    } catch (error) {
      console.error('خطأ في تحديث الجلسةالمباشر:', error);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الجلسةالمباشر؟')) {
      try {
        await dispatch(deleteLiveMeeting(meetingId)).unwrap();
        dispatch(getAllLiveMeetings({ page: currentPage, limit: 10 }));
      } catch (error) {
        console.error('خطأ في حذف الجلسةالمباشر:', error);
      }
    }
  };

  const openEditModal = (meeting) => {
    setSelectedMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description,
      googleMeetLink: meeting.googleMeetLink,
      scheduledDate: new Date(meeting.scheduledDate).toISOString().slice(0, 16),
      duration: meeting.duration,
      instructor: meeting.instructor?._id || '',
      stage: meeting.stage?._id || '',
      subject: meeting.subject?._id || '',
      attendees: meeting.attendees?.map(a => a.user._id) || [],
      maxAttendees: meeting.maxAttendees,
      isRecorded: meeting.isRecorded,
      tags: meeting.tags?.join(', ') || ''
    });
    setShowEditModal(true);
  };

  const openAttendeesModal = (meeting) => {
    setSelectedMeeting(meeting);
    setAttendeesFormData({
      selectedUsers: []
    });
    // Reset search and filters
    setAttendeeSearch('');
    setAttendeeStageFilter('');
    setShowStudentsOnly(true);
    setShowAttendeesModal(true);
  };

  const handleAddAttendees = async () => {
    if (attendeesFormData.selectedUsers.length === 0) {
      toast.error('يرجى اختيار المستخدمين أولاً');
      return;
    }

    console.log('Debug - Frontend addAttendees data:', {
      meetingId: selectedMeeting._id,
      attendees: attendeesFormData.selectedUsers,
      selectedUsersCount: attendeesFormData.selectedUsers.length,
      hasNullValues: attendeesFormData.selectedUsers.some(id => !id)
    });

    try {
      const result = await dispatch(addAttendees({
        meetingId: selectedMeeting._id,
        attendees: attendeesFormData.selectedUsers
      })).unwrap();
      
      console.log('Debug - Backend response:', result);
      
      setShowAttendeesModal(false);
      setAttendeesFormData({ selectedUsers: [] });
      dispatch(getAllLiveMeetings({ page: currentPage, limit: 10 }));
    } catch (error) {
      console.error('خطأ في إضافة الحضور:', error);
    }
  };

  const handleRemoveAttendee = async (attendeeId) => {
    if (window.confirm('هل أنت متأكد من إزالة هذا الحضور؟')) {
      try {
        await dispatch(removeAttendee({
          meetingId: selectedMeeting._id,
          attendeeId
        })).unwrap();
        dispatch(getAllLiveMeetings({ page: currentPage, limit: 10 }));
      } catch (error) {
        console.error('خطأ في إزالة الحضور:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'live': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'مجدول';
      case 'live': return 'مباشر';
      case 'completed': return 'انتهى';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const filteredMeetings = liveMeetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(search.toLowerCase()) ||
                         meeting.description.toLowerCase().includes(search.toLowerCase()) ||
                         meeting.instructor?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Filter users for attendee selection
  const getFilteredUsers = () => {
    if (!selectedMeeting) return [];
    
    return users.filter(user => {
      // Don't show users who are already attendees
      const userId = user.id || user._id;
      if (selectedMeeting.attendees?.some(attendee => attendee.user._id === userId || attendee.user.id === userId)) {
        return false;
      }
      
      // Filter by role (show only students if enabled)
      if (showStudentsOnly && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
        return false;
      }
      
      // Filter by search query
      const searchQuery = attendeeSearch.toLowerCase();
      const matchesSearch = !searchQuery || 
        user.fullName?.toLowerCase().includes(searchQuery) ||
        user.email?.toLowerCase().includes(searchQuery) ||
        user.phoneNumber?.toLowerCase().includes(searchQuery);
      
      if (!matchesSearch) return false;
      
      // Filter by stage
      if (attendeeStageFilter) {
        const userStageId = user.stage?._id || user.stage;
        if (userStageId !== attendeeStageFilter) {
          return false;
        }
      }
      
      return true;
    });
  };

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                إدارة الجلسات المباشرة
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                إدارة الجلسات المباشرة والجدولة
              </p>
              {/* Data Loading Status */}
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {!instructors || !subjects || !stages ? (
                  <span className="text-blue-600">🔄 جاري تحميل البيانات الأساسية...</span>
                ) : (
                  <span className="text-green-600">✅ البيانات جاهزة</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <FaPlus />
              إنشاء جلسة مباشر جديد
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-[#5b2233] -900">
                  <FaVideo className="text-2xl text-blue-600 dark:text-[#5b2233] -400" />
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الجلسات</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-[#5b2233] -900">
                  <FaClock className="text-2xl text-blue-600 dark:text-[#5b2233] -400" />
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">القادمة</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.upcoming}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                  <FaPlay className="text-2xl text-red-600 dark:text-red-400" />
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">مباشرة الآن</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.live}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <FaUsers className="text-2xl text-green-600 dark:text-green-400" />
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المشاركين</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalAttendees}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الجلسات..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                {filteredMeetings.length} الجلسةتم العثور عليه
              </div>
            </div>
          </div>

          {/* Weekly Schedules (Premium) - Admin Review */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">طلبات جداول الجلسات الأسبوعية</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">مراجعة جداول الطلاب المميزين والموافقة أو الرفض</p>
              </div>
              <div className="flex items-center gap-3">
              <select
                  value={scheduleStatusFilter}
                  onChange={(e) => setScheduleStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">جميع الحالات</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="approved">موافق عليه</option>
                  <option value="rejected">مرفوض</option>
              </select>
              </div>
            </div>

            {schedulesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-gray-600 dark:text-gray-300">جاري تحميل الجداول...</p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">لا توجد جداول</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الطالب</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">المسار</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">المنطقة الزمنية</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">المواعيد</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ملاحظة المدير</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {schedules.map(s => (
                      <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {s.user?.fullName || s.user?.name || '-'}
                          <div className="text-xs text-gray-500 dark:text-gray-400">{s.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {s.user?.learningPath === 'premium' ? 'المسار المميز' : s.user?.learningPath === 'basic' ? 'الأساسي' : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{s.timezone}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div className="flex flex-wrap gap-2 max-w-lg">
                            {(s.slots || []).map((slot, idx) => (
                              <span key={idx} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                <span>{['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][slot.dayOfWeek]}</span>
                                <span className="font-mono">{formatTo12h(slot.startTime)}</span>
                                <span className="text-xs text-gray-500">{slot.duration} دقيقة</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${s.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : s.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                            {s.status === 'approved' ? 'موافق عليه' : s.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{s.adminNote || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {s.status === 'approved' ? (
                              <>
                                <button
                                  onClick={() => editSchedule(s)}
                                  className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="تعديل"
                                >
                                  <FaEdit />
                                  تعديل
                                </button>
                                <button
                                  onClick={() => deleteSchedule(s._id)}
                                  className="inline-flex items-center gap-1 text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="حذف"
                                >
                                  <FaTrash />
                                  حذف
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => approveSchedule(s._id)}
                                  className="inline-flex items-center gap-1 text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  disabled={s.status === 'approved'}
                                  title="موافقة"
                                >
                                  <FaCheckCircle />
                                  موافقة
                                </button>
                                <button
                                  onClick={() => rejectSchedule(s._id)}
                                  className="inline-flex items-center gap-1 text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  disabled={s.status === 'rejected'}
                                  title="رفض"
                                >
                                  <FaTimes />
                                  رفض
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Approved Weekly Appointments Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">المواعيد الأسبوعية المعتمدة</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">عرض مجمع حسب أيام الأسبوع لكل الجداول الموافق عليها</p>
              </div>
            </div>

            {schedulesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-gray-600 dark:text-gray-300">جاري التحميل...</p>
              </div>
            ) : (
              (() => {
                const dayNames = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
                const approved = approvedSchedules;
                const byDay = Array.from({ length: 7 }, () => []);
                const meetingsByDay = Array.from({ length: 7 }, () => []);
                const meetingLinkByKey = new Map(); // key: `${dow}-${HH:mm}` → link
                const todayDow = new Date().getDay();
                approved.forEach(s => {
                  (s.slots || []).forEach(slot => {
                    if (slot && typeof slot.dayOfWeek === 'number' && slot.startTime) {
                      byDay[slot.dayOfWeek].push({
                        user: s.user?.fullName || s.user?.name || 'مستخدم',
                        email: s.user?.email,
                        startTime: slot.startTime,
                        duration: slot.duration,
                        timezone: s.timezone
                      });
                    }
                  });
                });
                // Also include scheduled meetings grouped by weekday
                (liveMeetings || []).forEach(m => {
                  try {
                    if (m.status !== 'scheduled') return;
                    const d = new Date(m.scheduledDate);
                    const dow = d.getDay();
                    const hh = String(d.getHours()).padStart(2, '0');
                    const mm = String(d.getMinutes()).padStart(2, '0');
                    meetingsByDay[dow].push({
                      title: m.title,
                      startTime: `${hh}:${mm}`,
                      duration: m.duration,
                      attendeesCount: (m.attendees || []).length,
                      link: m.googleMeetLink
                    });
                    meetingLinkByKey.set(`${dow}-${hh}:${mm}`, m.googleMeetLink);
                  } catch {}
                });
                // Sort each day by time
                byDay.forEach(list => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
                meetingsByDay.forEach(list => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {byDay.map((entries, dayIdx) => (
                      <div key={dayIdx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className={`${dayIdx === todayDow ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' : 'bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-gray-200'} px-4 py-2 font-semibold`}>
                          {dayNames[dayIdx]}
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            {entries.length === 0 ? (
                              <div className="text-sm text-gray-500 dark:text-gray-400">لا توجد مواعيد</div>
                            ) : (
                              <div className="space-y-2">
                                {entries.map((e, i) => {
                                  const key = `${dayIdx}-${e.startTime}`;
                                  const link = meetingLinkByKey.get(key);
                                  return (
                                    <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-md px-3 py-2">
                                      <div className="min-w-0">
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{e.user}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{e.email}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-mono text-sm text-gray-900 dark:text-white">{formatTo12h(e.startTime)}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{e.duration} دقيقة</div>
                                        {link && (
                                          <div className="mt-1">
                                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 underline">رابط الاجتماع</a>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>

        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">إنشاء جلسةمباشر جديد</h2>
              <form onSubmit={handleCreateMeeting} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      العنوان *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                </div>

                {/* Prefill from approved weekly schedules */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">طالب ذو جدول معتمد (اختياري)</label>
                    <select
                      value={selectedScheduleId}
                      onChange={(e) => {
                        setSelectedScheduleId(e.target.value);
                        setSelectedScheduleSlotIdx('');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">اختر الطالب</option>
                      {approvedSchedulesForCreate.map(s => {
                        const uid = s.user?._id || s.user?.id;
                        return (
                          <option key={s._id} value={s._id}>
                            {(s.user?.fullName || s.user?.name || 'طالب')} - {s.user?.email || uid}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">موعد من جدول الطالب</label>
                    <select
                      multiple
                      value={selectedScheduleSlotIdxs.map(String)}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions).map(o => o.value);
                        setSelectedScheduleSlotIdxs(options);
                        const schedule = approvedSchedulesForCreate.find(s => s._id === selectedScheduleId);
                        if (schedule && options.length === 1) {
                          const idx = parseInt(options[0], 10);
                          const slot = schedule.slots?.[idx];
                          if (slot) {
                            const iso = getNextDateForDayTime(slot.dayOfWeek, slot.startTime);
                            if (iso) {
                              setFormData(prev => ({ ...prev, scheduledDate: iso, duration: slot.duration }));
                            }
                            const uid = schedule.user?._id || schedule.user?.id;
                            if (uid) {
                              setFormData(prev => ({ ...prev, attendees: Array.from(new Set([...(prev.attendees || []), uid])) }));
                            }
                          }
                        }
                      }}
                      disabled={!selectedScheduleId}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[120px]"
                    >
                      {(() => {
                        const schedule = approvedSchedulesForCreate.find(s => s._id === selectedScheduleId);
                        const dayNames = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
                        return (schedule?.slots || []).map((slot, i) => (
                          <option key={i} value={i}>
                            {dayNames[slot.dayOfWeek]} - {formatTo12h(slot.startTime)} - {slot.duration} دقيقة
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      disabled={!selectedScheduleId || selectedScheduleSlotIdxs.length === 0}
                      onClick={() => {
                        const schedule = approvedSchedulesForCreate.find(s => s._id === selectedScheduleId);
                        if (!schedule) return;
                        if (selectedScheduleSlotIdxs.length === 1) {
                          const idx = parseInt(selectedScheduleSlotIdxs[0], 10);
                          const slot = schedule.slots?.[idx];
                          if (!slot) return;
                          const iso = getNextDateForDayTime(slot.dayOfWeek, slot.startTime);
                          if (iso) {
                            setFormData(prev => ({ ...prev, scheduledDate: iso, duration: slot.duration }));
                          }
                          const uid = schedule.user?._id || schedule.user?.id;
                          if (uid) {
                            setFormData(prev => ({ ...prev, attendees: Array.from(new Set([...(prev.attendees || []), uid])) }));
                          }
                          toast.success('تم تطبيق موعد الطالب على الاجتماع');
                        } else {
                          toast('تم تحديد عدة مواعيد، استخدم زر "إنشاء اجتماعات متعددة" بالأسفل');
                        }
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      تطبيق الموعد
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الوصف *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                  />
                </div>

                {selectedScheduleId && selectedScheduleSlotIdxs.length > 0 && (() => {
                  const schedule = approvedSchedulesForCreate.find(s => s._id === selectedScheduleId);
                  const dayNames = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
                  return (
                    <div className="space-y-4">
                      <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">روابط وأوصاف لكل موعد</h3>
                      {selectedScheduleSlotIdxs.map((idxStr) => {
                        const idx = parseInt(idxStr, 10);
                        const slot = schedule?.slots?.[idx];
                        if (!slot) return null;
                        const meta = selectedSlotsMeta[idxStr] || { link: '', description: '' };
                        return (
                          <div key={idxStr} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                              <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <span className="font-semibold">{dayNames[slot.dayOfWeek]}</span>
                                <span className="text-gray-400">|</span>
                                <span className="font-mono">{formatTo12h(slot.startTime)}</span>
                                <span className="text-gray-400">|</span>
                                <span>{slot.duration} دقيقة</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رابط Google Meet *</label>
                    <input
                                  type="url"
                      required
                                  value={meta.link}
                                  onChange={(e) => setSelectedSlotsMeta(prev => ({ ...prev, [idxStr]: { ...prev[idxStr], link: e.target.value } }))}
                                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف *</label>
                    <input
                                  type="text"
                      required
                                  value={meta.description}
                                  onChange={(e) => setSelectedSlotsMeta(prev => ({ ...prev, [idxStr]: { ...prev[idxStr], description: e.target.value } }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  </div>
                </div>
                        );
                      })}
                  </div>
                  );
                })()}

                <div className="flex justify-end gap-4 pt-4">
                  {selectedScheduleId && selectedScheduleSlotIdxs.length > 1 && (
                    <button
                      type="button"
                      onClick={async () => {
                        const schedule = approvedSchedulesForCreate.find(s => s._id === selectedScheduleId);
                        if (!schedule) return;
                        if (isAnySelectedSlotMissingMeta()) {
                          toast.error('يرجى إدخال الرابط والوصف لكل موعد محدد');
                          return;
                        }
                        const uid = schedule.user?._id || schedule.user?.id;
                        const created = [];
                        for (const idxStr of selectedScheduleSlotIdxs) {
                          const idx = parseInt(idxStr, 10);
                          const slot = schedule.slots?.[idx];
                          if (!slot) continue;
                          const iso = getNextDateForDayTime(slot.dayOfWeek, slot.startTime);
                          const meta = selectedSlotsMeta[idxStr] || { link: '', description: '' };
                          if (!meta.link || !meta.description) continue;
                          if (!/^https:\/\/meet\.google\.com\/[a-z0-9\-]+$/i.test(meta.link)) {
                            toast.error('رابط Google Meet غير صالح');
                            continue;
                          }
                          const meetingData = {
                            ...formData,
                            googleMeetLink: meta.link,
                            description: meta.description,
                            scheduledDate: iso || formData.scheduledDate,
                            duration: slot.duration,
                            attendees: uid ? Array.from(new Set([...(formData.attendees || []), uid])) : (formData.attendees || [])
                          };
                          try {
                            await dispatch(createLiveMeeting({
                              ...meetingData,
                              tags: meetingData.tags ? meetingData.tags.split(',').map(t => t.trim()) : []
                            })).unwrap();
                            created.push(idx);
                          } catch (e) {
                            console.error('فشل إنشاء اجتماع للموعد:', idx, e);
                          }
                        }
                        if (created.length > 0) {
                          toast.success(`تم إنشاء ${created.length} اجتماع`);
                          setShowCreateModal(false);
                          resetForm();
                          dispatch(getAllLiveMeetings({ page: currentPage, limit: 10 }));
                        } else {
                          toast.error('لم يتم إنشاء أي اجتماع');
                        }
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      إنشاء اجتماعات متعددة
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">تعديل الجلسةالمباشر</h2>
              <form onSubmit={handleEditMeeting} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      العنوان *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رابط Google Meet *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.googleMeetLink}
                      onChange={(e) => setFormData({...formData, googleMeetLink: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الوصف *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      تاريخ ووقت الجلسة*
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المدة (بالدقائق) *
                    </label>
                    <input
                      type="number"
                      required
                      min="15"
                      max="480"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الحد الأقصى للمشاركين
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData({...formData, maxAttendees: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المدرب * {instructors?.length > 0 && <span className="text-xs text-gray-500">({instructors.length} متاح)</span>}
                    </label>
                    <select
                      required
                      value={formData.instructor}
                      onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">اختر المدرب</option>
                      {instructors.map((instructor) => (
                        <option key={instructor._id} value={instructor._id}>{instructor.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المرحلة *
                    </label>
                    <select
                      required
                      value={formData.stage}
                      onChange={(e) => setFormData({...formData, stage: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">اختر المرحلة</option>
                      {stages.map((stage) => (
                        <option key={stage._id} value={stage._id}>{stage.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المادة * {subjects?.length > 0 && <span className="text-xs text-gray-500">({subjects.length} متاح)</span>}
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">اختر المادة</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>{subject.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    تحديث الاجتماع
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Attendees Management Modal */}
        {showAttendeesModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                إدارة المشاركين - {selectedMeeting.title}
              </h2>

              {/* Current Attendees */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  المشاركين الحاليين ({selectedMeeting.attendees?.length || 0})
                </h3>
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                  {selectedMeeting.attendees?.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                      {selectedMeeting.attendees.map((attendee) => (
                        <div key={attendee.user._id} className="flex items-center justify-between p-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {attendee.user.fullName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {attendee.user.email}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {attendee.hasJoined && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                انضم
                              </span>
                            )}
                            <button
                              onClick={() => handleRemoveAttendee(attendee.user._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="إزالة المشارك"
                            >
                              <FaUserMinus />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      لا يوجد مشاركين بعد
                    </div>
                  )}
                </div>
              </div>

              {/* Search and Filter Controls */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">البحث عن الطلاب</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Search Input */}
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="البحث بالاسم أو الإيميل..."
                      value={attendeeSearch}
                      onChange={(e) => setAttendeeSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* Stage Filter */}
                  <select
                    value={attendeeStageFilter}
                    onChange={(e) => setAttendeeStageFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">جميع المراحل</option>
                    {stages.map((stage) => (
                      <option key={stage._id} value={stage._id}>{stage.name}</option>
                    ))}
                  </select>

                  {/* Show Students Only Toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="studentsOnly"
                      checked={showStudentsOnly}
                      onChange={(e) => setShowStudentsOnly(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="studentsOnly" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                      الطلاب فقط
                    </label>
                  </div>
                </div>
              </div>

              {/* Add New Attendees */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">إضافة مشاركين جدد</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {getFilteredUsers().length} طالب متاح
                    </div>
                    {getFilteredUsers().length > 0 && (
                      <button
                        onClick={() => {
                          const allUserIds = getFilteredUsers()
                            .map(user => user.id || user._id) // Support both id and _id fields
                            .filter(id => id); // Filter out null/undefined IDs
                          const allSelected = allUserIds.every(id => attendeesFormData.selectedUsers.includes(id));
                          
                          console.log('Debug - Select All clicked:', { 
                            filteredUserIds: allUserIds, 
                            hasNullIds: getFilteredUsers().some(user => !(user.id || user._id)),
                            allSelected 
                          });
                          
                          if (allSelected) {
                            // Deselect all
                            setAttendeesFormData({
                              selectedUsers: attendeesFormData.selectedUsers.filter(id => !allUserIds.includes(id))
                            });
                          } else {
                            // Select all
                            setAttendeesFormData({
                              selectedUsers: [...new Set([...attendeesFormData.selectedUsers, ...allUserIds])]
                            });
                          }
                        }}
                        className="text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full transition-colors"
                      >
                        {getFilteredUsers().every(user => attendeesFormData.selectedUsers.includes(user.id || user._id)) ? 'إلغاء الكل' : 'اختر الكل'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                  {getFilteredUsers().length > 0 ? (
                    <div className="p-4 space-y-3">
                      {getFilteredUsers().map((user) => (
                        <div key={user.id || user._id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={attendeesFormData.selectedUsers.includes(user.id || user._id)}
                            onChange={(e) => {
                              const userId = user.id || user._id;
                              if (e.target.checked && userId) {
                                console.log('Debug - Adding user:', { userId, userName: user.fullName });
                                setAttendeesFormData({
                                  selectedUsers: [...attendeesFormData.selectedUsers, userId]
                                });
                              } else {
                                console.log('Debug - Removing user:', { userId, userName: user.fullName });
                                setAttendeesFormData({
                                  selectedUsers: attendeesFormData.selectedUsers.filter(id => id !== userId)
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="mr-3 flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.fullName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </div>
                                {user.phoneNumber && (
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    {user.phoneNumber}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                {user.stage && (
                                  <div className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded-full">
                                    {user.stage.name || user.stage || 'مرحلة غير محددة'}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {user.role === 'ADMIN' ? 'مدير' : user.role === 'USER' ? 'طالب' : user.role}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <FaUsers className="mx-auto text-4xl mb-2 opacity-50" />
                      <p>لا يوجد طلاب متاحين</p>
                      <p className="text-sm mt-1">جرب تغيير معايير البحث</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowAttendeesModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  إغلاق
                </button>
                <button
                  onClick={handleAddAttendees}
                  disabled={attendeesFormData.selectedUsers.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إضافة المشاركين المحددين ({attendeesFormData.selectedUsers.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default LiveMeetingDashboard;
