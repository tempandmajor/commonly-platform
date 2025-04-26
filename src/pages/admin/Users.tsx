
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, updateDoc, where, orderBy, limit, startAfter, DocumentData } from 'firebase/firestore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, MoreHorizontal, Search, Shield, User, UserX } from 'lucide-react';
import { UserData } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const { toast } = useToast();

  const fetchUsers = async (searchValue = '') => {
    setLoading(true);
    try {
      let usersQuery;
      
      if (searchValue) {
        usersQuery = query(
          collection(db, 'users'),
          where('displayName', '>=', searchValue),
          where('displayName', '<=', searchValue + '\uf8ff'),
          orderBy('displayName'),
          limit(20)
        );
      } else {
        usersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      }
      
      const usersSnapshot = await getDocs(usersQuery);
      const usersList: UserData[] = [];
      
      usersSnapshot.forEach(doc => {
        usersList.push(doc.data() as UserData);
      });
      
      setUsers(usersList);
      setLastVisible(usersSnapshot.docs[usersSnapshot.docs.length - 1]);
      
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreUsers = async () => {
    if (!lastVisible) return;
    
    setLoadingMore(true);
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(20)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const usersList: UserData[] = [];
      
      usersSnapshot.forEach(doc => {
        usersList.push(doc.data() as UserData);
      });
      
      setUsers(prev => [...prev, ...usersList]);
      setLastVisible(usersSnapshot.docs[usersSnapshot.docs.length - 1] || null);
      
    } catch (error) {
      console.error("Error loading more users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load more users"
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const toggleAdminStatus = async (user: UserData) => {
    try {
      if (!user.uid) {
        throw new Error("User ID is missing");
      }
      
      const userRef = doc(db, 'users', user.uid);
      const isAdmin = user.isAdmin || false;
      
      await updateDoc(userRef, {
        isAdmin: !isAdmin
      });
      
      setUsers(prev => 
        prev.map(u => 
          u.uid === user.uid ? { ...u, isAdmin: !isAdmin } : u
        )
      );
      
      toast({
        title: "Success",
        description: `Admin status ${!isAdmin ? "granted to" : "revoked from"} ${user.displayName || user.email}`
      });
      
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update admin status"
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search users..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={user.displayName || 'User'} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.displayName || 'Unnamed User'}</div>
                        <div className="text-xs text-gray-500">ID: {user.uid?.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.isAdmin && (
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </span>
                      )}
                      {user.isPro && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          Pro
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? 
                      new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 
                      'Unknown'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Sheet>
                          <SheetTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => {
                              e.preventDefault();
                              setSelectedUser(user);
                            }}>
                              View details
                            </DropdownMenuItem>
                          </SheetTrigger>
                          {selectedUser && selectedUser.uid === user.uid && (
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>User Details</SheetTitle>
                                <SheetDescription>
                                  View and manage user information
                                </SheetDescription>
                              </SheetHeader>
                              <div className="py-4 space-y-6">
                                <div className="flex flex-col items-center gap-4">
                                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {user.photoURL ? (
                                      <img 
                                        src={user.photoURL} 
                                        alt={user.displayName || 'User'} 
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <User className="h-12 w-12 text-gray-500" />
                                    )}
                                  </div>
                                  <h3 className="text-xl font-semibold">{user.displayName || 'Unnamed User'}</h3>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                    <p>{user.email}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">User ID</h4>
                                    <p>{user.uid}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Joined</h4>
                                    <p>
                                      {user.createdAt ? 
                                        new Date(user.createdAt.seconds * 1000).toLocaleString() : 
                                        'Unknown'
                                      }
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {user.isAdmin && (
                                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                                          Admin
                                        </span>
                                      )}
                                      {user.isPro && (
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                          Pro
                                        </span>
                                      )}
                                      {user.isMerchant && (
                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                          Merchant
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Button 
                                    variant={user.isAdmin ? "destructive" : "default"}
                                    onClick={() => toggleAdminStatus(user)}
                                    className="w-full"
                                  >
                                    {user.isAdmin ? "Remove Admin Status" : "Make Admin"}
                                  </Button>
                                </div>
                              </div>
                            </SheetContent>
                          )}
                        </Sheet>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                              Ban user
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ban User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to ban {user.displayName || user.email}? This action 
                                will prevent them from accessing the platform and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                Ban User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && users.length > 0 && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={loadMoreUsers} 
            disabled={!lastVisible || loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Users;
