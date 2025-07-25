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
  
        
  
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error);
        }

  
        resolve(data);
  
      } catch (error) {
        console.error('Failed to create assets:', error);
        resolve(error);
      }
    });
  }
  

  export async function getAllAssets() {
    return new Promise(async (resolve, reject) => {
      try {
        // Example payload: randomly generated assets
        // const payload = {
        //   symbol: "TSLA",
        //   type: "stock"
        // };
  
        const response = await fetch('http://localhost:3000/api/assets', {
          method: 'GET'
        });
  
        
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error);
        }

  
        resolve(data);
  
      } catch (error) {
        console.error('Failed to get assets:', error);
        resolve(error);
      }
    });
  }
  