import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useDashboardStats, useEvents, useAllClubs, useDeleteEvent } from '../hooks/useApi';
import { Calendar, Users, Award, CheckCircle, Activity, User as UserIcon, Trash2, MapPin, Building } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import SidebarLayout from '../components/layout/SidebarLayout';
import ProfileSettings from '../components/ProfileSettings';

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview'); // overview, events, clubs

  // React Query Hooks
  const { data: stats } = useDashboardStats('faculty');
  const { data: events = [], isLoading: eventsLoading } = useEvents(); 
  const { data: clubs = [], isLoading: clubsLoading } = useAllClubs();
  const deleteEventMutation = useDeleteEvent();

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to officially delete this event? This action will remove it globally.')) {
      deleteEventMutation.mutate(id);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  const navigation = [
    { id: 'overview', label: 'Platform Pulse', icon: Activity, activeTabId: activeTab, onClick: setActiveTab },
    { id: 'events', label: 'Events Ledger', icon: Calendar, activeTabId: activeTab, onClick: setActiveTab },
    { id: 'clubs', label: 'Clubs Ledger', icon: Building, activeTabId: activeTab, onClick: setActiveTab },
    { id: 'profile', label: 'Profile Settings', icon: UserIcon, activeTabId: activeTab, onClick: setActiveTab }
  ];

  return (
    <SidebarLayout navigation={navigation} title="Faculty Dashboard">
      <AnimatePresence mode="wait">
         <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
         >
            {activeTab === 'overview' && (
              <>
                {/* Stats Row */}
                {stats && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-secondary-100 dark:border-secondary-800">
                      <div>
                        <p className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-1">Supervised Events</p>
                        <h4 className="text-4xl font-extrabold text-secondary-900 dark:text-white">{stats.totalEvents || 0}</h4>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 flex items-center justify-center">
                        <Calendar size={28} />
                      </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-secondary-100 dark:border-secondary-800">
                      <div>
                        <p className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-1">Total Registrations</p>
                        <h4 className="text-4xl font-extrabold text-secondary-900 dark:text-white">{stats.totalRegistrations || 0}</h4>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center">
                        <Users size={28} />
                      </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-secondary-100 dark:border-secondary-800">
                      <div>
                        <p className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-1">Average Attendance</p>
                        <h4 className="text-4xl font-extrabold text-secondary-900 dark:text-white">
                          {stats.totalEvents > 0 && stats.totalAttended ? Math.round(stats.totalAttended / stats.totalEvents) : 0}
                        </h4>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center">
                        <Activity size={28} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Charts Area */}
                {stats && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 mb-8">
                     
                     <div className="glass-panel p-6 rounded-2xl border border-secondary-100 dark:border-secondary-800">
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Events by Category</h3>
                        <div className="h-64 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stats.eventsByCategoryData}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-secondary-200)" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-secondary-500)', fontSize: 12}} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-secondary-500)', fontSize: 12}} />
                                 <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-secondary-800)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                 <Bar dataKey="count" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} barSize={32} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     <div className="glass-panel p-6 rounded-2xl border border-secondary-100 dark:border-secondary-800">
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Platform Activity Trends</h3>
                        <div className="h-64 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={stats.approvalTrendsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-secondary-200)" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-secondary-500)', fontSize: 12}} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-secondary-500)', fontSize: 12}} />
                                 <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-secondary-800)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                 <Line type="monotone" dataKey="Approvals" stroke="var(--color-accent-400)" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                              </LineChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                  </motion.div>
                )}

                <div className="glass-panel p-8 rounded-2xl mt-8">
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">Recent Activity Reports</h3>
                  <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-8 text-center">
                    <Award className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                    <h4 className="text-lg font-medium text-secondary-900 dark:text-white">No new reports generated</h4>
                    <p className="text-secondary-500 mt-2">Reports from club admins will appear here after events conclude.</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'events' && (
              <div className="glass-panel p-8 rounded-2xl">
                 <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">Global Events Directory</h3>
                 {eventsLoading ? (
                   <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full"></div></div>
                 ) : events.length === 0 ? (
                   <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-8 text-center text-secondary-500">No events found.</div>
                 ) : (
                   <div className="grid grid-cols-1 gap-4">
                     {events.map(event => (
                       <div key={event._id} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md">
                         <div>
                           <div className="flex items-center gap-3 mb-2">
                             <h4 className="text-lg font-bold text-secondary-900 dark:text-white">{event.title}</h4>
                             <Badge variant={event.status === 'active' ? 'success' : 'secondary'}>{event.status || 'Active'}</Badge>
                           </div>
                           <div className="flex flex-wrap gap-4 text-sm text-secondary-500 dark:text-secondary-300">
                             <span className="flex items-center"><Calendar size={14} className="mr-1.5" />{format(new Date(event.date), 'MMM dd, yyyy h:mm a')}</span>
                             <span className="flex items-center"><MapPin size={14} className="mr-1.5" />{event.venue}</span>
                             <span className="flex items-center"><Users size={14} className="mr-1.5" />Capacity: {event.maxParticipants}</span>
                           </div>
                         </div>
                         <Button 
                           type="button"
                           variant="outline" 
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             handleDeleteEvent(event._id);
                           }}
                           className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 shadow-sm"
                         >
                           <Trash2 size={16} className="mr-2" />
                           Delete Event
                         </Button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'clubs' && (
              <div className="glass-panel p-8 rounded-2xl">
                 <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">Global Clubs Directory</h3>
                 {clubsLoading ? (
                   <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full"></div></div>
                 ) : clubs.length === 0 ? (
                   <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-8 text-center text-secondary-500">No clubs found.</div>
                 ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {clubs.map(club => (
                       <div key={club._id} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-6 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700/50">
                         <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-4">
                           <Building size={30} />
                         </div>
                         <h4 className="text-lg font-bold text-secondary-900 dark:text-white mb-2">{club.name}</h4>
                         <Badge 
                           variant={
                              club.status === 'approved' ? 'success' : 
                              club.status === 'rejected' ? 'danger' : 'warning'
                           }
                           className="mb-4"
                         >
                           {club.status.charAt(0).toUpperCase() + club.status.slice(1)}
                         </Badge>
                         <div className="w-full bg-secondary-50 dark:bg-secondary-800/50 rounded-lg py-2 px-3 flex justify-between text-sm">
                           <span className="text-secondary-500">Category</span>
                           <span className="font-medium text-secondary-900 dark:text-white">{club.category || 'General'}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'profile' && (
              <ProfileSettings />
            )}
         </motion.div>
      </AnimatePresence>
    </SidebarLayout>
  );
};

export default FacultyDashboard;
