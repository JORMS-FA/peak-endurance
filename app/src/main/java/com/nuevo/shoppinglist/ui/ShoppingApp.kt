package com.nuevo.shoppinglist.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nuevo.shoppinglist.data.CategoryEntity
import com.nuevo.shoppinglist.data.ProductEntity
import com.nuevo.shoppinglist.data.ProductLinkEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShoppingApp(viewModel: ShoppingViewModel) {
    val categories by viewModel.categories.collectAsState()
    val products by viewModel.products.collectAsState()
    val links by viewModel.links.collectAsState()
    val selectedCategory = viewModel.selectedCategory(categories)
    val selectedProduct = viewModel.selectedProduct(products)

    Scaffold(
        topBar = { TopAppBar(title = { Text("Nuevo Shopping") }) }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                WelcomeSection(
                    selectedCategoryName = selectedCategory?.name,
                    selectedProductName = selectedProduct?.name,
                    onResetDemo = viewModel::resetWithDemoData
                )
            }
            item {
                CategorySection(
                    categories = categories,
                    selectedCategoryId = selectedCategory?.id,
                    onSelect = viewModel::selectCategory,
                    onAdd = viewModel::addCategory
                )
            }
            item {
                ProductSection(
                    products = products,
                    categorySelected = selectedCategory != null,
                    selectedProductId = selectedProduct?.id,
                    onSelect = viewModel::selectProduct,
                    onAdd = viewModel::addProduct,
                    onToggleBought = viewModel::toggleBought
                )
            }
            item {
                LinksSection(
                    links = links,
                    productSelected = selectedProduct != null,
                    onAdd = viewModel::addLink,
                    onSetPreferred = viewModel::setPreferredLink
                )
            }
        }
    }
}

@Composable
private fun WelcomeSection(
    selectedCategoryName: String?,
    selectedProductName: String?,
    onResetDemo: () -> Unit
) {
    SectionCard(title = "Prueba manual rápida") {
        Text("La app se abre con datos demo para que puedas probarla sin configurar nada.")
        Text("1. Toca una categoría. 2. Toca un producto. 3. Revisa o abre sus links.")
        Text("Categoría seleccionada: ${selectedCategoryName ?: "ninguna"}")
        Text("Producto seleccionado: ${selectedProductName ?: "ninguno"}")
        OutlinedButton(onClick = onResetDemo) {
            Text("Restaurar datos demo")
        }
    }
}

@Composable
private fun CategorySection(
    categories: List<CategoryEntity>,
    selectedCategoryId: Long?,
    onSelect: (Long) -> Unit,
    onAdd: (String) -> Unit
) {
    SectionCard(title = "Categorías") {
        var name by rememberSaveable { mutableStateOf("") }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Nueva categoría") },
                modifier = Modifier.weight(1f)
            )
            Button(onClick = {
                onAdd(name)
                name = ""
            }) {
                Text("Agregar")
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        categories.forEach { category ->
            val isSelected = category.id == selectedCategoryId
            Button(
                onClick = { onSelect(category.id) },
                modifier = Modifier.fillMaxWidth(),
                colors = if (isSelected) {
                    ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                } else {
                    ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
                }
            ) {
                Text(if (isSelected) "✓ ${category.name}" else category.name)
            }
        }
    }
}

@Composable
private fun ProductSection(
    products: List<ProductEntity>,
    categorySelected: Boolean,
    selectedProductId: Long?,
    onSelect: (Long) -> Unit,
    onAdd: (String, String) -> Unit,
    onToggleBought: (ProductEntity) -> Unit
) {
    SectionCard(title = "Productos") {
        var name by rememberSaveable { mutableStateOf("") }
        var notes by rememberSaveable { mutableStateOf("") }

        if (!categorySelected) {
            Text("Primero selecciona una categoría para empezar a agregar productos.")
        }

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Producto") },
            modifier = Modifier.fillMaxWidth(),
            enabled = categorySelected
        )
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Notas") },
            modifier = Modifier.fillMaxWidth(),
            enabled = categorySelected
        )
        Spacer(modifier = Modifier.height(8.dp))
        Button(
            onClick = {
                onAdd(name, notes)
                name = ""
                notes = ""
            },
            enabled = categorySelected
        ) {
            Text("Guardar producto")
        }

        Spacer(modifier = Modifier.height(8.dp))
        products.forEach { product ->
            val isSelected = product.id == selectedProductId
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onSelect(product.id) }
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(
                            text = if (isSelected) "✓ ${product.name}" else product.name,
                            fontWeight = FontWeight.Bold
                        )
                        if (product.notes.isNotBlank()) Text(product.notes)
                        Text(if (product.bought) "Estado: comprado" else "Estado: pendiente")
                    }
                    Checkbox(
                        checked = product.bought,
                        onCheckedChange = { onToggleBought(product) }
                    )
                }
            }
        }
    }
}

@Composable
private fun LinksSection(
    links: List<ProductLinkEntity>,
    productSelected: Boolean,
    onAdd: (String, String) -> Unit,
    onSetPreferred: (ProductLinkEntity) -> Unit
) {
    val uriHandler = LocalUriHandler.current

    SectionCard(title = "Links por producto") {
        var store by rememberSaveable { mutableStateOf("") }
        var url by rememberSaveable { mutableStateOf("") }

        if (!productSelected) {
            Text("Selecciona un producto para ver o agregar sus links de tiendas.")
        }

        OutlinedTextField(
            value = store,
            onValueChange = { store = it },
            label = { Text("Tienda") },
            modifier = Modifier.fillMaxWidth(),
            enabled = productSelected
        )
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = url,
            onValueChange = { url = it },
            label = { Text("URL") },
            modifier = Modifier.fillMaxWidth(),
            enabled = productSelected
        )
        Spacer(modifier = Modifier.height(8.dp))
        Button(
            onClick = {
                onAdd(store, url)
                store = ""
                url = ""
            },
            enabled = productSelected
        ) {
            Text("Agregar link")
        }
        Spacer(modifier = Modifier.height(8.dp))

        links.forEach { link ->
            val backgroundColor = if (link.isPreferred) {
                MaterialTheme.colorScheme.secondaryContainer
            } else {
                MaterialTheme.colorScheme.surfaceVariant
            }

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    Modifier
                        .fillMaxWidth()
                        .background(backgroundColor, RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Text(
                        text = if (link.isPreferred) "★ ${link.storeName}" else link.storeName,
                        fontWeight = FontWeight.Bold
                    )
                    Text(link.url)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { uriHandler.openUri(link.url) }) {
                            Text("Abrir link")
                        }
                        Button(onClick = { onSetPreferred(link) }) {
                            Text(if (link.isPreferred) "Preferido" else "Hacer preferido")
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
private fun SectionCard(
    title: String,
    content: @Composable () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(title, style = MaterialTheme.typography.titleMedium)
            content()
        }
    }
}
