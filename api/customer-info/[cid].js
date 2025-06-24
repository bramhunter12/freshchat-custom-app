// file: api/customer-info/[cid].js
import axios from 'axios';

export default async function handler(req, res) {
  // Manually extract the CID from the URL path
  const cid = req.url.split('/').pop();

  if (!cid) {
    return res.status(400).json({ error: "CID is required" });
  }

  try {
    const response = await axios.get(
      `https://ipostal1-org.myfreshworks.com/crm/sales/api/lookup?q=${cid}&f=cf_mailbox_id&entities=contact`,
      {
        headers: {
          Authorization: `Token token=${process.env.FRESHSALES_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const contact = response.data.contacts?.contacts?.[0];

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const fields = contact.custom_field || {};

    res.status(200).json({
      mail_center: fields.cf_mail_center_for_campaign || "N/A",
      plan: fields.cf_mailbox_plan || "N/A",
      status: fields.cf_1583_doc_status || "N/A",
    });
  } catch (err) {
    console.error("API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

