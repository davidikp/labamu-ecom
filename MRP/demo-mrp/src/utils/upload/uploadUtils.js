import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS,
  UPLOAD_MAX_FILE_SIZE_BYTES,
} from "../../constants/appConstants.js";

export const getFileExtension = (fileName = "") =>
  String(fileName).split(".").pop()?.toLowerCase() || "";

export const formatUploadFileSize = (sizeBytes = 0) => {
  const value = Number(sizeBytes) || 0;
  if (value <= 0) return "-";
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  if (value >= 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${value} B`;
};

export const getUploadDocumentKind = (fileName = "") => {
  const extension = getFileExtension(fileName);
  if (extension === "pdf") return "pdf";
  if (ALLOWED_IMAGE_EXTENSIONS.includes(extension)) return "image";
  return "document";
};

export const validateUploadFile = (
  file,
  allowedExtensions = ALLOWED_DOCUMENT_EXTENSIONS,
  maxSizeBytes = UPLOAD_MAX_FILE_SIZE_BYTES,
  invalidFormatMessage = "Allowed formats (PDF, JPG, JPEG, PNG, WebP)"
) => {
  if (!file) return "Please choose a file";

  const extension = getFileExtension(file.name);
  const mimeType = String(file.type || "").toLowerCase();
  const mimeMatches = allowedExtensions.some((allowedExt) => {
    if (allowedExt === "pdf") return mimeType === "application/pdf";
    if (["jpg", "jpeg", "png", "webp"].includes(allowedExt))
      return mimeType.startsWith("image/");
    return false;
  });

  if (!allowedExtensions.includes(extension) && !mimeMatches) {
    return invalidFormatMessage;
  }

  if ((Number(file.size) || 0) > maxSizeBytes) {
    return "Max size 25MB per file";
  }

  return "";
};

export const createUploadDocumentRecord = (file, overrides = {}) => {
  if (!file) return null;

  let previewUrl =
    overrides.previewUrl !== undefined ? overrides.previewUrl : "";

  if (
    !previewUrl &&
    typeof URL !== "undefined" &&
    typeof URL.createObjectURL === "function" &&
    file &&
    typeof file === "object"
  ) {
    try {
      previewUrl = URL.createObjectURL(file);
    } catch (error) {
      previewUrl = "";
    }
  }

  return {
    id:
      overrides.id ||
      `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name || "Attachment",
    description: overrides.description ?? "",
    sizeBytes: Number(file.size) || 0,
    size: overrides.size || formatUploadFileSize(file.size),
    type: overrides.type || getUploadDocumentKind(file.name),
    previewUrl,
    ...overrides,
  };
};

export const normalizeProofDocuments = (documents = [], fallbackProof = "") => {
  if (Array.isArray(documents) && documents.length > 0) {
    return documents
      .map((doc, index) => {
        if (!doc) return null;
        const name = doc.name || doc.fileName || `Attachment-${index + 1}`;
        return {
          id: doc.id || `proof-${index}-${name}`,
          name,
          description: doc.description || doc.label || "Proof Document",
          type: doc.type || getUploadDocumentKind(name),
          sizeBytes: Number(doc.sizeBytes) || 0,
          size: doc.size || formatUploadFileSize(doc.sizeBytes),
          previewUrl: doc.previewUrl || "",
        };
      })
      .filter(Boolean);
  }

  if (fallbackProof) {
    return [
      {
        id: `proof-${fallbackProof}`,
        name: fallbackProof,
        description: "Proof Document",
        type: getUploadDocumentKind(fallbackProof),
        sizeBytes: 0,
        size: "-",
        previewUrl: "",
      },
    ];
  }

  return [];
};

export const getDocumentPrimaryLabel = (doc) =>
  doc?.description?.trim() || doc?.name || "-";

export const getDocumentSecondaryLabel = (doc) =>
  doc?.description?.trim() ? doc?.name || "-" : "";

export const createSyntheticInputEvent = (value) => ({
  target: { value },
  currentTarget: { value },
});

export const createImageUploadRecord = (fileOrName, overrides = {}) => {
  if (!fileOrName) return null;

  // Support case where input is already a record object
  if (
    typeof fileOrName === "object" &&
    fileOrName !== null &&
    ! (fileOrName instanceof File) &&
    ! (fileOrName instanceof Blob) &&
    "previewUrl" in fileOrName
  ) {
    return { ...fileOrName, ...overrides };
  }

  if (typeof fileOrName === "string") {
    return {
      id:
        overrides.id ||
        `image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: fileOrName,
      previewUrl: overrides.previewUrl || "",
      type: "image",
      ...overrides,
    };
  }
  return createUploadDocumentRecord(fileOrName, {
    type: "image",
    ...overrides,
  });
};

export const getImageUploadName = (imageRecord) =>
  typeof imageRecord === "string" ? imageRecord : imageRecord?.name || "";

export const getImageUploadPreviewUrl = (imageRecord) =>
  typeof imageRecord === "string" ? imageRecord : imageRecord?.previewUrl || "";
