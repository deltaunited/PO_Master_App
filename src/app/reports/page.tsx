import { MOCK_PROJECTS } from "@/lib/mockData";
import { BarChart3, PieChart, TrendingUp, Download } from "lucide-react";

export default function Reports() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reportes & Analytics</h1>
                    <p className="text-muted-foreground">Análisis detallado de ejecución y proyecciones.</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold transition-all">
                    <Download className="mr-2 h-4 w-4" /> Descargar Reporte Completo
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard title="Ejecución Presupuestaria" description="Gasto real vs Estimado por proyecto" icon={BarChart3} />
                <ReportCard title="Aging de Pagos" description="Desglose de pagos próximos y vencidos" icon={PieChart} />
                <ReportCard title="Tendencia de Flujo" description="Proyección de pagos a 90 días" icon={TrendingUp} />
            </div>

            <div className="rounded-xl border p-12 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <BarChart3 className="h-12 w-12 text-zinc-300 mb-4" />
                <p className="text-zinc-500 font-medium">Gráficos interactivos cargando...</p>
                <p className="text-xs text-zinc-400 mt-1">Conecte una base de datos real para ver estadísticas en tiempo real.</p>
            </div>
        </div>
    );
}

function ReportCard({ title, description, icon: Icon }: any) {
    return (
        <div className="p-6 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="text-xs text-zinc-500">{description}</p>
                </div>
            </div>
        </div>
    );
}
