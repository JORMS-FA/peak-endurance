package com.nuevo.shoppinglist.domain

import com.nuevo.shoppinglist.data.CategoryEntity
import com.nuevo.shoppinglist.data.ProductEntity
import com.nuevo.shoppinglist.data.ProductLinkEntity
import kotlinx.coroutines.flow.Flow

/**
 * Contract-first data source so the app can move from local-only data
 * to cloud sync/shared account storage in the future without rewriting UI.
 */
interface ShoppingDataSource {
    fun categories(): Flow<List<CategoryEntity>>
    fun products(categoryId: Long): Flow<List<ProductEntity>>
    fun links(productId: Long): Flow<List<ProductLinkEntity>>

    suspend fun addCategory(name: String): Long
    suspend fun addProduct(categoryId: Long, name: String, notes: String)
    suspend fun addLink(productId: Long, storeName: String, url: String)
    suspend fun setBought(product: ProductEntity, bought: Boolean)
    suspend fun setPreferredLink(productId: Long, linkId: Long)
    suspend fun seedDemoDataIfEmpty(): Long?
    suspend fun clearAllData()
}
