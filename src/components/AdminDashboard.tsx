import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Home, Calendar, MessageCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onBack: () => void;
}

interface DashboardData {
  total_users: number;
  total_listings: number;
  total_groups: number;
  total_events: number;
  users: {
    id: string;
    email: string;
    display_name: string | null;
    signup_date: string;
    last_active: string | null;
    listings_count: number;
    groups_joined: number;
    events_interested: number;
    messages_posted: number;
  }[];
}

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data: result, error } = await supabase.rpc('get_admin_dashboard_data');
      if (error) throw error;
      setData(result as unknown as DashboardData);
    } catch (err: any) {
      toast.error('Failed to load dashboard: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: data?.total_users || 0, icon: Users, color: 'text-primary' },
    { label: 'Housing Listings', value: data?.total_listings || 0, icon: Home, color: 'text-success' },
    { label: 'Community Groups', value: data?.total_groups || 0, icon: MessageCircle, color: 'text-accent' },
    { label: 'Total Events', value: data?.total_events || 0, icon: Calendar, color: 'text-warning' },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="pt-12 pb-6 px-6">
        <div className="flex items-center space-x-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4 shadow-card border-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Users Table */}
        <Card className="shadow-card border-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Registered Users</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Signed Up</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-center">Listings</TableHead>
                  <TableHead className="text-center">Groups</TableHead>
                  <TableHead className="text-center">Events</TableHead>
                  <TableHead className="text-center">Messages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.users?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-foreground whitespace-nowrap">
                      {u.display_name || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {new Date(u.signup_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {u.last_active ? new Date(u.last_active).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'}
                    </TableCell>
                    <TableCell className="text-center">{u.listings_count}</TableCell>
                    <TableCell className="text-center">{u.groups_joined}</TableCell>
                    <TableCell className="text-center">{u.events_interested}</TableCell>
                    <TableCell className="text-center">{u.messages_posted}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
