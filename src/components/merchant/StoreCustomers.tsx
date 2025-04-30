
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  orderCount: number;
  totalSpent: number;
}

interface StoreCustomersProps {
  storeId: string;
}

const StoreCustomers: React.FC<StoreCustomersProps> = ({ storeId }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        
        // First get all orders for this merchant
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('user_id, total_amount')
          .eq('merchant_id', storeId);
        
        if (ordersError) throw ordersError;
        
        // Group orders by user and calculate totals
        const userOrders = ordersData.reduce<Record<string, { count: number; total: number }>>((acc, order) => {
          const userId = order.user_id;
          if (!acc[userId]) {
            acc[userId] = { count: 0, total: 0 };
          }
          acc[userId].count += 1;
          acc[userId].total += order.total_amount;
          return acc;
        }, {});
        
        // Get user details for each customer
        const userIds = Object.keys(userOrders);
        
        if (userIds.length === 0) {
          setCustomers([]);
          setLoading(false);
          return;
        }
        
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, display_name, email, photo_url')
          .in('id', userIds);
        
        if (usersError) throw usersError;
        
        // Map to customer objects
        const customerData = usersData.map(user => ({
          id: user.id,
          displayName: user.display_name || 'Unknown',
          email: user.email || '',
          photoURL: user.photo_url,
          orderCount: userOrders[user.id]?.count || 0,
          totalSpent: userOrders[user.id]?.total || 0
        }));
        
        setCustomers(customerData);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchCustomers();
    }
  }, [storeId, toast]);

  const filteredCustomers = customers.filter((customer) =>
    customer.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Customers</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="w-[250px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">
            No customers have made purchases yet
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={customer.photoURL || ""} />
                        <AvatarFallback>
                          {customer.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{customer.displayName}</div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.orderCount}</TableCell>
                  <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default StoreCustomers;
