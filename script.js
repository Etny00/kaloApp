// JavaScript for interactive elements

// Initial values
let consumedCalories = 1240; // Updated value
let calorieGoal = 2000; // Can now be changed
let waterConsumed = 1.5; // in liters
let waterGoal = 2.5; // in liters, can now be changed
const glassSize = 0.25; // Size of a water glass in liters (assumption)

// Product data
let products = []; // This will hold the loaded products from base_products.json

// Pagination variables
let currentPage = 1;
let itemsPerPage = 25; // Default items per page

// Calendar and Daily Summary Variables
let currentCalendarDate = new Date(); // Tracks the month/year currently displayed in the calendar
let selectedCalendarDate = new Date(); // Tracks the specific day selected in the calendar

// Mock data for daily food entries (Key:YYYY-MM-DD, Value: Array of food objects)
// Added unique IDs for easier manipulation and mealType
const dailyFoodEntries = {
    '2025-05-03': [
        { id: 'f1', name: 'Haferflocken', kcal: 250, carbs: 40, protein: 10, fat: 5, portion: 100, mealType: 'Frühstück' },
        { id: 'f2', name: 'Hähnchen mit Reis', kcal: 600, carbs: 60, protein: 40, fat: 20, portion: 300, mealType: 'Mittagessen' },
        { id: 'f3', name: 'Proteinriegel', kcal: 150, carbs: 15, protein: 20, fat: 3, portion: 50, mealType: 'Snacks' }
    ],
    '2025-05-26': [ // Today's mock data
        { id: 'f4', name: 'Apfel', kcal: 95, carbs: 25, protein: 1, fat: 0, portion: 150, mealType: 'Snacks' },
        { id: 'f5', name: 'Brot mit Käse', kcal: 300, carbs: 30, protein: 15, fat: 12, portion: 120, mealType: 'Frühstück' },
        { id: 'f6', name: 'Joghurt', kcal: 120, carbs: 10, protein: 10, fat: 5, portion: 180, mealType: 'Frühstück' }
    ],
    '2025-05-10': [
        { id: 'f7', name: 'Pizza', kcal: 800, carbs: 90, protein: 35, fat: 38, portion: 400, mealType: 'Abendessen' },
        { id: 'f8', name: 'Cola', kcal: 150, carbs: 38, protein: 0, fat: 0, portion: 330, mealType: 'Snacks' }
    ],
    '2025-06-01': [
        { id: 'f9', name: 'Salat', kcal: 180, carbs: 15, protein: 5, fat: 10, portion: 250, mealType: 'Mittagessen' }
    ]
};

// DOM elements
const consumedCaloriesDisplay = document.getElementById('consumedCalories');
const waterAmountDisplay = document.getElementById('waterAmount');
const waterGlassesContainer = document.getElementById('waterGlassesContainer');
const addButtons = document.querySelectorAll('.add-button'); // All "Add" buttons (on Today page)
const navItems = document.querySelectorAll('.nav-item'); // All navigation items
const pageContents = document.querySelectorAll('.page-content'); // All page contents
const pageTitle = document.getElementById('pageTitle'); // Dynamic page title
const overviewCalorieGoalDisplay = document.getElementById('calorieGoal'); // Element for calorie goal on the overview page

// BMI Calculator elements
let calculateBmiButton;
let heightInput;
let weightInput;
let ageInput;
let genderInputs;
let activityLevelSelect;
let goalSelect;
let bmiResultDiv;
let bmiCategoryDiv;
let calorieRecommendationDiv;

// Settings elements
let newCalorieGoalInput;
let newWaterGoalInput;
let saveSettingsButton;

// Meals Page elements
let productNameInput;
let productKcalInput;
let productPortionInput;
let productCarbsInput; // New
let productProteinInput; // New
let productFatInput; // New
let saveProductButton;
let productSearchInput;
let productCountDisplay;
let productTableBody;
let exportCsvButton;
let importCsvButton;

// Pagination elements (new)
let prevPageButton;
let nextPageButton;
let paginationInfo;
let itemsPerPageSelect;

// Overview Page elements (new)
let prevMonthButton;
let nextMonthButton;
let currentMonthDisplay;
let calendarGrid;
let dailySummaryDate;
let dailyConsumedCaloriesDisplay;
let dailyRemainingCaloriesDisplay;
let dailyCarbsArc; // New
let dailyProteinArc; // New
let dailyFatArc; // New
let consumedFoodList;

// Food Detail Modal elements (for Overview page)
let foodDetailModal;
let closeModalButton;
let modalFoodNameDisplay;
let modalKcalInput;
let modalCarbsInput;
let modalProteinInput;
let modalFatInput;
let modalPortionInput; // New: Added for portion size in food detail modal
let saveFoodEntryButton;
let deleteFoodEntryButton;

let currentEditingFoodEntry = null; // Stores the food entry being edited
let currentEditingDateKey = null; // Stores the date key of the food entry being edited

// Product Detail Modal elements (for Meals page)
let productDetailModal;
let closeProductModalButton;
let modalProductNameDisplay;
let modalProductKcalInput;
let modalProductCarbsInput;
let modalProductProteinInput;
let modalProductFatInput;
let modalProductPortionInput;
let saveProductEntryButton;
let deleteProductEntryButton;

let currentEditingProduct = null; // Stores the product being edited from the Meals page


/**
 * Shows the specified page and hides all others.
 * @param {string} pageId - The ID of the page to display (e.g., 'today-page').
 */
