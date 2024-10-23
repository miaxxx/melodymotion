// script.js

const scanButton = document.getElementById('scanButton');
const statusText = document.getElementById('status');
const deviceList = document.getElementById('deviceList');
const distanceText = document.getElementById('distance');

let bluetoothDevice;
let server;
let rssiInterval;

scanButton.addEventListener('click', async () => {
  try {
    // 请求用户选择蓝牙设备
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['battery_service'] // 添加一个已知的服务以确保连接
    });

    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);

    statusText.textContent = `状态：正在连接到 ${bluetoothDevice.name}...`;

    // 连接到 GATT 服务器
    server = await bluetoothDevice.gatt.connect();

    statusText.textContent = `状态：已连接到 ${bluetoothDevice.name}`;

    // 开始读取 RSSI 值
    startReadingRSSI();

  } catch (error) {
    console.error(error);
    statusText.textContent = '状态：连接失败';
  }
});

function onDisconnected() {
  statusText.textContent = '状态：已断开连接';
  clearInterval(rssiInterval);
  distanceText.textContent = '距离：';
}

// 开始读取 RSSI 值
function startReadingRSSI() {
  rssiInterval = setInterval(async () => {
    try {
      // 刷新信号强度值
      await bluetoothDevice.watchAdvertisements();
      const rssi = bluetoothDevice.advertisement.rssi;
      if (rssi !== undefined) {
        // 将 RSSI 转换为距离
        const distance = calculateDistance(rssi);
        distanceText.textContent = `距离：约 ${distance.toFixed(2)} 米`;
      } else {
        distanceText.textContent = '距离：无法获取 RSSI';
      }
    } catch (error) {
      console.error(error);
      distanceText.textContent = '距离：获取失败';
    }
  }, 1000); // 每秒更新一次
}

// 根据 RSSI 计算距离的函数
function calculateDistance(rssi) {
  const txPower = -59; // 假设的发射功率，实际值需要根据设备调整
  return Math.pow(10, (txPower - rssi) / (10 * 2));
}
