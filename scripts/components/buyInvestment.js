import { buyAsset, getHoldings} from '../api/assetsInvestmentAPI.js';


// addInvestment.js
document.addEventListener('DOMContentLoaded', function () {
    const addInvestmentModal = document.getElementById('add-investment-modal');
    const cancelAddInvestmentBtn = document.getElementById('cancel-add-investment-btn');
    const confirmBuyBtn = document.getElementById('confirm-buy-btn');
    const stockSearchInput = document.getElementById('stock-search-input');
    const stockDetailsTableBody = document.querySelector('#stock-details-table tbody');
    const purchaseAmountInput = document.getElementById('purchase-amount-input');
    // Changed from p tag to input for shares
    const numSharesInput = document.getElementById('num-shares-input');
    const paymentMethodSelect = document.getElementById('payment-method-select');
    const loadingSpinnerOverlay = document.getElementById('loading-spinner-overlay');
    const successMessageOverlay = document.getElementById('success-message-overlay');

    let selectedStock = null; // Stores the currently selected stock object for buying

    // Mock stock data for buying (replace with API calls later)
    const mockStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', type: "stock", currentPrice: 207.2000, updateTime: '2025-07-30 10:30:00' },
        { symbol: 'BD_FUND', name: 'BD_FUND', type: "fund", currentPrice: 123.7000, updateTime: '2025-07-30 10:31:00' },
        { symbol: 'CORP', name: 'PIMCO Investment Grade Corporate Bond', type: "bond", currentPrice: 101.6000, updateTime: '2025-07-30 10:31:00' },
        { symbol: 'EQ_FUND', name: 'EQ_FUND', type: "fund", currentPrice: 252.7000, updateTime: '2025-07-30 10:34:00' },
        { symbol: 'GOVT', name: 'iShares U.S. Treasury Bond', type: "bond", currentPrice: 101.9000, updateTime: '2025-07-30 10:33:00' },
        { symbol: 'MIX_FUND', name: 'MIX_FUND', type: "fund", currentPrice: 180.6000, updateTime: '2025-07-30 10:35:00' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', type: "stock", currentPrice: 434.5000, updateTime: '2025-07-30 10:32:00' },
    ];

    // Function to render stock search results for add modal
    function renderStockSearchResults(stocks) {
        stockDetailsTableBody.innerHTML = ''; // Clear existing content
        if (stocks.length === 0) {
            stockDetailsTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-4">No matching stocks found</td></tr>`;
            return;
        }

        stocks.forEach(stock => {
            const row = document.createElement('tr');
            row.classList.add('hover:bg-gray-50');
            row.innerHTML = `
                <td><input type="radio" name="selected-stock" value="${stock.symbol}" class="form-radio h-4 w-4 text-blue-600"></td>
                <td>${stock.symbol}</td>
                <td>${stock.name}</td>
                
                <td>$${stock.currentPrice.toFixed(2)}</td>
                <td>${stock.updateTime}</td>
            `;
            row.addEventListener('click', () => {
                // Deselect all other rows
                stockDetailsTableBody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                // Select this row
                row.classList.add('selected');
                row.querySelector('input[type="radio"]').checked = true;
                selectedStock = stock;
                // Enable purchase inputs
                purchaseAmountInput.disabled = false;
                numSharesInput.disabled = false;
                // Clear previous values when a new stock is selected
                purchaseAmountInput.value = '';
                numSharesInput.value = '';
            });
            stockDetailsTableBody.appendChild(row);
        });
    }

    // Function to calculate shares based on amount
    function calculateSharesFromAmount() {
        if (selectedStock && purchaseAmountInput.value) {
            const amount = parseFloat(purchaseAmountInput.value);
            const price = selectedStock.currentPrice;
            if (amount > 0 && price > 0) {
                const shares = amount / price;
                numSharesInput.value = shares.toFixed(4); // Update shares input
            } else {
                numSharesInput.value = '';
            }
        } else {
            numSharesInput.value = '';
        }
    }

    // Function to calculate amount based on shares
    function calculateAmountFromShares() {
        if (selectedStock && numSharesInput.value) {
            console.log(selectedStock)
            const shares = parseFloat(numSharesInput.value);
            const price = selectedStock.currentPrice;
            if (shares > 0 && price > 0) {
                const amount = shares * price;
                purchaseAmountInput.value = amount.toFixed(2); // Update amount input
            } else {
                purchaseAmountInput.value = '';
            }
        } else {
            purchaseAmountInput.value = '';
        }
    }

    // Function to show loading spinner (for add modal)
    function showSpinner() {
        loadingSpinnerOverlay.classList.remove('hidden');
    }

    // Function to hide loading spinner (for add modal)
    function hideSpinner() {
        loadingSpinnerOverlay.classList.add('hidden');
    }

    // Function to show success message (for add modal)
    function showSuccessMessage() {
        successMessageOverlay.classList.remove('hidden');
        successMessageOverlay.classList.add('show');
        setTimeout(() => {
            successMessageOverlay.classList.remove('show');
            setTimeout(() => {
                successMessageOverlay.classList.add('hidden');
            }, 300); // Match CSS transition duration
        }, 2000); // Show for 2 seconds
    }

    // Function to open the add investment modal
    window.openAddInvestmentModal = function () { // Made global for access from HTML
        addInvestmentModal.classList.remove('hidden');
        addInvestmentModal.classList.add('show');
        // Reset modal state
        stockSearchInput.value = '';
        stockDetailsTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-4">Please search for a stock to display details</td></tr>`;
        purchaseAmountInput.value = '';
        purchaseAmountInput.disabled = true;
        numSharesInput.value = ''; // Reset shares input
        numSharesInput.disabled = true; // Disable shares input
        selectedStock = null;
        hideSpinner();
        successMessageOverlay.classList.add('hidden');
    }

    // Function to close the add investment modal
    function closeAddInvestmentModal() {
        addInvestmentModal.classList.remove('show');
        // Use a timeout to allow the transition to complete before hiding
        setTimeout(() => {
            addInvestmentModal.classList.add('hidden');
        }, 300); // Match CSS transition duration
    }

    // Event listener for the "Cancel" button inside the add modal
    cancelAddInvestmentBtn.addEventListener('click', closeAddInvestmentModal);

    // Event listener for stock search input in add modal
    stockSearchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.trim().toLowerCase();
        if (searchTerm.length > 0) {
            const filteredStocks = mockStocks.filter(stock =>
                stock.symbol.toLowerCase().includes(searchTerm) ||
                stock.name.toLowerCase().includes(searchTerm)
            );
            renderStockSearchResults(filteredStocks);
        } else {
            stockDetailsTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-4">Please search for a stock to display details</td></tr>`;
            purchaseAmountInput.disabled = true;
            numSharesInput.disabled = true; // Disable shares input
            purchaseAmountInput.value = '';
            numSharesInput.value = '';
            selectedStock = null;
        }
    });

    // Event listeners for two-way calculation
    purchaseAmountInput.addEventListener('input', calculateSharesFromAmount);
    numSharesInput.addEventListener('input', calculateAmountFromShares);

    const datePicker = document.getElementById('date-picker');

    // Event listener for the "Buy" button inside the add modal
    confirmBuyBtn.addEventListener('click', async () => {
        if (!selectedStock) {
            console.error('Please select a stock first.');
            // In a real app, display a user-friendly message on the modal
            return;
        }
        const amount = parseFloat(purchaseAmountInput.value);
        const shares = parseFloat(numSharesInput.value);
        const type = selectedStock.type;

        if (isNaN(amount) || amount <= 0 || isNaN(shares) || shares <= 0) {
            console.error('Please enter valid purchase amount and shares.');
            // In a real app, display a user-friendly message on the modal
            return;
        }

        const payload = {
            symbol: selectedStock.symbol,
            name: type,
            quantity: shares,
            tradeDate: datePicker.value || new Date().toISOString().split('T')[0], // Use date picker value or current date
        };
        // Call the API to buy the asset
        await buyAsset(payload);
        showSpinner(); // Show loading spinner

        // Simulate API call for purchase
        setTimeout(() => {
            hideSpinner(); // Hide spinner
            showSuccessMessage(); // Show success message
            // After success message disappears, close the modal
            setTimeout(() => {
                closeAddInvestmentModal();
                
            }, 500); // 1000ms for success message + 300ms for its fade out
        }, 500); // Simulate 1 second API call
        const res = await getHoldings(datePicker.value); // Refresh holdings after purchase
        window.renderInvestmentList(res); // Call the global function to update the investment list
        

    });

    // Close add modal if user clicks outside the modal content
    addInvestmentModal.addEventListener('click', (e) => {
        if (e.target === addInvestmentModal) {
            closeAddInvestmentModal();
        }
    });
});