function showPage(pageId) {
    pageContents.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');

    // Update the page title based on the active page
    switch (pageId) {
        case 'today-page':
            pageTitle.textContent = 'Heute';
            // Ensure the calorie goal on the overview page is updated
            overviewCalorieGoalDisplay.textContent = `Ziel ${calorieGoal} kcal`;
            break;
        case 'profile-page':
            pageTitle.textContent = 'Profil';
            initializeBmiCalculator(); // Initialize BMI calculator elements and event listeners
            break;
        case 'meals-page':
            pageTitle.textContent = 'Mahlzeiten – Verwaltung eigener Lebensmittelprodukte';
            initializeMealsPage(); // Initialize Meals page elements and logic
            break;
        case 'overview-page':
            pageTitle.textContent = 'Übersicht';
            initializeOverviewPage(); // Initialize Overview page elements and logic
            break;
        case 'settings-page':
            pageTitle.textContent = 'Einstellungen';
            initializeSettings(); // Initialize settings elements and event listeners
            break;
        default:
            pageTitle.textContent = 'App';
    }
}

/**
 * Initialisiert die Elemente und Event-Listener für den BMI-Rechner.
 * Wird aufgerufen, wenn die Profilseite angezeigt wird.
 */
function initializeBmiCalculator() {
    if (!calculateBmiButton) { // Initialize only once
        calculateBmiButton = document.getElementById('calculateBmi');
        heightInput = document.getElementById('height');
        weightInput = document.getElementById('weight');
        ageInput = document.getElementById('age');
        genderInputs = document.querySelectorAll('input[name="gender"]');
        activityLevelSelect = document.getElementById('activityLevel');
        goalSelect = document.getElementById('goal');
        bmiResultDiv = document.getElementById('bmiResult');
        bmiCategoryDiv = document.getElementById('bmiCategory');
        calorieRecommendationDiv = document.getElementById('calorieRecommendation');

        if (calculateBmiButton) {
            calculateBmiButton.addEventListener('click', () => {
                const heightCm = parseFloat(heightInput.value);
                const weightKg = parseFloat(weightInput.value);
                const ageYears = parseInt(ageInput.value);
                let gender = '';
                genderInputs.forEach(radio => {
                    if (radio.checked) {
                        gender = radio.value;
                    }
                });
                const activityLevel = parseFloat(activityLevelSelect.value);
                const goal = goalSelect.value;

                if (isNaN(heightCm) || isNaN(weightKg) || isNaN(ageYears) || heightCm <= 0 || weightKg <= 0 || ageYears <= 0 || gender === '') {
                    const messageBox = document.createElement('div');
                    messageBox.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background-color: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        z-index: 1000;
                        text-align: center;
                    `;
                    messageBox.innerHTML = `
                        <p>Bitte alle Felder korrekt ausfüllen.</p>
                        <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
                    `;
                    document.body.appendChild(messageBox);
                    bmiResultDiv.textContent = '';
                    bmiCategoryDiv.textContent = '';
                    calorieRecommendationDiv.textContent = '';
                    return;
                }

                const heightM = heightCm / 100;
                const bmi = weightKg / (heightM * heightM);
                let category = '';

                if (bmi < 18.5) {
                    category = 'Untergewicht';
                } else if (bmi >= 18.5 && bmi < 24.9) {
                    category = 'Normalgewicht';
                } else if (bmi >= 25 && bmi < 29.9) {
                    category = 'Übergewicht';
                } else {
                    category = 'Fettleibigkeit';
                }

                let bmr;
                if (gender === 'male') {
                    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
                } else {
                    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;
                }

                let tdee = bmr * activityLevel;

                let recommendedCalories = tdee;
                let recommendationText = `Dein geschätzter täglicher Kalorienbedarf zum Halten des Gewichts: ${tdee.toFixed(0)} kcal.`;

                if (goal === 'lose') {
                    recommendedCalories = tdee - 500;
                    recommendationText = `Zum Abnehmen wird ein Ziel von ca. ${recommendedCalories.toFixed(0)} kcal pro Tag empfohlen.`;
                } else if (goal === 'gain') {
                    recommendedCalories = tdee + 500;
                    recommendationText = `Zum Zunehmen wird ein Ziel von ca. ${recommendedCalories.toFixed(0)} kcal pro Tag empfohlen.`;
                }

                bmiResultDiv.textContent = `Dein BMI: ${bmi.toFixed(2)}`;
                bmiCategoryDiv.textContent = `Kategorie: ${category}`;
                calorieRecommendationDiv.textContent = recommendationText;
            });
        }
    }
}

/**
 * Initialisiert die Elemente und Event-Listener für die Einstellungen.
 * Wird aufgerufen, wenn die Einstellungsseite angezeigt wird.
 */
function initializeSettings() {
    if (!saveSettingsButton) { // Only initialize once
        newCalorieGoalInput = document.getElementById('newCalorieGoalInput');
        newWaterGoalInput = document.getElementById('newWaterGoalInput');
        saveSettingsButton = document.getElementById('saveSettingsButton');

        if (saveSettingsButton) {
            saveSettingsButton.addEventListener('click', () => {
                const newCalorieGoal = parseInt(newCalorieGoalInput.value);
                const newWaterGoal = parseFloat(newWaterGoalInput.value);

                let settingsChanged = false;

                if (!isNaN(newCalorieGoal) && newCalorieGoal > 0) {
                    calorieGoal = newCalorieGoal;
                    overviewCalorieGoalDisplay.textContent = `Ziel ${calorieGoal} kcal`; // Update display on overview page
                    settingsChanged = true;
                } else {
                    const messageBox = document.createElement('div');
                    messageBox.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background-color: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        z-index: 1000;
                        text-align: center;
                    `;
                    messageBox.innerHTML = `
                        <p>Bitte geben Sie ein gültiges Kalorienziel ein.</p>
                        <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
                    `;
                    document.body.appendChild(messageBox);
                }

                if (!isNaN(newWaterGoal) && newWaterGoal > 0) {
                    waterGoal = newWaterGoal;
                    updateWaterDisplay(); // Updates the water display on the overview page
                    settingsChanged = true;
                } else {
                    const messageBox = document.createElement('div');
                    messageBox.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background-color: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        z-index: 1000;
                        text-align: center;
                    `;
                    messageBox.innerHTML = `
                        <p>Bitte geben Sie ein gültiges Wasserziel ein.</p>
                        <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
                    `;
                    document.body.appendChild(messageBox);
                }

                if (settingsChanged) {
                    const messageBox = document.createElement('div');
                    messageBox.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background-color: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        z-index: 1000;
                        text-align: center;
                    `;
                    messageBox.innerHTML = `
                        <p>Einstellungen gespeichert!</p>
                        <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
                    `;
                    document.body.appendChild(messageBox);
                }
            });
        }
    }
    // Set the current values in the input fields when the page is loaded
    if (newCalorieGoalInput) newCalorieGoalInput.value = calorieGoal;
    if (newWaterGoalInput) newWaterGoalInput.value = waterGoal;
}

