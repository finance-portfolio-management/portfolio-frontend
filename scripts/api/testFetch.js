// dataFetcher.js

// Simulate a delay like a real fetch call
export async function fetchData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const labels = [];
        const values = [];
  
        for (let i = 1; i <= 10; i++) {
          labels.push(`Item ${i}`);
          values.push(Math.floor(Math.random() * 100));
        }
  
        resolve({
          labels,
          values
        });
      }, 500); // simulate 500ms delay
    });
  }
  