export interface Project {
    id: string;
    name: string;
    owner: string;
    currency: string;
    status: 'Active' | 'On Hold' | 'Closed';
    totalPOAmount: number;
    totalPaid: number;
}

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    projectId: string;
    supplierId: string;
    date: string;
    amount: number;
    currency: string;
    status: 'Issued' | 'Approved' | 'In Progress' | 'Closed' | 'Cancelled';
    description: string;
}

export interface PaymentSchedule {
    id: string;
    poId: string;
    paymentNo: number;
    type: 'Advance' | 'Milestone' | 'Final' | 'Retention' | 'Variation';
    dueDate: string;
    amount: number;
    status: 'Paid' | 'Partial' | 'Pending';
}

export interface Payment {
    id: string;
    scheduleId: string;
    date: string;
    amount: number;
    method: string;
    reference: string;
    paidBy: string;
}

export const MOCK_PROJECTS: Project[] = [
    { id: '1', name: 'Planta de Energía Solar A1', owner: 'Juan Pérez', currency: 'USD', status: 'Active', totalPOAmount: 150000, totalPaid: 45000 },
    { id: '2', name: 'Remodelación Oficinas Centrales', owner: 'Maria Garcia', currency: 'EUR', status: 'Active', totalPOAmount: 75000, totalPaid: 75000 },
];

export const MOCK_POS: PurchaseOrder[] = [
    { id: 'po1', poNumber: 'PO-2024-001', projectId: '1', supplierId: 's1', date: '2024-01-15', amount: 100000, currency: 'USD', status: 'In Progress', description: 'Suministro de Paneles Fotovoltaicos' },
    { id: 'po2', poNumber: 'PO-2024-002', projectId: '1', supplierId: 's2', date: '2024-02-01', amount: 50000, currency: 'USD', status: 'Issued', description: 'Instalación Eléctrica' },
];

export const MOCK_SCHEDULES: PaymentSchedule[] = [
    { id: 'sch1', poId: 'po1', paymentNo: 1, type: 'Advance', dueDate: '2024-01-20', amount: 30000, status: 'Paid' },
    { id: 'sch2', poId: 'po1', paymentNo: 2, type: 'Milestone', dueDate: '2024-03-15', amount: 40000, status: 'Partial' },
    { id: 'sch3', poId: 'po1', paymentNo: 3, type: 'Final', dueDate: '2024-06-01', amount: 30000, status: 'Pending' },
];

export const MOCK_PAYMENTS: Payment[] = [
    { id: 'pay1', scheduleId: 'sch1', date: '2024-01-21', amount: 30000, method: 'Bank Transfer', reference: 'UTR-998877', paidBy: 'Admin' },
    { id: 'pay2', scheduleId: 'sch2', date: '2024-03-20', amount: 15000, method: 'Swift', reference: 'SW-112233', paidBy: 'Finance' },
];
