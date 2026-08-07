const http = require('http');

function testEndpoint(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
  });
}

async function run() {
  console.log('--- Payment Config ---');
  const payConfig = await testEndpoint('/api/payment/config');
  console.log(payConfig);

  console.log('\n--- Restaurant Details ---');
  const rest = await testEndpoint('/api/restaurant');
  console.log('Name:', rest.data?.info?.name);
  console.log('Phone:', rest.data?.info?.phone);
  console.log('UPI ID:', rest.data?.info?.qrDetails?.upiId);
  console.log('QR Image URL exists:', Boolean(rest.data?.info?.qrDetails?.qrCodeImageUrl));
}

run();
