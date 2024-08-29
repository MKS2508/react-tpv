import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Printer, Wifi } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BreakLine, CharacterSet, PrinterTypes, ThermalPrinterServiceOptions } from "@/models/ThermalPrinter.ts"

interface ThermalPrinterSettingsProps {
    options: ThermalPrinterServiceOptions
    onOptionsChange: (newOptions: ThermalPrinterServiceOptions) => void
    onPrintTestTicket: () => void
    onTestConnection: () => Promise<boolean>
}

const defaultOptions: ThermalPrinterServiceOptions = {
    type: PrinterTypes.EPSON,
    interface: '192.168.1.100',
    characterSet: CharacterSet.PC852_LATIN2,
    removeSpecialCharacters: false,
    lineCharacter: '-',
    breakLine: BreakLine.WORD,
    options: { timeout: 3000 },
}

export default function ThermalPrinterSettings({
                                                   options = defaultOptions,
                                                   onOptionsChange,
                                                   onPrintTestTicket,
                                                   onTestConnection
                                               }: ThermalPrinterSettingsProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)

    const handleChange = (field: keyof ThermalPrinterServiceOptions, value: unknown): void => {
        onOptionsChange({ ...options, [field]: value })
    }

    const handleTestConnection = async () => {
        setIsDialogOpen(true)
        const result = await onTestConnection()
        setConnectionStatus(result)
    }

    return (
        <div className="space-y-4 mt-4 pb-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="printerType">Tipo de Impresora</Label>
                    <Select
                        value={options.type}
                        onValueChange={(value) => handleChange('type', value as PrinterTypes)}
                    >
                        <SelectTrigger id="printerType">
                            <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(PrinterTypes).map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="interface">Interfaz de Conexión</Label>
                    <Input
                        id="interface"
                        value={options.interface}
                        onChange={(e) => handleChange('interface', e.target.value)}
                        placeholder="tcp://xxx.xxx.xxx.xxx"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="characterSet">Conjunto de Caracteres</Label>
                    <Select
                        value={options.characterSet}
                        onValueChange={(value) => handleChange('characterSet', value as CharacterSet)}
                    >
                        <SelectTrigger id="characterSet">
                            <SelectValue placeholder="Seleccionar conjunto" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(CharacterSet).map((set) => (
                                <SelectItem key={set} value={set}>{set}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="breakLine">Modo de Corte de Línea</Label>
                    <Select
                        value={options.breakLine}
                        onValueChange={(value) => handleChange('breakLine', value as BreakLine)}
                    >
                        <SelectTrigger id="breakLine">
                            <SelectValue placeholder="Seleccionar modo" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(BreakLine).map((mode) => (
                                <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
                <div className="space-y-2">
                    <Label htmlFor="lineCharacter">Caracter de Línea</Label>
                    <Select
                        value={options.lineCharacter}
                        onValueChange={(value) => handleChange('lineCharacter', value)}
                    >
                        <SelectTrigger id="lineCharacter">
                            <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                            {['-', '_', '=', '*'].map((char) => (
                                <SelectItem key={char} value={char}>{char}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 col-span-2">
                    <Label htmlFor="timeout">Tiempo de Espera: {(options.options as { timeout: number }).timeout}ms</Label>
                    <Slider
                        id="timeout"
                        min={1000}
                        max={10000}
                        step={100}
                        value={[(options.options as { timeout: number }).timeout]}
                        onValueChange={(value) => handleChange('options', { ...options.options, timeout: value[0] })}
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="removeSpecialCharacters"
                    checked={options.removeSpecialCharacters}
                    onCheckedChange={(checked) => handleChange('removeSpecialCharacters', checked)}
                />
                <Label htmlFor="removeSpecialCharacters">Eliminar Caracteres Especiales</Label>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
                <Button onClick={onPrintTestTicket} className="w-full">
                    <Printer className="mr-2 h-4 w-4" /> Imprimir Ticket de Prueba
                </Button>
                <Button onClick={handleTestConnection} className="w-full">
                    <Wifi className="mr-2 h-4 w-4" /> Probar Conexión
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Estado de la Conexión</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {connectionStatus === null ? (
                            <p>Probando conexión...</p>
                        ) : connectionStatus ? (
                            <p className="text-green-600">Conexión exitosa</p>
                        ) : (
                            <p className="text-red-600">Error de conexión</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}