
import React from "react";
import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
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

  return <Badge className={getStatusColor(status)}>{status}</Badge>;
};
