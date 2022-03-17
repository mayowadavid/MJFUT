const express = require('express');
const app = express();
const { resolve } = require('path');


// Copy the .env.example in the root into a .env file in this folder
require('dotenv').config({ path: './.env' });
const stripe = require('stripe')(process.env.SECRETKEY);
app.use(express.static("public"));
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.get('/', (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/index.html');
  res.sendFile(path);
});


app.post('/create-customer-portal-session', async (req, res) => {
    const {customerId} = req.body;
  // Authenticate your user.
  try {
    const {url} = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'http://localhost:4000',
    });
    res.json(url);
  } catch(err) {
    res.json(err);
  }
});



// Webhook handler for asynchronous events.
app.post('/webhook', async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'checkout.session.completed') {
    console.log(`🔔  Checkout session completed`);
  }

  if (eventType === 'checkout.session.async_payment_succeeded') {
    console.log(`🔔  Checkout session async payment succeeded`);
  }

  if (eventType === 'checkout.session.async_payment_failed') {
    console.log(`🔔  Checkout session async payment failed`);
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT || 4000, () => console.log('Node server listening on port 4000!'));
