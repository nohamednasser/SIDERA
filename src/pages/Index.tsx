import { useEffect, useState } from "react";

const Index = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Redirect to /landing if no session and not coming back from auth
    try {
      const session = JSON.parse(localStorage.getItem("sidera_session") || "null");
      const params = new URLSearchParams(window.location.search);
      const isGuest = params.get("guest") === "1";
      if (!session?.access_token && !isGuest) {
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
