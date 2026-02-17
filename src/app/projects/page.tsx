import { MOCK_PROJECTS, Project } from "@/lib/mockData";
import { Briefcase, User, Currency, Circle } from "lucide-react";

export default function Projects() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
                    <p className="text-muted-foreground">Listado de proyectos activos y su estado financiero.</p>
                </div>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                    + Nuevo Proyecto
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_PROJECTS.map((project: Project) => (
                    <div key={project.id} className="group overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <div className="flex items-center space-x-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider border">
                                    <Circle className={`h-2 w-2 fill-current ${project.status === 'Active' ? 'text-emerald-500' : 'text-zinc-400'}`} />
                                    <span>{project.status}</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-1">{project.name}</h3>
                            <div className="flex items-center text-sm text-zinc-500 mb-6">
                                <User className="mr-1 h-3 w-3" />
                                {project.owner}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500">Progreso de Pago</span>
                                    <span className="font-semibold text-blue-600">
                                        {((project.totalPaid / project.totalPOAmount) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-full transition-all duration-500"
                                        style={{ width: `${(project.totalPaid / project.totalPOAmount) * 100}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Total PO</p>
                                        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">${project.totalPOAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Balance</p>
                                        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                            ${(project.totalPOAmount - project.totalPaid).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border-t px-6 py-4">
                            <a
                                href={`/projects/1`} // Hardcoded for demo
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center w-full"
                            >
                                Ver Detalles <Briefcase className="ml-2 h-4 w-4" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
