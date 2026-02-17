import { Bell, Search, User } from "lucide-react";

export function Navbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border px-8 bg-card/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex w-96 items-center rounded-full bg-accent/50 px-4 py-2 border border-border/50 focus-within:border-primary/50 transition-colors">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search PO, project..."
                    className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 text-foreground"
                />
            </div>
            <div className="flex items-center space-x-4">
                <button className="rounded-full p-2 hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors">
                    <Bell className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-2 border-l border-border pl-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center ring-2 ring-background">
                        <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="text-sm font-medium text-foreground">David H.</div>
                </div>
            </div>
        </header>
    );
}
