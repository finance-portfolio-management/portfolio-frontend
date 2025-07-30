document.addEventListener('DOMContentLoaded', function () {
    // --- Investment Advice Carousel Logic ---
    const adviceCarousel = document.getElementById('advice-carousel');
    const adviceMessages = Array.from(adviceCarousel.querySelectorAll('p')); // Convert NodeList to Array
    let currentAdviceIndex = 0;
    const adviceHeight = 24; // Height of each advice message (h-6 leading-6 text-sm)

    // Clone the first message and append it to the end for seamless looping
    const firstAdviceClone = adviceMessages[0].cloneNode(true);
    adviceCarousel.appendChild(firstAdviceClone);

    // Update adviceMessages to include the clone
    const allAdviceMessages = adviceCarousel.querySelectorAll('p');
    const totalMessages = allAdviceMessages.length; // Includes the cloned message

    function showNextAdvice() {
        currentAdviceIndex++;
        const translateYValue = -currentAdviceIndex * adviceHeight;
        adviceCarousel.style.transition = 'transform 0.5s ease-in-out'; // Apply transition for smooth movement
        adviceCarousel.style.transform = `translateY(${translateYValue}px)`;

        // If we've reached the cloned first message, reset to the actual first message without transition
        if (currentAdviceIndex === totalMessages - 1) {
            setTimeout(() => {
                adviceCarousel.style.transition = 'none'; // Remove transition
                currentAdviceIndex = 0; // Reset index to the first actual message
                adviceCarousel.style.transform = `translateY(0px)`; // Jump back to the start
            }, 500); // Match the transition duration (0.5s)
        }
    }

    // Start the carousel
    setInterval(showNextAdvice, 3000); // Change advice every 5 seconds
});