import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import MoonSunSwitch from "@/components/MoonSunSwitch.tsx";
import User from "@/models/User";

type SidebarProps = {
    isSidebarOpen: boolean,
    activeSection: string,
    setActiveSection: (section: string) => void,
    isDarkMode: boolean,
    toggleDarkMode: () => void,
    menuItems: Array<{ id: string; icon: JSX.Element; label: string }>,
    loggedUser: User | null,
    onLogout?: () => void
};

const Sidebar: React.FC<SidebarProps> = ({
                                             loggedUser,
                                             isSidebarOpen,
                                             activeSection,
                                             setActiveSection,
                                             isDarkMode,
                                             toggleDarkMode,
                                             menuItems,
                                             onLogout
                                         }) => {
    const sidebarVariants = {
        open: {
            width: '200px',
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 30,
                duration: 0.2
            }
        },
        closed: {
            width: '80px',
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 30,
                duration: 0.2
            }
        }
    };

    return (
        <motion.div
            initial={false}
            animate={isSidebarOpen ? "open" : "closed"}
            variants={sidebarVariants}
            className="relative h-full"
        >
            <Card className={`h-[calc(100vh-2rem)] my-4 bg-white dark:bg-gray-800 rounded-r-3xl shadow-xl overflow-hidden border-r border-gray-200 dark:border-gray-700 ${isSidebarOpen ? 'w-52' : 'w-20'}`}>
                <CardContent className="p-2 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-center mt-4 mb-6">
                        <img src="/logo.svg" alt="El Haido Logo" className={`${isSidebarOpen ? 'h-24 w-32' : 'h-10 w-10'} transition-all duration-200`}/>
                    </div>

                    {loggedUser && (
                        <div className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} mb-6`}>
                            <Avatar className={isSidebarOpen ? 'h-8 w-8' : 'h-6 w-6'}>
                                <AvatarImage src={loggedUser.profilePicture} alt={loggedUser.name}/>
                                <AvatarFallback>{loggedUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <AnimatePresence>
                                {isSidebarOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{loggedUser.name}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <ScrollArea className="flex-grow">
                        <nav className="space-y-1 sm:space-y-2">
                            {menuItems.map((item) => (
                                <Button
                                    key={item.id}
                                    variant={activeSection === item.id ? "secondary" : "ghost"}
                                    className={`
                                        w-full ${isSidebarOpen ? 'justify-start px-3' : 'justify-center'}
                                        h-12 sm:h-14 transition-all duration-200 ease-in-out
                                        ${activeSection === item.id
                                        ? "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:hover:bg-primary/90 hover:border-gray-100 dark:hover:border-gray-700 dark:hover:text-primary-foreground"
                                        : "bg-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 hover:border-gray-100 dark:hover:border-gray-700"
                                    }
                                    `}
                                    onClick={() => setActiveSection(item.id)}
                                >
                                    <div className="flex items-center">
                                        {React.cloneElement(item.icon, {
                                            className: `${isSidebarOpen ? 'h-5 w-5 mr-3' : 'h-4 w-4'} transition-all duration-200`
                                        })}
                                        <AnimatePresence>
                                            {isSidebarOpen && (
                                                <motion.span
                                                    initial={{opacity: 0, width: 0}}
                                                    animate={{opacity: 1, width: 'auto'}}
                                                    exit={{opacity: 0, width: 0}}
                                                    transition={{duration: 0.2}}
                                                    className="text-sm sm:text-base whitespace-nowrap"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </Button>
                            ))}
                        </nav>
                    </ScrollArea>

                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-center">
                            <MoonSunSwitch isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} size="sm"/>
                        </div>

                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div
                                    initial={{opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 text-xs sm:text-sm"
                                        onClick={onLogout}
                                    >
                                        <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4"/>
                                        Cerrar Sesión
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default Sidebar;