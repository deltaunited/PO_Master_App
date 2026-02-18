"use client";

import { Briefcase, User, Circle, ArrowUpRight, DollarSign, X, Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Project {
    id: string;
    name: string;
    owner: string;
    currency: string;
    status: string;
    totalPOAmount?: number;
    totalPaid?: number;
}

const STATUS_OPTIONS = ["Active", "On Hold", "Closed"];
const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "VES"];

function ProjectModal({ isOpen, onClose, project, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null; // null = new, non-null = edit
    onSuccess: () => void;
}) {
    const isEdit = !!project;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "",
        owner: "",
        currency: "USD",
        status: "Active",
    });

    useEffect(() => {
        if (project) {
            setForm({ name: project.name, owner: project.owner, currency: project.currency, status: project.status });
        } else {
            setForm({ name: "", owner: "", currency: "USD", status: "Active" });
        }
        setError(null);
    }, [project, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            if (isEdit && project) {
                const { error: updateError } = await supabase
                    .from("projects")
                    .update({ name: form.name, owner: form.owner, currency: form.currency, status: form.status })
                    .eq("id", project.id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("projects")
                    .insert({ name: form.name, owner: form.owner, currency: form.currency, status: form.status });
                if (insertError) throw insertError;
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h3 className="text-xl font-bold">{isEdit ? "Edit Project" : "New Project"}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{isEdit ? "Update project details" : "Create a new project in the database"}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Project Name *</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Solar Power Plant A1"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Project Owner *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                required
                                type="text"
                                placeholder="e.g. John Smith"
                                value={form.owner}
                                onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Currency</label>
                            <select
                                value={form.currency}
                                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                {CURRENCY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                    <div className="pt-2 flex items-center space-x-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 border border-border rounded-xl font-bold text-sm hover:bg-muted transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex-[2] py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">
                            {loading ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Project")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const STATUS_STYLES: Record<string, string> = {
    "Active": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "On Hold": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Closed": "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const fetchProjects = async () => {
        try {
            const supabase = createClient();
            const { data: projectsData, error } = await supabase.from("projects").select("*");
            if (error) throw error;

            const projectsWithStats = await Promise.all((projectsData || []).map(async (project) => {
                try {
                    const { data: pos } = await supabase
                        .from("purchase_orders")
                        .select("amount")
                        .eq("project_id", project.id);
                    const totalPOAmount = pos?.reduce((sum, po) => sum + (po.amount || 0), 0) || 0;
                    return { ...project, totalPOAmount, totalPaid: 0 };
                } catch {
                    return { ...project, totalPOAmount: 0, totalPaid: 0 };
                }
            }));

            setProjects(projectsWithStats);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to load projects.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);

    const openNew = () => { setEditingProject(null); setIsModalOpen(true); };
    const openEdit = (project: Project) => { setEditingProject(project); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingProject(null); };

    if (loading) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground animate-pulse">Loading projects...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-1">Manage projects and track financial status.</p>
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="mr-2 h-4 w-4" /> New Project
                </button>
            </div>

            {errorMsg && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">{errorMsg}</div>
            )}

            {projects.length === 0 && !errorMsg ? (
                <div className="p-16 text-center border border-dashed border-border rounded-xl">
                    <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No projects yet</h3>
                    <p className="text-muted-foreground text-sm mt-1">Click "+ New Project" to create your first project.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <div key={project.id} className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border ${STATUS_STYLES[project.status] || STATUS_STYLES["Active"]}`}>
                                            <Circle className="h-2 w-2 fill-current" />
                                            <span>{project.status}</span>
                                        </div>
                                        <button
                                            onClick={() => openEdit(project)}
                                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                            title="Edit project"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
                                <div className="flex items-center text-sm text-muted-foreground mb-6">
                                    <User className="mr-1.5 h-3.5 w-3.5" />
                                    {project.owner}
                                    <span className="ml-auto text-xs font-mono bg-muted px-2 py-0.5 rounded">{project.currency}</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-muted-foreground">Payment Progress</span>
                                            <span className="font-bold text-primary">
                                                {project.totalPOAmount && project.totalPOAmount > 0
                                                    ? `${((project.totalPaid! / project.totalPOAmount) * 100).toFixed(0)}%`
                                                    : "0%"}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="bg-primary h-full transition-all duration-500 rounded-full"
                                                style={{ width: project.totalPOAmount && project.totalPOAmount > 0 ? `${(project.totalPaid! / project.totalPOAmount) * 100}%` : "0%" }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="p-3 rounded-lg bg-secondary/50">
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Total PO</p>
                                            <p className="font-bold text-sm text-foreground flex items-center">
                                                <DollarSign className="h-3 w-3 mr-0.5 text-muted-foreground" />
                                                {(project.totalPOAmount || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-secondary/50">
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Balance</p>
                                            <p className="font-bold text-sm text-foreground flex items-center">
                                                <DollarSign className="h-3 w-3 mr-0.5 text-muted-foreground" />
                                                {((project.totalPOAmount || 0) - (project.totalPaid || 0)).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-secondary/20 border-t border-border px-6 py-4">
                                <a
                                    href={`/pos?project=${project.id}`}
                                    className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center justify-center w-full group/link"
                                >
                                    View Purchase Orders <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ProjectModal
                isOpen={isModalOpen}
                onClose={closeModal}
                project={editingProject}
                onSuccess={fetchProjects}
            />
        </div>
    );
}
