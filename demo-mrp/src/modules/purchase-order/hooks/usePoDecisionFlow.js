import { useState, useCallback, useMemo } from "react";

export const usePoDecisionFlow = ({
  poApprovalSettings,
  currentStatus,
}) => {
  // --- Decision Modal State ---
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [decisionError, setDecisionError] = useState("");

  // --- Final Decision Results (Persisted Messages) ---
  const [revisionMessage, setRevisionMessage] = useState(
    currentStatus === "Need Revision"
      ? "Please update the delivery timeline and review the requested changes before resubmitting this purchase order."
      : ""
  );
  const [canceledMessage, setCanceledMessage] = useState(
    currentStatus === "Canceled"
      ? "The purchase order has been canceled and will not proceed further."
      : ""
  );
  const [approvalComment, setApprovalComment] = useState("");

  const approvalCommentRequired = useMemo(() => !!(
    poApprovalSettings?.isApprovalActive && poApprovalSettings?.requireComment
  ), [poApprovalSettings]);

  // --- Helpers ---
  const getDecisionMeta = useCallback(() => {
    if (decisionType === "cancel") {
      return {
        title: "Cancel Purchase Order",
        helper: "Add a reason for canceling this purchase order.",
        mandatory: true,
      };
    }
    if (decisionType === "revision") {
      return {
        title: "Ask for Revision",
        helper: "Add revision notes for the requester.",
        mandatory: true,
      };
    }
    return {
      title: "Approve Purchase Order",
      helper: approvalCommentRequired
        ? "Comment is required before approving this purchase order."
        : "Add a comment for approval if needed.",
      mandatory: approvalCommentRequired,
    };
  }, [decisionType, approvalCommentRequired]);

  const openDecisionModal = useCallback((type) => {
    setDecisionType(type);
    setDecisionComment("");
    setDecisionError("");
    setIsDecisionModalOpen(true);
  }, []);

  const closeDecisionModal = useCallback(() => {
    setIsDecisionModalOpen(false);
    setDecisionType(null);
    setDecisionComment("");
    setDecisionError("");
  }, []);

  return {
    // State
    isDecisionModalOpen,
    setIsDecisionModalOpen,
    decisionType,
    setDecisionType,
    decisionComment,
    setDecisionComment,
    decisionError,
    setDecisionError,
    revisionMessage,
    setRevisionMessage,
    canceledMessage,
    setCanceledMessage,
    approvalComment,
    setApprovalComment,
    approvalCommentRequired,

    // Handlers
    openDecisionModal,
    closeDecisionModal,
    getDecisionMeta,
  };
};
