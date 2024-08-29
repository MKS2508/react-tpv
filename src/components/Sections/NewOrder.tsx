import React, {useState, useCallback, useEffect} from 'react'
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {MinusIcon, PlusIcon, ShoppingCartIcon, XIcon, PlusCircleIcon} from "lucide-react"
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


type ProductButtonProps = {
    product: Product
    handleAddToOrder: (product: Product) => void
}

const ProductButton: React.FC<ProductButtonProps> = ({product, handleAddToOrder}) => (
    <Button
        key={product.id}
        onClick={() => handleAddToOrder(product)}
        className="flex flex-col items-center justify-between p-2 h-24 text-left bg-white dark:bg-gray-800 border border-gray-400 bg-gray-200 dark:bg-gray-900 dark:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-sm transition-colors duration-200"
        variant="outline"
    >
        <div className="flex items-center justify-center w-full h-12">
            {product.icon}
        </div>
        <div className="w-full text-center">
            <p className="text-xs font-semibold truncate text-gray-800 dark:text-gray-200">{product.name}</p>
            <p className="text-xl font-semibold text-gray-600 dark:text-gray-100">{product.price.toFixed(2)}€</p>
        </div>
    </Button>
)

type ProductGridProps = {
    products: Product[]
    handleAddToOrder: (product: Product) => void
}

const ProductGrid: React.FC<ProductGridProps> = ({products, handleAddToOrder}) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-12">
        {products.map((product) => (
            <ProductButton key={product.id} product={product} handleAddToOrder={handleAddToOrder}/>
        ))}
    </div>
)

type OrderTableProps = {
    order: Order
    handleRemoveFromOrder: (orderId: number, productId: number) => void
    handleAddToOrder: (orderId: number, product: Product) => void
}

const OrderTable: React.FC<OrderTableProps> = ({order, handleRemoveFromOrder, handleAddToOrder}) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="text-gray-700 dark:text-gray-300">Producto</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Cantidad</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Precio</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Acciones</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {order.items.map((item) => (
                <TableRow key={item.id}>
                    <TableCell className="text-gray-800 dark:text-gray-200">{item.name}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">{item.quantity}</TableCell>
                    <TableCell
                        className="text-gray-800 dark:text-gray-200">{(item.price * item.quantity).toFixed(2)}€</TableCell>
                    <TableCell>
                        <Button variant="outline" size="sm"
                                className="h-10 w-10 p-0 mr-2 text-red-500 hover:text-red-700 bg-gray-100  dark:text-red-400 dark:bg-blue-950 dark:hover:text-red-300"
                                onClick={() => handleRemoveFromOrder(order.id, item.id)}>
                            <MinusIcon className="h-8 w-8"/>
                        </Button>
                        <Button variant="outline" size="sm"
                                className="h-10 w-10 p-0 text-green-500 hover:text-green-700 bg-gray-100 dark:text-green-400 dark:bg-blue-950 dark:hover:text-green-300"
                                onClick={() => handleAddToOrder(order.id, item)}>
                            <PlusIcon className="h-8 w-8"/>
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
)

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full w-full">
            <div className="flex flex-col h-full w-full">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                    {tables.map(table => (
                        <Button
                            key={table.id}
                            onClick={() => handleTableChange(table.id)}
                            className={`h-16 text-lg font-semibold relative ${
                                selectedOrder?.tableNumber === table.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground dark:bg-gray-900 dark:text-gray-100'
                            }`}>

                            <span className="text-center flex items-center justify-center">
                                {table.name}
                            </span>
                            <span
                                className={`absolute top-1 right-1 w-3 h-3 rounded-full ${table.available ? 'bg-green-500' : 'bg-red-500'}`}
                                aria-hidden="true"/>
                        </Button>
                    ))}
                </div>
                <Tabs defaultValue="Licores" className="flex-grow">
                    <TabsList className="grid grid-cols-4 gap-2 mb-4 bg-transparent">
                        {categories.map(category => (
                            <TabsTrigger
                                key={category.name}
                                value={category.name}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                {category.name}
                            </TabsTrigger>
                        ))}
                        <TabsTrigger
                            value="Recientes"
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Recientes
                        </TabsTrigger>
                    </TabsList>
                    {categories.map((category) => (
                        <TabsContent key={category.name} value={category.name}
                                     className="h-[calc(100%-40px)] overflow-y-auto mt-12">
                            <ProductGrid
                                products={products.filter(product => product.category === category.name)}
                                handleAddToOrder={(product) => selectedOrderId && handleAddToOrder(selectedOrderId, product)}
                            />
                        </TabsContent>
                    ))}
                    <TabsContent value="Recientes" className="h-[calc(100%-40px)] overflow-y-auto mt-12">
                        <ProductGrid
                            products={recentProducts}
                            handleAddToOrder={(product) => selectedOrderId && handleAddToOrder(selectedOrderId, product)}
                        />
                    </TabsContent>
                </Tabs>
            </div>
            <div className="flex flex-col h-[calc(100%-40px)] overflow-y-hidden mb-4">
                <Tabs value={selectedOrderId?.toString()} onValueChange={(value) => setSelectedOrderId(Number(value))}>
                    <TabsList className="flex-wrap mb-16 bg-transparent">
                        {activeOrders.map(order => (
                            <TabsTrigger
                                key={order.id}
                                value={order.id.toString()}
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary  ml-2 mr-2 mb-2"
                            >
                                {order.tableNumber === 0 ? 'Barra' : `Mesa ${order.tableNumber}`}
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleCloseTab(order.id)
                                    }}
                                    className="ml-2 p-0 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 focus:ring-red-500"
                                >
                                    <XIcon className="h-4 w-4 p-0 m-0 text-white"/>
                                </Button>
                            </TabsTrigger>
                        ))}
                        {activeOrders.length === 0 && (
                            <Button
                                onClick={() => handleTableChange(0)}
                                variant="outline"
                                size="sm"
                                className="px-4 py-2 h-10 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                <PlusCircleIcon className="mr-2 h-4 w-4"/>
                                Nueva Orden
                            </Button>
                        )}
                    </TabsList>
                    {activeOrders.map(order => (
                        <TabsContent key={order.id} value={order.id.toString()}>
                            <Card className="flex-grow flex flex-col h-[calc(100vh-260px)] overflow-y-auto">
                                <CardHeader
                                    className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-950">
                                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">Pedido
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
                                    className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 dark:border-gray-950">
                                    <span
                                        className="text-xl font-bold text-gray-800 dark:text-gray-200">Total: {order.total.toFixed(2)}€</span>
                                    <Button
                                        onClick={() => {
                                            setSelectedOrderId(order.id)
                                            setIsPaymentModalOpen(true)
                                        }}
                                        className="dark:bg-blue-950 bg-gray-200 hover:bg-gray-800 hover:text-white dark:text-white dark:hover:bg-gray-200  dark:hover:text-black text-black font-bold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Completar Pedido <ShoppingCartIcon className="ml-2 h-4 w-4"/>
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