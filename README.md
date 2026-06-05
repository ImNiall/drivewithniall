# Drive with Niall

Static website for Drive with Niall.

## Files

- `index.html` - main landing page
- `learn-online.html` - online course coming soon page
- `dashboard.html` - student dashboard shell for signed-in learners
- `payments.html` - student payment options and lesson balance page
- `styles.css` - site styles
- `app.js` - main page scripts
- `auth.js` - student login and sign-up scripts
- `dashboard.js` - dashboard sign-in check and student account scripts
- `payments.js` - Stripe Checkout and balance display scripts

## Payments setup

The payments page is wired for real Stripe Checkout through Supabase Edge Functions. The browser never receives the Stripe secret key.

Apply the Supabase payment migrations, then deploy the Edge Functions:

```bash
supabase db push --project-ref antykaonrraerlmwpmqp

supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_or_live_here \
  STRIPE_WEBHOOK_SECRET=whsec_here \
  SITE_URL=https://drivewithniall.co.uk \
  --project-ref antykaonrraerlmwpmqp

supabase functions deploy create-checkout-session --project-ref antykaonrraerlmwpmqp
supabase functions deploy stripe-webhook --project-ref antykaonrraerlmwpmqp
```

Use a Stripe test secret key first. When the Stripe account is ready to go live, replace it with the live key and redeploy/re-save the secret.

Add this endpoint in Stripe Webhooks:

```text
https://antykaonrraerlmwpmqp.supabase.co/functions/v1/stripe-webhook
```

Subscribe it to `checkout.session.completed` and `checkout.session.expired`, then copy the Stripe webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

Required Supabase function secrets:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SITE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are normally available automatically in Supabase Edge Functions, but set them manually if your project requires it.
