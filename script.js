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
let darkModeToggle; // Added for Dark Mode

// Meals Page elements
let productNameInput;
let productKcalInput;
let productPortionInput;
let productCarbsInput; 
let productProteinInput; 
let productFatInput; 
let saveProductButton;
let productSearchInput;
let productCountDisplay;
let productTableBody;
let exportCsvButton;
let importCsvButton;

// Pagination elements
let prevPageButton;
let nextPageButton;
let paginationInfo;
let itemsPerPageSelect;

// Overview Page elements
let prevMonthButton;
let nextMonthButton;
let currentMonthDisplay;
let calendarGrid;
let dailySummaryDate;
let dailyConsumedCaloriesDisplay;
let dailyRemainingCaloriesDisplay;
let dailyCarbsArc; 
let dailyProteinArc; 
let dailyFatArc; 
let consumedFoodList;

// Food Detail Modal elements (for Overview page)
let foodDetailModal;
let closeModalButton;
let modalFoodNameDisplay;
let modalKcalInput;
let modalCarbsInput;
let modalProteinInput;
let modalFatInput;
let modalPortionInput; 
let saveFoodEntryButton;
let deleteFoodEntryButton;

let currentEditingFoodEntry = null; 
let currentEditingDateKey = null; 

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

let currentEditingProduct = null; 

// Dark Mode Functions
function applyDarkMode(enable) {
    if (enable) {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) darkModeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        if (darkModeToggle) darkModeToggle.checked = false;
    }
}

// Function to save daily food entries to local storage
function saveDailyFoodEntriesToLocalStorage() {
    try {
        localStorage.setItem('userDailyFoodEntries', JSON.stringify(dailyFoodEntries));
    } catch (error) {
        console.error('Error saving daily food entries to local storage:', error);
    }
}

// Function to load daily food entries from local storage
function loadDailyFoodEntriesFromLocalStorage() {
    const storedEntries = localStorage.getItem('userDailyFoodEntries');
    if (storedEntries) {
        try {
            const parsedEntries = JSON.parse(storedEntries);
            if (parsedEntries && typeof parsedEntries === 'object') {
                // Clear existing mock data from the global object
                Object.keys(dailyFoodEntries).forEach(key => delete dailyFoodEntries[key]);
                // Assign loaded entries to the global object
                Object.assign(dailyFoodEntries, parsedEntries);
                console.log('Daily food entries loaded from local storage.');
            } else {
                // Handles null from JSON.parse or non-object data
                console.warn('Stored daily food entries format is invalid or null. Using predefined mock data and saving it.');
                saveDailyFoodEntriesToLocalStorage(); // Persist current mock data
            }
        } catch (error) {
            console.error('Error parsing daily food entries from local storage:', error);
            // If parsing fails, use predefined mock data and save it
            saveDailyFoodEntriesToLocalStorage(); // Persist current mock data
        }
    } else {
        // No data in local storage, use predefined mock data and save it
        console.log('No daily food entries in local storage. Using predefined mock data and saving it.');
        saveDailyFoodEntriesToLocalStorage(); // Persist current mock data
    }
}

function saveDarkModePreference(enable) {
    localStorage.setItem('darkModeEnabled', enable);
}

function loadDarkModePreference() {
    const preference = localStorage.getItem('darkModeEnabled');
    if (preference === 'true') {
        applyDarkMode(true);
    } else {
        applyDarkMode(false); 
    }
}


/**
 * Shows the specified page and hides all others.
 * @param {string} pageId - The ID of the page to display (e.g., 'today-page').
 */
function showPage(pageId) {
    pageContents.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');

    switch (pageId) {
        case 'today-page':
            pageTitle.textContent = 'Heute';
            overviewCalorieGoalDisplay.textContent = `Ziel ${calorieGoal} kcal`;
            break;
        case 'profile-page':
            pageTitle.textContent = 'Profil';
            initializeBmiCalculator(); 
            break;
        case 'meals-page':
            pageTitle.textContent = 'Mahlzeiten – Verwaltung eigener Lebensmittelprodukte';
            initializeMealsPage(); 
            break;
        case 'overview-page':
            pageTitle.textContent = 'Übersicht';
            initializeOverviewPage(); 
            break;
        case 'settings-page':
            pageTitle.textContent = 'Einstellungen';
            initializeSettings(); 
            break;
        default:
            pageTitle.textContent = 'App';
    }
}

