import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSignIcon, ShoppingCartIcon, UsersIcon} from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'


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



type HomeProps = {
    uerName: string,
}
const Home = ({uerName}: HomeProps) => {


    // Sample data for statistics and charts
    const stats = {
        totalSales: 15780.50,
        totalOrders: 523,
        averageOrderValue: 30.17,
        activeCustomers: 187
    }

    const salesByCategory = [
        { name: 'Bebidas', value: 5000 },
        { name: 'Comidas', value: 7500 },
        { name: 'Postres', value: 3280.50 },
    ]

    const ordersByLocation = [
        { name: 'Mesas', value: 400 },
        { name: 'Barra', value: 123 },
    ]

    return (
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">¡Hola {uerName}!</h2>
                    <p className="text-lg">Bienvenido de nuevo al TPV de El Haido. Aquí tienes un resumen de las estadísticas totales:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Ventas Totales" value={`${stats.totalSales.toFixed(2)}€`} Icon={DollarSignIcon} />
                        <StatCard title="Pedidos Totales" value={stats.totalOrders} Icon={ShoppingCartIcon} />
                        <StatCard title="Valor Promedio de Pedido" value={`${stats.averageOrderValue.toFixed(2)}€`} Icon={DollarSignIcon} />
                        <StatCard title="Clientes Activos" value={stats.activeCustomers} Icon={UsersIcon} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PieChartCard title="Ventas por Categoría" data={salesByCategory} />
                        <PieChartCard title="Pedidos por Ubicación" data={ordersByLocation} />
                    </div>
                </div>

    )
}

export default Home