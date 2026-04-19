import { useEffect, useState } from "react";

const Index = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Auth is fully owned by /landing. If no session of any kind exists, bounce there.
    try {
      const params = new URLSearchParams(window.location.search);
      const isGuestParam = params.get("guest") === "1";

      const newSession = JSON.parse(localStorage.getItem("sidera_session") || "null");
      const legacyToken = localStorage.getItem("sideraStudentToken");
      const legacyAdmin = localStorage.getItem("sideraAuthSession");
      const legacyGuest = localStorage.getItem("sideraGuest") === "true";

      const hasSession =
        !!newSession?.access_token ||
        !!legacyToken ||
        !!legacyAdmin ||
        legacyGuest ||
        isGuestParam;

      if (!hasSession) {
        window.location.replace("/landing");
        return;
      }
    } catch {
      // ignore parse errors
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <iframe
      src="/stem-drive.html"
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
        position: "fixed",
        top: 0,
        left: 0,
      }}
      title="SIDERA STEM DRIVE"
      allow="fullscreen; clipboard-write; clipboard-read"
      allowFullScreen
    />
  );
};

export default Index;
