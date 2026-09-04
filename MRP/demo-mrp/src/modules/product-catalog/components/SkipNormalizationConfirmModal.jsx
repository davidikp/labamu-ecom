import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

export const SkipNormalizationConfirmModal = ({ isOpen, onClose, onConfirm }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title="Skip normalization?"
    description="The remaining data won’t be normalized by AI. Those rows will need your attention later in the Review step."
    width="560px"
    hideFooterDivider
    footerPaddingTop={24}
    footer={
      <>
        <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
          Keep Waiting
        </Button>
        <Button
          variant="danger-filled"
          size="large"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          style={{ flex: 1 }}
        >
          Yes, Skip
        </Button>
      </>
    }
  />
);