/**
 * Creates a span element with a colored circle and text.
 * @param {string|number} value - The text value to display.
 * @param {string} colorClass - The Tailwind CSS class for the background color of the circle.
 * @param {string} unit - The unit to display after the value (e.g., 'kcal', 'g').
 * @returns {HTMLSpanElement} The created span element.
 */
function createValueSpan(value, colorClass, unit = '') {
    const span = document.createElement('span');
    span.classList.add('flex', 'items-center', 'whitespace-nowrap'); // Added whitespace-nowrap to keep content on one line
    span.innerHTML = `<span class="w-2.5 h-2.5 rounded-full ${colorClass} mr-1"></span> ${value}${unit}`;
    return span;
}

/**
 * Initialisiert die Elemente der Mahlzeiten-Seite und lädt Produktdaten.
 */
async function initializeMealsPage() {
    console.log('initializeMealsPage called'); // Log to confirm function call
    // Only initialize elements if they haven't been already
    if (!productNameInput) {
        productNameInput = document.getElementById('productNameInput');
        productKcalInput = document.getElementById('productKcalInput');
        productCarbsInput = document.getElementById('productCarbsInput'); // New
        productProteinInput = document.getElementById('productProteinInput'); // New
        productFatInput = document.getElementById('productFatInput'); // New
        productPortionInput = document.getElementById('productPortionInput');
        saveProductButton = document.getElementById('saveProductButton');
        productSearchInput = document.getElementById('productSearchInput');
        productCountDisplay = document.getElementById('productCountDisplay');
        productTableBody = document.getElementById('productTableBody'); // This line gets the tbody element
        console.log('productTableBody element:', productTableBody); // Check if it's found

        exportCsvButton = document.getElementById('exportCsvButton');
        importCsvButton = document.getElementById('importCsvButton');
        prevPageButton = document.getElementById('prevPageButton'); // New
        nextPageButton = document.getElementById('nextPageButton'); // New
        paginationInfo = document.getElementById('paginationInfo'); // New
        itemsPerPageSelect = document.getElementById('itemsPerPageSelect'); // New

        // Product Detail Modal elements initialization
        productDetailModal = document.getElementById('productDetailModal');
        closeProductModalButton = document.getElementById('closeProductModalButton');
        modalProductNameDisplay = document.getElementById('modalProductNameDisplay');
        modalProductKcalInput = document.getElementById('modalProductKcalInput');
        modalProductCarbsInput = document.getElementById('modalProductCarbsInput');
        modalProductProteinInput = document.getElementById('modalProductProteinInput');
        modalProductFatInput = document.getElementById('modalProductFatInput');
        modalProductPortionInput = document.getElementById('modalProductPortionInput');
        saveProductEntryButton = document.getElementById('saveProductEntryButton');
        deleteProductEntryButton = document.getElementById('deleteProductEntryButton');

        // Load products from JSON
        try {
            console.log('Attempting to fetch base_products.json'); // Log before fetch
            const response = await fetch('base_products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            const data = await response.json();
            products = data.map(product => ({
                ...product,
                id: product.Produktname.toLowerCase().replace(/\s/g, '-') + '-' + Math.random().toString(36).substr(2, 9) // Add unique ID
            }));
            console.log('Products loaded successfully:', products.length); // Log success
            renderProductTable();
        } catch (error) {
            console.error('Error loading products:', error);
            const messageBox = document.createElement('div');
            messageBox.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                text-align: center;
            `;
            messageBox.innerHTML = `
                <p>Fehler beim Laden der Produkte: ${error.message}.</p>
                <p>Stellen Sie sicher, dass 'base_products.json' im selben Ordner wie 'index.html' liegt und der lokale Server läuft.</p>
                <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
            `;
            document.body.appendChild(messageBox);
        }

        // Event Listeners for Meals Page
        if (saveProductButton) {
            saveProductButton.addEventListener('click', saveProduct);
        }
        if (productSearchInput) {
            productSearchInput.addEventListener('input', () => {
                currentPage = 1; // Reset to first page on search
                renderProductTable();
            });
        }
        if (exportCsvButton) {
            exportCsvButton.addEventListener('click', exportProductsAsCsv);
        }
        if (importCsvButton) {
            importCsvButton.addEventListener('click', importProductsFromCsv);
        }
        // Pagination Event Listeners (new)
        if (prevPageButton) {
            prevPageButton.addEventListener('click', prevPage);
        }
        if (nextPageButton) {
            nextPageButton.addEventListener('click', nextPage);
        }
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', changeItemsPerPage);
        }

        // Event listeners for product modal buttons
        closeProductModalButton.addEventListener('click', closeProductDetailModal);
        saveProductEntryButton.addEventListener('click', saveEditedProduct);
        deleteProductEntryButton.addEventListener('click', deleteProductFromModal);

    } else {
        // If already initialized, just re-render the table in case data changed
        console.log('Meals page already initialized, re-rendering table.');
        renderProductTable();
    }
}

/**
 * Renders the product table based on the current products array, search filter, and pagination.
 */
function renderProductTable() {
    if (!productTableBody) {
        console.error('Error: productTableBody element not found during render. Check HTML ID.');
        return; // Ensure productTableBody is available
    }

    productTableBody.innerHTML = ''; // Clear existing table rows
    const searchTerm = productSearchInput ? productSearchInput.value.toLowerCase() : '';
    const filteredProducts = products.filter(product =>
        product.Produktname.toLowerCase().includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Ensure currentPage is valid
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    } else if (totalPages === 0) {
        currentPage = 0;
    }
    if (currentPage === 0 && filteredProducts.length > 0) { // If no items, but there are items, default to page 1
        currentPage = 1;
    }


    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToDisplay = filteredProducts.slice(startIndex, endIndex);

    console.log('Products to display in table:', productsToDisplay.length); // Log how many products are being sent for rendering

    productsToDisplay.forEach((product, index) => {
        const row = productTableBody.insertRow();
        row.classList.add(index % 2 === 0 ? 'bg-white' : 'bg-gray-50'); // Alternating row colors

        const cell = row.insertCell();
        cell.classList.add('product-table-cell-content'); // Add a class for styling the content within the cell

        const nameSpan = document.createElement('span');
        nameSpan.textContent = product.Produktname;
        nameSpan.classList.add('cursor-pointer', 'font-bold', 'text-[#8395AF]', 'hover:text-[#9FB8DF]');
        nameSpan.addEventListener('click', () => openProductDetailModal(product));
        cell.appendChild(nameSpan);

        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('product-details-container'); // Add a class for styling the details container

        detailsDiv.appendChild(createValueSpan(product['kcal/100g'], 'bg-gray-200', ' kcal'));
        detailsDiv.appendChild(createValueSpan(product['Kohlenhydrate (g)'] || 0, 'legend-color-blue', 'g'));
        detailsDiv.appendChild(createValueSpan(product['Eiweiß (g)'] || 0, 'legend-color-green', 'g'));
        detailsDiv.appendChild(createValueSpan(product['Fett (g)'] || 0, 'legend-color-yellow', 'g'));
        if (product['Portionsgröße (g/ml)']) {
            detailsDiv.appendChild(createValueSpan(product['Portionsgröße (g/ml)'], 'bg-purple-300', 'g'));
        }

        cell.appendChild(detailsDiv);
    });

    // Update product count display
    if (productCountDisplay) {
        const displayedCount = productsToDisplay.length;
        const totalFilteredCount = filteredProducts.length;
        const totalProductsCount = products.length;

        if (totalFilteredCount === 0) {
            productCountDisplay.textContent = `Keine Produkte gefunden.`;
        } else {
            const startItem = startIndex + 1;
            const endItem = Math.min(endIndex, totalFilteredCount);
            productCountDisplay.textContent = `Produkte ${startItem}-${endItem} von ${totalFilteredCount} (insgesamt ${totalProductsCount})`;
        }
    }


    // Update pagination controls
    if (prevPageButton && nextPageButton && paginationInfo) {
        prevPageButton.disabled = currentPage <= 1;
        nextPageButton.disabled = currentPage >= totalPages;
        paginationInfo.textContent = `Seite ${currentPage} von ${totalPages > 0 ? totalPages : 1}`;
    }
}

/**
 * Navigates to the previous page in the product table.
 */
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderProductTable();
    }
}

/**
 * Navigates to the next page in the product table.
 */
function nextPage() {
    const searchTerm = productSearchInput ? productSearchInput.value.toLowerCase() : '';
    const filteredProducts = products.filter(product =>
        product.Produktname.toLowerCase().includes(searchTerm)
    );
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    if (currentPage < totalPages) {
        currentPage++;
        renderProductTable();
    }
}

/**
 * Changes the number of items displayed per page.
 */
function changeItemsPerPage() {
    itemsPerPage = parseInt(itemsPerPageSelect.value);
    currentPage = 1; // Reset to the first page when items per page changes
    renderProductTable();
}


/**
 * Saves a new product from the form inputs.
 */
function saveProduct() {
    const productName = productNameInput.value.trim();
    const kcal = productKcalInput.value.trim();
    const carbs = productCarbsInput.value.trim(); // New
    const protein = productProteinInput.value.trim(); // New
    const fat = productFatInput.value.trim(); // New
    const portion = productPortionInput.value.trim();

    if (productName && kcal && !isNaN(parseFloat(kcal)) && parseFloat(kcal) > 0) {
        const newProduct = {
            id: productName.toLowerCase().replace(/\s/g, '-') + '-' + Math.random().toString(36).substr(2, 9), // Generate unique ID
            "Produktname": productName,
            "kcal/100g": kcal,
            "Kohlenhydrate (g)": carbs || "0", // Use input or default to "0"
            "Eiweiß (g)": protein || "0",       // Use input or default to "0"
            "Fett (g)": fat || "0",             // Use input or default to "0"
            "Portionsgröße (g/ml)": portion || "N/A"
        };
        products.push(newProduct);
        currentPage = 1; // Go to first page to see the new product
        renderProductTable();
        productNameInput.value = '';
        productKcalInput.value = '';
        productCarbsInput.value = ''; // Clear new fields
        productProteinInput.value = ''; // Clear new fields
        productFatInput.value = ''; // Clear new fields
        productPortionInput.value = '';

        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
        messageBox.innerHTML = `
            <p>"${productName}" erfolgreich gespeichert!</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(messageBox);

    } else {
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
        messageBox.innerHTML = `
            <p>Bitte Produktname und gültige Kalorien pro 100g eingeben.</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(messageBox);
    }
}

/**
 * Placeholder for editing a product.
 * @param {object} product - The product object to edit.
 */
function editProduct(product) {
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        text-align: center;
    `;
    messageBox.innerHTML = `
        <p>Bearbeiten von "${product.Produktname}" (Funktion noch nicht implementiert)</p>
        <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
    `;
    document.body.appendChild(messageBox);
}

/**
 * Placeholder for deleting a product.
 * @param {object} product - The product object to delete.
 */
function deleteProduct(productToDelete) {
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        text-align: center;
    `;
    messageBox.innerHTML = `
        <p>Möchtest du "${productToDelete.Produktname}" wirklich löschen?</p>
        <button id="confirmDelete" style="margin-top: 10px; padding: 8px 15px; background-color: #EF4444; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Löschen</button>
        <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9CA3AF; color: white; border: none; border-radius: 5px; cursor: pointer;">Abbrechen</button>
    `;
    document.body.appendChild(messageBox);

    document.getElementById('confirmDelete').addEventListener('click', () => {
        products = products.filter(product => product !== productToDelete);
        currentPage = 1; // Reset to first page after deletion
        renderProductTable();
        messageBox.remove(); // Close the confirmation box
        const successMessageBox = document.createElement('div');
        successMessageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
        successMessageBox.innerHTML = `
            <p>"${productToDelete.Produktname}" wurde gelöscht.</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(successMessageBox);
    });
}

/**
 * Exports the current products as a CSV file.
 */
function exportProductsAsCsv() {
    const headers = ["Produktname", "kcal/100g", "Kohlenhydrate (g)", "Eiweiß (g)", "Fett (g)", "Portionsgröße (g/ml)"];
    const csvRows = [];
    csvRows.push(headers.map(h => `"${h}"`).join(';')); // Add headers and escape them

    for (const product of products) {
        const values = headers.map(header => {
            let value = product[header] !== undefined ? String(product[header]) : ''; // Handle undefined
            // Replace any double quotes with two double quotes, then wrap in double quotes
            return `"${value.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(';'));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'produkte.csv';
    link.click();

    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
    messageBox.innerHTML = `
            <p>Produkte als CSV exportiert!</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
    document.body.appendChild(messageBox);
}

/**
 * Placeholder for importing products from a CSV file.
 */
function importProductsFromCsv() {
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
    messageBox.innerHTML = `
            <p>CSV Import (Funktion noch nicht implementiert)</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
    document.body.appendChild(messageBox);
}


/**
 * Updates the display of the amount of water drunk.
 */
function updateWaterDisplay() {
    waterAmountDisplay.textContent = `${waterConsumed.toFixed(1)} L`;
    renderWaterGlasses(); // Re-render glasses to update fill level
}

/**
 * Creates and updates the water glasses based on the amount drunk.
 */
function renderWaterGlasses() {
    waterGlassesContainer.innerHTML = ''; // Remove existing glasses
    const numberOfGlasses = Math.ceil(waterGoal / glassSize); // Total number of glasses
    const filledGlasses = Math.floor(waterConsumed / glassSize); // Number of filled glasses

    for (let i = 0; i < numberOfGlasses; i++) {
        const glassDiv = document.createElement('div');
        glassDiv.classList.add('water-glass');
        // Fill the glass if it is within the filled amount
        if (i < filledGlasses) {
            glassDiv.classList.add('filled');
        }
        // Add the Font Awesome glass icon
        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-glass-water');
        glassDiv.appendChild(icon);

        // Click handler for each glass
        glassDiv.addEventListener('click', () => {
            // Add a glass when clicked
            waterConsumed = Math.min(waterGoal, waterConsumed + glassSize);
            updateWaterDisplay();
        });
        waterGlassesContainer.appendChild(glassDiv);
    }
}

// Event listener for the "Add" buttons (on Today page)
addButtons.forEach(button => {
    button.addEventListener('click', () => {
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
        messageBox.innerHTML = `
            <p>Hier würde ein Formular zum Hinzufügen von Produkten erscheinen.</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(messageBox);
    });
});

// Event listener for the navigation bar
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const pageId = item.dataset.page; // Use the data-page attribute
        if (pageId) {
            showPage(pageId);
        }
    });
});

