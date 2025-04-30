
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/types/merchant";
import { formatDistanceToNow } from "date-fns";
import { OrderStatusBadge } from "./orders/OrderStatusBadge";
import { EmptyStateMessage } from "./common/EmptyStateMessage";
import { LoadingSpinner } from "./common/LoadingSpinner";

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
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
        <Button variant="outline">Export Orders</Button>
      </div>

      {orders.length === 0 ? (
        <EmptyStateMessage message="No orders have been placed yet" />
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
              <TableCell>{order.userId.substring(0, 8)}</TableCell>
              <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
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

// Helper function to generate mock orders
const getMockOrders = (storeId: string): Order[] => {
  return [
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
};

export default StoreOrders;
