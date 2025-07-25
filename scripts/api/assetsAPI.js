export async function addAssets(payload) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!payload || !payload.symbol || !payload.type) {
        throw new Error('Symbol and type are required to add an asset');
      }

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



export async function getSingleAsset(payload) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!payload || !payload.symbol) {
        throw new Error('Symbol is required to get a single asset');
      }

      const response = await fetch(`http://localhost:3000/api/assets/${payload.symbol}`, {
        method: 'GET'
      });


      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error);
      }


      resolve(data);

    } catch (error) {
      console.error('Failed to get asset:', error);
      resolve(error);
    }
  });
}


export async function updateSingleAsset(payload) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!payload || !payload.name || !payload.type || !payload.exchange) {
        throw new Error('Name, type, and exchange are required to update an asset');}
      const response = await fetch(`http://localhost:3000/api/assets/${payload.name}`, {
        method: 'PUT',
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
      console.error('Failed to update asset:', error);
      resolve(error);
    }
  });
}

export async function deleteSingleAsset(payload) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!payload || !payload.symbol) {
        throw new Error('Symbol is required to delete an asset');
      }

      const response = await fetch(`http://localhost:3000/api/assets/${payload.symbol}`, {
        method: 'DELETE'
      });


      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error);
      }


      resolve(data);

    } catch (error) {
      console.error('Failed to delete a asset:', error);
      resolve(error);
    }
  });
}