// JavaScript for interactive elements

// Initial values
let consumedCalories = 1240; // Updated value
let calorieGoal = 2000; // Can now be changed
let waterConsumed = 0; // Default to 0, will be loaded or set for today
let waterGoal = 2.5; // in liters, can now be changed
const glassSize = 0.25; // Size of a water glass in liters (assumption)

// Local Storage Keys
const userCalorieGoalKey = 'userCalorieGoal';
const userWaterGoalKey = 'userWaterGoal';
const userDailyWaterLogKey = 'userDailyWaterLog'; 

// Product data
let products = []; 

// Pagination variables
let currentPage = 1;
let itemsPerPage = 25; 

// Calendar and Daily Summary Variables
let currentCalendarDate = new Date(); 
let selectedCalendarDate = new Date(); 

// Data Logs
const dailyFoodEntries = {}; 
let dailyWaterLog = {}; 

// DOM elements
const consumedCaloriesDisplay = document.getElementById('consumedCalories'); 
const waterAmountDisplay = document.getElementById('waterAmount');
const waterGlassesContainer = document.getElementById('waterGlassesContainer');
const pageContents = document.querySelectorAll('.page-content'); 
const pageTitle = document.getElementById('pageTitle'); 
const overviewCalorieGoalDisplay = document.getElementById('calorieGoal'); 

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
let darkModeToggle; 

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

// Food Detail Modal elements
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
let modalMealTypeSelect; // Added for meal type dropdown in food detail modal

let currentEditingFoodEntry = null; 
let currentEditingDateKey = null; 

// Product Detail Modal elements
let productDetailModal; 
let closeProductModalButton; 
let modalProductNameDisplay;
let modalProductKcalInput;
let modalProductCarbsInput;
let modalProductProteinInput;
let modalProductFatInput;
let modalProductPortionInput_mealsPage; 
let saveProductEntryButton;
let deleteProductEntryButton;

let currentEditingProduct = null; 

// Add Product to Meal Modal elements
let addProductToMealModal;
let closeAddProductToMealModalButton;
let modalProductSearchInput;
let modalProductList;
let modalProductPortionInput_addToMeal; 
let cancelAddProductToMealButton;
let confirmAddProductToMealButton;

// Global variables for Add Product to Meal functionality
let currentMealTypeForAdding = '';
let selectedProductForMeal = null;


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

function saveDailyFoodEntriesToLocalStorage() {
    try {
        localStorage.setItem('userDailyFoodEntries', JSON.stringify(dailyFoodEntries));
    } catch (error) {
        console.error('Error saving daily food entries to local storage:', error);
    }
}

function loadDailyFoodEntriesFromLocalStorage() {
    const storedEntries = localStorage.getItem('userDailyFoodEntries');
    if (storedEntries) {
        try {
            const parsedEntries = JSON.parse(storedEntries);
            if (parsedEntries && typeof parsedEntries === 'object') {
                Object.keys(dailyFoodEntries).forEach(key => delete dailyFoodEntries[key]);
                Object.assign(dailyFoodEntries, parsedEntries);
            } else {
                saveDailyFoodEntriesToLocalStorage(); 
            }
        } catch (error) {
            console.error('Error parsing daily food entries from local storage:', error);
            saveDailyFoodEntriesToLocalStorage();
        }
    } else {
        saveDailyFoodEntriesToLocalStorage();
    }
}

function saveDarkModePreference(enable) {
    localStorage.setItem('darkModeEnabled', enable);
}

function loadDarkModePreference() {
    const preference = localStorage.getItem('darkModeEnabled');
    applyDarkMode(preference === 'true');
}

function saveSettingsToLocalStorage() {
    try {
        localStorage.setItem(userCalorieGoalKey, calorieGoal.toString());
        localStorage.setItem(userWaterGoalKey, waterGoal.toString());
        console.log('Settings saved to local storage.'); 
    } catch (error) {
        console.error('Error saving settings to local storage:', error);
    }
}

function loadSettingsFromLocalStorage() {
    try {
        const storedCalorieGoal = localStorage.getItem(userCalorieGoalKey);
        if (storedCalorieGoal !== null) {
            const parsedCalorieGoal = parseInt(storedCalorieGoal);
            if (!isNaN(parsedCalorieGoal) && parsedCalorieGoal > 0) calorieGoal = parsedCalorieGoal;
        }
        const storedWaterGoal = localStorage.getItem(userWaterGoalKey);
        if (storedWaterGoal !== null) {
            const parsedWaterGoal = parseFloat(storedWaterGoal);
            if (!isNaN(parsedWaterGoal) && parsedWaterGoal > 0) waterGoal = parsedWaterGoal;
        }
    } catch (error) {
        console.error('Error loading settings from local storage:', error);
    }
    if (overviewCalorieGoalDisplay) overviewCalorieGoalDisplay.textContent = `Ziel ${calorieGoal} kcal`;
    if (newCalorieGoalInput) newCalorieGoalInput.value = calorieGoal;
    if (newWaterGoalInput) newWaterGoalInput.value = waterGoal;
}

// New functions for daily water log persistence
function saveDailyWaterLogToLocalStorage() {
    try {
        console.log('[SAVE WATER LOG] Saving dailyWaterLog:', JSON.stringify(dailyWaterLog), 'to key:', userDailyWaterLogKey);
        localStorage.setItem(userDailyWaterLogKey, JSON.stringify(dailyWaterLog));
    } catch (error) {
        console.error('Error saving daily water log to local storage:', error);
    }
}

function loadDailyWaterLogFromLocalStorage() {
    const rawData = localStorage.getItem(userDailyWaterLogKey);
    console.log('[LOAD WATER LOG] Raw data from localStorage:', rawData);
    try {
        if (rawData) {
            const parsedLog = JSON.parse(rawData);
            // Ensure dailyWaterLog is an object even if rawData is "null" or invalid JSON that parses to null/non-object
            dailyWaterLog = (parsedLog && typeof parsedLog === 'object') ? parsedLog : {};
        } else {
            dailyWaterLog = {}; // Initialize if nothing in storage
        }
    } catch (error) {
        console.error('[LOAD WATER LOG] Error parsing dailyWaterLog:', error);
        dailyWaterLog = {}; // Initialize on error
    }
    // Save back in case it was null/corrupt to ensure consistent state in localStorage
    if (!rawData || (rawData && JSON.stringify(dailyWaterLog) !== rawData)) {
        saveDailyWaterLogToLocalStorage();
    }
    console.log('[LOAD WATER LOG] Parsed dailyWaterLog:', JSON.stringify(dailyWaterLog));
}


// Moved closeFoodDetailModal function definition earlier
function closeFoodDetailModal() { 
    console.log("[closeFoodDetailModal] Called. Hiding foodDetailModal.");
    if (foodDetailModal) foodDetailModal.classList.add('hidden'); 
    currentEditingFoodEntry = null; 
    currentEditingDateKey = null; 
}

