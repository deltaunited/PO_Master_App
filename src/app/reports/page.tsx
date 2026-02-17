import { BarChart3, PieChart, TrendingUp, Download } from "lucide-react";

export default function Reports() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Detailed analysis of execution and projections.</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold transition-all hover:bg-primary/90 shadow-sm">
                    <Download className="mr-2 h-4 w-4" /> Download Full Report
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard title="Budget Execution" description="Actual vs Estimated spending by project" icon={BarChart3} />
                <ReportCard title="Payment Aging" description="Breakdown of upcoming and overdue payments" icon={PieChart} />
                <ReportCard title="Cash Flow Trend" description="90-day payment projection" icon={TrendingUp} />
            </div>

            <div className="rounded-xl border border-border p-12 flex flex-col items-center justify-center bg-card/50 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">Loading interactive charts...</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Connect a real database to see real-time statistics.</p>
            </div>
        </div>
    );
}

function ReportCard({ title, description, icon: Icon }: any) {
    return (
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-primary/20">
            <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    );
}
