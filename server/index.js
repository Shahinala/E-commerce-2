require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

try {
  initializeApp({ credential: applicationDefault() });
} catch(e){
  // during local dev, GOOGLE_APPLICATION_CREDENTIALS must be set for admin SDK
  console.warn('Firebase admin init warning (local dev may require credentials).', e.message);
}

const db = getFirestore();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/orders', async (req, res) => {
  try{
    const order = req.body;
    const doc = await db.collection('orders').add({ ...order, status: 'pending', createdAt: new Date() });
    res.json({ success: true, id: doc.id });
  }catch(err){ console.error(err); res.status(500).json({ success:false, error: err.message }); }
});

app.post('/api/payments/create', async (req, res) => {
  const { order, gateway } = req.body;
  try{
    const docRef = await db.collection('orders').add({ ...order, status: 'payment_pending', gateway, createdAt: new Date() });
    const orderId = docRef.id;
    // Placeholder URLs for sandbox/testing
    return res.json({ success:true, paymentUrl: `https://example-payment-gateway.local/pay?invoice=${orderId}`, orderId });
  }catch(err){ console.error(err); res.status(500).json({ success:false, error: err.message }); }
});

app.post('/api/payments/webhook', async (req, res) => {
  const payload = req.body;
  if(!payload || !payload.orderId) return res.status(400).end();
  try{
    await db.collection('orders').doc(payload.orderId).update({ status: payload.status, transactionId: payload.transactionId || null, updatedAt: new Date() });
    res.json({ received: true });
  }catch(err){ console.error(err); res.status(500).end(); }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Server listening', PORT));