function showPage(pageId) {
    console.log(`[showPage] Attempting to show page: ${pageId}`); 
    pageContents.forEach(page => page.classList.remove('active'));
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
        console.log(`[showPage] Page ${pageId} activated.`); 
    } else {
        console.error(`[showPage] Page element not found for ID: ${pageId}`); 
    }

    switch (pageId) {
        case 'today-page':
            pageTitle.textContent = 'Heute';
            if (overviewCalorieGoalDisplay) overviewCalorieGoalDisplay.textContent = `Ziel ${calorieGoal} kcal`;
            
            const todayKey = new Date().toISOString().split('T')[0];
            waterConsumed = dailyWaterLog[todayKey] || 0;
            console.log('[SHOWPAGE TODAY] Setting waterConsumed. Key:', todayKey, 'Value from dailyWaterLog:', dailyWaterLog[todayKey], 'Resulting waterConsumed:', waterConsumed);
            updateWaterDisplay(); 
            initializeTodayPageEventListeners(); // Call initializer for today page
            renderTodayPageMealSections();
            updateTodayPageOverallMetrics();
            break;
        case 'profile-page':
            pageTitle.textContent = 'Profil';
            initializeBmiCalculator(); 
            break;
        case 'meals-page':
            pageTitle.textContent = 'Mahlzeiten';
            initializeMealsPage(); 
            break;
        case 'overview-page':
            pageTitle.textContent = 'Übersicht';
            console.log('[showPage] Initializing Overview Page...');
            initializeOverviewPage(); 
            console.log('[showPage] Calling renderCalendar for Overview Page. currentCalendarDate:', currentCalendarDate);
            renderCalendar(currentCalendarDate); 
            const calGrid = document.getElementById('calendarGrid'); 
            if (calGrid) {
                console.log('[showPage] After renderCalendar. calendarGrid.innerHTML length:', calGrid.innerHTML.length);
                console.log('[showPage] calendarGrid.offsetHeight:', calGrid.offsetHeight);
            } else {
                console.log('[showPage] After renderCalendar. calendarGrid element not found.');
            }
            console.log('[showPage] Calling updateDailySummary for Overview Page. selectedCalendarDate:', selectedCalendarDate);
            updateDailySummary(selectedCalendarDate); 
            console.log('[showPage] Overview Page setup complete.');
            break;
        case 'settings-page':
            pageTitle.textContent = 'Einstellungen';
            initializeSettings(); 
            break;
        default:
            pageTitle.textContent = 'App';
    }
}

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
                genderInputs.forEach(radio => { if (radio.checked) gender = radio.value; });
                const activityLevel = parseFloat(activityLevelSelect.value);
                const goal = goalSelect.value;

                if (isNaN(heightCm) || isNaN(weightKg) || isNaN(ageYears) || heightCm <= 0 || weightKg <= 0 || ageYears <= 0 || gender === '') {
                    const messageBox = document.createElement('div');
                    messageBox.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 1000; text-align: center;`;
                    messageBox.innerHTML = `<p>Bitte alle Felder korrekt ausfüllen.</p><button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>`;
                    document.body.appendChild(messageBox);
                    if(bmiResultDiv) bmiResultDiv.textContent = '';
                    if(bmiCategoryDiv) bmiCategoryDiv.textContent = '';
                    if(calorieRecommendationDiv) calorieRecommendationDiv.textContent = '';
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
    modal.innerHTML = `<div class="modal-content"><div class="flex justify-between items-center mb-4"><h2 class="text-xl font-semibold">BMI & Kalorienempfehlung</h2><button id="closeBmiModalButton" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button></div><div class="space-y-3 text-center"><p class="text-lg font-bold" style="font-size: 2rem; padding-top: 2rem;">Dein BMI: ${bmi}</p><p class="text-base">Kategorie: ${category}</p><p class="text-base font-semibold text-[#9FB8DF] mb-40">Zum ${goalText} wird ein Ziel von ca. ${recommendedKcal} kcal pro Tag empfohlen.</p></div><div class="flex justify-end space-x-4 mt-6"><button id="discardBmiButton" class="add-button px-4 py-2 bg-transparent text-red-500 border border-red-500 hover:bg-red-500 hover:text-white">Verwerfen</button><button id="applyBmiButton" class="add-button px-4 py-2">Übernehmen</button></div></div>`;
    document.body.appendChild(modal);
    document.getElementById('closeBmiModalButton').addEventListener('click', () => modal.remove());
    document.getElementById('discardBmiButton').addEventListener('click', () => modal.remove());
    document.getElementById('applyBmiButton').addEventListener('click', () => {
        calorieGoal = parseInt(recommendedKcal);
        saveSettingsToLocalStorage(); 
        const successMessageBox = document.createElement('div');
        successMessageBox.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 1000; text-align: center;`;
        successMessageBox.innerHTML = `<p>Neues Kalorienziel (${calorieGoal} kcal) übernommen!</p><button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 8px 15px; background-color: #9FB8DF; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>`;
        document.body.appendChild(successMessageBox);
        modal.remove(); 
        if (overviewCalorieGoalDisplay) overviewCalorieGoalDisplay.textContent = `Ziel ${calorieGoal} kcal`;
        if (newCalorieGoalInput) newCalorieGoalInput.value = calorieGoal;
    });
}

