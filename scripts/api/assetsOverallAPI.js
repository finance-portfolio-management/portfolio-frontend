export async function getTopGainersAndLosers() {
    return new Promise(async (resolve, reject) => {
      try {
  
        const response = await fetch('http://localhost:3000/api/market/top-gainers-losers', {
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