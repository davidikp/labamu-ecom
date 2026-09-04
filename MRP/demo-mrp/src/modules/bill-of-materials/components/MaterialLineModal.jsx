import React, { useState } from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { TextField } from "../../../ce-ui";
import { SearchableSelectField } from "./SearchableSelectField.jsx";
import { MOCK_MATERIALS_DATA } from "../../materials/mock/materialsMocks.js";

const MATERIAL_OPTIONS = MOCK_MATERIALS_DATA.map((m) => ({ value: m.id, label: `${m.name} (${m.sku})` }));

export const MaterialLineModal = ({ isOpen, onClose, onSave, initialLine }) => {
  const [materialId, setMaterialId] = useState(initialLine?.materialId || "");
  const [quantity, setQuantity] = useState(initialLine?.quantity ?? "");

  const selectedMaterial = MOCK_MATERIALS_DATA.find((m) => m.id === materialId);
  const canSave = materialId && Number(quantity) > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ materialId, quantity: Number(quantity) });
  };

  return (
    <GeneralModal isOpen={isOpen} onClose={onClose} title={initialLine ? "Edit Material" : "Add Material"} width="480px">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <SearchableSelectField
          label="Material"
          required
          value={materialId}
          onChange={setMaterialId}
          options={MATERIAL_OPTIONS}
          placeholder="Search or select..."
        />
        <TextField
          label="Quantity"
          required
          size="lg"
          className="w-full"
          type="number"
          placeholder="Enter quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          rightIcon={selectedMaterial?.unit || undefined}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <Button variant="filled" size="large" onClick={handleSave} disabled={!canSave} style={{ width: "100%" }}>
            Save
          </Button>
          <Button variant="outlined" size="large" onClick={onClose} style={{ width: "100%" }}>
            Cancel
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
};
