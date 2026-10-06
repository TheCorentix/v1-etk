# WhatsApp order updates — setup

When an order is updated in the admin panel (or paid at checkout) the customer gets a WhatsApp
message through the **WhatsApp Business Cloud API** (Meta). Until the credentials below are set,
the server runs in *dry-run* mode: it logs the message it would have sent and records it on the
order as "skipped" — nothing is sent.

## When messages are sent

| Order status | Trigger | Template name |
|---|---|---|
| `CONFIRMED` | Payment verified at checkout ("order placed") | `etniko_order_confirmed` |
| `PACKED` | Admin marks the order Packed | `etniko_order_packed` |
| `SHIPPED` | Admin marks Shipped / saves a tracking ID | `etniko_order_shipped` |
| `DELIVERED` | Admin marks Delivered | `etniko_order_delivered` |
| `CANCELLED` | Admin marks Cancelled | `etniko_order_cancelled` |

Re-saving the same status does not message the customer again. Use **Resend current status** on the
order in admin to send it once more (for example after fixing a failed send).

## 1. Create the templates

WhatsApp only lets a business start a conversation with **pre-approved templates**. In
**Meta Business Manager → WhatsApp Manager → Message templates**, create these five.
Category: **Utility**. Language: **English** (`en`). The body text must match exactly
(the `{{n}}` placeholders are filled in by the server).

**`etniko_order_confirmed`**
```
Hi {{1}}, thank you for shopping with ETNIKO! Your order {{2}} for {{3}} is confirmed. We will keep you posted as it is prepared and shipped.
```
Sample values: `Ananya`, `#ABCD1234`, `₹12,500`

**`etniko_order_packed`**
```
Hi {{1}}, your ETNIKO order {{2}} has been packed and is getting ready to ship.
```
Sample values: `Ananya`, `#ABCD1234`

**`etniko_order_shipped`**
```
Hi {{1}}, your ETNIKO order {{2}} has been shipped! Tracking ID: {{3}}. Estimated delivery: {{4}}.
```
Sample values: `Ananya`, `#ABCD1234`, `BD123456789IN`, `3–7 days`

**`etniko_order_delivered`**
```
Hi {{1}}, your ETNIKO order {{2}} has been delivered. We hope you love it! Thank you for choosing ETNIKO.
```
Sample values: `Ananya`, `#ABCD1234`

**`etniko_order_cancelled`**
```
Hi {{1}}, your ETNIKO order {{2}} has been cancelled. If you have any questions, please reach out to us and we will be happy to help.
```
Sample values: `Ananya`, `#ABCD1234`

Approval usually takes minutes to a day. If you change the wording, change it in
`server/src/services/orderNotification.service.ts` too (and have Meta re-approve it).

## 2. Get the API credentials

1. Create an app at <https://developers.facebook.com> (type **Business**) and add the **WhatsApp** product.
2. Add and verify the store's WhatsApp number under **WhatsApp → API Setup**. Copy its **Phone number ID**.
3. Create a **System User** in Business Settings, give it your WhatsApp account with full control,
   and generate a **permanent access token** with the `whatsapp_business_messaging` and
   `whatsapp_business_management` permissions. (The temporary token on the API Setup page expires in
   about 24 hours — don't use it in production.)

> The free test number Meta provides can only message recipients you have added and verified on the
> API Setup page. Use your own phone to try things out.

## 3. Configure the server

Add to `server/.env`, then restart the server:

```
WHATSAPP_ACCESS_TOKEN=<permanent system-user token>
WHATSAPP_PHONE_NUMBER_ID=<phone number ID>
# optional
WHATSAPP_API_VERSION=v23.0
WHATSAPP_TEMPLATE_LANGUAGE=en
```

Never commit these values.

## Notes

- **Phone numbers** come from the order's customer phone (falling back to the shipping phone) and are
  converted to international format using the shipping country (India, USA, UK, Australia).
  A 10-digit number is treated as a local number of that country.
- **Customer consent:** WhatsApp requires that customers have opted in to receive messages from you.
  Make sure checkout tells customers their order updates will be sent on WhatsApp.
- **Failures** (template not approved yet, invalid number, expired token, …) never block an order
  update. The reason is shown in a toast and listed under *WhatsApp updates to customer* on the order.
