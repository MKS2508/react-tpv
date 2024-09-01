import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCartIcon, XIcon, PlusCircleIcon } from "lucide-react"
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
import { connectToThermalPrinter } from "@/assets/utils/utils"
import { toast } from "@/components/ui/use-toast"
import useStore from "@/store/store.ts"
import { ThermalPrinterServiceOptions } from "@/models/ThermalPrinter.ts"
import ProductGrid from "@/components/Product.tsx"
import OrderTable from "@/components/OrderTable.tsx"
import { ScrollArea } from "@/components/ui/scroll-area.tsx"
import ProductService from "@/services/products.service.ts"

type NewOrderProps = {
    categories: Category[],
}

export default function NewOrder({ categories }: NewOrderProps) {
    const {
        activeOrders,
        recentProducts,
        setRecentProducts,
        selectedOrderId,
        setSelectedOrderId,
        setTables,
        products,
        selectedUser,
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
    const [selectedCategory, setSelectedCategory] = useState<string | null>("Fijados")

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

    useEffect(() => {
        if (selectedUser) {
            const pinnedProductdIds = selectedUser.pinnedProductIds || []
            const productsService = new ProductService()
            productsService.getProductsByIdArray(pinnedProductdIds, products).then(pinnedProducts => {
                setRecentProducts(pinnedProducts)
            })
        }
    }, [selectedUser, products])

    const selectedOrder = activeOrders.find(order => order.id === selectedOrderId)

    const getButtonStyle = (isSelected: boolean) => `
        h-10 sm:h-12 text-xs sm:text-sm font-medium relative
        ${isSelected
        ? "bg-gray-300 text-primary dark:bg-primary dark:text-primary-foreground"
        : "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80"}
        border-2 ${isSelected ? "border-primary dark:border-primary" : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"}
    `

    const getTabStyle = (isSelected: boolean) => `
        px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isSelected
        ? "bg-gray-800 text-primary-foreground dark:bg-primary dark:text-primary-foreground"
        : "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80"}
        border-2 ${isSelected ? "border-primary dark:border-primary" : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"}
    `

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full w-full">
            <div className="flex flex-col h-[calc(100%-40px)] w-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 mb-2">
                    {tables.map((table) => (
                        <Button
                            key={table.id}
                            onClick={() => handleTableChange(table.id)}
                            variant="outline"
                            className={getButtonStyle(selectedOrder?.tableNumber === table.id)}
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
                <Tabs defaultValue="Fijados" id="categories">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4 bg-transparent">
                        {categories.map(category => (
                            <TabsTrigger
                                key={category.name}
                                value={category.name}
                                onClick={() => setSelectedCategory(category.name)}
                                className={getTabStyle(selectedCategory === category.name)}
                            >
                                {category.name}
                            </TabsTrigger>
                        ))}
                        <TabsTrigger
                            value="Fijados"
                            onClick={() => setSelectedCategory("Fijados")}
                            className={getTabStyle(selectedCategory === "Fijados")}
                        >
                            Fijados
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
                    <TabsContent value="Fijados" className="h-[calc(100%-40px)] overflow-y-auto mt-4 sm:mt-12">
                        <ScrollArea className="h-[calc(600px-2rem)] pr-4">
                            <ProductGrid
                                products={recentProducts}
                                handleAddToOrder={(product) => selectedOrderId && handleAddToOrder(selectedOrderId, product)}
                            />
                        </ScrollArea>
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
                                className={`flex items-center ${getTabStyle(selectedOrderId === order.id)} ml-1 mr-1 sm:ml-2 sm:mr-2 mb-2`}
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
                                className={getTabStyle(false)}
                            >
                                <PlusCircleIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"/>
                                Nueva Orden
                            </Button>
                        )}
                    </TabsList>
                    {activeOrders.map(order => (
                        <TabsContent key={order.id} value={order.id.toString()}>
                            <Card
                                className="flex-grow flex flex-col h-[calc(100vh-200px)] sm:h-[calc(100vh-260px)] overflow-y-auto border-2 border-gray-300 dark:border-gray-700">
                                <CardHeader
                                    className="bg-secondary dark:bg-secondary border-2 border-gray-200 dark:border-gray-700">
                                    <CardTitle
                                        className="text-base sm:text-xl font-semibold text-secondary-foreground dark:text-secondary-foreground">Pedido
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
                                    className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center bg-secondary dark:bg-secondary">
                                    <span
                                        className="text-lg sm:text-xl font-bold text-secondary-foreground dark:text-secondary-foreground mb-2 sm:mb-0">Total: {order.total.toFixed(2)}€</span>
                                    <Button
                                        onClick={() => {
                                            setSelectedOrderId(order.id)
                                            setIsPaymentModalOpen(true)
                                        }}
                                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground font-bold py-1 sm:py-2 px-2 sm:px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
                <DialogContent className="bg-background dark:bg-background rounded-lg shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-foreground dark:text-foreground">¿Estás seguro de
                            eliminar esta comanda?</DialogTitle>
                        <DialogDescription className="text-muted-foreground dark:text-muted-foreground">
                            Esta acción eliminará la comanda en progreso para
                            la {orderToClose?.tableNumber === 0 ? 'Barra' : `Mesa ${orderToClose?.tableNumber}`}.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmCloseModalOpen(false)}
                                className="text-foreground dark:text-foreground hover:bg-secondary dark:hover:bg-secondary">
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
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}