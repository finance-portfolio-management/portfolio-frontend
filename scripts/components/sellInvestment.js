import { sellAsset, getHoldings} from "../api/assetsInvestmentAPI.js";
// sellInvestment.js

// Declare variables at a higher scope if they are needed by globally exposed functions
// These will be assigned values once DOM is ready inside DOMContentLoaded
let currentSellItem = null;
let currentSellGroupIndex = -1;
let currentSellItemIndex = -1;

document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements here, inside DOMContentLoaded, ensuring they are available
    const sellInvestmentModal = document.getElementById('sell-investment-modal');
    const cancelSellBtn = document.getElementById('cancel-sell-btn');
    const confirmSellBtn = document.getElementById('confirm-sell-btn');
    const sellStockSymbolDisplay = document.getElementById('sell-stock-symbol');
    const sellStockPriceDisplay = document.getElementById('sell-stock-price');
    const sellOwnedSharesDisplay = document.getElementById('sell-owned-shares');
    const sharesToSellInput = document.getElementById('shares-to-sell-input');
    const estimatedProceedsDisplay = document.getElementById('estimated-proceeds-display');
    const sellLoadingSpinnerOverlay = document.getElementById('sell-loading-spinner-overlay');
    const sellSuccessMessageOverlay = document.getElementById('sell-success-message-overlay');
    const sellAllBtn = document.getElementById('sell-all-btn'); // Get the new "Sell All" button
    const datePicker = document.getElementById('date-picker'); // Assuming datePicker is defined in your HTML

    // Define global functions AFTER DOM elements are retrieved and are guaranteed to exist
    window.openSellInvestmentModal = function(item, groupIndex, itemIndex) {
        currentSellItem = item;
        currentSellGroupIndex = groupIndex;
        currentSellItemIndex = itemIndex;

        sellStockSymbolDisplay.textContent = item.name;
        sellStockPriceDisplay.textContent = `$${item.currentPrice.toFixed(2)}`;
        sellOwnedSharesDisplay.textContent = `${item.ownedShares.toFixed(4)} Shares`;
        sharesToSellInput.value = ''; // Clear previous input
        estimatedProceedsDisplay.textContent = '$0.00'; // Reset proceeds

        sellInvestmentModal.classList.remove('hidden');
        sellInvestmentModal.classList.add('show');
        window.hideSellSpinner(); // Call the globally exposed function
        window.hideSellSuccessMessage(); // Call the globally exposed function
    }

    // Function to close the sell investment modal - Made global for broader accessibility
    window.closeSellInvestmentModal = function() {
        sellInvestmentModal.classList.remove('show');
        setTimeout(() => {
            sellInvestmentModal.classList.add('hidden');
        }, 300);
    }

    // Function to show loading spinner (for sell modal) - Made global
    window.showSellSpinner = function() {
        sellLoadingSpinnerOverlay.classList.remove('hidden');
    }

    // Function to hide loading spinner (for sell modal) - Made global
    window.hideSellSpinner = function() {
        sellLoadingSpinnerOverlay.classList.add('hidden');
    }

    // Function to show success message (for sell modal) - Made global
    window.showSellSuccessMessage = function() {
        sellSuccessMessageOverlay.classList.remove('hidden');
        sellSuccessMessageOverlay.classList.add('show');
        setTimeout(() => {
            sellSuccessMessageOverlay.classList.remove('show');
            setTimeout(() => {
                sellSuccessMessageOverlay.classList.add('hidden');
            }, 300);
        }, 2000);
    }

    // Function to calculate estimated proceeds (can remain local or be global if needed elsewhere)
    function calculateEstimatedProceeds() {
        if (currentSellItem && sharesToSellInput.value) {
            const shares = parseFloat(sharesToSellInput.value);
            const price = currentSellItem.currentPrice;
            if (shares > 0 && price > 0) {
                const proceeds = shares * price;
                estimatedProceedsDisplay.textContent = `$${proceeds.toFixed(2)}`;
            } else {
                estimatedProceedsDisplay.textContent = '$0.00';
            }
        } else {
            estimatedProceedsDisplay.textContent = '$0.00';
        }
    }

    // Event listener for shares to sell input
    sharesToSellInput.addEventListener('input', calculateEstimatedProceeds);

    // Event listener for "Sell All" button
    sellAllBtn.addEventListener('click', () => {
        if (currentSellItem) {
            sharesToSellInput.value = currentSellItem.ownedShares;
            calculateEstimatedProceeds();
        }
    });

    // Event listener for "Cancel" button in sell modal
    cancelSellBtn.addEventListener('click', window.closeSellInvestmentModal);

    // Event listener for "Confirm Sell" button in sell modal
    confirmSellBtn.addEventListener('click', async () => {
        const shares = parseFloat(sharesToSellInput.value);

        if (isNaN(shares) || shares <= 0) {
            console.error('Please enter a valid number of shares to sell.');
            return;
        }
        if (shares > currentSellItem.ownedShares) {
            console.error('You cannot sell more shares than you own.');
            return;
        }

        window.showSellSpinner(); // Show spinner for sell operation
        const paylaod = {
            symbol: currentSellItem.name,
            name: currentSellItem.id.split("-")[0],
            quantity: shares,
            tradeDate: datePicker.value // Assuming datePicker is defined globally or accessible here
        };
        await sellAsset(paylaod)
        // Simulate API call for purchase
        setTimeout(() => {
            window.hideSellSpinner(); // Hide spinner
            window.showSellSuccessMessage(); // Show success message
            // After success message disappears, close the modal
            setTimeout(() => {
                window.closeSellInvestmentModal();
            }, 500); // 1000ms for success message + 300ms for its fade out
        }, 500); // Simulate 1 second API call
        const res = await getHoldings(datePicker.value); // Refresh holdings after purchase
        window.renderInvestmentList(res); // Call the global function to update the investment list


    });

    // Close sell modal if user clicks outside the modal content
    sellInvestmentModal.addEventListener('click', (e) => {
        if (e.target === sellInvestmentModal) {
            window.closeSellInvestmentModal();
        }
    });
});
