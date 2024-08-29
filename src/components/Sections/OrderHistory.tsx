import  {useCallback, useMemo, useState} from 'react';
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
import { renderTicketPreview } from "@/assets/utils/utils.ts";
import { toast } from "@/components/ui/use-toast.ts";
import PaymentModal from "@/components/PaymentModal.tsx";

interface OrderHistoryProps {
    orderHistory: Order[];
    setOrderHistory: (orders: Order[]) => void;
    setActiveSection: (section: string) => void;
    selectedOrder: Order | null;
    setSelectedOrder: (order: Order | null) => void;
    setSelectedOrderId: (orderId: number | null) => void;
}

export default function Component({ orderHistory, setOrderHistory, setActiveSection, selectedOrder, setSelectedOrder, setSelectedOrderId }: OrderHistoryProps) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' })
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [cashAmount, setCashAmount] = useState('');
    const [showTicketDialog, setShowTicketDialog] = useState(false);

    const handleCompleteOrder = useCallback((completedOrder: Order) => {
        setOrderHistory(
            orderHistory.map(order =>
                order.id === completedOrder.id ? completedOrder : order
            )
        );
        toast({
            title: "Payment Confirmed",
            description: `Payment confirmed for order: ${completedOrder.id}`,
        });

        setShowTicketDialog(true); // Show ticket dialog after payment confirmation
    }, [setOrderHistory]);

    const handleTicketPrintingComplete = useCallback((shouldPrintTicket: boolean) => {
        setShowTicketDialog(false);
        setIsPaymentModalOpen(false);
        setIsDialogOpen(false);

        if (shouldPrintTicket) {
            handlePrintTicket();
        } else {
            toast({
                title: "Order Completed",
                description: "Order completed without printing ticket.",
                duration: 3000,
            });
        }
    }, []);
    const sortedAndFilteredOrders = useMemo(() => {
        let filteredOrders = orderHistory
        if (filterStatus !== 'all') {
            filteredOrders = orderHistory.filter(order => order.status === filterStatus).filter(order => order.itemCount > 0)
        }
        return filteredOrders.filter(order => order.itemCount > 0).sort((a, b) => {
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
        if (selectedOrder) {
            setIsPaymentModalOpen(true);
        }
    };


    const handlePrintTicket = () => {
        console.log('Printing ticket for order:', selectedOrder?.id)
        setShowTicketDialog(true);
    }

    const handleContinueOrder = () => {
        if (selectedOrder) {
            toast({
                title: "Resumiendo comanda",
                description: `Continuando pedido de la ${selectedOrder.tableNumber === 0 ? 'Barra' : "mesa " + selectedOrder.tableNumber.toString()}`,
            });

            setSelectedOrderId(selectedOrder.id);
            setActiveSection('newOrder');
            setIsDialogOpen(false);
        }
    };

    return (
        <div className="space-y-4 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-semibold">Historial de Cuentas</h2>
            <div className="flex justify-between items-center">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800">
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="paid"><span className="flex items-center gap-2"><Banknote className="text-green-500" /> <span>Pagado</span></span></SelectItem>
                        <SelectItem value="unpaid"><span className="flex items-center gap-2"><HandCoins className="text-red-500" /> <span>No pagado</span></span></SelectItem>
                        <SelectItem value="canceled"><span className="flex items-center gap-2"><XCircle className="text-gray-500" /> <span>Cancelado</span></span></SelectItem>
                        <SelectItem value="inProgress"><span className="flex items-center gap-2"><Loader2 className="animate-spin text-blue-500" /> <span>En progreso</span></span></SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Table className="border-collapse border border-gray-300 dark:border-gray-600">
                <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-700">
                        <TableHead className="cursor-pointer border border-gray-300 dark:border-gray-600" onClick={() => handleSort('date')}>
                            Fecha {sortConfig.key === 'date' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                        </TableHead>
                        <TableHead className="border border-gray-300 dark:border-gray-600">Total</TableHead>
                        <TableHead className="border border-gray-300 dark:border-gray-600">Elementos</TableHead>
                        <TableHead className="border border-gray-300 dark:border-gray-600">Mesa</TableHead>
                        <TableHead className="cursor-pointer border border-gray-300 dark:border-gray-600" onClick={() => handleSort('status')}>
                            Estado {sortConfig.key === 'status' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                        </TableHead>
                        <TableHead className="border border-gray-300 dark:border-gray-600">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedAndFilteredOrders.map((order: Order) => (
                        <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell className="border border-gray-300 dark:border-gray-600">{order.date}</TableCell>
                            <TableCell className="border border-gray-300 dark:border-gray-600">{order.total.toFixed(2)}€</TableCell>
                            <TableCell className="border border-gray-300 dark:border-gray-600">{order.itemCount}</TableCell>
                            <TableCell className="border border-gray-300 dark:border-gray-600">{order.tableNumber === 0 ? 'Barra' : order.tableNumber}</TableCell>
                            <TableCell className="border border-gray-300 dark:border-gray-600">
                                {order.status === 'paid' && order.paymentMethod === 'efectivo' && (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2">
                                            <HandCoins className="text-yellow-500" />
                                            <CheckCircle className="text-green-500" />
                                        </div>
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600 my-1"></div>
                                        <span>Pagado con Efectivo</span>
                                    </div>
                                )}
                                {order.status === 'paid' && order.paymentMethod === 'tarjeta' && (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="text-blue-500" />
                                            <CheckCircle className="text-green-500" />
                                        </div>
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600 my-1"></div>
                                        <span>Pagado con Tarjeta</span>
                                    </div>
                                )}
                                {order.status === 'unpaid' && (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="text-red-500" />
                                        </div>
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600 my-1"></div>
                                        <span>No pagado</span>
                                    </div>
                                )}
                                {order.status === 'canceled' && (
                                    <div className="flex flex-col items-center">
                                        <XCircle className="text-gray-500" />
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600 my-1"></div>
                                        <span>Cancelado</span>
                                    </div>
                                )}
                                {order.status === 'inProgress' && (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="animate-spin text-blue-500" />
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600 my-1"></div>
                                        <span>En progreso</span>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="border border-gray-300 dark:border-gray-600">
                                <Button variant="outline" size="sm" onClick={() => handleDetails(order)} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    Detalles
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
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
                                            <Input value={selectedOrder.date} readOnly className="bg-gray-100 dark:bg-gray-700" />
                                        </div>
                                        <div>
                                            <Label>Total</Label>
                                            <Input value={`${selectedOrder.total.toFixed(2)}€`} readOnly className="bg-gray-100 dark:bg-gray-700" />
                                        </div>
                                        <div>
                                            <Label>Estado</Label>
                                            <Input value={selectedOrder.status} readOnly className="bg-gray-100 dark:bg-gray-700" />
                                        </div>
                                        <div>
                                            <Label>Método de Pago</Label>
                                            <Input value={selectedOrder.paymentMethod} readOnly className="bg-gray-100 dark:bg-gray-700" />
                                        </div>
                                        <div>
                                            <Label>Mesa</Label>
                                            <Input value={selectedOrder.tableNumber === 0 ? 'Barra' : selectedOrder.tableNumber.toString()} readOnly className="bg-gray-100 dark:bg-gray-700" />
                                        </div>
                                        <div>
                                            <Label>Elementos</Label>
                                            <Table className="border-collapse border border-gray-300 dark:border-gray-600">
                                                <TableHeader>
                                                    <TableRow className="bg-gray-100 dark:bg-gray-700">
                                                        <TableHead className="border border-gray-300 dark:border-gray-600">Producto</TableHead>
                                                        <TableHead className="border border-gray-300 dark:border-gray-600">Cantidad</TableHead>
                                                        <TableHead className="border border-gray-300 dark:border-gray-600">Precio</TableHead>
                                                        <TableHead className="border border-gray-300 dark:border-gray-600">Subtotal</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedOrder.items.map((item, index) => (
                                                        <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                            <TableCell className="border border-gray-300 dark:border-gray-600">{item.name}</TableCell>
                                                            <TableCell className="border border-gray-300 dark:border-gray-600">{item.quantity}</TableCell>
                                                            <TableCell className="border border-gray-300 dark:border-gray-600">{item.price.toFixed(2)}€</TableCell>
                                                            <TableCell className="border border-gray-300 dark:border-gray-600">{(item.price * item.quantity).toFixed(2)}€</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                            <div className="w-1/3 border-l border-gray-300 dark:border-gray-600 pl-4">
                                <Label>Vista previa del ticket</Label>
                                <div className="mt-2 bg-gray-100 dark:bg-gray-700 p-4 h-[calc(80vh-180px)] overflow-y-auto border border-gray-300 dark:border-gray-600 rounded">
                                    <pre className="text-xs whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                                        {renderTicketPreview(selectedOrder)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={handlePrintTicket} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <FileText className="mr-2 h-4 w-4" />
                            Imprimir Ticket
                        </Button>
                        {selectedOrder?.status === 'unpaid' && (
                            <Button onClick={handleConfirmPayment} className="bg-blue-500 hover:bg-blue-600 text-white">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Confirmar Pago
                            </Button>
                        )}
                        {selectedOrder?.status === 'inProgress' && (
                            <Button onClick={handleContinueOrder} className="bg-green-500 hover:bg-green-600 text-white">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Continuar cuenta de la mesa {selectedOrder.tableNumber}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {selectedOrder && (
                <PaymentModal
                    isPaymentModalOpen={isPaymentModalOpen}
                    setIsPaymentModalOpen={setIsPaymentModalOpen}
                    cashAmount={cashAmount}
                    setCashAmount={setCashAmount}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    newOrder={selectedOrder}
                    handleCompleteOrder={handleCompleteOrder}
                    showTicketDialog={showTicketDialog}
                    setShowTicketDialog={setShowTicketDialog}
                    handleTicketPrintingComplete={handleTicketPrintingComplete}
                />
            )}
        </div>
    )
}