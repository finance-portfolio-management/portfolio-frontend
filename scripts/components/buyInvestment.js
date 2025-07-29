// addInvestment.js
document.addEventListener('DOMContentLoaded', function () {
    const addInvestmentModal = document.getElementById('add-investment-modal');
    const cancelAddInvestmentBtn = document.getElementById('cancel-add-investment-btn');
    const confirmBuyBtn = document.getElementById('confirm-buy-btn');
    const stockSearchInput = document.getElementById('stock-search-input');
    const stockDetailsTableBody = document.querySelector('#stock-details-table tbody');
    const purchaseAmountInput = document.getElementById('purchase-amount-input');
    const numSharesDisplay = document.getElementById('num-shares-display');
    const paymentMethodSelect = document.getElementById('payment-method-select');
    const loadingSpinnerOverlay = document.getElementById('loading-spinner-overlay');
    const successMessageOverlay = document.getElementById('success-message-overlay');

    let selectedStock = null; // Stores the currently selected stock object for buying

    // Mock stock data for buying (replace with API calls later)
    const mockStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', currentPrice: 175.50, updateTime: '2025-07-29 10:30:00' },
        { symbol: 'GOOG', name: 'Alphabet Inc. (Class C)', exchange: 'NASDAQ', currentPrice: 150.25, updateTime: '2025-07-29 10:31:00' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', currentPrice: 450.75, updateTime: '2025-07-29 10:32:00' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', currentPrice: 180.10, updateTime: '2025-07-29 10:33:00' },
        { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', currentPrice: 280.00, updateTime: '2025-07-29 10:34:00' },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ', currentPrice: 1200.00, updateTime: '2025-07-29 10:35:00' },
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
                <td>${stock.exchange}</td>
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
                calculateShares(); // Recalculate shares if amount already entered
            });
            stockDetailsTableBody.appendChild(row);
        });
    }

    // Function to calculate and display number of shares for add modal
    function calculateShares() {
        if (selectedStock && purchaseAmountInput.value) {
            const amount = parseFloat(purchaseAmountInput.value);
            const price = selectedStock.currentPrice;
            if (amount > 0 && price > 0) {
                const shares = amount / price;
                numSharesDisplay.textContent = `${shares.toFixed(4)} Shares`; // Display with more precision
            } else {
                numSharesDisplay.textContent = '0 Shares';
            }
        } else {
            numSharesDisplay.textContent = '0 Shares';
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
    window.openAddInvestmentModal = function() { // Made global for access from HTML
        addInvestmentModal.classList.remove('hidden');
        addInvestmentModal.classList.add('show');
        // Reset modal state
        stockSearchInput.value = '';
        stockDetailsTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-4">Please search for a stock to display details</td></tr>`;
        purchaseAmountInput.value = '';
        purchaseAmountInput.disabled = true;
        numSharesDisplay.textContent = '0 Shares';
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
            numSharesDisplay.textContent = '0 Shares';
            selectedStock = null;
        }
    });

    // Event listener for purchase amount input in add modal
    purchaseAmountInput.addEventListener('input', calculateShares);

    // Event listener for the "Buy" button inside the add modal
    confirmBuyBtn.addEventListener('click', () => {
        if (!selectedStock) {
            console.error('Please select a stock first.');
            // In a real app, display a user-friendly message on the modal
            return;
        }
        const amount = parseFloat(purchaseAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            console.error('Please enter a valid purchase amount.');
            // In a real app, display a user-friendly message on the modal
            return;
        }

        showSpinner(); // Show loading spinner

        // Simulate API call for purchase
        setTimeout(() => {
            hideSpinner(); // Hide spinner
            showSuccessMessage(); // Show success message
            console.log(`Successfully purchased ${selectedStock.symbol} for $${amount.toFixed(2)} using ${paymentMethodSelect.value}`);
            // After success message disappears, close the modal
            setTimeout(() => {
                closeAddInvestmentModal();
            }, 2300); // 2000ms for success message + 300ms for its fade out
        }, 2000); // Simulate 2 seconds API call
    });

    // Close add modal if user clicks outside the modal content
    addInvestmentModal.addEventListener('click', (e) => {
        if (e.target === addInvestmentModal) {
            closeAddInvestmentModal();
        }
    });
});
