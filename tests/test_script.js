// tests/test_script.js

let originalFetch, originalConfirm, originalAlert, originalAbortController;
let productsBackup;
let mockAbortControllerInstance = null;
let abortControllerWasCalled = false; // Tracks if 'new AbortController()' was called
let abortMethodWasCalled = false;   // Tracks if 'abortController.abort()' was called
let lastFetchUrl = "";              // Stores the URL of the last fetch call
let lastFetchOptions = null;        // Stores the options of the last fetch call


QUnit.module('onlineProductSearch', function(hooks) {
    hooks.beforeEach(function() {
        originalFetch = window.fetch;
        originalConfirm = window.confirm;
        originalAlert = window.alert;
        originalAbortController = window.AbortController;

        productsBackup = window.products ? [...window.products] : [];
        window.products = [];

        window.alert = function(message) {
            // console.log("Alert called with:", message); // Uncomment for debugging
            window.alert.called = true;
            window.alert.lastMessage = message;
        };
        window.alert.called = false;
        window.alert.lastMessage = "";

        window.confirm = function(message) {
            // console.log("Confirm called with:", message); // Uncomment for debugging
            window.confirm.called = true;
            window.confirm.lastMessage = message;
            return window.confirm.returnValue || false;
        };
        window.confirm.called = false;
        window.confirm.lastMessage = "";
        window.confirm.returnValue = false;

        abortControllerWasCalled = false;
        abortMethodWasCalled = false;
        lastFetchUrl = "";
        lastFetchOptions = null;

        mockAbortControllerInstance = {
            signal: { aborted: false, addEventListener: (event, cb) => { /* mock */ } },
            abort: function() {
                // console.log("Mock AbortController.abort() called"); // Uncomment for debugging
                this.signal.aborted = true;
                abortMethodWasCalled = true;
                // Simulate dispatching the abort event if any listener was added
                if (this.signal.onabort) this.signal.onabort();
            }
        };
        window.AbortController = function() {
            // console.log("Mock AbortController constructor called"); // Uncomment for debugging
            abortControllerWasCalled = true;
            return mockAbortControllerInstance;
        };

        var fixture = document.getElementById('qunit-fixture');
        var mealsPageFixture = fixture.querySelector('#meals-page');
        if (!mealsPageFixture) {
             var actualMealsPageDiv = document.createElement('div');
             actualMealsPageDiv.id = 'meals-page';
             fixture.appendChild(actualMealsPageDiv);
             mealsPageFixture = actualMealsPageDiv;
        }

        // Ensure all necessary input fields and overlay elements are created in the fixture
        const idsToCreate = ['productNameInput', 'productKcalInput', 'productCarbsInput', 'productProteinInput', 'productFatInput', 'productPortionInput'];
        idsToCreate.forEach(id => {
            window[id] = mealsPageFixture.querySelector(`#${id}`) || document.createElement('input');
            window[id].id = id;
            window[id].type = (id === 'productNameInput') ? 'text' : 'number';
            if(!mealsPageFixture.querySelector(`#${id}`)) mealsPageFixture.appendChild(window[id]);
            window[id].value = '';
        });

        window.loadingOverlay = mealsPageFixture.querySelector('#loadingOverlay') || document.createElement('div');
        window.loadingOverlay.id = 'loadingOverlay';
        if (!mealsPageFixture.querySelector('#loadingOverlay')) mealsPageFixture.appendChild(window.loadingOverlay);

        window.loadingOverlay.innerHTML = '<div id="spinner"></div><button id="cancelSearchButton"></button>'; // Ensure children exist
        window.spinner = window.loadingOverlay.querySelector('#spinner');
        window.cancelSearchButton = window.loadingOverlay.querySelector('#cancelSearchButton');
        window.loadingOverlay.style.display = 'none';

        if (typeof initializeMealsPage === "function") {
            initializeMealsPage(); // This will set up event listeners on the actual cancelSearchButton
        } else {
            console.error("initializeMealsPage function not found.");
        }
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
        if (mockAbortControllerInstance) mockAbortControllerInstance.signal.aborted = false;
        lastFetchUrl = "";
        lastFetchOptions = null;
    });

    // Helper to create mock API responses
    function createMockApiResponse(productsArray) {
        return { products: productsArray || [], count: (productsArray || []).length, page: 1, page_size: 5 };
    }

    // Helper for fetch mock
    function mockFetch(responseData, shouldBeOk = true, status = 200) {
        window.fetch = async function(url, options) {
            lastFetchUrl = url;
            lastFetchOptions = options;
            if (window.loadingOverlay) { // Check immediately after fetch is called
                 assert.strictEqual(window.loadingOverlay.style.display, 'flex', 'Overlay visible when fetch is initiated.');
            }
            if (!shouldBeOk) {
                const error = new Error("Simulated fetch error");
                error.response = { ok: false, status: status, statusText: "Error" }; // Attach response-like object if needed
                throw error;
            }
            return {
                ok: true,
                json: async () => responseData,
                text: async () => JSON.stringify(responseData) // Added for completeness
            };
        };
    }

    QUnit.test('API URL check - parameters page_size and sort_by', async function(assert) {
        assert.expect(3); // Includes initial overlay hidden check + 2 for URL params
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        window.productNameInput.value = "Test Product";

        mockFetch(createMockApiResponse([{ product_name_de: "Test Product" }]));
        await onlineProductSearch();

        assert.ok(lastFetchUrl.includes('page_size=5'), 'Fetch URL includes page_size=5.');
        assert.ok(lastFetchUrl.includes('sort_by=unique_scans_n'), 'Fetch URL includes sort_by=unique_scans_n.');
    });

    QUnit.test('Selection Logic: Exact Match', async function(assert) {
        assert.expect(7); // initial overlay, fetch overlay, abort called, signal, final overlay, name, kcal
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        const searchTerm = "Exact Product Name";
        window.productNameInput.value = searchTerm;

        const productsData = [
            { product_name_de: "Some other product", nutriments: { 'energy-kcal_100g': 100 } },
            { product_name_de: "Exact Product Name", nutriments: { 'energy-kcal_100g': 250, carbohydrates_100g: 30 } }, // Exact match
            { product_name_de: "Exact Product Name Plus", nutriments: { 'energy-kcal_100g': 150 } }
        ];
        mockFetch(createMockApiResponse(productsData));

        await onlineProductSearch();

        assert.ok(abortControllerWasCalled, "AbortController constructor was called.");
        assert.deepEqual(lastFetchOptions.signal, mockAbortControllerInstance.signal, "Signal passed to fetch.");
        assert.strictEqual(window.productNameInput.value, "Exact Product Name", "Exact match product name populated.");
        assert.strictEqual(window.productKcalInput.value, "250", "Exact match kcal populated.");
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden after search.');
    });

    QUnit.test('Selection Logic: "Starts With" Match', async function(assert) {
        assert.expect(6); // initial overlay, fetch overlay, abort called, final overlay, name, kcal
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        const searchTerm = "Start";
        window.productNameInput.value = searchTerm;

        const productsData = [
            { product_name_de: "Does Not Match", nutriments: { 'energy-kcal_100g': 100 } },
            { product_name_de: "Starting Fresh", nutriments: { 'energy-kcal_100g': 300 } }, // Starts with, but second
            { product_name_de: "Start Product Here", nutriments: { 'energy-kcal_100g': 200, proteins_100g: 10 } }, // "Starts with" match
        ];
        mockFetch(createMockApiResponse(productsData));

        await onlineProductSearch();
        assert.ok(abortControllerWasCalled, "AbortController constructor was called.");
        assert.strictEqual(window.productNameInput.value, "Start Product Here", "'Starts With' match product name populated.");
        assert.strictEqual(window.productKcalInput.value, "200", "'Starts With' match kcal populated.");
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden after search.');
    });

    QUnit.test('Selection Logic: Heuristic Fallback (Good Match)', async function(assert) {
        assert.expect(6);
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        const searchTerm = "Milk";
        window.productNameInput.value = searchTerm;

        const productsData = [
            { product_name_de: "Organic Milk", nutriments: { 'energy-kcal_100g': 150, fat_100g: 8 } }, // Good heuristic match
            { product_name_de: "Soy Milk Drink", nutriments: { 'energy-kcal_100g': 120 } }
        ];
        mockFetch(createMockApiResponse(productsData));

        await onlineProductSearch();
        assert.ok(abortControllerWasCalled, "AbortController constructor was called.");
        assert.strictEqual(window.productNameInput.value, "Organic Milk", "Heuristic fallback (good match) name populated.");
        assert.strictEqual(window.productKcalInput.value, "150", "Heuristic fallback (good match) kcal populated.");
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden after search.');
    });

    QUnit.test('Selection Logic: Heuristic Fallback (Bad Match - Length)', async function(assert) {
        assert.expect(5);
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        const searchTerm = "Salt";
        window.productNameInput.value = searchTerm;

        const productsData = [
            { product_name_de: "Himalayan Pink Salt Fine Grain in a Resealable Pouch for Gourmet Cooking and Bath Soaks", nutriments: { 'energy-kcal_100g': 0 } }
        ];
        mockFetch(createMockApiResponse(productsData));

        await onlineProductSearch();
        assert.ok(abortControllerWasCalled, "AbortController constructor was called.");
        assert.ok(window.alert.called, "Alert was called for product not found (bad heuristic).");
        assert.strictEqual(window.alert.lastMessage, "Keine Produkte für diesen Suchbegriff gefunden oder Top-Resultat zu unähnlich.", "Correct alert message.");
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden after search.');
    });

    QUnit.test('Selection Logic: Product Not Found (None meet criteria)', async function(assert) {
        assert.expect(5);
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        window.productNameInput.value = "Xyz Abc";

        const productsData = [
            { product_name_de: "Totally Different Product One", nutriments: { 'energy-kcal_100g': 100 } },
            { product_name_de: "Another Unrelated Item Two", nutriments: { 'energy-kcal_100g': 200 } }
        ];
        mockFetch(createMockApiResponse(productsData));

        await onlineProductSearch();
        assert.ok(abortControllerWasCalled, "AbortController constructor was called.");
        assert.ok(window.alert.called, "Alert was called for product not found.");
        assert.strictEqual(window.alert.lastMessage, "Keine Produkte für diesen Suchbegriff gefunden oder Top-Resultat zu unähnlich.", "Correct alert message.");
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden after search.');
    });

    QUnit.test('Successful Search Cancellation by user', async function(assert) {
        const done = assert.async();
        assert.expect(8);

        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        window.productNameInput.value = "Long Search Product";
        window.productKcalInput.value = "initial";

        let resolver;
        const longFetchPromise = new Promise(resolve => { resolver = resolve; });

        window.fetch = async (url, options) => {
            lastFetchUrl = url;
            lastFetchOptions = options;
            assert.strictEqual(window.loadingOverlay.style.display, 'flex', 'Overlay visible during fetch.');
            options.signal.addEventListener('abort', () => {
                 const abortError = new Error("Fetch aborted by test");
                 abortError.name = "AbortError";
                 resolver({ ok: false, status: 0, json: async () => Promise.reject(abortError), text: async () => Promise.reject(abortError) });
            });
            return longFetchPromise;
        };

        const searchPromise = onlineProductSearch();

        setTimeout(() => {
            assert.ok(abortControllerWasCalled, "AbortController constructor was called before cancel.");
            assert.ok(window.cancelSearchButton, "Cancel button exists.");
            window.cancelSearchButton.click();
            assert.ok(abortMethodWasCalled, "AbortController.abort() was called on cancel.");
        }, 10);

        searchPromise.then(() => {
            assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden after cancellation.');
            assert.notOk(window.alert.called, 'No error alert should be shown for user cancellation (only console log).');
            assert.strictEqual(window.productKcalInput.value, "initial", 'Kcal input not populated after cancellation.');
            done();
        });
    });

    QUnit.test('Cancellation when no search is active', async function(assert) {
        assert.expect(3);
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        window.currentSearchAbortController = null;

        window.cancelSearchButton.click();

        assert.notOk(abortMethodWasCalled, "AbortController.abort() should not be called if no search is active.");
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay remains hidden.');
    });

    // Keep other existing tests (API failure, empty input) and update their expect count if overlay checks are added
    QUnit.test('API returns no products (original test structure)', async function(assert) {
        assert.expect(6); // overlay hidden, abort called, fetch overlay, alert called, alert message, overlay hidden
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        window.productNameInput.value = "Unknown Product";
        mockFetch(createMockApiResponse([])); // Empty products array

        await onlineProductSearch();

        assert.ok(abortControllerWasCalled, "AbortController constructor was called.");
        // assert.strictEqual(window.loadingOverlay.style.display, 'flex', 'Overlay was shown during fetch.'); // This is now inside mockFetch
        assert.ok(window.alert.called, 'Alert should be called.');
        assert.strictEqual(window.alert.lastMessage, "Keine Produkte für diesen Suchbegriff gefunden oder Top-Resultat zu unähnlich.", 'Alert message for no products found.');
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden after search.');
    });

    QUnit.test('API request fails (network error - original)', async function(assert) {
        assert.expect(5); // overlay hidden, abort called, fetch overlay, alert called, alert message, overlay hidden
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        window.productNameInput.value = "Product X";
        const networkErrorMessage = "Network error";
        mockFetch(null, false, 0); // Simulate network error
         window.fetch = async () => {
            if (window.loadingOverlay) {
                 assert.strictEqual(window.loadingOverlay.style.display, 'flex', 'Overlay visible when fetch is initiated.');
            }
            throw new Error(networkErrorMessage);
        };


        await onlineProductSearch();

        assert.ok(abortControllerWasCalled, "AbortController constructor was called.");
        assert.ok(window.alert.called, 'Alert should be called on network error.');
        assert.strictEqual(window.alert.lastMessage, `Fehler bei der Online-Suche: Error: ${networkErrorMessage}`, 'Alert message for network error.');
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay hidden after error.');
    });

    QUnit.test('Product name input is empty (original)', async function(assert) {
        assert.expect(3);
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay initially hidden.');
        window.productNameInput.value = "";

        await onlineProductSearch();

        assert.ok(window.alert.called, 'Alert should be called.');
        assert.strictEqual(window.alert.lastMessage, "Bitte geben Sie einen Produktnamen ein, um online zu suchen.", 'Alert message for empty name.');
        assert.strictEqual(window.loadingOverlay.style.display, 'none', 'Overlay remains hidden as no API call made.');
    });

});
