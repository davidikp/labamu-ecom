import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

export const InputDataConfirmModal = ({ isOpen, onClose, onConfirm, productCount }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title={`Import ${productCount} product${productCount > 1 ? "s" : ""}?`}
    description="These products will be added to your product catalog."
    width="560px"
    hideFooterDivider
    footerPaddingTop={24}
    footer={
      <>
        <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          variant="filled"
          size="large"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          style={{ flex: 1 }}
        >
          Yes, Import Products
        </Button>
      </>
    }
  />
);
