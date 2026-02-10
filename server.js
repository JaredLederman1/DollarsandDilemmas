const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use(express.static(path.join(__dirname)));
app.use("/public", express.static(path.join(__dirname, "public")));

// Pages
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/about", (_req, res) => res.sendFile(path.join(__dirname, "about.html")));
app.get("/contact", (_req, res) => res.sendFile(path.join(__dirname, "contact.html")));

// ---- Contact form endpoint ----
// To enable real email delivery:
//   1. npm install nodemailer
//   2. Set env vars SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
//      (e.g. for Gmail: SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=you@gmail.com SMTP_PASS=apppassword)
//   3. Restart the server
//
// Without SMTP credentials the server still accepts the form and logs the
// submission so nothing breaks during development.

const RECIPIENT_EMAIL = "jared.a.lederman@gmail.com";

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log("✓ SMTP transport configured — emails will be sent.");
} else {
  console.log("ℹ  No SMTP credentials found — contact form submissions will be logged to console only.");
}

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  console.log("\n📩 New contact form submission:");
  console.log(`   Name:    ${name}`);
  console.log(`   Email:   ${email}`);
  console.log(`   Message: ${message}\n`);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Dollars & Dilemmas Website" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: RECIPIENT_EMAIL,
        subject: `[D&D Contact] New message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        html: `
          <h3>New message from the Dollars &amp; Dilemmas website</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr />
          <p>${message.replace(/\n/g, "<br />")}</p>
        `,
      });
      console.log("   ✓ Email sent successfully.");
    } catch (err) {
      console.error("   ✗ Failed to send email:", err.message);
      // Still return 200 — we have the data logged
    }
  }

  return res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n🎓 Dollars & Dilemmas running at http://localhost:${PORT}\n`);
});
