
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user has admin role in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (userData?.isAdmin) {
        toast({
          title: "Login successful",
          description: "Welcome to the Admin Portal",
        });
        navigate('/admin/dashboard');
      } else {
        // Sign out if not an admin
        await auth.signOut();
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You do not have admin privileges",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>Sign in to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="admin@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              onClick={handleLogin}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-8 flex items-center p-4 text-sm border rounded-lg bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
          <p>This portal is restricted to authorized administrators only.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
