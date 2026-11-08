import { expect, type APIRequestContext } from "@playwright/test";
export async function emailLink(
  request: APIRequestContext,
  email: string,
  subject: string,
) {
  const root = process.env.MAILPIT_URL;
  if (!root || !root.startsWith("http://127.0.0.1:"))
    throw new Error("Local test mailbox required");
  let id = "";
  await expect
    .poll(async () => {
      const response = await request.get(`${root}/api/v1/messages`, {
        headers: { Origin: root },
      });
      const data = await response.json();
      const message = data.messages?.find(
        (m: { ID: string; Subject: string; To: { Address: string }[] }) =>
          m.Subject === subject && m.To.some((to) => to.Address === email),
      );
      id = message?.ID ?? "";
      return Boolean(id);
    })
    .toBe(true);
  const response = await request.get(`${root}/api/v1/message/${id}`, {
    headers: { Origin: root },
  });
  const message = await response.json();
  const link = message.Text.match(
    /http:\/\/localhost:3002\/api\/auth\/[^\s]+/,
  )?.[0];
  if (!link) throw new Error("Account link missing from test email");
  // Delete consumed messages so subsequent requests cannot accidentally reuse an earlier email.
  await request.delete(`${root}/api/v1/messages`, { data: { IDs: [id] } });
  return link as string;
}
