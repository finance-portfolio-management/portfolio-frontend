import { addAssets } from '../scripts/api/assetsAPI.js';
document.getElementById('addAssetBtn').addEventListener('click', () => {
    addAndLoadDataTest();
});
async function addAndLoadDataTest() {
    const payload = {
        symbol: document.getElementById('assetInput').value,
        type: document.getElementById('typeInput').value
    };
    const data = await addAssets(payload);
    console.log('Assets added:', data);

}
