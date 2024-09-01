import React, { useEffect, useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    ClockIcon,
    CreditCardIcon,
    EuroIcon,
    PrinterIcon,
    XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast.ts";
import Order from "@/models/Order.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";

interface PaymentModalProps {
    isPaymentModalOpen: boolean;
    setIsPaymentModalOpen: (isOpen: boolean) => void;
    cashAmount: string;
    setCashAmount: (amount: string) => void;
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
    newOrder: Order;
    handleCompleteOrder: (order: Order) => void;
    showTicketDialog: boolean;
    setShowTicketDialog: (show: boolean) => void;

    handleTicketPrintingComplete: (shouldPrintTicket: boolean) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
                                                       isPaymentModalOpen,
                                                       setIsPaymentModalOpen,
                                                       cashAmount,
                                                       showTicketDialog,
                                                       setShowTicketDialog,
                                                       handleTicketPrintingComplete,
                                                       setCashAmount,
                                                       paymentMethod,
                                                       setPaymentMethod,
                                                       newOrder,
                                                       handleCompleteOrder,
                                                   }) => {
    const [localCashAmount, setLocalCashAmount] = useState(cashAmount);
    const [localPaymentMethod, setLocalPaymentMethod] = useState(paymentMethod);

    useEffect(() => {
        setLocalCashAmount(cashAmount);
        setLocalPaymentMethod(paymentMethod);
    }, [isPaymentModalOpen, cashAmount, paymentMethod]);

    const handleLocalCashInput = useCallback((value: string) => {
        setLocalCashAmount((prevAmount) => {
            if (value === "C") return "";
            if (value === "." && prevAmount.includes(".")) return prevAmount;
            if (value === "." && prevAmount === "") return "0.";
            return prevAmount + value;
        });
    }, []);

    const calculateLocalChange = useCallback(() => {
        const change = parseFloat(localCashAmount) - newOrder.total;
        return change > 0 ? change.toFixed(2) : "0.00";
    }, [localCashAmount, newOrder.total]);

    const handleConfirmPayment = useCallback(() => {
        const updatedOrder = {
            ...newOrder,
            paymentMethod: localPaymentMethod,
            ticketPath: "ticket.pdf",
            status: localPaymentMethod === "pagar_luego" ? "unpaid" : "paid",
            totalPaid: parseFloat(localCashAmount),
            change: parseFloat(calculateLocalChange()),
            items: newOrder.items,
        };

        handleCompleteOrder(updatedOrder);

        toast({
            title:
                localPaymentMethod === "pagar_luego"
                    ? "Pago Pendiente"
                    : "Pago Confirmado!",
            description:
                localPaymentMethod === "pagar_luego"
                    ? "La orden se ha registrado como pendiente de pago."
                    : "El pago ha sido procesado exitosamente.",
            duration: 3000,
        });
    }, [
        newOrder,
        localPaymentMethod,
        localCashAmount,
        calculateLocalChange,
        handleCompleteOrder,
    ]);

    const handleCompleteTransaction = useCallback(
        (shouldPrintTicket: boolean) => {
            handleTicketPrintingComplete(shouldPrintTicket);
            setCashAmount("");
            setPaymentMethod("efectivo");

            if (shouldPrintTicket) {
                toast({
                    title: "Imprimiendo ticket...",
                    description: "El ticket se está imprimiendo.",
                    duration: 3000,
                });
            } else {
                toast({
                    title: "Orden completada",
                    description:
                        localPaymentMethod === "pagar_luego"
                            ? "La orden ha sido registrada como pendiente de pago."
                            : "La orden ha sido completada sin imprimir ticket.",
                    duration: 3000,
                });
            }
        },
        [setIsPaymentModalOpen, setCashAmount, setPaymentMethod, localPaymentMethod]
    );

    const numpadButtons = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        ".",
        "0",
        "C",
    ];

    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (localPaymentMethod !== "efectivo") return;

            const key = event.key;
            if (/^[0-9.]$/.test(key) || key === "Backspace") {
                event.preventDefault();
                if (key === "Backspace") {
                    setLocalCashAmount((prev) => prev.slice(0, -1));
                } else {
                    handleLocalCashInput(key);
                }
            }
        },
        [localPaymentMethod, handleLocalCashInput]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [handleKeyPress]);

    return (
        <>
            {isPaymentModalOpen && (
                <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogContent className="max-w-[90vw]  max-h-[95vh] min-h-[500px] flex flex-col">
                        <DialogHeader>
                            <div className="flex items-center space-x-4 mt-4">
                                <DialogTitle className="text-2xl">Completar Pedido</DialogTitle>

                                <Button
                                    variant={
                                        localPaymentMethod === "efectivo" ? "default" : "outline"
                                    }
                                    onClick={() => setLocalPaymentMethod("efectivo")}
                                    className="flex-1 h-10 text-lg"
                                >
                                    <EuroIcon className="mr-2 h-6 w-6" />
                                    Efectivo
                                </Button>
                                <Button
                                    variant={
                                        localPaymentMethod === "tarjeta" ? "default" : "outline"
                                    }
                                    onClick={() => setLocalPaymentMethod("tarjeta")}
                                    className="flex-1 h-10 text-lg"
                                >
                                    <CreditCardIcon className="mr-2 h-6 w-6" />
                                    Tarjeta
                                </Button>
                                <Button
                                    variant={
                                        localPaymentMethod === "pagar_luego" ? "default" : "outline"
                                    }
                                    onClick={() => setLocalPaymentMethod("pagar_luego")}
                                    className="flex-1 h-10 text-lg"
                                >
                                    <ClockIcon className="mr-2 h-6 w-6" />
                                    Pagar Luego
                                </Button>
                            </div>
                        </DialogHeader>
                        <AnimatePresence>
                            <div className="w-full max-w-full mx-auto h-full">
                                {localPaymentMethod === "efectivo" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <div className="space-y-4">
                                            <Label className="text-xl">Cantidad en Efectivo</Label>
                                            <div className="grid grid-cols-3 gap-4">
                                                <AnimatePresence>
                                                    {numpadButtons.map((key, index) => (
                                                        <motion.div
                                                            key={key}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{
                                                                duration: 0.4,
                                                                delay: index * 0.03,
                                                            }}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleLocalCashInput(key)}
                                                                className="h-32 text-4xl w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                                                            >
                                                                {key}
                                                            </Button>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <Card className="w-full">
                                            <CardContent className="p-6">
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-center">
                            <span className="text-4xl font-semibold">
                              Total:
                            </span>
                                                        <span className="text-7xl font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                              {newOrder.total.toFixed(2)}€
                            </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                            <span className="text-2xl font-semibold">
                              Cantidad Ingresada:
                            </span>
                                                        <span className="text-2xl font-bold text-secondary-foreground bg-secondary px-3 py-1 rounded-md">
                              {localCashAmount}€
                            </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                            <span className="text-2xl font-semibold">
                              Cambio:
                            </span>
                                                        <span className="text-2xl font-bold text-accent-foreground bg-accent px-3 py-1 rounded-md">
                              {calculateLocalChange()}€
                            </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </div>
                            {localPaymentMethod !== "efectivo" && (
                                <Card className="w-full max-w-full mx-auto">
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-2xl font-semibold">Total:</span>
                                                <span className="text-2xl font-bold text-secondary-foreground bg-secondary px-3 py-1 rounded-md">
                          {newOrder.total.toFixed(2)}€
                        </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg">Cantidad Ingresada:</span>
                                                <span className="text-2xl font-bold text-secondary-foreground bg-secondary px-3 py-1 rounded-md">
                          {localCashAmount}€
                        </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg">Cambio:</span>
                                                <span className="text-2xl font-bold text-accent-foreground bg-accent px-3 py-1 rounded-md">
                          {calculateLocalChange()}€
                        </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </AnimatePresence>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="text-foreground dark:text-foreground hover:bg-secondary dark:hover:bg-secondary w-full h-14 text-lg font-semibold mt-4"
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="w-full h-14 text-lg font-semibold mt-4"
                                onClick={handleConfirmPayment}
                            >
                                {localPaymentMethod === "pagar_luego"
                                    ? "Confirmar Pedido"
                                    : "Confirmar Pago"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <AnimatePresence>
                {showTicketDialog && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>¿Desea imprimir el ticket?</DialogTitle>
                                </DialogHeader>
                                <div className="flex justify-center space-x-4 mt-6">
                                    <Button
                                        onClick={() => handleCompleteTransaction(true)}
                                        className="flex-1 h-16 text-lg"
                                    >
                                        <PrinterIcon className="mr-2 h-6 w-6" />
                                        Sí, imprimir
                                    </Button>
                                    <Button
                                        onClick={() => handleCompleteTransaction(false)}
                                        variant="outline"
                                        className="flex-1 h-16 text-lg"
                                    >
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
    );
};

export default PaymentModal;
