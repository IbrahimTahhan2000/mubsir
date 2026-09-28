import { useCallback, useEffect, useRef, useState } from "react";

const SAMPLE_INTERVAL_MS = 200; // ~5 fps — within the recommended 4-8 fps range

/**
 * Requests the browser's own camera via getUserMedia (never server-side
 * OpenCV capture), renders the live feed, and periodically samples a frame
 * as a JPEG Blob, invoking `onFrame(blob)` for each sample.
 */
export function useCameraCapture(onFrame, { enabled = true } = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [permissionState, setPermissionState] = useState("idle"); // idle | requesting | granted | denied | error
  const [errorMessage, setErrorMessage] = useState("");

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    let cancelled = false;

    async function start() {
      setPermissionState("requesting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setPermissionState("granted");

        const canvas = canvasRef.current;
        intervalRef.current = setInterval(() => {
          const video = videoRef.current;
          if (!video || video.readyState < 2) return;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob) onFrame(blob);
            },
            "image/jpeg",
            0.8
          );
        }, SAMPLE_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        setPermissionState(err?.name === "NotAllowedError" ? "denied" : "error");
        setErrorMessage(err?.message || "تعذر الوصول إلى الكاميرا");
      }
    }

    start();

    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { videoRef, permissionState, errorMessage };
}
