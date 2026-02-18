"use client";

import { Project } from "@/lib/mockData";
import { Briefcase, User, Circle, ArrowUpRight, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Projects() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Check if environment variables are set
                if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                    throw new Error("Missing Supabase environment variables. Please check your .env.local or Vercel settings.");
                }

                const supabase = createClient();

                // 1. Fetch projects
                const { data: projectsData, error } = await supabase
                    .from('projects')
                    .select('*');

                if (error) throw error;

                if (!projectsData) {
                    setProjects([]);
                    setLoading(false);
                    return;
                }

                // 2. Fetch stats manually
                const projectsWithStats = await Promise.all(projectsData.map(async (project) => {
                    try {
                        const { data: pos } = await supabase
                            .from('purchase_orders')
                            .select('amount, id')
                            .eq('project_id', project.id);

                        const totalPOAmount = pos?.reduce((sum, po) => sum + (po.amount || 0), 0) || 0;

                        return {
                            ...project,
                            totalPOAmount: totalPOAmount,
                            totalPaid: 0
                        };
                    } catch (e) {
                        console.error('Error fetching stats for project:', project.id, e);
                        return { ...project, totalPOAmount: 0, totalPaid: 0 };
                    }
                }));

                setProjects(projectsWithStats);
            } catch (err: any) {
                console.error('Database connection error:', err);
                setErrorMsg(err.message || "Failed to connect to Supabase database.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground animate-pulse">Connecting to Supabase...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="p-12 text-center bg-destructive/5 rounded-xl border border-destructive/20 max-w-2xl mx-auto mt-10">
                <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                    <Circle className="h-6 w-6 fill-current" />
                </div>
                <h3 className="text-xl font-bold text-destructive mb-2">Connection Error</h3>
                <p className="text-muted-foreground mb-6 font-mono text-sm">{errorMsg}</p>
                <div className="flex justify-center space-x-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
                    >
                        Retry Connection
                    </button>
                    <a
                        href="/"
                        className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-zinc-50"
                    >
                        Back to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                        <p className="text-muted-foreground mt-1">List of active projects and financial status.</p>
                    </div>
                </div>
                <div className="p-12 text-center border border-dashed rounded-xl">
                    <h3 className="text-lg font-medium">No projects found in database</h3>
                    <p className="text-muted-foreground">Add a row to the 'projects' table in Supabase to see it here.</p>
                </div>
            </div>
        )
    }
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-1">List of active projects and financial status.</p>
                </div>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                    + New Project
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project: Project) => (
                    <div key={project.id} className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <div className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border ${project.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/30' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                                    <Circle className={`h-2 w-2 fill-current`} />
                                    <span>{project.status}</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mb-6">
                                <User className="mr-1.5 h-3.5 w-3.5" />
                                {project.owner}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Payment Progress</span>
                                        <span className="font-bold text-primary">
                                            {((project.totalPaid / project.totalPOAmount) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-full transition-all duration-500 rounded-full"
                                            style={{ width: `${(project.totalPaid / project.totalPOAmount) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="p-3 rounded-lg bg-secondary/50">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Total PO</p>
                                        <p className="font-bold text-sm text-foreground flex items-center">
                                            <DollarSign className="h-3 w-3 mr-0.5 text-muted-foreground" />
                                            {project.totalPOAmount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-secondary/50">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Balance</p>
                                        <p className="font-bold text-sm text-foreground flex items-center">
                                            <DollarSign className="h-3 w-3 mr-0.5 text-muted-foreground" />
                                            {(project.totalPOAmount - project.totalPaid).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-secondary/30 border-t border-border px-6 py-4">
                            <a
                                href={`/projects/1`} // Hardcoded for demo
                                className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center justify-center w-full group/link"
                            >
                                View Details <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}