/**
 * Initializes elements and event listeners for the Overview page.
 */
function initializeOverviewPage() {
    if (!prevMonthButton) { // Initialize only once
        prevMonthButton = document.getElementById('prevMonthButton');
        nextMonthButton = document.getElementById('nextMonthButton');
        currentMonthDisplay = document.getElementById('currentMonthDisplay');
        calendarGrid = document.getElementById('calendarGrid');
        dailySummaryDate = document.getElementById('dailySummaryDate');
        dailyConsumedCaloriesDisplay = document.getElementById('dailyConsumedCalories');
        dailyRemainingCaloriesDisplay = document.getElementById('dailyRemainingCalories');
        dailyCarbsArc = document.getElementById('dailyCarbsArc'); // New
        dailyProteinArc = document.getElementById('dailyProteinArc'); // New
        dailyFatArc = document.getElementById('dailyFatArc'); // New
        consumedFoodList = document.getElementById('consumedFoodList');

        // Food Detail Modal elements initialization
        foodDetailModal = document.getElementById('foodDetailModal');
        closeModalButton = document.getElementById('closeModalButton');
        modalFoodNameDisplay = document.getElementById('modalFoodNameDisplay');
        modalKcalInput = document.getElementById('modalKcalInput');
        modalCarbsInput = document.getElementById('modalCarbsInput');
        modalProteinInput = document.getElementById('modalProteinInput');
        modalFatInput = document.getElementById('modalFatInput');
        modalPortionInput = document.getElementById('modalPortionInput'); // New: Initialized
        saveFoodEntryButton = document.getElementById('saveFoodEntryButton');
        deleteFoodEntryButton = document.getElementById('deleteFoodEntryButton');

        // Event listeners for month navigation
        prevMonthButton.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar(currentCalendarDate);
        });
        nextMonthButton.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar(currentCalendarDate);
        });

        // Event listeners for modal buttons
        closeModalButton.addEventListener('click', closeFoodDetailModal);
        saveFoodEntryButton.addEventListener('click', () => saveEditedFoodEntry(currentEditingFoodEntry, currentEditingDateKey));
        deleteFoodEntryButton.addEventListener('click', () => deleteFoodEntry(currentEditingFoodEntry, currentEditingDateKey));
    }
    // Render calendar and update summary for the current view
    renderCalendar(currentCalendarDate);
    updateDailySummary(selectedCalendarDate);
}

