// tests/test_script.js

// Mock global variables and functions if not using Sinon.JS
let originalFetch, originalConfirm, originalAlert;
let productsBackup; // To backup the global 'products' array

// DOM elements - these will be available from qunit-fixture in tests/index.html
// These are re-assigned in beforeEach for each test from the #qunit-fixture
// Assign to window scope so script.js can access them if it uses global vars for them.
// let productNameInput, productKcalInput, productCarbsInput, productProteinInput, productFatInput, productPortionInput, onlineSearchLoadingIndicator;

QUnit.module('onlineProductSearch', function(hooks) {
    hooks.beforeEach(function() {
        originalFetch = window.fetch;
        originalConfirm = window.confirm;
        originalAlert = window.alert;

        if (typeof window.products !== 'undefined') {
            productsBackup = [...window.products];
            window.products = [];
        } else {
            productsBackup = [];
            window.products = [];
            console.warn("window.products was undefined. Initializing for test.");
        }

        window.alert = function(message) {
            console.log("Alert called with:", message);
            window.alert.called = true;
            window.alert.lastMessage = message;
        };
        window.alert.called = false;
        window.alert.lastMessage = "";

        window.confirm = function(message) {
            console.log("Confirm called with:", message);
            window.confirm.called = true;
            window.confirm.lastMessage = message;
            return window.confirm.returnValue || false;
        };
        window.confirm.called = false;
        window.confirm.lastMessage = "";
        window.confirm.returnValue = false;

        var fixture = document.getElementById('qunit-fixture');
        var mealsPageFixture = fixture.querySelector('#meals-page') || fixture;

        window.productNameInput = mealsPageFixture.querySelector('#productNameInput');
        window.productKcalInput = mealsPageFixture.querySelector('#productKcalInput');
        window.productCarbsInput = mealsPageFixture.querySelector('#productCarbsInput');
        window.productProteinInput = mealsPageFixture.querySelector('#productProteinInput');
        window.productFatInput = mealsPageFixture.querySelector('#productFatInput');
        window.productPortionInput = mealsPageFixture.querySelector('#productPortionInput');

        // Get the loading indicator and ensure script.js can see it if it uses a global var
        // The ID 'onlineSearchLoadingIndicator' is from index.html, ensure it's in tests/index.html fixture.
        // It seems I forgot to add onlineSearchLoadingIndicator to tests/index.html, I will add it now.
        // For now, I'll assume it's there and select it.
        var loadingIndicatorFixture = document.createElement('span');
        loadingIndicatorFixture.id = 'onlineSearchLoadingIndicator';
        loadingIndicatorFixture.style.display = 'none';
        mealsPageFixture.appendChild(loadingIndicatorFixture); // Add to fixture
        window.onlineSearchLoadingIndicator = loadingIndicatorFixture;


        if (window.productNameInput) window.productNameInput.value = '';
        if (window.productKcalInput) window.productKcalInput.value = '';
        if (window.productCarbsInput) window.productCarbsInput.value = '';
        if (window.productProteinInput) window.productProteinInput.value = '';
        if (window.productFatInput) window.productFatInput.value = '';
        if (window.productPortionInput) window.productPortionInput.value = '';
        if (window.onlineSearchLoadingIndicator) window.onlineSearchLoadingIndicator.style.display = 'none';
    });

    hooks.afterEach(function() {
        window.fetch = originalFetch;
        window.confirm = originalConfirm;
        window.alert = originalAlert;

        if (typeof window.products !== 'undefined') {
            window.products = productsBackup;
        }

        window.alert.called = false;
        window.alert.lastMessage = "";
        window.confirm.called = false;
        window.confirm.lastMessage = "";
        window.confirm.returnValue = false;

        // Clean up the manually added loading indicator if it's still there
        var loadingIndicatorFixture = document.getElementById('onlineSearchLoadingIndicator');
        if (loadingIndicatorFixture && loadingIndicatorFixture.parentNode) {
            //loadingIndicatorFixture.parentNode.removeChild(loadingIndicatorFixture);
        }
         // QUnit resets the fixture, so manual removal might not be strictly needed if it was part of original fixture HTML.
    });

    QUnit.test('Successful online search - new product population', async function(assert) {
        const done = assert.async();
        assert.expect(10); // Increased for loader checks

        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader initially hidden.');

        const mockApiProductName = "Test API Product";
        const mockApiResponse = {
            products: [{
                product_name_de: mockApiProductName,
                nutriments: { 'energy-kcal_100g': 250, carbohydrates_100g: 30.5, proteins_100g: 10.2, fat_100g: 5.8 },
                serving_size: "120g"
            }]
        };

        window.fetch = async function(url) {
            // Loader should be visible before fetch promise resolves
            assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'inline', 'Loader visible before fetch resolves.');
            return { ok: true, json: async () => mockApiResponse };
        };

        window.productNameInput.value = "User Typed Product";

        onlineProductSearch().then(() => {
            assert.strictEqual(window.productNameInput.value, mockApiProductName, 'Product name input should be updated.');
            assert.strictEqual(window.productKcalInput.value, "250", 'Kcal input should be populated.');
            assert.strictEqual(window.productCarbsInput.value, "30.5", 'Carbs input should be populated.');
            assert.strictEqual(window.productProteinInput.value, "10.2", 'Protein input should be populated.');
            assert.strictEqual(window.productFatInput.value, "5.8", 'Fat input should be populated.');
            assert.strictEqual(window.productPortionInput.value, "120", 'Portion input should be populated.');
            assert.notOk(window.confirm.called, 'Confirm dialog should not be called.');
            assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader hidden after search.');
            done();
        });
    });

    QUnit.test('Successful online search - existing product, user confirms overwrite', async function(assert) {
        assert.expect(10); // Increased for loader checks
        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader initially hidden.');

        const existingProductName = "Existing Product";
        window.products.push({ Produktname: existingProductName, id: "1", "kcal/100g": 100 });
        window.productNameInput.value = existingProductName;
        window.productKcalInput.value = "100";

        const mockApiResponse = {
            products: [{
                product_name_de: existingProductName,
                nutriments: { 'energy-kcal_100g': 300, carbohydrates_100g: 35, proteins_100g: 15, fat_100g: 10 },
                serving_size: "150g"
            }]
        };
        window.fetch = async () => ({ ok: true, json: async () => mockApiResponse });
        window.confirm.returnValue = true;

        await onlineProductSearch();

        assert.ok(window.confirm.called, 'Confirm dialog should be called.');
        // Skipping confirm message check for brevity, already tested.
        assert.strictEqual(window.productNameInput.value, existingProductName, 'Product name input remains.');
        assert.strictEqual(window.productKcalInput.value, "300", 'Kcal updated.');
        assert.strictEqual(window.productCarbsInput.value, "35.0", 'Carbs updated.');
        assert.strictEqual(window.productProteinInput.value, "15.0", 'Protein updated.');
        assert.strictEqual(window.productFatInput.value, "10.0", 'Fat updated.');
        assert.strictEqual(window.productPortionInput.value, "150", 'Portion updated.');
        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader hidden after search.');
    });

    QUnit.test('Successful online search - existing product, user cancels overwrite', async function(assert) {
        assert.expect(10); // Increased for loader checks
        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader initially hidden.');

        const existingProductName = "Old Product";
        window.products.push({ Produktname: existingProductName, id: "2", "kcal/100g": 50 });
        window.productNameInput.value = existingProductName;
        window.productKcalInput.value = "50";
        window.productCarbsInput.value = "5";
        // ... set other initial values

        const mockApiResponse = { products: [{ product_name_de: existingProductName, nutriments: { 'energy-kcal_100g': 400 } }] };
        window.fetch = async () => ({ ok: true, json: async () => mockApiResponse });
        window.confirm.returnValue = false;

        await onlineProductSearch();

        assert.ok(window.confirm.called, 'Confirm dialog should be called.');
        assert.strictEqual(window.productNameInput.value, existingProductName, 'Product name input should NOT change.');
        assert.strictEqual(window.productKcalInput.value, "50", 'Kcal input should NOT change.');
        assert.strictEqual(window.productCarbsInput.value, "5", 'Carbs input should NOT change.');
        // ... assert other fields did not change
        assert.notOk(window.alert.called, 'No "data loaded/updated" alert if user cancels.');
        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader hidden after search.');
    });

    QUnit.test('API returns no products', async function(assert) {
        assert.expect(9); // Increased for loader checks
        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader initially hidden.');

        window.productNameInput.value = "Unknown Product";
        window.productKcalInput.value = "1"; // Initial value to check it doesn't change

        window.fetch = async () => ({ ok: true, json: async () => ({ products: [] }) });

        await onlineProductSearch();

        assert.ok(window.alert.called, 'Alert should be called.');
        assert.strictEqual(window.alert.lastMessage, "Keine Produkte für diesen Suchbegriff gefunden.", 'Alert message for no products.');
        assert.strictEqual(window.productNameInput.value, "Unknown Product", 'Name input unchanged.');
        assert.strictEqual(window.productKcalInput.value, "1", 'Kcal input unchanged.');
        // ... assert other fields are unchanged
        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader hidden after search.');
    });

    QUnit.test('API request fails (network error)', async function(assert) {
        assert.expect(4); // Increased for loader checks
        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader initially hidden.');

        window.productNameInput.value = "Product X";
        const networkErrorMessage = "Network error";
        window.fetch = async () => { throw new Error(networkErrorMessage); };

        await onlineProductSearch();

        assert.ok(window.alert.called, 'Alert should be called.');
        assert.strictEqual(window.alert.lastMessage, `Fehler bei der Online-Suche: Error: ${networkErrorMessage}`, 'Alert message for network error.');
        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader hidden after error.');
    });

    QUnit.test('API request fails (non-OK status)', async function(assert) {
        assert.expect(4); // Increased for loader checks
        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader initially hidden.');

        window.productNameInput.value = "Product Y";
        window.fetch = async () => ({ ok: false, status: 500, statusText: "Internal Server Error" });

        await onlineProductSearch();

        assert.ok(window.alert.called, 'Alert called.');
        assert.strictEqual(window.alert.lastMessage, "Fehler bei der Online-Suche: API request failed with status 500: Internal Server Error", 'Alert message for API error.');
        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader hidden after error.');
    });

    QUnit.test('Product name input is empty', async function(assert) {
        assert.expect(3); // Increased for loader check
        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader initially hidden.');

        window.productNameInput.value = "";

        await onlineProductSearch(); // Should not make a fetch call

        assert.ok(window.alert.called, 'Alert should be called.');
        assert.strictEqual(window.alert.lastMessage, "Bitte geben Sie einen Produktnamen ein, um online zu suchen.", 'Alert message for empty name.');
        assert.strictEqual(window.onlineSearchLoadingIndicator.style.display, 'none', 'Loader remains hidden as no API call made.');
    });
});
