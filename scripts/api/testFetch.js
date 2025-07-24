export async function fetchData() {
    return new Promise(resolve => {
      setTimeout(() => {
        const labels = Array.from({ length: 5 }, (_, i) => `Item ${Math.floor(Math.random() * 100)}`);
        const values = labels.map(() => Math.floor(Math.random() * 100));
        resolve({ labels, values });
      }, 300);
    });
  }
  