/**
 * Initialisiert die Elemente und Event-Listener für den BMI-Rechner.
 */
function initializeBmiCalculator() {
    if (!calculateBmiButton) { 
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

                if (bmi < 18.5) category = 'Untergewicht';
                else if (bmi < 24.9) category = 'Normalgewicht';
                else if (bmi < 29.9) category = 'Übergewicht';
                else category = 'Fettleibigkeit';

                let bmr;
                if (gender === 'male') bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
                else bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;

                let tdee = bmr * activityLevel;
                let recommendedCalories = tdee;

                if (goal === 'lose') recommendedCalories = tdee - 500;
                else if (goal === 'gain') recommendedCalories = tdee + 500;

                openBmiResultModal(bmi.toFixed(2), category, recommendedCalories.toFixed(0), goal);
            });
        }
    }
}

/**
 * Opens a modal to display BMI results and calorie recommendation.
 */
function openBmiResultModal(bmi, category, recommendedKcal, goal) {
    const existingModal = document.getElementById('bmiResultModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'bmiResultModal';
    modal.classList.add('modal-overlay'); 

    let goalText = '';
    if (goal === 'lose') goalText = 'Abnehmen';
    else if (goal === 'maintain') goalText = 'Halten';
    else if (goal === 'gain') goalText = 'Zunehmen';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">BMI & Kalorienempfehlung</h2>
                <button id="closeBmiModalButton" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div class="space-y-3 text-center">
                <p class="text-lg font-bold" style="font-size: 2rem; padding-top: 2rem;">Dein BMI: ${bmi}</p>
                <p class="text-base">Kategorie: ${category}</p>
                <p class="text-base font-semibold text-[#9FB8DF] mb-40">Zum ${goalText} wird ein Ziel von ca. ${recommendedKcal} kcal pro Tag empfohlen.</p>
            </div>
            <div class="flex justify-end space-x-4 mt-6">
                <button id="discardBmiButton" class="add-button px-4 py-2 bg-transparent text-red-500 border border-red-500 hover:bg-red-500 hover:text-white">Verwerfen</button>
                <button id="applyBmiButton" class="add-button px-4 py-2">Übernehmen</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeBmiModalButton').addEventListener('click', () => modal.remove());
    document.getElementById('discardBmiButton').addEventListener('click', () => modal.remove());
    document.getElementById('applyBmiButton').addEventListener('click', () => {
        calorieGoal = parseInt(recommendedKcal);
        overviewCalorieGoalDisplay.textContent = `Ziel ${calorieGoal} kcal`; 
        
        const successMessageBox = document.createElement('div');
        successMessageBox.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background-color: white; padding: 20px; border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 1000; text-align: center;
        `;
        successMessageBox.innerHTML = `
            <p>Neues Kalorienziel (${calorieGoal} kcal) übernommen!</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(successMessageBox);
        modal.remove(); 
    });
}

/**
 * Initialisiert die Elemente und Event-Listener für die Einstellungen.
 */
function initializeSettings() {
    if (!newCalorieGoalInput) newCalorieGoalInput = document.getElementById('newCalorieGoalInput');
    if (!newWaterGoalInput) newWaterGoalInput = document.getElementById('newWaterGoalInput');
    if (!saveSettingsButton) saveSettingsButton = document.getElementById('saveSettingsButton');
    if (!darkModeToggle) darkModeToggle = document.getElementById('darkModeToggle');


    if (saveSettingsButton && !saveSettingsButton.hasAttribute('data-listener-attached')) {
        saveSettingsButton.addEventListener('click', () => {
            const newCalorieGoal = parseInt(newCalorieGoalInput.value);
            const newWaterGoal = parseFloat(newWaterGoalInput.value);
            let settingsChanged = false;

            if (!isNaN(newCalorieGoal) && newCalorieGoal > 0) {
                calorieGoal = newCalorieGoal;
                overviewCalorieGoalDisplay.textContent = `Ziel ${calorieGoal} kcal`;
                settingsChanged = true;
            } else if (newCalorieGoalInput.value.trim() !== '') {
                // Show error only if input was not empty but invalid
                alert("Bitte geben Sie ein gültiges Kalorienziel ein.");
            }

            if (!isNaN(newWaterGoal) && newWaterGoal > 0) {
                waterGoal = newWaterGoal;
                updateWaterDisplay();
                settingsChanged = true;
            } else if (newWaterGoalInput.value.trim() !== '') {
                 // Show error only if input was not empty but invalid
                alert("Bitte geben Sie ein gültiges Wasserziel ein.");
            }

            if (settingsChanged) {
                alert("Einstellungen gespeichert!");
            }
        });
        saveSettingsButton.setAttribute('data-listener-attached', 'true');
    }

    if (darkModeToggle && !darkModeToggle.hasAttribute('data-listener-attached')) {
        darkModeToggle.checked = document.body.classList.contains('dark-mode');
        darkModeToggle.addEventListener('change', () => {
            const isEnabled = darkModeToggle.checked;
            applyDarkMode(isEnabled);
            saveDarkModePreference(isEnabled);
        });
        darkModeToggle.setAttribute('data-listener-attached', 'true');
    }
    
    if (newCalorieGoalInput) newCalorieGoalInput.value = calorieGoal;
    if (newWaterGoalInput) newWaterGoalInput.value = waterGoal;
}


/**
 * Creates a span element with a colored circle and text.
 */
function createValueSpan(value, colorClass, unit = '') {
    const span = document.createElement('span');
    span.classList.add('flex', 'items-center', 'whitespace-nowrap'); 
    span.innerHTML = `<span class="w-2.5 h-2.5 rounded-full ${colorClass} mr-1"></span> ${value}${unit}`;
    return span;
}

/**
 * Initialisiert die Elemente der Mahlzeiten-Seite und lädt Produktdaten.
 */
async function initializeMealsPage() {
    if (!productNameInput) {
        productNameInput = document.getElementById('productNameInput');
        productKcalInput = document.getElementById('productKcalInput');
        productCarbsInput = document.getElementById('productCarbsInput'); 
        productProteinInput = document.getElementById('productProteinInput'); 
        productFatInput = document.getElementById('productFatInput'); 
        productPortionInput = document.getElementById('productPortionInput');
        saveProductButton = document.getElementById('saveProductButton');
        productSearchInput = document.getElementById('productSearchInput');
        productCountDisplay = document.getElementById('productCountDisplay');
        productTableBody = document.getElementById('productTableBody'); 
        
        exportCsvButton = document.getElementById('exportCsvButton');
        importCsvButton = document.getElementById('importCsvButton');
        prevPageButton = document.getElementById('prevPageButton'); 
        nextPageButton = document.getElementById('nextPageButton'); 
        paginationInfo = document.getElementById('paginationInfo'); 
        itemsPerPageSelect = document.getElementById('itemsPerPageSelect'); 

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

        // Load products from local storage or fallback to JSON
        await loadProductsFromLocalStorage(); 
        renderProductTable(); // Render the table with loaded products

        if (saveProductButton) saveProductButton.addEventListener('click', saveProduct);
        if (productSearchInput) productSearchInput.addEventListener('input', () => { currentPage = 1; renderProductTable(); });
        if (exportCsvButton) exportCsvButton.addEventListener('click', exportProductsAsCsv);
        if (importCsvButton) importCsvButton.addEventListener('click', importProductsFromCsv);
        if (prevPageButton) prevPageButton.addEventListener('click', prevPage);
        if (nextPageButton) nextPageButton.addEventListener('click', nextPage);
        if (itemsPerPageSelect) itemsPerPageSelect.addEventListener('change', changeItemsPerPage);

        closeProductModalButton.addEventListener('click', closeProductDetailModal);
        saveProductEntryButton.addEventListener('click', saveEditedProduct);
        deleteProductEntryButton.addEventListener('click', deleteProductFromModal);
    } else {
        renderProductTable();
    }
}

/**
 * Renders the product table.
 */
function renderProductTable() {
    if (!productTableBody) return;
    productTableBody.innerHTML = ''; 
    const searchTerm = productSearchInput ? productSearchInput.value.toLowerCase() : '';
    const filteredProducts = products.filter(p => p.Produktname.toLowerCase().includes(searchTerm));
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    else if (totalPages === 0) currentPage = 0;
    if (currentPage === 0 && filteredProducts.length > 0) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToDisplay = filteredProducts.slice(startIndex, endIndex);

    productsToDisplay.forEach((product, index) => {
        const row = productTableBody.insertRow();
        row.classList.add(index % 2 === 0 ? 'bg-white' : 'bg-gray-50');
        const cell = row.insertCell();
        cell.classList.add('product-table-cell-content');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = product.Produktname;
        nameSpan.classList.add('cursor-pointer', 'font-bold', 'text-[#8395AF]', 'hover:text-[#9FB8DF]');
        nameSpan.addEventListener('click', () => openProductDetailModal(product));
        cell.appendChild(nameSpan);
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('product-details-container');
        detailsDiv.appendChild(createValueSpan(product['kcal/100g'], 'bg-gray-200', ' kcal'));
        detailsDiv.appendChild(createValueSpan(product['Kohlenhydrate (g)'] || 0, 'legend-color-blue', 'g'));
        detailsDiv.appendChild(createValueSpan(product['Eiweiß (g)'] || 0, 'legend-color-green', 'g'));
        detailsDiv.appendChild(createValueSpan(product['Fett (g)'] || 0, 'legend-color-yellow', 'g'));
        if (product['Portionsgröße (g/ml)']) detailsDiv.appendChild(createValueSpan(product['Portionsgröße (g/ml)'], 'bg-purple-300', 'g'));
        cell.appendChild(detailsDiv);
    });

    if (productCountDisplay) {
        const displayedCount = productsToDisplay.length;
        const totalFilteredCount = filteredProducts.length;
        const totalProductsCount = products.length;
        if (totalFilteredCount === 0) productCountDisplay.textContent = `Keine Produkte gefunden.`;
        else productCountDisplay.textContent = `Produkte ${startIndex + 1}-${Math.min(endIndex, totalFilteredCount)} von ${totalFilteredCount} (insgesamt ${totalProductsCount})`;
    }

    if (prevPageButton && nextPageButton && paginationInfo) {
        prevPageButton.disabled = currentPage <= 1;
        nextPageButton.disabled = currentPage >= totalPages;
        paginationInfo.textContent = `Seite ${currentPage} von ${totalPages > 0 ? totalPages : 1}`;
    }
}

function prevPage() { if (currentPage > 1) { currentPage--; renderProductTable(); } }
function nextPage() {
    const searchTerm = productSearchInput ? productSearchInput.value.toLowerCase() : '';
    const filteredProducts = products.filter(p => p.Produktname.toLowerCase().includes(searchTerm));
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage < totalPages) { currentPage++; renderProductTable(); }
}
function changeItemsPerPage() { itemsPerPage = parseInt(itemsPerPageSelect.value); currentPage = 1; renderProductTable(); }