/**
 * Renders the calendar grid for the given date.
 * @param {Date} date - The date object representing the month to display.
 */
function renderCalendar(date) {
    // Clear and re-add weekday headers
    calendarGrid.innerHTML = `
        <div class="font-semibold text-gray-500">Mo</div>
        <div class="font-semibold text-gray-500">Di</div>
        <div class="font-semibold text-gray-500">Mi</div>
        <div class="font-semibold text-gray-500">Do</div>
        <div class="font-semibold text-gray-500">Fr</div>
        <div class="font-semibold text-gray-500">Sa</div>
        <div class="font-semibold text-gray-500">So</div>
    `;

    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed

    // Set current month display
    currentMonthDisplay.textContent = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(date);

    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Get the day of the week for the first day (0 for Sunday, 1 for Monday, etc.)
    // Adjust to make Monday (1) map to 0-indexed grid position 0
    let startDay = firstDayOfMonth.getDay();
    if (startDay === 0) startDay = 7; // Sunday becomes 7
    startDay--; // Adjust to 0-indexed (Monday=0, Sunday=6)

    // Get the number of days in the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty divs for leading blank days
    for (let i = 0; i < startDay; i++) {
        const emptyDiv = document.createElement('div');
        calendarGrid.appendChild(emptyDiv);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = day;
        // Base styling for all day numbers (circular, centered)
        dayDiv.classList.add('cursor-pointer'); // Add cursor pointer always
        // The fixed width/height/aspect-ratio/border-radius are handled by #calendarGrid > div in CSS

        const currentDayDate = new Date(year, month, day);
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dayDiv.dataset.date = formattedDate; // Store date for easy access

        // Apply specific styles based on selection
        if (currentDayDate.toDateString() === selectedCalendarDate.toDateString()) {
            // This is the selected day
            dayDiv.classList.add('selected-day'); // CSS will handle background-color, color, font-weight
        } else {
            // This is a non-selected day
            dayDiv.classList.add('non-selected-day'); // New class for non-selected days
        }

        // Add event listener to select day
        dayDiv.addEventListener('click', () => {
            selectedCalendarDate = currentDayDate;
            renderCalendar(currentCalendarDate); // Re-render to update highlight
            updateDailySummary(selectedCalendarDate); // Update summary for selected day
        });

        calendarGrid.appendChild(dayDiv);
    }
}