function initializeSettings() {
    if (!newCalorieGoalInput) newCalorieGoalInput = document.getElementById('newCalorieGoalInput');
    if (!newWaterGoalInput) newWaterGoalInput = document.getElementById('newWaterGoalInput');
    if (!saveSettingsButton) saveSettingsButton = document.getElementById('saveSettingsButton');
    if (!darkModeToggle) darkModeToggle = document.getElementById('darkModeToggle');
    
    if (newCalorieGoalInput) newCalorieGoalInput.value = calorieGoal;
    if (newWaterGoalInput) newWaterGoalInput.value = waterGoal;

    if (saveSettingsButton && !saveSettingsButton.hasAttribute('data-listener-attached')) {
        saveSettingsButton.addEventListener('click', () => {
            const newCalorieGoalValue = parseInt(newCalorieGoalInput.value);
            const newWaterGoalValue = parseFloat(newWaterGoalInput.value);
            
            let calorieGoalUpdated = false;
            let waterGoalUpdated = false;

            if (!isNaN(newCalorieGoalValue) && newCalorieGoalValue > 0) {
                if (calorieGoal !== newCalorieGoalValue) {
                    calorieGoal = newCalorieGoalValue;
                    if (overviewCalorieGoalDisplay) overviewCalorieGoalDisplay.textContent = `Ziel ${calorieGoal} kcal`;
                    calorieGoalUpdated = true;
                }
            } else if (newCalorieGoalInput.value.trim() !== '') {
                alert("Bitte geben Sie ein gültiges Kalorienziel ein.");
            }

            if (!isNaN(newWaterGoalValue) && newWaterGoalValue > 0) {
                if (waterGoal !== newWaterGoalValue) {
                    waterGoal = newWaterGoalValue;
                    updateWaterDisplay(); 
                    waterGoalUpdated = true;
                }
            } else if (newWaterGoalInput.value.trim() !== '') {
                alert("Bitte geben Sie ein gültiges Wasserziel ein.");
            }

            if (calorieGoalUpdated || waterGoalUpdated) {
                saveSettingsToLocalStorage(); 
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
}

function createValueSpan(value, colorClass, unit = '') {
    const span = document.createElement('span');
    span.classList.add('flex', 'items-center', 'whitespace-nowrap'); 
    span.innerHTML = `<span class="w-2.5 h-2.5 rounded-full ${colorClass} mr-1"></span> ${value}${unit}`;
    return span;
}

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
        // importCsvButton is now importProductsButton and handled in DOMContentLoaded
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
        modalProductPortionInput_mealsPage = document.getElementById('modalProductPortionInput'); 
        saveProductEntryButton = document.getElementById('saveProductEntryButton');
        deleteProductEntryButton = document.getElementById('deleteProductEntryButton');
        
        renderProductTable();

        if (saveProductButton) saveProductButton.addEventListener('click', saveProduct);
        if (productSearchInput) productSearchInput.addEventListener('input', () => { currentPage = 1; renderProductTable(); });
        if (exportCsvButton) exportCsvButton.addEventListener('click', exportProductsAsCsv);
        // Listener for importProductsButton is now in DOMContentLoaded
        if (prevPageButton) prevPageButton.addEventListener('click', prevPage);
        if (nextPageButton) nextPageButton.addEventListener('click', nextPage);
        if (itemsPerPageSelect) itemsPerPageSelect.addEventListener('change', changeItemsPerPage);
        if (closeProductModalButton) closeProductModalButton.addEventListener('click', closeProductDetailModal);
        if (saveProductEntryButton) saveProductEntryButton.addEventListener('click', saveEditedProduct);
        if (deleteProductEntryButton) deleteProductEntryButton.addEventListener('click', deleteProductFromModal);
    } else {
        renderProductTable(); 
    }
}
function renderProductTable() {
    if (!productTableBody) return;
    productTableBody.innerHTML = ''; 
    const searchTerm = productSearchInput ? productSearchInput.value.toLowerCase() : '';
    const filteredProducts = products.filter(p => p.Produktname.toLowerCase().includes(searchTerm));

    // Sort filtered products alphabetically by Produktname (case-insensitive)
    filteredProducts.sort((a, b) => {
        const nameA = a.Produktname.toLowerCase();
        const nameB = b.Produktname.toLowerCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0; // names are equal
    });

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
function changeItemsPerPage() { if(itemsPerPageSelect) itemsPerPage = parseInt(itemsPerPageSelect.value); currentPage = 1; renderProductTable(); }

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
        saveProductsToLocalStorage(); 
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

function updateWaterDisplay() { 
    console.log('[UPDATE WATER DISPLAY] Updating with waterConsumed:', waterConsumed, '| waterGoal:', waterGoal); // Diagnostic
    if (waterAmountDisplay) waterAmountDisplay.textContent = `${waterConsumed.toFixed(1)} L`; 
    renderWaterGlasses(); 
}
function renderWaterGlasses() {
    if (!waterGlassesContainer) return;
    waterGlassesContainer.innerHTML = '';
    const numGlasses = Math.ceil(waterGoal / glassSize);
    const filledGlasses = Math.floor(waterConsumed / glassSize);
    const todayKey = new Date().toISOString().split('T')[0];

    for (let i = 0; i < numGlasses; i++) {
        const glassDiv = document.createElement('div');
        glassDiv.classList.add('water-glass', ...(i < filledGlasses ? ['filled'] : []));
        glassDiv.innerHTML = '<i class="fa-solid fa-glass-water"></i>';
        glassDiv.addEventListener('click', () => { 
            if (i < Math.floor(waterConsumed / glassSize)) { 
                waterConsumed = i * glassSize;
            } else { 
                waterConsumed = (i + 1) * glassSize;
            }
            waterConsumed = Math.min(waterGoal, waterConsumed); 
            waterConsumed = Math.max(0, waterConsumed); 

            dailyWaterLog[todayKey] = waterConsumed;
            console.log('[WATER GLASS CLICK] Updating dailyWaterLog. Key:', todayKey, 'Value for key:', waterConsumed, 'Full dailyWaterLog obj:', JSON.stringify(dailyWaterLog)); // Diagnostic
            saveDailyWaterLogToLocalStorage();
            updateWaterDisplay(); 
        });
        waterGlassesContainer.appendChild(glassDiv);
    }
}

function initializeOverviewPage() {
    console.log('[initializeOverviewPage] Called.'); 
    if (!prevMonthButton) { 
        prevMonthButton = document.getElementById('prevMonthButton');
        nextMonthButton = document.getElementById('nextMonthButton');
        currentMonthDisplay = document.getElementById('currentMonthDisplay');
        calendarGrid = document.getElementById('calendarGrid');
        console.log('[initializeOverviewPage] calendarGrid selected:', calendarGrid !== null); 
        console.log('[initializeOverviewPage] currentMonthDisplay selected:', currentMonthDisplay !== null); 
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
        // DOM elements for the modal are now initialized in initializeFoodDetailModalOnce
        // Event listeners for modal buttons (save, delete, close) are also in initializeFoodDetailModalOnce
        // Event listeners for prev/next month buttons remain here as they are specific to the overview page
        if(prevMonthButton) prevMonthButton.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); renderCalendar(currentCalendarDate); updateDailySummary(selectedCalendarDate); });
        if(nextMonthButton) nextMonthButton.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); renderCalendar(currentCalendarDate); updateDailySummary(selectedCalendarDate); });
    }
}

