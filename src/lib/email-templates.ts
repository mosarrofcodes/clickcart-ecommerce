export interface OrderEmailItem {
  title: string;
  quantity: number;
  price: number;
}

export interface OrderEmailContext {
  orderId: string;
  customerName: string;
  items: OrderEmailItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  address: string;
  phone: string;
}

export function formatMoney(value: number): string {
  return `$${Number(value).toFixed(2)}`;
}

function baseLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#27272a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;background-color:#026937;color:#ffffff;">
                <h1 style="margin:0;font-size:22px;">ClickCart</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:1px solid #e4e4e7;color:#71717a;font-size:12px;">
                Thank you for shopping with ClickCart.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function itemsTable(items: OrderEmailItem[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;font-size:14px;">${item.title} × ${item.quantity}</td>
        <td align="right" style="padding:8px 0;font-size:14px;">${formatMoney(
          item.price * item.quantity,
        )}</td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <thead>
      <tr>
        <th align="left" style="border-bottom:1px solid #e4e4e7;padding:8px 0;font-size:13px;color:#71717a;">Item</th>
        <th align="right" style="border-bottom:1px solid #e4e4e7;padding:8px 0;font-size:13px;color:#71717a;">Price</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function orderConfirmationEmail(ctx: OrderEmailContext): string {
  const body = `
    <h2 style="margin:0 0 8px;font-size:18px;">Thank you, ${ctx.customerName}!</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#52525b;">
      Your order <strong>#${ctx.orderId}</strong> has been received and is being processed.
    </p>
    ${itemsTable(ctx.items)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="font-size:14px;color:#52525b;">Subtotal</td>
        <td align="right" style="font-size:14px;">${formatMoney(ctx.subtotal)}</td>
      </tr>
      <tr>
        <td style="font-size:14px;color:#52525b;">Shipping</td>
        <td align="right" style="font-size:14px;">${ctx.shipping === 0 ? "Free" : formatMoney(ctx.shipping)}</td>
      </tr>
      ${
        ctx.discount > 0
          ? `<tr>
        <td style="font-size:14px;color:#16a34a;">Discount</td>
        <td align="right" style="font-size:14px;color:#16a34a;">-${formatMoney(ctx.discount)}</td>
      </tr>`
          : ""
      }
      <tr>
        <td style="font-size:16px;font-weight:bold;padding-top:8px;">Total</td>
        <td align="right" style="font-size:16px;font-weight:bold;padding-top:8px;">${formatMoney(ctx.total)}</td>
      </tr>
    </table>
    <p style="margin:24px 0 0;font-size:14px;color:#52525b;">
      <strong>Delivering to:</strong><br />
      ${ctx.address}<br />
      Phone: ${ctx.phone}
    </p>
  `;
  return baseLayout(`Order ${ctx.orderId} confirmed`, body);
}

export function shippingNotificationEmail(ctx: OrderEmailContext): string {
  const body = `
    <h2 style="margin:0 0 8px;font-size:18px;">Your order is on the way</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#52525b;">
      Order <strong>#${ctx.orderId}</strong> has shipped and is being delivered${
        ctx.address ? ` to ${ctx.address}` : ""
      }.
    </p>
    ${itemsTable(ctx.items)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="font-size:16px;font-weight:bold;">Total</td>
        <td align="right" style="font-size:16px;font-weight:bold;">${formatMoney(ctx.total)}</td>
      </tr>
    </table>
  `;
  return baseLayout(`Order ${ctx.orderId} shipped`, body);
}

export function paymentReceiptEmail(ctx: OrderEmailContext): string {
  const body = `
    <h2 style="margin:0 0 8px;font-size:18px;">Payment received</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#52525b;">
      We received your payment for order <strong>#${ctx.orderId}</strong>.
    </p>
    ${itemsTable(ctx.items)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="font-size:14px;color:#52525b;">Subtotal</td>
        <td align="right" style="font-size:14px;">${formatMoney(ctx.subtotal)}</td>
      </tr>
      <tr>
        <td style="font-size:14px;color:#52525b;">Shipping</td>
        <td align="right" style="font-size:14px;">${ctx.shipping === 0 ? "Free" : formatMoney(ctx.shipping)}</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:bold;padding-top:8px;">Total paid</td>
        <td align="right" style="font-size:16px;font-weight:bold;padding-top:8px;">${formatMoney(ctx.total)}</td>
      </tr>
    </table>
  `;
  return baseLayout(`Payment for order ${ctx.orderId}`, body);
}