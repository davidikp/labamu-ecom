import React, { useRef, useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  DeleteIcon,
  SearchIcon,
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { ToggleSwitch } from "../../../components/common/ToggleSwitch.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { PurchaseOrderSearchShell } from "../components/PurchaseOrderSearchShell.jsx";
import {
  poReferenceTableCellStyle,
  poReferenceTableFrameStyle,
  poReferenceTableHeaderCellStyle,
  poReferenceTableHeaderRowStyle,
  poReferenceTableInnerStyle,
  poReferenceTableRowStyle,
  poReferenceTableScrollerStyle,
} from "../utils/purchaseOrderTableUtils.js";

export const PurchaseOrderSettingsPage = ({
  onNavigate,
  isSidebarCollapsed,
  poApprovalSettings,
  onSaveSettings,
}) => {
  const [isApprovalActive, setIsApprovalActive] = useState(
    poApprovalSettings?.isApprovalActive || false
  );
  const [requireComment, setRequireComment] = useState(
    poApprovalSettings?.requireComment || false
  );
  const [approvers, setApprovers] = useState(
    poApprovalSettings?.approvers || []
  );
  const [approverSearch, setApproverSearch] = useState("");
  const [isApproverDropdownOpen, setIsApproverDropdownOpen] = useState(false);
  const [approverDropdownPos, setApproverDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 320,
  });
  const [approverError, setApproverError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showDiscardChangesModal, setShowDiscardChangesModal] = useState(false);

  const initialSnapshotRef = useRef(
    JSON.stringify({
      isApprovalActive: poApprovalSettings?.isApprovalActive || false,
      requireComment: poApprovalSettings?.requireComment || false,
      approvers: poApprovalSettings?.approvers || [],
    })
  );

  const isSettingsDirty =
    initialSnapshotRef.current !==
    JSON.stringify({
      isApprovalActive,
      requireComment,
      approvers,
    });

  const handleBackNavigation = () => {
    if (isSettingsDirty) {
      setShowDiscardChangesModal(true);
    } else {
      onNavigate("list");
    }
  };

  const userOptions = [
    {
      id: "u1",
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Product Manager",
    },
    {
      id: "u2",
      name: "Natasha Smith",
      email: "natasha.smith@company.com",
      role: "Owner",
    },
    {
      id: "u3",
      name: "Joko",
      email: "joko@company.com",
      role: "Procurement Lead",
    },
    {
      id: "u4",
      name: "Naomi",
      email: "naomi@company.com",
      role: "Finance Manager",
    },
  ];

  const filteredUsers = userOptions.filter((user) => {
    const q = approverSearch.toLowerCase();
    return (
      !approvers.some((a) => a.id === user.id) &&
      (user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q))
    );
  });

  const updateApproverDropdownPosition = (el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setApproverDropdownPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 64px)",
        position: "relative",
      }}
    >
      {showToast ? (
        <div
          style={{
            position: "fixed",
            top: "84px",
            right: "24px",
            minWidth: "320px",
            background: "var(--status-green-primary)",
            color: "var(--status-green-on-primary)",
            padding: "12px 16px",
            borderRadius: "var(--radius-small)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "var(--elevation-sm)",
            zIndex: 9999,
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "var(--text-body)", lineHeight: "1.5" }}>
              Purchase order settings successfully saved
            </span>
          </div>
          <button
            type="button"
            data-no-localize
            translate="no"
            style={{
              border: "none",
              background: "transparent",
              fontWeight: "var(--font-weight-bold)",
              cursor: "pointer",
              fontSize: "var(--text-body)",
              fontFamily: "inherit",
              lineHeight: "1.5",
              color: "var(--status-green-on-primary)",
              padding: 0,
            }}
            onClick={() => setShowToast(false)}
          >
            Okay
          </button>
        </div>
      ) : null}

      <div
        style={{
          padding: "24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          paddingBottom: "100px",
          background: "#F5F5F7",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              marginLeft: "-4px",
            }}
            onClick={handleBackNavigation}
          >
            <ChevronLeftIcon
              size={28}
              color="var(--neutral-on-surface-primary)"
            />
            <h1
              style={{
                margin: 0,
                fontSize: "var(--text-large-title)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              Settings
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "var(--text-title-3)",
            }}
          >
            <span
              style={{
                color: "var(--neutral-on-surface-secondary)",
                cursor: "pointer",
              }}
              onClick={handleBackNavigation}
            >
              Purchase Order
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
              /
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
              Settings
            </span>
          </div>
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            borderRadius: "16px",
            border: "1px solid var(--neutral-line-separator-1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "4px",
                  height: "24px",
                  borderRadius: "0 4px 4px 0",
                  background: "var(--feature-brand-primary)",
                }}
              />
              <span
                style={{
                  fontSize: "var(--text-title-1)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                Approval Settings
              </span>
            </div>
            <div style={{ paddingRight: "16px" }}>
              <ChevronDownIcon
                size={20}
                color="var(--neutral-on-surface-secondary)"
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              padding: "20px 24px 24px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "24px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Activate Approval Setting
                </span>
                <span
                  style={{
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-secondary)",
                  }}
                >
                  Enable approval workflow for Purchase Order
                </span>
              </div>
              <ToggleSwitch
                checked={isApprovalActive}
                onChange={(next) => {
                  setIsApprovalActive(next);
                  if (!next) {
                    setRequireComment(false);
                    setApprovers([]);
                    setApproverSearch("");
                    setIsApproverDropdownOpen(false);
                  }
                }}
              />
            </div>

            {isApprovalActive ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-title-2)",
                        color: "var(--neutral-on-surface-primary)",
                      }}
                    >
                      Require Comment for Approval
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      Approvers must provide a comment when approving or
                      rejecting
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={requireComment}
                    onChange={(next) => setRequireComment(next)}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--status-red-primary)",
                          fontSize: "var(--text-body)",
                        }}
                      >
                        *
                      </span>
                      <span
                        style={{
                          fontSize: "var(--text-title-2)",
                          color: "var(--neutral-on-surface-primary)",
                        }}
                      >
                        Approvers
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: approverError
                          ? "var(--status-red-primary)"
                          : "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      {approverError ||
                        "Select users who can approve Purchase Orders"}
                    </span>
                  </div>

                  <div
                    style={{
                      ...poReferenceTableFrameStyle,
                      overflow: "visible",
                    }}
                  >
                    <div style={poReferenceTableScrollerStyle}>
                      <div style={poReferenceTableInnerStyle("760px")}>
                        <div
                          style={poReferenceTableHeaderRowStyle(
                            "1.2fr 1.4fr 1fr 80px"
                          )}
                        >
                          <div style={poReferenceTableHeaderCellStyle()}>
                            Name
                          </div>
                          <div style={poReferenceTableHeaderCellStyle()}>
                            Email
                          </div>
                          <div style={poReferenceTableHeaderCellStyle()}>
                            Role
                          </div>
                          <div
                            style={poReferenceTableHeaderCellStyle({
                              justifyContent: "center",
                            })}
                          >
                            Action
                          </div>
                        </div>

                        {approvers.length > 0
                          ? approvers.map((user, idx) => (
                              <div
                                key={user.id}
                                style={poReferenceTableRowStyle(
                                  "1.2fr 1.4fr 1fr 80px",
                                  idx === approvers.length - 1
                                )}
                              >
                                <div style={poReferenceTableCellStyle()}>
                                  {user.name}
                                </div>
                                <div style={poReferenceTableCellStyle()}>
                                  {user.email}
                                </div>
                                <div style={poReferenceTableCellStyle()}>
                                  {user.role}
                                </div>
                                <div
                                  style={poReferenceTableCellStyle({
                                    justifyContent: "center",
                                  })}
                                >
                                  <button
                                    onClick={() =>
                                      setApprovers((prev) =>
                                        prev.filter((a) => a.id !== user.id)
                                      )
                                    }
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "8px",
                                      background:
                                        "var(--neutral-surface-primary)",
                                      border:
                                        "1px solid var(--neutral-line-separator-1)",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <DeleteIcon
                                      size={16}
                                      color="var(--status-red-primary)"
                                    />
                                  </button>
                                </div>
                              </div>
                            ))
                          : null}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "16px",
                        borderTop: "1px solid var(--neutral-line-separator-1)",
                        position: "relative",
                      }}
                    >
                      <div style={{ width: "calc((100% - 80px) * 1.2 / 3.6)" }}>
                        <PurchaseOrderSearchShell
                          style={{ position: "relative", paddingLeft: "40px" }}
                        >
                          <SearchIcon
                            size={18}
                            color="var(--neutral-on-surface-tertiary)"
                            style={{
                              position: "absolute",
                              left: "14px",
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          />
                          <input
                            value={approverSearch}
                            onFocus={(e) => {
                              updateApproverDropdownPosition(e.currentTarget);
                              setIsApproverDropdownOpen(true);
                            }}
                            onChange={(e) => {
                              setApproverSearch(e.target.value);
                              updateApproverDropdownPosition(e.currentTarget);
                              setIsApproverDropdownOpen(true);
                            }}
                            placeholder="Search by name or role..."
                            style={{
                              flex: 1,
                              height: "100%",
                              width: "100%",
                              border: "none",
                              outline: "none",
                              padding: 0,
                              fontSize: "var(--text-subtitle-1)",
                              color: "var(--neutral-on-surface-primary)",
                              background: "transparent",
                              boxSizing: "border-box",
                            }}
                          />
                        </PurchaseOrderSearchShell>
                      </div>

                      {isApproverDropdownOpen ? (
                        <>
                          <div
                            style={{
                              position: "fixed",
                              inset: 0,
                              zIndex: 9998,
                            }}
                            onClick={() => setIsApproverDropdownOpen(false)}
                          />
                          <div
                            style={{
                              position: "fixed",
                              top: `${approverDropdownPos.top}px`,
                              left: `${approverDropdownPos.left}px`,
                              width: `${approverDropdownPos.width}px`,
                              background: "var(--neutral-surface-primary)",
                              border:
                                "1px solid var(--neutral-line-separator-1)",
                              borderRadius: "12px",
                              boxShadow: "var(--elevation-sm)",
                              overflow: "hidden",
                              zIndex: 9999,
                              maxHeight: "260px",
                              overflowY: "auto",
                            }}
                          >
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map((user) => (
                                <div
                                  key={user.id}
                                  onClick={() => {
                                    setApprovers((prev) => [...prev, user]);
                                    setApproverSearch("");
                                    setIsApproverDropdownOpen(false);
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      "var(--neutral-surface-grey-lighter)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      "var(--neutral-surface-primary)")
                                  }
                                  style={{
                                    padding: "16px 18px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "4px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "var(--text-title-3)",
                                        fontWeight: "var(--font-weight-bold)",
                                        color:
                                          "var(--neutral-on-surface-primary)",
                                      }}
                                    >
                                      {user.name}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "var(--text-body)",
                                        color:
                                          "var(--neutral-on-surface-secondary)",
                                      }}
                                    >
                                      {user.role}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div
                                style={{
                                  padding: "12px 14px",
                                  fontSize: "var(--text-title-3)",
                                  color: "var(--neutral-on-surface-tertiary)",
                                }}
                              >
                                No user found.
                              </div>
                            )}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: isSidebarCollapsed ? "82px" : "286px",
          right: 0,
          transition: "left 0.2s ease",
          background: "var(--neutral-surface-primary)",
          borderTop: "1px solid var(--neutral-line-separator-1)",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        <Button
          size="medium"
          variant="tertiary"
          onClick={handleBackNavigation}
          style={{ color: "var(--status-red-primary)" }}
        >
          Cancel
        </Button>
        <Button
          size="medium"
          variant="filled"
          onClick={() => {
            if (isApprovalActive && approvers.length === 0) {
              setApproverError("Field cannot be empty");
              return;
            }
            setApproverError("");
            onSaveSettings?.({ isApprovalActive, requireComment, approvers });
            setShowToast(true);
          }}
        >
          Save
        </Button>
      </div>

      <GeneralModal
        isOpen={showDiscardChangesModal}
        onClose={() => setShowDiscardChangesModal(false)}
        title="Discard changes?"
        footer={
          <>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowDiscardChangesModal(false);
                onNavigate("list");
              }}
            >
              Yes, Discard
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowDiscardChangesModal(false)}
            >
              Keep Editing
            </Button>
          </>
        }
      />
    </div>
  );
};
