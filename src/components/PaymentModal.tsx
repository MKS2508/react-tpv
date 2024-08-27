import {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ClockIcon, CreditCardIcon, EuroIcon, PrinterIcon, XIcon} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";
import {toast} from "@/components/ui/use-toast.ts";
import Order from "@/models/Order.ts";


interface PaymentModalProps {
    isPaymentModalOpen: boolean,
    setIsPaymentModalOpen: (isOpen: boolean) => void,
    cashAmount: string,
    setCashAmount: (amount: string) => void,
    paymentMethod: string,
    setPaymentMethod: (method: string) => void,
    newOrder: Order,
    handleCompleteOrder: (order: Order) => void
}

const PaymentModal = ({
                          isPaymentModalOpen,
                          setIsPaymentModalOpen,
                          cashAmount,
                          setCashAmount,
                          paymentMethod,
                          setPaymentMethod,
                          newOrder,
                          handleCompleteOrder
                      }: PaymentModalProps) => {
    const [localCashAmount, setLocalCashAmount] = useState(cashAmount)
    const [localPaymentMethod, setLocalPaymentMethod] = useState(paymentMethod)
    const [showTicketDialog, setShowTicketDialog] = useState(false)

    useEffect(() => {
        setLocalCashAmount(cashAmount)
        setLocalPaymentMethod(paymentMethod)
    }, [isPaymentModalOpen])

    const handleLocalCashInput = (value: string) => {
        setLocalCashAmount(prevAmount => {
            if (value === 'C') return ''
            if (value === '.' && prevAmount.includes('.')) return prevAmount
            if (value === '.' && prevAmount === '') return '0.'
            const newAmount = prevAmount + value
            return newAmount
        })
    }

    const calculateLocalChange = () => {
        const change = parseFloat(localCashAmount) - newOrder.total
        return change > 0 ? change.toFixed(2) : '0.00'
    }

    const handleConfirmPayment = () => {
        setCashAmount(localCashAmount)
        setPaymentMethod(localPaymentMethod)
        setShowTicketDialog(true)
        handleCompleteOrder({
            ...newOrder,
            paymentMethod: localPaymentMethod,
            ticketPath: "ticket.pdf",
            status: localPaymentMethod === 'pagar_luego' ? "unpaid" : "paid",
            totalPaid: parseFloat(localCashAmount),
            change: parseFloat(calculateLocalChange()),
            items: newOrder.items,
        })
        toast({
            title: localPaymentMethod === 'pagar_luego' ? "Pago Pendiente" : "Pago Confirmado!",
            description: localPaymentMethod === 'pagar_luego' ?
                "La orden se ha registrado como pendiente de pago." :
                "El pago ha sido procesado exitosamente.",
            duration: 3000,
        })
    }

    const handleCompleteTransaction = (printTicket: boolean) => {
        setShowTicketDialog(false)
        setIsPaymentModalOpen(false)
        if (printTicket) {
            toast({
                title: "Imprimiendo ticket...",
                description: "El ticket se está imprimiendo.",
                duration: 3000,
            })
        } else {
            toast({
                title: "Orden completada",
                description: localPaymentMethod === 'pagar_luego' ?
                    "La orden ha sido registrada como pendiente de pago." :
                    "La orden ha sido completada sin imprimir ticket.",
                duration: 3000,
            })
        }
    }

    const numpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'C']
    return (
        <>
                {isPaymentModalOpen && (
                    <div>
                        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                            <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full flex flex-col">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">Completar Pedido</DialogTitle>
                                </DialogHeader>
                                <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-auto">
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <Label className="text-xl">Método de Pago</Label>
                                            <div className="flex items-center space-x-4 mt-4">
                                                <Button
                                                    variant={localPaymentMethod === 'efectivo' ? 'default' : 'outline'}
                                                    onClick={() => setLocalPaymentMethod('efectivo')}
                                                    className="flex-1 h-16 text-lg"
                                                >
                                                    <EuroIcon className="mr-2 h-6 w-6"/>
                                                    Efectivo
                                                </Button>
                                                <Button
                                                    variant={localPaymentMethod === 'tarjeta' ? 'default' : 'outline'}
                                                    onClick={() => setLocalPaymentMethod('tarjeta')}
                                                    className="flex-1 h-16 text-lg"
                                                >
                                                    <CreditCardIcon className="mr-2 h-6 w-6"/>
                                                    Tarjeta
                                                </Button>
                                                <Button
                                                    variant={localPaymentMethod === 'pagar_luego' ? 'default' : 'outline'}
                                                    onClick={() => setLocalPaymentMethod('pagar_luego')}
                                                    className="flex-1 h-16 text-lg"
                                                >
                                                    <ClockIcon className="mr-2 h-6 w-6"/>
                                                    Pagar Luego
                                                </Button>
                                            </div>
                                        </div>
                                        <AnimatePresence>
                                            {localPaymentMethod === 'efectivo' && (
                                                <motion.div
                                                    initial={{opacity: 0, height: 0}}
                                                    animate={{opacity: 1, height: 'auto'}}
                                                    exit={{opacity: 0, height: 0}}
                                                    transition={{duration: 0.3}}
                                                    className="space-y-4">
                                                    <Label className="text-xl">Cantidad en Efectivo</Label>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <AnimatePresence>
                                                            {numpadButtons.map((key, index) => (
                                                                <motion.div
                                                                    key={key}
                                                                    initial={{opacity: 0, scale: 0.8}}
                                                                    animate={{opacity: 1, scale: 1}}
                                                                    transition={{
                                                                        duration: 0.4,
                                                                        delay: index * 0.03, // Creates a cascading effect
                                                                    }}
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => handleLocalCashInput(key)}
                                                                        className="h-16 text-2xl w-full"
                                                                    >
                                                                        {key}
                                                                    </Button>
                                                                </motion.div>
                                                            ))}
                                                        </AnimatePresence>
                                                    </div>
                                                    <div className="text-4xl mt-4">
                                                        <span>Cantidad Ingresada: </span>
                                                        <span
                                                            className="text-5xl font-bold text-primary">{localCashAmount}€</span>
                                                    </div>
                                                    <div className="text-4xl">
                                                        <span>Cambio: </span>
                                                        <span
                                                            className="text-5xl font-bold text-primary">{calculateLocalChange()}€</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-4">
                                    <div className="flex justify-between items-center text-6xl font-bold">
                                        <span>Total:</span>
                                        <span className="text-7xl text-primary">{newOrder.total.toFixed(2)}€</span>
                                    </div>
                                    <Button className="w-full h-16 text-xl" onClick={handleConfirmPayment}>
                                        {localPaymentMethod === 'pagar_luego' ? 'Confirmar Pedido' : 'Confirmar Pago'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

            <AnimatePresence>
                {showTicketDialog && (
                    <motion.div
                        initial={{opacity: 0, scale: 0.95}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.95}}
                        transition={{duration: 0.2}}
                    >
                        <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>¿Desea imprimir el ticket?</DialogTitle>
                                </DialogHeader>
                                <div className="flex justify-center space-x-4 mt-6">
                                    <Button onClick={() => handleCompleteTransaction(true)} className="flex-1 h-16 text-lg">
                                        <PrinterIcon className="mr-2 h-6 w-6" />
                                        Sí, imprimir
                                    </Button>
                                    <Button onClick={() => handleCompleteTransaction(false)} variant="outline" className="flex-1 h-16 text-lg">
                                        <XIcon className="mr-2 h-6 w-4" />
                                        No, gracias
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default PaymentModal