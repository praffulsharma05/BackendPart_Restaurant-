async function testCallWaiter() {
  try {
    const res = await fetch('http://localhost:5000/api/waiter/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumber: 'Table 12 / Tesla NY 04 (Extra napkins)' })
    });
    const status = res.status;
    const json = await res.json();
    console.log('Status:', status);
    console.log('Body:', json);
  } catch (err) {
    console.error('Error hitting endpoint:', err.message);
  }
}
testCallWaiter();
