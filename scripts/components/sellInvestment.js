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

    // Event listener for "Cancel" button in sell modal
    cancelSellBtn.addEventListener('click', window.closeSellInvestmentModal);

    // Event listener for "Confirm Sell" button in sell modal
    confirmSellBtn.addEventListener('click', () => {
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

        // Simulate sell API call
        setTimeout(() => {
            window.hideSellSpinner(); // Hide spinner
            window.showSellSuccessMessage(); // Show success message

            // Update the data model (assuming window.dashboardData is accessible)
            const soldValue = shares * currentSellItem.currentPrice;
            currentSellItem.value -= soldValue; // Decrease total value
            currentSellItem.ownedShares -= shares; // Decrease owned shares

            if (currentSellItem.ownedShares <= 0.0001) { // Use a small threshold for floating point
                // If all shares sold, remove the item
                if (window.dashboardData && window.dashboardData.investmentData && window.dashboardData.investmentData[currentSellGroupIndex]) {
                    window.dashboardData.investmentData[currentSellGroupIndex].items.splice(currentSellItemIndex, 1);
                    // If the category becomes empty, remove the category
                    if (window.dashboardData.investmentData[currentSellGroupIndex].items.length === 0) {
                        window.dashboardData.investmentData.splice(currentSellGroupIndex, 1);
                    }
                }
            }

            // Recalculate percentages and total value for all groups
            let totalInvestmentValue = 0;
            if (window.dashboardData && window.dashboardData.investmentData) {
                window.dashboardData.investmentData.forEach(g => {
                    g.items.forEach(i => {
                        totalInvestmentValue += i.value;
                    });
                });

                window.dashboardData.investmentData = window.dashboardData.investmentData.map(g => {
                    let categoryValue = 0;
                    g.items.forEach(i => {
                        categoryValue += i.value;
                    });
                    const categoryPercentage = (totalInvestmentValue > 0) ? (categoryValue / totalInvestmentValue) * 100 : 0;

                    const itemsWithPercentage = g.items.map(i => {
                        const itemPercentage = (totalInvestmentValue > 0) ? (i.value / totalInvestmentValue) * 100 : 0;
                        return { ...i, percentage: itemPercentage };
                    });

                    return {
                        ...g,
                        categoryValue: categoryValue,
                        categoryPercentage: categoryPercentage,
                        items: itemsWithPercentage
                    };
                });
                // Re-render the investment list and asset distribution chart (assuming renderInvestmentList is global)
                if (typeof window.renderInvestmentList === 'function') {
                    window.renderInvestmentList(window.dashboardData.investmentData);
                }
            }


            console.log(`Successfully sold ${shares} shares of ${currentSellItem.name} for $${soldValue.toFixed(2)}`);

            // After success message disappears, close the modal
            setTimeout(() => {
                window.closeSellInvestmentModal();
            }, 2300); // 2000ms for success message + 300ms for its fade out
        }, 2000); // Simulate 2 seconds API call
    });

    // Close sell modal if user clicks outside the modal content
    sellInvestmentModal.addEventListener('click', (e) => {
        if (e.target === sellInvestmentModal) {
            window.closeSellInvestmentModal();
        }
    });
});
