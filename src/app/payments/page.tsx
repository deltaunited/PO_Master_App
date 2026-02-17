import { MOCK_PAYMENTS, MOCK_POS, MOCK_SCHEDULES, Payment, PurchaseOrder, PaymentSchedule } from "@/lib/mockData";
import { Receipt, Calendar, DollarSign, ExternalLink, Filter } from "lucide-react";

export default function Payments() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Registro de Pagos</h1>
                    <p className="text-muted-foreground">Historial de transacciones reales y comprobantes.</p>
                </div>
                <div className="flex space-x-3 text-zinc-900 dark:text-zinc-100">
                    <button className="flex items-center px-4 py-2 border rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <Filter className="mr-2 h-4 w-4" /> Filtros
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                        + Registrar Pago Manual
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="bg-white dark:bg-zinc-900 border rounded-xl shadow-sm overflow-hidden text-zinc-900 dark:text-zinc-100">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800 text-xs font-bold uppercase text-zinc-500 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">PO / Hito</th>
                                <th className="px-6 py-4">Referencia</th>
                                <th className="px-6 py-4">Método</th>
                                <th className="px-6 py-4">Monto Pagado</th>
                                <th className="px-6 py-4">Registrado por</th>
                                <th className="px-6 py-4">Comprobante</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {MOCK_PAYMENTS.map((payment: Payment) => {
                                const schedule = MOCK_SCHEDULES.find((s: PaymentSchedule) => s.id === payment.scheduleId);
                                const po = MOCK_POS.find((p: PurchaseOrder) => p.id === schedule?.poId);

                                return (
                                    <tr key={payment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 flex items-center">
                                            <Calendar className="mr-2 h-4 w-4 text-zinc-400" />
                                            {payment.date}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-blue-600">{po?.poNumber}</span>
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-tight">{schedule?.type} #{schedule?.paymentNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-zinc-600 dark:text-zinc-400">{payment.reference}</td>
                                        <td className="px-6 py-4">{payment.method}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">${payment.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-zinc-500">{payment.paidBy}</td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded group flex items-center text-blue-600 font-semibold text-xs">
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
