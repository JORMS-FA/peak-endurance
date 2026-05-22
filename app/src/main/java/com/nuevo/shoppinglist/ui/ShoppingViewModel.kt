package com.nuevo.shoppinglist.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.nuevo.shoppinglist.data.CategoryEntity
import com.nuevo.shoppinglist.data.ProductEntity
import com.nuevo.shoppinglist.data.ProductLinkEntity
import com.nuevo.shoppinglist.domain.ShoppingDataSource
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch


data class SelectionState(
    val selectedCategoryId: Long? = null,
    val selectedProductId: Long? = null
)

@OptIn(ExperimentalCoroutinesApi::class)
class ShoppingViewModel(
    private val repository: ShoppingDataSource
) : ViewModel() {

    private val selection = MutableStateFlow(SelectionState())

    val categories: StateFlow<List<CategoryEntity>> = repository.categories().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val products: StateFlow<List<ProductEntity>> = selection.flatMapLatest {
        if (it.selectedCategoryId == null) {
            MutableStateFlow(emptyList())
        } else {
            repository.products(it.selectedCategoryId)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val links: StateFlow<List<ProductLinkEntity>> = selection.flatMapLatest {
        if (it.selectedProductId == null) {
            MutableStateFlow(emptyList())
        } else {
            repository.links(it.selectedProductId)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        viewModelScope.launch {
            val initialCategoryId = repository.seedDemoDataIfEmpty()
            if (initialCategoryId != null) {
                selection.value = SelectionState(selectedCategoryId = initialCategoryId)
            }
        }
    }

    fun selectedCategory(categories: List<CategoryEntity>): CategoryEntity? {
        return categories.firstOrNull { it.id == selection.value.selectedCategoryId }
    }

    fun selectedProduct(products: List<ProductEntity>): ProductEntity? {
        return products.firstOrNull { it.id == selection.value.selectedProductId }
    }

    fun selectCategory(categoryId: Long) {
        selection.value = SelectionState(selectedCategoryId = categoryId)
    }

    fun selectProduct(productId: Long) {
        selection.value = selection.value.copy(selectedProductId = productId)
    }

    fun addCategory(name: String) {
        if (name.isBlank()) return
        viewModelScope.launch {
            val id = repository.addCategory(name)
            selection.value = SelectionState(selectedCategoryId = id)
        }
    }

    fun addProduct(name: String, notes: String) {
        val categoryId = selection.value.selectedCategoryId ?: return
        if (name.isBlank()) return
        viewModelScope.launch {
            repository.addProduct(categoryId, name, notes)
        }
    }

    fun addLink(storeName: String, url: String) {
        val productId = selection.value.selectedProductId ?: return
        if (storeName.isBlank() || url.isBlank()) return
        viewModelScope.launch {
            repository.addLink(productId, storeName, url)
        }
    }

    fun toggleBought(product: ProductEntity) {
        viewModelScope.launch {
            repository.setBought(product, !product.bought)
        }
    }

    fun setPreferredLink(link: ProductLinkEntity) {
        viewModelScope.launch {
            repository.setPreferredLink(link.productId, link.id)
        }
    }

    fun resetWithDemoData() {
        viewModelScope.launch {
            repository.clearAllData()
            val initialCategoryId = repository.seedDemoDataIfEmpty()
            selection.value = SelectionState(selectedCategoryId = initialCategoryId)
        }
    }
}

class ShoppingViewModelFactory(
    private val repository: ShoppingDataSource
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ShoppingViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ShoppingViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
    }
}
