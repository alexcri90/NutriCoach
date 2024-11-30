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

// Show Meal Details in Modal
function showMealDetails(meal) {
    console.log('Showing details for meal:', meal.mealName);
    mealName.textContent = meal.mealName;
    mealDescription.textContent = meal.description;
    mealPortion.textContent = `Porzione: ${meal.portionSize}`; // Set Portion Size

    // Clear previous ingredients and nutrition
    mealIngredients.innerHTML = '';
    mealNutrition.innerHTML = '';

    // Populate ingredients
    meal.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        mealIngredients.appendChild(li);
    });

    // Populate nutrition
    for (const [key, value] of Object.entries(meal.nutrition)) {
        const li = document.createElement('li');
        li.textContent = `${capitalizeFirstLetter(key)}: ${value}`;
        mealNutrition.appendChild(li);
    }

    // Display modal
    modal.style.display = 'block';
}

// Close Modal
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// Helper Function to Capitalize First Letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}