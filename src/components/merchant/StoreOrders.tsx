
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

// Updated interfaces to match the requirements
interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  merchantId: string;
  status: string;
  total: number;
  customerName: string;
  createdAt: string;
  items: OrderItem[];
}

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
        
        // Using mock data since we don't have an 'orders' table in Supabase
        setTimeout(() => {
          const mockOrders: Order[] = getMockOrders(storeId);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
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
        <div className="text-center p-10 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">No orders yet</h3>
          <p className="text-gray-500">No orders have been placed yet</p>
        </div>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
};

interface OrdersTableProps {
  orders: Order[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  return (
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
              <TableCell>{order.customerName}</TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
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
  );
};

// Helper component for Order Status
const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let variant: "default" | "secondary" | "outline" | "destructive" = "default";
  
  switch (status) {
    case "completed":
      variant = "default";
      break;
    case "processing":
      variant = "secondary";
      break;
    case "shipped":
      variant = "outline";
      break;
    case "cancelled":
      variant = "destructive";
      break;
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};

// Helper function to generate mock orders
const getMockOrders = (storeId: string): Order[] => {
  return [
    {
      id: "ord-1234-abcd",
      merchantId: storeId,
      customerName: "John Doe",
      items: [{
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        price: 29.99,
        productName: "Premium T-Shirt"
      }],
      total: 59.98,
      status: "completed",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "ord-2345-bcde",
      merchantId: storeId,
      customerName: "Jane Smith",
      items: [{
        id: "item-2",
        productId: "prod-2",
        quantity: 1,
        price: 49.99,
        productName: "Designer Jeans"
      }],
      total: 49.99,
      status: "processing",
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: "ord-3456-cdef",
      merchantId: storeId,
      customerName: "Bob Johnson",
      items: [{
        id: "item-3",
        productId: "prod-3",
        quantity: 3,
        price: 15.99,
        productName: "Classic Socks"
      }],
      total: 47.97,
      status: "shipped",
      createdAt: new Date(Date.now() - 259200000).toISOString()
    }
  ];
};

export default StoreOrders;
