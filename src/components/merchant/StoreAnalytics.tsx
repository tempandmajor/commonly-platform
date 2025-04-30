
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

interface StoreAnalyticsProps {
  storeId: string;
}

// Sample data for demonstration
const dailyData = [
  { name: "Mon", sales: 0 },
  { name: "Tue", sales: 0 },
  { name: "Wed", sales: 0 },
  { name: "Thu", sales: 0 },
  { name: "Fri", sales: 0 },
  { name: "Sat", sales: 0 },
  { name: "Sun", sales: 0 },
];

const monthlyData = [
  { name: "Jan", sales: 0 },
  { name: "Feb", sales: 0 },
  { name: "Mar", sales: 0 },
  { name: "Apr", sales: 0 },
  { name: "May", sales: 0 },
  { name: "Jun", sales: 0 },
  { name: "Jul", sales: 0 },
  { name: "Aug", sales: 0 },
  { name: "Sep", sales: 0 },
  { name: "Oct", sales: 0 },
  { name: "Nov", sales: 0 },
  { name: "Dec", sales: 0 },
];

const productData = [
  { name: "Product A", sales: 0 },
  { name: "Product B", sales: 0 },
  { name: "Product C", sales: 0 },
  { name: "Product D", sales: 0 },
  { name: "Product E", sales: 0 },
];

const StoreAnalytics: React.FC<StoreAnalyticsProps> = ({ storeId }) => {
  const [timeframe, setTimeframe] = useState<string>("weekly");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>
      
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>
                    View your sales data over time
                  </CardDescription>
                </div>
                <Tabs value={timeframe} onValueChange={setTimeframe}>
                  <TabsList>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="h-80 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeframe === "monthly" ? monthlyData : dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>
                Your best performing products by sales
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Activity</CardTitle>
              <CardDescription>
                Track customer engagement over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#ff7300" name="visits" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreAnalytics;
