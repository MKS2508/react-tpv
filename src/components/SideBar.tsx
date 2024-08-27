import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import {Switch} from "@/components/ui/switch.tsx";
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

type SidebarProps = {
    isSidebarOpen: boolean;
    activeSection: string;
    setActiveSection: (section: string) => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    menuItems: Array<{ id: string; icon: JSX.Element; label: string }>;
};
const Sidebar = ({ isSidebarOpen, activeSection, setActiveSection, isDarkMode, toggleDarkMode, menuItems }: SidebarProps) => {
    return (
        <motion.div
            initial={false}
            animate={{ width: isSidebarOpen ? 'auto' : '0px' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative"
        >
            <Card className="h-full bg-white dark:bg-gray-800 rounded-r-3xl shadow-xl overflow-hidden">
                <CardContent className="p-6 w-64">
                    <div className="flex items-center justify-center mb-6">
                        <img src="/placeholder.svg?height=50&width=50" alt="El Haido Logo" className="h-12 w-12" />
                        <h2 className="text-2xl font-bold ml-2">El Haido TPV</h2>
                    </div>
                    <ScrollArea className="h-[calc(100vh-180px)]">
                        <nav className="space-y-2">
                            {menuItems.map((item) => (
                                <Button
                                    key={item.id}
                                    variant={activeSection === item.id ? "secondary" : "ghost"}
                                    className={`w-full justify-start text-gray-900 dark:text-gray-100 ${activeSection === item.id ? "bg-indigo-600 dark:bg-indigo-400" : "bg-transparent dark:text-gray-500"}`}
                                    onClick={() => setActiveSection(item.id)}
                                >
                                    {item.icon}
                                    <span className="ml-2">{item.label}</span>
                                </Button>
                            ))}
                        </nav>
                    </ScrollArea>
                    <div className="mt-4 flex items-center justify-between">
                        <span>Modo Oscuro</span>
                        <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default Sidebar;
