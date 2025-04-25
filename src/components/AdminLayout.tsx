import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdmin } from '../utils/supabaseClient';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAdminUser, setIsAdminUser] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await isAdmin();
        setIsAdminUser(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdminUser(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAdminUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};