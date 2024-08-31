import React from "react";
import Product from "@/models/Product.ts";
import ProductButton from "@/components/ProductButton.tsx";



type ProductGridProps = {
    products: Product[];
    handleAddToOrder: (product: Product) => void;
};
const ProductGrid: React.FC<ProductGridProps> = ({
                                                     products,
                                                     handleAddToOrder,
                                                 }) => (
    <div className="h-full overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {products.map((product) => (
                <ProductButton
                    key={product.id}
                    product={product}
                    handleAddToOrder={handleAddToOrder}
                />
            ))}            {products.map((product) => (
                <ProductButton
                    key={product.id}
                    product={product}
                    handleAddToOrder={handleAddToOrder}
                />
            ))}            {products.map((product) => (
                <ProductButton
                    key={product.id}
                    product={product}
                    handleAddToOrder={handleAddToOrder}
                />
            ))}
        </div>
    </div>
);

export default ProductGrid;
