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

    function adjustIngredientQuantity(ingredient, servings) {
        // Special case for eggs and other countable items
        const eggsRegex = /^(\d+)\s+(uova|uovo|egg[is]?)(\s+.+)?$/i;
        const eggMatch = ingredient.match(eggsRegex);
        if (eggMatch) {
            const quantity = parseInt(eggMatch[1]) * servings;
            const item = quantity === 1 ? 'uovo' : 'uova';
            const rest = eggMatch[3] || '';
            return `${quantity} ${item}${rest}`;
        }
    
        // Handle Italian measurement terms with proper spacing
        const italianUnitsRegex = /^(\d+(?:\.\d+)?)\s*(cucchiaino|cucchiaini|cucchiaio|cucchiai)\s+(.+)$/i;
        const italianMatch = ingredient.match(italianUnitsRegex);
        if (italianMatch) {
            const quantity = parseFloat(italianMatch[1]) * servings;
            let unit = italianMatch[2].toLowerCase();
            
            // Handle pluralization of common Italian measurements
            if (quantity > 1) {
                if (unit === 'cucchiaino') unit = 'cucchiaini';
                if (unit === 'cucchiaio') unit = 'cucchiai';
            } else {
                if (unit === 'cucchiaini') unit = 'cucchiaino';
                if (unit === 'cucchiai') unit = 'cucchiaio';
            }
            
            return `${quantity} ${unit} ${italianMatch[3]}`;
        }
    
        // Standard measurements (g, ml, etc.)
        const standardRegex = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(.+)$/;
        const match = ingredient.match(standardRegex);
        if (match) {
            const quantity = parseFloat(match[1]) * servings;
            return `${quantity} ${match[2]} ${match[3]}`;
        }
        
        // If no pattern matches, return the original ingredient
        return ingredient;
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