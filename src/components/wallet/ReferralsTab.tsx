
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ReferralStats } from "@/types/wallet";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ReferralsTabProps {
  referralStats: ReferralStats;
  onPeriodChange: (period: 'week' | 'month' | 'year' | 'all') => void;
}

const ReferralsTab: React.FC<ReferralsTabProps> = ({ referralStats, onPeriodChange }) => {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'year' | 'all'>(
    referralStats.period || 'month'
  );

  useEffect(() => {
    onPeriodChange(activeTab);
  }, [activeTab, onPeriodChange]);

  // Chart data for each metric
  const clickData = [
    { name: 'Previous', value: 0 },
    { name: 'Current', value: referralStats.clickCount || 0 },
  ];

  const conversionData = [
    { name: 'Previous', value: 0 },
    { name: 'Current', value: referralStats.conversionCount || 0 },
  ];

  const conversionRateData = [
    { name: 'Previous', value: 0 },
    { name: 'Current', value: referralStats.conversionRate || 0 },
  ];

  const earningsData = [
    { name: 'Previous', value: 0 },
    { name: 'Current', value: referralStats.totalEarnings || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Referral Earnings</h2>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralStats.clickCount || 0}</div>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clickData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {`${(referralStats.conversionRate || 0).toFixed(1)}%`}
            </div>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversionRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(referralStats.totalEarnings || 0).toFixed(2)}
            </div>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={`https://example.com/ref/${referralStats.userId}`}
                readOnly
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`https://example.com/ref/${referralStats.userId}`)}>
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Share your unique referral link with friends and colleagues</li>
            <li>When they sign up using your link, you'll receive credit</li>
            <li>Earn a commission on their first transaction</li>
            <li>Track your earnings and performance in this dashboard</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralsTab;
