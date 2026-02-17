"use client";

import { Card } from "@/components/Card";
import { MOCK_PROJECTS, Project } from "@/lib/mockData";
import { ArrowUpRight, ArrowDownRight, DollarSign, Briefcase, ShoppingCart, Receipt } from "lucide-react";

export default function Dashboard() {
    const totalPO = MOCK_PROJECTS.reduce((acc: number, p: Project) => acc + p.totalPOAmount, 0);
    const totalPaid = MOCK_PROJECTS.reduce((acc: number, p: Project) => acc + p.totalPaid, 0);
    const remaining = totalPO - totalPaid;
    const progress = (totalPaid / totalPO) * 100;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Financiero</h1>
                <p className="text-muted-foreground">Resumen de ejecución de presupuestos y pagos.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card title="Total PO Amount" value={`$${totalPO.toLocaleString()}`} icon={ShoppingCart} trend="+2.5%" trendType="up" />
                <Card title="Total Pagado" value={`$${totalPaid.toLocaleString()}`} icon={Receipt} trend="+12%" trendType="up" />
                <Card title="Por Pagar" value={`$${remaining.toLocaleString()}`} icon={DollarSign} trend="-4%" trendType="down" />
                <Card title="Progreso Global" value={`${progress.toFixed(1)}%`} icon={Briefcase} trend="+1.2%" trendType="up" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Proyectos Recientes</h2>
                    <div className="space-y-4">
                        {MOCK_PROJECTS.map((project: Project) => (
                            <div key={project.id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border transition-all hover:shadow-md">
                                <div className="space-y-1">
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{project.name}</p>
                                    <p className="text-xs text-zinc-500 uppercase">{project.owner}</p>
                                </div>
                                <div className="text-right flex items-center space-x-6 text-zinc-900 dark:text-zinc-100">
                                    <div>
                                        <p className="text-sm font-semibold">${project.totalPaid.toLocaleString()}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase">PAGADO</p>
                                    </div>
                                    <div className="w-16 h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full"
                                            style={{ width: `${(project.totalPaid / project.totalPOAmount) * 100}%` }}
                                        />
                                    </div>
                                    <button className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-span-3 rounded-xl border bg-card p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Próximos Pagos</h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase">Vencidos</p>
                            <p className="text-2xl font-bold text-red-900 dark:text-red-100 tracking-tight">$12,400</p>
                            <p className="text-xs text-red-600/80">3 facturas pendientes</p>
                        </div>
                        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border text-zinc-900 dark:text-zinc-100">
                            <p className="text-sm font-semibold text-zinc-500 uppercase">Programados (30 días)</p>
                            <p className="text-2xl font-bold tracking-tight">$45,000</p>
                            <p className="text-xs text-zinc-400">8 pagos pendientes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
