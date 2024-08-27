import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusIcon, PencilIcon, TrashIcon, BeerIcon } from 'lucide-react';
import ProductDialog from '@/components/ProductDialog';
import Category from "@/models/Category.ts";
import Product from "@/models/Product.ts";

interface ProductsProps {
    products: Product[];
    categories: Category[];
    isSidebarOpen: boolean;
}

const Products: React.FC<ProductsProps> = ({ products, categories, isSidebarOpen }) => {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [productList, setProducts] = useState(products);
    const [categoryList, setCategories] = useState(categories);

    const handleAddProduct = (newProduct: Product) => {
        setProducts([...productList, { ...newProduct, id: productList.length + 1 }]);
    };

    const handleEditProduct = (editedProduct: Product) => {
        setProducts(productList.map(p => p.id === editedProduct.id ? editedProduct : p));
    };

    const handleDeleteProduct = (id: number) => {
        setProducts(productList.filter(p => p.id !== id));
    };

    const handleAddCategory = (newCategory: Category) => {
        setCategories([...categoryList, { ...newCategory, id: categoryList.length + 1 }]);
    };

    const handleEditCategory = (editedCategory: Category) => {
        setCategories(categoryList.map(c => c.id === editedCategory.id ? editedCategory : c));
    };

    const handleDeleteCategory = (id: number) => {
        setCategories(categoryList.filter(c => c.id !== id));
    };

    const defaultProduct: Product = {
        id: 0,
        name: '',
        price: 0,
        brand: '',
        category: '',
        icon: <BeerIcon />,
        iconType: 'preset',
        selectedIcon: '',
        uploadedImage: null,
    };

    const defaultCategory: Category = {
        id: 0,
        name: '',
        description: '',
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Productos */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Productos</h2>

                    {/* Dialogo para la lista de productos */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full mb-4">Ver Lista de Productos</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Lista de Productos</DialogTitle>
                            </DialogHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-left">Nombre</TableHead>
                                        <TableHead className="text-left">Precio</TableHead>
                                        <TableHead className="text-left">Categoría</TableHead>
                                        <TableHead className="text-left">Marca</TableHead>
                                        <TableHead className="text-left">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productList.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.price.toFixed(2)}€</TableCell>
                                            <TableCell>{product.category}</TableCell>
                                            <TableCell>{product.brand}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button className="mt-4" onClick={() => setEditingProduct(defaultProduct)}>
                                <PlusIcon className="mr-2 h-4 w-4" /> Añadir Producto
                            </Button>
                        </DialogContent>
                    </Dialog>

                    {/* Scroll Area para productos recientes */}
                    <ScrollArea className="h-[calc(100vh-300px)] border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">Productos Recientes</h3>
                        <div className={`grid ${isSidebarOpen ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-4'} gap-4`}>
                            {productList.map((product) => (
                                <Card key={product.id} className="bg-gray-50 dark:bg-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-sm">{product.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.price.toFixed(2)}€</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.brand}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Categorías */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Categorías</h2>
                    <Button onClick={() => setEditingCategory(defaultCategory)} className="w-full mb-4">
                        Ver Lista de Categorías
                    </Button>
                    <ScrollArea className="h-[calc(100vh-300px)] border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">Categorías Recientes</h3>
                        <div className={`grid ${isSidebarOpen ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-4'} gap-4`}>
                            {categoryList.map((category) => (
                                <Card key={category.id } className="bg-gray-50 dark:bg-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-sm">{category.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Dialogs para editar/añadir productos y categorías */}
            <ProductDialog
                editingProduct={editingProduct}
                editingCategory={editingCategory}
                onProductSave={(product) => {
                    if (product.id) {
                        handleEditProduct(product);
                    } else {
                        handleAddProduct(product);
                    }
                    setEditingProduct(null);
                }}
                onCategorySave={(category) => {
                    if (category.id) {
                        handleEditCategory(category);
                    } else {
                        handleAddCategory(category);
                    }
                    setEditingCategory(null);
                }}
                onProductDelete={handleDeleteProduct}
                onCategoryDelete={handleDeleteCategory}
                onCancel={() => {
                    setEditingProduct(null);
                    setEditingCategory(null);
                }}
                categories={categoryList}
                products={productList}
            />
        </div>
    );
};

export default Products;
