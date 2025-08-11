import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Raw body is needed for PayPal webhook signature verification
app.use("/webhooks/paypal", bodyParser.raw({ type: "*/*" }));
app.use(express.json());

// --- Utility: Get PayPal access token ---
async function getPayPalAccessToken() {
  const base = process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("Failed to fetch PayPal token");
  return res.json();
}

// --- Verify PayPal Webhook ---
async function verifyPayPalWebhookSignature(req) {
  const base = process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const transmissionId = req.header("paypal-transmission-id");
  const time = req.header("paypal-transmission-time");
  const certUrl = req.header("paypal-cert-url");
  const authAlgo = req.header("paypal-auth-algo");
  const transmissionSig = req.header("paypal-transmission-sig");
  const body = req.body.toString("utf8");

  const { access_token } = await getPayPalAccessToken();

  const verifyRes = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: time,
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body),
    }),
  });

  const data = await verifyRes.json();
  return data.verification_status === "SUCCESS";
}

// --- Twilio client ---
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(msg) {
  if (!process.env.ADMIN_PHONE || !process.env.TWILIO_FROM) return;
  try {
    await twilioClient.messages.create({
      body: msg,
      from: process.env.TWILIO_FROM,
      to: process.env.ADMIN_PHONE,
    });
  } catch (e) {
    console.error("Twilio SMS failed:", e.message);
  }
}

// --- PayPal Webhook endpoint ---
app.post("/webhooks/paypal", async (req, res) => {
  try {
    const verified = await verifyPayPalWebhookSignature(req);
    if (!verified) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString("utf8"));
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const amount = event.resource?.amount?.value + " " + event.resource?.amount?.currency_code;
      const orderId = event.resource?.supplementary_data?.related_ids?.order_id || event.resource?.id;
      const name = event.resource?.payer?.name?.given_name || "Customer";
      await sendSMS(`✅ Paid order received: ${amount} by ${name}. Order ID: ${orderId}`);
    }

    return res.sendStatus(200);
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on :${PORT}`));
