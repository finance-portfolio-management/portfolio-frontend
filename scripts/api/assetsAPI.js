export async function addAssets(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        // Example payload: randomly generated assets
        // const payload = {
        //   symbol: "TSLA",
        //   type: "stock"
        // };
  
        const response = await fetch('http://localhost:3000/api/assets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
  
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
  
        const data = await response.json();
  
  
        resolve(data);
  
      } catch (error) {
        console.error('Failed to create assets:', error);
        resolve({ labels: [], values: [] });
      }
    });
  }
  