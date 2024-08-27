import React from "react";

export default interface Product {
    id: number
    name: string
    price: number
    category: string
    brand: string
    icon: React.ReactElement
    iconType: string
    selectedIcon: string
    uploadedImage: File | null
}