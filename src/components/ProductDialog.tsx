import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductForm from './ProductForm';
import CategoryForm from './CategoryForm';
import Product from "@/models/Product.ts";
import Category from "@/models/Category.ts";

interface ProductDialogProps {
    editingProduct?: Product | null;
    editingCategory?: Category | null;
    onProductSave: (product: Product) => void;
    onCategorySave: (category: Category) => void;
    onProductDelete: (id: number) => void;
    onCategoryDelete: (id: number) => void;
    onCancel: () => void;
    categories: Category[];
    products: Product[];
}

const ProductDialog: React.FC<ProductDialogProps> = ({
                                                         editingProduct,
                                                         editingCategory,
                                                         onProductSave,
                                                         onCategorySave,
                                                         onCancel,
                                                         categories,
                                                     }) => {
    return (
        <>
            {editingProduct && (
                <Dialog open={!!editingProduct} onOpenChange={onCancel} >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingProduct.id ? 'Editar Producto' : 'Añadir Producto'}</DialogTitle>
                        </DialogHeader>
                        <ProductForm
                            categories={categories}
                            product={editingProduct}
                            onSave={onProductSave}
                            onCancel={onCancel}
                        />
                    </DialogContent>
                </Dialog>
            )}
            {editingCategory && (
                <Dialog open={!!editingCategory} onOpenChange={onCancel}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory.id ? 'Editar Categoría' : 'Añadir Categoría'}</DialogTitle>
                        </DialogHeader>
                        <CategoryForm
                            category={editingCategory}
                            onSave={onCategorySave}
                            onCancel={onCancel}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default ProductDialog;
