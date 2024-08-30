import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MinusIcon, PlusIcon } from "lucide-react"
import Order from "@/models/Order"
import Product from "@/models/Product"

type OrderTableProps = {
    order: Order
    handleRemoveFromOrder: (orderId: number, productId: number) => void
    handleAddToOrder: (orderId: number, product: Product) => void
}

const OrderTable: React.FC<OrderTableProps> = ({order, handleRemoveFromOrder, handleAddToOrder}) => (
    <div className="overflow-x-auto">
        <Table className="w-full">
            <TableHeader>
                <TableRow>
                    <TableHead className="text-gray-700 dark:text-gray-300 text-left">Producto</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 text-center">Cantidad</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 text-right">Precio</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 text-center">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {order.items.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="text-gray-800 dark:text-gray-200 text-left">
                            <span className="font-medium">{item.name}</span>
                        </TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-200 text-center">
                            {item.quantity}
                        </TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-200 text-right">
                            {(item.price * item.quantity).toFixed(2)}€
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 bg-gray-100 dark:text-red-400 dark:bg-blue-950 dark:hover:text-red-300"
                                    onClick={() => handleRemoveFromOrder(order.id, item.id)}
                                >
                                    <MinusIcon className="h-4 w-4"/>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 p-0 text-green-500 hover:text-green-700 bg-gray-100 dark:text-green-400 dark:bg-blue-950 dark:hover:text-green-300"
                                    onClick={() => handleAddToOrder(order.id, item)}
                                >
                                    <PlusIcon className="h-4 w-4"/>
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
)

export default OrderTable