/**
 * Updates the daily summary section based on the selected date.
 * @param {Date} date - The date object for which to display the summary.
 */
function updateDailySummary(date) {
    const formattedDateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const foodEntries = dailyFoodEntries[formattedDateKey] || [];

    // Calculate summary data dynamically from foodEntries for the selected day
    let totalKcal = 0;
    let totalCarbsKcal = 0;
    let totalProteinKcal = 0;
    let totalFatKcal = 0;

    foodEntries.forEach(entry => {
        totalKcal += entry.kcal || 0;
        // Assuming 1g Carbs = 4kcal, 1g Protein = 4kcal, 1g Fat = 9kcal
        totalCarbsKcal += (entry.carbs || 0) * 4;
        totalProteinKcal += (entry.protein || 0) * 4;
        totalFatKcal += (entry.fat || 0) * 9;
    });

    const summaryData = {
        carbsKcal: totalCarbsKcal,
        proteinKcal: totalProteinKcal,
        fatKcal: totalFatKcal,
        totalKcal: totalKcal
    };


    // Format date for display (e.g., "Samstag, 3. Mai 2025")
    dailySummaryDate.textContent = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);

    // Update consumed food list
    consumedFoodList.innerHTML = ''; // Clear previous list

    const mealTypes = ['Frühstück', 'Mittagessen', 'Abendessen', 'Snacks'];
    const groupedEntries = {};
    mealTypes.forEach(type => groupedEntries[type] = []);

    foodEntries.forEach(entry => {
        if (entry.mealType && groupedEntries[entry.mealType]) {
            groupedEntries[entry.mealType].push(entry);
        } else {
            // If mealType is not defined or unknown, put it in Snacks or a default category
            groupedEntries['Snacks'].push(entry);
        }
    });

    mealTypes.forEach(type => {
        const mealSectionDiv = document.createElement('div');
        mealSectionDiv.classList.add('mb-4'); // Add some margin below each meal section

        const mealHeading = document.createElement('h3');
        // Apply the new color and ensure font-semibold and mb-2 are kept for styling
        mealHeading.classList.add('font-semibold', 'text-base', 'mb-2', 'text-[#556985]');
        mealHeading.textContent = type;
        mealSectionDiv.appendChild(mealHeading);

        const mealList = document.createElement('ul');
        mealList.classList.add('list-inside', 'text-gray-700', 'space-y-2'); // Tailwind classes for list spacing

        if (groupedEntries[type].length > 0) {
            groupedEntries[type].forEach(entry => {
                const listItem = document.createElement('li');
                // Changed to flex-row and items-center for single line display
                listItem.classList.add('flex', 'flex-col', 'py-1', 'border-b', 'border-gray-200', 'last:border-b-0', 'md:flex-row', 'md:items-center', 'md:justify-between');

                const nameSpan = document.createElement('span');
                nameSpan.textContent = entry.name;
                nameSpan.classList.add('cursor-pointer', 'font-bold', 'text-[#8395AF]', 'hover:text-[#9FB8DF]');
                nameSpan.addEventListener('click', () => openFoodDetailModal(entry, formattedDateKey));
                listItem.appendChild(nameSpan);

                const detailsDiv = document.createElement('div');
                detailsDiv.classList.add('flex', 'flex-wrap', 'gap-x-4', 'gap-y-1', 'text-sm', 'text-gray-700', 'mt-1', 'md:mt-0', 'md:ml-auto'); // Added md:mt-0, md:ml-auto

                // Helper function to create detail spans without labels
                detailsDiv.appendChild(createValueSpan(entry.kcal, 'bg-gray-200', ' kcal'));
                detailsDiv.appendChild(createValueSpan(entry.carbs || 0, 'legend-color-blue', 'g'));
                detailsDiv.appendChild(createValueSpan(entry.protein || 0, 'legend-color-green', 'g'));
                detailsDiv.appendChild(createValueSpan(entry.fat || 0, 'legend-color-yellow', 'g'));
                if (entry.portion) {
                    detailsDiv.appendChild(createValueSpan(entry.portion, 'bg-purple-300', 'g')); // New color for portion
                }

                listItem.appendChild(detailsDiv);
                mealList.appendChild(listItem);
            });
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = 'Keine Einträge für diesen Tag';
            mealList.appendChild(listItem);
        }
        mealSectionDiv.appendChild(mealList);
        consumedFoodList.appendChild(mealSectionDiv);
    });


    // Update calorie displays
    dailyConsumedCaloriesDisplay.textContent = `${summaryData.totalKcal} kcal`;
    const remainingCalories = calorieGoal - summaryData.totalKcal;
    dailyRemainingCaloriesDisplay.textContent = `Ziel ${remainingCalories} kcal`;

    // Update the donut chart segments
    const circumference = 2 * Math.PI * 80; // 2 * PI * radius (radius is 80)

    // Calculate arc lengths based on calorieGoal
    // Ensure values do not exceed calorieGoal for percentage calculation
    const carbsKcalCapped = Math.min(summaryData.carbsKcal, calorieGoal);
    const proteinKcalCapped = Math.min(summaryData.proteinKcal, calorieGoal);
    const fatKcalCapped = Math.min(summaryData.fatKcal, calorieGoal);

    // Calculate percentage of each macro relative to the TOTAL CALORIE GOAL
    const carbsPercentageOfGoal = (carbsKcalCapped / calorieGoal);
    const proteinPercentageOfGoal = (proteinKcalCapped / calorieGoal);
    const fatPercentageOfGoal = (fatKcalCapped / calorieGoal);

    // Calculate dash lengths for each macro arc
    const carbsDash = carbsPercentageOfGoal * circumference;
    const proteinDash = proteinPercentageOfGoal * circumference;
    const fatDash = fatPercentageOfGoal * circumference;

    // Set stroke-dasharray and stroke-dashoffset for each arc
    // Order of drawing (z-index wise in SVG): Carbs first, then Protein, then Fat
    dailyCarbsArc.setAttribute('stroke-dasharray', `${carbsDash} ${circumference - carbsDash}`);
    dailyCarbsArc.setAttribute('stroke-dashoffset', '0'); // Starts at 0

    dailyProteinArc.setAttribute('stroke-dasharray', `${proteinDash} ${circumference - proteinDash}`);
    dailyProteinArc.setAttribute('stroke-dashoffset', `-${carbsDash}`); // Offset by carbs

    dailyFatArc.setAttribute('stroke-dasharray', `${fatDash} ${circumference - fatDash}`);
    dailyFatArc.setAttribute('stroke-dashoffset', `-${carbsDash + proteinDash}`); // Offset by carbs + protein

    // If total consumed is 0, reset arcs
    if (summaryData.totalKcal === 0) {
        dailyCarbsArc.setAttribute('stroke-dasharray', `0 ${circumference}`);
        dailyProteinArc.setAttribute('stroke-dasharray', `0 ${circumference}`);
        dailyFatArc.setAttribute('stroke-dasharray', `0 ${circumference}`);
    }
}

