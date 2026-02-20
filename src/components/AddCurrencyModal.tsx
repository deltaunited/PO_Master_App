import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

export function AddCurrencyModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error: insertError } = await supabase.from("currencies").insert({ code: code.toUpperCase(), name });
            if (insertError) throw insertError;
            onSuccess();
            onClose();
            setCode("");
            setName("");
        } catch (err: any) {
            setError(err.message || "Failed to add currency.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="text-lg font-bold">Add Currency</h3>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Currency Code (e.g. MXN) *</label>
                        <input required type="text" maxLength={3} value={code} onChange={e => setCode(e.target.value)} className="w-full bg-muted border border-border rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-primary text-sm uppercase" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Currency Name *</label>
                        <input required type="text" placeholder="Mexican Peso" value={name} onChange={e => setName(e.target.value)} className="w-full bg-muted border border-border rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-primary text-sm" />
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50">
                            {loading ? "Adding..." : "Add Currency"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
