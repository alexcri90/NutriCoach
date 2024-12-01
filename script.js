// script.js

// Global Variables
let mealData = {};
let currentWeekIndex = 0;
let weeksArray = [];

// DOM Elements
const mealPlanContainer = document.getElementById('meal-plan');
const prevWeekButton = document.getElementById('prev-week');
const nextWeekButton = document.getElementById('next-week');
const currentWeekDisplay = document.getElementById('current-week');

const modal = document.getElementById('meal-modal');
const closeButton = document.querySelector('.close-button');
const mealName = document.getElementById('meal-name');
const mealDescription = document.getElementById('meal-description');
const mealIngredients = document.getElementById('meal-ingredients');
const mealNutrition = document.getElementById('meal-nutrition');
const mealPortion = document.getElementById('meal-portion'); // New Element for Portion Size

// Fetch Meal Data from JSON
fetch('meals.json')
    .then(response => {
        console.log('Response Status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Meal Data Loaded:', data);
        mealData = data;
        // Convert weeks object to array
        weeksArray = Object.keys(mealData)
            .filter(key => key.startsWith('week'))
            .sort((a, b) => {
                const numA = parseInt(a.replace('week', ''));
                const numB = parseInt(b.replace('week', ''));
                return numA - numB;
            })
            .map(weekKey => {
                const weekNumber = parseInt(weekKey.replace('week', ''));
                const daysObj = mealData[weekKey];
                // Convert days object to array
                const daysArray = Object.keys(daysObj)
                    .filter(key => key.startsWith('day'))
                    .sort((a, b) => {
                        const numA = parseInt(a.replace('day', ''));
                        const numB = parseInt(b.replace('day', ''));
                        return numA - numB;
                    })
                    .map(dayKey => {
                        const dayNumber = parseInt(dayKey.replace('day', ''));
                        const mealsObj = daysObj[dayKey];
                        // Convert meals object to array
                        const mealsArray = Object.keys(mealsObj).map(mealType => {
                            return {
                                mealType: capitalizeFirstLetter(mealType),
                                ...mealsObj[mealType]
                            };
                        });
                        return {
                            dayNumber: dayNumber,
                            dayName: getDayName(dayNumber),
                            meals: mealsArray
                        };
                    });
                return {
                    weekNumber: weekNumber,
                    days: daysArray
                };
            });
        renderMealPlan();
        updateNavigationButtons();
    })
    .catch(error => {
        console.error('Error fetching meal data:', error);
        mealPlanContainer.innerHTML = '<p>Error loading meal data.</p>';
    });

// Function to get day name based on day number
function getDayName(dayNumber) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayNumber - 1] || `Day ${dayNumber}`;
}

// Render Meal Plan for the Current Week
function renderMealPlan() {
    console.log('Rendering Meal Plan for Week Index:', currentWeekIndex);
    // Clear existing content
    mealPlanContainer.innerHTML = '';

    // Check if week exists
    if (weeksArray.length === 0) {
        mealPlanContainer.innerHTML = '<p>No meal data available.</p>';
        return;
    }

    // Get current week data
    const week = weeksArray[currentWeekIndex];
    if (!week) {
        mealPlanContainer.innerHTML = '<p>Week data not found.</p>';
        return;
    }

    // Update current week display
    currentWeekDisplay.textContent = `Week ${week.weekNumber}`;
    updateNavigationButtons();
    console.log('Current Week Data:', week);

    // Iterate through days
    week.days.forEach(day => {
        console.log('Processing Day:', day.dayName);
        // Create day card
        const dayCard = document.createElement('div');
        dayCard.classList.add('day-card');

        // Day title
        const dayTitle = document.createElement('h3');
        dayTitle.textContent = day.dayName;
        dayCard.appendChild(dayTitle);

        // List meals
        day.meals.forEach(meal => {
            console.log('Adding Meal:', meal.mealName);
            const mealItem = document.createElement('div');
            mealItem.classList.add('meal-item');
            mealItem.textContent = `${meal.mealType}: ${meal.mealName}`;
            mealItem.addEventListener('click', () => showMealDetails(meal));
            dayCard.appendChild(mealItem);
        });

        // Append day card to meal plan container
        mealPlanContainer.appendChild(dayCard);
    });
}

// Navigation Buttons
prevWeekButton.addEventListener('click', () => {
    if (currentWeekIndex > 0) {
        currentWeekIndex--;
        renderMealPlan();
    }
});

nextWeekButton.addEventListener('click', () => {
    if (currentWeekIndex < weeksArray.length - 1) {
        currentWeekIndex++;
        renderMealPlan();
    }
});

let currentServings = 1;
let currentMeal = null;

// Show Meal Details in Modal
function showMealDetails(meal) {
    console.log('Showing details for meal:', meal.mealName);
    currentMeal = meal;
    currentServings = 1;
    updateMealDetails();

    // Hide shopping list link
    const shoppingListLink = document.querySelector('.shopping-list-link');
    if (shoppingListLink) {
        shoppingListLink.classList.add('hidden');
    }

    // Display modal
    modal.style.display = 'block';

    // Add shopping cart button if it doesn't exist
    let cartButton = document.querySelector('.add-to-cart-button');
    if (!cartButton) {
        cartButton = document.createElement('button');
        cartButton.className = 'add-to-cart-button';
        cartButton.textContent = 'Invia alla lista spesa';
        document.querySelector('.modal-content').appendChild(cartButton);
    }

    // Update click handler
    cartButton.onclick = () => addToShoppingList(currentMeal, currentServings);
}

