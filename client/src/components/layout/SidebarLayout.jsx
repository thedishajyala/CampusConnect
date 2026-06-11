import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Bell, Search, Menu, X, CheckSquare, Settings, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarLayout = ({ children, navigation, title = "Dashboard" }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useContext(NotificationContext);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-primary-800 text-white w-64 md:w-72 shadow-2xl relative z-20">
      {/* Profile Section */}
      <div className="flex flex-col items-center justify-center p-8 border-b border-primary-700">
        <div className="w-20 h-20 rounded-full border-2 border-primary-400 p-1 mb-4 flex items-center justify-center overflow-hidden bg-primary-900">
          {user?.profileImage ? (
             <img src={user.profileImage} alt={user?.name} className="w-full h-full rounded-full object-cover" />
          ) : (
             <span className="text-3xl font-bold text-primary-300">{user?.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
        <h2 className="text-lg font-bold">{user?.name || 'User'}</h2>
        <p className="text-xs text-primary-300 relative truncate px-2 text-center w-full">{user?.email}</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 overflow-y-auto w-full pl-6">
        <ul className="space-y-4 relative w-full pr-0">
          {navigation.map((item) => {
             const Icon = item.icon;
             // The reference uses active states that stretch all the way to the right and merge into the background
             // Because the background of the app is icy blue, the active tab must also be icy blue with rounded left corners.
             const isActive = item.id === item.activeTabId;

             return (
              <li key={item.id} className="relative w-full">
                <button
                  onClick={() => item.onClick(item.id)}
                  className={`w-full flex justify-between items-center py-3 px-4 rounded-l-3xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-secondary-50 text-primary-800 shadow-sm relative z-10 font-bold' 
                      : 'text-primary-100 hover:bg-primary-700/50 hover:text-white'
                  } ${item.locked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary-600' : 'text-primary-300 group-hover:text-white'}`} />
                    {item.label}
                  </div>
                  {item.locked && <Lock size={14} className="text-primary-300 ml-2" />}
                </button>
                {/* Visual connectors for active state to make it look seamless with the body */}
                {isActive && (
                   <>
                      {/* Top curve */}
                      <div className="absolute -top-4 right-0 w-4 h-4 bg-transparent shadow-[4px_4px_0_4px_#f4f7f9] rounded-br-[100%] pointer-events-none z-0"></div>
                      {/* Bottom curve */}
                      <div className="absolute -bottom-4 right-0 w-4 h-4 bg-transparent shadow-[4px_-4px_0_4px_#f4f7f9] rounded-tr-[100%] pointer-events-none z-0"></div>
                   </>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Support / Misc */}
      <div className="py-4 pl-6 border-t border-primary-700 relative w-full pr-0">
         <button onClick={handleLogout} className="relative z-50 cursor-pointer w-full flex items-center py-3 px-4 rounded-l-3xl transition-all duration-300 text-primary-100 hover:bg-primary-700/50 hover:text-white">
            <LogOut className="w-5 h-5 mr-3 text-primary-300 pointer-events-none" /> Logout
         </button>
      </div>
    </div>
  );

  return (
    <div className="flex bg-secondary-50 min-h-screen font-sans antialiased overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block shadow-2xl z-20 sticky top-0 h-screen">
         <SidebarContent />
      </div>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 backdrop-blur-xl bg-secondary-900 text-white z-50 px-4 flex items-center justify-between shadow-lg border-b border-white/5 transition-all duration-300">
        <div className="flex justify-center items-center w-8 h-8 rounded-full bg-secondary-800 border border-secondary-600 font-bold overflow-hidden shadow-sm">
           {user?.profileImage ? (
             <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
           ) : (
             user?.name?.charAt(0)
           )}
        </div>
        <h1 className="font-bold tracking-wide text-white">{title}</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all shadow-sm">
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-secondary-900/60 z-40 md:hidden backdrop-blur-md"
               onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
               initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               className="fixed top-0 left-0 bottom-0 z-50 shadow-2xl"
            >
               <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
         {/* Top Banner (Inside Main Area) */}
         <div className="hidden md:flex items-center justify-between p-8 pb-4">
            <h1 className="text-3xl font-extrabold text-primary-800 flex items-center gap-3">
               Welcome {user?.name?.split(' ')[0]}
               <motion.span 
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5 }}
                  className="origin-bottom-right inline-block"
               >
                  👋
               </motion.span>
            </h1>
            
            <div className="flex items-center space-x-6">
               {/* Custom Search Bar */}
               <div className="relative group">
                  <input 
                     type="text" 
                     placeholder="Search..." 
                     className="pl-5 pr-12 py-2.5 rounded-full border border-white/60 dark:border-secondary-700/50 bg-white/50 dark:bg-secondary-800/50 backdrop-blur-md outline-none focus:ring-4 focus:ring-primary-500/20 w-72 shadow-sm transition-all group-hover:bg-white/80 dark:group-hover:bg-secondary-800/80 font-medium text-sm"
                  />
                  <div className="absolute right-2 top-1.5 w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center pointer-events-none group-hover:bg-primary-200 dark:group-hover:bg-primary-800/60 transition-colors">
                     <Search className="text-primary-600 dark:text-primary-400 w-4 h-4" />
                  </div>
               </div>
               
               {/* Controls */}
               <div className="relative" ref={notifRef}>
                  <button 
                     onClick={() => setNotifOpen(!notifOpen)}
                     className={`relative p-3 rounded-full border ${notifOpen ? 'bg-white dark:bg-secondary-700 border-primary-200 dark:border-primary-700 shadow-md' : 'bg-white/60 dark:bg-secondary-800/60 border-white/50 dark:border-secondary-700/50 hover:bg-white dark:hover:bg-secondary-700 hover:shadow-md'} backdrop-blur-md transition-all duration-300 focus:outline-none`}
                  >
                     <Bell className={`w-5 h-5 ${notifOpen ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-600 dark:text-secondary-300'}`} />
                     {unreadCount > 0 && (
                       <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 border-2 border-white dark:border-secondary-800 rounded-full shadow-sm animate-pulse-soft"></span>
                     )}
                  </button>

                  <AnimatePresence>
                     {notifOpen && (
                        <motion.div
                           initial={{ opacity: 0, y: 10, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                           transition={{ duration: 0.15 }}
                           className="absolute right-0 mt-4 w-80 bg-white dark:bg-secondary-800 rounded-xl shadow-2xl border border-secondary-100 dark:border-secondary-700 py-2 z-50 overflow-hidden"
                        >
                           <div className="px-4 py-3 border-b border-secondary-100 dark:border-secondary-700 flex justify-between items-center bg-secondary-50 dark:bg-secondary-900/50">
                              <h3 className="text-sm font-bold text-secondary-900 dark:text-white">Recent Notifications</h3>
                              {unreadCount > 0 && (
                                <button 
                                  onClick={() => markAsRead()} 
                                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                                >
                                  Mark all as read
                                </button>
                              )}
                           </div>
                           <div className="max-h-80 overflow-y-auto">
                              {notifications.length === 0 ? (
                                 <div className="px-4 py-6 text-center text-secondary-500 flex flex-col items-center">
                                    <Bell size={24} className="mb-2 text-secondary-300" />
                                    <p className="text-sm">No notifications yet</p>
                                 </div>
                              ) : (
                                 notifications.map((notif) => (
                                    <div 
                                      key={notif._id} 
                                      className={`px-4 py-3 border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 cursor-pointer transition-colors ${!notif.read ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''}`}
                                      onClick={() => {
                                         if(!notif.read) markAsRead(notif._id);
                                         if(notif.link) {
                                            navigate(notif.link);
                                            setNotifOpen(false);
                                         }
                                      }}
                                    >
                                       <div className="flex justify-between items-start mb-1">
                                          <span className="text-sm font-bold text-secondary-900 dark:text-white">{notif.title}</span>
                                          {!notif.read && <span className="h-2 w-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></span>}
                                       </div>
                                       <p className="text-xs text-secondary-600 dark:text-secondary-300 line-clamp-2">{notif.message}</p>
                                       <span className="text-[10px] text-secondary-400 dark:text-secondary-500 mt-2 block">
                                          {new Date(notif.createdAt).toLocaleDateString()}
                                       </span>
                                    </div>
                                 ))
                              )}
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         </div>

         {/* Dashboard Title Header */}
         <div className="px-8 mt-16 md:mt-0 flex items-center justify-between">
            <h2 className="text-4xl text-primary-900/10 font-black tracking-tighter hidden md:block select-none">{title.toUpperCase()}</h2>
         </div>

         {/* Inner Configurable Content Container */}
         <div className="flex-1 p-4 sm:p-8 pt-4 w-full max-w-[1600px] mx-auto z-10 relative">
            {children}
         </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
