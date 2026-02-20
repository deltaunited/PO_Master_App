"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { ShoppingCart, Calendar, Building2, ChevronRight, X, DollarSign, FileText, Plus, Trash2, Pencil } from "lucide-react";
import { AddCurrencyModal } from "@/components/AddCurrencyModal";
import { AddSupplierModal } from "@/components/AddSupplierModal";

interface PurchaseOrder {
    id: string;
    po_number: string;
    project_id: string;
    supplier_id: string | null;
    supplier_name: string | null; // Legacy
    date: string;
    amount: number;
    currency: string;
    status: string;
    description: string;
    external_link?: string;
    suppliers?: { name: string };
}

interface Project {
    id: string;
    name: string;
}

interface Supplier {
    id: string;
    name: string;
}

interface Currency {
    code: string;
    name: string;
}

interface ScheduleRow {
    type: string;
    percentage: string;
    due_date: string;
}

const SCHEDULE_TYPES = ["Advance", "Milestone", "Final", "Retention", "Variation"];
const STATUS_OPTIONS = ["Issued", "Approved", "In Progress", "Closed", "Cancelled"];

function NewPOModal({ isOpen, onClose, projects, suppliers, currencies, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
    suppliers: Supplier[];
    currencies: Currency[];
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
    const [isAddCurrencyOpen, setIsAddCurrencyOpen] = useState(false);

    const [form, setForm] = useState({
        po_number: "",
        project_id: "",
        supplier_id: "",
        date: new Date().toISOString().split("T")[0],
        amount: "",
        currency: currencies.length > 0 ? currencies[0].code : "USD",
        description: "",
        status: "Issued",
        external_link: "",
    });
    const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([
        { type: "Advance", percentage: "30", due_date: "" },
        { type: "Final", percentage: "70", due_date: "" },
    ]);

    useEffect(() => {
        if (isOpen) {
            setForm({
                po_number: "", project_id: "", supplier_id: "",
                date: new Date().toISOString().split("T")[0],
                amount: "", currency: currencies.length > 0 ? currencies[0].code : "USD",
                description: "", status: "Issued", external_link: ""
            });
            setScheduleRows([{ type: "Advance", percentage: "30", due_date: "" }, { type: "Final", percentage: "70", due_date: "" }]);
            setError(null);
        }
    }, [isOpen, currencies]);

    if (!isOpen) return null;

    const totalPct = scheduleRows.reduce((sum, r) => sum + (parseFloat(r.percentage) || 0), 0);
    const addRow = () => setScheduleRows(rows => [...rows, { type: "Milestone", percentage: "", due_date: "" }]);
    const removeRow = (i: number) => setScheduleRows(rows => rows.filter((_, idx) => idx !== i));
    const updateRow = (i: number, field: keyof ScheduleRow, value: string) =>
        setScheduleRows(rows => rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (scheduleRows.length > 0 && Math.abs(totalPct - 100) > 0.01) {
            setError(`Payment schedule percentages must sum to 100%. Currently: ${totalPct.toFixed(1)}%`);
            return;
        }

        setLoading(true);
        try {
            const supabase = createClient();
            const totalAmount = parseFloat(form.amount);

            // 1. Insert the PO
            const { data: poData, error: insertError } = await supabase
                .from("purchase_orders")
                .insert({
                    po_number: form.po_number,
                    project_id: form.project_id || null,
                    supplier_id: form.supplier_id || null, // null if they somehow didn't pick one
                    // Still write to supplier_name if we want backwards compat with old views that don't join, just in case
                    supplier_name: suppliers.find(s => s.id === form.supplier_id)?.name || null,
                    date: form.date,
                    amount: totalAmount,
                    currency: form.currency,
                    description: form.description,
                    status: form.status,
                    external_link: form.external_link ? form.external_link : null,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // 2. Insert payment schedule rows
            if (scheduleRows.length > 0 && poData) {
                const schedules = scheduleRows.map((row, idx) => ({
                    po_id: poData.id,
                    payment_no: idx + 1,
                    type: row.type,
                    amount: parseFloat(((parseFloat(row.percentage) / 100) * totalAmount).toFixed(2)),
                    due_date: row.due_date || form.date,
                    status: "Pending",
                }));

                const { error: schedError } = await supabase.from("payment_schedules").insert(schedules);
                if (schedError) throw schedError;
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create PO.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                    <div>
                        <h3 className="text-xl font-bold">New Purchase Order</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Fill in the details and define the payment schedule</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto">
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">PO Number *</label>
                                <input
                                    required type="text" placeholder="PO-2024-001"
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
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Supplier *</label>
                                <button type="button" onClick={() => setIsAddSupplierOpen(true)} className="text-[10px] font-bold text-primary hover:underline flex items-center">
                                    <Plus className="h-3 w-3 mr-0.5" /> Add New
                                </button>
                            </div>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <select
                                    required
                                    value={form.supplier_id}
                                    onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}
                                    className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                                >
                                    <option value="">— Select Supplier —</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5 col-span-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Currency</label>
                                    <button type="button" onClick={() => setIsAddCurrencyOpen(true)} className="text-[10px] font-bold text-primary hover:underline flex items-center">
                                        <Plus className="h-3 w-3 mr-0.5" /> New
                                    </button>
                                </div>
                                <select
                                    value={form.currency}
                                    onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                                    className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                >
                                    {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5 col-span-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Total Amount *</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        required type="number" min="0" step="0.01" placeholder="0.00"
                                        value={form.amount}
                                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                        className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 col-span-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Issue Date *</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        required type="date"
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
                                    rows={2} placeholder="Brief description of the purchase order..."
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">External Link <span className="text-muted-foreground/50 font-normal">(Optional)</span></label>
                            <input
                                type="url" placeholder="https://drive.google.com/..."
                                value={form.external_link}
                                onChange={e => setForm(f => ({ ...f, external_link: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>

                        {/* Payment Schedule Builder */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-bold">Payment Schedule</p>
                                    <p className="text-xs text-muted-foreground">Define payment tranches (must total 100%)</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${Math.abs(totalPct - 100) < 0.01 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                                        {totalPct.toFixed(0)}% / 100%
                                    </span>
                                    <button type="button" onClick={addRow} className="flex items-center text-xs font-bold text-primary hover:underline">
                                        <Plus className="h-3 w-3 mr-1" /> Add Tranche
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 rounded-xl border border-border overflow-hidden">
                                <div className="grid grid-cols-12 gap-2 bg-muted/50 px-3 py-2 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                                    <div className="col-span-4">Type</div>
                                    <div className="col-span-2">%</div>
                                    <div className="col-span-2 text-right">Amount</div>
                                    <div className="col-span-3">Due Date</div>
                                    <div className="col-span-1"></div>
                                </div>
                                {scheduleRows.map((row, i) => {
                                    const rowAmount = form.amount && row.percentage
                                        ? ((parseFloat(row.percentage) / 100) * parseFloat(form.amount)).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                        : "—";
                                    return (
                                        <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2 items-center border-t border-border">
                                            <div className="col-span-4">
                                                <select
                                                    value={row.type}
                                                    onChange={e => updateRow(i, "type", e.target.value)}
                                                    className="w-full bg-muted border border-border rounded-md py-1.5 px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                                                >
                                                    {SCHEDULE_TYPES.map(t => <option key={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="relative">
                                                    <input
                                                        type="number" min="0" max="100" step="0.1"
                                                        value={row.percentage}
                                                        onChange={e => updateRow(i, "percentage", e.target.value)}
                                                        className="w-full bg-muted border border-border rounded-md py-1.5 pl-2 pr-5 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <span className="text-xs font-semibold text-foreground">{form.currency} {rowAmount}</span>
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="date"
                                                    value={row.due_date}
                                                    onChange={e => updateRow(i, "due_date", e.target.value)}
                                                    className="w-full bg-muted border border-border rounded-md py-1.5 px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                            <div className="col-span-1 flex justify-end">
                                                <button type="button" onClick={() => removeRow(i)} className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {scheduleRows.length === 0 && (
                                    <div className="px-3 py-4 text-center text-xs text-muted-foreground border-t border-border">
                                        No tranches defined. Click "Add Tranche" to build the payment schedule.
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                    </div>

                    <div className="p-6 pt-0 flex items-center space-x-3 shrink-0">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 border border-border rounded-xl font-bold text-sm hover:bg-muted transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex-[2] py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">
                            {loading ? "Creating..." : "Create Purchase Order"}
                        </button>
                    </div>
                </form>
            </div>

            <AddSupplierModal isOpen={isAddSupplierOpen} onClose={() => setIsAddSupplierOpen(false)} onSuccess={() => { setIsAddSupplierOpen(false); onSuccess(); }} />
            <AddCurrencyModal isOpen={isAddCurrencyOpen} onClose={() => setIsAddCurrencyOpen(false)} onSuccess={() => { setIsAddCurrencyOpen(false); onSuccess(); }} />
        </div>
    );
}

// ——— Edit PO Modal ———
function EditPOModal({ po, projects, suppliers, currencies, onClose, onSuccess }: {
    po: PurchaseOrder | null;
    projects: Project[];
    suppliers: Supplier[];
    currencies: Currency[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({ po_number: "", project_id: "", supplier_id: "", date: "", amount: "", currency: "USD", description: "", status: "Issued", external_link: "" });

    useEffect(() => {
        if (po) {
            setForm({
                po_number: po.po_number,
                project_id: po.project_id || "",
                supplier_id: po.supplier_id || "",
                date: po.date,
                amount: String(po.amount),
                currency: po.currency,
                description: po.description || "",
                status: po.status,
                external_link: po.external_link || ""
            });
        }
        setError(null);
    }, [po]);

    if (!po) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error: updateError } = await supabase.from("purchase_orders").update({
                po_number: form.po_number,
                project_id: form.project_id || null,
                supplier_id: form.supplier_id || null,
                supplier_name: suppliers.find(s => s.id === form.supplier_id)?.name || null,
                date: form.date,
                amount: parseFloat(form.amount),
                currency: form.currency,
                description: form.description,
                status: form.status,
                external_link: form.external_link ? form.external_link : null,
            }).eq("id", po.id);
            if (updateError) throw updateError;
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to update PO.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h3 className="text-xl font-bold">Edit Purchase Order</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Update details for <span className="text-primary font-semibold">{po.po_number}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">PO Number *</label>
                            <input required type="text" value={form.po_number} onChange={e => setForm(f => ({ ...f, po_number: e.target.value }))} className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Project</label>
                            <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm">
                                <option value="">— Select Project —</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Supplier *</label>
                        <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <select
                                required
                                value={form.supplier_id}
                                onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">— Select Supplier —</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Currency</label>
                            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold">
                                {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount *</label>
                            <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input required type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold" /></div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Status</label>
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm">
                                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Description</label>
                        <div className="relative"><FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm resize-none" /></div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">External Link <span className="text-muted-foreground/50 font-normal">(Optional)</span></label>
                        <input type="url" placeholder="https://..." value={form.external_link} onChange={e => setForm(f => ({ ...f, external_link: e.target.value }))} className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm" />
                    </div>
                    {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                    <div className="pt-2 flex items-center space-x-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 border border-border rounded-xl font-bold text-sm hover:bg-muted transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-[2] py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50">{loading ? "Saving..." : "Save Changes"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const STATUS_COLORS: Record<string, string> = {
    "Issued": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Approved": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Closed": "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    "Cancelled": "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function PurchaseOrders() {
    const [pos, setPos] = useState<PurchaseOrder[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchData = async () => {
        const supabase = createClient();
        const [
            { data: posData },
            { data: projectsData },
            { data: suppliersData },
            { data: currenciesData }
        ] = await Promise.all([
            supabase.from("purchase_orders").select("*, suppliers(name)").order("date", { ascending: false }),
            supabase.from("projects").select("id, name"),
            supabase.from("suppliers").select("*").order("name"),
            supabase.from("currencies").select("*").order("code")
        ]);
        setPos(posData || []);
        setProjects(projectsData || []);
        setSuppliers(suppliersData || []);
        setCurrencies(currenciesData || []);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const getProjectName = (projectId: string) => projects.find(p => p.id === projectId)?.name || "—";

    // Display the joined supplier name, or fallback to the legacy supplier_name column
    const getSupplierName = (po: PurchaseOrder) => po.suppliers?.name || po.supplier_name || "—";

    const handleDelete = async (id: string) => {
        const supabase = createClient();
        await supabase.from("purchase_orders").delete().eq("id", id);
        setDeletingId(null);
        fetchData();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
                    <p className="text-muted-foreground">Manage and track all issued purchase orders.</p>
                </div>
                <button
                    onClick={() => setIsNewModalOpen(true)}
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
                                <th className="px-6 py-4">Actions</th>
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
                                            {getSupplierName(po)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {po.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold">
                                        <span className="text-xs text-muted-foreground mr-1">{po.currency}</span>
                                        {po.amount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[po.status] || STATUS_COLORS["Issued"]}`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <a href={`/pos/${po.id}`} className="p-1.5 hover:bg-muted rounded-lg inline-block transition-colors" title="View detail">
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </a>
                                            <button onClick={() => setEditingPO(po)} className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Edit PO">
                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            {deletingId === po.id ? (
                                                <span className="flex items-center gap-1">
                                                    <button onClick={() => handleDelete(po.id)} className="px-2 py-1 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-md">Confirm</button>
                                                    <button onClick={() => setDeletingId(null)} className="px-2 py-1 text-[10px] font-bold bg-muted rounded-md">Cancel</button>
                                                </span>
                                            ) : (
                                                <button onClick={() => setDeletingId(po.id)} className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors" title="Delete PO">
                                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <NewPOModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                projects={projects}
                suppliers={suppliers}
                currencies={currencies}
                onSuccess={fetchData}
            />
            <EditPOModal
                po={editingPO}
                projects={projects}
                suppliers={suppliers}
                currencies={currencies}
                onClose={() => setEditingPO(null)}
                onSuccess={fetchData}
            />
        </div>
    );
}
