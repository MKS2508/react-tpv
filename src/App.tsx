import "./App.css";
import React, { useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { BeerIcon, ClipboardListIcon, HistoryIcon, HomeIcon, PlusCircleIcon, SettingsIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import useStore from '@/store/store'
import Sidebar from "@/components/SideBar.tsx";
import SidebarToggleButton from "@/components/SideBarToggleButton.tsx";
import productsJson from '@/assets/products.json';
import iconOptions from "@/assets/utils/icons/iconOptions.ts";
import Home from "@/components/Sections/Home.tsx";
import OrderHistory from "@/components/Sections/OrderHistory.tsx";
import SectionHeader from "@/components/Sections/SectionHeader.tsx";
import Products from "@/components/Sections/Products.tsx";
import NewOrder from "@/components/Sections/NewOrder.tsx";
import { Toaster } from "@/components/ui/toaster.tsx";
import SettingsPanel from "@/components/Sections/SettingsPanel.tsx";
import Login from "@/components/Sections/Login.tsx";
import { PrinterTypes, CharacterSet, BreakLine, ThermalPrinterServiceOptions} from "@/models/ThermalPrinter.ts";

export default function Component() {
    const {
        users,
        selectedUser,
        selectedOrder,
        thermalPrinterOptions,
        tables,
        categories,
        products,
        orderHistory,
        setUsers,
        setSelectedUser,
        setSelectedOrder,
        setSelectedOrderId,
        setThermalPrinterOptions,
        setTables,
        setCategories,
        setProducts,
        setOrderHistory
    } = useStore()

    const [activeSection, setActiveSection] = React.useState('home')
    const [isDarkMode, setIsDarkMode] = React.useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
    const [prevSection, setPrevSection] = React.useState('home')

    const handleThermalPrinterOptionsChange = (options: ThermalPrinterServiceOptions | null) => {
        setThermalPrinterOptions(options);
    }

    // Initialize state if it's empty
    useEffect(() => {
        if (users.length === 0) {
            setUsers([
                { id: 1, name: 'Germán', profilePicture: '/panxo.svg', pin: "1234" },
                { id: 2, name: 'Marta', profilePicture: '/nuka.svg', pin: "1234" }
            ])
        }

        if (tables.length === 0) {
            setTables([
                {id: 0, name: 'Barra', available: true},
                {id: 1, name: 'Mesa 1', available: true},
                {id: 2, name: 'Mesa 2', available: true},
                {id: 3, name: 'Mesa 3', available: true},
                {id: 4, name: 'Mesa 4', available: true},
                {id: 5, name: 'Mesa 5', available: true},
            ])
        }

        if (categories.length === 0) {
            setCategories([
                {id: 1, name: 'Licores', description: 'Bebidas alcohólicas'},
                {id: 2, name: 'Golosinas', description: 'Dulces y chucherías'},
                {id: 3, name: 'Refrescos', description: 'Bebidas sin alcohol'},
                {id: 4, name: 'Cafés', description: 'Variedades de café'},
                {id: 5, name: 'Cervezas', description: 'Cervezas y similares'},
                {id: 6, name: 'Tapas', description: 'Pequeñas porciones de comida'},
                {id: 7, name: 'Postres', description: 'Dulces para después de la comida'},
            ])
        }

        if (products.length === 0) {
            const productsWithIcons = productsJson.map(product => ({
                ...product,
                icon: React.createElement(iconOptions.find(option => option.value === product.icon)?.icon || BeerIcon)
            }))
            setProducts(productsWithIcons)
        }

        if (!thermalPrinterOptions) {
            setThermalPrinterOptions({
                type: PrinterTypes.EPSON,
                interface: '192.168.1.100',
                characterSet: CharacterSet.PC852_LATIN2,
                removeSpecialCharacters: false,
                lineCharacter: '-',
                breakLine: BreakLine.WORD,
                options: { timeout: 3000 },
            })
        }
    }, [])

    const menuItems = [
        {id: 'home', icon: <HomeIcon/>, label: 'Inicio'},
        {id: 'products', icon: <ClipboardListIcon/>, label: 'Productos'},
        {id: 'newOrder', icon: <PlusCircleIcon/>, label: 'Nueva Comanda'},
        {id: 'orderHistory', icon: <HistoryIcon/>, label: 'Historial'},
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
            <Toaster/>


            {/* Main Content */}
            {!selectedUser ? <AnimatePresence>
                <motion.div
                    key="login"
                    custom={getDirection(activeSection, prevSection)}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={pageTransition}
                    className="absolute inset-0 bg-transparent"
                >
                    <Login users={users} onLogin={setSelectedUser}/>
                </motion.div>
            </AnimatePresence> : <>
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    menuItems={menuItems}
                    loggedUser={selectedUser}
                    onLogout={() => setSelectedUser(null)}
                />

                {/* Sidebar Toggle Button */}
                <SidebarToggleButton
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                />
                <main className="flex-1 m-6 relative overflow-hidden ">
                    <AnimatePresence initial={false} custom={getDirection(activeSection, prevSection)}>
                        <motion.div
                            key={activeSection}
                            custom={getDirection(activeSection, prevSection)}
                            variants={pageVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={pageTransition}
                            className="absolute inset-0 rounded-3xl overflow-hidden"
                        >
                            <Card className="h-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
                                <CardContent className="p-6 h-full overflow-y-hidden">
                                    <SectionHeader menuItems={menuItems} activeSection={activeSection}/>

                                    {/*SECTIONS */}

                                    {/* Home Section */}
                                    {activeSection === 'home' && (
                                        <Home userName={selectedUser?.name}/>
                                    )}
                                    {/* Products Section */}
                                    {activeSection === 'products' && (
                                        <Products products={products} categories={categories}
                                                  isSidebarOpen={isSidebarOpen}/>
                                    )}
                                    {activeSection === 'newOrder' && (
                                        <NewOrder  categories={categories}

                                                />

                                    )}
                                    {activeSection === 'orderHistory' && (
                                        <OrderHistory orderHistory={orderHistory} setOrderHistory={setOrderHistory}
                                                      setSelectedOrderId={setSelectedOrderId}
                                                      setActiveSection={setActiveSection} selectedOrder={selectedOrder}
                                                      setSelectedOrder={setSelectedOrder}/>
                                    )}
                                    {(activeSection === 'settings' && selectedUser) && (
                                        <SettingsPanel users={users} selectedUser={selectedUser}
                                                       handleThermalPrinterOptionsChange={handleThermalPrinterOptionsChange}
                                                       thermalPrinterOptions={thermalPrinterOptions as ThermalPrinterServiceOptions}
                                                       isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}
                                                       isSidebarOpen={isSidebarOpen} setSelectedUser={setSelectedUser}
                                                       setUsers={setUsers}/>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </main>

            </>

            }

        </div>
    )
}