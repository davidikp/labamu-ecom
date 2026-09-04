import React, { useState } from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { TextField } from "../../../ce-ui";
import { SearchableSelectField } from "./SearchableSelectField.jsx";
import { ROUTING_CATALOG, getRoutingOperations } from "../mock/routingMocks.js";

const ROUTING_OPTIONS = ROUTING_CATALOG.map((r) => ({ value: r.name, label: r.name }));

export const RoutingLineModal = ({ isOpen, onClose, onSave, initialLine }) => {
  const [routingName, setRoutingName] = useState(initialLine?.name || "");
  const [operationName, setOperationName] = useState(initialLine?.operation || "");
  const [hours, setHours] = useState(initialLine?.hours ?? "");

  const operationOptions = getRoutingOperations(routingName).map((op) => ({ value: op, label: op }));
  const canSave = routingName && operationName && Number(hours) > 0;

  const handleRoutingChange = (value) => {
    setRoutingName(value);
    setOperationName("");
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({ name: routingName, operation: operationName, hours: Number(hours) });
  };

  return (
    <GeneralModal isOpen={isOpen} onClose={onClose} title={initialLine ? "Edit Routing" : "Add Routing"} width="480px">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <SearchableSelectField
          label="Routing"
          required
          value={routingName}
          onChange={handleRoutingChange}
          options={ROUTING_OPTIONS}
          placeholder="Search or select..."
        />
        <SearchableSelectField
          label="Operation Name"
          required
          value={operationName}
          onChange={setOperationName}
          options={operationOptions}
          disabled={!routingName}
          placeholder={routingName ? "Search or select..." : "Select a routing first"}
        />
        <TextField
          label="Hours"
          required
          size="lg"
          className="w-full"
          type="number"
          placeholder="Enter hours"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          rightIcon="Hours"
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
