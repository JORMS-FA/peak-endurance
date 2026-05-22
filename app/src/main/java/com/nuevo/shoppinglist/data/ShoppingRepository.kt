package com.nuevo.shoppinglist.data

import com.nuevo.shoppinglist.domain.ShoppingDataSource
import kotlinx.coroutines.flow.Flow

class ShoppingRepository(
    private val dao: ShoppingDao
) : ShoppingDataSource {

    override fun categories(): Flow<List<CategoryEntity>> = dao.getCategories()

    override fun products(categoryId: Long): Flow<List<ProductEntity>> = dao.getProductsByCategory(categoryId)

    override fun links(productId: Long): Flow<List<ProductLinkEntity>> = dao.getLinksByProduct(productId)

    override suspend fun addCategory(name: String): Long {
        return dao.insertCategory(CategoryEntity(name = name.trim()))
    }

    override suspend fun addProduct(categoryId: Long, name: String, notes: String) {
        dao.insertProduct(ProductEntity(categoryId = categoryId, name = name.trim(), notes = notes.trim()))
    }

    override suspend fun addLink(productId: Long, storeName: String, url: String) {
        dao.insertLink(
            ProductLinkEntity(
                productId = productId,
                storeName = storeName.trim(),
                url = url.trim()
            )
        )
    }

    override suspend fun setBought(product: ProductEntity, bought: Boolean) {
        dao.updateProduct(product.copy(bought = bought))
    }

    override suspend fun setPreferredLink(productId: Long, linkId: Long) {
        dao.setPreferredLink(productId, linkId)
    }

    override suspend fun seedDemoDataIfEmpty(): Long? {
        if (dao.countCategories() > 0) {
            return null
        }

        val ropaId = dao.insertCategory(CategoryEntity(name = "Ropa"))
        val tecnologiaId = dao.insertCategory(CategoryEntity(name = "Tecnología"))
        val accesoriosId = dao.insertCategory(CategoryEntity(name = "Accesorios"))

        val tenisId = dao.insertProduct(
            ProductEntity(
                categoryId = ropaId,
                name = "Tenis blancos",
                notes = "Buscar algo cómodo para uso diario"
            )
        )
        dao.insertLink(
            ProductLinkEntity(
                productId = tenisId,
                storeName = "Amazon",
                url = "https://www.amazon.com/",
                isPreferred = true
            )
        )
        dao.insertLink(
            ProductLinkEntity(
                productId = tenisId,
                storeName = "Zara",
                url = "https://www.zara.com/"
            )
        )

        val audifonosId = dao.insertProduct(
            ProductEntity(
                categoryId = tecnologiaId,
                name = "Audífonos bluetooth",
                notes = "Con cancelación de ruido si es posible"
            )
        )
        dao.insertLink(
            ProductLinkEntity(
                productId = audifonosId,
                storeName = "Mercado Libre",
                url = "https://www.mercadolibre.com/",
                isPreferred = true
            )
        )
        dao.insertLink(
            ProductLinkEntity(
                productId = audifonosId,
                storeName = "Best Buy",
                url = "https://www.bestbuy.com/"
            )
        )

        val relojId = dao.insertProduct(
            ProductEntity(
                categoryId = accesoriosId,
                name = "Reloj negro",
                notes = "Estilo casual"
            )
        )
        dao.insertLink(
            ProductLinkEntity(
                productId = relojId,
                storeName = "AliExpress",
                url = "https://www.aliexpress.com/",
                isPreferred = true
            )
        )

        return ropaId
    }

    override suspend fun clearAllData() {
        dao.deleteAllLinks()
        dao.deleteAllProducts()
        dao.deleteAllCategories()
    }
}
