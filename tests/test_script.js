// tests/test_script.js

let originalFetch, originalConfirm, originalAlert, originalAbortController;
let productsBackup;
let mockAbortControllerInstance = null;
let abortControllerWasCalled = false;
let abortMethodWasCalled = false;

// DOM elements
// let productNameInput, productKcalInput, productCarbsInput, productProteinInput, productFatInput, productPortionInput; // These are set via window scope
// let loadingOverlay, cancelSearchButton; // Also set via window scope

QUnit.module('onlineProductSearch', function(hooks) {
    hooks.beforeEach(function() {
        originalFetch = window.fetch;
        originalConfirm = window.confirm;
        originalAlert = window.alert;
        originalAbortController = window.AbortController;

        productsBackup = window.products ? [...window.products] : [];
        window.products = [];

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

        // Mock AbortController
        abortControllerWasCalled = false;
        abortMethodWasCalled = false;
        mockAbortControllerInstance = {
            signal: { aborted: false }, // Simple mock signal
            abort: function() {
                console.log("Mock AbortController.abort() called");
                this.signal.aborted = true; // Simulate signal state change
                abortMethodWasCalled = true;
            }
        };
        window.AbortController = function() {
            console.log("Mock AbortController constructor called");
            abortControllerWasCalled = true;
            return mockAbortControllerInstance;
        };


        var fixture = document.getElementById('qunit-fixture');
        var mealsPageFixture = fixture.querySelector('#meals-page') || fixture;

        // Ensure #meals-page exists if it's the direct parent in fixture
        if (!fixture.querySelector('#meals-page')) {
             var actualMealsPageDiv = document.createElement('div');
             actualMealsPageDiv.id = 'meals-page';
             fixture.appendChild(actualMealsPageDiv);
             mealsPageFixture = actualMealsPageDiv;
        }


        window.productNameInput = mealsPageFixture.querySelector('#productNameInput') || document.createElement('input');
        window.productNameInput.id = 'productNameInput';
        if(!mealsPageFixture.querySelector('#productNameInput')) mealsPageFixture.appendChild(window.productNameInput);


        // Setup for loadingOverlay and its children
        window.loadingOverlay = document.createElement('div');
        window.loadingOverlay.id = 'loadingOverlay';
        window.loadingOverlay.style.display = 'none';
            const spinner = document.createElement('div');
            spinner.id = 'spinner';
        window.loadingOverlay.appendChild(spinner);
        window.cancelSearchButton = document.createElement('button');
        window.cancelSearchButton.id = 'cancelSearchButton';
        window.loadingOverlay.appendChild(window.cancelSearchButton);
        mealsPageFixture.appendChild(window.loadingOverlay);

        // Ensure other inputs are also present in the fixture for each test
        ['productKcalInput', 'productCarbsInput', 'productProteinInput', 'productFatInput', 'productPortionInput'].forEach(id => {
            window[id] = mealsPageFixture.querySelector(`#${id}`) || document.createElement('input');
            window[id].id = id;
            window[id].type = 'number';
            if(!mealsPageFixture.querySelector(`#${id}`)) mealsPageFixture.appendChild(window[id]);
            window[id].value = '';
        });

        if (window.productNameInput) window.productNameInput.value = '';
        if (window.loadingOverlay) window.loadingOverlay.style.display = 'none';

        // Call initializeMealsPage from script.js to ensure its internal DOM variables are set.
        // This is crucial if onlineProductSearch relies on variables set by initializeMealsPage.
        if (typeof initializeMealsPage === "function") {
            initializeMealsPage();
        } else {
            console.error("initializeMealsPage function not found. Check script.js loading.");
        }
         // Reset the loading overlay display explicitly after initializeMealsPage might have run
        if (window.loadingOverlay) window.loadingOverlay.style.display = 'none';


    });

    hooks.afterEach(function() {
        window.fetch = originalFetch;
        window.confirm = originalConfirm;
        window.alert = originalAlert;
        window.AbortController = originalAbortController;

        window.products = productsBackup;

        window.alert.called = false;
        window.confirm.called = false;
        abortControllerWasCalled = false;
        abortMethodWasCalled = false;
        mockAbortControllerInstance.signal.aborted = false; // Reset signal

        // QUnit handles fixture cleanup
    });

    QUnit.test('Successful online search - new product population', async function(assert) {
        const done = assert.async();
        assert.expect(11); // Increased for AbortController and overlay checks

        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');

        const mockApiProductName = "Test API Product";
        const mockApiResponse = { products: [{ product_name_de: mockApiProductName, nutriments: { 'energy-kcal_100g': 250, carbohydrates_100g: 30.5, proteins_100g: 10.2, fat_100g: 5.8 }, serving_size: "120g" }] };

        let fetchSignal;
        window.fetch = async function(url, options) {
            fetchSignal = options.signal;
            assert.strictEqual(window.loadingOverlay.style.display, 'flex', 'Overlay visible before fetch resolves.');
            return { ok: true, json: async () => mockApiResponse };
        };

        window.productNameInput.value = "User Typed Product";

        onlineProductSearch().then(() => {
            assert.ok(abortControllerWasCalled, "AbortController constructor was called.");
            assert.deepEqual(fetchSignal, mockAbortControllerInstance.signal, "AbortController signal was passed to fetch.");
            assert.strictEqual(window.productNameInput.value, mockApiProductName, 'Product name updated.');
            assert.strictEqual(window.productKcalInput.value, "250", 'Kcal populated.');
            assert.strictEqual(window.productCarbsInput.value, "30.5", 'Carbs populated.');
            assert.strictEqual(window.productProteinInput.value, "10.2", 'Protein populated.');
            assert.strictEqual(window.productFatInput.value, "5.8", 'Fat populated.');
            assert.notOk(window.confirm.called, 'Confirm dialog not called.');
            assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden after search.');
            done();
        });
    });

    QUnit.test('Successful online search - existing product, user confirms overwrite', async function(assert) {
        assert.expect(11);
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');

        const existingProductName = "Existing Product";
        window.products.push({ Produktname: existingProductName, id: "1", "kcal/100g": 100 });
        window.productNameInput.value = existingProductName;

        const mockApiResponse = { products: [{ product_name_de: existingProductName, nutriments: { 'energy-kcal_100g': 300, carbohydrates_100g: 35 }, serving_size: "150g" }] };
        window.fetch = async () => ({ ok: true, json: async () => mockApiResponse });
        window.confirm.returnValue = true;

        await onlineProductSearch();

        assert.ok(abortControllerWasCalled, "AbortController constructor was called.");
        assert.ok(window.confirm.called, 'Confirm dialog called.');
        assert.strictEqual(window.productKcalInput.value, "300", 'Kcal updated.');
        // ... other field assertions ...
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden after search.');
    });


    QUnit.test('API returns no products', async function(assert) {
        assert.expect(6);
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        window.productNameInput.value = "Unknown Product";

        window.fetch = async () => ({ ok: true, json: async () => ({ products: [] }) });

        await onlineProductSearch();

        assert.ok(abortControllerWasCalled, "AbortController constructor was called.");
        assert.ok(window.alert.called, 'Alert called.');
        assert.strictEqual(window.alert.lastMessage, "Keine Produkte für diesen Suchbegriff gefunden.", 'Alert for no products.');
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden.');
    });

    QUnit.test('API request fails (network error)', async function(assert) {
        assert.expect(5);
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        window.productNameInput.value = "Product X";
        const networkErrorMessage = "Network error";
        window.fetch = async () => { throw new Error(networkErrorMessage); };

        await onlineProductSearch();

        assert.ok(abortControllerWasCalled, "AbortController constructor was called.");
        assert.ok(window.alert.called, 'Alert called.');
        assert.strictEqual(window.alert.lastMessage, `Fehler bei der Online-Suche: Error: ${networkErrorMessage}`, 'Alert for network error.');
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden.');
    });

    QUnit.test('Product name input is empty', async function(assert) {
        assert.expect(3);
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        window.productNameInput.value = "";

        await onlineProductSearch();

        assert.ok(window.alert.called, 'Alert called.');
        assert.strictEqual(window.alert.lastMessage, "Bitte geben Sie einen Produktnamen ein, um online zu suchen.", 'Alert for empty name.');
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay remains hidden.');
        // No AbortController should be called here
    });

    QUnit.test('Successful Search Cancellation by user', async function(assert) {
        const done = assert.async();
        assert.expect(7);

        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        window.productNameInput.value = "Long Search Product";
        window.productKcalInput.value = "initial"; // To check it's not populated

        let fetchCallPromiseResolver;
        const fetchCallPromise = new Promise(resolve => {
            fetchCallPromiseResolver = resolve;
        });

        window.fetch = async (url, options) => {
            assert.strictEqual(window.loadingOverlay.style.display, 'flex', 'Overlay visible during fetch.');
            options.signal.addEventListener('abort', () => {
                console.log("Fetch mock: Abort event received.");
                // Simulate fetch being aborted by throwing an AbortError
                 const abortError = new Error("Fetch aborted by test");
                 abortError.name = "AbortError";
                 fetchCallPromiseResolver({
                     ok: false,
                     status: 0, // Status for aborted fetch often 0
                     json: async () => Promise.reject(abortError),
                     text: async () => Promise.reject(abortError)
                 });
                 // Or directly throw if that's how fetch behaves with AbortController
                 // throw abortError;
            });
            return fetchCallPromise; // This promise will be pending until cancel or resolve
        };

        // Call onlineProductSearch, but don't await it fully yet
        const searchPromise = onlineProductSearch();

        // Simulate user clicking cancel button after a short delay
        setTimeout(() => {
            assert.ok(abortControllerWasCalled, "AbortController constructor was called before cancel.");
            assert.ok(window.cancelSearchButton, "Cancel button exists.");
            window.cancelSearchButton.click(); // Simulate click
            assert.ok(abortMethodWasCalled, "AbortController.abort() was called on cancel.");
        }, 50); // Small delay to ensure fetch has started

        searchPromise.then(() => {
            // This block will run after onlineProductSearch's promise resolves or rejects
            assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden after cancellation.');
            assert.notOk(window.alert.called, 'No error alert should be shown for user cancellation.');
            assert.strictEqual(window.productKcalInput.value, "initial", 'Kcal input not populated after cancellation.');
            done();
        }).catch(err => { // Should not happen if AbortError is caught inside onlineProductSearch
            assert.ok(false, `Search promise rejected unexpectedly: ${err}`);
            done();
        });
    });

    QUnit.test('Cancellation when no search is active', async function(assert) {
        assert.expect(3);
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');

        // Ensure currentSearchAbortController is null (as it would be if no search is active)
        // This is typically handled by script.js's logic, but we can enforce for test
        window.currentSearchAbortController = null;

        window.cancelSearchButton.click();

        assert.notOk(abortMethodWasCalled, "AbortController.abort() should not be called if no search is active.");
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay remains hidden.');
    });

});