function saveEditedFoodEntry() {
    console.log("[saveEditedFoodEntry] Called.");
    if (!currentEditingFoodEntry || !currentEditingDateKey) {
        console.error("[saveEditedFoodEntry] Error: No food entry is currently being edited or dateKey is missing.");
        alert("Fehler: Kein Eintrag zum Speichern ausgewählt oder Datumsschlüssel fehlt.");
        return;
    }

    const newMealType = modalMealTypeSelect ? modalMealTypeSelect.value : currentEditingFoodEntry.mealType;
    const newKcal = modalKcalInput ? parseInt(modalKcalInput.value) : currentEditingFoodEntry.kcal;
    const newCarbs = modalCarbsInput ? parseInt(modalCarbsInput.value) || 0 : currentEditingFoodEntry.carbs;
    const newProtein = modalProteinInput ? parseInt(modalProteinInput.value) || 0 : currentEditingFoodEntry.protein;
    const newFat = modalFatInput ? parseInt(modalFatInput.value) || 0 : currentEditingFoodEntry.fat;
    const newPortion = modalPortionInput ? parseInt(modalPortionInput.value) || 0 : currentEditingFoodEntry.portion;

    if (isNaN(newKcal) || newKcal < 0) {
        alert("Bitte gültige Kalorienzahl eingeben.");
        return;
    }
    if (isNaN(newPortion) || newPortion < 0) {
        alert("Bitte gültige Portionsgröße eingeben.");
        return;
    }
    
    const entriesForDate = dailyFoodEntries[currentEditingDateKey];
    if (!entriesForDate) {
        console.error(`[saveEditedFoodEntry] No entries found for dateKey: ${currentEditingDateKey}`);
        alert("Fehler: Keine Einträge für das angegebene Datum gefunden.");
        return;
    }

    const entryIndex = entriesForDate.findIndex(entry => entry.id === currentEditingFoodEntry.id);

    if (entryIndex !== -1) {
        entriesForDate[entryIndex].mealType = newMealType;
        entriesForDate[entryIndex].kcal = newKcal;
        entriesForDate[entryIndex].carbs = newCarbs;
        entriesForDate[entryIndex].protein = newProtein;
        entriesForDate[entryIndex].fat = newFat;
        entriesForDate[entryIndex].portion = newPortion;
        // Name is not editable in the current modal design, so not changing it.

        saveDailyFoodEntriesToLocalStorage();
        renderTodayPageMealSections(); // Refresh UI for Today page
        updateTodayPageOverallMetrics(); // Update overall metrics on Today page

        // Check if the overview page's selected date is the one being edited
        const overviewDateKey = `${selectedCalendarDate.getFullYear()}-${String(selectedCalendarDate.getMonth() + 1).padStart(2, '0')}-${String(selectedCalendarDate.getDate()).padStart(2, '0')}`;
        if (currentEditingDateKey === overviewDateKey) {
            updateDailySummary(selectedCalendarDate); // Refresh Overview page if it's the same day
        }
        
        console.log("[saveEditedFoodEntry] Entry updated successfully:", entriesForDate[entryIndex]);
        alert("Eintrag erfolgreich gespeichert!");
        closeFoodDetailModal();
    } else {
        console.error(`[saveEditedFoodEntry] Food entry with ID ${currentEditingFoodEntry.id} not found in dateKey ${currentEditingDateKey}.`);
        alert("Fehler: Zu bearbeitender Eintrag nicht gefunden.");
    }
}

function renderCalendar(date) {
    console.log('[renderCalendar] Starting. Date:', date); 
    if (!calendarGrid) {
        console.error('[renderCalendar] calendarGrid element is null or undefined! Attempting to select it again.'); 
        calendarGrid = document.getElementById('calendarGrid');
        if(!calendarGrid) {
            console.error('[renderCalendar] calendarGrid still not found after re-selection. Aborting.');
            return;
        }
    }
    if (!currentMonthDisplay) {
        console.warn('[renderCalendar] currentMonthDisplay element is null or undefined. Attempting to select it again.');
        currentMonthDisplay = document.getElementById('currentMonthDisplay');
         if(!currentMonthDisplay) {
            console.warn('[renderCalendar] currentMonthDisplay still not found after re-selection.');
        }
    }
    
    console.log('[renderCalendar] calendarGrid offsetHeight:', calendarGrid.offsetHeight); 
    console.log('[renderCalendar] calendarGrid clientHeight:', calendarGrid.clientHeight); 
    console.log('[renderCalendar] calendarGrid visibility:', window.getComputedStyle(calendarGrid).visibility); 
    console.log('[renderCalendar] calendarGrid display:', window.getComputedStyle(calendarGrid).display); 

    console.log('[renderCalendar] Clearing calendarGrid. Current innerHTML length:', calendarGrid.innerHTML.length); 
    calendarGrid.innerHTML = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => `<div class="font-semibold text-gray-500">${d}</div>`).join('');
    console.log('[renderCalendar] calendarGrid cleared or headers set.'); 

    const year = date.getFullYear(), month = date.getMonth();
    if(currentMonthDisplay) currentMonthDisplay.textContent = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(date);
    const firstDay = new Date(year, month, 1), startDay = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < startDay; i++) calendarGrid.appendChild(document.createElement('div'));
    for (let day = 1; day <= daysInMonth; day++) {
        console.log(`[renderCalendar] Creating div for day: ${day}`); 
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
    console.log('[renderCalendar] Finished appending day divs. calendarGrid.innerHTML length:', calendarGrid.innerHTML.length); 
    console.log('[renderCalendar] calendarGrid offsetHeight after rendering:', calendarGrid.offsetHeight); 
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
    if (dailySummaryDate) dailySummaryDate.textContent = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    if (consumedFoodList) consumedFoodList.innerHTML = '';
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
            if (consumedFoodList) consumedFoodList.appendChild(sectionDiv);
        }
    });
    if (entries.length === 0 && consumedFoodList) consumedFoodList.innerHTML = '<p>Keine Einträge für diesen Tag.</p>';
    if (dailyConsumedCaloriesDisplay) dailyConsumedCaloriesDisplay.textContent = `${totalKcal} kcal`;
    if (dailyRemainingCaloriesDisplay) dailyRemainingCaloriesDisplay.textContent = `Ziel ${calorieGoal - totalKcal} kcal`;
    const circ = 2 * Math.PI * 80;
    const cap = (val, max) => Math.min(val, max);
    const carbsP = cap(totalCarbsKcal, calorieGoal) / calorieGoal, proteinP = cap(totalProteinKcal, calorieGoal) / calorieGoal, fatP = cap(totalFatKcal, calorieGoal) / calorieGoal;
    if (dailyCarbsArc) { dailyCarbsArc.setAttribute('stroke-dasharray', `${carbsP * circ} ${circ * (1 - carbsP)}`); dailyCarbsArc.setAttribute('stroke-dashoffset', '0'); }
    if (dailyProteinArc) { dailyProteinArc.setAttribute('stroke-dasharray', `${proteinP * circ} ${circ * (1 - proteinP)}`); dailyProteinArc.setAttribute('stroke-dashoffset', `-${carbsP * circ}`); }
    if (dailyFatArc) { dailyFatArc.setAttribute('stroke-dasharray', `${fatP * circ} ${circ * (1 - fatP)}`); dailyFatArc.setAttribute('stroke-dashoffset', `-${(carbsP + proteinP) * circ}`); }
    if (totalKcal === 0 && dailyCarbsArc && dailyProteinArc && dailyFatArc) [dailyCarbsArc, dailyProteinArc, dailyFatArc].forEach(arc => arc.setAttribute('stroke-dasharray', `0 ${circ}`));
}

// Function to open the food detail modal and populate it with entry data
function openFoodDetailModal(foodEntry, dateKey) {
    console.log("[openFoodDetailModal] Called with foodEntry:", foodEntry, "and dateKey:", dateKey);
    currentEditingFoodEntry = foodEntry; // Ensure this is set
    currentEditingDateKey = dateKey; // Ensure this is set

    if (modalFoodNameDisplay) modalFoodNameDisplay.textContent = foodEntry.name;
    if (modalKcalInput) modalKcalInput.value = foodEntry.kcal;
    if (modalCarbsInput) modalCarbsInput.value = foodEntry.carbs || '';
    if (modalProteinInput) modalProteinInput.value = foodEntry.protein || '';
    if (modalFatInput) modalFatInput.value = foodEntry.fat || '';
    if (modalPortionInput) modalPortionInput.value = foodEntry.portion || '';

    if (modalMealTypeSelect && foodEntry.mealType) {
        modalMealTypeSelect.value = foodEntry.mealType;
    } else if (modalMealTypeSelect) {
        modalMealTypeSelect.value = ''; // Default or clear if no mealType
    }

    if (foodDetailModal) {
        foodDetailModal.classList.remove('hidden');
        console.log("[openFoodDetailModal] foodDetailModal is now visible.");
    } else {
        console.error("[openFoodDetailModal] foodDetailModal element not found!");
    }
}

