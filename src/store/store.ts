import { create } from 'zustand'
import User from "@/models/User.ts";
import Order from "@/models/Order.ts";
import {ThermalPrinterServiceOptions} from "@/models/ThermalPrinter.ts";
import Category from "@/models/Category.ts";
import Product from "@/models/Product.ts";
import ITable from "@/models/Table.ts";
import iconOptions from "@/assets/utils/icons/iconOptions.ts";
import {BeerIcon} from "lucide-react";
import React from "react";

interface AppState {
    // 1. The current available users
    users: User[]
    // 2. The current selected user
    selectedUser: User | null
    // 3. The current selected order
    selectedOrder: Order | null
    // 4. The current selected order id
    selectedOrderId: number | null
    // 5. The current selected thermal printer options
    thermalPrinterOptions: ThermalPrinterServiceOptions | null
    // 6. The current available tables
    tables: ITable[]
    // Additional state properties
    categories: Category[]
    products: Product[]
    orderHistory: Order[]
    paymentMethod: string
    cashAmount: string
    showTicketDialog: boolean
    // Actions
    setUsers: (users: User[]) => void
    setSelectedUser: (user: User | null) => void
    setSelectedOrder: (order: Order | null) => void
    setSelectedOrderId: (orderId: number | null) => void
    setThermalPrinterOptions: (options: ThermalPrinterServiceOptions | null) => void
    setTables: (tables: ITable[]) => void
    setCategories: (categories: Category[]) => void
    setProducts: (products: Product[]) => void
    setOrderHistory: (orderHistory: Order[]) => void
    // Add new state properties
    activeOrders: Order[]
    recentProducts: Product[]
    // Add new actions
    setActiveOrders: (activeOrders: Order[]) => void
    addToOrder: (orderId: number, product: Product) => void
    setRecentProducts: (recentProducts: Product[]) => void
    removeFromOrder: (orderId: number, productId: number) => void
    setPaymentMethod: (method: string) => void
    setCashAmount: (amount: string) => void
    setShowTicketDialog: (show: boolean) => void
    handleTableChange: (tableId: number) => void
    handleCompleteOrder: (order: Order) => void
    closeOrder: (orderId: number) => void
    selectedLanguage: string
    setSelectedLanguage: (language: string) => void
}

const useStore = create<AppState>((set) => ({
    users: [],
    selectedUser: null,
    selectedOrder: null,
    selectedOrderId: null,
    thermalPrinterOptions: null,
    tables: [],
    categories: [],
    products: [],
    orderHistory: [{
        id: 1,
        date: '2023-03-01T00:00:00.000Z',
        total: 100,
        change: 0,
        totalPaid: 0,
        itemCount: 0,
        tableNumber: 0,
        paymentMethod: 'efectivo',
        ticketPath: '',
        status: 'paid',
        items: [{
            id: 1,
            name: 'Café solo ☕️',
            quantity: 1,
            price: 10,
            category: 'Cafés ☕️',
            brand: 'El Haido',
            icon: React.createElement(iconOptions.find(option => option.value === 'CoffeeIcon')?.icon || BeerIcon),
            iconType: 'preset',
            selectedIcon: '',
            uploadedImage: null,
        }]

    }],

    paymentMethod: 'efectivo',
    selectedLanguage: 'es',
    cashAmount: '',
    showTicketDialog: false,
    setUsers: (users) => set({ users }),
    setSelectedUser: (user) => set({ selectedUser: user }),
    setSelectedOrder: (order) => set({ selectedOrder: order }),
    setSelectedOrderId: (orderId) => set({ selectedOrderId: orderId }),
    setThermalPrinterOptions: (options) => set({ thermalPrinterOptions: options }),
    setTables: (tables) => set({ tables }),
    setCategories: (categories) => set({ categories }),
    setProducts: (products) => set({ products }),
    setOrderHistory: (orderHistory) => set({ orderHistory }),
    addToOrder: (orderId, product) => set((state) => {
        const updatedActiveOrders = state.activeOrders.map(order => {
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

        const updatedOrderHistory = state.orderHistory.map(historyOrder => {
            const matchingActiveOrder = updatedActiveOrders.find(activeOrder => activeOrder.id === historyOrder.id)
            return matchingActiveOrder || historyOrder
        })

        const updatedRecentProducts = [
            product,
            ...state.recentProducts.filter(p => p.id !== product.id)
        ].slice(0, 8)

        return {
            activeOrders: updatedActiveOrders,
            orderHistory: updatedOrderHistory,
            recentProducts: updatedRecentProducts
        }
    }),
    setActiveOrders: (activeOrders) => set({ activeOrders }),
    setRecentProducts: (recentProducts) => set({ recentProducts }),
    activeOrders: [],
    recentProducts: [],
    removeFromOrder: (orderId, productId) => set((state) => {
        const updatedActiveOrders = state.activeOrders.map(order => {
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

        const updatedOrderHistory = state.orderHistory.map(historyOrder => {
            const matchingActiveOrder = updatedActiveOrders.find(activeOrder => activeOrder.id === historyOrder.id)
            return matchingActiveOrder || historyOrder
        })

        return {
            activeOrders: updatedActiveOrders,
            orderHistory: updatedOrderHistory
        }
    }),

    setPaymentMethod: (method) => set({ paymentMethod: method }),
    setCashAmount: (amount) => set({ cashAmount: amount }),
    setShowTicketDialog: (show) => set({ showTicketDialog: show }),

    handleTableChange: (tableId) => set((state) => {
        const existingOrder = state.activeOrders.find(order => order.tableNumber === tableId)
        if (existingOrder) {
            return { selectedOrderId: existingOrder.id }
        } else {
            const emptyOrders = state.activeOrders.filter(order => order.items.length === 0)
            if (emptyOrders.length > 0) {
                const updatedOrders = state.activeOrders.map(order =>
                    order.id === emptyOrders[0].id ? {...order, tableNumber: tableId} : order
                )
                return {
                    activeOrders: updatedOrders,
                    selectedOrderId: emptyOrders[0].id
                }
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
                return {
                    activeOrders: [...state.activeOrders, newOrder],
                    orderHistory: [...state.orderHistory, newOrder],
                    selectedOrderId: newOrder.id
                }
            }
        }
    }),
    setSelectedLanguage: (language) => set({ selectedLanguage: language }),

    handleCompleteOrder: (order) => set((state) => {
        const completedOrder: Order = {
            ...order,
            status: 'paid',
            itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
            ticketPath: `/home/mks/WebStormProjects/tpv/tickets/ticket-${order.id}_${new Date().toISOString().split('T')[0]}.pdf`,
        }
        return {
            orderHistory: [...state.orderHistory.filter(o => o.id !== order.id), completedOrder],
            activeOrders: state.activeOrders.filter(o => o.id !== order.id),
            selectedOrderId: null,
            paymentMethod: 'efectivo',
            cashAmount: '',
            showTicketDialog: true
        }
    }),
    closeOrder: (orderId) => set((state) => {
        const updatedActiveOrders = state.activeOrders.filter(o => o.id !== orderId)
        const updatedOrderHistory = state.orderHistory.filter(o => o.id !== orderId)
        let updatedSelectedOrderId = state.selectedOrderId

        if (state.selectedOrderId === orderId) {
            updatedSelectedOrderId = updatedActiveOrders.length > 0 ? updatedActiveOrders[0].id : null
        }

        return {
            activeOrders: updatedActiveOrders,
            orderHistory: updatedOrderHistory,
            selectedOrderId: updatedSelectedOrderId
        }
    }),
}))

export default useStore