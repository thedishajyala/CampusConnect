import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import api from '../services/api';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Fetch user details using the new token
      const fetchUser = async () => {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const { data } = await api.get('/users/me', config);
          login(data, token);
          
          if (data.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
             navigate('/student-dashboard');
          }
        } catch (error) {
          console.error('Error fetching user after OAuth', error);
          navigate('/login');
        }
      };

      fetchUser();
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-[80vh] flex justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-700">Completing login...</h2>
        <p className="text-gray-500 mt-2">Please wait while we set up your session.</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
