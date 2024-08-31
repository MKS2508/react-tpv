import  {useState, useCallback, useEffect} from 'react'
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { ShoppingCartIcon, XIcon, PlusCircleIcon} from "lucide-react"
import Category from "@/models/Category"
import Product from "@/models/Product"
import PaymentModal from "@/components/PaymentModal"
import Order from "@/models/Order"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {connectToThermalPrinter} from "@/assets/utils/utils"
import {toast} from "@/components/ui/use-toast"
import useStore from "@/store/store.ts";
import {ThermalPrinterServiceOptions} from "@/models/ThermalPrinter.ts";
import ProductGrid from "@/components/Product.tsx";
import OrderTable from "@/components/OrderTable.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";



type NewOrderProps = {
    categories: Category[],
}

export default function NewOrder({
                                     categories,
                                 }: NewOrderProps) {
    const {
        activeOrders,
        recentProducts,
        selectedOrderId,
        setSelectedOrderId,
        setTables,
        products,

        tables,
        thermalPrinterOptions,
        addToOrder,
        removeFromOrder,
        paymentMethod,
        cashAmount,
        showTicketDialog,
        handleTableChange,
        handleCompleteOrder,
        setPaymentMethod,
        setCashAmount,
        setShowTicketDialog,
        closeOrder
    } = useStore()


    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isConfirmCloseModalOpen, setIsConfirmCloseModalOpen] = useState(false)
    const [orderToClose, setOrderToClose] = useState<Order | null>(null)


    useEffect(() => {
        const updatedTables = tables.map(table => {
            const activeOrder = activeOrders.find(order => order.tableNumber === table.id && order.status === 'inProgress')
            return {
                ...table,
                available: !activeOrder,
                order: activeOrder || null
            }
        })

        if (JSON.stringify(updatedTables) !== JSON.stringify(tables)) {
            setTables(updatedTables)
        }
        if (activeOrders.length > 0 && !selectedOrderId) {
            setSelectedOrderId(activeOrders[0].id)
        }
    }, [activeOrders, selectedOrderId, tables, setTables, setSelectedOrderId])

    const handleAddToOrder = useCallback((orderId: number, product: Product) => {
        addToOrder(orderId, product)
    }, [addToOrder])

    const handleRemoveFromOrder = useCallback((orderId: number, productId: number) => {
        removeFromOrder(orderId, productId)
    }, [removeFromOrder])


    const handleTicketPrintingComplete = async (shouldPrintTicket: boolean) => {
        setShowTicketDialog(false)
        setIsPaymentModalOpen(false)
        if (shouldPrintTicket) {
            try {
                const printer = await connectToThermalPrinter(thermalPrinterOptions as ThermalPrinterServiceOptions);
                if (printer && selectedOrder) {
                    await printer.printOrder(selectedOrder);
                    await printer.disconnect();
                    toast({
                        title: "Ticket impreso",
                        description: "Ticket impreso con éxito.",
                        duration: 3000,
                    });
                } else {
                    console.error("Error al conectar la impresora.");
                    toast({
                        title: "Error al imprimir ticket",
                        description: "No se pudo imprimir el ticket. Por favor, inténtelo de nuevo.",
                        duration: 3000,
                    });
                }
            } catch (error) {
                console.error("Error al imprimir ticket:", error);
                toast({
                    title: "Error al imprimir ticket",
                    description: "No se pudo imprimir el ticket. Por favor, inténtelo de nuevo.",
                    duration: 3000,
                });
            }
        }
    }

    const handleCloseTab = (orderId: number) => {
        const orderToClose = activeOrders.find(order => order.id === orderId)
        if (orderToClose && orderToClose.items.length > 0) {
            setOrderToClose(orderToClose)
            setIsConfirmCloseModalOpen(true)
        } else {
            closeOrder(orderId)
        }
    }


    useEffect(() => {
        if (activeOrders.length === 0) {
            handleTableChange(0)
        }
    }, [activeOrders, handleTableChange])

    const selectedOrder = activeOrders.find(order => order.id === selectedOrderId)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full w-full">
            <div className="flex flex-col  h-[calc(100%-40px)] w-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                    {tables.map((table) => (
                        <Button
                            key={table.id}
                            onClick={() => handleTableChange(table.id)}
                            className={`h-10 sm:h-12 text-xs sm:text-sm font-medium relative ${
                                selectedOrder?.tableNumber === table.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                        >
                            <span className="text-center flex items-center justify-center">{table.name}</span>
                            <span
                                className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${
                                    table.available ? "bg-green-500" : "bg-red-500"
                                }`}
                                aria-hidden="true"
                            />
                        </Button>
                    ))}
                </div>
                <Tabs defaultValue="Cafés" id="categories">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4 bg-transparent">
                        {categories.map(category => (
                            <TabsTrigger
                                key={category.name}
                                value={category.name}
                                className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                {category.name}
                            </TabsTrigger>
                        ))}
                        <TabsTrigger
                            value="Recientes"
                            className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Recientes
                        </TabsTrigger>
                    </TabsList>
                    {categories.map((category) => (
                        <TabsContent key={category.name} value={category.name}
                                     className="h-[calc(90%-40px)] overflow-y-scroll mt-4 sm:mt-12">
                            <ScrollArea className="h-[calc(600px-2rem)] pr-4">
                            <ProductGrid
                                products={products.filter(product => product.category === category.name)}
                                handleAddToOrder={(product) => selectedOrderId && handleAddToOrder(selectedOrderId, product)}
                            />
                                </ScrollArea>
                        </TabsContent>
                    ))}
                    <TabsContent value="Recientes" className="h-[calc(100%-40px)] overflow-y-auto mt-4 sm:mt-12">
                        <ProductGrid
                            products={recentProducts}
                            handleAddToOrder={(product) => selectedOrderId && handleAddToOrder(selectedOrderId, product)}
                        />
                    </TabsContent>
                </Tabs>
            </div>
            <div className="flex flex-col h-[calc(100%-40px)] overflow-y-auto mb-4">
                <Tabs value={selectedOrderId?.toString()} onValueChange={(value) => setSelectedOrderId(Number(value))}>
                    <TabsList className="flex flex-wrap mb-4 sm:mb-16 bg-transparent">
                        {activeOrders.map(order => (
                            <TabsTrigger
                                key={order.id}
                                value={order.id.toString()}
                                className="flex items-center px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ml-1 mr-1 sm:ml-2 sm:mr-2 mb-2"
                            >
                                {order.tableNumber === 0 ? 'Barra' : `Mesa ${order.tableNumber}`}
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleCloseTab(order.id)
                                    }}
                                    className="ml-1 sm:ml-2 p-0 h-4 w-4 sm:h-6 sm:w-6 rounded-full bg-red-500 hover:bg-red-600 focus:ring-red-500"
                                >
                                    <XIcon className="h-3 w-3 sm:h-4 sm:w-4 p-0 m-0 text-white"/>
                                </Button>
                            </TabsTrigger>
                        ))}
                        {activeOrders.length === 0 && (
                            <Button
                                onClick={() => handleTableChange(0)}
                                variant="outline"
                                size="sm"
                                className="px-2 py-1 sm:px-4 sm:py-2 h-8 sm:h-10 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                <PlusCircleIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"/>
                                Nueva Orden
                            </Button>
                        )}
                    </TabsList>
                    {activeOrders.map(order => (
                        <TabsContent key={order.id} value={order.id.toString()}>
                            <Card
                                className="flex-grow flex flex-col h-[calc(100vh-200px)] sm:h-[calc(100vh-260px)] overflow-y-auto">
                                <CardHeader
                                    className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-950">
                                    <CardTitle
                                        className="text-base sm:text-xl font-semibold text-gray-800 dark:text-gray-200">Pedido
                                        Actual para
                                        la {order.tableNumber === 0 ? 'Barra' : `Mesa ${order.tableNumber}`}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow overflow-auto">
                                    <OrderTable
                                        order={order}
                                        handleRemoveFromOrder={handleRemoveFromOrder}
                                        handleAddToOrder={handleAddToOrder}
                                    />
                                </CardContent>
                                <div
                                    className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-gray-900 dark:border-gray-950">
                            <span
                                className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 sm:mb-0">Total: {order.total.toFixed(2)}€</span>
                                    <Button
                                        onClick={() => {
                                            setSelectedOrderId(order.id)
                                            setIsPaymentModalOpen(true)
                                        }}
                                        className="w-full sm:w-auto dark:bg-blue-950 bg-gray-200 hover:bg-gray-800 hover:text-white dark:text-white dark:hover:bg-gray-200 dark:hover:text-black text-black font-bold py-1 sm:py-2 px-2 sm:px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Completar Pedido <ShoppingCartIcon
                                        className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4"/>
                                    </Button>
                                </div>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
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
            <Dialog open={isConfirmCloseModalOpen} onOpenChange={setIsConfirmCloseModalOpen}>
                <DialogContent className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">¿Estás seguro de
                            eliminar esta comanda?</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Esta acción eliminará la comanda en progreso para
                            la {orderToClose?.tableNumber === 0 ? 'Barra' : `Mesa ${orderToClose?.tableNumber}`}.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmCloseModalOpen(false)}
                                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (orderToClose) {
                                    closeOrder(orderToClose.id)
                                }
                                setIsConfirmCloseModalOpen(false)
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}