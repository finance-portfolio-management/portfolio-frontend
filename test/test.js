import { addAssets, getAllAssets, getSingleAsset, updateSingleAsset, deleteSingleAsset } from '../scripts/api/assetsAPI.js';
import { getSingleHistoricalAsset } from '../scripts/api/assetsHistoryAPI.js';
import { buyAsset, sellAsset, getHoldings } from '../scripts/api/assetsInvestmentAPI.js';

function clearAllInputs() {
    document.querySelectorAll('input, textarea, select').forEach(el => el.value = '');
}

document.getElementById('addAssetBtn').addEventListener('click', () => {
    addAndLoadDataTest();
});
async function addAndLoadDataTest() {
    const payload = {
        symbol: document.getElementById('assetInput').value,
        type: document.getElementById('typeInput').value
    };
    const data = await addAssets(payload);
    if (data instanceof Error) {
        document.getElementsByClassName("test-output-content")[0].innerHTML = 'Error fetching assets: ' + data.message;
        return;
    }
    console.log(data);
    document.getElementsByClassName("test-output-content")[0].innerHTML = JSON.stringify(data, null, 2);
    clearAllInputs();
}



document.getElementById('getAllAssetsBtn').addEventListener('click', () => {
    getAllAssetsTest();
});
async function getAllAssetsTest() {
    const data = await getAllAssets();
    if (data instanceof Error) {
        document.getElementsByClassName("test-output-content")[0].innerHTML = 'Error fetching assets: ' + data.message;
        return;
    }
    console.log(data);
    document.getElementsByClassName("test-output-content")[0].innerHTML = JSON.stringify(data, null, 2);
}


document.getElementById('getSingleAssetsBtn').addEventListener('click', () => {
    getSingleAssetTest();
});
async function getSingleAssetTest() {
    const payload = {
        symbol: document.getElementById('singleAssetInput').value,
    };
    const data = await getSingleAsset(payload);
    if (data instanceof Error) {
        document.getElementsByClassName("test-output-content")[0].innerHTML = 'Error fetching single asset: ' + data.message;
        return;
    }
    console.log(data);
    document.getElementsByClassName("test-output-content")[0].innerHTML = JSON.stringify(data, null, 2);
    clearAllInputs();

}


document.getElementById('updateSingleAssetBtn').addEventListener('click', () => {
    updateSingleAssetTest();
});
async function updateSingleAssetTest() {
    const payload = {
        name: document.getElementById('updateSingleAssetInput').value,
        type: document.getElementById('updateSingleTypeInput').value,
        exchange: document.getElementById('updateSingleExchangeInput').value
    };
    const data = await updateSingleAsset(payload);
    if (data instanceof Error) {
        document.getElementsByClassName("test-output-content")[0].innerHTML = 'Error updating the asset: ' + data.message;
        return;
    }
    console.log(data);
    document.getElementsByClassName("test-output-content")[0].innerHTML = JSON.stringify(data, null, 2);
    clearAllInputs();

    
}


document.getElementById('deleteSingleAssetBtn').addEventListener('click', () => {
    deleteSingleAssetTest();
});
async function deleteSingleAssetTest() {
    const payload = {
        symbol: document.getElementById('deletSingleAssetInput').value,
    };
    const data = await deleteSingleAsset(payload);
    if (data instanceof Error) {
        document.getElementsByClassName("test-output-content")[0].innerHTML = 'Error deleting the asset: ' + data.message;
        return;
    }
    console.log(data);
    document.getElementsByClassName("test-output-content")[0].innerHTML = JSON.stringify(data, null, 2);
}



document.getElementById('getSingleHistoricalAssetsBtn').addEventListener('click', () => {
    getSingleHistoricalAssetTest();
});
async function getSingleHistoricalAssetTest() {
    const payload = {
        symbol: document.getElementById('singleHistoricalAssetInput').value,
        start: document.getElementById('singleHistoricalStarttimeInput').value,
        end: document.getElementById('singleHistoricalEndtimeInput').value,
        interval: document.getElementById('singleHistoricalIntervalInput').value
    };
    const data = await getSingleHistoricalAsset(payload);
    if (data instanceof Error) {
        document.getElementsByClassName("test-output-content")[0].innerHTML = 'Error fetching single historical asset: ' + data.message;
        return;
    }
    console.log(data);
    document.getElementsByClassName("test-output-content")[0].innerHTML = JSON.stringify(data, null, 2);
    clearAllInputs();

}


// -------------------------------
document.getElementById('buyAssetsBtn').addEventListener('click', () => {
    buyAssetTest();
});
async function buyAssetTest() {
    const payload = {
        symbol: document.getElementById('buySymbol').value,
        name: document.getElementById('buyName').value,
        quantity: document.getElementById('buyQuantity').value,
        tradeDate: document.getElementById('buyDate').value
    };
    const data = await buyAsset(payload);
    if (data instanceof Error) {
        document.getElementsByClassName("test-output-content")[0].innerHTML = 'Error: ' + data.message;
        return;
    }
    console.log(data);
    document.getElementsByClassName("test-output-content")[0].innerHTML = JSON.stringify(data, null, 2);

}
document.getElementById('sellAssetsBtn').addEventListener('click', () => {
    sellAssetTest();
});
async function sellAssetTest() {
    const payload = {
        symbol: document.getElementById('sellSymbol').value,
        name: document.getElementById('sellName').value,
        quantity: document.getElementById('sellQuantity').value,
        tradeDate: document.getElementById('sellDate').value
    };
    const data = await sellAsset(payload);
    if (data instanceof Error) {
        document.getElementsByClassName("test-output-content")[0].innerHTML = 'Error ' + data.message;
        return;
    }
    console.log(data);
    document.getElementsByClassName("test-output-content")[0].innerHTML = JSON.stringify(data, null, 2);

}
document.getElementById('queryAssetsBtn').addEventListener('click', () => {
    queryAssetTest();
});
async function queryAssetTest() {
    const payload =  document.getElementById('queryDate').value;
    const data = await getHoldings(payload);
    if (data instanceof Error) {
        document.getElementsByClassName("test-output-content")[0].innerHTML = 'Error fetching single historical asset: ' + data.message;
        return;
    }
    console.log(data);
    document.getElementsByClassName("test-output-content")[0].innerHTML = JSON.stringify(data, null, 2);

}