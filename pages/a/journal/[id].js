import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { Inter, Space_Grotesk } from "next/font/google";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Circle,
  Briefcase,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Home,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Mic,
  MicOff,
  RefreshCw,
  Save,
  Video,
  VideoOff,
} from "lucide-react";

import api from "@/lib/api";
import { Button } from "@/components/ui/button";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const navMenus = [
  {
    title: "Home",
    description: "Landing and product story",
    href: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    description: "Quick start and overview",
    href: "/a/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Daily Log",
    description: "Track daily actions",
    href: "/a/worklogs",
    icon: FileText,
  },
  {
    title: "Job Hunting Tracker",
    description: "Manage applications and logs",
    href: "/a/applications",
    icon: Briefcase,
  },
  {
    title: "My Journal",
    description: "Video journals and notes",
    href: "/a/journal",
    icon: BookOpen,
  },
];

const NAVBAR_HIDDEN_PATHS = new Set(["/a/journal/[id]"]);

function parseCaptionSegments(caption) {
  if (!caption) return [];

  const transcriptLines = Array.isArray(caption.transcript)
    ? caption.transcript.flatMap((item) =>
        Array.isArray(item?.Lines)
          ? item.Lines.map((line, index) => ({
              id: `${item?.LanguageCode || "track"}-${line.start ?? 0}-${index}`,
              start: Number(line.start ?? 0),
              end: Number(line.start ?? 0) + Number(line.duration ?? 3),
              text: line.text ?? "",
            }))
          : [],
      )
    : [];

  if (transcriptLines.length > 0) {
    return transcriptLines
      .filter(
        (segment) =>
          segment.text &&
          !Number.isNaN(segment.start) &&
          !Number.isNaN(segment.end),
      )
      .sort((a, b) => a.start - b.start);
  }

  const candidates = [
    caption.segments,
    caption.cues,
    caption.items,
    caption.lines,
    caption.entries,
  ];

  const rawList = candidates.find((entry) => Array.isArray(entry)) || [];
  return rawList
    .map((segment, index) => {
      const start = Number(
        segment.start ?? segment.from ?? segment.offset ?? 0,
      );
      const end = Number(
        segment.end ?? segment.to ?? start + Number(segment.duration ?? 3),
      );
      const text = segment.text ?? segment.caption ?? segment.value ?? "";

      if (!text || Number.isNaN(start) || Number.isNaN(end)) return null;

      return {
        id: segment.id || `${start}-${index}`,
        start,
        end,
        text: String(text),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);
}

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function JournalDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [cookies, , removeCookie] = useCookies(["auth_token"]);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [journal, setJournal] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const centerMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [editorHtml, setEditorHtml] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState("save");
  const [isRefreshingTranscript, setIsRefreshingTranscript] = useState(false);
  const [isUrlCopied, setIsUrlCopied] = useState(false);
  const lastSavedContentRef = useRef("");
  const hydratedEditorRef = useRef(false);
  const [showCameraFeed, setShowCameraFeed] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparingRecording, setIsPreparingRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState("");
  const [recordedMimeType, setRecordedMimeType] = useState("video/webm");
  const [recordedAt, setRecordedAt] = useState("");
  const [recordingQuality, setRecordingQuality] = useState("1080");
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const currentCameraIdRef = useRef("");
  const screenStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const captionContainerRef = useRef(null);
  const activeCaptionRef = useRef(null);

  const captionSegments = useMemo(
    () => parseCaptionSegments(journal?.caption),
    [journal?.caption],
  );

  const activeCaptionId = useMemo(() => {
    const active = captionSegments.find(
      (segment) => currentTime >= segment.start && currentTime < segment.end,
    );
    return active ? active.id : null;
  }, [captionSegments, currentTime]);

  useEffect(() => {
    const onOutside = (event) => {
      if (
        centerMenuRef.current &&
        !centerMenuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!cookies.auth_token) {
        router.push("/login");
        return;
      }

      const { data, error } = await api.getCurrentUser();
      if (error) {
        removeCookie("auth_token", { path: "/" });
        router.push("/login");
        return;
      }

      setUser(data);
      setIsLoading(false);
    };

    checkAuth();
  }, [cookies.auth_token, removeCookie, router]);

  useEffect(() => {
    if (!id || !user) return;

    const loadDetail = async () => {
      const { data, error } = await api.getJournal(id);
      if (error) {
        toast.error(error.message || "Failed to load journal detail");
        router.push("/a/journal");
        return;
      }

      setJournal(data);
      hydratedEditorRef.current = false;
      setEditorHtml(data?.content || "");
      lastSavedContentRef.current = data?.content || "";
      setSaveState("save");
    };

    loadDetail();
  }, [id, user, router]);

  useEffect(() => {
    if (!activeCaptionRef.current || !captionContainerRef.current) return;

    const container = captionContainerRef.current;
    const activeNode = activeCaptionRef.current;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeNode.getBoundingClientRect();
    const topOffset = 10;
    const targetTop =
      container.scrollTop + (activeRect.top - containerRect.top) - topOffset;

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "auto",
    });
  }, [activeCaptionId]);

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
    };
  }, [recordedVideoUrl]);

  const attachCameraToPreview = useCallback(() => {
    if (!cameraVideoRef.current || !cameraStreamRef.current) return;
    cameraVideoRef.current.srcObject = cameraStreamRef.current;
  }, []);

  const loadCameraDevices = useCallback(async () => {
    if (!navigator?.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    setCameraDevices(cameras);

    if (!selectedCameraId && cameras.length > 0) {
      setSelectedCameraId(cameras[0].deviceId);
    }
  }, [selectedCameraId]);

  const ensureCameraStream = useCallback(async (cameraIdParam) => {
    const targetCameraId = cameraIdParam ?? selectedCameraId;
    const currentCameraId = currentCameraIdRef.current;

    if (
      cameraStreamRef.current &&
      (!targetCameraId || targetCameraId === currentCameraId)
    ) {
      return cameraStreamRef.current;
    }

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: targetCameraId
        ? {
            deviceId: { exact: targetCameraId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        : {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
      audio: true,
    });

    cameraStreamRef.current = stream;
    currentCameraIdRef.current =
      stream.getVideoTracks()?.[0]?.getSettings?.().deviceId || targetCameraId || "";
    if (currentCameraIdRef.current && currentCameraIdRef.current !== selectedCameraId) {
      setSelectedCameraId(currentCameraIdRef.current);
    }

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !isMicMuted;
    });
    attachCameraToPreview();
    await loadCameraDevices();
    return stream;
  }, [attachCameraToPreview, isMicMuted, selectedCameraId, loadCameraDevices]);

  useEffect(() => {
    if (!showCameraFeed) return;
    attachCameraToPreview();
  }, [showCameraFeed, attachCameraToPreview]);

  const chooseRecordingMimeType = () => {
    const candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4;codecs=h264,aac",
      "video/mp4",
    ];
    const supported = candidates.find((type) => MediaRecorder.isTypeSupported(type));
    return supported || "video/webm";
  };

  const getDisplayMediaStream = async (quality) => {
    const presets = {
      "1080": { width: 1920, height: 1080 },
      "1440": { width: 2560, height: 1440 },
    };
    const target = presets[quality] || presets["1080"];

    const preferred = {
      video: {
        frameRate: 30,
        width: { ideal: target.width },
        height: { ideal: target.height },
        displaySurface: "browser",
      },
      audio: true,
      preferCurrentTab: true,
      selfBrowserSurface: "include",
      surfaceSwitching: "include",
    };

    try {
      return await navigator.mediaDevices.getDisplayMedia(preferred);
    } catch (error) {
      if (error?.name === "TypeError") {
        return navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: 30,
            width: { ideal: target.width },
            height: { ideal: target.height },
          },
          audio: true,
        });
      }
      throw error;
    }
  };

  const startScreenRecording = async () => {
    if (isRecording || isPreparingRecording) return;

    try {
      setIsPreparingRecording(true);
      const cameraStream = await ensureCameraStream();
      const displayStream = await getDisplayMediaStream(recordingQuality);
      screenStreamRef.current = displayStream;

      const mixedStream = new MediaStream();
      const displayVideoTrack = displayStream.getVideoTracks()[0];
      if (displayVideoTrack) mixedStream.addTrack(displayVideoTrack);

      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      const displayAudioTracks = displayStream.getAudioTracks();
      if (displayAudioTracks.length > 0) {
        const displayAudio = new MediaStream(displayAudioTracks);
        const source = audioContext.createMediaStreamSource(displayAudio);
        source.connect(destination);
      }

      const micTracks = cameraStream.getAudioTracks();
      if (micTracks.length > 0 && !isMicMuted) {
        const micStream = new MediaStream(micTracks);
        const micSource = audioContext.createMediaStreamSource(micStream);
        micSource.connect(destination);
      }

      destination.stream.getAudioTracks().forEach((track) => mixedStream.addTrack(track));

      const mimeType = chooseRecordingMimeType();
      setRecordedMimeType(mimeType);
      recordedChunksRef.current = [];

      const recorder = new MediaRecorder(mixedStream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => track.stop());
          screenStreamRef.current = null;
        }
        audioContext.close();

        if (recordedChunksRef.current.length === 0) {
          setIsRecording(false);
          return;
        }

        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        if (recordedVideoUrl) {
          URL.revokeObjectURL(recordedVideoUrl);
        }
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setRecordedAt(new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-"));
        setIsRecording(false);
      };

      recorder.start(1000);
      setRecordedVideoUrl("");
      setIsRecording(true);
      setIsPreparingRecording(false);

      if (displayVideoTrack) {
        displayVideoTrack.onended = () => {
          if (recorderRef.current && recorderRef.current.state !== "inactive") {
            recorderRef.current.stop();
          }
        };
      }
    } catch (error) {
      setIsPreparingRecording(false);
      toast.error(error.message || "Failed to start recording");
    }
  };

  const stopScreenRecording = () => {
    if (!recorderRef.current || recorderRef.current.state === "inactive") return;
    recorderRef.current.stop();
  };

  const handleDownloadRecording = () => {
    if (!recordedVideoUrl) return;
    const extension = recordedMimeType.includes("mp4") ? "mp4" : "webm";
    const anchor = document.createElement("a");
    anchor.href = recordedVideoUrl;
    anchor.download = `journal-recording-${recordedAt || Date.now()}.${extension}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleLogout = () => {
    removeCookie("auth_token", { path: "/" });
    router.push("/login");
  };

  const performSave = useCallback(async () => {
    if (!journal?.id || isSaving) return;
    if (editorHtml === lastSavedContentRef.current) {
      setSaveState("saved");
      return;
    }

    setIsSaving(true);
    setSaveState("saving");

    const payload = {
      content: editorHtml,
      video_timestamp: Math.floor(currentTime),
    };

    const { data, error } = await api.updateJournal(journal.id, payload);
    setIsSaving(false);

    if (error) {
      setSaveState("save");
      toast.error(error.message || "Failed to save journal");
      return;
    }

    setJournal(data);
    lastSavedContentRef.current = editorHtml;
    setSaveState("saved");
  }, [journal?.id, isSaving, editorHtml, currentTime]);

  useEffect(() => {
    if (!journal?.id) return;
    if (!hydratedEditorRef.current) {
      hydratedEditorRef.current = true;
      return;
    }

    if (editorHtml === lastSavedContentRef.current) return;

    setSaveState("save");
    const timer = setTimeout(() => {
      performSave();
    }, 4000);

    return () => clearTimeout(timer);
  }, [editorHtml, journal?.id, performSave]);

  const handleSave = async () => {
    await performSave();
  };

  const handleEditorChange = (value) => {
    setEditorHtml(value);
    if (value !== lastSavedContentRef.current) {
      setSaveState("save");
    }
  };

  const handleCopyVideoUrl = async () => {
    if (!journal?.video_url) return;
    try {
      await navigator.clipboard.writeText(journal.video_url);
      setIsUrlCopied(true);
      setTimeout(() => setIsUrlCopied(false), 1500);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleToggleCameraFeed = async () => {
    if (!showCameraFeed) {
      try {
        await ensureCameraStream();
      } catch (error) {
        toast.error(error.message || "Failed to access camera");
        return;
      }
    }
    setShowCameraFeed((prev) => !prev);
  };

  const handleToggleMute = async () => {
    try {
      const stream = await ensureCameraStream();
      const nextMuted = !isMicMuted;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
      setIsMicMuted(nextMuted);
    } catch (error) {
      toast.error(error.message || "Failed to access microphone");
    }
  };

  const handleCameraSelect = async (cameraId) => {
    setSelectedCameraId(cameraId);
    try {
      await ensureCameraStream(cameraId);
    } catch (error) {
      toast.error(error.message || "Failed to switch camera");
    }
  };

  const handleRefreshTranscript = async () => {
    if (!journal?.id || isRefreshingTranscript) return;

    setIsRefreshingTranscript(true);
    const { error } = await api.refreshJournalTranscript(journal.id);
    setIsRefreshingTranscript(false);

    if (error) {
      toast.error(error.message || "Failed to refresh transcript");
      return;
    }

    const { data, error: detailError } = await api.getJournal(journal.id);
    if (detailError) {
      toast.error(detailError.message || "Transcript refreshed, failed to reload journal");
      return;
    }

    setJournal(data);
    toast.success("Transcript refreshed");
  };

  const userInitial = (user?.name || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();
  const showTopNavbar = !NAVBAR_HIDDEN_PATHS.has(router.pathname);

  if (isLoading || !journal) {
    return (
      <div
        className={`${bodyFont.className} min-h-screen bg-[#1e1e1e] text-[#d4d4d4] flex items-center justify-center`}
      >
        <div className="text-sm text-[#9da1a6]">Loading journal detail...</div>
      </div>
    );
  }

  return (
    <div
      className={`${bodyFont.className} ${headingFont.variable} min-h-screen bg-background text-foreground overflow-hidden`}
      style={{
        "--background": "#1e1e1e",
        "--foreground": "#d4d4d4",
        "--card": "#252526",
        "--card-foreground": "#d4d4d4",
        "--popover": "#252526",
        "--popover-foreground": "#d4d4d4",
        "--primary": "#007acc",
        "--primary-foreground": "#ffffff",
        "--secondary": "#2d2d30",
        "--secondary-foreground": "#d4d4d4",
        "--muted": "#2a2a2d",
        "--muted-foreground": "#9da1a6",
        "--accent": "#2d2d30",
        "--accent-foreground": "#d4d4d4",
        "--destructive": "#f48771",
        "--border": "#3c3c3c",
        "--input": "#3c3c3c",
        "--ring": "#007acc",
      }}
    >
      {showTopNavbar && (
      <header className="sticky top-0 z-40 border-b border-[#3c3c3c] bg-[#1e1e1e]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-3 sm:px-4">
          <div className="flex w-[180px] items-center justify-start">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#3c3c3c] bg-[#252526] text-xs font-semibold text-[#9cdcfe]">
                mf
              </span>
              <span className="font-[var(--font-heading)] text-lg tracking-tight text-[#e8e8e8]">
                my future me
              </span>
            </Link>
          </div>

          <div
            ref={centerMenuRef}
            className="relative flex flex-1 justify-center"
          >
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#3c3c3c] bg-[#252526] px-4 text-sm font-medium text-[#d4d4d4] transition-colors hover:bg-[#2d2d30]"
              aria-expanded={isMenuOpen}
            >
              <Menu className="h-4 w-4 text-[#9cdcfe]" />
              Menu
              <ChevronDown className="h-4 w-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute top-12 w-[min(94vw,560px)] overflow-hidden rounded-xl border border-[#3c3c3c] bg-[#252526] shadow-2xl shadow-black/40">
                <div className="border-b border-[#3c3c3c] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9da1a6]">
                  Navigation
                </div>
                <div className="max-h-[60vh] overflow-y-auto py-1">
                  {navMenus.map((item) => {
                    const isActive = router.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={`block border-b border-[#303030] px-4 py-3 transition-colors last:border-b-0 ${isActive ? "bg-[#2d2d30]" : "hover:bg-[#2d2d30]"}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#3c3c3c] bg-[#1f1f1f] text-[#9cdcfe]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-medium text-[#e8e8e8]">
                              {item.title}
                            </div>
                            <div className="mt-0.5 text-xs text-[#9da1a6]">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div
            ref={userMenuRef}
            className="relative flex w-[180px] justify-end"
          >
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#3c3c3c] bg-[#252526] text-sm font-semibold text-[#9cdcfe] transition-colors hover:bg-[#2d2d30]"
              aria-expanded={isUserMenuOpen}
            >
              {userInitial}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-12 w-64 rounded-xl border border-[#3c3c3c] bg-[#252526] p-1 shadow-2xl shadow-black/40">
                <div className="border-b border-[#3c3c3c] px-3 py-2">
                  <p className="truncate text-sm font-medium text-[#e8e8e8]">
                    {user?.name || "User"}
                  </p>
                  <p className="truncate text-xs text-[#9da1a6]">
                    {user?.email || ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-1 h-9 w-full justify-start gap-2 rounded-md px-3 text-sm text-[#f48771] hover:bg-[#3a1717] hover:text-[#ffb4a5]"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      )}

      <main className={`${showTopNavbar ? "h-[calc(100vh-64px)]" : "h-screen"} w-screen`}>
        <div className="grid h-full grid-cols-2 gap-2 overflow-hidden bg-[#252526] p-2">
          <section className="grid min-h-0 grid-rows-[auto_1fr_1fr] gap-2 overflow-hidden rounded-md border border-[#3c3c3c] bg-[#1f1f1f] p-2">
            <div className="flex items-center justify-between rounded-md border border-[#3c3c3c] bg-[#252526] px-2 py-1.5">
              <div className="flex min-w-0 items-center gap-2">
                <Link
                  href="/a/journal"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#3c3c3c] bg-[#1f1f1f] text-[#9da1a6] hover:bg-[#2d2d30]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="min-w-0">
                  <h1 className="truncate text-sm font-semibold text-[#e8e8e8]">
                    {journal.title}
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs text-[#8f9397]">
                      {journal.video_url}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyVideoUrl}
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#3c3c3c] bg-[#252526] text-[#9da1a6] hover:bg-[#2d2d30]"
                      title="Copy video URL"
                    >
                      {isUrlCopied ? (
                        <Check className="h-3 w-3 text-[#4ec9b0]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 rounded-md bg-[#007acc] px-3 text-xs font-semibold text-white hover:bg-[#0e639c]"
              >
                {saveState === "saving" ? (
                  <>
                    <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Spinning
                  </>
                ) : saveState === "saved" ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Save
                  </>
                )}
              </Button>
            </div>

            <div className="overflow-hidden rounded-md border border-[#3c3c3c] bg-black">
              <ReactPlayer
                src={journal.video_url}
                width="100%"
                height="100%"
                controls
                onTimeUpdate={(e) => {
                  if (e?.currentTarget?.currentTime != null) {
                    setCurrentTime(e.currentTarget.currentTime);
                  }
                }}
                onProgress={(state) => {
                  if (state?.playedSeconds != null) {
                    setCurrentTime(state.playedSeconds);
                  }
                }}
              />
            </div>

            <div className="min-h-0 overflow-hidden rounded-md border border-[#3c3c3c] bg-[#252526]">
              <div className="flex items-center justify-between border-b border-[#3c3c3c] px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9da1a6]">Captions</span>
                <button
                  type="button"
                  onClick={handleRefreshTranscript}
                  disabled={isRefreshingTranscript}
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-[#3c3c3c] bg-[#1f1f1f] px-2 text-[11px] font-semibold text-[#9cdcfe] hover:bg-[#2d2d30] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isRefreshingTranscript ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Refresh
                </button>
              </div>
              <div
                ref={captionContainerRef}
                className="h-[calc(100%-37px)] overflow-y-auto p-2"
              >
                {captionSegments.length === 0 ? (
                  <div className="rounded-md border border-dashed border-[#3c3c3c] bg-[#1f1f1f] px-3 py-4 text-sm text-[#8f9397]">
                    Caption data is not available for this video.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {captionSegments.map((segment) => {
                      const active = activeCaptionId === segment.id;
                      return (
                        <div
                          key={segment.id}
                          ref={active ? activeCaptionRef : null}
                          className={`rounded-md border px-2.5 py-2 text-sm leading-6 transition-colors ${
                            active
                              ? "border-[#007acc] bg-[#0e3550] text-[#dcefff]"
                              : "border-[#3c3c3c] bg-[#1f1f1f] text-[#c8c8c8]"
                          }`}
                        >
                          <div className="mb-1 text-[11px] font-semibold text-[#9cdcfe]">
                            {formatTime(segment.start)} -{" "}
                            {formatTime(segment.end)}
                          </div>
                          <p>{segment.text}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="grid min-h-0 grid-rows-[1fr] overflow-hidden rounded-md border border-[#3c3c3c] bg-[#1f1f1f]">
            <div className="min-h-0 overflow-y-auto w-full">
              <style>{`
                .quill-dark { height: 100%; display: flex; flex-direction: column; border: none !important; }
                .quill-dark .ql-toolbar { background: #252526; border: none; border-bottom: 1px solid #3c3c3c; border-radius: 6px 6px 0 0; padding: 12px; }
                .quill-dark .ql-toolbar .ql-stroke { stroke: #d4d4d4; }
                .quill-dark .ql-toolbar .ql-fill { fill: #d4d4d4; }
                .quill-dark .ql-toolbar .ql-picker { color: #d4d4d4; }
                .quill-dark .ql-container { background: #1f1f1f; color: #d4d4d4; border: none; flex-grow: 1; overflow-y: auto; font-family: var(--font-body); font-size: 14px; line-height: 1.6; }
                .quill-dark .ql-editor { min-height: 300px; padding: 16px; }
                .quill-dark .ql-editor.ql-blank::before { color: #8f9397; font-style: normal; }
              `}</style>
              <ReactQuill
                theme="snow"
                value={editorHtml}
                onChange={handleEditorChange}
                className="quill-dark"
                placeholder="Start writing your journal entry..."
              />
            </div>
          </section>
        </div>
      </main>

      <div className="pointer-events-none fixed bottom-3 left-1/2 z-50 -translate-x-1/2">
        <div className="pointer-events-auto">
          {showCameraFeed ? (
            <div className="group relative h-[200px] w-[356px] overflow-hidden rounded-lg border border-[#3c3c3c] bg-black shadow-2xl shadow-black/50">
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

              <div className="absolute left-2 top-2 rounded-md border border-[#3c3c3c] bg-[#1f1f1f]/90 px-2 py-1 text-[11px] font-semibold text-[#9da1a6]">
                {isRecording ? "REC" : "CAM"}
              </div>

              <div className="absolute inset-x-2 bottom-2 space-y-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="grid grid-cols-[auto_auto_1fr_1fr] gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleCameraFeed}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-[#3c3c3c] bg-[#1f1f1f]/95 text-[#d4d4d4] hover:bg-[#2d2d30]"
                    title="Hide camera"
                  >
                    <VideoOff className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-[#3c3c3c] bg-[#1f1f1f]/95 text-[#d4d4d4] hover:bg-[#2d2d30]"
                    title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
                  >
                    {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  <select
                    value={recordingQuality}
                    onChange={(event) => setRecordingQuality(event.target.value)}
                    className="h-8 rounded-md border border-[#3c3c3c] bg-[#1f1f1f]/95 px-2 text-xs font-semibold text-[#d4d4d4] outline-none focus:ring-2 focus:ring-[#007acc]/60"
                    title="Recording quality"
                  >
                    <option value="1080">1080p</option>
                    <option value="1440">1440p</option>
                  </select>

                  <select
                    value={selectedCameraId}
                    onChange={(event) => handleCameraSelect(event.target.value)}
                    className="h-8 rounded-md border border-[#3c3c3c] bg-[#1f1f1f]/95 px-2 text-xs font-semibold text-[#d4d4d4] outline-none focus:ring-2 focus:ring-[#007acc]/60"
                    title="Select camera"
                  >
                    {cameraDevices.length === 0 ? (
                      <option value="">Camera</option>
                    ) : (
                      cameraDevices.map((device, index) => (
                        <option key={device.deviceId || `cam-${index}`} value={device.deviceId}>
                          {device.label || `Camera ${index + 1}`}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-1.5">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startScreenRecording}
                      disabled={isPreparingRecording}
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-[#3c3c3c] bg-[#007acc] px-2 text-xs font-semibold text-white hover:bg-[#0e639c] disabled:opacity-70"
                    >
                      {isPreparingRecording ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                      {isPreparingRecording ? "Preparing" : "Record Screen"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopScreenRecording}
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-[#5a1d1d] bg-[#3a1717] px-2 text-xs font-semibold text-[#f48771] hover:bg-[#4a1d1d]"
                    >
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      Stop Recording
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDownloadRecording}
                    disabled={!recordedVideoUrl || isRecording}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-[#3c3c3c] bg-[#1f1f1f]/95 px-2 text-[#9cdcfe] hover:bg-[#2d2d30] disabled:cursor-not-allowed disabled:opacity-60"
                    title="Download recording"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleToggleCameraFeed}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#3c3c3c] bg-[#1f1f1f]/95 px-3 text-xs font-semibold text-[#d4d4d4] shadow-2xl shadow-black/40 hover:bg-[#2d2d30]"
            >
              <Video className="h-4 w-4" />
              Show Camera
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
