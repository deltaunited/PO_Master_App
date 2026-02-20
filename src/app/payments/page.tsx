"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Calendar, ExternalLink, Filter, Receipt, X, DollarSign, Landmark, Building2, Pencil, Trash2, Upload, FileText } from "lucide-react";

interface Payment {
    id: string;
    schedule_id: string;
    date: string;
    amount: number;
    method: string;
    reference: string;
    paid_by: string;
    payment_schedules?: {
        type: string;
        payment_no: number;
        purchase_orders?: {
            po_number: string;
            id: string;
        };
    };
    invoice_url?: string;
}

interface PurchaseOrder {
    id: string;
    po_number: string;
}

interface PaymentSchedule {
    id: string;
    po_id: string;
    type: string;
    payment_no: number;
    amount: number;
    status: string;
}

function RegisterPaymentModal({ isOpen, onClose, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [pos, setPos] = useState<PurchaseOrder[]>([]);
    const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        po_id: "",
        schedule_id: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        reference: "",
        method: "Bank Transfer",
        paid_by: "",
    });

    useEffect(() => {
        if (!isOpen) return;
        const fetchPOs = async () => {
            const supabase = createClient();
            const { data } = await supabase.from("purchase_orders").select("id, po_number").order("po_number");
            setPos(data || []);
        };
        fetchPOs();
        setForm({ po_id: "", schedule_id: "", amount: "", date: new Date().toISOString().split("T")[0], reference: "", method: "Bank Transfer", paid_by: "" });
        setError(null);
    }, [isOpen]);

    useEffect(() => {
        if (!form.po_id) { setSchedules([]); return; }
        const fetchSchedules = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("payment_schedules")
                .select("*")
                .eq("po_id", form.po_id)
                .neq("status", "Paid");
            setSchedules(data || []);
        };
        fetchSchedules();
    }, [form.po_id]);

    useEffect(() => {
        const sch = schedules.find(s => s.id === form.schedule_id);
        if (sch) setForm(f => ({ ...f, amount: String(sch.amount) }));
    }, [form.schedule_id]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error: insertError } = await supabase.from("payments").insert({
                schedule_id: form.schedule_id || null,
                amount: parseFloat(form.amount),
                date: form.date,
                reference: form.reference,
                method: form.method,
                paid_by: form.paid_by,
            });
            if (insertError) throw insertError;
            if (form.schedule_id) {
                await supabase.from("payment_schedules").update({ status: "Paid" }).eq("id", form.schedule_id);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to register payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h3 className="text-xl font-bold">Register Payment</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Record a new payment transaction</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Purchase Order</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <select
                                value={form.po_id}
                                onChange={e => setForm(f => ({ ...f, po_id: e.target.value, schedule_id: "" }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">— Select PO —</option>
                                {pos.map(po => <option key={po.id} value={po.id}>{po.po_number}</option>)}
                            </select>
                        </div>
                    </div>

                    {schedules.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Payment Milestone</label>
                            <select
                                value={form.schedule_id}
                                onChange={e => setForm(f => ({ ...f, schedule_id: e.target.value }))}
                                className="w-full bg-muted border border-border rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">— Select Milestone —</option>
                                {schedules.map(s => (
                                    <option key={s.id} value={s.id}>
                                        #{s.payment_no} — {s.type} (${s.amount.toLocaleString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

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
                                    placeholder="0.00"
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
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Bank Reference *</label>
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
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Method</label>
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

function EditPaymentModal({ payment, isOpen, onClose, onSuccess }: {
    payment: Payment | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        amount: "",
        date: "",
        reference: "",
        method: "Bank Transfer",
        paid_by: "",
    });

    useEffect(() => {
        if (!isOpen || !payment) return;
        setForm({
            amount: String(payment.amount),
            date: payment.date,
            reference: payment.reference,
            method: payment.method,
            paid_by: payment.paid_by || ""
        });
        setError(null);
    }, [isOpen, payment]);

    if (!isOpen || !payment) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error: updateError } = await supabase.from("payments").update({
                amount: parseFloat(form.amount),
                date: form.date,
                reference: form.reference,
                method: form.method,
                paid_by: form.paid_by,
            }).eq("id", payment.id);
            if (updateError) throw updateError;
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to update payment.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !payment) return;
        setUploading(true);
        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${payment.id}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('documents').upload(`invoices/${fileName}`, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(`invoices/${fileName}`);
            const { error: dbError } = await supabase.from('payments').update({ invoice_url: publicUrl }).eq('id', payment.id);
            if (dbError) throw dbError;
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Failed to upload file.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h3 className="text-xl font-bold">Edit Payment</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Update payment details</p>
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
                                    placeholder="0.00"
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
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Bank Reference *</label>
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
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Method</label>
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
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Payments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchPayments = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("payments")
            .select(`*, payment_schedules (type, payment_no, purchase_orders (po_number, id))`)
            .order("date", { ascending: false });
        if (error) console.error("Error fetching payments:", error);
        setPayments(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchPayments(); }, []);

    const handleDelete = async (id: string) => {
        const supabase = createClient();
        await supabase.from("payments").delete().eq("id", id);
        setDeletingId(null);
        fetchData();
    };

    const fetchData = fetchPayments;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                    <p className="text-muted-foreground">Transaction history and receipts.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                        <Filter className="mr-2 h-4 w-4" /> Filters
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        + Register Payment
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : payments.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-border rounded-xl">
                    <Receipt className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No payments recorded yet</h3>
                    <p className="text-muted-foreground text-sm mt-1">Click "+ Register Payment" to record a transaction.</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">PO / Milestone</th>
                                <th className="px-6 py-4">Reference</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Amount Paid</th>
                                <th className="px-6 py-4">Invoice</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {payment.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-primary">
                                                {payment.payment_schedules?.purchase_orders?.po_number || "—"}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                                                {payment.payment_schedules
                                                    ? `${payment.payment_schedules.type} #${payment.payment_schedules.payment_no}`
                                                    : "Manual payment"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-muted-foreground">{payment.reference}</td>
                                    <td className="px-6 py-4">{payment.method}</td>
                                    <td className="px-6 py-4 font-bold text-emerald-400">${payment.amount?.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        {payment.invoice_url ? (
                                            <a href={payment.invoice_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center text-xs font-medium">
                                                <ExternalLink className="h-3 w-3 mr-1" /> View
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground/50 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setEditingPayment(payment)} className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Edit Payment">
                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            {deletingId === payment.id ? (
                                                <span className="flex items-center gap-1">
                                                    <button onClick={() => handleDelete(payment.id)} className="px-2 py-1 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-md">Confirm</button>
                                                    <button onClick={() => setDeletingId(null)} className="px-2 py-1 text-[10px] font-bold bg-muted rounded-md">Cancel</button>
                                                </span>
                                            ) : (
                                                <button onClick={() => setDeletingId(payment.id)} className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors" title="Delete Payment">
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

            <RegisterPaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchPayments}
            />

            <EditPaymentModal
                payment={editingPayment}
                isOpen={!!editingPayment}
                onClose={() => setEditingPayment(null)}
                onSuccess={fetchPayments}
            />
        </div>
    );
}
