import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useDashboardStats, useAllClubs, useApproveClub, useRejectClub, useEvents, useDeleteEvent, useDeleteClub } from '../hooks/useApi';
import { Shield, Users, User as UserIcon, Calendar, Activity, Database, Crown, CheckCircle, XCircle, Clock, AlertCircle, Trash2, MapPin, Building } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import SidebarLayout from '../components/layout/SidebarLayout';
import ProfileSettings from '../components/ProfileSettings';

const SuperadminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, clubs

  // React Query Hooks
  // React Query Hooks
  const { data: stats } = useDashboardStats('superadmin');
  const { data: clubs = [], isLoading: clubsLoading } = useAllClubs();
  const { data: events = [], isLoading: eventsLoading } = useEvents();

  const approveClubMutation = useApproveClub();
  const rejectClubMutation = useRejectClub();
  const deleteEventMutation = useDeleteEvent();
  const deleteClubMutation = useDeleteClub();

  const handleDeleteEvent = async (id) => {
    if (window.confirm('WARNING: Are you sure you want to officially delete this event globally?')) {
      deleteEventMutation.mutate(id);
    }
  };

  const handleDeleteClub = (id) => {
    if (window.confirm('WARNING: Are you sure you want to completely delete this club from the database? This cannot be undone.')) {
      deleteClubMutation.mutate(id);
    }
  };

  const handleApprove = (id) => approveClubMutation.mutate(id);
  const handleReject = (id) => rejectClubMutation.mutate(id);
  
  const handleRevokeApproval = (id) => {
    if (window.confirm('WARNING: Are you sure you want to revoke approval and completely reject this active club?')) {
      rejectClubMutation.mutate(id);
    }
  };

  const pendingClubs = clubs.filter(c => c.status === 'pending');
  const activeClubs = clubs.filter(c => c.status !== 'pending');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const navigation = [
    { id: 'overview', label: 'System Overview', icon: Activity, activeTabId: activeTab, onClick: setActiveTab },
    { id: 'users', label: 'User Management', icon: Users, activeTabId: activeTab, onClick: setActiveTab },
    { id: 'clubs', label: 'Organizations', icon: Building, activeTabId: activeTab, onClick: setActiveTab },
    { id: 'events', label: 'Global Events', icon: Calendar, activeTabId: activeTab, onClick: setActiveTab },
    { id: 'profile', label: 'Profile Settings', icon: UserIcon, activeTabId: activeTab, onClick: setActiveTab }
  ];

  return (
    <SidebarLayout navigation={navigation} title="Super Admin">
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
                        <p className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-1">Total Users</p>
                        <h4 className="text-4xl font-extrabold text-secondary-900 dark:text-white">{stats.totalUsers || 0}</h4>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
                        <Users size={28} />
                      </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-secondary-100 dark:border-secondary-800">
                      <div>
                        <p className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-1">Registered Clubs</p>
                        <h4 className="text-4xl font-extrabold text-secondary-900 dark:text-white">{stats.totalClubs || 0}</h4>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center">
                        <Shield size={28} />
                      </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-secondary-100 dark:border-secondary-800">
                      <div>
                        <p className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-1">Total Events Hosted</p>
                        <h4 className="text-4xl font-extrabold text-secondary-900 dark:text-white">{stats.totalEvents || 0}</h4>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 flex items-center justify-center">
                        <Calendar size={28} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Charts Area */}
                {stats && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-8">
                     
                     <div className="glass-panel p-6 rounded-2xl border border-secondary-100 dark:border-secondary-800 lg:col-span-2">
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Platform Growth Trend</h3>
                        <div className="h-72 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={stats.platformGrowthData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                 <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-secondary-200)" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-secondary-500)', fontSize: 12}} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-secondary-500)', fontSize: 12}} />
                                 <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-secondary-800)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                 <Area type="monotone" dataKey="users" stroke="var(--color-primary-500)" fillOpacity={1} fill="url(#colorUsers)" />
                                 <Area type="monotone" dataKey="events" stroke="var(--color-accent-400)" fillOpacity={0.3} fill="var(--color-accent-400)" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     <div className="glass-panel p-6 rounded-2xl border border-secondary-100 dark:border-secondary-800">
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Top Ranked Organizations</h3>
                        <div className="h-64 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stats.topClubsData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-secondary-200)" />
                                 <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'var(--color-secondary-500)', fontSize: 12}} />
                                 <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--color-secondary-500)', fontSize: 12}} />
                                 <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-secondary-800)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                 <Bar dataKey="score" fill="var(--color-accent-500)" radius={[0, 4, 4, 0]} barSize={20} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     <div className="glass-panel p-6 rounded-2xl border border-secondary-100 dark:border-secondary-800">
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">User Role Distribution</h3>
                        <div className="h-64 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie
                                   data={stats.roleDistData}
                                   cx="50%"
                                   cy="50%"
                                   innerRadius={60}
                                   outerRadius={80}
                                   paddingAngle={5}
                                   dataKey="value"
                                   stroke="none"
                                 >
                                    {stats.roleDistData?.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={['var(--color-secondary-300)', 'var(--color-primary-500)', 'var(--color-accent-400)', 'var(--color-primary-700)'][index % 4]} />
                                    ))}
                                 </Pie>
                                 <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-secondary-800)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                              </PieChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                  </motion.div>
                )}

                <div className="glass-panel p-8 rounded-2xl mt-8">
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">System Health</h3>
                  <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-8 text-center">
                    <Database className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                    <h4 className="text-lg font-medium text-secondary-900 dark:text-white">All Systems Operational</h4>
                    <p className="text-secondary-500 mt-2">Database clusters and API endpoints are responding normally.</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <div className="glass-panel p-8 rounded-2xl">
                 <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">User Management Directory</h3>
                 <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-8 text-center border border-dashed border-secondary-300 dark:border-secondary-700">
                    <Users className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                    <h4 className="text-lg font-medium text-secondary-900 dark:text-white">Admin Module Loading</h4>
                    <p className="text-secondary-500 mt-2">The user management view is connected to the backend stats, but the full directory UI is forthcoming.</p>
                 </div>
              </div>
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
                           <div className="flex flex-wrap gap-4 text-sm text-secondary-500 dark:text-secondary-400">
                             <span className="flex items-center"><Calendar size={14} className="mr-1.5" />{format(new Date(event.date), 'MMM dd, yyyy h:mm a')}</span>
                             <span className="flex items-center"><MapPin size={14} className="mr-1.5" />{event.venue}</span>
                             <span className="flex items-center"><Users size={14} className="mr-1.5" />Capacity: {event.maxParticipants}</span>
                           </div>
                         </div>
                         <Button 
                           variant="outline" 
                           onClick={() => handleDeleteEvent(event._id)}
                           className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 shadow-sm"
                         >
                           <Trash2 size={16} className="mr-2" />
                           Force Delete
                         </Button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}
            
            {activeTab === 'clubs' && (
              <div className="space-y-8">
                 {/* Pending Approvals */}
                 <div className="glass-panel p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center">
                          <AlertCircle className="mr-2 text-amber-500" /> Pending Club Approvals
                       </h3>
                       <Badge variant="warning">{pendingClubs.length} Requests</Badge>
                    </div>

                    {clubsLoading ? (
                       <div className="py-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
                    ) : pendingClubs.length === 0 ? (
                       <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-8 text-center border border-dashed border-secondary-300 dark:border-secondary-700">
                          <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-3" />
                          <p className="text-secondary-500">All caught up! No pending club requests.</p>
                       </div>
                    ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingClubs.map(club => (
                             <div key={club._id} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                   <div>
                                      <h4 className="font-bold text-secondary-900 dark:text-white">{club.name}</h4>
                                      <p className="text-xs text-secondary-500">Category: {club.category}</p>
                                   </div>
                                   <Badge variant="warning">Pending</Badge>
                                </div>
                                <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4 line-clamp-2">{club.description}</p>
                                <div className="flex items-center text-xs text-secondary-500 mb-4">
                                   <UserIcon size={12} className="mr-1" /> Requested by: {club.createdBy?.name || 'Unknown User'}
                                </div>
                                <div className="flex space-x-2 pt-3 border-t border-secondary-100 dark:border-secondary-800">
                                   <Button 
                                     type="button" 
                                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApprove(club._id); }} 
                                     className="flex-1 bg-green-600 hover:bg-green-700 text-white border-transparent"
                                   >
                                      <CheckCircle size={16} className="mr-1.5" /> Approve
                                   </Button>
                                   <Button 
                                     type="button" 
                                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReject(club._id); }} 
                                     variant="danger" 
                                     className="flex-1"
                                   >
                                      <XCircle size={16} className="mr-1.5" /> Reject
                                   </Button>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>

                 {/* Active Clubs */}
                 <div className="glass-panel p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center">
                          <Shield className="mr-2 text-primary-500" /> Organization Hub
                       </h3>
                       <Badge variant="primary">{activeClubs.length} Processed</Badge>
                    </div>

                    {clubsLoading ? (
                       <div className="py-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
                    ) : activeClubs.length === 0 ? (
                       <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-8 text-center border border-dashed border-secondary-300 dark:border-secondary-700">
                          <Shield className="mx-auto h-10 w-10 text-secondary-400 mb-3" />
                          <p className="text-secondary-500">No organizations registered on the platform yet.</p>
                       </div>
                    ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {activeClubs.map(club => (
                             <div key={club._id} className="bg-secondary-50 dark:bg-secondary-800/30 border border-secondary-200 dark:border-secondary-800 rounded-xl p-5">
                                <div className="flex justify-between items-start mb-2">
                                   <h4 className="font-bold text-secondary-900 dark:text-white">{club.name}</h4>
                                   <Badge variant={club.status === 'approved' ? 'success' : 'danger'}>
                                      {club.status.toUpperCase()}
                                   </Badge>
                                </div>
                                  <div className="flex justify-between items-end">
                                    <p className="text-xs text-secondary-500 mb-0">Admin: {club.createdBy?.name || 'Unknown'}</p>
                                    <div className="flex space-x-3">
                                      {club.status === 'approved' && (
                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRevokeApproval(club._id);
                                          }}
                                          className="text-xs font-bold text-amber-500 hover:text-amber-700 transition-colors flex items-center"
                                        >
                                          <XCircle size={14} className="mr-1" /> Revoke
                                        </button>
                                      )}
                                      <button 
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleDeleteClub(club._id);
                                        }}
                                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center"
                                      >
                                        <Trash2 size={14} className="mr-1" /> Delete
                                      </button>
                                    </div>
                                  </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
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

export default SuperadminDashboard;
