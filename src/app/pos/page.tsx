"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { ShoppingCart, Calendar, Building2, ChevronRight, X, DollarSign, FileText, Plus } from "lucide-react";

interface PurchaseOrder {
    id: string;
    po_number: string;
    project_id: string;
    supplier: string;
    date: string;
    amount: number;
    status: string;
    description: string;
}

interface Project {
    id: string;
    name: string;
}

function NewPOModal({ isOpen, onClose, projects, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        po_number: "",
        project_id: "",
        supplier: "",
        date: new Date().toISOString().split("T")[0],
        amount: "",
        description: "",
        status: "Issued",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error: insertError } = await supabase.from("purchase_orders").insert({
                po_number: form.po_number,
                project_id: form.project_id || null,
                supplier: form.supplier,
                date: form.date,
                amount: parseFloat(form.amount),
                description: form.description,
                status: form.status,
            });
            if (insertError) throw insertError;
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create PO.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h3 className="text-xl font-bold">New Purchase Order</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Fill in the details to create a new PO</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">PO Number *</label>
                            <input
                                required
                                type="text"
                                placeholder="PO-2024-001"
                                value={form.po_number}
                                onChange={e => setForm(f => ({ ...f, po_number: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Project</label>
                            <select
                                value={form.project_id}
                                onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">— Select Project —</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Supplier *</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                required
                                type="text"
                                placeholder="Supplier name"
                                value={form.supplier}
                                onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount (USD) *</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                    className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Date *</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    required
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                    className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Description</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <textarea
                                rows={2}
                                placeholder="Brief description of the purchase order..."
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                            />
                        </div>
                    </div>
                    {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                    <div className="pt-2 flex items-center space-x-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 border border-border rounded-xl font-bold text-sm hover:bg-muted transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex-[2] py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">
                            {loading ? "Creating..." : "Create Purchase Order"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function PurchaseOrders() {
    const [pos, setPos] = useState<PurchaseOrder[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        const supabase = createClient();
        const [{ data: posData }, { data: projectsData }] = await Promise.all([
            supabase.from("purchase_orders").select("*").order("date", { ascending: false }),
            supabase.from("projects").select("id, name"),
        ]);
        setPos(posData || []);
        setProjects(projectsData || []);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const getProjectName = (projectId: string) =>
        projects.find(p => p.id === projectId)?.name || "—";

    const statusColors: Record<string, string> = {
        "Issued": "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30",
        "Approved": "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30",
        "In Progress": "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30",
        "Closed": "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700",
        "Cancelled": "bg-red-50 text-red-500 border-red-100 dark:bg-red-900/20 dark:border-red-900/30",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
                    <p className="text-muted-foreground">Manage and track all issued purchase orders.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="mr-2 h-4 w-4" /> New PO
                </button>
            </div>

            {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : pos.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-border rounded-xl">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No purchase orders yet</h3>
                    <p className="text-muted-foreground text-sm mt-1">Click "+ New PO" to create your first purchase order.</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border">
                            <tr>
                                <th className="px-6 py-4">PO Number</th>
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Supplier</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {pos.map((po) => (
                                <tr key={po.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-primary">{po.po_number}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{getProjectName(po.project_id)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {po.supplier}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {po.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold">${po.amount?.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[po.status] || statusColors["Issued"]}`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <a href={`/pos/${po.id}`} className="p-2 hover:bg-muted rounded-full inline-block transition-colors">
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <NewPOModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projects={projects}
                onSuccess={fetchData}
            />
        </div>
    );
}
