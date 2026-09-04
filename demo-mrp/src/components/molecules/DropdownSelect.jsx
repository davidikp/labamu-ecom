import React, { useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  SearchIcon,
} from "../icons/Icons.jsx";

const baseInputBorderColor = "#e9e9e9";

const DropdownSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  disabled = false,
  hasError = false,
  style = {},
  menuWidth,
  menuStyle = {},
  fieldHeight = "46px",
  borderRadius = "8px",
  fontSize = "var(--text-subtitle-1)",
  optionFontSize = "var(--text-title-3)",
  showSelectedCheck = true,
  emptyText = "No options found",
  renderOption = null,
  borderless = false,
  variant = "default",
  searchable = false,
  searchPlaceholder = "Search...",
  hideSearchIcon = false,
  showDivider = false,
  footer = null,
  maxOptionsVisible = null,
  renderValue = null,
}) => {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    placement: "bottom",
  });

  const normalizedOptions = options.map((option) =>
    typeof option === "object"
      ? option
      : { value: option, label: String(option) }
  );
  const initialOptions =
    variant === "filter"
      ? normalizedOptions.filter((option) => String(option.value) !== "all")
      : normalizedOptions;

  const visibleOptions = searchable && searchTerm
    ? initialOptions.filter(option => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          String(option.label || "").toLowerCase().includes(lowerSearch) ||
          String(option.code || "").toLowerCase().includes(lowerSearch) ||
          String(option.sku || "").toLowerCase().includes(lowerSearch) ||
          String(option.woRef || "").toLowerCase().includes(lowerSearch) ||
          String(option.assignmentId || "").toLowerCase().includes(lowerSearch)
        );
      })
    : initialOptions;
  const selectedOption = normalizedOptions.find(
    (option) => String(option.value) === String(value)
  );
  const hasValue =
    selectedOption !== undefined &&
    selectedOption !== null &&
    String(selectedOption.value ?? "") !== "" &&
    String(selectedOption.value ?? "") !== "all";

  const updateMenuPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Number(menuWidth) || rect.width;
    
    let estimatedMenuHeight;
    if (maxOptionsVisible) {
      // Base height for options
      let height = (maxOptionsVisible * 40) + 4;
      // Add height for header if variant is filter
      if (variant === "filter") height += 44; // Title + Padding
      // Add height for search bar if searchable
      if (searchable && variant === "filter") height += 48; // Search bar + Padding
      // Add height for footer if present
      if (footer) height += 48;
      
      estimatedMenuHeight = height;
    } else {
      estimatedMenuHeight = Math.min(
        16 + Math.max(visibleOptions.length, 1) * 41 + (footer ? 48 : 0),
        284
      );
    }

    const shouldOpenAbove =
      window.innerHeight - rect.bottom < estimatedMenuHeight + 16 &&
      rect.top > estimatedMenuHeight + 16;

    setMenuPosition({
      left: rect.left,
      top: shouldOpenAbove ? rect.top - 8 : rect.bottom + 8,
      width,
      placement: shouldOpenAbove ? "top" : "bottom",
    });
  };

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    updateMenuPosition();

    const handlePointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleViewportChange = () => updateMenuPosition();

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen, menuWidth, visibleOptions.length]);

  useEffect(() => {
    if (
      !isOpen ||
      !menuRef.current ||
      !triggerRef.current ||
      typeof window === "undefined"
    ) {
      return;
    }

    const menuRect = menuRef.current.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();

    if (
      menuPosition.placement === "bottom" &&
      menuRect.bottom > window.innerHeight - 8
    ) {
      setMenuPosition((prev) => ({
        ...prev,
        top: triggerRect.top - 8,
        placement: "top",
      }));
    }

    if (menuPosition.placement === "top" && menuRect.top < 8) {
      setMenuPosition((prev) => ({
        ...prev,
        top: triggerRect.bottom + 8,
        placement: "bottom",
      }));
    }
  }, [isOpen, menuPosition.placement, visibleOptions.length]);

  const isHighlighted = variant === "filter" ? isOpen || hasValue : isOpen;

  return (
    <>
      <div
        ref={triggerRef}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || (e.key === " " && !searchable)) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        tabIndex={disabled ? -1 : 0}
        style={{
          width: variant === "filter" ? "auto" : "100%",
          minHeight: borderless
            ? "auto"
            : variant === "filter"
              ? "40px"
              : fieldHeight,
          height: "auto",
          border: borderless
            ? "none"
            : `1px solid ${
                hasError
                  ? "var(--status-red-primary)"
                  : isHighlighted
                    ? "var(--feature-brand-primary)"
                    : disabled
                      ? "var(--neutral-line-outline)"
                      : variant === "filter"
                        ? "#AEAEAE"
                        : baseInputBorderColor
              }`,
          borderRadius: variant === "filter" ? "14px" : borderRadius,
          background: borderless
            ? "transparent"
            : disabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
          boxShadow: "none",
          padding: borderless ? "4px 8px" : "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: variant === "filter" ? "flex-start" : "space-between",
          gap: "12px",
          cursor: disabled ? "not-allowed" : "pointer",
          transition:
            "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
          ...style,
        }}
      >
        {isOpen && searchable && variant !== "filter" ? (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: 0,
              height: "100%",
            }}
          >
            {!hideSearchIcon && (
              <SearchIcon
                size={18}
                color="var(--neutral-on-surface-tertiary)"
                style={{ flexShrink: 0 }}
              />
            )}
            <input
              type="text"
              autoFocus
              placeholder={searchPlaceholder || placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.stopPropagation();
                }
              }}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                outline: "none",
                padding: 0,
                fontSize,
                color: "var(--neutral-on-surface-primary)",
                height: "100%",
                width: "100%",
              }}
            />
          </div>
        ) : (
          <span
            style={{
              flex: variant === "filter" ? "0 1 auto" : 1,
              minWidth: 0,
              textAlign: "left",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize,
              lineHeight: "22px",
              letterSpacing: "0.11px",
              fontWeight:
                variant === "filter" && isHighlighted
                  ? "var(--font-weight-bold)"
                  : "var(--font-weight-regular)",
              color: disabled
                ? "var(--neutral-on-surface-secondary)"
                : variant === "filter"
                  ? isHighlighted
                    ? "var(--feature-brand-primary)"
                    : "#A1A1A1"
                  : hasValue
                    ? "var(--neutral-on-surface-primary)"
                    : "var(--neutral-on-surface-tertiary)",
            }}
          >
            {hasValue ? (renderValue ? renderValue(selectedOption) : selectedOption?.label) : placeholder}
          </span>
        )}
        <ChevronDownIcon
          size={16}
          color={
            disabled
              ? "var(--neutral-on-surface-tertiary)"
              : isHighlighted
                ? "var(--feature-brand-primary)"
                : "var(--neutral-on-surface-secondary)"
          }
          style={{
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </div>

      {isOpen ? (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            left: `${menuPosition.left}px`,
            top: `${menuPosition.top}px`,
            minWidth: `${menuPosition.width}px`,
            width: menuWidth ? `${menuWidth}px` : "max-content",
            maxWidth: "320px",
            transform:
              menuPosition.placement === "top" ? "translateY(-100%)" : "none",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
            zIndex: 15000, // Increased z-index to be above modals if needed, but modals should be even higher
            display: "flex",
            flexDirection: "column",
            ...menuStyle,
          }}
        >
          {variant === "filter" && (
            <div
              style={{
                padding: "16px 16px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: searchable ? "0" : "4px",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                {placeholder}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.("all");
                  setIsOpen(false);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "12px",
                  color: "var(--status-red-primary)",
                  cursor: "pointer",
                  padding: "4px 0",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                Remove Filter
              </button>
            </div>
          )}

          {variant === "filter" && searchable && (
            <div style={{ padding: "0 16px 12px" }}>
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0 12px",
                  height: "36px",
                  background: "var(--neutral-surface-grey-lighter)",
                  borderRadius: "8px",
                  border: "1px solid var(--neutral-line-separator-2)",
                }}
              >
                <SearchIcon
                  size={16}
                  color="var(--neutral-on-surface-tertiary)"
                />
                <input
                  type="text"
                  autoFocus
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === " ") e.stopPropagation();
                  }}
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-primary)",
                    width: "100%",
                  }}
                />
              </div>
            </div>
          )}

          <div
            style={{
              padding: "4px",
              maxHeight: maxOptionsVisible ? `${maxOptionsVisible * 40 + 4}px` : "284px",
              overflowY: "auto",
              flex: 1,
            }}
          >
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option, index) => {
                const optionSelected =
                  String(option.value) === String(value) &&
                  String(option.value ?? "") !== "";
                const optionDisabled = !!option.disabled;
                return (
                  <div 
                    key={String(option.value ?? `option-${index}`)}
                    style={{
                      borderTop: showDivider && index !== 0 ? "1px solid var(--neutral-line-separator-2)" : "none",
                      paddingTop: showDivider && index !== 0 ? "4px" : "0",
                      marginTop: showDivider && index !== 0 ? "4px" : "0",
                    }}
                  >
                    <button
                      type="button"
                      disabled={optionDisabled}
                      onClick={() => {
                        if (optionDisabled) return;
                        onChange?.(option.value, option);
                        setIsOpen(false);
                      }}
                      onMouseEnter={(event) => {
                        if (optionDisabled) return;
                        event.currentTarget.style.background =
                          "var(--neutral-surface-grey-lighter)";
                      }}
                      onMouseLeave={(event) => {
                        if (optionDisabled) return;
                        event.currentTarget.style.background = optionSelected
                          ? "var(--feature-brand-container-lighter)"
                          : "transparent";
                      }}
                      style={{
                        width: "100%",
                        minHeight: "40px",
                        padding: "10px 12px",
                        border: "none",
                        background: optionSelected
                          ? "var(--feature-brand-container-lighter)"
                          : "transparent",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: optionDisabled ? "not-allowed" : "pointer",
                        transition: "background 0.2s ease",
                      }}
                    >
                      {variant === "filter" && (
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "4px",
                            border: `1px solid ${
                              optionSelected
                                ? "var(--feature-brand-primary)"
                                : "var(--neutral-line-separator-2)"
                            }`,
                            background: optionSelected
                              ? "var(--feature-brand-primary)"
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {optionSelected && <CheckIcon size={14} color="white" />}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {renderOption ? (
                          renderOption(option, optionSelected)
                        ) : (
                          <span
                            style={{
                              flex: 1,
                              textAlign: "left",
                              fontSize: optionFontSize,
                              color: optionDisabled
                                ? "var(--neutral-on-surface-tertiary)"
                                : optionSelected
                                ? "var(--feature-brand-primary)"
                                : "var(--neutral-on-surface-primary)",
                              fontWeight: optionSelected
                                ? "var(--font-weight-bold)"
                                : "var(--font-weight-regular)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {option.label}
                          </span>
                        )}
                      </div>

                      {(!variant || variant !== "filter") &&
                        optionSelected &&
                        showSelectedCheck && (
                          <CheckIcon
                            size={16}
                            color="var(--feature-brand-primary)"
                          />
                        )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "16px" }}>
                <span
                  style={{
                    display: "block",
                    textAlign: "center",
                    fontSize: "var(--text-title-3)",
                    lineHeight: "20px",
                    color: "var(--neutral-on-surface-secondary)",
                  }}
                >
                  {emptyText}
                </span>
              </div>
            )}
          </div>

          {footer && (
            <div style={{
              borderTop: "1px solid var(--neutral-line-separator-2)",
              padding: "4px 8px 8px",
              background: "var(--neutral-surface-primary)",
              position: "sticky",
              bottom: 0,
              zIndex: 1
            }}>
              {footer}
            </div>
          )}
        </div>
      ) : null}
    </>
  );
};

export { DropdownSelect };
