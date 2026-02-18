import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "PO Master App",
    description: "Manage purchase orders and payment schedules easily",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-background text-foreground`}>
                <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden relative">
                        <Navbar />
                        <main className="p-8">
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}
