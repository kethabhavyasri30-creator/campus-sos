import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the compiled Vite frontend
app.use(express.static(path.join(__dirname, 'dist')));

const PORT = 4000;

// Load credentials from .env
const ntfyTopic = process.env.VITE_NTFY_TOPIC;
const fast2smsKey = process.env.VITE_FAST2SMS_API_KEY;
const fast2smsEnabled = process.env.FAST2SMS_ENABLED === 'true'; // off by default (requires paid recharge)
const dispatchPhone = process.env.VITE_DISPATCH_PHONE_NUMBER;

// Avoid duplicate sirens if the same emergency is sent twice (retries, double taps)
const recentIds = new Map();
const DEDUPE_MS = 60_000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms)),
  ]);
}

/**
 * Sends a MAX-priority (5) ntfy push using JSON publishing.
 * JSON publishing supports emojis/UTF-8 safely (headers do not).
 * Retries up to 3 times so a single network blip does not drop the siren.
 */
async function sendSiren({ title, message, mapLink, tags }) {
  if (!ntfyTopic) throw new Error('VITE_NTFY_TOPIC missing in .env');

  const body = {
    topic: ntfyTopic,
    title,
    message,
    priority: 5, // urgent = loudest channel on the phone
    tags,
  };
  if (mapLink) {
    body.click = mapLink;
    body.actions = [{ action: 'view', label: 'Open GPS Map', url: mapLink, clear: false }];
  }

  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await withTimeout(
        fetch('https://ntfy.sh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
        6000
      );
      if (res.ok) return true;
      lastErr = new Error(`ntfy HTTP ${res.status}: ${await res.text()}`);
    } catch (err) {
      lastErr = err;
    }
    await new Promise((r) => setTimeout(r, 500 * attempt));
  }
  throw lastErr;
}

/**
 * FREE emergency voice call via CallMeBot (Telegram voice call, rings the phone).
 * Needs CALLMEBOT_USER in .env (Telegram @username or +countrycode number)
 * and a one-time /start to @CallMeBot_txtbot to authorize.
 */
async function sendVoiceCall(text) {
  const user = process.env.CALLMEBOT_USER;
  if (!user) return false;
  const params = new URLSearchParams({
    user,
    text: text.slice(0, 250),
    lang: process.env.CALLMEBOT_LANG || 'en-GB-Standard-B',
    rpt: '3',
    cc: 'no',
    timeout: '40',
  });
  const res = await withTimeout(fetch(`https://api.callmebot.com/start.php?${params}`), 15000);
  const body = await res.text();
  if (!res.ok || /error/i.test(body)) throw new Error(`CallMeBot: ${body.slice(0, 200)}`);
  return true;
}

/**
 * FREE WhatsApp direct message via Twilio Sandbox.
 * Needs TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and WHATSAPP_PHONE in .env
 */
async function sendWhatsApp(text) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const toPhone = process.env.WHATSAPP_PHONE; // e.g., +919441291655
  const fromPhone = process.env.TWILIO_FROM || 'whatsapp:+14155238886';
  
  if (!sid || !token || !toPhone) return false;

  // Format destination number for Twilio (must start with whatsapp:+)
  const formattedTo = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone.startsWith('+') ? toPhone : '+' + toPhone}`;
  
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const params = new URLSearchParams({
    To: formattedTo,
    From: fromPhone,
    Body: text
  });

  const res = await withTimeout(fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  }), 10000);

  const data = await res.json();
  if (!res.ok) throw new Error(`Twilio Error: ${data.message || res.statusText}`);
  return true;
}

async function sendSms(text) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const toPhone = process.env.VITE_DISPATCH_PHONE_NUMBER || process.env.WHATSAPP_PHONE;
  const fromPhone = process.env.TWILIO_VOICE_FROM || '+17372508034'; 
  
  if (!sid || !token || !toPhone) return false;

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const params = new URLSearchParams({
    To: toPhone,
    From: fromPhone,
    Body: text
  });

  const res = await withTimeout(fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  }), 10000);

  const data = await res.json();
  if (!res.ok) throw new Error(`Twilio SMS Error: ${data.message || res.statusText}`);
  return true;
}

/**
 * FREE Cellular Voice Call with Robot Text-to-Speech via Twilio Programmable Voice.
 */
async function sendTwilioVoiceCall(text) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const toPhone = process.env.VITE_DISPATCH_PHONE_NUMBER || process.env.WHATSAPP_PHONE;
  // Use a standard Twilio voice number for standard calls (if available), otherwise fallback to a default sandbox number format
  const fromPhone = process.env.TWILIO_VOICE_FROM || '+14155238886'; 
  
  if (!sid || !token || !toPhone) return false;

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  
  // Trial accounts don't allow raw Twiml, so we use Twimlets to generate the XML dynamically
  const url = `http://twimlets.com/message?Message%5B0%5D=${encodeURIComponent(text)}`;
  
  const params = new URLSearchParams({
    To: toPhone,
    From: fromPhone,
    Url: url
  });

  const res = await withTimeout(fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  }), 15000);

  const data = await res.json();
  if (!res.ok) throw new Error(`Twilio Voice Error: ${data.message || res.statusText}`);
  return true;
}

