import React, { useState } from "react";
import User from "@/models/User.ts";
import { Button } from "@/components/ui/button.tsx";
import { Pencil, PlusCircle, Trash2, Printer, DollarSign, ShieldCheck  } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

type SettingsPanelProps = {
    isSidebarOpen: boolean;
    selectedUser: User;
    setSelectedUser: (user: User) => void;
    users: User[];
    setUsers: (users: User[]) => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ selectedUser, setSelectedUser, users, setUsers, isSidebarOpen, isDarkMode, toggleDarkMode }) => {
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newUser, setNewUser] = useState<Partial<User>>({ name: '', profilePicture: '', pin: '' });
    const [activeTab, setActiveTab] = useState("general");

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setNewUser(user);
        setIsUserDialogOpen(true);
    }

    const handleCreateUser = () => {
        setEditingUser(null);
        setNewUser({ name: '', profilePicture: '', pin: '' });
        setIsUserDialogOpen(true);
    }

    const handleSaveUser = () => {
        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...newUser } : u));
            if (selectedUser.id === editingUser.id) {
                setSelectedUser({ ...selectedUser, ...newUser } as User);
            }
        } else {
            const newId = Math.max(...users.map(u => u.id)) + 1;
            setUsers([...users, { ...newUser as User, id: newId }]);
        }
        setIsUserDialogOpen(false);
    }

    const handleDeleteUser = (userId: number) => {
        setUsers(users.filter(u => u.id !== userId));
        if (selectedUser.id === userId) {
            setSelectedUser(users.find(u => u.id !== userId) || users[0]);
        }
    }

    return (
        <div className={`space-y-6 p-4 ${isSidebarOpen ? 'ml-64' : ''} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
            <h2 className="text-3xl font-bold mb-6">Ajustes</h2>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="users">Usuarios</TabsTrigger>
                    <TabsTrigger value="printing">Impresión</TabsTrigger>
                    <TabsTrigger value="pos">Punto de Venta</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                    <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="darkMode">Modo Oscuro</Label>
                                <Switch id="darkMode" checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="language">Idioma</Label>
                                <Select defaultValue="es">
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Selecciona un idioma" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="es">Español</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="currency">Moneda</Label>
                                <Select defaultValue="eur">
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Selecciona una moneda" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="eur">Euro (€)</SelectItem>
                                        <SelectItem value="usd">Dólar ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="users">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Usuario Actual</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-4 mb-4">
                                    <Avatar>
                                        <AvatarImage src={selectedUser.profilePicture} alt={selectedUser.name} />
                                        <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-lg font-semibold">{selectedUser.name}</span>
                                </div>
                                <Button onClick={() => handleEditUser(selectedUser)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Editar Usuario
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Lista de Usuarios</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {users.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                            <div className="flex items-center space-x-4">
                                                <Avatar>
                                                    <AvatarImage src={user.profilePicture} alt={user.name} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-semibold">{user.name}</span>
                                            </div>
                                            <div>
                                                <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button className="mt-4 w-full" onClick={handleCreateUser}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Usuario
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="printing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración de Impresión</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="printerSelect">Impresora Seleccionada</Label>
                                <Select defaultValue="default">
                                    <SelectTrigger className="w-[250px]">
                                        <SelectValue placeholder="Selecciona una impresora" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Impresora Predeterminada</SelectItem>
                                        <SelectItem value="kitchen">Impresora de Cocina</SelectItem>
                                        <SelectItem value="bar">Impresora de Bar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="ticketPath">Ruta de Guardado de Tickets</Label>
                                <Input id="ticketPath" placeholder="/ruta/de/guardado/tickets" className="w-[250px]" />
                            </div>
                            <Button className="w-full">
                                <Printer className="mr-2 h-4 w-4" /> Imprimir Ticket de Prueba
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="pos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración del Punto de Venta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="openCashDrawer">Abrir Caja Registradora</Label>
                                <Button id="openCashDrawer">
                                    <DollarSign className="mr-2 h-4 w-4" /> Abrir Caja
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="autoOpenDrawer">Abrir Caja Automáticamente al Finalizar Venta</Label>
                                <Switch id="autoOpenDrawer" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="taxRate">Tasa de Impuestos (%)</Label>
                                <Input id="taxRate" type="number" placeholder="21" className="w-[100px]" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración de Seguridad</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="twoFactor">Autenticación de dos factores</Label>
                                <Switch id="twoFactor" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="autoLogout">Cierre de Sesión Automático (minutos)</Label>
                                <Input id="autoLogout" type="number" placeholder="30" className="w-[100px]" />
                            </div>
                            <Button>
                                <ShieldCheck className="mr-2 h-4 w-4" /> Cambiar Contraseña
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración de Notificaciones</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="emailNotifications">Notificaciones por correo</Label>
                                <Switch id="emailNotifications" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="pushNotifications">Notificaciones push</Label>
                                <Switch id="pushNotifications" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="lowStockAlert">Alerta de Stock Bajo</Label>
                                <Switch id="lowStockAlert" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="profilePicture">URL de la Imagen de Perfil</Label>
                            <Input
                                id="profilePicture"
                                value={newUser.profilePicture}
                                onChange={(e) => setNewUser({ ...newUser, profilePicture: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="pin">PIN</Label>
                            <Input
                                id="pin"
                                type="password"
                                value={newUser.pin}
                                onChange={(e) => setNewUser({ ...newUser, pin: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveUser}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default SettingsPanel;