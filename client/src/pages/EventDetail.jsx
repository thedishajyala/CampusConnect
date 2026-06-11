import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { Calendar, Clock, MapPin, Users, Award, Building, ArrowLeft, Github, CheckCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useRegisterEvent, useMyParticipations } from '../hooks/useApi';
import toast from 'react-hot-toast';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);

  // Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  // Fetch Event Details
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`);
      return data;
    },
    enabled: !!id,
    retry: false
  });

  // Check Registration Status
  const { data: myRegistrations = [], isLoading: regLoading } = useMyParticipations();
  const registerMutation = useRegisterEvent();

  const registration = myRegistrations.find(reg => reg.eventId?._id === id);
  const isRegistered = !!registration;
  
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!event) return;
    
    try {
      await registerMutation.mutateAsync({ 
          eventId: event._id, 
          githubProfile: githubUrl, 
          message: registerMessage 
      });
      setIsRegisterModalOpen(false);
      setGithubUrl('');
      setRegisterMessage('');
      
      // Update the unread notification bell state immediately
      if (fetchNotifications) fetchNotifications();
      
      // The useMyParticipations query will invalidate and refetch,
      // updating the isRegistered boolean automatically
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-secondary-50 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (error || !event) return (
    <div className="min-h-screen bg-secondary-50 flex flex-col justify-center items-center p-4">
       <div className="glass-panel p-8 text-center max-w-md w-full">
         <Info size={48} className="mx-auto text-secondary-400 mb-4" />
         <h2 className="text-2xl font-bold text-secondary-900 mb-2">Event Not Found</h2>
         <p className="text-secondary-500 mb-6">The event you are looking for does not exist or has been removed.</p>
         <Button onClick={() => navigate(-1)} className="w-full">Go Back</Button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50 pb-20 font-sans antialiased">
      {/* Top Banner & Header */}
      <div className="relative bg-secondary-900 h-64 md:h-80 w-full overflow-hidden">
         {event.coverImageUrl ? (
            <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover opacity-50" />
         ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-secondary-900 to-indigo-900 opacity-90"></div>
         )}
         
         <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

         <div className="absolute inset-0 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white mb-auto transition-colors focus:outline-none"
            >
               <ArrowLeft size={20} />
            </button>
         </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-10 w-full">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 sm:p-10 rounded-2xl shadow-xl w-full"
         >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
               <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                     <Badge variant="primary" className="bg-primary-100 text-primary-800 border-primary-200 uppercase tracking-widest text-[10px]">
                        {event.category || 'General'}
                     </Badge>
                     {isRegistered && (
                        <Badge variant="success" className="shadow-sm">
                           <CheckCircle size={12} className="mr-1 inline" /> Registered
                        </Badge>
                     )}
                     <Badge variant={event.status === 'active' ? 'success' : 'secondary'} className="uppercase tracking-widest text-[10px]">
                        {event.status || 'Active'}
                     </Badge>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-secondary-900 dark:text-white leading-tight mb-4 tracking-tighter">
                     {event.title}
                  </h1>

                  <div className="flex items-center text-secondary-600 dark:text-secondary-400 font-medium">
                     <span className="flex items-center bg-secondary-100 dark:bg-secondary-800 px-3 py-1.5 rounded-lg mr-3 shadow-sm border border-secondary-200 dark:border-secondary-700">
                        <Building size={16} className="mr-2 text-primary-600 dark:text-primary-400" />
                        {event.clubId?.name || "College Admin"}
                     </span>
                  </div>
               </div>

               {/* Right Side Action Box */}
               <div className="w-full md:w-80 flex-shrink-0 bg-secondary-50 dark:bg-secondary-800/50 p-6 rounded-2xl border border-secondary-200 dark:border-secondary-700 shadow-inner">
                 <div className="space-y-4 mb-6">
                    <div className="flex items-center text-secondary-700 dark:text-secondary-300">
                       <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mr-4 text-primary-600 dark:text-primary-400">
                          <Calendar size={20} />
                       </div>
                       <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-secondary-500">Date</p>
                          <p className="font-semibold">{format(new Date(event.date), 'MMMM dd, yyyy')}</p>
                       </div>
                    </div>
                    <div className="flex items-center text-secondary-700 dark:text-secondary-300">
                       <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mr-4 text-purple-600 dark:text-purple-400">
                          <Clock size={20} />
                       </div>
                       <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-secondary-500">Time</p>
                          <p className="font-semibold">{format(new Date(event.date), 'h:mm a')}</p>
                       </div>
                    </div>
                    <div className="flex items-center text-secondary-700 dark:text-secondary-300">
                       <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/40 flex items-center justify-center mr-4 text-accent-600 dark:text-accent-400">
                          <MapPin size={20} />
                       </div>
                       <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-secondary-500">Location</p>
                          <p className="font-semibold">{event.venue}</p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
                     {user?.role === 'student' ? (
                       <Button
                          onClick={() => setIsRegisterModalOpen(true)}
                          disabled={isRegistered || event.status !== 'active'}
                          variant={isRegistered ? "secondary" : "primary"}
                          className="w-full h-12 text-lg shadow-sm"
                       >
                          {isRegistered ? 'Already Registered' : event.status !== 'active' ? 'Event Closed' : 'Register Now'}
                       </Button>
                     ) : (
                       <div className="text-center p-3 bg-secondary-100 dark:bg-secondary-800 rounded-lg text-sm text-secondary-600 dark:text-secondary-400 font-medium border border-dashed border-secondary-300 dark:border-secondary-600">
                          Registration available for students only
                       </div>
                     )}
                 </div>
               </div>
            </div>

            <div className="border-t border-secondary-200 dark:border-secondary-800 pt-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
               <div className="lg:col-span-2 space-y-8">
                  <section>
                     <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">About the Event</h3>
                     <div className="prose dark:prose-invert max-w-none text-secondary-700 dark:text-secondary-300 leading-relaxed text-lg whitespace-pre-wrap">
                        {event.description}
                     </div>
                  </section>
               </div>

               <div className="space-y-6">
                  <div className="bg-secondary-50 dark:bg-secondary-800/30 p-6 rounded-xl border border-secondary-200 dark:border-secondary-800">
                     <h4 className="font-bold border-b border-secondary-200 dark:border-secondary-700 pb-2 mb-4 text-secondary-900 dark:text-white flex items-center">
                        <Info size={18} className="mr-2 text-primary-500" /> Event Details
                     </h4>
                     <ul className="space-y-3 font-medium text-sm text-secondary-700 dark:text-secondary-300">
                        <li className="flex justify-between items-center py-1">
                           <span className="text-secondary-500 flex items-center"><Users size={14} className="mr-1.5" /> Capacity</span>
                           <span>{event.maxParticipants} Seats</span>
                        </li>
                        <li className="flex justify-between items-center py-1">
                           <span className="text-secondary-500 flex items-center"><Award size={14} className="mr-1.5" /> Certificates</span>
                           <span>Provided</span>
                        </li>
                        <li className="flex justify-between items-center py-1">
                           <span className="text-secondary-500 flex items-center"><Building size={14} className="mr-1.5" /> Organizer</span>
                           <span className="truncate max-w-[120px]">{event.clubId?.name || "Admin"}</span>
                        </li>
                     </ul>
                  </div>

                  {isRegistered && registration && (
                     <div className="bg-primary-50 dark:bg-primary-900/10 p-6 rounded-xl border border-primary-200 dark:border-primary-800/50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                           <CheckCircle size={80} />
                        </div>
                        <h4 className="font-bold mb-2 text-primary-900 dark:text-primary-100 flex items-center relative z-10">
                           Your Registration Status
                        </h4>
                        <div className="relative z-10">
                           <Badge 
                             variant={
                                registration.status === 'accepted' ? 'success' : 
                                registration.status === 'rejected' ? 'danger' : 'warning'
                             }
                             className="mb-3"
                           >
                             Form: {registration.status.toUpperCase()}
                           </Badge>
                           <p className="text-xs text-primary-700/80 dark:text-primary-300/80">
                              Applied on {format(new Date(registration.createdAt), 'MMM dd, yyyy')}
                           </p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </motion.div>
      </main>

      <Modal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)}
        title="Event Registration"
      >
        <div className="mb-6 bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100 dark:border-primary-800">
           <h4 className="font-bold text-secondary-900 dark:text-white">{event.title}</h4>
           <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400 mt-2">
              <Calendar size={14} className="mr-2" />
              {format(new Date(event.date), 'MMMM dd, yyyy')}
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
                    disabled={registerMutation.isPending}
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
                 disabled={registerMutation.isPending}
              />
           </div>

           <div className="pt-4 border-t border-secondary-200 dark:border-secondary-800 flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={() => setIsRegisterModalOpen(false)} disabled={registerMutation.isPending}>Cancel</Button>
              <Button type="submit" isLoading={registerMutation.isPending} className="min-w-[140px]">Confirm Registration</Button>
           </div>
        </form>
      </Modal>

    </div>
  );
};

export default EventDetail;
