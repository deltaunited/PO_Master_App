import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface CardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend: string;
    trendType: 'up' | 'down';
}

export function Card({ title, value, icon: Icon, trend, trendType }: CardProps) {
    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium">{title}</p>
                <Icon className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="flex items-baseline space-x-2 text-zinc-900 dark:text-zinc-100">
                <h2 className="text-2xl font-bold">{value}</h2>
                <span className={`text-xs font-medium flex items-center ${trendType === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trendType === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                    {trend}
                </span>
            </div>
        </div>
    );
}
