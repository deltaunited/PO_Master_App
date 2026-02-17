import { MOCK_PAYMENTS, MOCK_POS, MOCK_SCHEDULES, Payment, PurchaseOrder, PaymentSchedule } from "@/lib/mockData";
import { Calendar, ExternalLink, Filter } from "lucide-react";

export default function Payments() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                    <p className="text-muted-foreground">Transaction history and receipts.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Filter className="mr-2 h-4 w-4" /> Filters
                    </button>
                    <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                        + Register Manual Payment
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden text-card-foreground">
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
                            {MOCK_PAYMENTS.map((payment: Payment) => {
                                const schedule = MOCK_SCHEDULES.find((s: PaymentSchedule) => s.id === payment.scheduleId);
                                const po = MOCK_POS.find((p: PurchaseOrder) => p.id === schedule?.poId);

                                return (
                                    <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 flex items-center">
                                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {payment.date}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-primary">{po?.poNumber}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-tight">{schedule?.type} #{schedule?.paymentNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-muted-foreground">{payment.reference}</td>
                                        <td className="px-6 py-4">{payment.method}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">${payment.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{payment.paidBy}</td>
                                        <td className="px-6 py-4">
                                            <button className="flex items-center text-primary font-semibold text-xs hover:underline">
                                                View <ExternalLink className="ml-1 h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
