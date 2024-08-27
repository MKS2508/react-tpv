import Product from "@/models/Product.ts";

export interface OrderItem extends Product {
    quantity: number;
}
export default interface Order {
    id: number;
    date: string;
    total: number;
    change: number;
    totalPaid: number;
    itemCount: number;
    tableNumber: number;
    paymentMethod: "efectivo" | "tarjeta" | string;
    ticketPath: string;
    status: "paid" | "unpaid" | "canceled" | "inProgress" | string;
    items: OrderItem[];
}