function saveProduct() {
    const name = productNameInput.value.trim();
    const kcal = productKcalInput.value.trim();
    if (name && kcal && !isNaN(parseFloat(kcal)) && parseFloat(kcal) > 0) {
        const newProduct = {
            id: name.toLowerCase().replace(/\s/g, '-') + '-' + Math.random().toString(36).substr(2, 9),
            "Produktname": name, "kcal/100g": kcal,
            "Kohlenhydrate (g)": productCarbsInput.value.trim() || "0",
            "Eiweiß (g)": productProteinInput.value.trim() || "0",
            "Fett (g)": productFatInput.value.trim() || "0",
            "Portionsgröße (g/ml)": productPortionInput.value.trim() || "N/A"
        };
        products.push(newProduct); 
        saveProductsToLocalStorage(); // Save to local storage
        currentPage = 1; 
        renderProductTable();
        [productNameInput, productKcalInput, productCarbsInput, productProteinInput, productFatInput, productPortionInput].forEach(i => i.value = '');
        alert(`"${name}" erfolgreich gespeichert!`);
    } else {
        alert("Bitte Produktname und gültige Kalorien pro 100g eingeben.");
    }
}

function exportProductsAsCsv() {
    const headers = ["Produktname", "kcal/100g", "Kohlenhydrate (g)", "Eiweiß (g)", "Fett (g)", "Portionsgröße (g/ml)"];
    const csvRows = [headers.map(h => `"${h}"`).join(';')];
    products.forEach(p => csvRows.push(headers.map(h => `"${(p[h] !== undefined ? String(p[h]) : '').replace(/"/g, '""')}"`).join(';')));
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'produkte.csv';
    link.click();
    alert("Produkte als CSV exportiert!");
}

