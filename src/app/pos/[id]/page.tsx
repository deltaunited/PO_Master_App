"use client";

import { MOCK_POS, MOCK_SCHEDULES, PaymentSchedule } from "@/lib/mockData";
import { Calendar, DollarSign, Download, Plus, Receipt, ShoppingCart, Tag } from "lucide-react";
import { useState } from "react";
import { RecordPaymentModal } from "@/components/RecordPaymentModal";

export default function PODetail({ params }: { params: { id: string } }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<PaymentSchedule | null>(null);

    // Demo context: use po1
    const po = MOCK_POS[0];
    const schedules = MOCK_SCHEDULES.filter((s: PaymentSchedule) => s.poId === po.id);

    const handleOpenModal = (schedule: PaymentSchedule) => {
        setSelectedSchedule(schedule);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 text-zinc-900 dark:text-zinc-100">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-3xl font-bold tracking-tight">{po.poNumber}</h1>
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 text-[10px] font-bold tracking-wider uppercase">
                            {po.status}
                        </span>
                    </div>
                    <p className="text-zinc-500">{po.description}</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <Download className="mr-2 h-4 w-4" /> Exportar PDF
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                        Editar PO
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatSmall title="Monto Total" value={`$${po.amount.toLocaleString()}`} icon={ShoppingCart} color="text-blue-600" />
                <StatSmall title="Total Pagado" value="$45,000" icon={Receipt} color="text-emerald-600" />
                <StatSmall title="Saldo Pendiente" value={`$${(po.amount - 45000).toLocaleString()}`} icon={DollarSign} color="text-amber-600" />
            </div>

            {/* Main Content */}
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border shadow-sm bg-white dark:bg-zinc-900">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold">Cronograma de Pagos</h2>
                            <button className="text-xs font-semibold text-blue-600 flex items-center hover:underline">
                                <Plus className="mr-1 h-3 w-3" /> Agregar Hito
                            </button>
                        </div>
                        <div className="divide-y text-zinc-900 dark:text-zinc-100">
                            {schedules.map((sch: PaymentSchedule) => (
                                <div key={sch.id} className="p-6 flex items-center justify-between group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-bold font-mono">
                                            {sch.paymentNo}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{sch.type}</p>
                                            <p className="text-xs text-zinc-500 flex items-center">
                                                <Calendar className="mr-1 h-3 w-3" /> {sch.dueDate}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-8 text-right">
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">${sch.amount.toLocaleString()}</p>
                                            <p className={`text-[10px] font-bold uppercase ${sch.status === 'Paid' ? 'text-emerald-600' : sch.status === 'Partial' ? 'text-amber-600' : 'text-zinc-400'}`}>
                                                {sch.status}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleOpenModal(sch)}
                                            className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md text-[10px] font-bold uppercase transition-all hover:scale-105 active:scale-95"
                                        >
                                            Registrar Pago
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h2 className="text-base font-bold mb-4">Detalles del Proveedor</h2>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start">
                                <Tag className="mr-2 h-4 w-4 text-zinc-400 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Suministros Globales S.A.</p>
                                    <p className="text-xs text-zinc-500">Proveedor de equipo solar</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Cuentas Bancarias</p>
                                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded text-xs font-mono border">
                                    JP Morgan Chase<br />
                                    Acc: ****5540<br />
                                    SWIFT: JPMOXXXX
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h2 className="text-base font-bold mb-4">Documentos</h2>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                <span>po-signed.pdf</span>
                                <Download className="h-3 w-3" />
                            </div>
                            <div className="flex items-center justify-between p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                <span>cotizacion.xlsx</span>
                                <Download className="h-3 w-3" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RecordPaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                poNumber={po.poNumber}
                remainingAmount={selectedSchedule?.amount}
            />
        </div>
    );
}

function StatSmall({ title, value, icon: Icon, color }: any) {
    return (
        <div className="rounded-xl border bg-card p-4 flex items-center space-x-4 shadow-sm">
            <div className={`p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs text-zinc-500 font-medium">{title}</p>
                <p className="text-lg font-bold">{value}</p>
            </div>
        </div>
    );
}
