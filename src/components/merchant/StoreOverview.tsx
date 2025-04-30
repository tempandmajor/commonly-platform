
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StoreOverviewProps {
  storeId: string;
}

const StoreOverview: React.FC<StoreOverviewProps> = ({ storeId }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Store Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Sales</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <span className="flex items-center text-emerald-500">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                0%
              </span>
              <span className="ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Sales</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <span className="flex items-center text-red-500">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                0%
              </span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <span className="flex items-center text-emerald-500">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                0%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreOverview;
