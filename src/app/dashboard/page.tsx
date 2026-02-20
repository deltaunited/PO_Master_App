"use client";

import { Card } from "@/components/Card";
import { ArrowUpRight, DollarSign, Briefcase, ShoppingCart, Receipt, Calendar, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface CurrencyStats {
    totalPO: number;
    totalPaid: number;
    remaining: number;
    progress: number;
}

export default function Dashboard() {
    const [currencyStats, setCurrencyStats] = useState<Record<string, CurrencyStats>>({});
    const [stats, setStats] = useState({ projectCount: 0 });
    const [projects, setProjects] = useState<any[]>([]);
    const [upcomingMilestones, setUpcomingMilestones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createClient();

                // 1. Fetch all projects
                const { data: projectsData, error: projectsError } = await supabase
                    .from("projects")
                    .select("*")
                    .limit(5);

                if (projectsError) throw projectsError;

                // 2. Fetch all PO amounts + currency
                const { data: posData, error: posError } = await supabase
                    .from("purchase_orders")
                    .select("id, amount, currency, project_id");

                if (posError) throw posError;

                // 3. Fetch all schedules
                const { data: schedulesData, error: schedulesError } = await supabase
                    .from("payment_schedules")
                    .select("id, po_id, purchase_orders(currency)");

                if (schedulesError) throw schedulesError;

                // 4. Fetch all payments
                const { data: paymentsData, error: paymentsError } = await supabase
                    .from("payments")
                    .select("amount, schedule_id");

                if (paymentsError) throw paymentsError;

                // 5. Group totals by Currency
                const cStats: Record<string, CurrencyStats> = {};

                // Aggregate POs
                posData?.forEach(po => {
                    const c = po.currency || "USD";
                    if (!cStats[c]) cStats[c] = { totalPO: 0, totalPaid: 0, remaining: 0, progress: 0 };
                    cStats[c].totalPO += (po.amount || 0);
                });

                // Map schedule_id -> currency
                const scheduleCurrencyMap: Record<string, string> = {};
                schedulesData?.forEach(sch => {
                    const poData = sch.purchase_orders as any;
                    scheduleCurrencyMap[sch.id] = poData?.currency || "USD";
                });

                // Aggregate Payments
                paymentsData?.forEach(p => {
                    const c = scheduleCurrencyMap[p.schedule_id] || "USD";
                    if (!cStats[c]) cStats[c] = { totalPO: 0, totalPaid: 0, remaining: 0, progress: 0 };
                    cStats[c].totalPaid += (p.amount || 0);
                });

                // Calculate extra stats for each currency
                Object.keys(cStats).forEach(c => {
                    cStats[c].remaining = cStats[c].totalPO - cStats[c].totalPaid;
                    cStats[c].progress = cStats[c].totalPO > 0 ? (cStats[c].totalPaid / cStats[c].totalPO) * 100 : 0;
                });

                // 6. Enrich projects with their PO totals
                const enrichedProjects = (projectsData || []).map((project) => {
                    const projectPOs = posData?.filter((po) => po.project_id === project.id) || [];
                    const projectTotalPO = projectPOs.reduce((sum, po) => sum + (po.amount || 0), 0);
                    return {
                        ...project,
                        totalPOAmount: projectTotalPO,
                        totalPaid: 0, // Keeping simplified for visual representation
                    };
                });

                // 6. Fetch Upcoming milestones
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const { data: milestonesData, error: milestonesError } = await supabase
                    .from("payment_schedules")
                    .select("*, purchase_orders(po_number, currency)")
                    .in("status", ["Pending", "Partial"])
                    .gte("due_date", today.toISOString().split("T")[0])
                    .order("due_date", { ascending: true })
                    .limit(5);

                if (milestonesError) throw milestonesError;

                setCurrencyStats(cStats);
                setStats({ projectCount: projectsData?.length || 0 });
                setProjects(enrichedProjects);
                setUpcomingMilestones(milestonesData || []);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground animate-pulse">Loading dashboard data...</p>
            </div>
        );
    }

    const availableCurrencies = Object.keys(currencyStats);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
                <p className="text-muted-foreground">Overview of budget execution and payments.</p>
            </div>

            {availableCurrencies.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-lg bg-card/50">
                    <p className="text-muted-foreground font-medium">No financial data available.</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Create Purchase Orders to see combined metrics.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {availableCurrencies.map(currency => {
                        const s = currencyStats[currency];
                        return (
                            <div key={currency} className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-primary mr-2" />
                                    {currency} Portfolio
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Card title="Total PO Amount" value={`${currency} ${s.totalPO.toLocaleString()}`} icon={ShoppingCart} trend="+0%" trendType="up" />
                                    <Card title="Total Paid" value={`${currency} ${s.totalPaid.toLocaleString()}`} icon={Receipt} trend="+0%" trendType="up" />
                                    <Card title="Remaining" value={`${currency} ${s.remaining.toLocaleString()}`} icon={DollarSign} trend="0%" trendType="down" />
                                    <Card title="Global Progress" value={`${s.progress.toFixed(1)}%`} icon={Briefcase} trend="+0%" trendType="up" />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
                    {projects.length === 0 ? (
                        <div className="py-12 text-center border border-dashed rounded-lg">
                            <p className="text-muted-foreground font-medium">No projects available.</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">Create a new project to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {projects.map((project) => (
                                <div key={project.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border transition-all hover:shadow-md hover:border-primary/20">
                                    <div className="space-y-1">
                                        <p className="font-medium">{project.name}</p>
                                        <p className="text-xs text-muted-foreground uppercase">{project.owner}</p>
                                    </div>
                                    <div className="text-right flex items-center space-x-6">
                                        <div>
                                            <p className="text-sm font-semibold">{project.currency} {project.totalPOAmount.toLocaleString()}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">Total PO</p>
                                        </div>
                                        <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="bg-primary h-full rounded-full"
                                                style={{ width: project.totalPOAmount > 0 ? `${(project.totalPaid / project.totalPOAmount) * 100}%` : "0%" }}
                                            />
                                        </div>
                                        <Link href={`/projects`} className="p-1 hover:bg-muted rounded">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-primary" />
                        Upcoming Milestones
                    </h2>

                    {upcomingMilestones.length === 0 ? (
                        <div className="py-12 text-center border border-dashed rounded-lg">
                            <p className="text-muted-foreground font-medium">No upcoming milestones.</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">You are all caught up on future payments.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingMilestones.map((milestone) => {
                                const po = milestone.purchase_orders || {};
                                return (
                                    <div key={milestone.id} className="p-4 rounded-lg bg-muted/30 border border-border flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-bold text-primary">{po.po_number || "Unknown PO"}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-bold tracking-wider">{milestone.type}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1 flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                Due: {new Date(milestone.due_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-foreground">
                                                <span className="text-xs text-muted-foreground mr-1">{po.currency || ""}</span>
                                                {milestone.amount?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
