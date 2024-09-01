import React, {useState} from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSignIcon, ShoppingCartIcon, AwardIcon} from "lucide-react"
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis, Line
} from 'recharts'
import useStore from "@/store/store.ts";
import Order from "@/models/Order.ts";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {DateRangePicker} from "@/components/ui/DateRangePicker.tsx";


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

type StatCardProps = {
    title: string,
    value: string | number,
    Icon: React.ElementType
}
const StatCard = ({ title, value, Icon }: StatCardProps) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {React.createElement(Icon, { className: "h-4 w-4 text-muted-foreground" })}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);
type LineChartCardProps = {
    title: string,
    data: { date: string, sales: number }[]
}
const LineChartCard = ({ title, data }: LineChartCardProps) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
)

type RecentOrdersTableProps = {
    orders: Order[]
}
const RecentOrdersTable = ({ orders }: RecentOrdersTableProps) => (
    <Card>
        <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Ubicación</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                            <TableCell>{order.total.toFixed(2)}€</TableCell>
                            <TableCell>{order.tableNumber ? `Mesa ${order.tableNumber}` : 'Barra'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
)
const getTop5Products = (orderHistory: Order[]): {name: string, timesOrdered: number}[] => {
    const timesOrdered: {name: string, timesOrdered: number}[] = []
    orderHistory.forEach(order => {
        order.items.forEach(item => {
            const product = item.name
            const quantity = item.quantity
            const existingProduct = timesOrdered.find(p => p.name === product)
            if (existingProduct) {
                existingProduct.timesOrdered += quantity
            } else {
                timesOrdered.push({name: product, timesOrdered: quantity})
            }
        })
    })
    return timesOrdered.sort((a, b) => b.timesOrdered - a.timesOrdered).slice(0, 5)
}

const getSalesTrend = (orderHistory: Order[]): {date: string, sales: number}[] => {
    const salesByDate: {[key: string]: number} = {}
    orderHistory.forEach(order => {
        const date = new Date(order.date).toISOString().split('T')[0]
        if (salesByDate[date]) {
            salesByDate[date] += order.total
        } else {
            salesByDate[date] = order.total
        }
    })
    return Object.entries(salesByDate).map(([date, sales]) => ({date, sales}))
}
type TopProductsCardProps = {
    products: { name: string, timesOrdered: number }[]
}


const TopProductsCard = ({ products }: TopProductsCardProps) => (
    <Card>
        <CardHeader>
            <CardTitle>Top 5 Productos</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-2">
                {products.map((product, index) => (
                    <li key={product.name} className="flex justify-between items-center">
                        <span>{index + 1}. {product.name}</span>
                        <span className="text-sm text-muted-foreground">{product.timesOrdered} pedidos</span>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
)

type PieChartCardProps = {
    title: string,
    data: { name: string, value: number }[]
}
const PieChartCard = ({ title, data }: PieChartCardProps) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >

                        {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
)

const getTotalSales = (orderHistory: Order[]) => {
    let totalSales = 0
    orderHistory.forEach(order => {
        totalSales += order.total
    })
    return totalSales
}

const getTotalOrders = (orderHistory: Order[]) => {
    return orderHistory.filter(order => order.items.length > 0).length
}

const getAverageOrderValue = (orderHistory: Order[]) => {
    let totalSales = 0
    orderHistory.forEach(order => {
        totalSales += order.total
    })
    return totalSales / orderHistory.length
}

const getBestSellerProduct = (orderHistory: Order[]): {name: string, timesOrdered: number} => {
    const timesOrdered: {name: string, timesOrdered: number}[] = []
    orderHistory.forEach(order => {
        order.items.forEach(item => {
            const product = item.name
            const quantity = item.quantity
            const existingProduct = timesOrdered.find(p => p.name === product)
            if (existingProduct) {
                existingProduct.timesOrdered += quantity
            } else {
                timesOrdered.push({name: product, timesOrdered: quantity})
            }
        })
    })

    return timesOrdered.sort((a, b) => b.timesOrdered - a.timesOrdered)[0]
}

const getSalesByCategory = (orderHistory: Order[]) => {
    const salesByCategory: {name: string, value: number}[] = []
    orderHistory.forEach(order => {
        order.items.forEach(item => {
            const product = item.category
            const quantity = 1
            const existingProduct = salesByCategory.find(p => p.name === product)
            if (existingProduct) {
                existingProduct.value += quantity
            } else {
                salesByCategory.push({name: product, value: quantity})
            }
        })
    })
    salesByCategory.sort((a, b) => b.value - a.value)
    return salesByCategory
}

const getOrdersByLocation = (orderHistory: Order[]) => {
    const ordersByLocation: {name: string, value: number}[] = []
    orderHistory.forEach(order => {
        const isTable = order.tableNumber !== 0
        const location = isTable ? `Mesa ${order.tableNumber}` : 'Barra'
        const existingLocation = ordersByLocation.find(p => p.name === location)
        if (existingLocation) {
            existingLocation.value += 1
        } else {
            ordersByLocation.push({name: location, value: 1})
        }
    })
    ordersByLocation.sort((a, b) => b.value - a.value)
    return ordersByLocation
}

type HomeProps = {
    userName: string,
}


const Home = ({userName}: HomeProps) => {
    const { orderHistory } = useStore()
    const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() })

    const filteredOrders = orderHistory.filter(order => {
        const orderDate = new Date(order.date)
        return orderDate >= dateRange.from && orderDate <= dateRange.to
    })

    const stats = {
        totalSales: getTotalSales(filteredOrders),
        totalOrders: getTotalOrders(filteredOrders),
        averageOrderValue: getAverageOrderValue(filteredOrders),
        bestSellerProduct: getBestSellerProduct(filteredOrders) || {name: 'No hay productos en el pedido', timesOrdered: 0}
    }

    const salesByCategory = getSalesByCategory(filteredOrders)
    const ordersByLocation = getOrdersByLocation(filteredOrders)
    const top5Products = getTop5Products(filteredOrders)
    const salesTrend = getSalesTrend(filteredOrders)

    const bestSellerDisplayIcon = (numberOfTimesOrdered: number) => {
        const BestSellerIconComponent = () => (
            <span className="text-green-500 text-sm">
        <span>Pedido {numberOfTimesOrdered} veces</span>
        <AwardIcon className="ml-1 h-4 w-4" />
      </span>
        )
        return BestSellerIconComponent
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden mt-4 pb-16">
            <div className="flex-none p-6 bg-background">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-semibold">¡Hola {userName}!</h2>
                        <p className="text-lg">Bienvenido de nuevo al TPV de El Haido.</p>
                    </div>
                    <DateRangePicker
                        initialDateFrom={dateRange.from}
                        initialDateTo={dateRange.to}
                        onUpdate={({range}) => {
                            const {from, to} = range
                            if (!from || !to) return
                            setDateRange({from, to})
                        }}
                    />
                </div>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Ventas Totales" value={`${stats.totalSales.toFixed(2)}€`} Icon={DollarSignIcon}/>
                    <StatCard title="Pedidos Totales" value={stats.totalOrders} Icon={ShoppingCartIcon}/>
                    <StatCard title="Valor Promedio de Pedido" value={`${stats.averageOrderValue.toFixed(2)}€`}
                              Icon={DollarSignIcon}/>
                    <StatCard title="Best Seller" value={stats.bestSellerProduct.name}
                              Icon={bestSellerDisplayIcon(stats.bestSellerProduct.timesOrdered)}/>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LineChartCard title="Tendencia de Ventas" data={salesTrend}/>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <PieChartCard title="Ventas por Categoría" data={salesByCategory}/>
                        <PieChartCard title="Pedidos por Ubicación" data={ordersByLocation}/>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentOrdersTable orders={filteredOrders}/>
                    <TopProductsCard products={top5Products}/>
                </div>
            </div>
        </div>)
}
export default Home