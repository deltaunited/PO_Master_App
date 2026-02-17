import Link from "next/link";
import { LayoutDashboard, Briefcase, Receipt, PieChart, Settings, ShoppingCart } from "lucide-react";

const SIDEBAR_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Proyectos", href: "/projects", icon: Briefcase },
    { name: "Purchase Orders", href: "/pos", icon: ShoppingCart },
    { name: "Pagos", href: "/payments", icon: Receipt },
    { name: "Reportes", href: "/reports", icon: PieChart },
];

export function Sidebar() {
    return (
        <div className="flex h-screen w-64 flex-col border-r bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-xl">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    PO Master
                </span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {SIDEBAR_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                    >
                        <item.icon className="mr-3 h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                        {item.name}
                    </Link>
                ))}
            </nav>
            <div className="border-t p-3">
                <button className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50">
                    <Settings className="mr-3 h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    Settings
                </button>
            </div>
        </div>
    );
}
