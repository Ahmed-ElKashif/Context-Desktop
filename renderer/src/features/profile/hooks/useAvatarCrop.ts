import { useState, useRef, useEffect } from "react";
import { type Area } from "react-easy-crop";
import getCroppedImg from "@/lib/getCroppedImg";
import { useAppDispatch } from "../../../store/hooks";
import { uploadAvatar } from "../../../store/authSlice";
import { notify } from "../../../components/ui/ToastEngine";
import { extractErrorMessage } from "../utils/errorUtils";

const MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024;

export const useAvatarCrop = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  useEffect(() => {
    if (!imageSrc || !croppedAreaPixels) return;

    let isActive = true;
    let objectUrl: string | null = null;

    const buildPreview = async () => {
      try {
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
        if (!isActive) return;

        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch {
        if (isActive) {
          setPreviewUrl(null);
        }
      }
    };

    void buildPreview();

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageSrc, croppedAreaPixels, rotation]);

  const resetCropState = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setPreviewUrl(null);
  };

  const closeCropModal = () => {
    setIsCropOpen(false);
    setImageSrc(null);
    resetCropState();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRotate = (direction: 1 | -1) => {
    setRotation((currentRotation) => (currentRotation + direction * 90 + 360) % 360);
  };

  const onCropComplete = (_croppedArea: Area, croppedAreaPixelsArg: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsArg);
  };

  const showFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Please select an image file", "error");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      notify("Image must be 10MB or smaller", "error");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      resetCropState();
      setImageSrc(reader.result as string);
      setIsCropOpen(true);
      setRotation(0);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    });
    reader.readAsDataURL(file);
  };

  const uploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setIsUploadingAvatar(true);
      notify('Uploading avatar...', 'info');
      const blob: Blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      const form = new FormData();
      form.append('avatar', blob, 'avatar.jpg');

      await dispatch(uploadAvatar(form)).unwrap();
      notify('Avatar uploaded', 'success');
      closeCropModal();
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Failed to upload avatar');
      notify(errorMessage, 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return {
    isUploadingAvatar,
    imageSrc,
    crop,
    setCrop,
    zoom,
    setZoom,
    rotation,
    previewUrl,
    isCropOpen,
    fileInputRef,
    handleRotate,
    onCropComplete,
    showFilePicker,
    onFileChange,
    uploadCroppedImage,
    closeCropModal,
    resetCropState,
    croppedAreaPixels,
  };
};
