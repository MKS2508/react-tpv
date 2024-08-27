import  {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CreditCardIcon, EuroIcon} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";
import Product from "@/models/Product.ts";
type OrderItem = Product & {
    quantity: number
}
interface PaymentModalProps {
    isPaymentModalOpen: boolean,
    setIsPaymentModalOpen: (isOpen: boolean) => void,
    cashAmount: string,
    setCashAmount: (amount: string) => void,
    paymentMethod: string,
    setPaymentMethod: (method: string) => void,
    newOrder: { items: OrderItem[], tableNumber: number, total: number },
    handleCompleteOrder: () => void
}
const PaymentModal = ({isPaymentModalOpen, setIsPaymentModalOpen, cashAmount, setCashAmount, paymentMethod, setPaymentMethod, newOrder, handleCompleteOrder}: PaymentModalProps) => {
    const [localCashAmount, setLocalCashAmount] = useState(cashAmount)
    const [localPaymentMethod, setLocalPaymentMethod] = useState(paymentMethod)

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
        handleCompleteOrder()
    }

    return (
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Completar Pedido</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Método de Pago</Label>
                        <div className="flex items-center space-x-2 mt-2">
                            <Button
                                variant={localPaymentMethod === 'efectivo' ? 'default' : 'outline'}
                                onClick={() => setLocalPaymentMethod('efectivo')}
                                className="flex-1"
                            >
                                <EuroIcon className="mr-2 h-4 w-4" />
                                Efectivo
                            </Button>
                            <Button
                                variant={localPaymentMethod === 'tarjeta' ? 'default' : 'outline'}
                                onClick={() => setLocalPaymentMethod('tarjeta')}
                                className="flex-1"
                            >
                                <CreditCardIcon className="mr-2 h-4 w-4" />
                                Tarjeta
                            </Button>
                        </div>
                    </div>
                    <AnimatePresence>
                        {localPaymentMethod === 'efectivo' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Label>Cantidad en Efectivo</Label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'C'].map((key) => (
                                        <Button
                                            key={key}
                                            variant="outline"
                                            onClick={() => handleLocalCashInput(key)}
                                        >
                                            {key}
                                        </Button>
                                    ))}
                                </div>
                                <div className="mt-2">
                                    <span>Cantidad Ingresada: {localCashAmount}€</span>
                                </div>
                                <div className="mt-2">
                                    <span>Cambio: {calculateLocalChange()}€</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">Total: {newOrder.total.toFixed(2)}€</span>
                    </div>
                    <Button className="w-full" onClick={handleConfirmPayment}>Confirmar Pago</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default PaymentModal