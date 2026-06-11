import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

// --- Error Handler ---
const handleError = (error, defaultMessage) => {
  const message = error.response?.data?.message || error.message || defaultMessage;
  toast.error(message);
  throw error;
};

// --- Dashboard Stats ---
export const useDashboardStats = (role) => {
  return useQuery({
    queryKey: ['stats', role],
    queryFn: async () => {
      const { data } = await api.get(`/stats/${role}`);
      return data;
    },
    retry: 1,
  });
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await api.get('/events');
      return data;
    },
  });
};

export const useEvent = (id) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventData) => {
      const { data } = await api.post('/events', eventData);
      return data;
    },
    onSuccess: () => {
      toast.success('Event created successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err) => handleError(err, 'Failed to create event'),
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, eventData }) => {
      const { data } = await api.put(`/events/${id}`, eventData);
      return data;
    },
    onSuccess: (data, variables) => {
      toast.success('Event updated successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
    },
    onError: (err) => handleError(err, 'Failed to update event'),
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/events/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Event deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err) => handleError(err, 'Failed to delete event'),
  });
};

// --- Registrations ---
export const useRegisterEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, githubProfile, message }) => {
      const { data } = await api.post('/registrations', { event: eventId, githubProfile, message });
      return data;
    },
    onSuccess: () => {
      toast.success('Successfully registered for the event!');
      queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['studentStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: (err) => handleError(err, 'Failed to register for event'),
  });
};

export const useMyParticipations = () => {
  return useQuery({
    queryKey: ['myParticipations'],
    queryFn: async () => {
      const { data } = await api.get('/registrations/my');
      return data;
    },
  });
};

export const useEventParticipants = (eventId) => {
  return useQuery({
    queryKey: ['eventParticipants', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/registrations/event/${eventId}`);
      return data;
    },
    enabled: !!eventId,
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ registrationId, status }) => {
      const { data } = await api.put(`/registrations/attendance/${registrationId}`, { status });
      return data;
    },
    onSuccess: (data, variables) => {
      toast.success('Attendance updated');
      queryClient.invalidateQueries({ queryKey: ['eventParticipants'] });
    },
    onError: (err) => handleError(err, 'Failed to mark attendance'),
  });
};

export const useDeleteClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/clubs/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Club deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
    onError: (err) => handleError(err, 'Failed to delete club'),
  });
};

export const useApproveRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (registrationId) => {
      const { data } = await api.put(`/registrations/${registrationId}/approve`);
      return data;
    },
    onSuccess: () => {
      toast.success('Registration approved');
      queryClient.invalidateQueries({ queryKey: ['eventParticipants'] });
    },
    onError: (err) => handleError(err, 'Failed to approve registration'),
  });
};

export const useRejectRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (registrationId) => {
      const { data } = await api.put(`/registrations/${registrationId}/reject`);
      return data;
    },
    onSuccess: () => {
      toast.error('Registration rejected');
      queryClient.invalidateQueries({ queryKey: ['eventParticipants'] });
    },
    onError: (err) => handleError(err, 'Failed to reject registration'),
  });
};

export const useGenerateQR = () => {
  return useMutation({
    mutationFn: async (eventId) => {
      const { data } = await api.post('/attendance/generate-qr', { eventId });
      return data; // { token, eventId }
    },
    onError: (err) => handleError(err, 'Failed to generate QR code'),
  });
};

export const useScanQR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token) => {
      const { data } = await api.post('/attendance/scan', { token });
      return data;
    },
    onSuccess: () => {
      toast.success('Successfully scanned QR and marked attendance');
      queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
    },
    onError: (err) => handleError(err, 'Failed to scan QR or mark attendance'),
  });
};

// --- Certificates ---
export const useGenerateCertificates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (registrationId) => {
      const { data } = await api.post(`/certificates/generate`, { registrationId }, { responseType: 'blob' });
      return data;
    },
    onSuccess: () => {
      toast.success('Certificate processed successfully');
      queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['studentStats'] });
    },
    onError: (err) => handleError(err, 'Failed to process certificate'),
  });
};

export const useMyCertificates = () => {
  // We can derive this from myParticipations where attendance is 'present'
  // Or create a dedicated endpoint if we want
  return useQuery({
    queryKey: ['myCertificates'],
    queryFn: async () => {
      const { data } = await api.get('/registrations/my');
      return data.filter(reg => reg.attendanceStatus === 'Present');
    },
  });
};

// --- Pending / Faculty functionality (Stub for now) ---
export const usePendingEvents = () => {
  return useQuery({
    queryKey: ['pendingEvents'],
    queryFn: async () => {
      const { data } = await api.get('/events/pending');
      return data;
    },
  });
};

export const useApproveEvent = () => {
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.put(`/events/${id}/approve`);
      return data;
    },
  });
};

// --- Rankings ---
export const useRankings = () => {
  return useQuery({
    queryKey: ['topClubs'],
    queryFn: async () => {
      const { data } = await api.get('/rankings/top-clubs');
      return data;
    },
  });
};

export const useRejectEvent = () => {
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.put(`/events/${id}/reject`);
      return data;
    },
  });
};

// --- Admin / Superadmin Users/Clubs functionality (Stub) ---
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    },
  });
};

// --- Admin / Superadmin Clubs functionality ---
export const useAllClubs = (status = undefined) => {
  return useQuery({
    queryKey: ['clubs', status],
    queryFn: async () => {
      const url = status ? `/clubs?status=${status}` : '/clubs';
      const { data } = await api.get(url);
      return data;
    },
  });
};

export const useRegisterClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clubData) => {
      const { data } = await api.post('/clubs/register', clubData);
      return data;
    },
    onSuccess: () => {
      toast.success('Club registered successfully and is pending approval');
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
    onError: (err) => handleError(err, 'Failed to register club'),
  });
};

export const useApproveClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.put(`/clubs/approve/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Club approved successfully');
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
    onError: (err) => handleError(err, 'Failed to approve club'),
  });
};

export const useRejectClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.put(`/clubs/reject/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.error('Club rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
    onError: (err) => handleError(err, 'Failed to reject club'),
  });
};

export const useUpdateRole = () => {
  return useMutation({
    mutationFn: async ({ userId, role }) => {
      const { data } = await api.put(`/users/${userId}/role`, { role });
      return data;
    },
  });
};

// --- Notifications ---
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    },
  });
};
