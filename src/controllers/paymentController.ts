import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey);
} else {
  console.warn('STRIPE_SECRET_KEY is missing. Payment features will operate in MOCK mode.');
}

export const paymentController = {
  createPaymentIntent: async (req: Request, res: Response) => {
    try {
      const { amount, currency = 'kd' } = req.body;
      
      if (!stripe) {
        return res.status(400).json({ error: 'Stripe integration not configured. Please add STRIPE_SECRET_KEY to environment variables.' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency: currency.toLowerCase(),
        payment_method_types: ['card'],
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Stripe Error:', error.message);
      res.status(500).json({ message: error.message });
    }
  }
};
