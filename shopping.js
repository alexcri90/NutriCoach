// shopping.js

document.addEventListener('DOMContentLoaded', function() {
    const mealsList = document.getElementById('meals-list');
    const shoppingItems = document.getElementById('shopping-items');
    const clearButton = document.getElementById('clear-list');

    // Load and display shopping list
    function loadShoppingList() {
        // Clear existing content
        mealsList.innerHTML = '';
        shoppingItems.innerHTML = '';

        // Load data from localStorage
        const savedMeals = JSON.parse(localStorage.getItem('shoppingListMeals')) || [];
        const savedItems = JSON.parse(localStorage.getItem('shoppingList')) || [];

        // Display meals
        savedMeals.forEach(meal => {
            const li = document.createElement('li');
            li.textContent = `${meal.name} (${meal.servings} porzioni)`;
            mealsList.appendChild(li);
        });

        // Display ingredients
        savedItems.forEach(item => {
            const li = document.createElement('li');
            const itemSpan = document.createElement('span');
            itemSpan.textContent = item;
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '×';
            deleteButton.className = 'delete-item';
            deleteButton.onclick = () => removeItem(item);

            li.appendChild(itemSpan);
            li.appendChild(deleteButton);
            shoppingItems.appendChild(li);
        });

        // Show/hide clear button
        clearButton.style.display = savedItems.length > 0 ? 'block' : 'none';
    }

    // Remove individual item
    function removeItem(item) {
        let items = JSON.parse(localStorage.getItem('shoppingList')) || [];
        items = items.filter(i => i !== item);
        localStorage.setItem('shoppingList', JSON.stringify(items));
        loadShoppingList();
    }

    // Clear entire shopping list
    clearButton.addEventListener('click', function() {
        if (confirm('Sei sicuro di voler svuotare la lista della spesa?')) {
            localStorage.removeItem('shoppingList');
            localStorage.removeItem('shoppingListMeals');
            loadShoppingList();
        }
    });

    // Initial load
    loadShoppingList();
});