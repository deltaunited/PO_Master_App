"use client";

import { BarChart3, PieChart, TrendingUp, Download, DollarSign, Calendar, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface CurrencyStats {
    totalPOAmount: number;
    totalPaid: number;
    totalPending: number;
    overdueCount: number;
    upcomingCount: number;
}

export default function Reports() {
    const [currencyStats, setCurrencyStats] = useState<Record<string, CurrencyStats>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            setLoading(true);
            try {
                const supabase = createClient();

                const [posRes, schedulesRes, activeSchedulesRes, paymentsRes] = await Promise.all([
                    supabase.from('purchase_orders').select('id, amount, currency'),
                    supabase.from('payment_schedules').select('id, po_id, purchase_orders(currency)'),
                    supabase.from('payment_schedules').select('*, purchase_orders(currency)').in('status', ['Pending', 'Partial']),
                    supabase.from('payments').select('amount, schedule_id')
                ]);

                if (posRes.error) throw posRes.error;
                if (paymentsRes.error) throw paymentsRes.error;

                const cStats: Record<string, CurrencyStats> = {};

                // Aggregate POs
                (posRes.data || []).forEach(po => {
                    const c = po.currency || "USD";
                    if (!cStats[c]) cStats[c] = { totalPOAmount: 0, totalPaid: 0, totalPending: 0, overdueCount: 0, upcomingCount: 0 };
                    cStats[c].totalPOAmount += (po.amount || 0);
                });

                // Map schedule_id -> currency
                const scheduleCurrencyMap: Record<string, string> = {};
                (schedulesRes.data || []).forEach(sch => {
                    const poData = sch.purchase_orders as any;
                    scheduleCurrencyMap[sch.id] = poData?.currency || "USD";
                });

                // Aggregate Paid
                (paymentsRes.data || []).forEach(p => {
                    const c = scheduleCurrencyMap[p.schedule_id] || "USD";
                    if (!cStats[c]) cStats[c] = { totalPOAmount: 0, totalPaid: 0, totalPending: 0, overdueCount: 0, upcomingCount: 0 };
                    cStats[c].totalPaid += (p.amount || 0);
                });

                // Aggregate Schedules
                const now = new Date();
                now.setHours(0, 0, 0, 0);

                (activeSchedulesRes.data || []).forEach(s => {
                    const poData = s.purchase_orders as any;
                    const c = poData?.currency || "USD";
                    if (!cStats[c]) cStats[c] = { totalPOAmount: 0, totalPaid: 0, totalPending: 0, overdueCount: 0, upcomingCount: 0 };

                    cStats[c].totalPending += (s.amount || 0);
                    const dueDate = new Date(s.due_date);
                    if (dueDate < now) cStats[c].overdueCount++;
                    else cStats[c].upcomingCount++;
                });

                setCurrencyStats(cStats);
            } catch (err) {
                console.error("Reports fetch error:", err);
            } finally {
                setLoading(false);
            }
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

    const availableCurrencies = Object.keys(currencyStats);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Detailed analysis of execution and projections by currency.</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold transition-all hover:bg-primary/90 shadow-sm shrink-0">
                    <Download className="mr-2 h-4 w-4" /> Download Full Report
                </button>
            </div>

            {availableCurrencies.length === 0 ? (
                <div className="p-12 text-center border border-dashed rounded-xl bg-card/50">
                    <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No analytics available yet.</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Create Purchase Orders to unlock real-time financial tracking.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {availableCurrencies.map(currency => {
                        const stats = currencyStats[currency];
                        const budgetPercent = stats.totalPOAmount
                            ? Math.round((stats.totalPaid / stats.totalPOAmount) * 100)
                            : 0;

                        return (
                            <div key={currency} className="space-y-6 relative border border-border/50 rounded-2xl p-6 bg-card/30">
                                <div className="absolute -top-3.5 left-6 bg-background px-3 flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <h2 className="font-bold text-sm tracking-widest uppercase text-muted-foreground">{currency} Summary</h2>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-2">
                                    <StatCard title="Total PO value" value={`${currency} ${stats.totalPOAmount.toLocaleString()}`} icon={BarChart3} color="text-primary" />
                                    <StatCard title="Total Paid" value={`${currency} ${stats.totalPaid.toLocaleString()}`} icon={DollarSign} color="text-emerald-500" />
                                    <StatCard title="Pending Target" value={`${currency} ${stats.totalPending.toLocaleString()}`} icon={PieChart} color="text-amber-500" />
                                    <StatCard title="Budget Paid" value={`${budgetPercent}%`} icon={TrendingUp} color="text-blue-500" />
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-bold">Aging / Overdue</h3>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted text-foreground">
                                            <div className="flex items-center space-x-3">
                                                <AlertCircle className="h-5 w-5 text-destructive" />
                                                <span className="font-medium text-sm">Overdue milestones</span>
                                            </div>
                                            <span className="font-bold text-lg text-destructive">{stats.overdueCount}</span>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-bold">Upcoming Cash Flow</h3>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted text-foreground">
                                            <div className="flex items-center space-x-3">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <span className="font-medium text-sm">Upcoming milestones</span>
                                            </div>
                                            <span className="font-bold text-lg text-primary">{stats.upcomingCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
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
                    <h3 className="text-2xl font-bold tracking-tight break-all">{value}</h3>
                </div>
            </div>
        </div>
    );
}
