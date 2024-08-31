import React from "react";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {PlusCircle} from "lucide-react";
import Product from "@/models/Product.ts";

interface ProductButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    product: Product;
    handleAddToOrder: (product: Product) => void;
    key?: number;
};

const ProductButton: React.FC<ProductButtonProps> = ({
                                                         product,
                                                         handleAddToOrder,
                                                     }) => {
    const buttonStyle = product.uploadedImage
        ? {
            backgroundImage: `url(${product.uploadedImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }
        : {};

    return (
        <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-300">
            <Button
                onClick={() => handleAddToOrder(product)}
                className={cn(
                    "flex flex-col items-stretch justify-center p-2 h-20 w-full",
                    "bg-white dark:bg-gray-800",
                    "hover:bg-gray-50 dark:hover:bg-gray-700",
                    "rounded-t-lg transition-all duration-300 relative overflow-hidden",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    product.uploadedImage ? "text-white" : "bg-gray-100 dark:bg-gray-900"
                )}
                variant="ghost"
                style={buttonStyle}
            >
                {product.uploadedImage && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-80" />
                )}

                <div className="absolute top-1 right-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <PlusCircle className="w-4 h-4 text-primary bg-white rounded-full" />
                </div>
            </Button>
            <div
                className={cn(
                    "w-full px-2 py-1 h-10",
                    "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200",
                    "border-t border-gray-300 dark:border-gray-600"
                )}
            >
                <div className="text-xs break-words font-weight-900 ">
                    {product.name}
                </div>
            </div>
            <div
                className={cn(
                    "w-full flex justify-between items-center px-2 py-1",
                    "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200",
                    "border-t border-gray-300 dark:border-gray-600",
                )}
            >
                <span className="text-primary flex-shrink-0">{product.icon}</span>
                <span className="text-2xl font-bold ml-1">
          {product.price.toFixed(2)}€
        </span>
            </div>
        </div>
    );
};

export default ProductButton;