
import "./App.css";
import React, {useState, useEffect} from 'react'
import {Card, CardContent} from "@/components/ui/card"
import {
    HomeIcon,
    ClipboardListIcon,
    TableIcon,
    PlusCircleIcon,
    UserIcon,
    SettingsIcon,
    HistoryIcon, BeerIcon,
} from 'lucide-react'
import {motion, AnimatePresence} from 'framer-motion'

import Sidebar from "@/components/SideBar.tsx";
import SidebarToggleButton from "@/components/SideBarToggleButton.tsx";
import productsJson from '@/assets/products.json';
import iconOptions from "@/assets/utils/icons/iconOptions.ts";
import Home from "@/components/Sections/Home.tsx";
import OrderHistory from "@/components/Sections/OrderHistory.tsx";
import SectionHeader from "@/components/Sections/SectionHeader.tsx";
import Products from "@/components/Sections/Products.tsx";
import NewOrder from "@/components/Sections/NewOrder.tsx";
import Order from "@/models/Order.ts";
import Product from "@/models/Product.ts";


export default function Component() {
    const [activeSection, setActiveSection] = useState('home')
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [prevSection, setPrevSection] = useState('home')
    const [orderHistory, setOrderHistory] = useState<Order[]>([
        {id: 1, date: '2023-06-01', total: 15.50, itemCount: 3, tableNumber: 2, items: []},
        {id: 2, date: '2023-06-02', total: 22.00, itemCount: 5, tableNumber: 0, items: []},
        {id: 3, date: '2023-06-03', total: 18.50, itemCount: 4, tableNumber: 3, items: []},
    ])

    const productsToProdutsWithIcons = productsJson.map(product => ({
        ...product,
        icon: React.createElement(iconOptions.find(option => option.value === product.icon)?.icon || BeerIcon)
    }))
    const [products, setProducts] = useState<Product[]>(productsToProdutsWithIcons)
    console.log(setProducts)

    const [categories, setCategories] = useState([
        {id: 1, name: 'Licores', description: 'Bebidas alcohólicas'},
        {id: 2, name: 'Golosinas', description: 'Dulces y chucherías'},
        {id: 3, name: 'Refrescos', description: 'Bebidas sin alcohol'},
        {id: 4, name: 'Cafés', description: 'Variedades de café'},
        {id: 5, name: 'Cervezas', description: 'Cervezas y similares'},
        {id: 6, name: 'Tapas', description: 'Pequeñas porciones de comida'},
        {id: 7, name: 'Postres', description: 'Dulces para después de la comida'},
    ])
    console.log(setCategories)

    const menuItems = [
        {id: 'home', icon: <HomeIcon/>, label: 'Inicio'},
        {id: 'products', icon: <ClipboardListIcon/>, label: 'Productos'},
        {id: 'tables', icon: <TableIcon/>, label: 'Mesas'},
        {id: 'newOrder', icon: <PlusCircleIcon/>, label: 'Nueva Cuenta'},
        {id: 'orderHistory', icon: <HistoryIcon/>, label: 'Historial'},
        {id: 'users', icon: <UserIcon/>, label: 'Usuarios'},
        {id: 'settings', icon: <SettingsIcon/>, label: 'Ajustes'},
    ]

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
        if (isDarkMode) {
            document.documentElement.classList.remove('dark')
        } else {
            document.documentElement.classList.add('dark')
        }
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

    useEffect(() => {
        setPrevSection(activeSection)
    }, [activeSection])
    const pageVariants = {
        enter: (direction: number) => ({
            y: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            y: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            y: direction < 0 ? '100%' : '-100%',
            opacity: 0,
        }),
    }

    const pageTransition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.5,
    }

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDarkMode])

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const getDirection = (current, previous) => {
        const menuOrder = ['home', 'products', 'tables', 'newOrder', 'orderHistory', 'users', 'settings']
        const currentIndex = menuOrder.indexOf(current)
        const previousIndex = menuOrder.indexOf(previous)
        return currentIndex > previousIndex ? 1 : -1
    }




    return (
        <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Sidebar */}

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                menuItems={menuItems}
            />

            {/* Sidebar Toggle Button */}
            <SidebarToggleButton
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            {/* Main Content */}
            <main className="flex-1 p-6 relative overflow-hidden h-full w-full">
                <AnimatePresence initial={false} custom={getDirection(activeSection, prevSection)}>
                    <motion.div
                        key={activeSection}
                        custom={getDirection(activeSection, prevSection)}
                        variants={pageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={pageTransition}
                        className="absolute inset-0"
                    >
                        <Card className="h-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
                            <CardContent className="p-6 h-full overflow-y-auto">
                                <SectionHeader menuItems={menuItems} activeSection={activeSection}/>

                                {/*SECTIONS */}

                                {/* Home Section */}
                                {activeSection === 'home' && (
                                    <Home uerName={"Germán"}/>
                                )}
                                {/* Products Section */}
                                {activeSection === 'products' && (
                                    <Products products={products} categories={categories} isSidebarOpen={isSidebarOpen}/>
                                )}
                                {activeSection === 'newOrder' && (
                                    <NewOrder products={products} categories={categories} orderHistory={orderHistory} setOrderHistory={setOrderHistory}/>
                                )}
                                {activeSection === 'orderHistory' && (
                                    <OrderHistory orderHistory={orderHistory}/>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </main>


        </div>
    )
}