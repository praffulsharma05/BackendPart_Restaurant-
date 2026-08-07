import http from 'http';

interface TestRoute {
  name: string;
  method: string;
  path: string;
  body?: any;
  headers?: Record<string, string>;
  expectedStatus?: number;
}

const routesToTest: TestRoute[] = [
  // Health & Info
  { name: 'Health Check', method: 'GET', path: '/health', expectedStatus: 200 },
  { name: 'Restaurant Config', method: 'GET', path: '/api/restaurant', expectedStatus: 200 },
  
  // Menu
  { name: 'Menu Categories', method: 'GET', path: '/api/menu/categories', expectedStatus: 200 },
  { name: 'Menu Items', method: 'GET', path: '/api/menu', expectedStatus: 200 },
  { name: 'Menu Item By ID (Not Found)', method: 'GET', path: '/api/menu/non-existent-item-id', expectedStatus: 404 },
  
  // Cart
  { name: 'Cart Items', method: 'GET', path: '/api/cart?sessionId=test-session', expectedStatus: 200 },
  
  // Auth
  { name: 'Auth Login (Invalid User)', method: 'POST', path: '/api/auth/login', body: { phone: '0000000000' }, expectedStatus: 401 },
  { name: 'Admin Login (Invalid Credentials)', method: 'POST', path: '/api/auth/admin-login', body: { email: 'admin@test.com', password: 'wrong' }, expectedStatus: 401 },
  
  // Offers & Rewards
  { name: 'Active Offers', method: 'GET', path: '/api/offers', expectedStatus: 200 },
  { name: 'Reward Summary', method: 'GET', path: '/api/rewards/summary', expectedStatus: 200 },
  { name: 'Reward Config', method: 'GET', path: '/api/rewards/config', expectedStatus: 200 },
  
  // Orders
  { name: 'User Orders', method: 'GET', path: '/api/orders/my-orders', expectedStatus: 200 },
  { name: 'All Orders (Unauthorized)', method: 'GET', path: '/api/orders/all', expectedStatus: 401 },
  { name: 'Order Details (Not Found)', method: 'GET', path: '/api/orders/non-existent-order-id', expectedStatus: 404 },
  
  // Admin & SuperAdmin & Payment
  { name: 'Payment Config', method: 'GET', path: '/api/payment/config', expectedStatus: 200 },
  { name: 'SuperAdmin Stats', method: 'GET', path: '/api/superadmin/stats', expectedStatus: 200 },
  { name: 'Notifications', method: 'GET', path: '/api/notifications', expectedStatus: 200 },
  { name: 'Waiter Pending Calls (Unauthorized)', method: 'GET', path: '/api/waiter/pending', expectedStatus: 401 },
  { name: 'Analytics Summary (Unauthorized)', method: 'GET', path: '/api/analytics/summary', expectedStatus: 401 },
  
  // Invalid Route Fallback
  { name: 'Non-existent API Route', method: 'GET', path: '/api/invalid-endpoint-xyz', expectedStatus: 404 },
];

function checkRoute(route: TestRoute): Promise<{ route: TestRoute; status: number | string; body: string; ok: boolean }> {
  return new Promise((resolve) => {
    const payload = route.body ? JSON.stringify(route.body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: Number(process.env.PORT) || 5000,
        path: route.path,
        method: route.method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...route.headers,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          const status = res.statusCode || 500;
          const ok = route.expectedStatus ? status === route.expectedStatus : status >= 200 && status < 400;
          resolve({ route, status, body: body.substring(0, 250), ok });
        });
      }
    );

    req.on('error', (err) => {
      resolve({ route, status: 'CONN_ERR', body: err.message, ok: false });
    });

    if (payload) req.write(payload);
    req.end();
  });
}

export async function runApiAudit() {
  console.log('=====================================================');
  console.log('         🔍 RESTAURANT API DIAGNOSTICS AUDIT        ');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  for (const item of routesToTest) {
    const result = await checkRoute(item);
    const symbol = result.ok ? '✅' : '❌';
    const tag = `[${result.status}]`.padEnd(8);
    const reqStr = `${result.route.method} ${result.route.path}`.padEnd(45);

    console.log(`${symbol} ${tag} ${reqStr} => ${result.body}`);

    if (result.ok) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n=====================================================');
  console.log(`📊 Audit Finished: ${passed} Checked OK / Expected, ${failed} Unexpected Failures.`);
  console.log('=====================================================\n');
}

if (require.main === module) {
  runApiAudit();
}
