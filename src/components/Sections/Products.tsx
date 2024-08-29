import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PencilIcon, TrashIcon, PlusIcon, XIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductDialog from '@/components/ProductDialog';
import Category from "@/models/Category";
import Product from "@/models/Product";
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";

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
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'product' | 'category', id: number } | null>(null);

    const handleAddProduct = (newProduct: Product) => {
        setProducts([...productList, { ...newProduct, id: productList.length + 1 }]);
    };

    const handleEditProduct = (editedProduct: Product) => {
        setProducts(productList.map(p => p.id === editedProduct.id ? editedProduct : p));
    };

    const handleDeleteProduct = (id: number) => {
        setDeleteConfirmation({ type: 'product', id });
    };

    const confirmDeleteProduct = () => {
        if (deleteConfirmation?.type === 'product') {
            setProducts(productList.filter(p => p.id !== deleteConfirmation.id));
            setDeleteConfirmation(null);
        }
    };

    const handleAddCategory = (newCategory: Category) => {
        setCategories([...categoryList, { ...newCategory, id: categoryList.length + 1 }]);
    };

    const handleEditCategory = (editedCategory: Category) => {
        setCategories(categoryList.map(c => c.id === editedCategory.id ? editedCategory : c));
    };

    const handleDeleteCategory = (id: number) => {
        setDeleteConfirmation({ type: 'category', id });
    };

    const confirmDeleteCategory = () => {
        if (deleteConfirmation?.type === 'category') {
            setCategories(categoryList.filter(c => c.id !== deleteConfirmation.id));
            setDeleteConfirmation(null);
        }
    };

    const defaultProduct: Product = {
        id: 0,
        name: '',
        price: 0,
        brand: '',
        category: '',
        icon: <></>,
        iconType: 'preset',
        selectedIcon: '',
        uploadedImage: null,
    };

    const defaultCategory: Category = {
        id: 0,
        name: '',
        description: '',
    };

    const filteredProducts = useMemo(() => {
        return productList.filter(product =>
            (selectedCategories.length === 0 || selectedCategories.includes(product.category)) &&
            (selectedBrands.length === 0 || selectedBrands.includes(product.brand)) &&
            (product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                product.brand.toLowerCase().includes(productSearchTerm.toLowerCase()))
        );
    }, [productList, selectedCategories, selectedBrands, productSearchTerm]);

    const filteredCategories = useMemo(() => {
        return categoryList.filter(category =>
            category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(categorySearchTerm.toLowerCase())
        );
    }, [categoryList, categorySearchTerm]);

    const availableBrands = useMemo(() => {
        const brands = new Set<string>();
        filteredProducts.forEach(product => {
            if (selectedCategories.length === 0 || selectedCategories.includes(product.category)) {
                brands.add(product.brand);
            }
        });
        return Array.from(brands);
    }, [filteredProducts, selectedCategories]);

    const availableCategories = useMemo(() => {
        const categories = new Set<string>();
        filteredProducts.forEach(product => {
            if (selectedBrands.length === 0 || selectedBrands.includes(product.brand)) {
                categories.add(product.category);
            }
        });
        return Array.from(categories);
    }, [filteredProducts, selectedBrands]);

    const handleCategorySelect = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const handleBrandSelect = (brand: string) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    const removeFilter = (type: 'category' | 'brand', value: string) => {
        if (type === 'category') {
            setSelectedCategories(prev => prev.filter(c => c !== value));
        } else {
            setSelectedBrands(prev => prev.filter(b => b !== value));
        }
    };

    return (
        <div className="flex space-x-6">
            {/* Left side: Products */}
            <div className="w-2/3 space-y-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex space-x-4">
                        <Input
                            placeholder="Buscar productos..."
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            className="flex-grow border border-gray-300 dark:border-gray-600"
                        />
                        <Select value={selectedCategories.join(',')} onValueChange={handleCategorySelect}>
                            <SelectTrigger className="w-[180px] border border-gray-300 dark:border-gray-600">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedBrands.join(',')} onValueChange={handleBrandSelect}>
                            <SelectTrigger className="w-[180px] border border-gray-300 dark:border-gray-600">
                                <SelectValue placeholder="Marca" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableBrands.map((brand) => (
                                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((category) => (
                            <Badge key={category} variant="secondary" className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                                {category}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 h-4 w-4 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    onClick={() => removeFilter('category', category)}
                                >
                                    <XIcon className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                        {selectedBrands.map((brand) => (
                            <Badge key={brand} variant="secondary" className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                                {brand}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 h-4 w-4 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    onClick={() => removeFilter('brand', brand)}
                                >
                                    <XIcon className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                    <Button onClick={() => setIsProductDialogOpen(true)} className="border border-gray-300 dark:border-gray-600">
                        <PlusIcon className="mr-2 h-4 w-4" /> Añadir Producto
                    </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-300px)]">
                    <AnimatePresence>
                        <div className={`grid ${isSidebarOpen ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-4'} gap-4`}>
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">{product.name}</CardTitle>
                                            <div className="flex space-x-1">
                                                <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)} className="text-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-0">
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="text-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-0">
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center space-x-2">
                                                {product.icon}
                                                <div>
                                                    <p className="text-xs font-semibold">{product.price.toFixed(2)}€</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.brand}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                </ScrollArea>
            </div>

            {/* Right side: Categories */}
            <div className="w-1/3 space-y-6">
                <div className="flex flex-col space-y-4">
                    <Input
                        placeholder="Buscar categorías..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="flex-grow border border-gray-300 dark:border-gray-600"
                    />
                    <Button onClick={() => setIsCategoryDialogOpen(true)} className="border border-gray-300 dark:border-gray-600">
                        <PlusIcon className="mr-2 h-4 w-4" /> Añadir Categoría
                    </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-300px)]">
                    <AnimatePresence>
                        <div className="space-y-4">
                            {filteredCategories.map((category) => (
                                <motion.div
                                    key={category.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                                            <div className="flex space-x-1">
                                                <Button variant="ghost" size="icon" onClick={() => setEditingCategory(category)} className="text-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-0">
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)} className="text-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-0">
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                </ScrollArea>
            </div>

            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Producto</DialogTitle>
                    </DialogHeader>
                    <ProductDialog
                        editingProduct={defaultProduct}
                        onProductSave={(product) => {
                            handleAddProduct(product);
                            setIsProductDialogOpen(false);
                        }}
                        onCategorySave={(category) => {
                            handleAddCategory(category);
                            setIsCategoryDialogOpen(false);
                        }}
                        onProductDelete={handleDeleteProduct}
                        onCategoryDelete={handleDeleteCategory}
                        onCancel={() => setIsProductDialogOpen(false)}
                        categories={categoryList}
                        products={productList}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Categoría</DialogTitle>
                    </DialogHeader>
                    <ProductDialog
                        editingCategory={defaultCategory}
                        onCategorySave={(category) => {
                            handleAddCategory(category);
                            setIsCategoryDialogOpen(false);
                        }}
                        onProductSave={(product) => {
                            handleAddProduct(product);
                            setIsProductDialogOpen(false);
                        }}
                        onProductDelete={handleDeleteProduct}
                        onCategoryDelete={handleDeleteCategory}
                        onCancel={() => setIsCategoryDialogOpen(false)}
                        categories={categoryList}
                        products={productList}
                    />
                </DialogContent>
            </Dialog>

            <ProductDialog
                editingProduct={editingProduct}
                editingCategory={editingCategory}
                onProductSave={(product) => {
                    handleEditProduct(product);
                    setEditingProduct(null);
                }}
                onCategorySave={(category) => {
                    handleEditCategory(category);
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

            <Dialog open={deleteConfirmation !== null} onOpenChange={() => setDeleteConfirmation(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que quieres eliminar este {deleteConfirmation?.type === 'product' ? 'producto' : 'categoría'}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={deleteConfirmation?.type === 'product' ? confirmDeleteProduct : confirmDeleteCategory}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Products;