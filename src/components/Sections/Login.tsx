import {useEffect, useState} from 'react'
import {motion, AnimatePresence, Variants} from 'framer-motion'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import User from "@/models/User"
import {Loader2} from "lucide-react";

interface LoginProps {
    users: User[]
    onLogin: (user: User) => void
}

const Login = ({ users, onLogin }: LoginProps) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (pin.length === 4) {
            handlePinSubmit()
        }
    }, [pin])

    const handleUserSelect = (user: User) => {
        setSelectedUser(user)
        setPin('')
        setError('')
    }

    const handlePinSubmit = () => {
        if (selectedUser && pin === selectedUser.pin) {
            setIsLoading(true)
            setTimeout(() => {
                setIsLoading(false)
                onLogin(selectedUser)
            }, 2000) // 2 second delay for animation
        } else {
            setError('PIN incorrecto')
            setPin('')
        }
    }

    const handlePinInput = (digit: string) => {
        if (pin.length < 4) {
            setPin(prevPin => prevPin + digit)
        }
    }

    const handlePinDelete = () => {
        setPin(prevPin => prevPin.slice(0, -1))
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: {
                duration: 1,
                ease: "easeOut",
                staggerChildren: 0.1
            }
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    const renderNumpad = () => {
        const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'delete', '0']
        return (
            <div className="grid grid-cols-3 gap-4">
                {digits.map((digit, index) => (
                    <Button
                        key={index}
                        onClick={() => {
                            if (digit === 'delete') handlePinDelete()
                            else handlePinInput(digit)
                        }}
                        className="w-16 h-16 text-2xl bg-white bg-opacity-20 hover:bg-opacity-30"
                    >
                        {digit === 'delete' ? '←' : digit}
                    </Button>
                ))}
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="h-screen w-screen bg-cover bg-center flex items-center justify-center"
                 style={{ backgroundImage: "url('/src/assets/wallpaper.jpeg')" }}>
                <Loader2 className="animate-spin text-blue-500 bg-white bg-opacity-20 rounded-full w-16 h-16" />
            </div>
        )
    }

    return (
        <div className="h-screen w-screen bg-cover bg-center flex flex-col items-center justify-center"
             style={{ backgroundImage: "url('/src/assets/wallpaper.jpeg')" }}>
            <img src="/src/assets/logo.svg" alt="El Haido Logo"
                 className="w-64 h-64 mb-4 flex items-center justify-center text-center"/>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="opacity-10 bg-opacity-40 backdrop-blur-md rounded-3xl p-8 w-[500px] shadow-2xl text-white"
            >
                <motion.h1 variants={itemVariants} className="text-4xl font-bold text-center mb-2">
                    Bienvenido a El Haido
                </motion.h1>
                <motion.p variants={itemVariants} className="text-xl text-center mb-8">
                    {currentTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'})}
                </motion.p>
                <AnimatePresence mode="wait">
                    {!selectedUser ? (
                        <motion.div
                            key="user-selection"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="grid grid-cols-3 gap-6"
                        >
                            {users.map((user) => (
                                <motion.div
                                    key={user.id}
                                    whileHover={{scale: 1.1}}
                                    whileTap={{scale: 0.9}}
                                    onClick={() => handleUserSelect(user)}
                                    className="flex flex-col items-center"
                                >
                                    <Avatar
                                        className="w-20 h-20 cursor-pointer border-2 border-white hover:border-blue-400 transition-colors">
                                        <AvatarImage src={user.profilePicture} alt={user.name}/>
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="mt-2 text-sm">{user.name}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="pin-input"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="space-y-6"
                        >
                            <motion.div variants={itemVariants} className="flex flex-col items-center">
                                <Avatar className="w-24 h-24 border-2 border-white">
                                    <AvatarImage src={selectedUser.profilePicture} alt={selectedUser.name}/>
                                    <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="mt-4 text-xl">{selectedUser.name}</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex justify-center">
                                <div className="flex space-x-2">
                                    {[...Array(4)].map((_, index) => (
                                        <div key={index} className="w-4 h-4 rounded-full bg-white bg-opacity-20">
                                            {pin.length > index && (
                                                <div className="w-full h-full rounded-full bg-white"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            {error && (
                                <motion.p
                                    variants={itemVariants}
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    className="text-red-400 text-center"
                                >
                                    {error}
                                </motion.p>
                            )}
                            <motion.div variants={itemVariants} className="flex justify-center">
                                {renderNumpad()}
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex justify-between">
                                <Button variant="outline" onClick={() => setSelectedUser(null)}
                                        className="border-white bg-gray-950 text-white hover:bg-white hover:text-black hover:bg-opacity-20 hover:border-gray-950">
                                    Volver
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

export default Login