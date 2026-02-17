import { MOCK_POS } from "@/lib/mockData";
import { ShoppingCart, Calendar, Building2, Tag, ChevronRight } from "lucide-react";

export default function PurchaseOrders() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
                    <p className="text-muted-foreground">Gestión de órdenes de compra emitidas.</p>
                </div>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                    + Nueva PO
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-xs font-bold uppercase text-zinc-500 tracking-wider">
                        <tr>
                            <th className="px-6 py-4">PO Number</th>
                            <th className="px-6 py-4">Proveedor</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Monto</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Progreso</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {MOCK_POS.map((po) => (
                            <tr key={po.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-blue-600">{po.poNumber}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <Building2 className="mr-2 h-4 w-4 text-zinc-400" />
                                        {po.supplierId === 's1' ? 'Suministros Globales' : 'Contratistas Unidos'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-zinc-500">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {po.date}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-semibold">${po.amount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${po.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-zinc-50 text-zinc-600 border border-zinc-100'}`}>
                                        {po.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 w-48">
                                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full" style={{ width: '45%' }} />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <a href={`/pos/${po.id}`} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full inline-block transition-colors">
                                        <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-blue-500" />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
