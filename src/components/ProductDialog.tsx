import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import ProductForm from './ProductForm'
import CategoryForm from './CategoryForm'
import Product from "@/models/Product"
import Category from "@/models/Category"

interface ProductDialogProps {
    editingProduct?: Product | null
    editingCategory?: Category | null
    onProductSave: (product: Product) => void
    onCategorySave: (category: Category) => void
    onProductDelete: (id: number) => void
    onCategoryDelete: (id: number) => void
    onCancel: () => void
    categories: Category[]
}

const ProductDialog: React.FC<ProductDialogProps> = ({
                                                         editingProduct,
                                                         editingCategory,
                                                         onProductSave,
                                                         onCategorySave,
                                                         onProductDelete,
                                                         onCategoryDelete,
                                                         onCancel,
                                                         categories,
                                                     }) => {
    return (
        <>
            {editingProduct && (
                <Dialog open={!!editingProduct} onOpenChange={onCancel}>
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
                        <DialogFooter>
                            {editingProduct.id > 0 && (
                                <Button variant="destructive" onClick={() => onProductDelete(editingProduct.id)}>
                                    Eliminar Producto
                                </Button>
                            )}
                        </DialogFooter>
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
                        <DialogFooter>
                            {editingCategory.id > 0 && (
                                <Button variant="destructive" onClick={() => onCategoryDelete(editingCategory.id)}>
                                    Eliminar Categoría
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}

export default ProductDialog