function openProductDetailModal(product) {
    currentEditingProduct = product;
    if(modalProductNameDisplay) modalProductNameDisplay.textContent = product.Produktname;
    if(modalProductKcalInput) modalProductKcalInput.value = product['kcal/100g'];
    if(modalProductCarbsInput) modalProductCarbsInput.value = product['Kohlenhydrate (g)'] || '';
    if(modalProductProteinInput) modalProductProteinInput.value = product['Eiweiß (g)'] || '';
    if(modalProductFatInput) modalProductFatInput.value = product['Fett (g)'] || '';
    if(modalProductPortionInput_mealsPage) modalProductPortionInput_mealsPage.value = product['Portionsgröße (g/ml)'] || '';
    if (productDetailModal) productDetailModal.classList.remove('hidden');
}
function closeProductDetailModal() { if (productDetailModal) productDetailModal.classList.add('hidden'); currentEditingProduct = null; }
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
        products[index]['Portionsgröße (g/ml)'] = modalProductPortionInput_mealsPage.value.trim();
        saveProductsToLocalStorage(); 
        renderProductTable(); 
        closeProductDetailModal();
        alert(`"${currentEditingProduct.Produktname}" erfolgreich gespeichert!`);
    } else alert("Fehler: Produkt nicht gefunden.");
}
function deleteProductFromModal() {
    if (!currentEditingProduct) return;
    if (confirm(`Möchtest du "${currentEditingProduct.Produktname}" wirklich löschen?`)) {
        products = products.filter(p => p.id !== currentEditingProduct.id);
        saveProductsToLocalStorage(); 
        currentPage = 1; 
        renderProductTable(); 
        closeProductDetailModal();
        alert(`"${currentEditingProduct.Produktname}" wurde gelöscht.`);
    }
}

// --- Add Product to Meal Functions ---
function openProductSelectionModal(mealType) {
    currentMealTypeForAdding = mealType;
    selectedProductForMeal = null;
    if (modalProductSearchInput) modalProductSearchInput.value = '';
    if (modalProductPortionInput_addToMeal) modalProductPortionInput_addToMeal.value = '';
    renderModalProductList();
    if (addProductToMealModal) addProductToMealModal.classList.remove('hidden');
}

function closeProductSelectionModal() {
    if (addProductToMealModal) addProductToMealModal.classList.add('hidden');
}

function renderModalProductList() {
    if (!modalProductList || !modalProductSearchInput) return;
    console.log('renderModalProductList called. Search term:', modalProductSearchInput.value);
    const searchTerm = modalProductSearchInput.value.toLowerCase();
    console.log('Total products available for search:', products.length);
    const filtered = products.filter(p => p.Produktname.toLowerCase().includes(searchTerm));
    console.log('Number of products after filtering:', filtered.length);

    modalProductList.innerHTML = '';

    filtered.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('p-2', 'hover:bg-gray-200', 'cursor-pointer', 'rounded');
        productDiv.textContent = `${product.Produktname} (${product['kcal/100g'] || 0} kcal/100g)`;
        productDiv.addEventListener('click', () => {
            selectedProductForMeal = product;
            Array.from(modalProductList.children).forEach(child => child.classList.remove('bg-blue-200', 'selected'));
            productDiv.classList.add('bg-blue-200', 'selected');
            
            if (modalProductPortionInput_addToMeal) { // Check if the input element exists
                const defaultPortionText = product['Portionsgröße (g/ml)'];
                const portionValue = parseFloat(defaultPortionText); // Attempt to parse
                
                if (defaultPortionText && !isNaN(portionValue) && portionValue > 0) {
                    modalProductPortionInput_addToMeal.value = portionValue;
                } else {
                    modalProductPortionInput_addToMeal.value = ''; // Clear if no valid portion size or "N/A"
                }
            }
        });
        modalProductList.appendChild(productDiv);
    });
}

// Initializes Today Page specific event listeners
function initializeTodayPageEventListeners() {
    console.log("[initializeTodayPageEventListeners] Called for Today page.");
    // Most modal elements are globally initialized by initializeFoodDetailModalOnce.
    // This function is for any other listeners specific to the "Heute" page.
}

function initializeFoodDetailModalOnce() {
    console.log("[initializeFoodDetailModalOnce] Called to set up food detail modal elements and listeners.");
    foodDetailModal = document.getElementById('foodDetailModal');
    closeModalButton = document.getElementById('closeModalButton');
    modalFoodNameDisplay = document.getElementById('modalFoodNameDisplay');
    modalKcalInput = document.getElementById('modalKcalInput');
    modalCarbsInput = document.getElementById('modalCarbsInput');
    modalProteinInput = document.getElementById('modalProteinInput');
    modalFatInput = document.getElementById('modalFatInput');
    modalPortionInput = document.getElementById('modalPortionInput');
    modalMealTypeSelect = document.getElementById('modalMealTypeSelect');
    saveFoodEntryButton = document.getElementById('saveFoodEntryButton');
    deleteFoodEntryButton = document.getElementById('deleteFoodEntryButton');

    if(closeModalButton) {
        closeModalButton.addEventListener('click', closeFoodDetailModal);
    } else {
        console.error("[initializeFoodDetailModalOnce] closeModalButton not found.");
    }

    if(saveFoodEntryButton) {
        // Ensure currentEditingFoodEntry and currentEditingDateKey are used from the global scope
        // as they are set when the modal is opened.
        saveFoodEntryButton.addEventListener('click', () => saveEditedFoodEntry()); 
    } else {
        console.error("[initializeFoodDetailModalOnce] saveFoodEntryButton not found.");
    }

    if(deleteFoodEntryButton) {
        // Ensure currentEditingFoodEntry and currentEditingDateKey are used from the global scope.
        deleteFoodEntryButton.addEventListener('click', () => deleteFoodEntry()); // Call without arguments
    } else {
        console.error("[initializeFoodDetailModalOnce] deleteFoodEntryButton not found.");
    }
}