function importProductsFromCsv() { alert("CSV Import (Funktion noch nicht implementiert)"); }

function updateWaterDisplay() { waterAmountDisplay.textContent = `${waterConsumed.toFixed(1)} L`; renderWaterGlasses(); }
function renderWaterGlasses() {
    waterGlassesContainer.innerHTML = '';
    const numGlasses = Math.ceil(waterGoal / glassSize);
    const filledGlasses = Math.floor(waterConsumed / glassSize);
    for (let i = 0; i < numGlasses; i++) {
        const glassDiv = document.createElement('div');
        glassDiv.classList.add('water-glass', ...(i < filledGlasses ? ['filled'] : []));
        glassDiv.innerHTML = '<i class="fa-solid fa-glass-water"></i>';
        glassDiv.addEventListener('click', () => { waterConsumed = Math.min(waterGoal, waterConsumed + glassSize); updateWaterDisplay(); });
        waterGlassesContainer.appendChild(glassDiv);
    }
}

navItems.forEach(item => item.addEventListener('click', () => { if (item.dataset.page) showPage(item.dataset.page); }));

function initializeOverviewPage() {
    if (!prevMonthButton) {
        prevMonthButton = document.getElementById('prevMonthButton');
        nextMonthButton = document.getElementById('nextMonthButton');
        currentMonthDisplay = document.getElementById('currentMonthDisplay');
        calendarGrid = document.getElementById('calendarGrid');
        dailySummaryDate = document.getElementById('dailySummaryDate');
        dailyConsumedCaloriesDisplay = document.getElementById('dailyConsumedCalories');
        dailyRemainingCaloriesDisplay = document.getElementById('dailyRemainingCalories');
        dailyCarbsArc = document.getElementById('dailyCarbsArc');
        dailyProteinArc = document.getElementById('dailyProteinArc');
        dailyFatArc = document.getElementById('dailyFatArc');
        consumedFoodList = document.getElementById('consumedFoodList');
        foodDetailModal = document.getElementById('foodDetailModal');
        closeModalButton = document.getElementById('closeModalButton');
        modalFoodNameDisplay = document.getElementById('modalFoodNameDisplay');
        modalKcalInput = document.getElementById('modalKcalInput');
        modalCarbsInput = document.getElementById('modalCarbsInput');
        modalProteinInput = document.getElementById('modalProteinInput');
        modalFatInput = document.getElementById('modalFatInput');
        modalPortionInput = document.getElementById('modalPortionInput');
        saveFoodEntryButton = document.getElementById('saveFoodEntryButton');
        deleteFoodEntryButton = document.getElementById('deleteFoodEntryButton');

        prevMonthButton.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); renderCalendar(currentCalendarDate); });
        nextMonthButton.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); renderCalendar(currentCalendarDate); });
        closeModalButton.addEventListener('click', closeFoodDetailModal);
        saveFoodEntryButton.addEventListener('click', () => saveEditedFoodEntry(currentEditingFoodEntry, currentEditingDateKey));
        deleteFoodEntryButton.addEventListener('click', () => deleteFoodEntry(currentEditingFoodEntry, currentEditingDateKey));
    }
    renderCalendar(currentCalendarDate);
    updateDailySummary(selectedCalendarDate);
}

