import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useEvents, useEventParticipants, useCreateEvent, useDeleteEvent, useMarkAttendance, useDashboardStats, useAllClubs, useRegisterClub, useApproveRegistration, useRejectRegistration, useGenerateQR } from '../hooks/useApi';
import { Plus, Trash2, Edit, Users, CheckCircle, XCircle, User as UserIcon, Calendar, Clock, MapPin, Activity, Award, AlertCircle, Building, Github, Check, X, MessageSquare, ExternalLink, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Modal from '../components/ui/Modal';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import SidebarLayout from '../components/layout/SidebarLayout';
import ProfileSettings from '../components/ProfileSettings';
import api from '../services/api';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('club'); // club, events, create, registrations

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [category, setCategory] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Club form states
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubCategory, setClubCategory] = useState('Technology');
  const [bannerFile, setBannerFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Registrations logic
  const [selectedEvent, setSelectedEvent] = useState(null);

  // React Query Hooks
  const { data: stats } = useDashboardStats('admin');
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const adminEvents = events.filter(e => e.createdBy === user._id);
  
  const { data: clubs = [] } = useAllClubs();
  const { data: registrations = [], isLoading: registrationsLoading } = useEventParticipants(selectedEvent?._id);
  
  const createEventMutation = useCreateEvent();
  const deleteEventMutation = useDeleteEvent();
  const markAttendanceMutation = useMarkAttendance();
  const registerClubMutation = useRegisterClub();
  const approveRegMutation = useApproveRegistration();
  const rejectRegMutation = useRejectRegistration();
  const generateQRMutation = useGenerateQR();

  // QR Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrToken, setQrToken] = useState(null);

  const handleApproveReg = (id) => approveRegMutation.mutate(id);
  const handleRejectReg = (id) => rejectRegMutation.mutate(id);

  const handleGenerateQR = async () => {
    try {
      const { token } = await generateQRMutation.mutateAsync(selectedEvent._id);
      setQrToken(token);
      setIsQrModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const myClub = clubs.find(c => c.createdBy?._id === user._id);
  const isClubApproved = myClub?.status === 'approved';

  const loading = eventsLoading || (activeTab === 'registrations' && registrationsLoading);

  const handleRegisterClub = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    let bannerUrl = '';
    let thumbnailUrl = '';

    try {
      if (bannerFile) {
        const formData = new FormData();
        formData.append('image', bannerFile);
        const { data } = await api.post('/upload/image', formData);
        bannerUrl = data.imageUrl;
      }

      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('image', thumbnailFile);
        const { data } = await api.post('/upload/image', formData);
        thumbnailUrl = data.imageUrl;
      }

      await registerClubMutation.mutateAsync({
        name: clubName,
        description: clubDescription,
        category: clubCategory,
        bannerUrl,
        thumbnailUrl
      });
      // Don't change tab, keep on club to show pending visually
    } catch (error) {
      console.error('Error registering club:', error);
      toast.error('Failed to register club');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    let coverImageUrl = '';

    try {
      if (coverImageFile) {
        const formData = new FormData();
        formData.append('image', coverImageFile);
        const { data } = await api.post('/upload/image', formData);
        coverImageUrl = data.imageUrl;
      }

      await createEventMutation.mutateAsync({
        title, description, date, venue, maxParticipants: Number(maxParticipants), category, clubId: myClub?._id, coverImageUrl
      });
      setTitle(''); setDescription(''); setDate(''); setVenue(''); setMaxParticipants(''); setCategory(''); setCoverImageFile(null);
      setActiveTab('events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteEventMutation.mutate(id);
    }
  };

  const openRegistrations = (event) => {
    setSelectedEvent(event);
    setActiveTab('registrations');
  };

  const markAttendance = (id, status) => {
    markAttendanceMutation.mutate({ registrationId: id, status });
  };



  if (loading && activeTab === 'events') return (
     <div className="min-h-[80vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
     </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  const handleTabChange = (tabId) => {
     if (!isClubApproved && (tabId === 'events' || tabId === 'create')) {
         toast.error("Your club must be approved first.");
         return;
     }
     setActiveTab(tabId);
     setSelectedEvent(null);
  };

  const navigation = [
    { id: 'club', label: 'My Club', icon: Building, activeTabId: activeTab, onClick: handleTabChange },
    { id: 'events', label: 'Events Ledger', icon: Calendar, activeTabId: activeTab, onClick: handleTabChange, locked: !isClubApproved },
    { id: 'create', label: 'New Event', icon: Plus, activeTabId: activeTab, onClick: handleTabChange, locked: !isClubApproved },
    ...(selectedEvent ? [{ id: 'registrations', label: 'Registrations', icon: Users, activeTabId: activeTab, onClick: () => setActiveTab('registrations'), locked: !isClubApproved }] : []),
    { id: 'profile', label: 'Profile Settings', icon: UserIcon, activeTabId: activeTab, onClick: handleTabChange }
  ];

  return (
    <SidebarLayout navigation={navigation} title="Admin Dashboard">


      <AnimatePresence mode="wait">
         <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
         >

            {activeTab === 'club' && (
               <motion.div 
                 variants={containerVariants}
                 initial="hidden"
                 animate="visible"
               >
                 {!myClub ? (
                    <motion.div variants={itemVariants} className="glass-panel p-8 sm:p-10 rounded-2xl max-w-2xl mx-auto shadow-xl">
                       <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
                             <Building size={32} />
                          </div>
                          <h2 className="text-3xl font-extrabold text-secondary-900 dark:text-white mb-2 tracking-tight">Register Your Club</h2>
                          <p className="text-secondary-600 dark:text-secondary-300">
                             Launch your organization on CampusConnect. Once approved by a Super Admin, you can start hosting events.
                          </p>
                       </div>
                       
                       <form onSubmit={handleRegisterClub} className="space-y-6">
                         <Input
                            id="clubName"
                            label="Club Name"
                            placeholder="e.g. Google Developer Student Clubs"
                            required
                            value={clubName}
                            onChange={(e) => setClubName(e.target.value)}
                         />
                         
                         <div>
                            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Club Description</label>
                            <textarea 
                               required 
                               value={clubDescription} 
                               onChange={(e) => setClubDescription(e.target.value)} 
                               className="input-field min-h-[120px] resize-y" 
                               placeholder="What is your club about? What are the goals?"
                            ></textarea>
                         </div>

                         <div>
                            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Category</label>
                            <select required value={clubCategory} onChange={(e) => setClubCategory(e.target.value)} className="input-field cursor-pointer">
                              <option value="Technology">Technology</option>
                              <option value="Cultural">Cultural</option>
                              <option value="Sports">Sports</option>
                              <option value="Academic">Academic</option>
                              <option value="Social">Social</option>
                            </select>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                               <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Club Banner Image (Optional)</label>
                               <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} className="input-field cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/40 dark:file:text-primary-400 text-sm" />
                            </div>
                            <div>
                               <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Club Thumbnail Logo (Optional)</label>
                               <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files[0])} className="input-field cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/40 dark:file:text-primary-400 text-sm" />
                            </div>
                         </div>
                         
                         <div className="pt-4 border-t border-secondary-200 dark:border-secondary-800">
                            <Button type="submit" isLoading={actionLoading} className="w-full h-12 text-lg font-bold shadow-md hover:shadow-lg transition-all">Submit for Approval</Button>
                         </div>
                       </form>
                    </motion.div>
                 ) : (
                    <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
                       <div className="glass-panel p-8 rounded-2xl relative overflow-hidden mb-8">
                          {/* Status Banner */}
                          <div className={`absolute top-0 left-0 w-full h-2 ${isClubApproved ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                             <div>
                                <div className="flex items-center gap-3 mb-2">
                                   <h2 className="text-3xl font-extrabold text-secondary-900 dark:text-white">{myClub.name}</h2>
                                   <Badge variant={isClubApproved ? 'success' : 'warning'} className="uppercase tracking-widest text-[10px]">
                                      {myClub.status}
                                   </Badge>
                                </div>
                                <div className="flex items-center text-sm font-medium text-secondary-500 dark:text-secondary-300 mb-6 gap-4">
                                   <span className="flex items-center"><Award size={16} className="mr-1.5 text-primary-500" /> {myClub.category}</span>
                                   <span className="flex items-center"><Users size={16} className="mr-1.5 text-purple-500" /> Managed by you</span>
                                </div>
                                <p className="text-secondary-700 dark:text-secondary-300 text-lg leading-relaxed max-w-2xl">
                                   {myClub.description}
                                </p>
                             </div>
                             
                             {!isClubApproved && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 p-4 rounded-xl max-w-xs shrink-0 self-start md:self-stretch">
                                   <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400 font-bold mb-2">
                                      <AlertCircle size={18} />
                                      Pending Approval
                                   </div>
                                   <p className="text-sm text-yellow-700/80 dark:text-yellow-500/80 leading-snug">
                                      Your club application is currently being reviewed by a Super Admin. You will be able to create events once approved.
                                   </p>
                                </div>
                             )}
                          </div>
                          
                          {isClubApproved && (
                             <div className="mt-8 pt-8 border-t border-secondary-200 dark:border-secondary-800 flex gap-4">
                                <Button onClick={() => setActiveTab('create')} className="shadow-sm">Host New Event</Button>
                                <Button variant="secondary" onClick={() => setActiveTab('events')} className="shadow-sm">View Ledgers</Button>
                             </div>
                          )}
                       </div>
                    </motion.div>
                 )}
               </motion.div>
            )}

            {activeTab === 'events' && (
              <>
                {/* Stats Row */}
                {stats && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-advanced p-6 flex items-center justify-between group">
                      <div className="absolute -left-4 -top-4 w-24 h-24 bg-primary-300/20 dark:bg-primary-900/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="relative z-10">
                        <p className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-1">Total Events</p>
                        <h4 className="text-4xl font-extrabold text-secondary-900 dark:text-white">{stats.totalEvents || 0}</h4>
                      </div>
                      <div className="relative z-10 w-14 h-14 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 flex items-center justify-center shadow-inner">
                        <Calendar size={28} />
                      </div>
                    </div>
                    <div className="glass-advanced p-6 flex items-center justify-between group">
                      <div className="absolute right-0 top-1/2 w-24 h-24 bg-purple-300/20 dark:bg-purple-900/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="relative z-10">
                        <p className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-1">Total Registrations</p>
                        <h4 className="text-4xl font-extrabold text-secondary-900 dark:text-white">{stats.totalRegistrations || 0}</h4>
                      </div>
                      <div className="relative z-10 w-14 h-14 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center shadow-inner">
                        <Users size={28} />
                      </div>
                    </div>
                    <div className="glass-advanced p-6 flex items-center justify-between group">
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-300/20 dark:bg-green-900/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="relative z-10">
                        <p className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-1">Total Attendees</p>
                        <h4 className="text-4xl font-extrabold text-secondary-900 dark:text-white">{stats.totalAttended || 0}</h4>
                      </div>
                      <div className="relative z-10 w-14 h-14 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center shadow-inner">
                        <Activity size={28} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Charts Area */}
                {stats && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                     
                     <div className="glass-panel p-6 rounded-2xl border border-secondary-100 dark:border-secondary-800">
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Monthly Events Created</h3>
                        <div className="h-64 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stats.monthlyEventsData}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-secondary-200)" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-secondary-500)', fontSize: 12}} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-secondary-500)', fontSize: 12}} />
                                 <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-secondary-800)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                 <Bar dataKey="events" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} barSize={32} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     <div className="glass-panel p-6 rounded-2xl border border-secondary-100 dark:border-secondary-800">
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Registration Overview</h3>
                        <div className="h-64 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie
                                   data={stats.registrationDistData}
                                   cx="50%"
                                   cy="50%"
                                   innerRadius={60}
                                   outerRadius={80}
                                   paddingAngle={5}
                                   dataKey="value"
                                   stroke="none"
                                 >
                                    {stats.registrationDistData?.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={['var(--color-secondary-300)', 'var(--color-primary-500)', 'var(--color-accent-400)'][index % 3]} />
                                    ))}
                                 </Pie>
                                 <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-secondary-800)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                              </PieChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                     
                     <div className="glass-panel p-6 rounded-2xl border border-secondary-100 dark:border-secondary-800 lg:col-span-2">
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Recent Events Attendance Trend</h3>
                        <div className="h-72 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={stats.attendanceTrendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-secondary-200)" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-secondary-500)', fontSize: 12}} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-secondary-500)', fontSize: 12}} />
                                 <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-secondary-800)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                 <Line type="monotone" dataKey="Present" stroke="var(--color-primary-500)" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                                 <Line type="monotone" dataKey="Absent" stroke="var(--color-accent-400)" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                              </LineChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                  </motion.div>
                )}

                <motion.div 
                  variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {adminEvents.length === 0 ? (
                  <div className="col-span-full glass-panel p-10 text-center">
                    <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Calendar className="h-8 w-8 text-secondary-400" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-white">No events found</h3>
                    <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-300">Get started by creating a new event for your students.</p>
                    <Button onClick={() => setActiveTab('create')} className="mt-6">Create Event</Button>
                  </div>
                ) : (
                  adminEvents.map(event => (
                    <motion.div variants={itemVariants} key={event._id} className="card group hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden">
                      {event.coverImageUrl && (
                         <div className="w-full h-48 sm:h-56 bg-secondary-200 relative shrink-0">
                            <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                         </div>
                      )}
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                           <Badge variant="primary" className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 border-primary-200 dark:border-primary-800/50">
                              {event.clubId?.name || "College Admin"}
                           </Badge>
                           {user._id === event.createdBy && (
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteEvent(event._id);
                                }} 
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete Event"
                              >
                                 <Trash2 size={16} />
                              </button>
                           )}
                        </div>
                        <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2 line-clamp-2" title={event.title}>
                           {event.title}
                        </h3>
                        <p className="text-secondary-600 dark:text-secondary-300 text-sm mb-6 flex-grow line-clamp-3">
                           {event.description}
                        </p>
                        
                        <div className="space-y-3 bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-xl border border-secondary-100 dark:border-secondary-700/50 mt-auto">
                           <div className="flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-300">
                              <div className="w-6 h-6 rounded bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mr-3 text-primary-600 dark:text-primary-400">
                                 <Clock size={14} />
                              </div>
                              {format(new Date(event.date), 'MMM dd, yyyy h:mm a')}
                           </div>
                           <div className="flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-300">
                              <div className="w-6 h-6 rounded bg-accent-100 dark:bg-accent-900/40 flex items-center justify-center mr-3 text-accent-600 dark:text-accent-400">
                                 <MapPin size={14} />
                              </div>
                              {event.venue}
                           </div>
                           <div className="flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-300">
                              <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mr-3 text-purple-600 dark:text-purple-400">
                                 <Users size={14} />
                              </div>
                              Capacity: {event.maxParticipants}
                           </div>
                        </div>
                      </div>
                      <div className="p-6 pt-0 mt-auto">
                        <Button 
                          variant="secondary"
                          onClick={() => openRegistrations(event)}
                          className="w-full flex justify-center items-center shadow-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-200 dark:hover:border-primary-800"
                        >
                          <Users size={16} className="mr-2" /> Manage Attendees
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
              </>
            )}

            {activeTab === 'create' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-8 sm:p-10 rounded-2xl max-w-2xl mx-auto shadow-xl"
              >
                <div className="mb-8 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800 flex items-center mb-6">
                   <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-4">
                      <Building className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                   </div>
                   <div>
                     <h2 className="font-bold text-secondary-900 dark:text-white">Hosting under: {myClub?.name}</h2>
                     <p className="text-secondary-500 text-xs">Your events are automatically mapped to your club.</p>
                   </div>
                </div>

                <div className="mb-8">
                   <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Create New Event</h2>
                   <p className="text-secondary-500 dark:text-secondary-300 text-sm mt-1">Fill in the details below to host a new event or workshop.</p>
                </div>

                <form onSubmit={handleCreateEvent} className="space-y-6">
                  <Input
                     id="title"
                     label="Event Title"
                     placeholder="e.g. Intro to Web Development"
                     required
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                  />
                  
                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Description</label>
                    <textarea 
                       required 
                       value={description} 
                       onChange={(e) => setDescription(e.target.value)} 
                       className="input-field min-h-[120px] resize-y" 
                       placeholder="What is this event about, what should students bring, etc."
                    ></textarea>
                    <div>
                      <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Event Category</label>
                      <select required value={category} onChange={(e) => setCategory(e.target.value)} className="input-field cursor-pointer">
                        <option value="" disabled>Select Category</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Networking">Networking</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Date & Time</label>
                      <input 
                         type="datetime-local" 
                         required 
                         value={date} 
                         onChange={(e) => setDate(e.target.value)} 
                         className="input-field" 
                      />
                    </div>
                    <Input
                       id="venue"
                       label="Venue"
                       placeholder="e.g. Room 302, Block A"
                       required
                       value={venue}
                       onChange={(e) => setVenue(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Input
                        id="maxParticipants"
                        type="number"
                        label="Max Participants"
                        placeholder="e.g. 50"
                        min="1"
                        required
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(e.target.value)}
                     />
                     <div>
                        <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Event Cover Image (Optional)</label>
                        <input type="file" accept="image/*" onChange={(e) => setCoverImageFile(e.target.files[0])} className="input-field cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/40 dark:file:text-primary-400 text-sm" />
                     </div>
                  </div>
                  
                  <div className="pt-6 flex justify-end space-x-3 border-t border-secondary-200 dark:border-secondary-800">
                    <Button type="button" variant="secondary" onClick={() => setActiveTab('events')}>Cancel</Button>
                    <Button type="submit" isLoading={actionLoading} className="min-w-[140px]">Create Event</Button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'registrations' && selectedEvent && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel overflow-hidden"
              >
                <div className="px-6 py-6 border-b border-secondary-200 dark:border-secondary-800 flex flex-col md:flex-row justify-between items-start md:items-center bg-secondary-50/50 dark:bg-secondary-900/50 gap-4">
                  <div>
                     <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-1">
                        Attendees: <span className="text-primary-600 dark:text-primary-400">{selectedEvent.title}</span>
                     </h3>
                     <div className="flex gap-4 text-sm font-medium text-secondary-500 dark:text-secondary-300">
                        <span className="flex items-center"><Users size={14} className="mr-1.5" />{registrations.length} / {selectedEvent.maxParticipants} Registered</span>
                        <span className="flex items-center"><Calendar size={14} className="mr-1.5" />{format(new Date(selectedEvent.date), 'MMM dd')}</span>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <Button 
                        variant="primary" 
                        onClick={handleGenerateQR} 
                        isLoading={generateQRMutation.isPending}
                        className="text-sm shadow-sm flex items-center"
                     >
                        <QrCode size={16} className="mr-2" />
                        Generate QR
                     </Button>
                     <Button variant="secondary" onClick={() => setActiveTab('events')} className="text-sm shadow-sm">
                       Back to Events
                     </Button>
                  </div>
                </div>
                
                {loading ? (
                   <div className="p-16 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                   </div>
                ) : registrations.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Users className="h-8 w-8 text-secondary-400" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-white">No attendees yet</h3>
                    <p className="mt-2 text-secondary-500">Wait for students to register for this event.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-800">
                      <thead className="bg-secondary-50 dark:bg-secondary-900/30">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">Applicant</th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">Application Details</th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-secondary-900 divide-y divide-secondary-200 dark:divide-secondary-800">
                        {registrations.map(reg => (
                          <tr key={reg._id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  {reg.studentId.profileImage ? (
                                     <img className="h-10 w-10 rounded-full object-cover border-2 border-secondary-200 dark:border-secondary-700 shadow-sm" src={reg.studentId.profileImage} alt="" />
                                  ) : (
                                     <div className="h-10 w-10 rounded-full bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center border-2 border-secondary-200 dark:border-secondary-700 shadow-sm"><UserIcon size={18} className="text-secondary-500" /></div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-1.5">
                                    {reg.studentId.name}
                                  </div>
                                  <div className="text-sm text-secondary-500 dark:text-secondary-300 mb-1">{reg.studentId.email}</div>
                                  <div className="mt-1">
                                    {reg.githubProfile ? (
                                       <a href={reg.githubProfile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors" title={reg.githubProfile}>
                                          <Github size={12} />
                                          <span className="max-w-[120px] truncate">{reg.githubProfile.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                                       </a>
                                    ) : (
                                       <Badge variant="warning" className="text-[10px] px-1.5 py-0.5"><AlertCircle size={10} className="inline mr-1" />Not Provided</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-1">
                                 {format(new Date(reg.createdAt), 'MMM dd, yyyy')}
                               </div>
                               {reg.message && (
                                  <div className="text-xs text-secondary-500 dark:text-secondary-300 italic line-clamp-2 max-w-xs flex items-start gap-1">
                                     <MessageSquare size={12} className="mt-0.5 flex-shrink-0" /> {reg.message}
                                  </div>
                               )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <div className="flex flex-col gap-2 items-start">
                                  <Badge 
                                    variant={
                                       reg.status === 'accepted' ? 'success' : 
                                       reg.status === 'rejected' ? 'danger' : 'warning'
                                    }
                                  >
                                    Reg: {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                                  </Badge>
                                  
                                  {reg.status === 'accepted' && (
                                     <Badge 
                                       variant={
                                          reg.attendanceStatus === 'present' ? 'success' : 
                                          reg.attendanceStatus === 'absent' ? 'danger' : 'secondary'
                                       }
                                     >
                                       Att: {reg.attendanceStatus.charAt(0).toUpperCase() + reg.attendanceStatus.slice(1)}
                                     </Badge>
                                  )}
                               </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              {reg.status === 'pending' ? (
                                 <div className="flex justify-end items-center space-x-2">
                                    <button 
                                      onClick={() => handleApproveReg(reg._id)} 
                                      className="p-2 rounded-lg transition-colors text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                                      title="Approve Application"
                                      disabled={approveRegMutation.isPending}
                                    >
                                      <Check size={20} />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectReg(reg._id)} 
                                      className="p-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                      title="Reject Application"
                                      disabled={rejectRegMutation.isPending}
                                    >
                                      <X size={20} />
                                    </button>
                                 </div>
                              ) : reg.status === 'accepted' ? (
                                 <div className="flex justify-end items-center space-x-2">
                                    <button 
                                      onClick={() => markAttendance(reg._id, 'present')} 
                                      className={`p-2 rounded-lg transition-colors ${reg.attendanceStatus === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'text-secondary-400 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400'}`}
                                      title="Mark Present"
                                    >
                                      <CheckCircle size={20} />
                                    </button>
                                    <button 
                                      onClick={() => markAttendance(reg._id, 'absent')} 
                                      className={`p-2 rounded-lg transition-colors ${reg.attendanceStatus === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'text-secondary-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400'}`}
                                      title="Mark Absent"
                                    >
                                      <XCircle size={20} />
                                    </button>

                                 </div>
                              ) : (
                                 <span className="text-secondary-400 italic">Rejected</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <ProfileSettings />
            )}
         </motion.div>
      </AnimatePresence>

      <Modal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)}
        title="Event Attendance QR Code"
        className="max-w-md"
      >
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-secondary-900 rounded-xl">
           <div className="p-4 bg-white rounded-2xl shadow-inner border-[4px] border-primary-100 dark:border-primary-900/50 mb-6">
              {qrToken ? (
                 <QRCodeSVG 
                    value={qrToken} 
                    size={250}
                    level="H"
                    includeMargin={true}
                    className="rounded-lg"
                 />
              ) : (
                 <div className="w-[250px] h-[250px] bg-secondary-100 dark:bg-secondary-800 rounded-lg animate-pulse" />
              )}
           </div>
           
           <h4 className="text-lg font-bold text-secondary-900 dark:text-white text-center mb-2">Scan to mark attendance</h4>
           <p className="text-sm text-secondary-500 dark:text-secondary-400 text-center max-w-xs">
              Students can scan this QR code using the CampusConnect app to instantly register their attendance.
           </p>
           
           <div className="w-full mt-6 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                 <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                    <Clock size={16} />
                 </div>
                 <div>
                    <p className="text-xs font-semibold text-secondary-900 dark:text-white">Validity</p>
                    <p className="text-[10px] text-secondary-500">Expires in 24 hours</p>
                 </div>
              </div>
              <Badge variant="success">Active</Badge>
           </div>
        </div>
      </Modal>

    </SidebarLayout>
  );
};

export default AdminDashboard;