function deleteFoodEntry() {
    console.log("[deleteFoodEntry] Called. Attempting to delete:", currentEditingFoodEntry, "from date:", currentEditingDateKey);

    if (!currentEditingFoodEntry || !currentEditingDateKey) {
        console.error("[deleteFoodEntry] Error: No food entry is currently being edited or dateKey is missing.");
        alert("Fehler: Kein Eintrag zum Löschen ausgewählt oder Datumsschlüssel fehlt.");
        return;
    }

    if (!confirm(`Möchten Sie den Eintrag "${currentEditingFoodEntry.name}" wirklich löschen?`)) {
        return; // User cancelled
    }

    const entriesForDate = dailyFoodEntries[currentEditingDateKey];
    if (!entriesForDate) {
        console.error(`[deleteFoodEntry] No entries found for dateKey: ${currentEditingDateKey}`);
        alert("Fehler: Keine Einträge für das angegebene Datum gefunden, um etwas zu löschen.");
        closeFoodDetailModal(); // Close modal as state is inconsistent
        return;
    }

    const entryIndex = entriesForDate.findIndex(entry => entry.id === currentEditingFoodEntry.id);

    if (entryIndex !== -1) {
        entriesForDate.splice(entryIndex, 1);
        console.log(`[deleteFoodEntry] Entry with ID ${currentEditingFoodEntry.id} deleted from dateKey ${currentEditingDateKey}.`);
        
        saveDailyFoodEntriesToLocalStorage();
        
        // Refresh UI
        renderTodayPageMealSections(); 
        updateTodayPageOverallMetrics(); 
        
        // Check if the overview page's selected date is the one being edited/viewed
        // This ensures that if the deletion happens from the overview page, its summary also updates.
        const overviewDateKey = `${selectedCalendarDate.getFullYear()}-${String(selectedCalendarDate.getMonth() + 1).padStart(2, '0')}-${String(selectedCalendarDate.getDate()).padStart(2, '0')}`;
        if (currentEditingDateKey === overviewDateKey) {
            updateDailySummary(selectedCalendarDate);
        } else {
            // If deletion happened on a different day than currently viewed on overview,
            // we might still want to update the summary if that day is selectedCalendarDate.
            // However, currentEditingDateKey refers to the date of the item, 
            // and selectedCalendarDate is the one active on the overview calendar.
            // The above condition correctly handles updating the overview if the deleted item's date matches the selected calendar date.
        }
        
        alert("Eintrag erfolgreich gelöscht!");
    } else {
        console.error(`[deleteFoodEntry] Food entry with ID ${currentEditingFoodEntry.id} not found in dateKey ${currentEditingDateKey}.`);
        alert("Fehler: Zu löschender Eintrag nicht gefunden.");
    }
    
    closeFoodDetailModal();
}


function addFoodToMeal(mealType, productData, portionGrams) {
    if (!productData || isNaN(portionGrams) || portionGrams <= 0) {
        alert("Bitte wählen Sie ein Produkt aus und geben Sie eine gültige Portionsgröße ein.");
        return;
    }
    const kcalPer100g = parseFloat(productData['kcal/100g']) || 0;
    const carbsPer100g = parseFloat(productData['Kohlenhydrate (g)']) || 0;
    const proteinPer100g = parseFloat(productData['Eiweiß (g)']) || 0;
    const fatPer100g = parseFloat(productData['Fett (g)']) || 0;
    const actualKcal = (kcalPer100g / 100) * portionGrams;
    const actualCarbs = (carbsPer100g / 100) * portionGrams;
    const actualProtein = (proteinPer100g / 100) * portionGrams;
    const actualFat = (fatPer100g / 100) * portionGrams;
    const newFoodEntry = {
        id: 'food-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        name: productData.Produktname,
        kcal: Math.round(actualKcal),
        carbs: Math.round(actualCarbs),
        protein: Math.round(actualProtein),
        fat: Math.round(actualFat),
        portion: portionGrams,
        mealType: mealType
    };
    const todayDateKey = new Date().toISOString().split('T')[0];
    if (!dailyFoodEntries[todayDateKey]) dailyFoodEntries[todayDateKey] = [];
    dailyFoodEntries[todayDateKey].push(newFoodEntry);
    saveDailyFoodEntriesToLocalStorage();
    renderTodayPageMealSections(); 
    updateTodayPageOverallMetrics(); 
    closeProductSelectionModal();
    alert(`${productData.Produktname} wurde zu ${mealType} hinzugefügt!`);
}

function renderTodayPageMealSections() {
    const todayDateKey = new Date().toISOString().split('T')[0];
    const todaysEntries = dailyFoodEntries[todayDateKey] || [];
    const mealSections = {
        'Frühstück': 'todayBreakfastFoodList',
        'Mittagessen': 'todayLunchFoodList',
        'Abendessen': 'todayDinnerFoodList',
        'Snacks': 'todaySnacksFoodList'
    };

    for (const [mealType, elementId] of Object.entries(mealSections)) {
        const container = document.getElementById(elementId);
        if (!container) continue;
        container.innerHTML = ''; 
        const mealEntries = todaysEntries.filter(e => e.mealType === mealType);

        if (mealEntries.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500">Noch nichts hinzugefügt.</p>';
            continue;
        }

        mealEntries.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('flex', 'justify-between', 'items-center', 'text-sm', 'py-1');
            
            const entrySpan = document.createElement('span');
            entrySpan.textContent = `${entry.name} - ${entry.kcal} kcal (${entry.portion}g)`;
            // Make the span clickable to open the modal
            entrySpan.style.cursor = 'pointer';
            entrySpan.classList.add('hover:text-[#9FB8DF]'); // Optional: add hover effect
            entrySpan.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling if entryDiv itself has/gets other listeners
                openFoodDetailModal(entry, todayDateKey);
            });
            entryDiv.appendChild(entrySpan);
            // The main entryDiv is no longer directly clickable for opening the modal, only the span is.
            container.appendChild(entryDiv);
        });
    }
}

function updateTodayPageOverallMetrics() {
    const todayDateKey = new Date().toISOString().split('T')[0];
    const todaysEntries = dailyFoodEntries[todayDateKey] || [];
    let totalKcal = 0, totalCarbs = 0, totalProtein = 0, totalFat = 0;

    todaysEntries.forEach(entry => {
        totalKcal += entry.kcal || 0;
        totalCarbs += entry.carbs || 0;
        totalProtein += entry.protein || 0;
        totalFat += entry.fat || 0;
    });

    if (consumedCaloriesDisplay) consumedCaloriesDisplay.textContent = `${totalKcal.toFixed(0)} kcal`;
    
    const legendCarbsEl = document.getElementById('legendCarbs');
    const legendProteinEl = document.getElementById('legendProtein');
    const legendFatEl = document.getElementById('legendFat');
    if (legendCarbsEl) legendCarbsEl.textContent = `${totalCarbs.toFixed(1)} g`;
    if (legendProteinEl) legendProteinEl.textContent = `${totalProtein.toFixed(1)} g`;
    if (legendFatEl) legendFatEl.textContent = `${totalFat.toFixed(1)} g`;
    
    const todayCarbsArcElem = document.getElementById('todayCarbsArc');
    const todayProteinArcElem = document.getElementById('todayProteinArc');
    const todayFatArcElem = document.getElementById('todayFatArc');
    const circ = 2 * Math.PI * 80; 

    const carbsKcal = totalCarbs * 4;
    const proteinKcal = totalProtein * 4;
    const fatKcal = totalFat * 9;

    const carbsP = calorieGoal > 0 ? Math.min(carbsKcal / calorieGoal, 1) : 0;
    const proteinP = calorieGoal > 0 ? Math.min(proteinKcal / calorieGoal, 1) : 0;
    const fatP = calorieGoal > 0 ? Math.min(fatKcal / calorieGoal, 1) : 0;
    
    if (todayFatArcElem) {
        todayFatArcElem.setAttribute('stroke-dasharray', `${fatP * circ} ${circ * (1 - fatP)}`);
        todayFatArcElem.setAttribute('stroke-dashoffset', `0`);
    }
    if (todayProteinArcElem) {
        todayProteinArcElem.setAttribute('stroke-dasharray', `${proteinP * circ} ${circ * (1 - proteinP)}`);
        todayProteinArcElem.setAttribute('stroke-dashoffset', `-${fatP * circ}`);
    }
    if (todayCarbsArcElem) {
        todayCarbsArcElem.setAttribute('stroke-dasharray', `${carbsP * circ} ${circ * (1 - carbsP)}`);
        todayCarbsArcElem.setAttribute('stroke-dashoffset', `-${(fatP + proteinP) * circ}`);
    }
    
    if (totalKcal === 0 && todayCarbsArcElem && todayProteinArcElem && todayFatArcElem) {
        [todayCarbsArcElem, todayProteinArcElem, todayFatArcElem].forEach(arc => arc.setAttribute('stroke-dasharray', `0 ${circ}`));
    }
}


