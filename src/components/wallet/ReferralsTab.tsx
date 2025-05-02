
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ReferralStats } from "@/types/wallet";
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, DollarSign, MousePointerClick, ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReferralsTabProps {
  referralStats: ReferralStats | null;
  onPeriodChange: (period: 'week' | 'month' | 'year' | 'all') => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReferralsTab: React.FC<ReferralsTabProps> = ({ 
  referralStats,
  onPeriodChange
}) => {
  const navigate = useNavigate();

  if (!referralStats) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">
            Referral data is not available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Data for the charts
  const conversionData = [
    { name: 'Converted', value: referralStats.conversionCount },
    { name: 'Not Converted', value: referralStats.clickCount - referralStats.conversionCount }
  ];
  
  const referralData = [
    { name: 'Clicks', value: referralStats.clickCount, fill: '#0088FE' },
    { name: 'Conversions', value: referralStats.conversionCount, fill: '#00C49F' },
    { name: 'Revenue', value: referralStats.totalEarnings / 10, fill: '#FFBB28' } // Scaled for chart
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Referral Performance</CardTitle>
            <Select 
              defaultValue={referralStats.period} 
              onValueChange={(value) => onPeriodChange(value as 'week' | 'month' | 'year' | 'all')}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="This Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>
            Overview of your referral program performance
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <MousePointerClick className="h-8 w-8 text-green-500" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Click Count</p>
                    <p className="text-2xl font-bold">{referralStats.clickCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <ArrowRightLeft className="h-8 w-8 text-amber-500" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">{(referralStats.conversionRate * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <DollarSign className="h-8 w-8 text-purple-500" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold">${referralStats.totalEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Referral Activity</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    width={500}
                    height={300}
                    data={referralData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart width={400} height={400}>
                    <Pie
                      data={conversionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => value} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate("/referrals")}>
            Manage Referrals
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReferralsTab;