function renderCalendar(date) {
    calendarGrid.innerHTML = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => `<div class="font-semibold text-gray-500">${d}</div>`).join('');
    const year = date.getFullYear(), month = date.getMonth();
    currentMonthDisplay.textContent = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(date);
    const firstDay = new Date(year, month, 1), startDay = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < startDay; i++) calendarGrid.appendChild(document.createElement('div'));
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = day;
        dayDiv.classList.add('cursor-pointer');
        const currentDayDate = new Date(year, month, day);
        dayDiv.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (currentDayDate.toDateString() === selectedCalendarDate.toDateString()) dayDiv.classList.add('selected-day');
        else dayDiv.classList.add('non-selected-day');
        dayDiv.addEventListener('click', () => {
            selectedCalendarDate = currentDayDate;
            renderCalendar(currentCalendarDate);
            updateDailySummary(selectedCalendarDate);
        });
        calendarGrid.appendChild(dayDiv);
    }
}

function updateDailySummary(date) {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const entries = dailyFoodEntries[dateKey] || [];
    let totalKcal = 0, totalCarbsKcal = 0, totalProteinKcal = 0, totalFatKcal = 0;
    entries.forEach(e => {
        totalKcal += e.kcal || 0;
        totalCarbsKcal += (e.carbs || 0) * 4;
        totalProteinKcal += (e.protein || 0) * 4;
        totalFatKcal += (e.fat || 0) * 9;
    });
    dailySummaryDate.textContent = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    consumedFoodList.innerHTML = '';
    const mealTypes = ['Frühstück', 'Mittagessen', 'Abendessen', 'Snacks'];
    mealTypes.forEach(type => {
        const mealEntries = entries.filter(e => e.mealType === type);
        if (mealEntries.length > 0) {
            const sectionDiv = document.createElement('div');
            sectionDiv.classList.add('mb-4');
            sectionDiv.innerHTML = `<h3 class="font-semibold text-base mb-2 text-[#556985]">${type}</h3>`;
            const ul = document.createElement('ul');
            ul.classList.add('list-inside', 'text-gray-700', 'space-y-2');
            mealEntries.forEach(e => {
                const li = document.createElement('li');
                li.classList.add('flex', 'flex-col', 'py-1', 'border-b', 'border-gray-200', 'last:border-b-0', 'md:flex-row', 'md:items-center', 'md:justify-between');
                const nameSpan = document.createElement('span');
                nameSpan.textContent = e.name;
                nameSpan.classList.add('cursor-pointer', 'font-bold', 'text-[#8395AF]', 'hover:text-[#9FB8DF]');
                nameSpan.addEventListener('click', () => openFoodDetailModal(e, dateKey));
                li.appendChild(nameSpan);
                const details = document.createElement('div');
                details.classList.add('flex', 'flex-wrap', 'justify-around', 'gap-y-1', 'text-sm', 'text-gray-700', 'mt-1', 'md:mt-0', 'md:ml-auto', 'md:justify-start', 'md:gap-x-8');
                details.appendChild(createValueSpan(e.kcal, 'bg-gray-200', ' kcal'));
                details.appendChild(createValueSpan(e.carbs || 0, 'legend-color-blue', 'g'));
                details.appendChild(createValueSpan(e.protein || 0, 'legend-color-green', 'g'));
                details.appendChild(createValueSpan(e.fat || 0, 'legend-color-yellow', 'g'));
                if (e.portion) details.appendChild(createValueSpan(e.portion, 'bg-purple-300', 'g'));
                li.appendChild(details);
                ul.appendChild(li);
            });
            sectionDiv.appendChild(ul);
            consumedFoodList.appendChild(sectionDiv);
        }
    });
    if (entries.length === 0) consumedFoodList.innerHTML = '<p>Keine Einträge für diesen Tag.</p>';
    dailyConsumedCaloriesDisplay.textContent = `${totalKcal} kcal`;
    dailyRemainingCaloriesDisplay.textContent = `Ziel ${calorieGoal - totalKcal} kcal`;
    const circ = 2 * Math.PI * 80;
    const cap = (val, max) => Math.min(val, max);
    const carbsP = cap(totalCarbsKcal, calorieGoal) / calorieGoal, proteinP = cap(totalProteinKcal, calorieGoal) / calorieGoal, fatP = cap(totalFatKcal, calorieGoal) / calorieGoal;
    dailyCarbsArc.setAttribute('stroke-dasharray', `${carbsP * circ} ${circ * (1 - carbsP)}`); dailyCarbsArc.setAttribute('stroke-dashoffset', '0');
    dailyProteinArc.setAttribute('stroke-dasharray', `${proteinP * circ} ${circ * (1 - proteinP)}`); dailyProteinArc.setAttribute('stroke-dashoffset', `-${carbsP * circ}`);
    dailyFatArc.setAttribute('stroke-dasharray', `${fatP * circ} ${circ * (1 - fatP)}`); dailyFatArc.setAttribute('stroke-dashoffset', `-${(carbsP + proteinP) * circ}`);
    if (totalKcal === 0) [dailyCarbsArc, dailyProteinArc, dailyFatArc].forEach(arc => arc.setAttribute('stroke-dasharray', `0 ${circ}`));
}

