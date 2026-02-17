import { ArrowRight, BarChart3, Receipt, Wallet, Activity, Briefcase, FileText, PieChart } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-8">
            <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">
                    Overview of your financial status and active projects.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Briefcase className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                            <h2 className="text-2xl font-bold">12</h2>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Wallet className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                            <h2 className="text-2xl font-bold">$45,231.89</h2>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <FileText className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pending POs</p>
                            <h2 className="text-2xl font-bold">5</h2>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Activity className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Monthly Spending</p>
                            <h2 className="text-2xl font-bold">$12,400</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Projects Card */}
                <Link
                    href="/projects"
                    className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20"
                >
                    <div className="mb-4 rounded-full bg-blue-500/10 w-fit p-3">
                        <Briefcase className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Projects</h3>
                    <p className="text-muted-foreground mb-4">
                        Manage your linked purchase orders and track project progress.
                    </p>
                    <div className="flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                        View Projects <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </Link>

                {/* Payments Card */}
                <Link
                    href="/payments"
                    className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20"
                >
                    <div className="mb-4 rounded-full bg-emerald-500/10 w-fit p-3">
                        <Wallet className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Payments</h3>
                    <p className="text-muted-foreground mb-4">
                        Quick registration of transactions and receipt management.
                    </p>
                    <div className="flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                        View Payments <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </Link>

                {/* Reports Card */}
                <Link
                    href="/reports"
                    className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20"
                >
                    <div className="mb-4 rounded-full bg-purple-500/10 w-fit p-3">
                        <PieChart className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Reports</h3>
                    <p className="text-muted-foreground mb-4">
                        Detailed reports of balances, expirations, and financial health.
                    </p>
                    <div className="flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                        View Reports <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </Link>
            </div>
        </main>
    );
}
