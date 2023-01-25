const stripe = require('stripe')
require('dotenv').config()
const Stripe = stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27'
})
//TODO-CONSIDER THIS BEFORE PRODUCTION 
//cancel_at_period_end
// optional
// Boolean indicating whether this subscription should cancel at the end of the current period.
const createCheckoutSession = async (customerID, price) => {
  const session = await Stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerID,
    line_items: [
      {
        price,
        quantity: 1
      }
    ],
    //TODO: check before production
    success_url: `${process.env.DOMAIN_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN_URL}/payment/cancel`,
    // customer_email: 'test+location_IN@example.com'
  })

  return session
}


const createTopupCheckoutSession = async (customerID, price) => {
  const session = await Stripe.checkout.sessions.create({
    success_url: `${process.env.DOMAIN_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN_URL}/payment/cancel`,
    customer: customerID,
    line_items: [
      {price: price, quantity: 1},
    ],
    mode: 'payment',
    metadata: {'price_id':price}
  });
  return session
}

const createBillingSession = async (customer) => {
  //TODO: THIS IS VERY EASY IMPLEMENTATION OF BILLING SESSION AND EVENT WEBHOOKS https://www.youtube.com/watch?v=u8H6awDJVpM&list=PLy1nL-pvL2M6IYfRCmhOPcyC70zJqFoCs&index=3
  const session = await Stripe.billingPortal.sessions.create({
    customer,
    return_url: `${process.env.DOMAIN_URL}`
  })
  return session
}

const getCustomerByID = async (id) => {
  const customer = await Stripe.customers.retrieve(id)
  return customer
}

const getCustomerFromBillingSession = async (id) => {
  
  const session = await Stripe.checkout.sessions.retrieve(id);
  const customer = await Stripe.customers.retrieve(session.customer);
  return customer
}

const addNewCustomer = async (email) => {
  const customer = await Stripe.customers.create({
    email,
    description: 'New Customer'
  })

  return customer
}

const getSubscriptionFromSubscriptionID = async (subs_id) => {
  const subscription = await Stripe.subscriptions.retrieve(
    subs_id
  );

  return subscription
}

const createWebhook = (rawBody, sig) => {
  const event = Stripe.webhooks.constructEvent(
    rawBody,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  )
  return event
}

module.exports = {
  getCustomerByID,
  addNewCustomer,
  createCheckoutSession,
  createBillingSession,
  createWebhook,
  getCustomerFromBillingSession,
  getSubscriptionFromSubscriptionID,
  createTopupCheckoutSession,
  Stripe
}