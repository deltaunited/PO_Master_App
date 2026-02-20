"use client";

import { BarChart3, PieChart, TrendingUp, Download, DollarSign, Calendar, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Reports() {
    const [stats, setStats] = useState({
        totalPOAmount: 0,
        totalPaid: 0,
        totalPending: 0,
        overdueCount: 0,
        upcomingCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            setLoading(true);
            const supabase = createClient();

            const [posRes, paymentsRes, schedulesRes] = await Promise.all([
                supabase.from('purchase_orders').select('amount'),
                supabase.from('payments').select('amount'),
                supabase.from('payment_schedules').select('*').in('status', ['Pending', 'Partial'])
            ]);

            const totalPOAmount = (posRes.data || []).reduce((sum, po) => sum + (po.amount || 0), 0);
            const totalPaid = (paymentsRes.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);

            const pendingSchedules = schedulesRes.data || [];
            let totalPending = 0;
            let overdueCount = 0;
            let upcomingCount = 0;

            const now = new Date();
            now.setHours(0, 0, 0, 0);

            pendingSchedules.forEach(s => {
                totalPending += (s.amount || 0);
                const dueDate = new Date(s.due_date);
                if (dueDate < now) overdueCount++;
                else upcomingCount++;
            });

            setStats({ totalPOAmount, totalPaid, totalPending, overdueCount, upcomingCount });
            setLoading(false);
        }
        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const budgetPercent = stats.totalPOAmount ? Math.round((stats.totalPaid / stats.totalPOAmount) * 100) : 0;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Detailed analysis of execution and projections.</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold transition-all hover:bg-primary/90 shadow-sm">
                    <Download className="mr-2 h-4 w-4" /> Download Full Report
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total PO value" value={`$${stats.totalPOAmount.toLocaleString()}`} icon={BarChart3} color="text-primary" />
                <StatCard title="Total Paid" value={`$${stats.totalPaid.toLocaleString()}`} icon={DollarSign} color="text-emerald-500" />
                <StatCard title="Total Pending Target" value={`$${stats.totalPending.toLocaleString()}`} icon={PieChart} color="text-amber-500" />
                <StatCard title="Budget Paid" value={`${budgetPercent}%`} icon={TrendingUp} color="text-blue-500" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                            <Clock className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold">Aging / Overdue Payments</h2>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted text-foreground">
                        <div className="flex items-center space-x-3">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <span className="font-medium">Overdue milestones</span>
                        </div>
                        <span className="font-bold text-lg text-destructive">{stats.overdueCount}</span>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold">Upcoming Cash Flow</h2>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted text-foreground">
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Upcoming milestones</span>
                        </div>
                        <span className="font-bold text-lg text-primary">{stats.upcomingCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    return (
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col space-y-3">
                <div className={`p-3 rounded-lg bg-muted w-fit ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                </div>
            </div>
        </div>
    );
}
