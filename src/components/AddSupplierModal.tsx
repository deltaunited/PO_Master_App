import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Building2, Globe, Phone, Mail } from "lucide-react";

export function AddSupplierModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
    const [form, setForm] = useState({ name: "", website: "", phone: "", email: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error: insertError } = await supabase.from("suppliers").insert({
                name: form.name,
                website: form.website || null,
                phone: form.phone || null,
                email: form.email || null,
            });
            if (insertError) throw insertError;
            onSuccess();
            onClose();
            setForm({ name: "", website: "", phone: "", email: "" });
        } catch (err: any) {
            setError(err.message || "Failed to add supplier.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="text-lg font-bold">Register Supplier</h3>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Company Name *</label>
                        <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-muted border border-border rounded-lg py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm" /></div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Website (Optional)</label>
                        <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input type="url" placeholder="https://..." value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="w-full bg-muted border border-border rounded-lg py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Phone (Optional)</label>
                            <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-muted border border-border rounded-lg py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm" /></div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Email (Optional)</label>
                            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-muted border border-border rounded-lg py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary text-sm" /></div>
                        </div>
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50">
                            {loading ? "Registering..." : "Register Supplier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