/**
 * Opens the food detail modal and populates it with the given food entry data.
 * @param {object} foodEntry - The food entry object to display/edit.
 * @param {string} dateKey - The date key (YYYY-MM-DD) of the food entry.
 */
function openFoodDetailModal(foodEntry, dateKey) {
    currentEditingFoodEntry = foodEntry;
    currentEditingDateKey = dateKey;

    modalFoodNameDisplay.textContent = foodEntry.name;
    modalKcalInput.value = foodEntry.kcal;
    modalCarbsInput.value = foodEntry.carbs || '';
    modalProteinInput.value = foodEntry.protein || '';
    modalFatInput.value = foodEntry.fat || '';
    modalPortionInput.value = foodEntry.portion || ''; // Populate portion input

    foodDetailModal.classList.remove('hidden');
}

/**
 * Closes the food detail modal.
 */
function closeFoodDetailModal() {
    foodDetailModal.classList.add('hidden');
    currentEditingFoodEntry = null;
    currentEditingDateKey = null;
}

/**
 * Saves the edited food entry.
 * @param {object} originalFoodEntry - The original food entry object.
 * @param {string} dateKey - The date key (YYYY-MM-DD) of the food entry.
 */
function saveEditedFoodEntry(originalFoodEntry, dateKey) {
    const updatedKcal = parseFloat(modalKcalInput.value);
    const updatedCarbs = parseFloat(modalCarbsInput.value) || 0;
    const updatedProtein = parseFloat(modalProteinInput.value) || 0;
    const updatedFat = parseFloat(modalFatInput.value) || 0;
    const updatedPortion = parseFloat(modalPortionInput.value) || 0; // Get updated portion

    if (isNaN(updatedKcal) || updatedKcal < 0) {
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
        messageBox.innerHTML = `
            <p>Bitte geben Sie einen gültigen Kalorienwert ein.</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(messageBox);
        return;
    }

    // Find the index of the original food entry
    const index = dailyFoodEntries[dateKey].findIndex(entry => entry.id === originalFoodEntry.id);

    if (index !== -1) {
        // Update the entry in the array
        dailyFoodEntries[dateKey][index].kcal = updatedKcal;
        dailyFoodEntries[dateKey][index].carbs = updatedCarbs;
        dailyFoodEntries[dateKey][index].protein = updatedProtein;
        dailyFoodEntries[dateKey][index].fat = updatedFat;
        dailyFoodEntries[dateKey][index].portion = updatedPortion; // Save updated portion

        // Re-render the calendar and update the summary to reflect changes
        renderCalendar(currentCalendarDate);
        updateDailySummary(selectedCalendarDate);
        closeFoodDetailModal();

        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
        messageBox.innerHTML = `
            <p>Eintrag erfolgreich gespeichert!</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(messageBox);

    } else {
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
        messageBox.innerHTML = `
            <p>Fehler: Eintrag nicht gefunden.</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(messageBox);
    }
}

/**
 * Deletes the specified food entry.
 * @param {object} foodEntryToDelete - The food entry object to delete.
 * @param {string} dateKey - The date key (YYYY-MM-DD) of the food entry.
 */
function deleteFoodEntry(foodEntryToDelete, dateKey) {
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        text-align: center;
    `;
    messageBox.innerHTML = `
        <p>Möchtest du "${foodEntryToDelete.name}" wirklich löschen?</p>
        <button id="confirmDeleteFood" style="margin-top: 10px; padding: 8px 15px; background-color: #EF4444; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Löschen</button>
        <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9CA3AF; color: white; border: none; border-radius: 5px; cursor: pointer;">Abbrechen</button>
    `;
    document.body.appendChild(messageBox);

    document.getElementById('confirmDeleteFood').addEventListener('click', () => {
        if (dailyFoodEntries[dateKey]) {
            dailyFoodEntries[dateKey] = dailyFoodEntries[dateKey].filter(entry => entry.id !== foodEntryToDelete.id);
        }
        // Re-render the calendar and update the summary to reflect changes
        renderCalendar(currentCalendarDate);
        updateDailySummary(selectedCalendarDate);
        closeFoodDetailModal(); // Close the detail modal
        messageBox.remove(); // Close the confirmation box

        const successMessageBox = document.createElement('div');
        successMessageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
        successMessageBox.innerHTML = `
            <p>"${foodEntryToDelete.name}" wurde gelöscht.</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(successMessageBox);
    });
}

/**
 * Opens the product detail modal and populates it with the given product data.
 * @param {object} product - The product object to display/edit.
 */
function openProductDetailModal(product) {
    currentEditingProduct = product;

    modalProductNameDisplay.textContent = product.Produktname;
    modalProductKcalInput.value = product['kcal/100g'];
    modalProductCarbsInput.value = product['Kohlenhydrate (g)'] || '';
    modalProductProteinInput.value = product['Eiweiß (g)'] || '';
    modalProductFatInput.value = product['Fett (g)'] || '';
    modalProductPortionInput.value = product['Portionsgröße (g/ml)'] || '';

    productDetailModal.classList.remove('hidden');
}

/**
 * Closes the product detail modal.
 */
function closeProductDetailModal() {
    productDetailModal.classList.add('hidden');
    currentEditingProduct = null;
}

/**
 * Saves the edited product.
 */
function saveEditedProduct() {
    if (!currentEditingProduct) return;

    const updatedKcal = parseFloat(modalProductKcalInput.value);
    const updatedCarbs = parseFloat(modalProductCarbsInput.value) || 0;
    const updatedProtein = parseFloat(modalProductProteinInput.value) || 0;
    const updatedFat = parseFloat(modalProductFatInput.value) || 0;
    const updatedPortion = modalProductPortionInput.value.trim();

    if (isNaN(updatedKcal) || updatedKcal < 0) {
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
        messageBox.innerHTML = `
            <p>Bitte geben Sie einen gültigen Kalorienwert ein.</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(messageBox);
        return;
    }

    // Find the index of the product in the main products array
    const index = products.findIndex(p => p.id === currentEditingProduct.id);

    if (index !== -1) {
        products[index]['kcal/100g'] = updatedKcal;
        products[index]['Kohlenhydrate (g)'] = updatedCarbs;
        products[index]['Eiweiß (g)'] = updatedProtein;
        products[index]['Fett (g)'] = updatedFat;
        products[index]['Portionsgröße (g/ml)'] = updatedPortion;

        renderProductTable(); // Re-render the table to reflect changes
        closeProductDetailModal();

        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
        messageBox.innerHTML = `
            <p>"${currentEditingProduct.Produktname}" erfolgreich gespeichert!</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(messageBox);
    } else {
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
        messageBox.innerHTML = `
            <p>Fehler: Produkt nicht gefunden.</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(messageBox);
    }
}

/**
 * Deletes the currently selected product from the modal.
 */
function deleteProductFromModal() {
    if (!currentEditingProduct) return;

    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        text-align: center;
    `;
    messageBox.innerHTML = `
        <p>Möchtest du "${currentEditingProduct.Produktname}" wirklich löschen?</p>
        <button id="confirmDeleteProduct" style="margin-top: 10px; padding: 8px 15px; background-color: #EF4444; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Löschen</button>
        <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9CA3AF; color: white; border: none; border-radius: 5px; cursor: pointer;">Abbrechen</button>
    `;
    document.body.appendChild(messageBox);

    document.getElementById('confirmDeleteProduct').addEventListener('click', () => {
        products = products.filter(p => p.id !== currentEditingProduct.id);
        currentPage = 1; // Reset to first page after deletion
        renderProductTable();
        closeProductDetailModal(); // Close the detail modal
        messageBox.remove(); // Close the confirmation box

        const successMessageBox = document.createElement('div');
        successMessageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            text-align: center;
        `;
        successMessageBox.innerHTML = `
            <p>"${currentEditingProduct.Produktname}" wurde gelöscht.</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(successMessageBox);
    });
}


// Initialization when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateWaterDisplay();
    // Show the "Today" page by default
    showPage('today-page');
});