function openFoodDetailModal(foodEntry, dateKey) {
    currentEditingFoodEntry = foodEntry; currentEditingDateKey = dateKey;
    modalFoodNameDisplay.textContent = foodEntry.name;
    ['kcal', 'carbs', 'protein', 'fat', 'portion'].forEach(k => {
        const inputEl = document.getElementById(`modal${k.charAt(0).toUpperCase() + k.slice(1)}Input`);
        if (inputEl) inputEl.value = foodEntry[k] || (k === 'kcal' ? 0 : '');
    });
    foodDetailModal.classList.remove('hidden');
}

function closeFoodDetailModal() { foodDetailModal.classList.add('hidden'); currentEditingFoodEntry = null; currentEditingDateKey = null; }

function saveEditedFoodEntry(originalFoodEntry, dateKey) {
    const updatedKcal = parseFloat(modalKcalInput.value);
    if (isNaN(updatedKcal) || updatedKcal < 0) { alert("Bitte gültige Kalorien eingeben."); return; }
    const index = dailyFoodEntries[dateKey].findIndex(e => e.id === originalFoodEntry.id);
    if (index !== -1) {
        dailyFoodEntries[dateKey][index] = {
            ...dailyFoodEntries[dateKey][index],
            kcal: updatedKcal,
            carbs: parseFloat(modalCarbsInput.value) || 0,
            protein: parseFloat(modalProteinInput.value) || 0,
            fat: parseFloat(modalFatInput.value) || 0,
            portion: parseFloat(modalPortionInput.value) || 0
        };
        saveDailyFoodEntriesToLocalStorage(); // Save to local storage
        renderCalendar(currentCalendarDate); 
        updateDailySummary(selectedCalendarDate); 
        closeFoodDetailModal();
        alert("Eintrag erfolgreich gespeichert!");
    } else alert("Fehler: Eintrag nicht gefunden.");
}

