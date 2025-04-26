
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useToast } from '@/hooks/use-toast';

const AdminLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          if (userData?.isAdmin) {
            setIsAdmin(true);
          } else {
            toast({
              variant: "destructive",
              title: "Access denied",
              description: "You do not have admin privileges",
            });
            navigate('/admin/login');
          }
        } catch (error) {
          console.error("Error verifying admin status:", error);
          navigate('/admin/login');
        }
      } else {
        navigate('/admin/login');
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
