"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Calendar, ExternalLink, Filter, Receipt } from "lucide-react";

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
        };
    };
}

export default function Payments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("payments")
                .select(`
                    *,
                    payment_schedules (
                        type,
                        payment_no,
                        purchase_orders (
                            po_number
                        )
                    )
                `)
                .order("date", { ascending: false });

            if (error) console.error("Error fetching payments:", error);
            setPayments(data || []);
            setLoading(false);
        };

        fetchPayments();
    }, []);

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
                    <p className="text-muted-foreground text-sm mt-1">
                        Go to a Purchase Order and click "Record Payment" to register a transaction.
                    </p>
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
                                <th className="px-6 py-4">Registered By</th>
                                <th className="px-6 py-4">Receipt</th>
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
                                                {payment.payment_schedules?.type} #{payment.payment_schedules?.payment_no}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-muted-foreground">{payment.reference}</td>
                                    <td className="px-6 py-4">{payment.method}</td>
                                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                                        ${payment.amount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{payment.paid_by || "—"}</td>
                                    <td className="px-6 py-4">
                                        <button className="flex items-center text-primary font-semibold text-xs hover:underline">
                                            View <ExternalLink className="ml-1 h-3 w-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
