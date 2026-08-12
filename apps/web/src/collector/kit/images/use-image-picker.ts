"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseImagePickerOptions {
  onImageSelect?: (file: File, previewUrl: string) => void;
  initialPreview?: string | null;
  skipCleanupOnUnmount?: boolean;
  enableCrop?: boolean;
  onCropTrigger?: () => void;
}

export function useImagePicker(options: UseImagePickerOptions = {}) {
  const {
    onImageSelect,
    initialPreview,
    skipCleanupOnUnmount = false,
    enableCrop = false,
    onCropTrigger,
  } = options;
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPreview || null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ownedUrls = useRef<Set<string>>(new Set());
  const [uncroppedUrl, setUncroppedUrl] = useState<string | null>(null);
  const [uncroppedFile, setUncroppedFile] = useState<File | null>(null);

  const registerOwnedUrl = useCallback((url: string) => {
    ownedUrls.current.add(url);
  }, []);

  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (previewUrl && ownedUrls.current.has(previewUrl)) {
        URL.revokeObjectURL(previewUrl);
        ownedUrls.current.delete(previewUrl);
      }

      const url = URL.createObjectURL(file);
      ownedUrls.current.add(url);

      setUncroppedUrl(url);
      setUncroppedFile(file);

      if (!enableCrop) {
        setPreviewUrl(url);
        setSelectedFile(file);
        onImageSelect?.(file, url);
      } else {
        onCropTrigger?.();
      }

      if (e.target) e.target.value = "";
    },
    [previewUrl, onImageSelect, enableCrop, onCropTrigger],
  );

  const commitCrop = useCallback(
    (file: File, url: string) => {
      registerOwnedUrl(url);
      setPreviewUrl(url);
      setSelectedFile(file);
      onImageSelect?.(file, url);
    },
    [onImageSelect, registerOwnedUrl],
  );

  const clearImage = useCallback(() => {
    if (previewUrl && ownedUrls.current.has(previewUrl)) {
      URL.revokeObjectURL(previewUrl);
      ownedUrls.current.delete(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  }, [previewUrl]);

  useEffect(() => {
    const urlsToCleanup = ownedUrls.current;
    return () => {
      if (skipCleanupOnUnmount) return;
      urlsToCleanup.forEach((url) => URL.revokeObjectURL(url));
      urlsToCleanup.clear();
    };
  }, [skipCleanupOnUnmount]);

  return {
    previewUrl,
    selectedFile,
    fileInputRef,
    triggerUpload,
    handleFileChange,
    clearImage,
    setPreviewUrl,
    uncroppedUrl,
    uncroppedFile,
    setUncroppedUrl,
    commitCrop,
    registerOwnedUrl,
  };
}