function initializeAddFoodToMealModalListeners() {
    if (closeAddProductToMealModalButton) closeAddProductToMealModalButton.addEventListener('click', closeProductSelectionModal);
    if (cancelAddProductToMealButton) cancelAddProductToMealButton.addEventListener('click', closeProductSelectionModal);
    if (modalProductSearchInput) {
        console.log('Search input listener attached.'); 
        modalProductSearchInput.addEventListener('input', () => {
            console.log('Search term:', modalProductSearchInput.value); 
            renderModalProductList();
        });
    }
    if (confirmAddProductToMealButton) {
        confirmAddProductToMealButton.addEventListener('click', () => {
            const portion = parseFloat(modalProductPortionInput_addToMeal.value);
            if (selectedProductForMeal && !isNaN(portion) && portion > 0) {
                addFoodToMeal(currentMealTypeForAdding, selectedProductForMeal, portion);
            } else {
                alert("Bitte Produkt auswählen und gültige Portion eingeben.");
            }
        });
    }
    const addMealButtons = document.querySelectorAll('.add-meal-button');
    addMealButtons.forEach(button => {
        button.addEventListener('click', function() {
            openProductSelectionModal(this.dataset.mealtype);
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => { 
    addProductToMealModal = document.getElementById('addProductToMealModal');
    closeAddProductToMealModalButton = document.getElementById('closeAddProductToMealModalButton');
    modalProductSearchInput = document.getElementById('modalProductSearchInput');
    modalProductList = document.getElementById('modalProductList');
    modalProductPortionInput_addToMeal = document.getElementById('modalAddMeal_PortionInput'); // Corrected ID
    cancelAddProductToMealButton = document.getElementById('cancelAddProductToMealButton');
    confirmAddProductToMealButton = document.getElementById('confirmAddProductToMealButton');
    
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Number of navItems found:', navItems.length); 
    navItems.forEach(item => {
        console.log('Attaching listener to navItem for page:', item.dataset.page); 
        item.addEventListener('click', () => {
            if (item.dataset.page) {
                console.log('Navigating to page:', item.dataset.page); 
                showPage(item.dataset.page);
            } else {
                console.log('Clicked navItem has no data-page attribute:', item); 
            }
        });
    });
    
    await asyncLoadProductsFromLocalStorage(); 
    initializeFoodDetailModalOnce(); // Initialize food detail modal elements and listeners once

    loadSettingsFromLocalStorage(); 
    loadDarkModePreference(); 
    loadDailyFoodEntriesFromLocalStorage(); 
    loadDailyWaterLogFromLocalStorage(); // Load daily water log
    
    const todayKeyForStartup = new Date().toISOString().split('T')[0];
    waterConsumed = dailyWaterLog[todayKeyForStartup] || 0;
    console.log('[DOMContentLoaded] Initializing waterConsumed. Key:', todayKeyForStartup, 'Value from dailyWaterLog:', dailyWaterLog[todayKeyForStartup], 'Resulting waterConsumed:', waterConsumed);
    
    updateWaterDisplay(); // Initial call to set up water display based on loaded/default goals & today's water log
    initializeAddFoodToMealModalListeners(); 
    
    renderTodayPageMealSections();
    updateTodayPageOverallMetrics();

    showPage('today-page'); 

    const updateButton = document.getElementById('updateBaseProductsButton');
    if (updateButton) {
        updateButton.addEventListener('click', updateBaseProducts);
    }

    const importButton = document.getElementById('importProductsButton');
    const fileInputElement = document.getElementById('fileInput');

    if (importButton && fileInputElement) {
        importButton.addEventListener('click', () => {
            fileInputElement.click(); // Trigger click on hidden file input
        });

        fileInputElement.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                handleImportedFile(file);
            }
            event.target.value = null; // Reset file input
        });
    }
});

function parseCsvData(csvContent) {
    const products = [];
    const lines = csvContent.trim().split('\n'); 
    if (lines.length < 2) {
        throw new Error('CSV muss eine Header-Zeile und mindestens eine Datenzeile enthalten.');
    }

    const delimiter = lines[0].includes(';') ? ';' : ',';
    
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    // For now, we assume a fixed order corresponding to:
    // "Produktname", "kcal/100g", "Kohlenhydrate (g)", "Eiweiß (g)", "Fett (g)", "Portionsgröße (g/ml)"

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue; 
        const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
        const product = {
            "Produktname": values[0] || 'Unbekanntes Produkt',
            "kcal/100g": parseFloat(values[1]) || 0,
            "Kohlenhydrate (g)": parseFloat(values[2]) || 0,
            "Eiweiß (g)": parseFloat(values[3]) || 0,
            "Fett (g)": parseFloat(values[4]) || 0,
            "Portionsgröße (g/ml)": values[5] || 'N/A'
            // id will be assigned later in processImportedData if needed
        };
        products.push(product);
    }
    return products;
}

