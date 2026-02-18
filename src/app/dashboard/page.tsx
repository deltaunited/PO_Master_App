"use client";

import { Card } from "@/components/Card";
import { ArrowUpRight, DollarSign, Briefcase, ShoppingCart, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalPO: 0,
        totalPaid: 0,
        remaining: 0,
        progress: 0,
        projectCount: 0,
    });
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createClient();

                // Fetch all projects
                const { data: projectsData, error: projectsError } = await supabase
                    .from("projects")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (projectsError) throw projectsError;

                // Fetch all PO amounts
                const { data: posData, error: posError } = await supabase
                    .from("purchase_orders")
                    .select("amount, project_id");

                if (posError) throw posError;

                // Fetch all payments
                const { data: paymentsData, error: paymentsError } = await supabase
                    .from("payments")
                    .select("amount");

                if (paymentsError) throw paymentsError;

                const totalPO = posData?.reduce((sum, po) => sum + (po.amount || 0), 0) || 0;
                const totalPaid = paymentsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
                const remaining = totalPO - totalPaid;
                const progress = totalPO > 0 ? (totalPaid / totalPO) * 100 : 0;

                // Enrich projects with their PO totals and paid amounts
                const enrichedProjects = (projectsData || []).map((project) => {
                    const projectPOs = posData?.filter((po) => po.project_id === project.id) || [];
                    const projectTotalPO = projectPOs.reduce((sum, po) => sum + (po.amount || 0), 0);
                    return {
                        ...project,
                        totalPOAmount: projectTotalPO,
                        totalPaid: 0, // Simplified — full join would require schedule linking
                    };
                });

                setStats({
                    totalPO,
                    totalPaid,
                    remaining,
                    progress,
                    projectCount: projectsData?.length || 0,
                });
                setProjects(enrichedProjects);
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

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
                <p className="text-muted-foreground">Overview of budget execution and payments.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card title="Total PO Amount" value={`$${stats.totalPO.toLocaleString()}`} icon={ShoppingCart} trend="+0%" trendType="up" />
                <Card title="Total Paid" value={`$${stats.totalPaid.toLocaleString()}`} icon={Receipt} trend="+0%" trendType="up" />
                <Card title="Remaining" value={`$${stats.remaining.toLocaleString()}`} icon={DollarSign} trend="0%" trendType="down" />
                <Card title="Global Progress" value={`${stats.progress.toFixed(1)}%`} icon={Briefcase} trend="+0%" trendType="up" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
                    {projects.length === 0 ? (
                        <div className="py-12 text-center border border-dashed rounded-lg">
                            <p className="text-muted-foreground font-medium">No projects yet</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">Add a project in Supabase to see it here.</p>
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
                                            <p className="text-sm font-semibold">${project.totalPOAmount.toLocaleString()}</p>
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
                    <h2 className="text-xl font-semibold mb-4">Upcoming Payments</h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase">Overdue</p>
                            <p className="text-2xl font-bold text-red-900 dark:text-red-100 tracking-tight">$0</p>
                            <p className="text-xs text-red-600/80">No overdue invoices</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30 border border-border">
                            <p className="text-sm font-semibold text-muted-foreground uppercase">Scheduled (30 days)</p>
                            <p className="text-2xl font-bold tracking-tight">$0</p>
                            <p className="text-xs text-muted-foreground">No pending payments</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
