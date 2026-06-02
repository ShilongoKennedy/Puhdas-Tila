import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Create Gemini Client safely with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Secure admin password verification handshake
  app.post("/api/admin/auth", (req, res) => {
    try {
      const { password } = req.body;
      const cleanInput = (password || "").trim();
      let expectedPassword = (process.env.ADMIN_PASSWORD || "").trim();

      // Strip any wrapping quotes from the env var if present
      if (expectedPassword.startsWith('"') && expectedPassword.endsWith('"')) {
        expectedPassword = expectedPassword.slice(1, -1);
      }
      if (expectedPassword.startsWith("'") && expectedPassword.endsWith("'")) {
        expectedPassword = expectedPassword.slice(1, -1);
      }

      // Allow either secure default fallback, or custom configured ADMIN_PASSWORD
      const isCorrect = 
        cleanInput === "PuhdasTila_SecOps_2026_Core_Success!" || 
        (expectedPassword !== "" && cleanInput === expectedPassword);

      if (isCorrect) {
        return res.json({ 
          authenticated: true, 
          token: "PuhdasTilaSecureAgentSecretHandshake" 
        });
      }

      return res.status(401).json({ error: "Virheellinen salasana / Invalid password" });
    } catch (err: any) {
      res.status(500).json({ error: "Internal authentication error" });
    }
  });

  // Public Endpoint to receive and email contact/booking form requests
  app.post("/api/contact", async (req, res) => {
    try {
      const {
        companyName,
        contactName,
        email,
        phone,
        serviceType,
        officeSize,
        startDate,
        hasSupplies,
        notes
      } = req.body;

      if (!contactName || !email) {
        return res.status(400).json({ error: "Yhteyshenkilö ja sähköpostiosoite ovat pakollisia. / Contact name and email are required." });
      }

      const apiKey = process.env.RESEND_API_KEY;
      
      // Format the contact/booking summary nicely
      const subject = `Uusi tarjouspyyntö: ${companyName || 'Yksityinen / Ei ilmoitettu'} (${contactName})`;
      
      const emailBodyText = `
UUSI YHTEYDENOTTO / TARJOUSPYYNTÖ (puhdas-tila.com)
--------------------------------------------------
Yrityksen nimi: ${companyName || 'Ei ilmoitettu'}
Yhteyshenkilö: ${contactName}
Sähköposti: ${email}
Puhelin: ${phone || 'Ei ilmoitettu'}

Palvelun tyyppi: ${serviceType === 'kertatilaus' ? 'Kertasiivous' : serviceType === 'jatkuva' ? 'Säännöllinen sopimussiivous' : serviceType || 'Ei määritelty'}
Toimiston koko: ${officeSize === 'small' ? 'Pieni (alle 100m²)' : officeSize === 'medium' ? 'Keskikokoinen (100-300m²)' : officeSize === 'large' ? 'Suuri (yli 300m²)' : officeSize || 'Ei ilmoitettu'}
Toivottu aloitusajankohta: ${startDate || 'Heti kun mahdollista'}
Omat siivousvälineet: ${hasSupplies === 'yes' ? 'Kyllä, löytyy omat' : hasSupplies === 'no' ? 'Ei, tarvitaan välineet' : 'Ei varma'}

Lisätiedot ja erityistoiveet:
${notes || 'Ei lisätietoja.'}

--
Tämä sähköposti on lähetetty automaattisesti puhdas-tila.com -verkkosivuston tarjouspyyntölomakkeelta.
      `;

      if (!apiKey || apiKey.trim() === "" || apiKey === "MY_RESEND_API_KEY") {
        console.warn("RESEND_API_KEY is blank or unconfigured. Submitted details saved in administrative panel local state.");
        return res.json({ 
          success: true, 
          emailSent: false, 
          message: "Sähköpostipalvelun API-avainta (RESEND_API_KEY) ei ole asetettu salaisuuksiin. Tiedot tallennettiin paikallisesti hallintapaneeliin." 
        });
      }

      const finalFrom = "Puhdas Tila Verkkosivut <onboarding@resend.dev>";
      
      // Determine targets: include both corporate email and direct admin email addresses
      const adminEmails = ["info@puhdas-tila.com", "kennedy.nam@gmail.com"];
      if (process.env.ADMIN_EMAIL && !adminEmails.includes(process.env.ADMIN_EMAIL)) {
        adminEmails.unshift(process.env.ADMIN_EMAIL);
      }

      // Collect all potential recipients
      const uniqueRecipients = Array.from(new Set([
        ...adminEmails,
        email
      ].filter(Boolean) as string[]));

      let successfulDeliveries = 0;
      let lastError: any = null;
      let sentIds: string[] = [];

      // Attempt to deliver to each recipient individually so a sandbox rejection or unverified recipient error for one address does NOT block the rest!
      for (const recipient of uniqueRecipients) {
        try {
          const isCustomerCopy = recipient.toLowerCase() === email.toLowerCase();
          const targetSubject = isCustomerCopy 
            ? `Vahvistus tarjouspyynnöstäsi / Confirmation of request - puhdas-tila.com`
            : subject;

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
              from: finalFrom,
              to: [recipient],
              subject: targetSubject,
              text: emailBodyText,
              html: emailBodyText.replace(/\n/g, "<br />")
            })
          });

          const data = await response.json();
          if (response.ok) {
            successfulDeliveries++;
            sentIds.push(data.id);
            console.log(`Successfully sent email to ${recipient}:`, data.id);
          } else {
            console.warn(`Resend sandbox/restriction skipped delivery to ${recipient}:`, data.message);
            lastError = data;
          }
        } catch (err: any) {
          console.error(`Connection error to deliver email to ${recipient}:`, err);
          lastError = err;
        }
      }

      if (successfulDeliveries === 0) {
        console.error("Resend API fully failed to deliver to any recipient:", lastError);
        return res.status(400).json({
          success: false,
          emailSent: false,
          error: lastError?.message || "Resend email delivery failed for all recipients",
          details: lastError
        });
      }

      return res.json({ 
        success: true, 
        emailSent: true, 
        id: sentIds[0], 
        ids: sentIds,
        message: `Sähköposti lähetetty onnistuneesti ${successfulDeliveries} vastaanottajalle.`
      });
    } catch (err: any) {
      console.error("Contact form endpoint fully crashed:", err);
      return res.status(500).json({ success: false, emailSent: false, error: err.message || "Email connection error" });
    }
  });

  // Secure programmatic direct email dispatcher endpoint
  app.post("/api/admin/send-email", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== "Bearer PuhdasTilaSecureAgentSecretHandshake") {
        return res.status(403).json({ error: "Pääsy evätty. Vain kirjautuneet ylläpitäjät sallittu. / Access unauthorized." });
      }

      const { to, subject, body, from } = req.body;

      if (!to || !subject || !body) {
        return res.status(400).json({ error: "Missing recipient (to), subject, or message body." });
      }

      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey || apiKey.trim() === "" || apiKey === "MY_RESEND_API_KEY") {
        return res.status(400).json({ 
          error: "Sähköpostipalvelun API-avain (RESEND_API_KEY) puuttuu. Määritä se ensin ympäristömuuttujissa tai tekoälystudion salaisuuksissa (Asetukset-valikossa). / RESEND_API_KEY is not configured." 
        });
      }

      // Default the 'from' sender safely
      const finalFrom = from || "Puhdas Tila <onboarding@resend.dev>";

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          from: finalFrom,
          to: [to],
          subject: subject,
          text: body,
          html: body.replace(/\n/g, "<br />")
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: data.message || "Resend API call failed.",
          details: data
        });
      }

      return res.json({ success: true, id: data.id });
    } catch (err: any) {
      console.error("Direct email dispatch warning:", err);
      return res.status(500).json({ error: err.message || "Ulkoinen sähköpostiyhteys epäonnistui." });
    }
  });

  // Real, fully integrated business lead generation API using Google Search Grounding & Gemini 3.5
  app.post("/api/leads", async (req, res) => {
    try {
      // Secure validation of admin request token
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== "Bearer PuhdasTilaSecureAgentSecretHandshake") {
        return res.status(403).json({ error: "Pääsy evätty. Vain kirjautuneet ylläpitäjät sallittu. / Access unauthorized." });
      }

      const { target, location, language = "fi", tone = "professional", offer = "estimate", officeSize = "medium" } = req.body;

      if (!target || !location) {
        return res.status(400).json({ error: "Target profile and location are required." });
      }

      const toneGuidance = {
        professional: language === "fi" 
          ? "Käytä asiallista, vakuuttavaa ja ammattimaista B2B-sävyä. Keskity laatuun, aikataulujen pitämiseen ja Puhdas Tilan turvallisuuteen."
          : "Use a clean, professional, and persuasive B2B corporate tone. Focus on high quality, strict adherence to schedules, and trust.",
        casual: language === "fi"
          ? "Käytä ystävällistä, rentoa, inspiroivaa ja helposti lähestyttävää sävyä. Sopii täydellisesti moderneille tiimeille ja startupeille."
          : "Use a friendly, relaxed, energetic, and highly approachable conversational tone. Ideal for modern teams and startups.",
        savings: language === "fi"
          ? "Korosta erinomaista hinta-laatusuhdetta, sopimuksen joustavuutta (ei sitovia vuosikausien sopimuksia) ja siivouskulujen säästöä!"
          : "Focus heavy attention on outstanding value for money, flex contracts with zero long-term lock-in, and cleaning expense reductions!"
      }[tone as "professional" | "casual" | "savings"] || "";

      const sizeGuidance = {
        small: language === "fi"
          ? "Kohteen toimitila on suhteellisen pieni/tiivis (alle 15 työpistettä), joten korosta nopeaa ja joustavaa siivousta ilman häiriöitä."
          : "The workspace is relatively small or compact (under 15 desks), so highlight fast, nimble maintenance cleaning that never disrupts work.",
        medium: language === "fi"
          ? "Kohteen toimitila on keskikokoinen (15-50 työntekijää), joten korosta perusteellista hygienian hallintaa, sairaspäivien vähentämistä ja sisäilman raikkautta."
          : "The workspace is medium-sized (15-50 people), so highlight thorough sanitation, lowering sick leaves, and keeping office air fresh.",
        large: language === "fi"
          ? "Kyseessä on suuri toimisto tai kokonainen pääkonttori (>50 työpistettä), joten painota korkeaa kapasiteettia, tiukkoja laatustandardeja ja räätälöityä vuorosuunnittelua."
          : "The facility is a large office or headquarters (>50 desks), so emphasize high sanitation capacity, strict quality audits, and custom shift planning."
      }[officeSize as "small" | "medium" | "large"] || "";

      const offerGuidance = {
        estimate: language === "fi"
          ? "Tarjoa sisäänheittona täysin ilmaista ja nopeaa 3 minuutin katselmusta paikan päällä sitoumuksetta."
          : "Propose a totally free, non-binding, and quick 3-minute physical site walkthrough to create a custom pricing estimate.",
        discount: language === "fi"
          ? "Anna erikoishoukuttimena 15 % alennus ensimmäisen kuukauden siivouspalveluista uuden asiakassuhteen kunniaksi."
          : "Introduce a special limited-time incentive of 15% discount off their very first month of contract-free office cleaning.",
        bonus: language === "fi"
          ? "Tarjoa upeana aloitusetuna täysin ilmainen ikkunanpesu tai tehostettu kosketuspintoja desinfioiva tehokäsittely ensimmäisen siivouskuukauden oheen."
          : "Add a premium signing bonus: free comprehensive window washing or absolute touch-point disinfection during their first month."
      }[offer as "estimate" | "discount" | "bonus"] || "";

      const prompt = `
        Search the web for real active businesses matching the type "${target}" in "${location}". 
        Find 3 to 5 real businesses with their names, websites, approximate addresses, and any contact details.
        For each business, analyze their potential commercial commercial cleaning needs (e.g. high foot traffic, professional image, health standards).
        Draft a highly polished, non-spammy introduction email template on behalf of the commercial office cleaning brand "Puhdas Tila" (which offers premium, contract-free, flexible office cleaning in Espoo/Helsinki/Vantaa with a local, trusted touch and a cost-savings guarantee).
        The intro email must be in ${language === "fi" ? "Finnish" : "English"} and customize it specifically to their business type.
        Ensure you only return real, existing businesses from your live search.

        CUSTOM TEMPLATE INSTRUCTIONS ALWAYS APPLY:
        - Outreach tone approach: ${toneGuidance}
        - Workspace size context: ${sizeGuidance}
        - Special promotion/CTA hook to utilize in copy: ${offerGuidance}
      `;

      let response;
      let usedFallback = false;
      let fallbackReason = "";

      const schema = {
        type: Type.OBJECT,
        properties: {
          leads: {
            type: Type.ARRAY,
            description: "List of highly targeted potential sales leads",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { 
                  type: Type.STRING, 
                  description: "Official name of the business" 
                },
                website: { 
                  type: Type.STRING, 
                  description: "Website URL of the business if found" 
                },
                address: { 
                  type: Type.STRING, 
                  description: "Sufficient address information or branch location" 
                },
                phone: { 
                  type: Type.STRING, 
                  description: "Phone number of the business if found, otherwise empty" 
                },
                email: { 
                  type: Type.STRING, 
                  description: "Public contact email if found, otherwise empty" 
                },
                whyGoodLead: { 
                  type: Type.STRING, 
                  description: "Strategic analysis of why this specific business needs professional office cleaning (their pain points, image, hygiene requirements, or size)" 
                },
                outreachEmailSubject: { 
                  type: Type.STRING, 
                  description: "A highly click-worthy, modern, friendly email subject line" 
                },
                outreachEmailBody: { 
                  type: Type.STRING, 
                  description: "A personalized intro outreach email from Puhdas Tila. Keep it humble, offering an obligation-free 3-minute chat or free site estimate." 
                }
              },
              required: ["name", "whyGoodLead", "outreachEmailSubject", "outreachEmailBody"]
            }
          },
          searchSummary: { 
            type: Type.STRING, 
            description: "Short synthesis summarizing the search criteria and overall local visibility of this sector" 
          }
        },
        required: ["leads"]
      };

      try {
        // Call GoogleGenAI with Google Search Grounding to find real-time internet leads!
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: schema
          }
        });
      } catch (groundingError: any) {
        console.warn("Primary Google Search Grounding failed (likely quota limit). Falling back to direct model intelligence...", groundingError.message);
        
        usedFallback = true;
        fallbackReason = groundingError.message || "Quota limit exceeded";

        const fallbackPrompt = `
          Based on realistic commercial metrics, generate 3 to 5 realistic prospective business leads matching the profile "${target}" located in or around "${location}" for the local commercial office cleaning provider "Puhdas Tila" (which offers premium, contract-free, flexible cleaning services in Espoo/Helsinki/Vantaa with a local, trusted touch and a cost-savings guarantee).
          
          For each business, analyze their typical commercial footprints and cleaning pain points (such as high foot traffic, health standards, or keeping a pristine customer image). 
          Draft a personalized, high-conversion intro outreach email in ${language === "fi" ? "Finnish" : "English"} customized to their sector.

          CUSTOM TEMPLATE INSTRUCTIONS ALWAYS APPLY:
          - Outreach tone approach: ${toneGuidance}
          - Workspace size context: ${sizeGuidance}
          - Special promotion/CTA hook to utilize in copy: ${offerGuidance}
        `;

        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: fallbackPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema
          }
        });
      }

      // Extract search grounding citations if available
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks.map((chunk: any) => {
        if (chunk.web) {
          return {
            title: chunk.web.title,
            uri: chunk.web.uri
          };
        }
        return null;
      }).filter(Boolean);

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No target response generated from Gemini.");
      }

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseErr) {
        console.error("JSON parsing error on Gemini response:", responseText);
        parsedData = { leads: [], searchSummary: "Could not parse details securely." };
      }

      // Merge verified live sources into the response
      res.json({
        ...parsedData,
        sources,
        usedFallback,
        fallbackReason
      });

    } catch (error: any) {
      console.error("Lead generation endpoint error:", error);
      res.status(500).json({ error: error.message || "An unexpected error occurred while scanning the web." });
    }
  });

  // Serve Vite in development, or compiled static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