function deleteFoodEntry(foodEntryToDelete, dateKey) {
    if (confirm(`Möchtest du "${foodEntryToDelete.name}" wirklich löschen?`)) {
        if (dailyFoodEntries[dateKey]) {
            dailyFoodEntries[dateKey] = dailyFoodEntries[dateKey].filter(e => e.id !== foodEntryToDelete.id);
            saveDailyFoodEntriesToLocalStorage(); // Save to local storage
        }
        renderCalendar(currentCalendarDate); 
        updateDailySummary(selectedCalendarDate); 
        closeFoodDetailModal();
        alert(`"${foodEntryToDelete.name}" wurde gelöscht.`);
    }
}

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

function closeProductDetailModal() { productDetailModal.classList.add('hidden'); currentEditingProduct = null; }

function saveEditedProduct() {
    if (!currentEditingProduct) return;
    const updatedKcal = parseFloat(modalProductKcalInput.value);
    if (isNaN(updatedKcal) || updatedKcal < 0) { alert("Bitte gültige Kalorien eingeben."); return; }
    const index = products.findIndex(p => p.id === currentEditingProduct.id);
    if (index !== -1) {
        products[index]['kcal/100g'] = updatedKcal;
        products[index]['Kohlenhydrate (g)'] = parseFloat(modalProductCarbsInput.value) || 0;
        products[index]['Eiweiß (g)'] = parseFloat(modalProductProteinInput.value) || 0;
        products[index]['Fett (g)'] = parseFloat(modalProductFatInput.value) || 0;
        products[index]['Portionsgröße (g/ml)'] = modalProductPortionInput.value.trim();
        saveProductsToLocalStorage(); // Save to local storage
        renderProductTable(); 
        closeProductDetailModal();
        alert(`"${currentEditingProduct.Produktname}" erfolgreich gespeichert!`);
    } else alert("Fehler: Produkt nicht gefunden.");
}

