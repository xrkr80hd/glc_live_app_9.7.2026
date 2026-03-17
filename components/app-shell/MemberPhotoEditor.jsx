"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowsMove, IconCheck, IconCrop, IconPhoto, IconUpload, IconZoomIn } from "@tabler/icons-react";
import { ToastMessage } from "@/components/app-shell/ToastMessage";

const PREVIEW_SIZE = 260;
const OUTPUT_SIZE = 720;
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function loadImageDimensions(src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = reject;
    image.src = src;
  });
}

export function MemberPhotoEditor({ currentPhotoUrl = "", memberName = "Liberty Church Member" }) {
  const router = useRouter();
  const initialSourceUrl = currentPhotoUrl || "";
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl);
  const [hasNewUpload, setHasNewUpload] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dimensions, setDimensions] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    if (!sourceUrl) {
      setDimensions(null);
      return undefined;
    }

    loadImageDimensions(sourceUrl)
      .then((nextDimensions) => {
        if (active) {
          setDimensions(nextDimensions);
        }
      })
      .catch(() => {
        if (active) {
          setToast({
            title: "Photo unavailable",
            message: "We could not load that photo. Please choose the file again.",
          });
          setDimensions(null);
        }
      });

    return () => {
      active = false;
    };
  }, [sourceUrl]);

  useEffect(() => {
    if (!hasNewUpload) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") {
        handleCloseCropModal();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hasNewUpload]);

  const previewStyle = useMemo(() => {
    if (!sourceUrl || !dimensions?.width || !dimensions?.height) {
      return null;
    }

    const baseScale = Math.max(PREVIEW_SIZE / dimensions.width, PREVIEW_SIZE / dimensions.height);
    const scaledWidth = dimensions.width * baseScale * zoom;
    const scaledHeight = dimensions.height * baseScale * zoom;

    return {
      width: `${scaledWidth}px`,
      height: `${scaledHeight}px`,
      transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
    };
  }, [dimensions, offsetX, offsetY, sourceUrl, zoom]);

  function applySelectedFile(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setToast({
        title: "Choose a photo",
        message: "Please select a JPG, PNG, or WebP image.",
      });
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setToast({
        title: "File too large",
        message: "Please choose a photo under 25MB.",
      });
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setSourceUrl((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return nextUrl;
    });
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setHasNewUpload(true);
    setToast(null);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    applySelectedFile(file);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDropActive(false);
    const file = event.dataTransfer?.files?.[0];
    applySelectedFile(file);
  }

  function handleCloseCropModal() {
    if (sourceUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(sourceUrl);
    }
    setSourceUrl(initialSourceUrl);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setHasNewUpload(false);
    setIsDropActive(false);
  }

  async function buildCroppedBlob() {
    if (!sourceUrl || !dimensions?.width || !dimensions?.height) {
      return null;
    }

    const image = new window.Image();
    image.src = sourceUrl;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    const baseScale = Math.max(PREVIEW_SIZE / dimensions.width, PREVIEW_SIZE / dimensions.height);
    const scaledWidth = dimensions.width * baseScale * zoom;
    const scaledHeight = dimensions.height * baseScale * zoom;
    const ratio = OUTPUT_SIZE / PREVIEW_SIZE;

    context.drawImage(
      image,
      (PREVIEW_SIZE / 2 - scaledWidth / 2 + offsetX) * ratio,
      (PREVIEW_SIZE / 2 - scaledHeight / 2 + offsetY) * ratio,
      scaledWidth * ratio,
      scaledHeight * ratio,
    );

    return await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
    });
  }

  async function handleSave() {
    setIsSaving(true);
    setToast(null);

    try {
      const blob = await buildCroppedBlob();
      if (!blob) {
        throw new Error("Choose a photo before saving.");
      }

      const formData = new FormData();
      formData.append("file", blob, "profile-photo.jpg");

      const response = await fetch("/api/member-auth/profile-photo", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to save your profile photo.");
      }

      router.push("/member/profile?photo=updated");
      router.refresh();
    } catch (error) {
      setToast({
        title: "Unable to save",
        message: error.message || "Please try again in a moment.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="lc-stack lc-profile-photo-page">
      {toast ? (
        <div className="lc-toast-wrap">
          <ToastMessage title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      ) : null}

      <section className="lc-card lc-profile-upload-card">
        <h2 className="lc-profile-upload-title">Upload a Photo</h2>

        <label
          className={`lc-profile-upload-dropzone${isDropActive ? " is-dragging" : ""}`}
          htmlFor="member-photo-upload"
          onDragOver={(event) => {
            event.preventDefault();
            if (!isDropActive) {
              setIsDropActive(true);
            }
          }}
          onDragLeave={() => setIsDropActive(false)}
          onDrop={handleDrop}
        >
          <span className="lc-profile-upload-icon">
            <IconUpload size={52} stroke={1.6} />
          </span>
          <span className="lc-profile-upload-dropzone-copy">Drag and drop or click to upload</span>
        </label>

        <label className="lc-profile-upload-button" htmlFor="member-photo-upload">
          Choose File
        </label>
        <input
          id="member-photo-upload"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          className="lc-hidden-note"
          onChange={handleFileChange}
        />

        <p className="lc-profile-upload-helper">JPG, PNG, GIF, or WEBP (max 25MB)</p>
        {!hasNewUpload ? <p className="lc-profile-upload-helper secondary">Upload a photo to unlock crop controls.</p> : null}
      </section>

      {hasNewUpload ? (
        <div className="lc-photo-modal-backdrop" role="dialog" aria-modal="true" aria-label="Adjust profile photo" onClick={handleCloseCropModal}>
          <section className="lc-photo-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="lc-photo-modal-head">
              <h2>Adjust Photo</h2>
              <p>Set zoom and position, then save.</p>
            </div>

            <div className="lc-photo-editor-layout">
              <div className="lc-photo-preview-wrap">
                <div className="lc-photo-preview-frame">
                  {previewStyle ? (
                    <img src={sourceUrl} alt={`${memberName} preview`} className="lc-photo-preview-image" style={previewStyle} />
                  ) : (
                    <div className="lc-empty-state">
                      <IconPhoto size={28} stroke={1.8} />
                      <strong>No photo selected</strong>
                      <span className="lc-muted">Choose a photo to preview and adjust.</span>
                    </div>
                  )}
                  <div className="lc-photo-preview-mask" aria-hidden="true" />
                </div>
              </div>

              <div className="lc-photo-controls">
                <label className="lc-slider-field">
                  <span>
                    <IconZoomIn size={16} stroke={1.8} />
                    Zoom
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.01"
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    disabled={!previewStyle}
                  />
                </label>
                <label className="lc-slider-field">
                  <span>
                    <IconArrowsMove size={16} stroke={1.8} />
                    Move left or right
                  </span>
                  <input
                    type="range"
                    min="-140"
                    max="140"
                    step="1"
                    value={offsetX}
                    onChange={(event) => setOffsetX(clamp(Number(event.target.value), -140, 140))}
                    disabled={!previewStyle}
                  />
                </label>
                <label className="lc-slider-field">
                  <span>
                    <IconCrop size={16} stroke={1.8} />
                    Move up or down
                  </span>
                  <input
                    type="range"
                    min="-140"
                    max="140"
                    step="1"
                    value={offsetY}
                    onChange={(event) => setOffsetY(clamp(Number(event.target.value), -140, 140))}
                    disabled={!previewStyle}
                  />
                </label>
              </div>
            </div>

            <div className="lc-button-row">
              <button type="button" className="lc-action-btn ghost" onClick={handleCloseCropModal}>
                Cancel
              </button>
              <button type="button" className="lc-action-btn primary" onClick={handleSave} disabled={!previewStyle || isSaving}>
                <IconCheck size={18} stroke={1.8} />
                <span>{isSaving ? "Saving..." : "Save Profile Photo"}</span>
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
