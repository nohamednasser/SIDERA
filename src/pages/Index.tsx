const Index = () => {
  return (
    <iframe
      src="/stem-drive.html"
      style={{
        width: '100vw',
        height: '100vh',
        border: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
      title="SIDERA STEM DRIVE"
      allow="fullscreen; clipboard-write; clipboard-read"
      allowFullScreen
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-top-navigation"
    />
  );
};

export default Index;
