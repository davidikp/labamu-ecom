import React from "react";
import { getFileExtension } from "../../../utils/upload/uploadUtils.js";

export const DocumentTypeBadge = ({ fileName = "", type = "", size = "default" }) => {
  const extension = getFileExtension(fileName).toUpperCase();
  const extensionMap = {
    "XLSX": "XLS",
    "DOCX": "DOC",
    "PPTX": "PPT",
    "PPT": "PPT",
  };
  const normalizedType = extensionMap[extension] || extension || (type === "pdf" ? "PDF" : type === "image" ? "JPG" : "DOC");
  
  const palette = {
    DOC: { bg: "#6E90C7", fold: "#A8BFE2" },
    XLS: { bg: "#0D7C44", fold: "#56B182" },
    PDF: { bg: "#E0001B", fold: "#F3A0AA" },
    ZIP: { bg: "#D4D100", fold: "#ECE87A" },
    JPG: { bg: "#FF980C", fold: "#FFD39C" },
    JPEG: { bg: "#FF980C", fold: "#FFD39C" },
    PNG: { bg: "#456FB4", fold: "#A9BDE2" },
    SVG: { bg: "#605CED", fold: "#AFAEFF" },
    WEBP: { bg: "#767F90", fold: "#AEB5C1" },
    PPT: { bg: "#D14424", fold: "#F3A18E" },
  }[normalizedType] || { bg: "#6E90C7", fold: "#A8BFE2" };
  const sizeMap = {
    compact: {
      width: 28,
      height: 32,
      fontSize: "4.8px",
      fold: 9,
      paddingBottom: "7px",
      radius: "6px",
    },
    preview: {
      width: 34,
      height: 40,
      fontSize: "7px",
      fold: 10,
      paddingBottom: "8px",
      radius: "7px",
    },
    default: {
      width: 30,
      height: 36,
      fontSize: "6.6px",
      fold: 10,
      paddingBottom: "7px",
      radius: "7px",
    },
  }[size] || {
    width: 30,
    height: 36,
    fontSize: "6.6px",
    fold: 10,
    paddingBottom: "7px",
    radius: "7px",
  };

  return (
    <div
      style={{
        width: sizeMap.width,
        height: sizeMap.height,
        borderRadius: sizeMap.radius,
        background: palette.bg,
        position: "relative",
        flexShrink: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: sizeMap.paddingBottom,
        boxSizing: "border-box",
        overflow: "hidden",
        clipPath:
          "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderLeft: `${sizeMap.fold}px solid transparent`,
          borderTop: `${sizeMap.fold}px solid ${palette.fold}`,
        }}
      />
      <span
        style={{
          fontSize: sizeMap.fontSize,
          fontWeight: "var(--font-weight-bold)",
          color: "#fff",
          lineHeight: 1,
          letterSpacing: "0.18px",
        }}
      >
        {normalizedType.slice(0, 4)}
      </span>
    </div>
  );
};
