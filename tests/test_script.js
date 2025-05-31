// tests/test_script.js

// Mock global variables and functions if not using Sinon.JS
let originalFetch, originalConfirm, originalAlert;
let productsBackup; // To backup the global 'products' array

// DOM elements - these will be available from qunit-fixture in tests/index.html
// These are re-assigned in beforeEach for each test from the #qunit-fixture
let productNameInput, productKcalInput, productCarbsInput, productProteinInput, productFatInput, productPortionInput;

QUnit.module('onlineProductSearch', function(hooks) {
    hooks.beforeEach(function() {
        // Backup and mock global functions
        originalFetch = window.fetch;
        originalConfirm = window.confirm;
        originalAlert = window.alert;

        // Backup and clear global products array from script.js
        // Ensure `products` is actually the array from script.js
        // If script.js is loaded correctly, `products` should be in the global scope or accessible.
        if (typeof window.products !== 'undefined') {
            productsBackup = [...window.products];
            window.products = []; // Clear it for each test
        } else {
            // Fallback if script.js's products isn't global as expected (shouldn't happen with var/let at top level of script)
            productsBackup = [];
            window.products = [];
            console.warn("window.products was undefined. Initializing for test.");
        }


        // Mock alert
        window.alert = function(message) {
            console.log("Alert called with:", message);
            window.alert.called = true;
            window.alert.lastMessage = message;
        };
        window.alert.called = false;
        window.alert.lastMessage = "";

        // Mock confirm
        window.confirm = function(message) {
            console.log("Confirm called with:", message);
            window.confirm.called = true;
            window.confirm.lastMessage = message;
            return window.confirm.returnValue || false; // Default to false, can be overridden in tests
        };
        window.confirm.called = false;
        window.confirm.lastMessage = "";
        window.confirm.returnValue = false; // Default behavior for confirm

        // Get DOM elements from qunit-fixture (defined in tests/index.html)
        // These elements should be direct children of #qunit-fixture or within a known structure.
        // The global variables like `productNameInput` in script.js are initialized by its own DOMContentLoaded or
        // functions like initializeMealsPage. In a unit test, we directly manipulate these.
        // We need to ensure that the global variables in script.js (productNameInput, etc.)
        // are pointing to our #qunit-fixture elements.

        var fixture = document.getElementById('qunit-fixture');
        // If the elements are directly under #meals-page in the fixture:
        var mealsPageFixture = fixture.querySelector('#meals-page');
        if (!mealsPageFixture) { // If #meals-page is the fixture itself
            mealsPageFixture = fixture;
        }

        // Assign to the global variables that script.js uses
        window.productNameInput = mealsPageFixture.querySelector('#productNameInput');
        window.productKcalInput = mealsPageFixture.querySelector('#productKcalInput');
        window.productCarbsInput = mealsPageFixture.querySelector('#productCarbsInput');
        window.productProteinInput = mealsPageFixture.querySelector('#productProteinInput');
        window.productFatInput = mealsPageFixture.querySelector('#productFatInput');
        window.productPortionInput = mealsPageFixture.querySelector('#productPortionInput');

        // Reset input fields values for each test
        if (window.productNameInput) window.productNameInput.value = '';
        if (window.productKcalInput) window.productKcalInput.value = '';
        if (window.productCarbsInput) window.productCarbsInput.value = '';
        if (window.productProteinInput) window.productProteinInput.value = '';
        if (window.productFatInput) window.productFatInput.value = '';
        if (window.productPortionInput) window.productPortionInput.value = '';
    });

    hooks.afterEach(function() {
        // Restore original global functions and products array
        window.fetch = originalFetch;
        window.confirm = originalConfirm;
        window.alert = originalAlert;

        if (typeof window.products !== 'undefined') {
            window.products = productsBackup; // Restore products array
        }

        // Reset call tracking on mocks
        window.alert.called = false;
        window.alert.lastMessage = "";
        window.confirm.called = false;
        window.confirm.lastMessage = "";
        window.confirm.returnValue = false;
        // QUnit automatically cleans up #qunit-fixture content.
    });

    QUnit.test('Successful online search - new product population', async function(assert) {
        assert.expect(7); // Number of assertions

        const mockApiProductName = "Test API Product";
        const mockApiResponse = {
            products: [{
                product_name_de: mockApiProductName,
                nutriments: {
                    'energy-kcal_100g': 250,
                    carbohydrates_100g: 30.5,
                    proteins_100g: 10.2,
                    fat_100g: 5.8,
                },
                serving_size: "120g"
            }]
        };

        window.fetch = async function(url) {
            return { ok: true, json: async () => mockApiResponse };
        };

        window.productNameInput.value = "User Typed Product"; // User types this

        await onlineProductSearch(); // Call the function from script.js

        assert.strictEqual(window.productNameInput.value, mockApiProductName, 'Product name input should be updated to API product name.');
        assert.strictEqual(window.productKcalInput.value, "250", 'Kcal input should be populated.');
        assert.strictEqual(window.productCarbsInput.value, "30.5", 'Carbs input should be populated.');
        assert.strictEqual(window.productProteinInput.value, "10.2", 'Protein input should be populated.');
        assert.strictEqual(window.productFatInput.value, "5.8", 'Fat input should be populated.');
        assert.strictEqual(window.productPortionInput.value, "120", 'Portion input should be populated.');
        assert.notOk(window.confirm.called, 'Confirm dialog should not be called for a new product.');
    });

    QUnit.test('Successful online search - existing product, user confirms overwrite', async function(assert) {
        assert.expect(8);
        const existingProductName = "Existing Product";
        window.products.push({ Produktname: existingProductName, id: "1", "kcal/100g": 100 }); // Add to global products array

        // Initial form values (representing what user might have typed or what was there before)
        window.productNameInput.value = existingProductName;
        window.productKcalInput.value = "100";
        window.productCarbsInput.value = "10";

        const mockApiResponse = {
            products: [{
                product_name_de: existingProductName, // Same name
                nutriments: { 'energy-kcal_100g': 300, carbohydrates_100g: 35, proteins_100g: 15, fat_100g: 10 },
                serving_size: "150g"
            }]
        };
        window.fetch = async () => ({ ok: true, json: async () => mockApiResponse });
        window.confirm.returnValue = true; // User clicks "OK"

        await onlineProductSearch();

        assert.ok(window.confirm.called, 'Confirm dialog should be called.');
        assert.strictEqual(window.confirm.lastMessage, `Produkt "${existingProductName}" existiert bereits. Möchten Sie die Daten mit den online gefundenen Werten überschreiben?`, 'Confirm message check.');
        assert.strictEqual(window.productNameInput.value, existingProductName, 'Product name input remains the same.');
        assert.strictEqual(window.productKcalInput.value, "300", 'Kcal input should be updated from API.');
        assert.strictEqual(window.productCarbsInput.value, "35.0", 'Carbs input should be updated from API.');
        assert.strictEqual(window.productProteinInput.value, "15.0", 'Protein input should be updated from API.');
        assert.strictEqual(window.productFatInput.value, "10.0", 'Fat input should be updated from API.');
        assert.strictEqual(window.productPortionInput.value, "150", 'Portion input should be updated from API.');
    });

    QUnit.test('Successful online search - existing product, user cancels overwrite', async function(assert) {
        assert.expect(8);
        const existingProductName = "Old Product";
        window.products.push({ Produktname: existingProductName, id: "2", "kcal/100g": 50 });

        // Set initial values in the form that should NOT change
        window.productNameInput.value = existingProductName; // User searches for this existing product
        window.productKcalInput.value = "50";
        window.productCarbsInput.value = "5";
        window.productProteinInput.value = "2";
        window.productFatInput.value = "1";
        window.productPortionInput.value = "25";

        const mockApiResponse = { // API returns different data
            products: [{
                product_name_de: existingProductName,
                nutriments: { 'energy-kcal_100g': 400, carbohydrates_100g: 40, proteins_100g: 20, fat_100g: 15 },
                serving_size: "200g"
            }]
        };
        window.fetch = async () => ({ ok: true, json: async () => mockApiResponse });
        window.confirm.returnValue = false; // User clicks "Cancel"

        await onlineProductSearch();

        assert.ok(window.confirm.called, 'Confirm dialog should be called.');
        assert.strictEqual(window.productNameInput.value, existingProductName, 'Product name input should NOT change.');
        assert.strictEqual(window.productKcalInput.value, "50", 'Kcal input should NOT change.');
        assert.strictEqual(window.productCarbsInput.value, "5", 'Carbs input should NOT change.');
        assert.strictEqual(window.productProteinInput.value, "2", 'Protein input should NOT change.');
        assert.strictEqual(window.productFatInput.value, "1", 'Fat input should NOT change.');
        assert.strictEqual(window.productPortionInput.value, "25", 'Portion input should NOT change.');
        assert.ok(window.alert.called, 'Alert should be called (even if confirm is cancelled, the current implementation shows an alert).');
        // The current implementation of onlineProductSearch shows an alert like "Daten für ... geladen" even if confirm is false,
        // because populateProductFields is called before the confirm check in one branch. This might be a bug in script.js or intended.
        // For the test, we reflect the current behavior. If the behavior of script.js changes, this test might need adjustment.
        // Based on the current code, the "Daten ... geladen/aktualisiert" alert is shown *after* the confirm block.
        // If confirm is false, it should return early. Let's re-check script.js logic.
        // The `return;` is inside the `if (existingProduct)` block, after the confirm. So if confirm is false, it returns.
        // This means no "Daten ... geladen" alert should appear.
        // Let's adjust the assertion based on the current code logic.
        // The alert "Daten für ... geladen" is only IF fields are populated. If user cancels, it should not populate.
        // The `populateProductFields` is called only if `confirm` is true OR if it's not an existing product.
        // So, if user cancels, NO "Daten ... geladen" alert. My previous comment was wrong.
        // The only alert would be if the `onlineProductSearch` itself had a final generic alert, which it doesn't.
        // Let's verify `alert.called` is false if the only alert is the "Daten ... geladen" one.
        // The current code has `alert(Daten für "${productDataToLoad.name}" wurden im Formular aktualisiert.);`
        // or `alert(Daten für "${productDataToLoad.name}" wurden in das Formular geladen.);`
        // These are *after* the `confirm` block or in the `else` of `existingProduct`.
        // So if user cancels, these alerts are NOT called.
        // The only alert that could be called is from an error or "no product found".
        // In this case, product *is* found, confirm is just cancelled. So no alert.
        assert.notOk(window.alert.called, 'No alert should be shown if user cancels overwrite and no other message is triggered.');

    });

    QUnit.test('API returns no products', async function(assert) {
        assert.expect(7);
        window.productNameInput.value = "Unknown Product";
        window.productKcalInput.value = "1"; // Initial value
        window.productCarbsInput.value = "1";
        window.productProteinInput.value = "1";
        window.productFatInput.value = "1";
        window.productPortionInput.value = "1";


        window.fetch = async () => ({ ok: true, json: async () => ({ products: [] }) });

        await onlineProductSearch();

        assert.ok(window.alert.called, 'Alert should be called.');
        assert.strictEqual(window.alert.lastMessage, "Keine Produkte für diesen Suchbegriff gefunden.", 'Alert message for no products found.');
        assert.strictEqual(window.productNameInput.value, "Unknown Product", 'Product name input should NOT change.');
        assert.strictEqual(window.productKcalInput.value, "1", 'Kcal input should NOT change.');
        assert.strictEqual(window.productCarbsInput.value, "1", 'Carbs input should NOT change.');
        assert.strictEqual(window.productProteinInput.value, "1", 'Protein input should NOT change.');
        assert.strictEqual(window.productFatInput.value, "1", 'Fat input should NOT change.');
        // Portion input is not explicitly checked for not changing if it was initially empty, but other fields cover the non-change aspect.
    });

    QUnit.test('API request fails (network error)', async function(assert) {
        assert.expect(2);
        window.productNameInput.value = "Product X";
        const networkErrorMessage = "Network error";
        window.fetch = async () => { throw new Error(networkErrorMessage); };

        await onlineProductSearch();

        assert.ok(window.alert.called, 'Alert should be called on network error.');
        assert.strictEqual(window.alert.lastMessage, `Fehler bei der Online-Suche: Error: ${networkErrorMessage}`, 'Alert message for network error.');
    });

    QUnit.test('API request fails (non-OK status)', async function(assert) {
        assert.expect(2);
        window.productNameInput.value = "Product Y";
        window.fetch = async () => ({ ok: false, status: 500, statusText: "Internal Server Error" });

        await onlineProductSearch();

        assert.ok(window.alert.called, 'Alert should be called on API non-OK status.');
        assert.strictEqual(window.alert.lastMessage, "Fehler bei der Online-Suche: API request failed with status 500: Internal Server Error", 'Alert message for API error status.');
    });


    QUnit.test('Product name input is empty', async function(assert) {
        assert.expect(1);
        window.productNameInput.value = ""; // Empty input

        await onlineProductSearch();

        assert.ok(window.alert.called, 'Alert should be called.');
        assert.strictEqual(window.alert.lastMessage, "Bitte geben Sie einen Produktnamen ein, um online zu suchen.", 'Alert message for empty product name.');
        // No need to check other fields as the function should return early.
    });
});
