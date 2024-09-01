import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { PlusIcon, FilterIcon, Star } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import ProductDialog from '@/components/ProductDialog'
import Category from "@/models/Category"
import Product from "@/models/Product"
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import useStore from "@/store/store.ts"

interface ProductsProps {
    products: Product[]
    categories: Category[]
}

export default function Component({ products, categories }: ProductsProps) {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [productList, setProducts] = useState(products)
    const [categoryList, setCategories] = useState(categories)
    const [productSearchTerm, setProductSearchTerm] = useState('')
    const [categorySearchTerm, setCategorySearchTerm] = useState('')
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedBrands, setSelectedBrands] = useState<string[]>([])
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'product' | 'category', id: number } | null>(null)
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

    const {users, selectedUser, setUsers, setSelectedUser} = useStore()

    const handleAddProduct = (newProduct: Product) => {
        setProducts([...productList, { ...newProduct, id: productList.length + 1 }])
    }

    const handleEditProduct = (editedProduct: Product) => {
        setProducts(productList.map(p => p.id === editedProduct.id ? editedProduct : p))
    }

    const handleDeleteProduct = (id: number) => {
        setDeleteConfirmation({ type: 'product', id })
    }

    const confirmDeleteProduct = () => {
        if (deleteConfirmation?.type === 'product') {
            setProducts(productList.filter(p => p.id !== deleteConfirmation.id))
            setDeleteConfirmation(null)
            setEditingProduct(null)
        }
    }

    const handleAddCategory = (newCategory: Category) => {
        setCategories([...categoryList, { ...newCategory, id: categoryList.length + 1 }])
    }

    const handleEditCategory = (editedCategory: Category) => {
        setCategories(categoryList.map(c => c.id === editedCategory.id ? editedCategory : c))
    }

    const handleDeleteCategory = (id: number) => {
        setDeleteConfirmation({ type: 'category', id })
    }

    const confirmDeleteCategory = () => {
        if (deleteConfirmation?.type === 'category') {
            setCategories(categoryList.filter(c => c.id !== deleteConfirmation.id))
            setDeleteConfirmation(null)
            setEditingCategory(null)
        }
    }

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
    }

    const defaultCategory: Category = {
        id: 0,
        name: '',
        description: '',
    }

    const filteredProducts = useMemo(() => {
        return productList.filter(product =>
            (selectedCategories.length === 0 || selectedCategories.includes(product.category)) &&
            (selectedBrands.length === 0 || selectedBrands.includes(product.brand)) &&
            (product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                product.brand.toLowerCase().includes(productSearchTerm.toLowerCase()))
        )
    }, [productList, selectedCategories, selectedBrands, productSearchTerm])

    const filteredCategories = useMemo(() => {
        return categoryList.filter(category =>
            category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(categorySearchTerm.toLowerCase())
        )
    }, [categoryList, categorySearchTerm])

    const availableBrands = useMemo(() => {
        const brands = new Set<string>()
        filteredProducts.forEach(product => {
            if (selectedCategories.length === 0 || selectedCategories.includes(product.category)) {
                brands.add(product.brand)
            }
        })
        return Array.from(brands)
    }, [filteredProducts, selectedCategories])

    const availableCategories = useMemo(() => {
        const categories = new Set<string>()
        filteredProducts.forEach(product => {
            if (selectedBrands.length === 0 || selectedBrands.includes(product.brand)) {
                categories.add(product.category)
            }
        })
        return Array.from(categories)
    }, [filteredProducts, selectedBrands])

    const handleCategorySelect = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        )
    }

    const handleBrandSelect = (brand: string) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        )
    }

    const removeFilter = (type: 'category' | 'brand', value: string) => {
        if (type === 'category') {
            setSelectedCategories(prev => prev.filter(c => c !== value))
        } else {
            setSelectedBrands(prev => prev.filter(b => b !== value))
        }
    }

    const toggleFavorite = (productId: number) => {
        if (selectedUser) {
            const updatedUsers = users.map(user => {
                if (user.id === selectedUser.id) {
                    const favProductIds = user.pinnedProductIds || []
                    if (favProductIds.includes(productId)) {
                        return { ...user, pinnedProductIds: favProductIds.filter(id => id !== productId) }
                    } else {
                        return { ...user, pinnedProductIds: [...favProductIds, productId] }
                    }
                }
                return user
            })
            setUsers(updatedUsers)
            setSelectedUser(updatedUsers.find(user => user.id === selectedUser.id)!)
        }
    }

    return (
        <div className="flex flex-col space-y-6 p-4 md:flex-row md:space-x-6 md:space-y-0">
            {/* Products */}
            <div className="w-full md:w-2/3 space-y-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <Input
                            placeholder="Buscar productos..."
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            className="flex-grow border border-gray-300 dark:border-gray-600"
                        />
                        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="border border-gray-300 dark:border-gray-600">
                                    <FilterIcon className="mr-2 h-4 w-4" /> Filtros
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Filtros</SheetTitle>
                                </SheetHeader>
                                <div className="py-4 space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Categorías</h3>
                                        {availableCategories.map((category) => (
                                            <div key={category} className="flex items-center space-x-2 bg-red">
                                                <Checkbox
                                                    className="border-red-500"
                                                    id={`category-${category}`}
                                                    checked={selectedCategories.includes(category)}
                                                    onCheckedChange={() => handleCategorySelect(category)}
                                                />
                                                <label
                                                    htmlFor={`category-${category}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {category}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Marcas</h3>
                                        {availableBrands.map((brand) => (
                                            <div key={brand} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`brand-${brand}`}
                                                    className="border-red-500"
                                                    checked={selectedBrands.includes(brand)}
                                                    onCheckedChange={() => handleBrandSelect(brand)}
                                                />
                                                <label
                                                    htmlFor={`brand-${brand}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {brand}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <Button onClick={() => setIsProductDialogOpen(true)} className="border border-gray-300 dark:border-gray-600">
                            <PlusIcon className="mr-2 h-4 w-4" /> Añadir Producto
                        </Button>
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
                                    <span className="sr-only">Eliminar filtro de categoría</span>
                                    &times;
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
                                    <span className="sr-only">Eliminar filtro de marca</span>
                                    &times;
                                </Button>
                            </Badge>
                        ))}
                    </div>
                </div>

                <ScrollArea className="h-[calc(100vh-300px)]">
                    <AnimatePresence>
                        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`}>
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card
                                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:shadow-md transition-shadow duration-200 cursor-pointer relative"
                                        onClick={() => setEditingProduct(product)}
                                    >
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium truncate">{product.name}</CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute top-2 right-2 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleFavorite(product.id)
                                                }}
                                            >
                                                <Star
                                                    className={`h-5 w-5 ${
                                                        selectedUser?.pinnedProductIds?.includes(product.id)
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-400'
                                                    }`}
                                                />
                                                <span className="sr-only">Add to favorites</span>
                                            </Button>
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

            {/* Categories */}
            <div className="w-full md:w-1/3 space-y-6">
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
                                    <Card
                                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                        onClick={() => setEditingCategory(category)}
                                    >
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium truncate">{category.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{category.description}</p>
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
                            handleAddProduct(product)
                            setIsProductDialogOpen(false)
                        }}
                        onCategorySave={(category) => {
                            handleAddCategory(category)
                            setIsCategoryDialogOpen(false)
                        }}
                        onProductDelete={handleDeleteProduct}
                        onCategoryDelete={handleDeleteCategory}
                        onCancel={() => setIsProductDialogOpen(false)}
                        categories={categoryList}
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
                            handleAddCategory(category)
                            setIsCategoryDialogOpen(false)
                        }}
                        onProductSave={(product) => {
                            handleAddProduct(product)
                            setIsProductDialogOpen(false)
                        }}
                        onProductDelete={handleDeleteProduct}
                        onCategoryDelete={handleDeleteCategory}
                        onCancel={() => setIsCategoryDialogOpen(false)}
                        categories={categoryList}
                    />
                </DialogContent>
            </Dialog>

            <ProductDialog
                editingProduct={editingProduct}
                editingCategory={editingCategory}
                onProductSave={(product) => {
                    handleEditProduct(product)
                    setEditingProduct(null)
                }}
                onCategorySave={(category) => {
                    handleEditCategory(category)
                    setEditingCategory(null)
                }}
                onProductDelete={handleDeleteProduct}
                onCategoryDelete={handleDeleteCategory}
                onCancel={() => {
                    setEditingProduct(null)
                    setEditingCategory(null)
                }}
                categories={categoryList}
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
    )
}