function processImportedData(importedData, filename) {
    console.log('Starting import process for:', filename);

    if (!Array.isArray(importedData)) {
        alert('Fehler: Importierte Daten sind kein Array. Import abgebrochen.');
        return;
    }

    let currentProducts = [];
    try {
        const storedProducts = localStorage.getItem('userProducts');
        if (storedProducts) {
            currentProducts = JSON.parse(storedProducts);
        }
        if (!Array.isArray(currentProducts)) { // Ensure currentProducts is an array
            console.warn('localStorage userProducts was not an array, resetting to empty array.');
            currentProducts = [];
        }
    } catch (e) {
        console.error('Fehler beim Parsen von userProducts aus localStorage:', e);
        currentProducts = []; // Fallback to empty array on error
    }
    
    let finalProducts = [];
    const isBaseImport = filename.toLowerCase() === 'base_products.json' || filename.toLowerCase() === 'base_products.csv';

    if (isBaseImport) {
        console.log('Processing as base product import.');
        const newBaseSetWithIds = importedData.map(p => ({
            ...p,
            "Produktname": p.Produktname || "Unbekanntes Produkt",
            "kcal/100g": parseFloat(p['kcal/100g']) || 0,
            "Kohlenhydrate (g)": parseFloat(p['Kohlenhydrate (g)']) || 0,
            "Eiweiß (g)": parseFloat(p['Eiweiß (g)']) || 0,
            "Fett (g)": parseFloat(p['Fett (g)']) || 0,
            "Portionsgröße (g/ml)": p['Portionsgröße (g/ml)'] || 'N/A',
            id: (p.Produktname || 'produkt').toLowerCase().replace(/\s/g, '-') + '-' + Math.random().toString(36).substr(2, 9)
        }));
        
        const newBaseProductNames = new Set(newBaseSetWithIds.map(p => p.Produktname));
        finalProducts = [...newBaseSetWithIds]; 

        currentProducts.forEach(currentProd => {
            if (!newBaseProductNames.has(currentProd.Produktname)) {
                if (!currentProd.id) {
                     currentProd.id = (currentProd.Produktname || 'userprodukt').toLowerCase().replace(/\s/g, '-') + '-' + Math.random().toString(36).substr(2, 9);
                }
                finalProducts.push(currentProd);
            }
        });
        alert('Basisprodukte wurden erfolgreich importiert und aktualisiert. Benutzerdefinierte Produkte wurden beibehalten.');

    } else { 
        console.log('Processing as additional product import.');
        finalProducts = JSON.parse(JSON.stringify(currentProducts)); 
        const existingProductNames = new Set(finalProducts.map(p => p.Produktname));

        importedData.forEach(importedProduct => {
            const productName = importedProduct.Produktname || "Unbekanntes Produkt";
            if (!existingProductNames.has(productName)) {
                const newProduct = {
                    ...importedProduct, 
                    "Produktname": productName, 
                    "kcal/100g": parseFloat(importedProduct['kcal/100g']) || 0,
                    "Kohlenhydrate (g)": parseFloat(importedProduct['Kohlenhydrate (g)']) || 0,
                    "Eiweiß (g)": parseFloat(importedProduct['Eiweiß (g)']) || 0,
                    "Fett (g)": parseFloat(importedProduct['Fett (g)']) || 0,
                    "Portionsgröße (g/ml)": importedProduct['Portionsgröße (g/ml)'] || 'N/A',
                    id: productName.toLowerCase().replace(/\s/g, '-') + '-' + Math.random().toString(36).substr(2, 9)
                };
                finalProducts.push(newProduct);
                existingProductNames.add(productName); 
            } else {
                console.log(`Produkt "${productName}" existiert bereits und wird übersprungen.`);
            }
        });
        alert('Zusätzliche Produkte wurden importiert. Duplikate wurden übersprungen.');
    }

    products = finalProducts;
    saveProductsToLocalStorage();
    
    if (document.getElementById('meals-page').classList.contains('active') && productTableBody) {
        renderProductTable();
    } else if (typeof renderProductTable === "function") {
        console.log("Product table not directly visible, but renderProductTable called for data consistency.");
        renderProductTable(); 
    }
    console.log('Import process completed. Products updated.');
}

function handleImportedFile(file) {
    const filename = file.name;
    const fileType = filename.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (event) => {
        const fileContent = event.target.result;
        let importedData = [];

        try {
            if (fileType === 'json') {
                importedData = JSON.parse(fileContent);
                if (!Array.isArray(importedData)) {
                    throw new Error('JSON-Datei enthält kein Array von Produkten.');
                }
            } else if (fileType === 'csv') {
                importedData = parseCsvData(fileContent);
            } else {
                alert('Nicht unterstützter Dateityp. Bitte wählen Sie eine CSV- oder JSON-Datei aus.');
                return;
            }
            processImportedData(importedData, filename);
        } catch (e) {
            alert('Fehler beim Parsen der Datei: ' + e.message);
            return;
        }
    };

    reader.onerror = (error) => {
        alert('Fehler beim Lesen der Datei: ' + reader.error);
    };

    reader.readAsText(file);
}

async function updateBaseProducts() {
    console.log("Updating base products...");
    try {
        const response = await fetch('base_products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        const newBaseData = await response.json();

        if (!Array.isArray(newBaseData)) {
            throw new Error("Fetched base products data is not an array.");
        }

        let currentProducts = JSON.parse(localStorage.getItem('userProducts')) || [];
        if (!Array.isArray(currentProducts)) {
            console.warn("currentProducts from localStorage was not an array, resetting.");
            currentProducts = [];
        }

        // Assign unique IDs to new base products if they don't have one (or ensure they are unique)
        const processedNewBaseData = newBaseData.map(item => ({
            ...item,
            id: item.id || (item.Produktname.toLowerCase().replace(/\s/g, '-') + '-' + Math.random().toString(36).substr(2, 9))
        }));

        const mergedProducts = [];
        const newBaseProductNames = new Set(processedNewBaseData.map(p => p.Produktname));

        // Add all new/updated base products first
        processedNewBaseData.forEach(p => mergedProducts.push(p));

        // Add user's products that are not in the new base product list
        currentProducts.forEach(currentProd => {
            if (!newBaseProductNames.has(currentProd.Produktname)) {
                // Ensure user-added products also have an ID
                if (!currentProd.id) {
                    currentProd.id = currentProd.Produktname.toLowerCase().replace(/\s/g, '-') + '-' + Math.random().toString(36).substr(2, 9);
                }
                mergedProducts.push(currentProd);
            }
        });

        products = mergedProducts;
        saveProductsToLocalStorage();
        
        // Re-render if on meals page and productTableBody is available
        if (document.getElementById('meals-page').classList.contains('active') && productTableBody) {
            renderProductTable();
        }
        alert('Produktdatenbank wurde erfolgreich aktualisiert!');

    } catch (error) {
        console.error('Error updating base products:', error);
        alert(`Fehler beim Aktualisieren der Produktdatenbank: ${error.message}`);
    }
}

function saveProductsToLocalStorage() {
    try {
        localStorage.setItem('userProducts', JSON.stringify(products));
    } catch (error) {
        console.error('Error saving products to local storage:', error);
    }
}

async function asyncLoadProductsFromLocalStorage() {
    try {
        const storedProducts = localStorage.getItem('userProducts');
        if (storedProducts) {
            products = JSON.parse(storedProducts);
            if (!Array.isArray(products)) { 
                console.warn('Stored products format is invalid, falling back to JSON.');
                throw new Error('Invalid data format in localStorage');
            }
            console.log('Products loaded from local storage.');
            return; 
        }
        console.log('No products in local storage, fetching from base_products.json');
        await fetchAndSaveBaseProducts();
    } catch (error) {
        console.error('Error loading products from local storage:', error);
        console.log('Falling back to fetching from base_products.json due to error.');
        await fetchAndSaveBaseProducts(); 
    }
}

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
        saveProductsToLocalStorage(); 
    } catch (error) {
        console.error('Error fetching or processing base_products.json:', error);
        products = []; 
        alert(`Fehler beim Laden der Basisprodukte: ${error.message}.\nDie Produktliste ist möglicherweise leer.`);
    }
}
