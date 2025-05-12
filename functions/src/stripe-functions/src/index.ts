import { onRequest } from 'firebase-functions/v2/https';

export const stripeFunction = onRequest(async (req, res) => {
  res.send('Stripe function');
});