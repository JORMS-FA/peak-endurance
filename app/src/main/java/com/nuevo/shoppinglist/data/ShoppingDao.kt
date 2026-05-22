package com.nuevo.shoppinglist.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface ShoppingDao {
    @Query("SELECT * FROM categories ORDER BY name")
    fun getCategories(): Flow<List<CategoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCategory(category: CategoryEntity): Long

    @Query("SELECT COUNT(*) FROM categories")
    suspend fun countCategories(): Int

    @Query("SELECT * FROM products WHERE categoryId = :categoryId ORDER BY bought, name")
    fun getProductsByCategory(categoryId: Long): Flow<List<ProductEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: ProductEntity): Long

    @Update
    suspend fun updateProduct(product: ProductEntity)

    @Query("SELECT * FROM product_links WHERE productId = :productId ORDER BY isPreferred DESC, storeName ASC")
    fun getLinksByProduct(productId: Long): Flow<List<ProductLinkEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLink(link: ProductLinkEntity): Long

    @Query("UPDATE product_links SET isPreferred = CASE WHEN id = :linkId THEN 1 ELSE 0 END WHERE productId = :productId")
    suspend fun setPreferredLink(productId: Long, linkId: Long)

    @Query("DELETE FROM product_links")
    suspend fun deleteAllLinks()

    @Query("DELETE FROM products")
    suspend fun deleteAllProducts()

    @Query("DELETE FROM categories")
    suspend fun deleteAllCategories()
}
