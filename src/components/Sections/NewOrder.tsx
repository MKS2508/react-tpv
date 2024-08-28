import React, { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MinusIcon, PlusIcon, XIcon } from "lucide-react"
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
} from "@/components/ui/dialog.tsx";

type Table = {
    id: number
    name: string
    available: boolean
}

type TableSelectorProps = {
    tables: Table[]
    activeOrders: Order[]
    handleTableChange: (tableNumber: number) => void
    selectedTableId: number | null
}


type ProductButtonProps = {
    product: Product
    handleAddToOrder: (product: Product) => void
}

const TableSelector: React.FC<TableSelectorProps> = ({ tables, activeOrders, handleTableChange, selectedTableId }) => (
    <div className="mb-4">
        <Label htmlFor="tableNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Mesa</Label>
        <Select value={selectedTableId?.toString()} onValueChange={(value) => handleTableChange(parseInt(value))}>
            <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                <SelectValue placeholder="Selecciona una mesa"/>
            </SelectTrigger>
            <SelectContent>
                {tables.filter(table => table.available || activeOrders.some(order => order.tableNumber === table.id)).map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>{table.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
)

const ProductButton: React.FC<ProductButtonProps> = ({ product, handleAddToOrder }) => (
    <Button
        key={product.id}
        onClick={() => handleAddToOrder(product)}
        className="flex flex-col items-center justify-between p-2 h-24 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-sm transition-colors duration-200"
        variant="outline"
    >
        <div className="flex items-center justify-center w-full h-12">
            {product.icon}
        </div>
        <div className="w-full text-center">
            <p className="text-xs font-semibold truncate text-gray-800 dark:text-gray-200">{product.name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{product.price.toFixed(2)}€</p>
        </div>
    </Button>
)
type ProductGridProps = {
    products: Product[]
    handleAddToOrder: (product: Product) => void
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, handleAddToOrder }) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-12">
        {products.map((product) => (
            <ProductButton key={product.id} product={product} handleAddToOrder={handleAddToOrder} />
        ))}
    </div>
)

type OrderTableProps = {
    order: Order
    handleRemoveFromOrder: (orderId: number, productId: number) => void
    handleAddToOrder: (orderId: number, product: Product) => void
}

const OrderTable: React.FC<OrderTableProps> = ({ order, handleRemoveFromOrder, handleAddToOrder }) => (
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
                    <TableCell className="text-gray-800 dark:text-gray-200">{(item.price * item.quantity).toFixed(2)}€</TableCell>
                    <TableCell>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 mr-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" onClick={() => handleRemoveFromOrder(order.id, item.id)}>
                            <MinusIcon className="h-4 w-4"/>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300" onClick={() => handleAddToOrder(order.id, item)}>
                            <PlusIcon className="h-4 w-4"/>
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
)
type NewOrderProps = {
    products: Product[]
    categories: Category[]
    orderHistory: Order[]
    setOrderHistory: React.Dispatch<React.SetStateAction<Order[]>>
    selectedOrderId: number | null
    setSelectedOrderId: React.Dispatch<React.SetStateAction<number | null>>
}

export default function Component({ products, categories, orderHistory, setOrderHistory, selectedOrderId, setSelectedOrderId }: NewOrderProps) {
    const [activeOrders, setActiveOrders] = useState<Order[]>(orderHistory.filter(order => order.status === 'inProgress'))
    const [paymentMethod, setPaymentMethod] = useState('efectivo')
    const [cashAmount, setCashAmount] = useState('')
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isConfirmCloseModalOpen, setIsConfirmCloseModalOpen] = useState(false)
    const [orderToClose, setOrderToClose] = useState<Order | null>(null)
    const [tables, setTables] = useState<Table[]>([
        {id: 0, name: 'Barra', available: true},
        {id: 1, name: 'Mesa 1', available: true},
        {id: 2, name: 'Mesa 2', available: true},
        {id: 3, name: 'Mesa 3', available: true},
        {id: 4, name: 'Mesa 4', available: true},
        {id: 5, name: 'Mesa 5', available: true},
    ])
    const [recentProducts, setRecentProducts] = useState<Product[]>([])

    useEffect(() => {
        setTables(prevTables =>
            prevTables.map(table => ({
                ...table,
                available: !activeOrders.some(order => order.tableNumber === table.id)
            }))
        )

        if (activeOrders.length > 0 && !selectedOrderId) {
            setSelectedOrderId(activeOrders[0].id)
        }
    }, [activeOrders, selectedOrderId])

    const handleAddToOrder = useCallback((orderId: number, product: Product) => {
        setActiveOrders(prevOrders => {
            const updatedOrders = prevOrders.map(order => {
                if (order.id === orderId) {
                    const existingItem = order.items.find(item => item.id === product.id)
                    if (existingItem) {
                        return {
                            ...order,
                            items: order.items.map(item =>
                                item.id === product.id ? {...item, quantity: item.quantity + 1} : item
                            ),
                            itemCount: order.itemCount + 1,

                            total: order.total + product.price
                        }
                    } else {
                        return {
                            ...order,
                            items: [...order.items, {...product, quantity: 1}],
                            itemCount: order.itemCount + 1,
                            total: order.total + product.price
                        }
                    }
                }
                return order
            })

            // Update order history for persistence
            setOrderHistory(prevHistory => {
                const updatedHistory = prevHistory.map(historyOrder => {
                    const matchingActiveOrder = updatedOrders.find(activeOrder => activeOrder.id === historyOrder.id)
                    return matchingActiveOrder || historyOrder
                })
                return updatedHistory
            })

            return updatedOrders
        })

        setRecentProducts((prevRecent: Product[]) => {
            const newRecent = [product, ...prevRecent.filter(p => p.id !== product.id)].slice(0, 8)
            return newRecent
        })
    }, [setOrderHistory])

    const handleRemoveFromOrder = useCallback((orderId: number, productId: number) => {
        setActiveOrders(prevOrders => {
            const updatedOrders = prevOrders.map(order => {
                if (order.id === orderId) {
                    const existingItem = order.items.find(item => item.id === productId)
                    if (existingItem && existingItem.quantity > 1) {
                        return {
                            ...order,
                            items: order.items.map(item =>
                                item.id === productId ? {...item, quantity: item.quantity - 1} : item
                            ),
                            itemCount: order.itemCount - 1,
                            total: order.total - existingItem.price
                        }
                    } else {
                        return {
                            ...order,
                            itemCount: order.itemCount - 1,
                            items: order.items.filter(item => item.id !== productId),
                            total: order.total - (existingItem ? existingItem.price : 0)
                        }
                    }
                }
                return order
            })

            // Update order history for persistence
            setOrderHistory(prevHistory => {
                const updatedHistory = prevHistory.map(historyOrder => {
                    const matchingActiveOrder = updatedOrders.find(activeOrder => activeOrder.id === historyOrder.id)
                    return matchingActiveOrder || historyOrder
                })
                return updatedHistory
            })

            return updatedOrders
        })
    }, [setOrderHistory])

    const handleTableChange = (tableId: number) => {
        const existingOrder = activeOrders.find(order => order.tableNumber === tableId)
        if (existingOrder) {
            setSelectedOrderId(existingOrder.id)
        } else {
            const newOrder: Order = {
                id: Date.now(),
                tableNumber: tableId,
                status: 'inProgress',
                ticketPath: '',
                paymentMethod: 'efectivo',
                items: [],
                total: 0,
                date: new Date().toISOString().split('T')[0],
                itemCount: 0,
                totalPaid: 0,
                change: 0,
            }
            setActiveOrders(prevOrders => [...prevOrders, newOrder])
            setSelectedOrderId(newOrder.id)
            // Add new order to history
            setOrderHistory(prevHistory => [...prevHistory, newOrder])
        }
    }

    const handleCompleteOrder = (order: Order) => {
        const completedOrder: Order = {
            ...order,
            status: 'paid',
            itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
            ticketPath: `/home/mks/WebStormProjects/tpv/tickets/ticket-${order.id}_${new Date().toISOString().split('T')[0]}.pdf`,
        }
        setOrderHistory(prevHistory => [...prevHistory.filter(o => o.id !== order.id), completedOrder])
        setActiveOrders(prevOrders => prevOrders.filter(o => o.id !== order.id))
        setSelectedOrderId(null)
        setPaymentMethod('efectivo')
        setCashAmount('')
        setIsPaymentModalOpen(false)
    }

    const handleNewTab = () => {
        const availableTable = tables.find(table => table.available)
        if (availableTable) {
            if (activeOrders.length >= 2) {
                const emptyOrders = activeOrders.filter(order => order.items.length === 0)
                if (emptyOrders.length > 0) {
                    // Remove the first empty order
                    closeOrder(emptyOrders[0].id)
                }
            }
            handleTableChange(availableTable.id)
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

    const closeOrder = (orderId: number) => {
        setActiveOrders(prevOrders => prevOrders.filter(o => o.id !== orderId))
        setOrderHistory(prevHistory => prevHistory.filter(o => o.id !== orderId))
        if (selectedOrderId === orderId) {
            setSelectedOrderId(activeOrders.length > 1 ? activeOrders[0].id : null)
        }
    }

    useEffect(() => {
        if (activeOrders.length === 0) {
            handleNewTab()
        }
    }, [activeOrders])

    const selectedOrder = activeOrders.find(order => order.id === selectedOrderId)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full w-full">
            <div className="flex flex-col h-full w-full">
                <TableSelector
                    tables={tables}
                    activeOrders={activeOrders}
                    handleTableChange={handleTableChange}
                    selectedTableId={selectedOrder?.tableNumber ?? null}
                />
                <Tabs defaultValue="Licores" className="flex-grow">
                    <TabsList className="grid grid-cols-4 gap-2 mb-4 bg-transparent">
                        {categories.map(category => (
                            <TabsTrigger
                                key={category.name}
                                value={category.name}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                {category.name}
                            </TabsTrigger>
                        ))}
                        <TabsTrigger
                            value="Recientes"
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Recientes
                        </TabsTrigger>
                    </TabsList>
                    {categories.map((category) => (
                        <TabsContent key={category.name} value={category.name} className="h-[calc(100%-40px)] overflow-y-auto mt-12">
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
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-2 mb-2"
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
                                    <XIcon className="h-4 w-4 p-0 m-0 text-white" />
                                </Button>
                            </TabsTrigger>
                        ))}
                        <Button
                            onClick={handleNewTab}
                            variant="outline"
                            size="sm"
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Nueva Orden
                        </Button>
                    </TabsList>
                    {activeOrders.map(order => (
                        <TabsContent key={order.id} value={order.id.toString()}>
                            <Card className="flex-grow flex flex-col h-[calc(100vh-260px)] overflow-y-auto">
                                <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">Pedido Actual para la {order.tableNumber === 0 ? 'Barra' : `Mesa ${order.tableNumber}`}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow overflow-auto">
                                    <OrderTable
                                        order={order}
                                        handleRemoveFromOrder={handleRemoveFromOrder}
                                        handleAddToOrder={handleAddToOrder}
                                    />
                                </CardContent>
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                                    <span className="text-xl font-bold text-gray-800 dark:text-gray-200">Total: {order.total.toFixed(2)}€</span>
                                    <Button
                                        onClick={() => {
                                            setSelectedOrderId(order.id)
                                            setIsPaymentModalOpen(true)
                                        }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Completar Pedido
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
                />
            )}
            <Dialog open={isConfirmCloseModalOpen} onOpenChange={setIsConfirmCloseModalOpen}>
                <DialogContent className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">¿Estás seguro de eliminar esta comanda?</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Esta acción eliminará la comanda en progreso para la {orderToClose?.tableNumber === 0 ? 'Barra' : `Mesa ${orderToClose?.tableNumber}`}.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmCloseModalOpen(false)} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
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