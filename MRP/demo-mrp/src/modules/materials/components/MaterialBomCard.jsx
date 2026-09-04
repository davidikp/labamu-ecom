import React, { useState } from "react";
import { Button } from "../../../components/common/Button.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { EditIcon } from "../../../components/icons/Icons.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import {
  getBomLinkedToMaterial,
  getEligibleBoms,
  linkBomToMaterial,
  unlinkBomFromMaterial,
} from "../../bill-of-materials/mock/bomMocks.js";

// Bill of Materials field shown inline in the Material Detail info grid for
// non-Raw materials (Semi-Finished / Finished), letting the user link the
// material to an existing, currently-unlinked BOM. Mirrors the "Add Date" /
// edit-in-place pattern used for Planned Date on the Work Order detail page.
export const MaterialBomCard = ({ material, onNavigate }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedBomId, setSelectedBomId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [linkedBom, setLinkedBom] = useState(() => getBomLinkedToMaterial(material?.id));

  const openPicker = () => {
    setSelectedBomId(linkedBom?.id ?? null);
    setSearchTerm("");
    setIsPickerOpen(true);
  };

  const handleConfirmLink = () => {
    if (selectedBomId) {
      const updated = linkBomToMaterial(selectedBomId, material.id);
      setLinkedBom(updated);
    } else if (linkedBom) {
      // Selection was cleared via Unlink — commit the removal now, on Save.
      unlinkBomFromMaterial(linkedBom.id);
      setLinkedBom(null);
    }
    setIsPickerOpen(false);
  };

  // Unlink only stages the removal (clears the pending selection); the store
  // isn't touched until Save, so Cancel leaves the current link untouched.
  const handleUnlink = () => {
    setSelectedBomId(null);
  };

  // Eligible BOMs = unlinked ones, plus the currently linked one (so re-picking
  // the same BOM, or swapping it, both work from the same list).
  const eligibleBoms = [
    ...(linkedBom ? [linkedBom] : []),
    ...getEligibleBoms().filter((bom) => bom.id !== linkedBom?.id),
  ].filter((bom) => bom.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));

  return (
    <>
      {!linkedBom ? (
        <Button
          variant="tertiary"
          size="small"
          onClick={openPicker}
          style={{ padding: "0 8px", height: "24px", minHeight: "unset", alignSelf: "flex-start" }}
        >
          Add BOM
        </Button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", height: "24px" }}>
          <span
            style={{
              fontSize: "var(--text-title-3)",
              color: "var(--neutral-on-surface-primary)",
              fontWeight: "var(--font-weight-bold)",
              cursor: "pointer",
            }}
            onClick={() => onNavigate?.(`/bill-of-materials/${linkedBom.id}`, { id: linkedBom.id })}
          >
            {linkedBom.name} (v{linkedBom.version})
          </span>
          <IconButton
            icon={EditIcon}
            size="small"
            title="Change linked BOM"
            onClick={openPicker}
            style={{ width: "24px", height: "24px", minHeight: "unset", minWidth: "unset", padding: 0 }}
          />
        </div>
      )}

      <GeneralModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        title="Choose Existing BOM"
        description="Select an unlinked BOM to associate with this material."
        footer={
          <>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setIsPickerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={handleConfirmLink}
            >
              Save
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <TableSearchField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search BOM name"
            width="100%"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "320px", overflowY: "auto" }}>
            {eligibleBoms.length === 0 ? (
              <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)", padding: "16px", textAlign: "center" }}>
                No eligible BOMs found.
              </span>
            ) : (
              eligibleBoms.map((bom) => {
                const isSelected = selectedBomId === bom.id;
                return (
                  <div
                    key={bom.id}
                    onClick={() => setSelectedBomId(bom.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: `1px solid ${isSelected ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
                      background: isSelected ? "var(--feature-brand-container-lighter)" : "var(--neutral-surface-primary)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                      <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>
                        {bom.name} (v{bom.version})
                      </span>
                      <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
                        {bom.description || "No description"}
                      </span>
                    </div>
                    {isSelected && bom.id === linkedBom?.id ? (
                      <Button
                        variant="tertiary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlink();
                        }}
                        style={{ color: "var(--status-red-primary)", flexShrink: 0 }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--status-red-container)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        Unlink
                      </Button>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </GeneralModal>
    </>
  );
};
