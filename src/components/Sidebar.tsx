import Link from "next/link";
import { LayoutDashboard, Briefcase, Receipt, PieChart, Settings, ShoppingCart } from "lucide-react";

const SIDEBAR_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: Briefcase },
    { name: "Purchase Orders", href: "/pos", icon: ShoppingCart },
    { name: "Payments", href: "/payments", icon: Receipt },
    { name: "Reports", href: "/reports", icon: PieChart },
];

export function Sidebar() {
    return (
        <div className="flex h-screen w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl">
            <div className="flex h-16 items-center border-b border-border px-6">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    PO Master
                </span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {SIDEBAR_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                    </Link>
                ))}
            </nav>
            <div className="border-t border-border p-3">
                <button className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground">
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                </button>
            </div>
        </div>
    );
}
