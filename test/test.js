import { addAssets, getAllAssets, getSingleAsset } from '../scripts/api/assetsAPI.js';
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
}