"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Calendar, DollarSign, Download, Plus, Receipt, ShoppingCart, Tag, ArrowLeft, X, Landmark } from "lucide-react";

interface PurchaseOrder {
    id: string;
    po_number: string;
    project_id: string;
    supplier_name: string;
    currency: string;
    date: string;
    amount: number;
    status: string;
    description: string;
    suppliers?: { name: string };
}

interface PaymentSchedule {
    id: string;
    po_id: string;
    payment_no: number;
    type: string;
    due_date: string;
    amount: number;
    status: string;
}

function RecordPaymentModal({ isOpen, onClose, schedule, poNumber, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    schedule: PaymentSchedule | null;
    poNumber: string;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        reference: "",
        method: "Bank Transfer",
        paid_by: "",
    });

    useEffect(() => {
        if (schedule) setForm(f => ({ ...f, amount: String(schedule.amount) }));
    }, [schedule]);

    if (!isOpen || !schedule) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error: insertError } = await supabase.from("payments").insert({
                schedule_id: schedule.id,
                amount: parseFloat(form.amount),
                date: form.date,
                reference: form.reference,
                method: form.method,
                paid_by: form.paid_by,
            });
            if (insertError) throw insertError;

            // Update schedule status to Paid
            await supabase.from("payment_schedules").update({ status: "Paid" }).eq("id", schedule.id);

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to record payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h3 className="text-xl font-bold">Record Payment</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">For <span className="text-primary font-semibold">{poNumber}</span> — {schedule.type} #{schedule.payment_no}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount Paid *</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    required type="number" min="0" step="0.01"
                                    value={form.amount}
                                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                    className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Payment Date *</label>
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
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Bank Reference (UTR / SWIFT) *</label>
                        <div className="relative">
                            <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                required type="text" placeholder="e.g. UTR-2024-8899"
                                value={form.reference}
                                onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Payment Method</label>
                            <select
                                value={form.method}
                                onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option>Bank Transfer</option>
                                <option>SWIFT</option>
                                <option>Check</option>
                                <option>Cash</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Paid By</label>
                            <input
                                type="text" placeholder="e.g. Finance Dept"
                                value={form.paid_by}
                                onChange={e => setForm(f => ({ ...f, paid_by: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                    </div>
                    {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                    <div className="pt-2 flex items-center space-x-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 border border-border rounded-xl font-bold text-sm hover:bg-muted transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex-[2] py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">
                            {loading ? "Saving..." : "Confirm Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StatSmall({ title, value, icon: Icon, color }: any) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 flex items-center space-x-4 shadow-sm">
            <div className={`p-2 rounded-lg bg-muted ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground font-medium">{title}</p>
                <p className="text-lg font-bold">{value}</p>
            </div>
        </div>
    );
}

export default function PODetail({ params }: { params: { id: string } }) {
    const [po, setPo] = useState<PurchaseOrder | null>(null);
    const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
    const [totalPaid, setTotalPaid] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<PaymentSchedule | null>(null);

    const fetchData = async () => {
        const supabase = createClient();
        const [{ data: poData }, { data: schedulesData }, { data: paymentsData }] = await Promise.all([
            supabase.from("purchase_orders").select("*, suppliers(name)").eq("id", params.id).single(),
            supabase.from("payment_schedules").select("*").eq("po_id", params.id).order("payment_no"),
            supabase.from("payments").select("amount, schedule_id"),
        ]);
        setPo(poData);
        setSchedules(schedulesData || []);

        // Calculate total paid for this PO's schedules
        const scheduleIds = new Set((schedulesData || []).map((s: PaymentSchedule) => s.id));
        const paid = (paymentsData || [])
            .filter((p: any) => scheduleIds.has(p.schedule_id))
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        setTotalPaid(paid);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [params.id]);

    const handleOpenModal = (schedule: PaymentSchedule) => {
        setSelectedSchedule(schedule);
        setIsModalOpen(true);
    };

    const scheduleStatusColors: Record<string, string> = {
        "Paid": "text-emerald-600",
        "Partial": "text-amber-600",
        "Pending": "text-muted-foreground",
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!po) {
        return (
            <div className="p-12 text-center border border-dashed border-border rounded-xl">
                <h3 className="text-lg font-medium">Purchase Order not found</h3>
                <a href="/pos" className="text-primary text-sm mt-2 inline-flex items-center hover:underline">
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to Purchase Orders
                </a>
            </div>
        );
    }

    const remaining = po.amount - totalPaid;

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <a href="/pos" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2 transition-colors">
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Purchase Orders
                    </a>
                    <div className="flex items-center space-x-3">
                        <h1 className="text-3xl font-bold tracking-tight">{po.po_number}</h1>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold tracking-wider uppercase">
                            {po.status}
                        </span>
                    </div>
                    <p className="text-muted-foreground">{po.description || "No description provided."}</p>
                </div>
                <button className="flex items-center px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                    <Download className="mr-2 h-4 w-4" /> Export PDF
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatSmall title="Total PO Amount" value={`${po.currency} ${po.amount.toLocaleString()}`} icon={ShoppingCart} color="text-primary" />
                <StatSmall title="Total Paid" value={`${po.currency} ${totalPaid.toLocaleString()}`} icon={Receipt} color="text-emerald-600" />
                <StatSmall title="Remaining Balance" value={`${po.currency} ${remaining.toLocaleString()}`} icon={DollarSign} color="text-amber-600" />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border border-border shadow-sm bg-card">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-bold">Payment Schedule</h2>
                            <button className="text-xs font-semibold text-primary flex items-center hover:underline">
                                <Plus className="mr-1 h-3 w-3" /> Add Milestone
                            </button>
                        </div>
                        {schedules.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <p className="font-medium">No payment schedule yet</p>
                                <p className="text-sm mt-1">Add milestones to track payments for this PO.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {schedules.map((sch) => (
                                    <div key={sch.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold font-mono">
                                                {sch.payment_no}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{sch.type}</p>
                                                <p className="text-xs text-muted-foreground flex items-center">
                                                    <Calendar className="mr-1 h-3 w-3" /> {sch.due_date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-8 text-right">
                                            <div>
                                                <p className="text-sm font-bold">{po.currency} {sch.amount.toLocaleString()}</p>
                                                <p className={`text-[10px] font-bold uppercase ${scheduleStatusColors[sch.status] || "text-muted-foreground"}`}>
                                                    {sch.status}
                                                </p>
                                            </div>
                                            {sch.status !== "Paid" && (
                                                <button
                                                    onClick={() => handleOpenModal(sch)}
                                                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-[10px] font-bold uppercase transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
                                                >
                                                    Record Payment
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="text-base font-bold mb-4">Supplier Details</h2>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start">
                                <Tag className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-semibold">{po.suppliers?.name || po.supplier_name || "—"}</p>
                                    <p className="text-xs text-muted-foreground">Supplier</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2">Issue Date</p>
                                <p className="text-sm font-medium">{po.date}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RecordPaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schedule={selectedSchedule}
                poNumber={po.po_number}
                onSuccess={fetchData}
            />
        </div>
    );
}
