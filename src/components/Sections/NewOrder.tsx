import {useCallback, useState} from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MinusIcon, PlusIcon } from "lucide-react"
import Category from "@/models/Category.ts";
import Product from "@/models/Product.ts";
import PaymentModal from "@/components/PaymentModal.tsx";
import Order from "@/models/Order.ts";

// Define types
type Table = {
    id: number
    name: string
    available: boolean
}




type TableSelectorProps = {
    tables: Table[]
    newOrder: Order
    handleTableChange: (tableNumber: number) => void
}




// Sub-components
const TableSelector = ({ tables, newOrder, handleTableChange }: TableSelectorProps) => (
    <div className="mb-4">
        <Label htmlFor="tableNumber">Mesa</Label>
        <Select
            value={newOrder.tableNumber.toString()}
            onValueChange={(value) => handleTableChange(parseInt(value))}
        >
            <SelectTrigger className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="Selecciona una mesa"/>
            </SelectTrigger>
            <SelectContent>
                {tables.filter(table => table.available || table.id === newOrder.tableNumber).map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>{table.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
)

type ProductButtonProps = {
    product: Product
    handleAddToOrder: (product: Product) => void
}
const ProductButton = ({ product, handleAddToOrder }: ProductButtonProps) => (
    <Button
        key={product.id}
        onClick={() => handleAddToOrder(product)}
        className="flex flex-col items-center justify-between p-2 h-24 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
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
const ProductGrid = ({ products, handleAddToOrder }: ProductGridProps) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {products.map((product) => (
            <ProductButton key={product.id} product={product} handleAddToOrder={handleAddToOrder} />
        ))}
    </div>
)
type OrderTableProps = {
    newOrder: Order
    handleRemoveFromOrder: (productId: number) => void
    handleAddToOrder: (product: Product) => void
}
const OrderTable = ({ newOrder, handleRemoveFromOrder, handleAddToOrder }: OrderTableProps) => (

    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Acciones</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {newOrder.items.map((item) => (
                <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{(item.price * item.quantity).toFixed(2)}€</TableCell>
                    <TableCell>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 mr-2" onClick={() => handleRemoveFromOrder(item.id)}>
                            <MinusIcon className="h-4 w-4"/>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleAddToOrder(item)}>
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
    setOrderHistory: (history: Order[]) => void
}
// Main component
const NewOrder = ({  products, categories, orderHistory, setOrderHistory }: NewOrderProps) => {
    const [newOrder, setNewOrder] = useState<Order>({
        tableNumber: 0,
        status: 'unpaid',
        ticketPath: '',
        paymentMethod: 'efectivo',
        items: [],
        total: 0,
        id: orderHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        itemCount: 0,
        totalPaid: 0,
        change: 0,
    })


    const [paymentMethod, setPaymentMethod] = useState('efectivo')
    const [cashAmount, setCashAmount] = useState('')
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [tables, setTables] = useState([
        {id: 0, name: 'Barra', available: true},
        {id: 1, name: 'Mesa 1', available: true},
        {id: 2, name: 'Mesa 2', available: true},
        {id: 3, name: 'Mesa 3', available: true},
        {id: 4, name: 'Mesa 4', available: true},
        {id: 5, name: 'Mesa 5', available: true},
    ])
    const [recentProducts, setRecentProducts] = useState<Product[]>([])

    const handleAddToOrder = useCallback((product: Product) => {


        setNewOrder(prevOrder => {
            const existingItem = prevOrder.items.find(item => item.id === product.id)
            if (existingItem) {
                return {
                    ...prevOrder,
                    items: prevOrder.items.map(item =>
                        item.id === product.id ? {...item, quantity: item.quantity + 1} : item
                    ),
                    total: prevOrder.total + product.price
                }
            } else {
                return {
                    ...prevOrder,
                    items: [...prevOrder.items, {...product, quantity: 1}],
                    total: prevOrder.total + product.price
                }
            }
        })

        // Update recent products
        setRecentProducts((prevRecent: Product[]) => {
            const newRecent = [product, ...prevRecent.filter(p => p.id !== product.id)].slice(0, 8)
            return newRecent
        })
    }, [])

    const handleRemoveFromOrder = useCallback((productId: number) => {
        setNewOrder(prevOrder => {
            const existingItem = prevOrder.items.find(item => item.id === productId)
            if (existingItem && existingItem.quantity > 1) {
                return {
                    ...prevOrder,
                    items: prevOrder.items.map(item =>
                        item.id === productId ? {...item, quantity: item.quantity - 1} : item
                    ),
                    total: prevOrder.total - (existingItem ? existingItem.price : 0)
                }
            } else {
                return {
                    ...prevOrder,
                    items: prevOrder.items.filter(item => item.id !== productId),
                    total: prevOrder.total - (existingItem ? existingItem.price : 0)
                }
            }
        })
    }, [])



    useCallback((value: string) => {
        setCashAmount(prevAmount => {
            if (value === 'C') return ''
            if (value === '.' && prevAmount.includes('.')) return prevAmount
            if (value === '.' && prevAmount === '') return '0.'
            const newAmount = prevAmount + value
            return newAmount
        })
    }, []);
    useCallback(() => {
        const change = parseFloat(cashAmount) - newOrder.total
        return change > 0 ? change.toFixed(2) : '0.00'
    }, [cashAmount, newOrder.total]);
    const handleTableChange = (tableId: number) => {
        setNewOrder(prevOrder => ({...prevOrder, tableNumber: tableId}))
        setTables(prevTables =>
            prevTables.map(table =>
                table.id === tableId ? {...table, available: false} : table
            )
        )
    }
    const handleCompleteOrder = (newOrder: Order) => {
        debugger
        const newOrderHistory: Order = {
            id: orderHistory.length + 1,
            date: new Date().toISOString().split('T')[0],
            total: newOrder.total,
            itemCount: newOrder.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
            tableNumber: newOrder.tableNumber,
            items: newOrder.items, // Include the items here to match the Order type
            status: newOrder.status,
            paymentMethod: newOrder.paymentMethod,
            totalPaid: newOrder.totalPaid,
            change: newOrder.change,
            ticketPath: `/home/mks/WebStormProjects/tpv/tickets/ticket-${newOrder.id}_${new Date().toISOString().split('T')[0]}.pdf`,
        }
        setOrderHistory([...orderHistory, newOrderHistory])
        setNewOrder({
            items: [],
            tableNumber: 0,
            total: 0,
            id: orderHistory.length + 2, // Make sure the id is unique for the new order
            date: new Date().toISOString().split('T')[0],
            itemCount: 0,
            status: 'unpaid',
            ticketPath: '',
            paymentMethod: 'efectivo',
            totalPaid: 0,
            change: 0,
        })
        setPaymentMethod('efectivo')
        setCashAmount('')
        setIsPaymentModalOpen(false)

        // Update table availability
        setTables(prevTables =>
            prevTables.map(table =>
                table.id === newOrder.tableNumber ? {...table, available: true} : table
            )
        )
    }


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full w-full">
            <div className="flex flex-col h-full w-full">
                <TableSelector tables={tables} newOrder={newOrder} handleTableChange={handleTableChange} />
                <Tabs defaultValue="Licores" className="flex-grow">
                    <TabsList className="grid grid-cols-4 gap-2 mb-4">
                        {categories.map(category => (
                            <TabsTrigger key={category.name} value={category.name}>{category.name}</TabsTrigger>
                        ))}
                        <TabsTrigger value="Recientes">Recientes</TabsTrigger>
                    </TabsList>
                    {categories.map((category) => (
                        <TabsContent key={category.name} value={category.name} className="h-[calc(100%-40px)] overflow-y-auto mt-12">
                            <ProductGrid
                                products={products.filter(product => product.category === category.name)}
                                handleAddToOrder={handleAddToOrder}
                            />
                        </TabsContent>
                    ))}
                    <TabsContent value="Recientes" className="h-[calc(100%-40px)] overflow-y-auto mt-12">
                        <ProductGrid products={recentProducts} handleAddToOrder={handleAddToOrder} />
                    </TabsContent>
                </Tabs>
            </div>
            <div className="flex flex-col h-[calc(100%-40px)] overflow-y-hidden">
                <Card className="flex-grow flex flex-col h-[calc(100%-40px)] overflow-y-auto">
                    <CardHeader>
                        <CardTitle>Pedido Actual para la mesa {newOrder.tableNumber === 0 ? 'Barra' : newOrder.tableNumber}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-auto">
                        <OrderTable
                            newOrder={newOrder}
                            handleRemoveFromOrder={handleRemoveFromOrder}
                            handleAddToOrder={handleAddToOrder}
                        />
                    </CardContent>
                    <div className="p-4 border-t flex justify-between items-center">
                        <span className="text-xl font-bold">Total: {newOrder.total.toFixed(2)}€</span>
                        <Button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            Completar Pedido
                        </Button>
                    </div>
                </Card>
            </div>
            <PaymentModal isPaymentModalOpen={isPaymentModalOpen} setIsPaymentModalOpen={setIsPaymentModalOpen}
                          cashAmount={cashAmount} setCashAmount={setCashAmount} paymentMethod={paymentMethod}
                          setPaymentMethod={setPaymentMethod} newOrder={newOrder}
                          handleCompleteOrder={handleCompleteOrder}/>
        </div>
    )
}
export default NewOrder