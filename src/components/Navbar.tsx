import { Bell, Search, User } from "lucide-react";

export function Navbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b px-8 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex w-96 items-center rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
                <Search className="h-4 w-4 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Buscar PO, proyecto..."
                    className="ml-2 w-full bg-transparent text-sm outline-none"
                />
            </div>
            <div className="flex items-center space-x-4">
                <button className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <Bell className="h-5 w-5 text-zinc-500" />
                </button>
                <div className="flex items-center space-x-2 border-l pl-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-sm font-medium">David H.</div>
                </div>
            </div>
        </header>
    );
}
