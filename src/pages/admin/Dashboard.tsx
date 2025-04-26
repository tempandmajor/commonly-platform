
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, count, getDocs, getCountFromServer } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  CalendarDays,
  Building,
  Utensils,
  DollarSign,
  TrendingUp,
  Share2
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DashboardMetrics {
  totalUsers: number;
  activeEvents: number;
  completedEvents: number;
  totalVenues: number;
  totalCaterers: number;
  estimatedRevenue: number;
  totalReferrals: number;
}

interface MonthlyData {
  name: string;
  users: number;
  events: number;
  revenue: number;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeEvents: 0,
    completedEvents: 0,
    totalVenues: 0,
    totalCaterers: 0,
    estimatedRevenue: 0,
    totalReferrals: 0
  });
  
  const [loading, setLoading] = useState(true);
  
  const monthlyData: MonthlyData[] = [
    { name: 'Jan', users: 65, events: 32, revenue: 14000 },
    { name: 'Feb', users: 78, events: 45, revenue: 18500 },
    { name: 'Mar', users: 92, events: 51, revenue: 21000 },
    { name: 'Apr', users: 110, events: 58, revenue: 24500 },
    { name: 'May', users: 125, events: 63, revenue: 28000 },
    { name: 'Jun', users: 150, events: 72, revenue: 32500 },
  ];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Get total users count
        const usersSnapshot = await getCountFromServer(collection(db, 'users'));
        const totalUsers = usersSnapshot.data().count;
        
        // Get active events count
        const now = new Date();
        const activeEventsQuery = query(
          collection(db, 'events'),
          where('date', '>=', now.toISOString()),
          where('published', '==', true)
        );
        const activeEventsSnapshot = await getCountFromServer(activeEventsQuery);
        const activeEvents = activeEventsSnapshot.data().count;
        
        // Get completed events count
        const completedEventsQuery = query(
          collection(db, 'events'),
          where('date', '<', now.toISOString()),
          where('published', '==', true)
        );
        const completedEventsSnapshot = await getCountFromServer(completedEventsQuery);
        const completedEvents = completedEventsSnapshot.data().count;
        
        // Get venues count
        const venuesSnapshot = await getCountFromServer(collection(db, 'venues'));
        const totalVenues = venuesSnapshot.data().count;
        
        // Assuming there's a caterers collection
        let totalCaterers = 0;
        try {
          const caterersSnapshot = await getCountFromServer(collection(db, 'caterers'));
          totalCaterers = caterersSnapshot.data().count;
        } catch (error) {
          console.log('Caterers collection may not exist yet');
        }
        
        // Get referrals count (assuming a referrals collection)
        let totalReferrals = 0;
        try {
          const referralsSnapshot = await getCountFromServer(collection(db, 'referrals'));
          totalReferrals = referralsSnapshot.data().count;
        } catch (error) {
          console.log('Referrals collection may not exist yet');
        }
        
        // For revenue, we'd typically calculate this from actual payment data
        // This is a placeholder calculation
        const estimatedRevenue = activeEvents * 250 + completedEvents * 500;
        
        setMetrics({
          totalUsers,
          activeEvents,
          completedEvents,
          totalVenues,
          totalCaterers,
          estimatedRevenue,
          totalReferrals
        });
        
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const metricCards = [
    {
      title: "Total Users",
      value: metrics.totalUsers,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      description: "Registered users on the platform",
    },
    {
      title: "Active Events",
      value: metrics.activeEvents,
      icon: <CalendarDays className="h-5 w-5 text-green-600" />,
      description: "Upcoming published events",
    },
    {
      title: "Completed Events",
      value: metrics.completedEvents,
      icon: <CalendarDays className="h-5 w-5 text-purple-600" />,
      description: "Past successful events",
    },
    {
      title: "Venues",
      value: metrics.totalVenues,
      icon: <Building className="h-5 w-5 text-orange-600" />,
      description: "Available venue listings",
    },
    {
      title: "Catering Services",
      value: metrics.totalCaterers,
      icon: <Utensils className="h-5 w-5 text-yellow-600" />,
      description: "Registered catering services",
    },
    {
      title: "Revenue (Est.)",
      value: `$${metrics.estimatedRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
      description: "Estimated platform revenue",
    },
    {
      title: "Referrals",
      value: metrics.totalReferrals,
      icon: <Share2 className="h-5 w-5 text-indigo-600" />,
      description: "Total referral conversions",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metricCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3b82f6" 
                    name="New Users"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Revenue & Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="events" 
                    fill="#10b981" 
                    name="Events"
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="revenue" 
                    fill="#8b5cf6" 
                    name="Revenue ($)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
