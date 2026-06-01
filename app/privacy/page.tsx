export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px", fontFamily: "Arial, sans-serif", color: "#f0f0f0", background: "#090909", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#66666f", marginBottom: 40 }}>Last updated: June 1, 2026</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Overview</h2>
      <p style={{ color: "#a0a0b0", lineHeight: 1.7, marginBottom: 24 }}>UX Rival is a Chrome extension that generates AI-powered competitive UX analysis for any product or website. We are committed to protecting your privacy.</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Data We Collect</h2>
      <p style={{ color: "#a0a0b0", lineHeight: 1.7, marginBottom: 12 }}>UX Rival does not collect, store or transmit any personally identifiable information.</p>
      <p style={{ color: "#a0a0b0", lineHeight: 1.7, marginBottom: 24 }}>The extension stores the following data locally on your device only: your last analysis result, your last selected category, and your panel open/close preference. This data never leaves your device.</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Data We Do Not Collect</h2>
      <ul style={{ color: "#a0a0b0", lineHeight: 1.9, marginBottom: 24, paddingLeft: 20 }}>
        <li>We do not collect your name, email address or any personal information</li>
        <li>We do not track your browsing history</li>
        <li>We do not record which websites you visit</li>
        <li>We do not sell or share any data with third parties</li>
      </ul>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>API Calls</h2>
      <p style={{ color: "#a0a0b0", lineHeight: 1.7, marginBottom: 24 }}>When you run an analysis the extension sends the industry category, competitor names and analysis depth to our server at uxrival.xyz. No personal information is included in these requests.</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Third Party Services</h2>
      <p style={{ color: "#a0a0b0", lineHeight: 1.7, marginBottom: 24 }}>Analysis results are generated using the Google Gemini AI API. No personally identifiable information is sent to Google.</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Contact</h2>
      <p style={{ color: "#a0a0b0", lineHeight: 1.7 }}>For questions about this privacy policy contact: ayangbohunmi1@gmail.com</p>
    </main>
  );
}