function updateMealDetails() {
    mealName.textContent = currentMeal.mealName;
    mealDescription.textContent = currentMeal.description;
    mealPortion.textContent = `Porzione: ${currentMeal.portionSize}`;
    document.getElementById('serving-count').textContent = currentServings;

    // Add image to modal
    const mealImageContainer = document.querySelector('.meal-image-container');
    if (currentMeal.image) {
        const mealImage = document.createElement('img');
        mealImage.id = 'meal-image';
        mealImage.src = currentMeal.image;
        mealImageContainer.innerHTML = ''; // Clear previous image
        mealImageContainer.appendChild(mealImage);
        mealImageContainer.style.display = 'block';
    } else {
        mealImageContainer.style.display = 'none';
    }

    // Clear previous ingredients and nutrition
    mealIngredients.innerHTML = '';
    mealNutrition.innerHTML = '';

    // Debug log
    console.log('Current servings:', currentServings);
    
    // Populate ingredients with adjusted quantities
    currentMeal.ingredients.forEach(ingredient => {
        console.log('Processing ingredient:', ingredient); // Debug log
        const adjustedIngredient = adjustIngredientQuantity(ingredient, currentServings);
        console.log('Adjusted ingredient:', adjustedIngredient); // Debug log
        const li = document.createElement('li');
        li.textContent = adjustedIngredient;
        mealIngredients.appendChild(li);
    });

    // Populate nutrition with adjusted values
    for (const [key, value] of Object.entries(currentMeal.nutrition)) {
        const li = document.createElement('li');
        li.textContent = `${capitalizeFirstLetter(key)}: ${(value * currentServings).toFixed(1)}`;
        mealNutrition.appendChild(li);
    }
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

function increaseServing() {
    currentServings++;
    updateMealDetails();
}

function decreaseServing() {
    if (currentServings > 1) {
        currentServings--;
        updateMealDetails();
    }
}

// Add event listeners for serving buttons
document.getElementById('increase-serving').addEventListener('click', increaseServing);
document.getElementById('decrease-serving').addEventListener('click', decreaseServing);

// Close Modal
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
    const shoppingListLink = document.querySelector('.shopping-list-link');
    if (shoppingListLink) {
        shoppingListLink.classList.remove('hidden');
    }
});

// Close modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
        const shoppingListLink = document.querySelector('.shopping-list-link');
        if (shoppingListLink) {
            shoppingListLink.classList.remove('hidden');
        }
    }
});

// Helper Function to Capitalize First Letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to parse ingredient string into quantity, unit, and item
function parseIngredient(ingredientStr) {
    const regex = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s(.+)$/;
    const match = ingredientStr.match(regex);
    
    if (match) {
        const [, quantity, unit, item] = match;
        return {
            quantity: parseFloat(quantity),
            unit,
            item: item.toLowerCase().trim()
        };
    }
    return null;
}

// Helper function to format ingredient object back to string
function formatIngredient(ingredient) {
    return `${ingredient.quantity}${ingredient.unit} ${ingredient.item}`;
}

// Updated addToShoppingList function
function addToShoppingList(meal, servings) {
    // Get existing shopping list
    let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
    let shoppingListMeals = JSON.parse(localStorage.getItem('shoppingListMeals')) || [];

    // Add or update meal in meals list
    const mealEntry = {
        name: meal.mealName,
        servings: servings
    };

    const existingMealIndex = shoppingListMeals.findIndex(m => m.name === meal.mealName);
    if (existingMealIndex !== -1) {
        shoppingListMeals[existingMealIndex].servings = servings;
    } else {
        shoppingListMeals.push(mealEntry);
    }

    // Process each ingredient
    meal.ingredients.forEach(ingredient => {
        const adjustedIngredient = adjustIngredientQuantity(ingredient, servings);
        const parsedNew = parseIngredient(adjustedIngredient);
        
        if (parsedNew) {
            // Look for matching ingredient in existing list
            let found = false;
            let updatedList = shoppingList.map(existingIngredient => {
                const parsedExisting = parseIngredient(existingIngredient);
                if (parsedExisting && 
                    parsedExisting.unit === parsedNew.unit && 
                    parsedExisting.item === parsedNew.item) {
                    // Merge quantities
                    found = true;
                    return formatIngredient({
                        quantity: parsedExisting.quantity + parsedNew.quantity,
                        unit: parsedExisting.unit,
                        item: parsedExisting.item
                    });
                }
                return existingIngredient;
            });

            // If ingredient wasn't found and merged, add it as new
            if (!found) {
                updatedList.push(adjustedIngredient);
            }
            
            shoppingList = updatedList;
        } else {
            // For ingredients that don't match the expected format
            if (!shoppingList.includes(adjustedIngredient)) {
                shoppingList.push(adjustedIngredient);
            }
        }
    });

    // Save updated lists to localStorage
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    localStorage.setItem('shoppingListMeals', JSON.stringify(shoppingListMeals));

    alert('Ingredienti aggiunti alla lista della spesa!');
}

// Helper function to adjust ingredient quantity (existing function)
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

// Add this function after the other function declarations
function updateNavigationButtons() {
    const hasMultipleWeeks = weeksArray.length > 1;
    const prevButton = document.querySelector('.controls button:first-child');
    const nextButton = document.querySelector('.controls button:last-child');
    
    if (prevButton && nextButton) {
        prevButton.style.display = hasMultipleWeeks ? 'block' : 'none';
        nextButton.style.display = hasMultipleWeeks ? 'block' : 'none';
    }
}