import { useEffect, useRef, useState } from "react";

const LOADER_BG = "rgba(22,30,47,0.92)";
const ACCENT = "#FFA586";

const Loader = ({ visible }: { visible: boolean }) => (
  <div
    aria-hidden={!visible}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 2147483647,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: LOADER_BG,
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "auto" : "none",
      transition: "opacity .25s ease",
      fontFamily: "Inter, 'Segoe UI', sans-serif",
    }}
  >
    <style>{`@keyframes sideraSpin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          border: `3px solid rgba(255,165,134,0.18)`,
          borderTopColor: ACCENT,
          animation: "sideraSpin .7s linear infinite",
        }}
      />
      <div
        style={{
          marginTop: 18,
          color: ACCENT,
          fontSize: ".85rem",
          fontWeight: 600,
          letterSpacing: ".5px",
          textTransform: "uppercase",
          opacity: 0.85,
        }}
      >
        SIDERA
      </div>
    </div>
  </div>
);

const Index = () => {
  const [ready, setReady] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
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
        // Show loader briefly while we hop to /landing
        window.location.replace("/landing");
        return;
      }
    } catch {
      // ignore parse errors
    }
    setReady(true);
  }, []);

  // Show the loader until the iframe is fully loaded
  const showLoader = !ready || !iframeLoaded;

  return (
    <>
      <Loader visible={showLoader} />
      {ready && (
        <iframe
          ref={iframeRef}
          src="/stem-drive.html"
          onLoad={() => setIframeLoaded(true)}
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
      )}
    </>
  );
};

export default Index;
