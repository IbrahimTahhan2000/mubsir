import { useCameraCapture } from "../hooks/useCameraCapture.js";

const PERMISSION_MESSAGES = {
  idle: "بانتظار تشغيل الكاميرا…",
  requesting: "يرجى السماح بالوصول إلى الكاميرا عند ظهور الطلب من المتصفح.",
  granted: "الكاميرا متصلة",
  denied: "تم رفض إذن الكاميرا. يرجى تفعيل إذن الكاميرا من إعدادات المتصفح ثم إعادة تحميل الصفحة.",
  error: "تعذر تشغيل الكاميرا في هذا الجهاز.",
};

/**
 * Browser-side webcam capture via navigator.mediaDevices.getUserMedia().
 * This intentionally never talks to a server-side camera — the whole point
 * of this component is that each pilgrim's own device camera is used.
 */
export function CameraFeed({ onFrame, enabled = true, statusLabel }) {
  const { videoRef, permissionState, errorMessage } = useCameraCapture(onFrame, { enabled });

  return (
    <div>
      <div className="video-container">
        <video ref={videoRef} muted playsInline aria-label="بث الكاميرا المباشر" />
      </div>
      <p
        className={`camera-permission-note${permissionState === "denied" || permissionState === "error" ? " error" : ""}`}
        role="status"
      >
        {statusLabel || PERMISSION_MESSAGES[permissionState]}
        {errorMessage && permissionState !== "granted" ? ` (${errorMessage})` : ""}
      </p>
    </div>
  );
}
