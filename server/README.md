# Server (PayPal Webhooks + Twilio SMS)

Minimal Express server that verifies PayPal webhooks and sends SMS via Twilio for `PAYMENT.CAPTURE.COMPLETED`.

## Environment Variables
```
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...

TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM=+353XXXXXXXXX
ADMIN_PHONE=+353833091836

PORT=8080
```

## Steps
1. Deploy to Railway/Render.
2. Set env vars.
3. In PayPal Dashboard → Webhooks → Add `https://YOUR_BACKEND/webhooks/paypal` and copy the Webhook ID to `PAYPAL_WEBHOOK_ID`.
4. Switch `PAYPAL_ENV=live` and use live credentials when ready.
