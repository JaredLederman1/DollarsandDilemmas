const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");

// Load .env file if dotenv is installed (optional)
try {
  require("dotenv").config();
} catch (e) {
  // dotenv not installed, that's okay - use environment variables directly
}

const app = express();
const PORT = process.env.PORT || 3000;

// CORS headers (allow requests from any origin)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

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

const RECIPIENT_EMAIL = "jared@dollarsanddilemmas.com";

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const isSecure = port === 465 || process.env.SMTP_SECURE === "true";
  
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: isSecure, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    tls: {
      // Do not fail on invalid certs (some providers use self-signed)
      rejectUnauthorized: false
    }
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
      // Add timeout to email sending
      const emailPromise = transporter.sendMail({
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

      // Wait max 10 seconds for email to send
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Email send timeout")), 10000)
      );

      await Promise.race([emailPromise, timeoutPromise]);
      console.log("   ✓ Email sent successfully.");
    } catch (err) {
      console.error("   ✗ Failed to send email:", err.message);
      console.error("   Full error:", err);
      // Still return 200 — we have the data logged, but log the error
    }
  }

  // Always respond to the client, even if email fails
  return res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n🎓 Dollars & Dilemmas running at http://localhost:${PORT}\n`);
});
