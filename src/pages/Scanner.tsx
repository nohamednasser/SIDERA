import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Trash2, Download, Save, RotateCcw, Plus, ArrowLeft, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

interface ScannedPage {
  id: string;
  original: string;
  enhanced: string;
}

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [savedDocs, setSavedDocs] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setUserEmail(data.user.email);
      } else {
        toast.error("يجب تسجيل الدخول أولاً");
        navigate("/");
      }
    };
    getUser();
  }, [navigate]);

  useEffect(() => {
    if (userEmail) loadSavedDocs();
  }, [userEmail]);

  const loadSavedDocs = async () => {
    if (!userEmail) return;
    const { data } = await supabase
      .from("scanned_documents")
      .select("*")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false });
    if (data) setSavedDocs(data);
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      toast.error("لا يمكن الوصول للكاميرا. تأكد من إعطاء الإذن.");
    }
  };

  const closeCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsCameraOpen(false);
  }, [stream]);

  const enhanceImage = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Auto contrast + brightness enhancement for document scanning
    let minR = 255, minG = 255, minB = 255;
    let maxR = 0, maxG = 0, maxB = 0;

    for (let i = 0; i < data.length; i += 4) {
      minR = Math.min(minR, data[i]);
      maxR = Math.max(maxR, data[i]);
      minG = Math.min(minG, data[i + 1]);
      maxG = Math.max(maxG, data[i + 1]);
      minB = Math.min(minB, data[i + 2]);
      maxB = Math.max(maxB, data[i + 2]);
    }

    const rangeR = maxR - minR || 1;
    const rangeG = maxG - minG || 1;
    const rangeB = maxB - minB || 1;

    for (let i = 0; i < data.length; i += 4) {
      // Stretch contrast
      data[i] = ((data[i] - minR) / rangeR) * 255;
      data[i + 1] = ((data[i + 1] - minG) / rangeG) * 255;
      data[i + 2] = ((data[i + 2] - minB) / rangeB) * 255;

      // Sharpen whites (document background)
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (gray > 200) {
        data[i] = Math.min(255, data[i] * 1.1);
        data[i + 1] = Math.min(255, data[i + 1] * 1.1);
        data[i + 2] = Math.min(255, data[i + 2] * 1.1);
      }
      // Darken text
      if (gray < 80) {
        data[i] = data[i] * 0.7;
        data[i + 1] = data[i + 1] * 0.7;
        data[i + 2] = data[i + 2] * 0.7;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.92);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const original = canvas.toDataURL("image/jpeg", 0.92);
    const enhanced = enhanceImage(canvas);

    setPages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), original, enhanced },
    ]);
    setIsProcessing(false);
    toast.success(`تم التقاط الصفحة ${pages.length + 1}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const original = canvas.toDataURL("image/jpeg", 0.92);
          const enhanced = enhanceImage(canvas);
          setPages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), original, enhanced },
          ]);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
    toast.success("تم رفع الصور بنجاح");
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const generatePDF = (): Blob => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    pages.forEach((page, i) => {
      if (i > 0) pdf.addPage();
      const img = new Image();
      img.src = page.enhanced;
      // A4: 210 x 297 mm
      pdf.addImage(page.enhanced, "JPEG", 0, 0, 210, 297);
    });
    return pdf.output("blob");
  };

  const downloadPDF = () => {
    if (pages.length === 0) return toast.error("لا توجد صفحات للتحويل");
    const blob = generatePDF();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle || "scanned-document"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تحميل الـ PDF بنجاح");
  };

  const savePDF = async () => {
    if (!userEmail) return toast.error("يجب تسجيل الدخول أولاً");
    if (pages.length === 0) return toast.error("لا توجد صفحات للحفظ");
    if (!docTitle.trim()) return toast.error("أدخل عنوان للمستند");

    setIsSaving(true);
    try {
      const blob = generatePDF();
      const fileName = `${Date.now()}-${docTitle}.pdf`;
      const storagePath = `${userEmail}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("scanned-documents")
        .upload(storagePath, blob, { contentType: "application/pdf" });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("scanned_documents").insert({
        user_email: userEmail,
        title: docTitle,
        page_count: pages.length,
        file_size: blob.size,
        storage_path: storagePath,
      });

      if (dbError) throw dbError;

      toast.success("تم حفظ المستند بنجاح!");
      setPages([]);
      setDocTitle("");
      loadSavedDocs();
    } catch (err: any) {
      toast.error("فشل في الحفظ: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadSavedDoc = async (doc: any) => {
    const { data, error } = await supabase.storage
      .from("scanned-documents")
      .download(doc.storage_path);
    if (error || !data) return toast.error("فشل في التحميل");
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteSavedDoc = async (doc: any) => {
    await supabase.storage.from("scanned-documents").remove([doc.storage_path]);
    await supabase.from("scanned_documents").delete().eq("id", doc.id);
    toast.success("تم حذف المستند");
    loadSavedDocs();
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              📱 الماسح الضوئي الذكي
            </h1>
          </div>
          <Button
            variant={showSaved ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSaved(!showSaved)}
          >
            <FileText className="h-4 w-4 ml-1" />
            مستنداتي ({savedDocs.length})
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Saved Documents Panel */}
        {showSaved && (
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <h2 className="font-semibold text-lg">📂 المستندات المحفوظة</h2>
            {savedDocs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">لا توجد مستندات محفوظة بعد</p>
            ) : (
              <div className="grid gap-3">
                {savedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.page_count} صفحة • {(doc.file_size / 1024).toFixed(0)} KB •{" "}
                        {new Date(doc.created_at).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => downloadSavedDoc(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteSavedDoc(doc)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Camera View */}
        {isCameraOpen && (
          <div className="relative bg-black rounded-2xl overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full max-h-[60vh] object-contain" />
            {/* Overlay guide frame */}
            <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-xl pointer-events-none" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                onClick={() => {
                  closeCamera();
                  const newMode = facingMode === "environment" ? "user" : "environment";
                  setFacingMode(newMode);
                  setTimeout(() => openCamera(), 200);
                }}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                className="rounded-full w-16 h-16 bg-white text-black hover:bg-white/90"
                onClick={capturePhoto}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={closeCamera}
              >
                إغلاق
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isCameraOpen && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              className="h-24 rounded-2xl text-lg flex-col gap-2"
              onClick={openCamera}
            >
              <Camera className="h-8 w-8" />
              فتح الكاميرا
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-24 rounded-2xl text-lg flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="h-8 w-8" />
              رفع صور
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* Scanned Pages */}
        {pages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">📄 الصفحات الممسوحة ({pages.length})</h2>
              {isCameraOpen && (
                <Button size="sm" onClick={capturePhoto} disabled={isProcessing}>
                  <Plus className="h-4 w-4 ml-1" />
                  صفحة جديدة
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pages.map((page, i) => (
                <div key={page.id} className="relative group">
                  <img
                    src={page.enhanced}
                    alt={`صفحة ${i + 1}`}
                    className="w-full aspect-[3/4] object-cover rounded-xl border border-border shadow-sm"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {i + 1}
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 left-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePage(page.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Title & Save */}
            <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
              <input
                type="text"
                placeholder="عنوان المستند (مثلاً: ملخص الفيزياء)"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-3">
                <Button size="lg" variant="outline" onClick={downloadPDF} className="rounded-xl">
                  <Download className="h-5 w-5 ml-2" />
                  تحميل PDF
                </Button>
                <Button size="lg" onClick={savePDF} disabled={isSaving} className="rounded-xl">
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5 ml-2" />
                  )}
                  حفظ في حسابي
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Scanner;
