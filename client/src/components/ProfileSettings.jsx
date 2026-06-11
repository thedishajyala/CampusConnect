import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Camera, Edit2, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import { Badge } from './ui/Badge';
import Input from './ui/Input';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const { user, setUser } = useContext(AuthContext);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
  const [profileLoading, setProfileLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const formData = new FormData();
      formData.append('name', editName);
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const { data } = await api.put('/users/update', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser({ ...user, name: data.name, profileImage: data.profileImage });
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
       console.error('Error updating profile:', error);
       toast.error('Failed to update profile.');
    } finally {
       setProfileLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="glass-panel overflow-hidden">
          <div className="px-6 py-5 border-b border-secondary-200 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-900/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Profile Settings</h3>
            {!isEditingProfile && (
                <button onClick={() => setIsEditingProfile(true)} className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-semibold flex items-center transition-colors px-3 py-1.5 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20">
                  <Edit2 size={16} className="mr-1.5" /> Edit Profile
                </button>
            )}
          </div>
          
          <div className="p-6 sm:p-8">
            <form onSubmit={handleProfileUpdate}>
                <div className="flex flex-col items-center mb-8">
                  <div className="relative h-32 w-32 rounded-full border-4 border-white dark:border-secondary-800 shadow-xl overflow-hidden bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center group mb-5">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile preview" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      ) : (
                        <UserIcon size={50} className="text-secondary-400 transition-transform duration-300 group-hover:scale-110" />
                      )}
                      
                      {isEditingProfile && (
                        <label className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all z-10">
                            <Camera size={24} className="text-white mb-1" />
                            <span className="text-white text-xs font-semibold tracking-wider uppercase">Change</span>
                            <input type="file" accept="image/jpeg, image/png, image/jpg" className="hidden" onChange={handleImageChange} disabled={profileLoading} />
                        </label>
                      )}
                  </div>
                  <div className="text-center">
                      <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">{user?.name}</h2>
                      <p className="text-secondary-500 font-medium">{user?.email}</p>
                      <Badge variant="primary" className="mt-2 uppercase tracking-widest text-[10px]">
                        {user?.role}
                      </Badge>
                  </div>
                </div>

                {isEditingProfile ? (
                  <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-6 pt-6 relative before:absolute before:top-0 before:left-10 before:right-10 before:h-px before:bg-gradient-to-r before:from-transparent before:via-secondary-200 dark:before:via-secondary-700 before:to-transparent"
                  >
                      <Input 
                        id="name" 
                        label="Full Name"
                        icon={UserIcon}
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        disabled={profileLoading}
                      />

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300 ml-1">Profile Picture</label>
                        <div className="flex items-center gap-4">
                           <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-secondary-100/50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700 rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-800 transition-colors text-sm font-medium text-secondary-700 dark:text-secondary-300 focus-within:ring-2 focus-within:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                             <Camera size={16} className="mr-2 text-secondary-500 dark:text-secondary-400" />
                             {profileImage ? 'Change Image' : 'Upload Image'}
                             <input type="file" accept="image/jpeg, image/png, image/jpg" className="hidden" onChange={handleImageChange} disabled={profileLoading} />
                           </label>
                           {profileImage && <span className="text-xs text-secondary-500 truncate max-w-[150px]">{profileImage.name}</span>}
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button 
                            type="button" 
                            variant="secondary"
                            disabled={profileLoading}
                            onClick={() => {
                              setIsEditingProfile(false);
                              setEditName(user?.name);
                              setImagePreview(user?.profileImage);
                              setProfileImage(null);
                            }} 
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={profileLoading}
                            isLoading={profileLoading}
                            className="min-w-[140px]"
                        >
                            Save Changes
                        </Button>
                      </div>
                  </motion.div>
                ) : (
                  <div className="mt-8 pt-8 grid grid-cols-1 md:grid-cols-2 gap-4 relative before:absolute before:top-0 before:left-10 before:right-10 before:h-px before:bg-gradient-to-r before:from-transparent before:via-secondary-200 dark:before:via-secondary-700 before:to-transparent">
                      <div className="bg-secondary-50/50 dark:bg-secondary-900/30 p-5 rounded-2xl border border-secondary-100 dark:border-secondary-800">
                        <p className="text-xs font-bold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1">Account Created</p>
                        <p className="font-semibold text-secondary-900 dark:text-white">{format(new Date(user?.createdAt || new Date()), 'MMMM dd, yyyy')}</p>
                      </div>
                      <div className="bg-secondary-50/50 dark:bg-secondary-900/30 p-5 rounded-2xl border border-secondary-100 dark:border-secondary-800">
                        <p className="text-xs font-bold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1">Login Provider</p>
                        <div className="flex items-center gap-2">
                          {user?.oauthProvider === 'google' && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                          {user?.oauthProvider === 'github' && <div className="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-300"></div>}
                          {user?.oauthProvider === 'local' && <div className="w-2 h-2 rounded-full bg-primary-500"></div>}
                          <p className="font-semibold text-secondary-900 dark:text-white capitalize">{user?.oauthProvider || 'local'}</p>
                        </div>
                      </div>
                  </div>
                )}
            </form>
          </div>
      </div>
    </motion.div>
  );
};

export default ProfileSettings;
