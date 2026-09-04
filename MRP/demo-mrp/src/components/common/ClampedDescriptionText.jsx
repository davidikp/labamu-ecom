import React, { useEffect, useRef, useState } from "react";
import { Button } from "./Button.jsx";

// Clamps long, multi-line description text to a fixed number of lines with a
// "Show all" / "Show less" tertiary toggle — used by Purchase Order Lines
// tables (create page, detail page, receipts tab) so long WO-generated
// descriptions don't blow out row height.
export const ClampedDescriptionText = ({ text, lines = 5, style = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <div>
      <span
        ref={textRef}
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: isExpanded ? "unset" : lines,
          overflow: isExpanded ? "visible" : "hidden",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          lineHeight: "1.4",
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
          ...style,
        }}
      >
        {text}
      </span>
      {isOverflowing ? (
        <Button
          variant="tertiary"
          size="small"
          onClick={() => setIsExpanded((prev) => !prev)}
          style={{ padding: 0, marginTop: "4px" }}
        >
          {isExpanded ? "Show less" : "Show all"}
        </Button>
      ) : null}
    </div>
  );
};
