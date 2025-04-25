import { onRequest } from 'firebase-functions/v2/https';
import Stripe from 'stripe';
import * as functions from 'firebase-functions';

const stripe = new Stripe(functions.config().stripe.key, { apiVersion: '2022-11-15' });

export const stripeFunction = onRequest(async (req, res) => {
  res.send('Stripe function');
});