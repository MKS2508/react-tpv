import Product from "@/models/Product.ts";

type OrderItem = Product & {
    quantity: number
}
export default interface Order {
    id: number;
    date: string;
    total: number;
    itemCount: number;
    tableNumber: number;
    items: OrderItem[];
}