function deleteProductFromModal() {
    if (!currentEditingProduct) return;
    if (confirm(`Möchtest du "${currentEditingProduct.Produktname}" wirklich löschen?`)) {
        products = products.filter(p => p.id !== currentEditingProduct.id);
        saveProductsToLocalStorage(); // Save to local storage
        currentPage = 1; 
        renderProductTable(); 
        closeProductDetailModal();
        alert(`"${currentEditingProduct.Produktname}" wurde gelöscht.`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateWaterDisplay();
    loadDarkModePreference(); // Load dark mode preference first
    loadDailyFoodEntriesFromLocalStorage(); // Load daily food entries
    showPage('today-page'); // Then show the default page
});

// Function to save products to local storage
function saveProductsToLocalStorage() {
    try {
        localStorage.setItem('userProducts', JSON.stringify(products));
    } catch (error) {
        console.error('Error saving products to local storage:', error);
    }
}

// Function to load products from local storage or fallback to JSON file
async function loadProductsFromLocalStorage() {
    try {
        const storedProducts = localStorage.getItem('userProducts');
        if (storedProducts) {
            products = JSON.parse(storedProducts);
            if (!Array.isArray(products)) { // Basic validation
                console.warn('Stored products format is invalid, falling back to JSON.');
                throw new Error('Invalid data format in localStorage');
            }
            console.log('Products loaded from local storage.');
            return; // Successfully loaded from local storage
        }
        // No products in local storage, fetch from JSON
        console.log('No products in local storage, fetching from base_products.json');
        await fetchAndSaveBaseProducts();
    } catch (error) {
        console.error('Error loading products from local storage:', error);
        // Fallback to fetching from JSON if local storage loading fails
        console.log('Falling back to fetching from base_products.json due to error.');
        await fetchAndSaveBaseProducts();
    }
}

// Helper function to fetch base products and save them
async function fetchAndSaveBaseProducts() {
    try {
        const response = await fetch('base_products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        products = data.map(product => ({
            ...product,
            id: product.Produktname.toLowerCase().replace(/\s/g, '-') + '-' + Math.random().toString(36).substr(2, 9)
        }));
        console.log('Products loaded from base_products.json');
        saveProductsToLocalStorage(); // Save the fetched products to local storage
    } catch (error) {
        console.error('Error fetching or processing base_products.json:', error);
        // If base_products.json also fails, initialize with an empty array or handle as appropriate
        products = []; 
        alert(`Fehler beim Laden der Basisprodukte: ${error.message}.\nDie Produktliste ist möglicherweise leer.`);
    }
}
