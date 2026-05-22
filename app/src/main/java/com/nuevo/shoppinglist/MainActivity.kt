package com.nuevo.shoppinglist

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.lifecycle.viewmodel.compose.viewModel
import com.nuevo.shoppinglist.data.AppDatabase
import com.nuevo.shoppinglist.data.ShoppingRepository
import com.nuevo.shoppinglist.ui.ShoppingApp
import com.nuevo.shoppinglist.ui.ShoppingViewModel
import com.nuevo.shoppinglist.ui.ShoppingViewModelFactory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val database = AppDatabase.getInstance(applicationContext)
        val repository = ShoppingRepository(database.shoppingDao())

        setContent {
            val viewModel: ShoppingViewModel = viewModel(
                factory = ShoppingViewModelFactory(repository)
            )
            ShoppingApp(viewModel = viewModel)
        }
    }
}
