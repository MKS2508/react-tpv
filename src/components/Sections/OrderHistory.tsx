import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Order from "@/models/Order.ts";

interface OrderHistoryProps {
    orderHistory: Order[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orderHistory }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Historial de Cuentas</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Elementos</TableHead>
                        <TableHead>Mesa</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orderHistory.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>{order.total.toFixed(2)}€</TableCell>
                            <TableCell>{order.itemCount}</TableCell>
                            <TableCell>{order.tableNumber === 0 ? 'Barra' : order.tableNumber}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default OrderHistory;
