import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useEvents, useMyParticipations, useRegisterEvent, useGenerateCertificates, useDashboardStats, useAllClubs, useScanQR } from '../hooks/useApi';
import api from '../services/api';
import { Calendar, CheckCircle, Clock, Download, XCircle, User as UserIcon, Camera, Edit2, MapPin, Users, TrendingUp, Award, Shield, Building, Github, QrCode } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import SidebarLayout from '../components/layout/SidebarLayout';
import ProfileSettings from '../components/ProfileSettings';

const StudentDashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events'); // events, registrations, profile

  // React Query Hooks
  const { data: stats } = useDashboardStats('student');
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: myRegistrations = [], isLoading: registrationsLoading } = useMyParticipations();
  const { data: clubs = [], isLoading: clubsLoading } = useAllClubs('approved');
  const registerMutation = useRegisterEvent();
  const generateCertMutation = useGenerateCertificates();
  
  // Selected Club
  const [selectedClubId, setSelectedClubId] = useState(null);

  // Registration Modal States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  // QR Scan State
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const scanQRMutation = useScanQR();

  const loading = eventsLoading || registrationsLoading || clubsLoading;

  useEffect(() => {
    let html5QrcodeScanner;
    if (isScanModalOpen) {
       html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: {width: 250, height: 250} },
          false
        );
        html5QrcodeScanner.render((decodedText) => {
           handleScanQR(decodedText);
           html5QrcodeScanner.clear().catch(error => console.error("Failed to clear scanner", error));
           setIsScanModalOpen(false);
        }, (err) => {
           // ignore repeated failures
        });
    }

    return () => {
       if (html5QrcodeScanner) {
          html5QrcodeScanner.clear().catch(error => console.error("Failed to clean up scanner", error));
       }
    };
  }, [isScanModalOpen]);

  const handleScanQR = async (token) => {
    try {
      await scanQRMutation.mutateAsync(token);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    try {
      await registerMutation.mutateAsync({ 
          eventId: selectedEvent._id, 
          githubProfile: githubUrl, 
          message: registerMessage 
      });
      setIsRegisterModalOpen(false);
      setGithubUrl('');
      setRegisterMessage('');
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  const generateCertificate = async (registrationId, eventTitle) => {
    try {
      const toastId = toast.loading('Generating certificate...');
      const blob = await generateCertMutation.mutateAsync(registrationId);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${eventTitle.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Certificate ready!', { id: toastId });
    } catch (error) {
      console.error('Error with certificate:', error);
      toast.error('Failed to process certificate', { id: toastId });
    }
  };



  // Helper to check if a user is already registered for an event
  const isRegistered = (eventId) => {
    return myRegistrations.some(reg => reg.eventId?._id === eventId);
  };

  if (loading) return (
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

  const navigation = [
    { id: 'events', label: 'Discover', icon: Calendar, activeTabId: activeTab, onClick: setActiveTab },
    { id: 'clubs', label: 'Organizations', icon: Building, activeTabId: activeTab, onClick: setActiveTab },
    { id: 'registrations', label: 'My Registrations', icon: CheckCircle, activeTabId: activeTab, onClick: setActiveTab },
    { id: 'profile', label: 'Profile Settings', icon: UserIcon, activeTabId: activeTab, onClick: setActiveTab }
  ];

  return (
    <SidebarLayout navigation={navigation} title="Student Dashboard">

      <AnimatePresence mode="wait">
         <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
         >
            {activeTab === 'events' && (
              <div>
                {/* Dashboard Stats Row */}
                {stats && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="glass-advanced p-5 flex flex-col items-center justify-center text-center group">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary-300/20 dark:bg-primary-900/40 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 flex items-center justify-center mb-3">
                        <TrendingUp size={20} />
                      </div>
                      <h4 className="text-3xl font-bold text-secondary-900 dark:text-white">{stats.totalRegistrations || 0}</h4>
                      <p className="text-xs text-secondary-500 font-medium uppercase tracking-wider mt-1">Total Registered</p>
                    </div>
                    <div className="glass-advanced p-5 flex flex-col items-center justify-center text-center group">
                      <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-green-300/20 dark:bg-green-900/40 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center mb-3">
                        <CheckCircle size={20} />
                      </div>
                      <h4 className="text-3xl font-bold text-secondary-900 dark:text-white">{stats.attendedEvents || 0}</h4>
                      <p className="text-xs text-secondary-500 font-medium uppercase tracking-wider mt-1">Events Attended</p>
                    </div>
                    <div className="glass-advanced p-5 flex flex-col items-center justify-center text-center group">
                      <div className="absolute right-0 top-1/2 w-16 h-16 bg-purple-300/20 dark:bg-purple-900/40 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center mb-3">
                        <Award size={20} />
                      </div>
                      <h4 className="text-3xl font-bold text-secondary-900 dark:text-white">{stats.certificatesEarnt || 0}</h4>
                      <p className="text-xs text-secondary-500 font-medium uppercase tracking-wider mt-1">Certificates</p>
                    </div>
                    <div className="glass-advanced p-5 flex flex-col items-center justify-center text-center group">
                      <div className="absolute left-1/2 top-0 w-16 h-16 bg-accent-300/20 dark:bg-accent-900/40 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 flex items-center justify-center mb-3">
                        <Calendar size={20} />
                      </div>
                      <h4 className="text-3xl font-bold text-secondary-900 dark:text-white">{stats.upcomingEvents || 0}</h4>
                      <p className="text-xs text-secondary-500 font-medium uppercase tracking-wider mt-1">Upcoming Events</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-2xl font-bold text-secondary-900 dark:text-white tracking-tight">Upcoming Events</h2>
                </div>
                
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {events.length === 0 ? (
                    <div className="col-span-full glass-panel p-10 text-center">
                      <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                         <Calendar className="h-8 w-8 text-secondary-400" />
                      </div>
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-white">No upcoming events</h3>
                      <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-300">Check back later for new workshops and activities.</p>
                    </div>
                  ) : (
                    events.map((event) => {
                      const alreadyRegistered = isRegistered(event._id);
                      
                      return (
                        <motion.div variants={itemVariants} key={event._id} className="card group hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden">
                          {event.coverImageUrl && (
                             <div className="w-full h-48 sm:h-56 bg-secondary-200 relative shrink-0">
                                <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4">
                                </div>
                             </div>
                          )}
                          <div className="p-6 flex-grow flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                               <Badge variant="primary" className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 border-primary-200 dark:border-primary-800/50">
                                  {event.clubId?.name || "College Admin"}
                               </Badge>
                               {alreadyRegistered && (
                                  <Badge variant="success" className="flex items-center shadow-sm">
                                     <CheckCircle size={12} className="mr-1" /> Registered
                                  </Badge>
                               )}
                            </div>
                            
                            <h3 
                               className="text-xl font-bold text-secondary-900 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors" 
                               title={event.title}
                               onClick={() => navigate(`/events/${event._id}`)}
                            >
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
                                  Cap: {event.maxParticipants} slots
                               </div>
                            </div>
                          </div>
                          
                          <div className="p-6 pt-0 mt-auto">
                            <Button
                              onClick={() => { setSelectedEvent(event); setIsRegisterModalOpen(true); }}
                              disabled={alreadyRegistered}
                              variant={alreadyRegistered ? "secondary" : "primary"}
                              className="w-full shadow-sm"
                            >
                              {alreadyRegistered ? 'Already Registered' : 'Register Now'}
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              </div>
            )}

            {activeTab === 'clubs' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                 <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Campus Organizations</h2>
                      <p className="text-secondary-500 mt-1">Explore approved clubs and join their targeted events.</p>
                    </div>
                    {selectedClubId && (
                       <Button variant="secondary" onClick={() => setSelectedClubId(null)}>Back to Clubs</Button>
                    )}
                 </div>

                 {!selectedClubId ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {clubs.length === 0 ? (
                         <div className="col-span-full glass-panel p-10 text-center">
                            <Building className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                            <h3 className="text-lg font-bold text-secondary-900 dark:text-white">No active organizations</h3>
                         </div>
                      ) : (
                         clubs.map(club => (
                           <div key={club._id} className="glass-panel p-6 rounded-2xl cursor-pointer hover:-translate-y-1 transition-transform border border-secondary-200 dark:border-secondary-800" onClick={() => setSelectedClubId(club._id)}>
                              <div className="flex items-center space-x-4 mb-4">
                                 <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 flex items-center justify-center">
                                    <Shield size={24} />
                                 </div>
                                 <div>
                                   <h3 className="font-bold text-secondary-900 dark:text-white">{club.name}</h3>
                                   <p className="text-xs text-secondary-500">{club.category}</p>
                                 </div>
                              </div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300 line-clamp-2">{club.description}</p>
                           </div>
                         ))
                      )}
                    </div>
                 ) : (
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-primary-700 dark:text-primary-400 border-b border-primary-200 dark:border-primary-900/50 pb-2">
                        Events by {clubs.find(c => c._id === selectedClubId)?.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {events.filter(e => e.clubId?._id === selectedClubId).length === 0 ? (
                           <div className="col-span-full p-6 text-center text-secondary-500">No events found for this club yet.</div>
                        ) : (
                           events.filter(e => e.clubId?._id === selectedClubId).map(event => {
                             const alreadyRegistered = isRegistered(event._id);
                             return (
                               <motion.div variants={itemVariants} key={event._id} className="card group hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-secondary-100 overflow-hidden">
                                  {event.coverImageUrl && (
                                     <div className="w-full h-40 sm:h-48 bg-secondary-200 relative shrink-0">
                                        <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                     </div>
                                  )}
                                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-4 gap-3">
                                       <h3 
                                          className="text-lg sm:text-xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug cursor-pointer"
                                          onClick={() => navigate(`/events/${event._id}`)}
                                       >
                                          {event.title}
                                       </h3>
                                       <Badge variant="secondary" className="flex-shrink-0 whitespace-nowrap">{event.category}</Badge>
                                    </div>
                                    <p className="text-secondary-600 mb-5 line-clamp-2 text-sm leading-relaxed">{event.description}</p>
                                    
                                    <div className="space-y-3 mt-auto mb-6 text-xs font-medium text-secondary-700 bg-secondary-50 p-3 rounded-lg">
                                       <div className="flex items-center"><Clock size={12} className="mr-2 text-primary-500"/>{new Date(event.date).toLocaleDateString()}</div>
                                       <div className="flex items-center"><MapPin size={12} className="mr-2 text-accent-500"/>{event.venue}</div>
                                     </div>
                                  </div>
                                  <div className="p-5 pt-0 mt-auto">
                                     <Button 
                                       onClick={() => { setSelectedEvent(event); setIsRegisterModalOpen(true); }}
                                       disabled={alreadyRegistered}
                                       className="w-full shadow-sm bg-primary-600 hover:bg-primary-700 text-white border-transparent"
                                     >
                                       {alreadyRegistered ? 'Registered' : 'Register Now'}
                                     </Button>
                                  </div>
                               </motion.div>
                             )
                           })
                        )}
                      </div>
                    </div>
                 )}
              </motion.div>
            )}

            {activeTab === 'registrations' && (
              <div>
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6 tracking-tight">My Event Registrations</h2>
                <div className="glass-panel overflow-hidden">
                   {myRegistrations.length === 0 ? (
                      <div className="p-10 text-center">
                        <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Calendar className="h-8 w-8 text-secondary-400" />
                        </div>
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white">No registrations yet</h3>
                        <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-300 max-w-sm mx-auto">You haven't signed up for any events. Check the Discover tab to get started.</p>
                        <Button onClick={() => setActiveTab('events')} className="mt-6">Discover Events</Button>
                      </div>
                   ) : (
                      <ul className="divide-y divide-secondary-200 dark:divide-secondary-800">
                         {myRegistrations.map(reg => (
                             <li key={reg._id} className="p-4 sm:p-6 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors duration-200">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                   <div className="flex-grow w-full">
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                         <h3 className="text-lg font-bold text-secondary-900 dark:text-white break-words">{reg.eventId?.title || 'Deleted Event'}</h3>
                                         <div className="flex flex-wrap gap-2">
                                            <Badge 
                                              variant={
                                                 reg.status === 'accepted' ? 'success' : 
                                                 reg.status === 'rejected' ? 'danger' : 'warning'
                                              }
                                              className="whitespace-nowrap flex-shrink-0"
                                            >
                                              {reg.status === 'accepted' ? <CheckCircle size={12} className="mr-1 inline" /> : null}
                                              {reg.status === 'rejected' ? <XCircle size={12} className="mr-1 inline" /> : null}
                                              {reg.status === 'pending' ? <Clock size={12} className="mr-1 inline" /> : null}
                                              Registration: {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                                            </Badge>
                                            
                                            {reg.status === 'accepted' && (
                                               <Badge 
                                                 variant={
                                                    reg.attendanceStatus === 'present' ? 'success' : 
                                                    reg.attendanceStatus === 'absent' ? 'danger' : 'secondary'
                                                 }
                                                 className="whitespace-nowrap flex-shrink-0"
                                               >
                                                 {reg.attendanceStatus === 'present' ? <CheckCircle size={12} className="mr-1 inline" /> : null}
                                                 {reg.attendanceStatus === 'absent' ? <XCircle size={12} className="mr-1 inline" /> : null}
                                                 {reg.attendanceStatus === 'pending' ? <Clock size={12} className="mr-1 inline" /> : null}
                                                 Attendance: {reg.attendanceStatus.charAt(0).toUpperCase() + reg.attendanceStatus.slice(1)}
                                               </Badge>
                                            )}
                                         </div>
                                      </div>
                                      <div className="flex flex-col gap-2 mt-3 text-sm font-medium text-secondary-500 dark:text-secondary-300 w-full lg:flex-row lg:flex-wrap">
                                         <div className="flex items-center bg-secondary-100 dark:bg-secondary-800 px-3 py-2 rounded-lg break-words w-full lg:w-auto">
                                            <Clock className="w-4 h-4 mr-2 text-secondary-400 flex-shrink-0" />
                                            <span className="truncate">{reg.eventId ? format(new Date(reg.eventId.date), 'MMM dd, yyyy - h:mm a') : 'N/A'}</span>
                                         </div>
                                         <div className="flex items-center bg-secondary-100 dark:bg-secondary-800 px-3 py-2 rounded-lg break-words w-full lg:w-auto">
                                            <MapPin className="w-4 h-4 mr-2 text-secondary-400 flex-shrink-0" />
                                            <span className="truncate">{reg.eventId?.venue || 'N/A'}</span>
                                         </div>
                                         <div className="flex items-center bg-secondary-100 dark:bg-secondary-800 px-3 py-2 rounded-lg break-words w-full lg:w-auto">
                                            <Users className="w-4 h-4 mr-2 text-secondary-400 flex-shrink-0" />
                                            <span className="truncate">{reg.eventId?.clubId?.name || 'College Admin'}</span>
                                         </div>
                                      </div>
                                   </div>
                                   
                                   {reg.status === 'accepted' && reg.attendanceStatus !== 'present' && (
                                      <div className="mt-4 md:mt-0 w-full md:w-auto flex-shrink-0">
                                        <Button 
                                           onClick={() => setIsScanModalOpen(true)}
                                           className="w-full md:w-auto shadow-sm"
                                           variant="secondary"
                                        >
                                           <QrCode className="-ml-1 mr-2 h-4 w-4 text-primary-600 dark:text-primary-400" />
                                           Scan QR Attendance
                                        </Button>
                                     </div>
                                  )}
                                  
                                  {reg.attendanceStatus === 'present' && (
                                    <div className="mt-2 md:mt-0 flex-shrink-0">
                                       <Button 
                                          onClick={() => generateCertificate(reg._id, reg.eventId?.title || 'Event')}
                                          className={`w-full md:w-auto shadow-sm text-white border-transparent ${reg.certificateIssued ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                                          disabled={generateCertMutation.isPending}
                                       >
                                          {reg.certificateIssued ? (
                                             <>
                                               <Download className="-ml-1 mr-2 h-4 w-4" />
                                               Download Certificate
                                             </>
                                          ) : (
                                             <>
                                               <Award className="-ml-1 mr-2 h-4 w-4" />
                                               Generate Certificate (AI)
                                             </>
                                          )}
                                       </Button>
                                    </div>
                                  )}
                               </div>
                            </li>
                         ))}
                      </ul>
                   )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <ProfileSettings />
            )}
         </motion.div>
      </AnimatePresence>

      <Modal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)}
        title="Event Registration"
      >
        <div className="mb-6 bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100 dark:border-primary-800">
           <h4 className="font-bold text-secondary-900 dark:text-white">{selectedEvent?.title}</h4>
           <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-300 mt-2">
              <Calendar size={14} className="mr-2" />
              {selectedEvent && format(new Date(selectedEvent.date), 'MMMM dd, yyyy')}
           </div>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-5">
           <div className="space-y-1">
              <label htmlFor="githubUrl" className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                 GitHub Profile JSON/URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Github size={18} className="text-secondary-400" />
                 </div>
                 <input
                    type="url"
                    id="githubUrl"
                    required
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="input-field pl-10"
                    placeholder="https://github.com/username"
                 />
              </div>
              <p className="text-xs text-secondary-500 mt-1">Required: Your GitHub profile verifies your technical background.</p>
           </div>
           
           <div className="space-y-1">
              <label htmlFor="message" className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                 Additional Message (Optional)
              </label>
              <textarea
                 id="message"
                 value={registerMessage}
                 onChange={(e) => setRegisterMessage(e.target.value)}
                 className="input-field min-h-[100px] resize-y"
                 placeholder="Why are you interested in joining?"
              />
           </div>

           <div className="pt-4 border-t border-secondary-200 dark:border-secondary-800 flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={() => setIsRegisterModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={registerMutation.isPending} className="min-w-[140px]">Confirm Registration</Button>
           </div>
        </form>
      </Modal>

      <Modal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        title="Scan Event QR Code"
        className="max-w-md"
      >
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-secondary-900 rounded-xl">
           <div className="w-full aspect-square bg-black overflow-hidden rounded-2xl shadow-inner border-[4px] border-primary-100 dark:border-primary-900/50 mb-6 relative">
              <div id="qr-reader" className="w-full h-full"></div>
           </div>
           
           <h4 className="text-lg font-bold text-secondary-900 dark:text-white text-center mb-2">Center QR Code</h4>
           <p className="text-sm text-secondary-500 dark:text-secondary-300 text-center max-w-xs">
              Align the event QR code within the frame to verify your attendance instantly.
           </p>
           
           <div className="w-full mt-6 flex justify-end">
              <Button type="button" variant="secondary" onClick={() => setIsScanModalOpen(false)}>Cancel</Button>
           </div>
        </div>
      </Modal>

    </SidebarLayout>
  );
};

export default StudentDashboard;