app.post('/api/emergency-alert', async (req, res) => {
  const { id, emergencyType, location, studentName, studentId, description, gpsCoords } = req.body || {};

  if (id) {
    const last = recentIds.get(id);
    if (last && Date.now() - last < DEDUPE_MS) {
      return res.status(200).json({ success: true, deduped: true });
    }
    recentIds.set(id, Date.now());
  }

  const mapLink = gpsCoords?.lat != null
    ? `https://maps.google.com/?q=${gpsCoords.lat},${gpsCoords.lng}`
    : null;

  const message =
    `Type: ${emergencyType}\n` +
    `Student: ${studentName} (${studentId})\n` +
    `Location: ${location}\n` +
    (mapLink ? `GPS: ${mapLink}\n` : '') +
    `Details: ${description || 'N/A'}`;

  // Run all channels in PARALLEL so a slow/failing channel never delays the siren
  const spokenText =
    `Emergency alert. ${emergencyType} emergency reported by ${studentName} at ${location}. ` +
    `Please respond immediately.`;
  const [siren, sms, call, whatsapp, twilioVoice] = await Promise.allSettled([
    sendSiren({
      title: `🚨 SOS: ${emergencyType} emergency`,
      message,
      mapLink,
      tags: ['rotating_light', 'sos'],
    }),
    sendSms(`SOS ${emergencyType}: ${studentName} at ${location}. ${mapLink || ''}`),
    sendVoiceCall(spokenText), // Telegram CallMeBot fallback
    sendWhatsApp(`*🚨 CAMPUS SOS ALERT*\n\n*Type:* ${emergencyType}\n*Student:* ${studentName} (${studentId})\n*Location:* ${location}\n${mapLink ? `*Map:* ${mapLink}` : ''}`),
    sendTwilioVoiceCall(spokenText), // Real Cellular Voice Call via Twilio
  ]);

  if (siren.status === 'fulfilled') console.log(`[ntfy] 🚨 Siren sent for ${id || 'unknown id'}`);
  else console.error('[ntfy Error]', siren.reason?.message);

  if (sms.status === 'rejected') console.error('[Fast2SMS Error]', sms.reason?.message);

  if (call.status === 'fulfilled' && call.value) console.log(`[CallMeBot] 📞 Voice call placed for ${id || 'unknown id'}`);
  else if (call.status === 'rejected') console.error('[CallMeBot Error]', call.reason?.message);

  if (whatsapp.status === 'fulfilled' && whatsapp.value) console.log(`[WhatsApp] 💬 Message sent for ${id || 'unknown id'}`);
  else if (whatsapp.status === 'rejected') console.error('[WhatsApp Error]', whatsapp.reason?.message);

  if (twilioVoice.status === 'fulfilled' && twilioVoice.value) console.log(`[Twilio Voice] 🤖 Automated cellular call placed for ${id || 'unknown id'}`);
  else if (twilioVoice.status === 'rejected') console.error('[Twilio Voice Error]', twilioVoice.reason?.message);

  const callPlaced = (call.status === 'fulfilled' && call.value === true) || (twilioVoice.status === 'fulfilled' && twilioVoice.value === true);
  if (siren.status === 'fulfilled' || callPlaced || (whatsapp.status === 'fulfilled' && whatsapp.value)) {
    return res.status(200).json({
      success: true,
      siren: siren.status === 'fulfilled',
      call: callPlaced,
      whatsapp: whatsapp.status === 'fulfilled' && whatsapp.value === true,
      sms: sms.status === 'fulfilled' && sms.value === true,
    });
  }
  return res.status(502).json({ success: false, error: siren.reason?.message || 'All alert channels failed' });
});

// Quick way to test the phone setup: open http://localhost:4000/api/test-siren
app.get('/api/test-siren', async (req, res) => {
  try {
    await sendSiren({
      title: '🔔 Test Siren - Campus SOS',
      message: 'If your phone is ringing loudly, the siren setup works!',
      tags: ['loudspeaker'],
    });
    res.send('✅ Test siren sent. Check your phone.');
  } catch (err) {
    res.status(502).send(`❌ Failed: ${err.message}`);
  }
});

// Test the free emergency voice call: open http://localhost:4000/api/test-call
app.get('/api/test-call', async (req, res) => {
  if (!process.env.TWILIO_ACCOUNT_SID) {
    return res.status(400).send('❌ TWILIO_ACCOUNT_SID is not set in .env yet.');
  }
  try {
    await sendTwilioVoiceCall('This is a test of the Campus S O S emergency call system. If you hear this, Twilio voice is working correctly.');
    res.send('✅ Test cellular call requested. Your phone should ring within 5 seconds.');
  } catch (err) {
    res.status(502).send(`❌ Failed: ${err.message}`);
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true, ntfyConfigured: Boolean(ntfyTopic) }));

// Fallback for React Router (must stay last)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`\n🚨 Emergency Alert Server running on http://localhost:${PORT}`);
  console.log(`   ntfy topic: ${ntfyTopic ? 'configured' : 'MISSING!'}`);
  console.log(`   Test the siren: http://localhost:${PORT}/api/test-siren\n`);
});

// Surface "port already in use" instead of silently exiting
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use. Close the other server window (or run: Stop-Process -Name node -Force) and try again.\n`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
