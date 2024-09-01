import Product from "@/models/Product.ts";

interface IProducService {
    getProducts(): Promise<Product[]>
    getProductById(id: number, products: Product[]): Promise<Product>
    getProductsByIdArray(ids: number[], products: Product[]): Promise<Product[]>
    clearDuplicates(products: Product[]): Promise<Product[]>

}

export default class ProductService implements IProducService {
    async getProducts(): Promise<Product[]> {
        return []
    }

    async getProductById(id: number, products: Product[]): Promise<Product> {
        return new Promise((resolve, reject) => {
            const product = products.find(product => product.id === id)
            if (product) {
                resolve(product)
            } else {
                reject(new Error("Product not found"))
            }
        })
    }

    async getProductsByIdArray(ids: number[], products: Product[]): Promise<Product[]> {
        return new Promise((resolve, reject) => {
            const productsById = ids.map(id => products.find(product => product.id === id)) || []
            if (productsById && productsById.every(product => product)) {
                resolve(productsById as Product[])
            } else {
                reject(new Error("Product not found"))
            }
        })
    }
    async clearDuplicates(products: Product[]): Promise<Product[]> {
        return new Promise((resolve) => {
            const uniqueProducts = products.filter((product, index) => products.findIndex(p => p.id === product.id) === index)
            resolve(uniqueProducts)
        })
    }

}