
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/types/merchant";
import { formatDistanceToNow } from "date-fns";

interface StoreOrdersProps {
  storeId: string;
}

const StoreOrders: React.FC<StoreOrdersProps> = ({ storeId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Since the 'orders' table doesn't exist in our current Supabase database,
        // we'll use mock data instead
        setTimeout(() => {
          const mockOrders: Order[] = [
            {
              id: "ord-1234-abcd",
              userId: "user-567",
              merchantId: storeId,
              items: [{
                productId: "prod-1",
                quantity: 2,
                price: 29.99,
                productName: "Premium T-Shirt"
              }],
              totalAmount: 59.98,
              status: "completed",
              paymentIntentId: "pi_12345",
              shippingAddress: {
                street: "123 Main St",
                city: "Anytown",
                state: "CA",
                zip: "90210"
              },
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
              id: "ord-2345-bcde",
              userId: "user-789",
              merchantId: storeId,
              items: [{
                productId: "prod-2",
                quantity: 1,
                price: 49.99,
                productName: "Designer Jeans"
              }],
              totalAmount: 49.99,
              status: "processing",
              paymentIntentId: "pi_23456",
              shippingAddress: {
                street: "456 Oak Ave",
                city: "Somewhere",
                state: "NY",
                zip: "10001"
              },
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              updatedAt: new Date(Date.now() - 172800000).toISOString()
            },
            {
              id: "ord-3456-cdef",
              userId: "user-123",
              merchantId: storeId,
              items: [{
                productId: "prod-3",
                quantity: 3,
                price: 15.99,
                productName: "Classic Socks"
              }],
              totalAmount: 47.97,
              status: "shipped",
              paymentIntentId: "pi_34567",
              shippingAddress: {
                street: "789 Pine St",
                city: "Elsewhere",
                state: "TX",
                zip: "75001"
              },
              createdAt: new Date(Date.now() - 259200000).toISOString(),
              updatedAt: new Date(Date.now() - 259200000).toISOString()
            }
          ];
          
          setOrders(mockOrders);
          setLoading(false);
        }, 800); // Simulate loading delay
        
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    if (storeId) {
      fetchOrders();
    }
  }, [storeId, toast]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
        <h2 className="text-2xl font-bold">Orders</h2>
        <Button variant="outline">Export Orders</Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">
            No orders have been placed yet
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(order.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>{order.userId.substring(0, 8)}</TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
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

export default StoreOrders;
