import { X, Calendar, DollarSign, FileText, Landmark } from "lucide-react";

export function RecordPaymentModal({ isOpen, onClose, poNumber, remainingAmount }: any) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h3 className="text-xl font-bold">Registrar Pago</h3>
                        <p className="text-xs text-zinc-500 font-medium">Registrando para <span className="text-blue-600">{poNumber}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Monto a Pagar</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    type="number"
                                    defaultValue={remainingAmount}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border rounded-lg py-2.5 pl-9 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Fecha del Pago</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    type="date"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border rounded-lg py-2.5 pl-9 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Referencia Bancaria (UTR / SWIFT)</label>
                        <div className="relative">
                            <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Ej. UTR-2024-8899"
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border rounded-lg py-2.5 pl-9 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Comprobante de Pago</label>
                        <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                            <FileText className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">Suelte el archivo aquí o haga click para subir</p>
                            <p className="text-[10px] uppercase font-bold mt-1 opacity-50">PDF, JPG, PNG (Max 5MB)</p>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border rounded-xl font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-3 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-shadow hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all"
                        >
                            Confirmar Pago
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
