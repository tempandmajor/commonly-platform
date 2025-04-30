
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  BarChart3,
  Settings,
} from "lucide-react";
import StoreOverview from "./StoreOverview";
import StoreProducts from "./StoreProducts";
import StoreOrders from "./StoreOrders";
import StoreCustomers from "./StoreCustomers";
import StoreSettings from "./StoreSettings";
import StoreAnalytics from "./StoreAnalytics";

interface StoreDashboardProps {
  userId: string;
  storeId: string;
  storeName: string;
}

const StoreDashboard: React.FC<StoreDashboardProps> = ({
  userId,
  storeId,
  storeName,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{storeName}</h1>
        <p className="text-muted-foreground">
          Manage your store, products, and orders
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0 added this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <StoreOverview storeId={storeId} />
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          <StoreProducts storeId={storeId} />
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          <StoreOrders storeId={storeId} />
        </TabsContent>
        <TabsContent value="customers" className="mt-6">
          <StoreCustomers storeId={storeId} />
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <StoreAnalytics storeId={storeId} />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <StoreSettings userId={userId} storeId={storeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreDashboard;
