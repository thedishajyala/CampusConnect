import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, LogOut, User, Bell } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useContext(NotificationContext);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
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
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-md shadow-sm border-b border-secondary-200 dark:border-secondary-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex text-center py-4 text-2xl font-extrabold tracking-tight">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                Campus
              </span>
              <span className="text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                Connect
              </span>
            </Link>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {user ? (
              <div className="flex items-center space-x-6">
                <Link
                  to={`/${user.role}-dashboard`}
                  className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors capitalize"
                >
                  Dashboard
                </Link>
                {/* Notification Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className="relative p-2 rounded-full text-secondary-500 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus:outline-none"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-secondary-900 flex items-center justify-center shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                     {notifOpen && (
                        <motion.div
                           initial={{ opacity: 0, y: 10, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                           transition={{ duration: 0.15 }}
                           className="absolute right-0 mt-2 w-80 bg-white dark:bg-secondary-800 rounded-xl shadow-xl border border-secondary-100 dark:border-secondary-700 py-2 z-50 overflow-hidden"
                        >
                           <div className="px-4 py-3 border-b border-secondary-100 dark:border-secondary-700 flex justify-between items-center bg-secondary-50 dark:bg-secondary-900/50">
                              <h3 className="text-sm font-bold text-secondary-900 dark:text-white">Notifications</h3>
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
                
                <div className="relative border-l pl-6 border-secondary-200 dark:border-secondary-700" ref={dropdownRef}>
                  <button 
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-3 focus:outline-none"
                  >
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="profile" className="w-8 h-8 rounded-full border border-secondary-200 dark:border-secondary-700 object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center border border-secondary-200 dark:border-secondary-700">
                        <User size={16} className="text-secondary-500 dark:text-secondary-400" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-200 hidden lg:block">{user.name}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {profileOpen && (
                     <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-secondary-200 dark:border-secondary-700 py-2 z-50">
                        <div className="px-4 py-2 border-b border-secondary-200 dark:border-secondary-700 mb-1">
                           <p className="text-sm font-semibold text-secondary-900 dark:text-white capitalize">{user.role}</p>
                           <p className="text-xs text-secondary-500 truncate">{user.email}</p>
                        </div>
                        <Link 
                           to={`/${user.role}-dashboard`}
                           className="block w-full text-left px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                           onClick={() => setProfileOpen(false)}
                        >
                           Dashboard
                        </Link>
                        <button
                           onClick={() => {
                             setProfileOpen(false);
                             handleLogout();
                           }}
                           className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 mt-1"
                        >
                           <LogOut size={16} className="mr-2" />
                           Sign out
                        </button>
                     </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center md:hidden space-x-2">
             <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white focus:outline-none p-2"
             >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
         <div className="md:hidden border-t border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 absolute w-full shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
               {user ? (
                  <>
                     <div className="px-3 py-2 flex items-center mb-2">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="profile" className="w-10 h-10 rounded-full mr-3 object-cover border dark:border-secondary-700" />
                        ) : (
                           <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mr-3 border dark:border-secondary-700">
                              <User size={20} className="text-secondary-500 dark:text-secondary-400" />
                           </div>
                        )}
                        <div>
                           <div className="text-base font-medium text-secondary-800 dark:text-white">{user.name}</div>
                           <div className="text-sm font-medium text-secondary-500 dark:text-secondary-400 capitalize">{user.role}</div>
                        </div>
                     </div>
                     <Link
                       to={`/${user.role}-dashboard`}
                       className="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 capitalize"
                       onClick={() => setIsOpen(false)}
                     >
                        Dashboard
                     </Link>
                     <button
                       onClick={handleLogout}
                       className="w-full text-left max-w-full block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                     >
                        Log out
                     </button>
                  </>
               ) : (
                  <>
                     <Link
                       to="/login"
                       className="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                       onClick={() => setIsOpen(false)}
                     >
                        Log in
                     </Link>
                     <Link
                       to="/signup"
                       className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 dark:text-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                       onClick={() => setIsOpen(false)}
                     >
                        Sign up
                     </Link>
                  </>
               )}
            </div>
         </div>
      )}
    </nav>
  );
};

export default Navbar;
