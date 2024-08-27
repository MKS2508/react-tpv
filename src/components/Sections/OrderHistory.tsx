
import { useMemo, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Order from "@/models/Order.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowUpDown, Banknote, CheckCircle, CreditCard, FileText, HandCoins, Loader2, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {renderTicketPreview} from "@/assets/utils/utils.ts";

interface OrderHistoryProps {
    orderHistory: Order[];
}

export default function Component({ orderHistory }: OrderHistoryProps) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' })
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const sortedAndFilteredOrders = useMemo(() => {
        let filteredOrders = orderHistory
        if (filterStatus !== 'all') {
            filteredOrders = orderHistory.filter(order => order.status === filterStatus)
        }
        return filteredOrders.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }, [orderHistory, sortConfig, filterStatus])

    const handleSort = (key: keyof Order) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }))
    }

    const handleDetails = (order: Order) => {
        setSelectedOrder(order)
        setIsDialogOpen(true)
    }

    const handleConfirmPayment = () => {
        console.log('Payment confirmed for order:', selectedOrder?.id)
        setIsDialogOpen(false)
    }

    const handlePrintTicket = () => {
        console.log('Printing ticket for order:', selectedOrder?.id)
    }
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Historial de Cuentas</h2>
            <div className="flex justify-between items-center">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="paid"><span className="flex items-center gap-2"><Banknote className="text-green-500" /> <span>Pagado</span></span></SelectItem>
                        <SelectItem value="unpaid"><span className="flex items-center gap-2"><HandCoins className="text-red-500" /> <span>No pagado</span></span></SelectItem>
                        <SelectItem value="canceled"><span className="flex items-center gap-2"><XCircle className="text-gray-500" /> <span>Cancelado</span></span></SelectItem>
                        <SelectItem value="inProgress"><span className="flex items-center gap-2"><Loader2 className="animate-spin text-blue-500" /> <span>En progreso</span></span></SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                            Fecha {sortConfig.key === 'date' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                        </TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Elementos</TableHead>
                        <TableHead>Mesa</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                            Estado {sortConfig.key === 'status' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                        </TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedAndFilteredOrders.map((order: Order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>{order.total.toFixed(2)}€</TableCell>
                            <TableCell>{order.itemCount}</TableCell>
                            <TableCell>{order.tableNumber === 0 ? 'Barra' : order.tableNumber}</TableCell>
                            <TableCell>
                                {order.status === 'paid' && order.paymentMethod === 'efectivo' && (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2">
                                            <HandCoins />
                                            <CheckCircle className="text-green-500" />
                                        </div>
                                        <div className="w-full border-t border-gray-200 my-1"></div>
                                        <span>Pagado con Efectivo</span>
                                    </div>
                                )}
                                {order.status === 'paid' && order.paymentMethod === 'tarjeta' && (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2">
                                            <CreditCard />
                                            <CheckCircle className="text-green-500" />
                                        </div>
                                        <div className="w-full border-t border-gray-200 my-1"></div>
                                        <span>Pagado con Tarjeta</span>
                                    </div>
                                )}
                                {order.status === 'unpaid' && (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="text-red-500" />
                                        </div>
                                        <div className="w-full border-t border-gray-200 my-1"></div>
                                        <span>No pagado</span>
                                    </div>
                                )}
                                {order.status === 'canceled' && (
                                    <div className="flex flex-col items-center">
                                        <XCircle className="text-gray-500" />
                                        <div className="w-full border-t border-gray-200 my-1"></div>
                                        <span>Cancelado</span>
                                    </div>
                                )}
                                {order.status === 'inProgress' && (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="animate-spin text-blue-500" />
                                        <div className="w-full border-t border-gray-200 my-1"></div>
                                        <span>En progreso</span>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" onClick={() => handleDetails(order)}>
                                    Detalles
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Detalles de la Orden</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="flex flex-1 gap-4 overflow-hidden">
                            <div className="flex-1 overflow-y-auto">
                                <ScrollArea className="h-[calc(80vh-120px)] pr-4">
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Fecha</Label>
                                            <Input value={selectedOrder.date} readOnly />
                                        </div>
                                        <div>
                                            <Label>Total</Label>
                                            <Input value={`${selectedOrder.total.toFixed(2)}€`} readOnly />
                                        </div>
                                        <div>
                                            <Label>Estado</Label>
                                            <Input value={selectedOrder.status} readOnly />
                                        </div>
                                        <div>
                                            <Label>Método de Pago</Label>
                                            <Input value={selectedOrder.paymentMethod} readOnly />
                                        </div>
                                        <div>
                                            <Label>Mesa</Label>
                                            <Input value={selectedOrder.tableNumber === 0 ? 'Barra' : selectedOrder.tableNumber.toString()} readOnly />
                                        </div>
                                        <div>
                                            <Label>Elementos</Label>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Producto</TableHead>
                                                        <TableHead>Cantidad</TableHead>
                                                        <TableHead>Precio</TableHead>
                                                        <TableHead>Subtotal</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedOrder.items.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.name}</TableCell>
                                                            <TableCell>{item.quantity}</TableCell>
                                                            <TableCell>{item.price.toFixed(2)}€</TableCell>
                                                            <TableCell>{(item.price * item.quantity).toFixed(2)}€</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                            <div className="w-1/3 border-l pl-4">
                                <Label>Vista previa del ticket</Label>
                                <div className="mt-2 bg-gray-100 p-4 h-[calc(80vh-180px)] overflow-y-auto">
                                    <pre className="text-xs whitespace-pre-wrap">
                                        {renderTicketPreview(selectedOrder)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={handlePrintTicket}>
                            <FileText className="mr-2 h-4 w-4" />
                            Imprimir Ticket
                        </Button>
                        {selectedOrder?.status === 'unpaid' && (
                            <Button onClick={handleConfirmPayment}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Confirmar Pago
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}