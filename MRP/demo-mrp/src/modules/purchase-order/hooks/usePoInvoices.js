import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { formatIsoDateString } from "../../../utils/date/dateUtils";
import { MOCK_PO_TABLE_DATA } from "../mock/purchaseOrderMocks";

// Module-level cache: persists invoice/payment state across navigation
const invoiceCache = new Map();

export const usePoInvoices = ({
  initialInvoices = [],
  initialPayments = [],
  initialLogs = [],
  mockLines = [],
  currency = "IDR",
  poTotal = 0,
  poNumber = "",
  vendorName = "",
  showToast,
  onAddDocument,
} = {}) => {
  // --- Core Data State (hydrate from cache if available) ---
  const cached = poNumber ? invoiceCache.get(poNumber) : null;
  const [invoices, setInvoices] = useState(cached?.invoices ?? initialInvoices);
  const [payments, setPayments] = useState(cached?.payments ?? initialPayments);
  const [invoicePaymentLogs, setInvoicePaymentLogs] = useState(cached?.logs ?? initialLogs);
  const isFirstMount = useRef(true);

  // Sync with initial props only on first mount (skip if we have cached data)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const hasCached = poNumber && invoiceCache.has(poNumber);
    if (!hasCached) {
      setInvoices(initialInvoices);
      setPayments(initialPayments);
      setInvoicePaymentLogs(initialLogs);
    }
  }, [initialInvoices, initialPayments, initialLogs]);

  // Write to cache and sync back to MOCK_PO_TABLE_DATA whenever state changes
  useEffect(() => {
    if (poNumber) {
      invoiceCache.set(poNumber, { invoices, payments, logs: invoicePaymentLogs });
      const idx = MOCK_PO_TABLE_DATA.findIndex(p => p.poNumber === poNumber);
      if (idx !== -1) {
        MOCK_PO_TABLE_DATA[idx].invoices = invoices;
        MOCK_PO_TABLE_DATA[idx].payments = payments;
      }
    }
  }, [poNumber, invoices, payments, invoicePaymentLogs]);

  // --- UI State ---
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceRowsPerPage, setInvoiceRowsPerPage] = useState(25);
  const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(1);
  const [activeInvoiceTab, setActiveInvoiceTab] = useState("Details");
  const [expandedInvoiceItems, setExpandedInvoiceItems] = useState([]);
  const [expandedInvoicePayments, setExpandedInvoicePayments] = useState([]);

  // Modals & Drawers
  const [showInvoiceDetailDrawer, setShowInvoiceDetailDrawer] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState(null);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [selectedInvoiceForHistory, setSelectedInvoiceForHistory] = useState(null);
  const [showAddInvoiceDrawer, setShowAddInvoiceDrawer] = useState(false);
  const [showAddPaymentDrawer, setShowAddPaymentDrawer] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [showDeleteInvoiceConfirm, setShowDeleteInvoiceConfirm] = useState(false);
  const [showVoidConfirmModal, setShowVoidConfirmModal] = useState(false);
  const [showExceedConfirmModal, setShowExceedConfirmModal] = useState(false);
  const [showItemQtyExceedConfirmModal, setShowItemQtyExceedConfirmModal] = useState(false);
  const [showZeroAmountConfirmModal, setShowZeroAmountConfirmModal] = useState(false);
  const [exceededItems, setExceededItems] = useState([]);
  const [paymentToVoid, setPaymentToVoid] = useState(null);
  const [lastInvoiceId, setLastInvoiceId] = useState(null);
  const [deleteInvoiceReason, setDeleteInvoiceReason] = useState("");
  const [deleteInvoiceReasonError, setDeleteInvoiceReasonError] = useState("");
  const [voidPaymentReason, setVoidPaymentReason] = useState("");
  const [voidPaymentReasonError, setVoidPaymentReasonError] = useState("");

  // Form States
  const [addInvoiceFormData, setAddInvoiceFormData] = useState({
    number: "",
    date: formatIsoDateString(new Date()),
    termsValue: "30",
    termsUnit: "Days",
    amount: "",
    notes: "",
    attachments: [],
    itemLines: [{ id: "", qty: "", ocrRef: "" }],
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [paymentFormData, setPaymentFormData] = useState({
    date: formatIsoDateString(new Date()),
    amount: "",
    method: "Bank Transfer",
    notes: "",
    attachments: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [paymentFormErrors, setPaymentFormErrors] = useState({});
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [autoPrefillInvoice, setAutoPrefillInvoice] = useState(false);
  const [autoPrefillPayment, setAutoPrefillPayment] = useState(false);

  // --- Helpers ---
  const getInvoiceMetrics = useCallback((invoice) => {
    if (!invoice) return { paid: 0, outstanding: 0, total: 0, payments: [], status: "Draft", isOverdue: false };
    const invPayments = payments
      .filter((p) => p.invoiceId === invoice.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const paid = invPayments.filter(p => !p.isVoid).reduce((sum, p) => sum + (p.amount || 0), 0);
    const total = invoice.amount || 0;
    const outstanding = Math.max(total - paid, 0);
    const isOverdue = new Date(invoice.dueDate) < new Date() && outstanding > 0;
    
    let status = "Open";
    if (outstanding <= 0 && total > 0) status = "Settled";
    else if (paid > 0) status = "Partially Paid";
    
    return { paid, outstanding, total, payments: invPayments, status, isOverdue };
  }, [payments]);

  const getAgingStatus = useCallback((dueDate, outstanding) => {
    const today = new Date();
    const due = new Date(dueDate);
    if (due >= today) return { text: "Not Due", variant: "grey-light" };

    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) return { text: "Late 1-30", variant: "blue-light" };
    if (diffDays <= 60) return { text: "Late 31-60", variant: "yellow-light" };
    if (diffDays <= 90) return { text: "Late 61-90", variant: "orange-light" };
    return { text: "Late 90+", variant: "red-light" };
  }, []);

  const getInvoiceStatus = useCallback((invoice, metrics) => {
    const { paid, outstanding } = metrics;
    const isOverdue = new Date(invoice.dueDate) < new Date();

    if (outstanding <= 0) return { text: "Paid", variant: "green-light" };
    if (paid > 0) {
      if (isOverdue) return { text: "Overdue", variant: "red-light" };
      return { text: "Partially Paid", variant: "blue-light" };
    }
    if (isOverdue) return { text: "Overdue", variant: "red-light" };
    return { text: "Open", variant: "grey-light" };
  }, []);

  const addInvoicePaymentLog = useCallback((title, desc, actor) => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const formattedTimestamp = `${yyyy}-${mm}-${dd} at ${hh}:${min}`;

    setInvoicePaymentLogs(prev => [
      {
        name: actor?.name || "Natasha Smith",
        email: actor?.email ?? "natasha.smith@company.com",
        title,
        desc,
        timestamp: formattedTimestamp,
      },
      ...prev,
    ]);
  }, []);

  // --- Final Invoice (mark the most recent invoice as the closing invoice) ---
  // Invoice dates are ISO strings ("YYYY-MM-DD"), so a string max gives the latest date.
  const maxInvoiceDate = useMemo(
    () => invoices.reduce((max, inv) => (!max || inv.date > max ? inv.date : max), null),
    [invoices]
  );

  const isLatestDatedInvoice = useCallback(
    (invoice) => !!invoice && !!maxInvoiceDate && invoice.date === maxInvoiceDate,
    [maxInvoiceDate]
  );

  const toggleLastInvoice = useCallback((invoice) => {
    if (!invoice) return;
    if (lastInvoiceId === invoice.id) {
      setLastInvoiceId(null);
      addInvoicePaymentLog("Unmarked Invoice as the Final Invoice", invoice.number);
      if (showToast) showToast("Invoice successfully unmarked as the Final Invoice", "dark");
    } else {
      setLastInvoiceId(invoice.id);
      addInvoicePaymentLog("Marked Invoice as the Final Invoice", invoice.number);
      if (showToast) showToast("Invoice successfully marked as the Final Invoice");
    }
  }, [lastInvoiceId, addInvoicePaymentLog, showToast]);

  // Auto-clear the mark when it becomes invalid (marked invoice deleted, or no
  // longer the most recent by date). Deletion is logged in handleDeleteInvoice,
  // so the "missing" branch here clears silently to avoid a duplicate log.
  useEffect(() => {
    if (!lastInvoiceId) return;
    const marked = invoices.find((inv) => inv.id === lastInvoiceId);
    if (!marked) {
      setLastInvoiceId(null);
      return;
    }
    if (maxInvoiceDate && marked.date !== maxInvoiceDate) {
      setLastInvoiceId(null);
      addInvoicePaymentLog(
        "Unmarked Invoice as the Final Invoice",
        `${marked.number} — automatically unmarked because it is no longer the most recent invoice.`,
        { name: "System", email: "-" }
      );
    }
  }, [invoices, lastInvoiceId, maxInvoiceDate, addInvoicePaymentLog]);

  // --- Derived State ---
  const totalInvoiced = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [invoices]);

  const totalPaid = useMemo(() => {
    return payments.filter(p => !p.isVoid).reduce((sum, pay) => sum + (pay.amount || 0), 0);
  }, [payments]);

  const outstandingAmount = useMemo(() => Math.max(totalInvoiced - totalPaid, 0), [totalInvoiced, totalPaid]);
  const paidRatio = useMemo(() => totalInvoiced > 0 ? Math.min(totalPaid / totalInvoiced, 1) : 0, [totalPaid, totalInvoiced]);

  const overdueAmount = useMemo(() => {
    const today = new Date();
    return invoices.reduce((sum, inv) => {
      const { outstanding } = getInvoiceMetrics(inv);
      const dueDate = new Date(inv.dueDate);
      const isOverdue = dueDate < today && outstanding > 0;
      return isOverdue ? sum + outstanding : sum;
    }, 0);
  }, [invoices, getInvoiceMetrics]);

  const poInvoicedRatio = useMemo(() => poTotal > 0 ? Math.min(totalInvoiced / poTotal, 1) : 0, [totalInvoiced, poTotal]);
  const poGap = useMemo(() => Math.max(poTotal - totalInvoiced, 0), [poTotal, totalInvoiced]);

  const calculatedDueDate = useMemo(() => {
    if (!addInvoiceFormData.date) return "-";
    const date = new Date(addInvoiceFormData.date);
    const val = parseInt(addInvoiceFormData.termsValue) || 0;
    if (addInvoiceFormData.termsUnit === "Days") {
      date.setDate(date.getDate() + val);
    } else {
      date.setMonth(date.getMonth() + val);
    }
    return formatIsoDateString(date);
  }, [addInvoiceFormData.date, addInvoiceFormData.termsValue, addInvoiceFormData.termsUnit]);

  // --- Handlers ---
  const simulateInvoiceOcr = useCallback((file) => {
    if (!autoPrefillInvoice) return;
    setTimeout(() => {
      const line1 = mockLines[0];
      const line2 = mockLines[1];
      setAddInvoiceFormData((prev) => ({
        ...prev,
        number: "INV/2026/04/0024",
        date: formatIsoDateString(new Date()),
        amount: "2500000",
        itemLines: [
          { id: line1?.id || line1?.item || "", qty: "50", ocrRef: "WOODEN CHAIR FRAME" },
          { id: line2?.id || line2?.item || "", qty: "20", ocrRef: "ALUMINIUM SHEET 2MM" }
        ]
      }));
    }, 1200);
  }, [autoPrefillInvoice, mockLines]);

  const simulatePaymentOcr = useCallback((file) => {
    if (!autoPrefillPayment) return;
    setTimeout(() => {
      setPaymentFormData((prev) => ({
        ...prev,
        date: formatIsoDateString(new Date()),
        amount: "1500000",
        method: "Bank Transfer",
      }));
    }, 1200);
  }, [autoPrefillPayment]);

  const getRemainingPoQty = useCallback((itemId, currentInvoiceId) => {
    const poLine = mockLines.find((line) => (line.id || line.item) === itemId);
    if (!poLine) return 0;
    const totalOrdered = poLine.qty || poLine.orderedQty || 0;

    const totalInvoicedQty = invoices.reduce((sum, inv) => {
      if (currentInvoiceId && inv.id === currentInvoiceId) return sum;
      
      const matchingLine = (inv.itemLines || []).find((il) => il.id === itemId);
      if (matchingLine) {
        return sum + (parseFloat(matchingLine.qty) || 0);
      }
      return sum;
    }, 0);

    return Math.max(totalOrdered - totalInvoicedQty, 0);
  }, [mockLines, invoices]);

  const handleEditInvoice = useCallback(() => {
    const inv = selectedInvoiceForDetail;
    if (!inv) return;
    setIsEditingInvoice(true);

    const termsParts = (inv.terms || "30 Days").trim().split(" ");
    const termsValue = termsParts[0] || "30";
    const termsUnit = termsParts[1] ? (termsParts[1].charAt(0).toUpperCase() + termsParts[1].slice(1)) : "Days";

    setAddInvoiceFormData({
      id: inv.id,
      number: inv.number,
      date: inv.date,
      termsValue,
      termsUnit,
      amount: String(inv.amount),
      notes: inv.notes || "",
      attachments: inv.attachments || [],
      itemLines: (inv.itemLines || []).length > 0 ? inv.itemLines : [{ id: "", qty: "", ocrRef: "" }],
      bankName: inv.bankDetails?.bankName || "",
      accountNumber: inv.bankDetails?.accountNumber || "",
      accountName: inv.bankDetails?.accountName || "",
    });
    setShowAddInvoiceDrawer(true);
    setShowInvoiceDetailDrawer(false);
  }, [selectedInvoiceForDetail]);

  const saveInvoice = useCallback(() => {
    const terms = `${addInvoiceFormData.termsValue} ${addInvoiceFormData.termsUnit.toLowerCase()}`;

    if (isEditingInvoice) {
      const updatedInvoice = {
        id: addInvoiceFormData.id,
        number: addInvoiceFormData.number,
        date: addInvoiceFormData.date,
        dueDate: calculatedDueDate,
        terms,
        amount: parseFloat(addInvoiceFormData.amount) || 0,
        notes: addInvoiceFormData.notes,
        attachments: addInvoiceFormData.attachments,
        itemLines: addInvoiceFormData.itemLines,
        bankDetails: {
          bankName: addInvoiceFormData.bankName,
          accountNumber: addInvoiceFormData.accountNumber,
          accountName: addInvoiceFormData.accountName,
        },
      };

      setInvoices((prev) =>
        prev.map((inv) => inv.id === addInvoiceFormData.id ? updatedInvoice : inv)
      );
      setSelectedInvoiceForDetail(updatedInvoice);
      addInvoicePaymentLog("Invoice Updated", `Invoice ${addInvoiceFormData.number} details were updated.`);
      if (showToast) {
        showToast("Invoice successfully updated");
      }
    } else {
      const newInvoice = {
        id: `inv-${Date.now()}`,
        number: addInvoiceFormData.number,
        date: addInvoiceFormData.date,
        dueDate: calculatedDueDate,
        terms,
        amount: parseFloat(addInvoiceFormData.amount) || 0,
        status: "Open",
        notes: addInvoiceFormData.notes,
        attachments: addInvoiceFormData.attachments,
        itemLines: addInvoiceFormData.itemLines,
        bankDetails: {
          bankName: addInvoiceFormData.bankName,
          accountNumber: addInvoiceFormData.accountNumber,
          accountName: addInvoiceFormData.accountName,
        },
      };
      setInvoices((prev) => [newInvoice, ...prev]);
      if (onAddDocument && addInvoiceFormData.attachments?.length > 0) {
        addInvoiceFormData.attachments.forEach((att) => {
          onAddDocument({
            id: `doc-inv-${Date.now()}-${Math.random()}`,
            name: att.name || att.file?.name || "invoice-attachment",
            description: `${addInvoiceFormData.number} document`,
            meta: `Uploaded by Natasha Smith on ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
            documentType: "invoice",
            type: "pdf",
            size: att.file?.size ? `${Math.round(att.file.size / 1024)} KB` : "-",
            modifiedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          });
        });
      }
      addInvoicePaymentLog("Invoice Added", `New invoice #${addInvoiceFormData.number} for ${currency} ${parseFloat(addInvoiceFormData.amount).toLocaleString()} was added.`);
      if (showToast) {
        showToast("Invoice successfully added");
      }
    }

    setShowAddInvoiceDrawer(false);
    setIsEditingInvoice(false);
    setFormErrors({});
  }, [addInvoiceFormData, isEditingInvoice, calculatedDueDate, currency, addInvoicePaymentLog, showToast, setSelectedInvoiceForDetail]);

  const checkPoValueAndSave = useCallback(() => {
    const otherInvoicesTotal = invoices.reduce(
      (sum, inv) => (isEditingInvoice && inv.id === addInvoiceFormData.id ? sum : sum + (inv.amount || 0)),
      0
    );
    const newAmount = parseFloat(addInvoiceFormData.amount) || 0;
    const potentialTotalInvoiced = otherInvoicesTotal + newAmount;

    if (potentialTotalInvoiced > poTotal) {
      setShowExceedConfirmModal(true);
      return;
    }
    saveInvoice();
  }, [invoices, isEditingInvoice, addInvoiceFormData, poTotal, saveInvoice]);

  const proceedAfterQtyExceed = useCallback(() => {
    const invoiceAmount = parseFloat(addInvoiceFormData.amount) || 0;
    if (invoiceAmount === 0) {
      setShowZeroAmountConfirmModal(true);
      return;
    }
    checkPoValueAndSave();
  }, [addInvoiceFormData.amount, checkPoValueAndSave]);

  const handleAddInvoice = useCallback(() => {
    let hasError = false;
    const nextErrors = {};
    if (!addInvoiceFormData.number) {
      nextErrors.number = "Field cannot be empty";
      hasError = true;
    } else {
      const isDuplicate = invoices.some(
        (inv) =>
          inv.number.trim().toLowerCase() === addInvoiceFormData.number.trim().toLowerCase() &&
          (!isEditingInvoice || inv.id !== addInvoiceFormData.id)
      );
      if (isDuplicate) {
        nextErrors.number = "Invoice number already exist";
        hasError = true;
      }
    }

    if (!addInvoiceFormData.amount) {
      nextErrors.amount = "Field cannot be empty";
      hasError = true;
    } else if (isEditingInvoice) {
      const newAmount = parseFloat(addInvoiceFormData.amount) || 0;
      const alreadyPaid = payments
        .filter((p) => !p.isVoid && p.invoiceId === addInvoiceFormData.id)
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      if (alreadyPaid > 0 && newAmount < alreadyPaid) {
        const formattedPaid = `${currency} ${alreadyPaid.toLocaleString()}`;
        nextErrors.amount = `Invoice amount cannot be lower than the paid amount (${formattedPaid}).`;
        hasError = true;
      }
    }
    
    const foundExceededItems = [];
    const itemLineErrors = addInvoiceFormData.itemLines.map((il) => {
      const err = {};
      if (!il.id) {
        err.id = "Field cannot be empty";
        hasError = true;
      }
      if (!il.qty) {
        err.qty = "Field cannot be empty";
        hasError = true;
      } else if (il.id) {
        const qtyVal = parseFloat(il.qty) || 0;
        const remainingQty = getRemainingPoQty(il.id, isEditingInvoice ? addInvoiceFormData.id : null);
        if (qtyVal > remainingQty) {
          foundExceededItems.push({
            name: mockLines.find((line) => (line.id || line.item) === il.id)?.item || il.id,
            entered: qtyVal,
            remaining: remainingQty
          });
        }
      }
      if (!il.ocrRef || !il.ocrRef.trim()) {
        err.ocrRef = "Field cannot be empty";
        hasError = true;
      }
      return err;
    });
    if (hasError) {
      setFormErrors({ ...nextErrors, itemLines: itemLineErrors });
      return;
    }
    
    if (foundExceededItems.length > 0) {
      setExceededItems(foundExceededItems);
      setShowItemQtyExceedConfirmModal(true);
      return;
    }

    proceedAfterQtyExceed();
  }, [addInvoiceFormData, isEditingInvoice, invoices, payments, currency, proceedAfterQtyExceed, getRemainingPoQty]);

  const handleDeleteInvoice = useCallback(() => {
    if (!selectedInvoiceForDetail) return;
    const invNumber = selectedInvoiceForDetail.number;
    const wasLastInvoice = lastInvoiceId === selectedInvoiceForDetail.id;
    setInvoices((prev) => prev.filter((i) => i.id !== selectedInvoiceForDetail.id));
    setPayments((prev) => prev.filter((p) => p.invoiceId !== selectedInvoiceForDetail.id));
    addInvoicePaymentLog("Invoice Deleted", `Invoice ${invNumber} and its associated payments were removed.`);
    if (wasLastInvoice) {
      setLastInvoiceId(null);
      addInvoicePaymentLog(
        "Unmarked Invoice as the Final Invoice",
        `${invNumber} — automatically unmarked because the invoice was deleted.`,
        { name: "System", email: "-" }
      );
    }
    if (showToast) {
      showToast("Invoice successfully deleted");
    }
    setShowDeleteInvoiceConfirm(false);
    setDeleteInvoiceReason("");
    setShowInvoiceDetailDrawer(false);
  }, [selectedInvoiceForDetail, addInvoicePaymentLog, showToast, lastInvoiceId]);

  const handleAddPayment = useCallback(() => {
    let hasError = false;
    const nextErrors = {};
    if (!paymentFormData.amount) { nextErrors.amount = "Field cannot be empty"; hasError = true; }
    if (selectedInvoiceForPayment) {
      const outstanding = getInvoiceMetrics(selectedInvoiceForPayment).outstanding;
      if (parseFloat(paymentFormData.amount) > outstanding) {
        nextErrors.amount = "Payment exceeds outstanding balance";
        hasError = true;
      }
    }

    if (hasError) {
      setPaymentFormErrors(nextErrors);
      return;
    }

    const newPayment = {
      id: `pay-${Date.now()}`,
      invoiceId: selectedInvoiceForPayment?.id,
      invoiceNumber: selectedInvoiceForPayment?.number,
      amount: parseFloat(paymentFormData.amount) || 0,
      date: paymentFormData.date,
      method: paymentFormData.method,
      notes: paymentFormData.notes,
      attachments: paymentFormData.attachments,
      proof: paymentFormData.attachments?.[0]?.name,
      addedBy: "Natasha Smith",
      createdAt: new Date().toISOString(),
      isVoid: false,
    };

    setPayments((prev) => [newPayment, ...prev]);
    if (onAddDocument && paymentFormData.attachments?.length > 0) {
      paymentFormData.attachments.forEach((att) => {
        onAddDocument({
          id: `doc-pay-${Date.now()}-${Math.random()}`,
          name: att.name || att.file?.name || "payment-proof",
          description: `${newPayment.id} document`,
          meta: `Uploaded by Natasha Smith on ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
          documentType: "invoice_payment",
          type: "pdf",
          size: att.file?.size ? `${Math.round(att.file.size / 1024)} KB` : "-",
          modifiedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        });
      });
    }
    addInvoicePaymentLog("Payment Added", `Payment of ${currency} ${parseFloat(paymentFormData.amount).toLocaleString()} added to Invoice ${selectedInvoiceForPayment?.number}.`);
    if (showToast) {
      showToast("Payment successfully added");
    }
    setShowAddPaymentDrawer(false);
    setShowInvoiceDetailDrawer(true);
    setSelectedInvoiceForDetail(selectedInvoiceForPayment);
    setActiveInvoiceTab("Payment History");
    setPaymentFormErrors({});
  }, [paymentFormData, selectedInvoiceForPayment, getInvoiceMetrics, currency, addInvoicePaymentLog, showToast, setShowInvoiceDetailDrawer, setSelectedInvoiceForDetail, setActiveInvoiceTab]);

  const handleVoidPayment = useCallback(() => {
    if (!paymentToVoid) return;
    const associatedInv = invoices.find(i => i.id === paymentToVoid.invoiceId);
    setPayments(prev => prev.map(p => p.id === paymentToVoid.id ? { ...p, isVoid: true, voidedAt: new Date().toISOString() } : p));
    addInvoicePaymentLog("Payment Voided", `Payment of ${currency} ${paymentToVoid.amount.toLocaleString()} for Invoice ${associatedInv?.number || "Unknown"} was voided.`);
    if (showToast) {
      showToast("Payment successfully voided");
    }
    setShowVoidConfirmModal(false);
    setVoidPaymentReason("");
    setPaymentToVoid(null);
  }, [paymentToVoid, invoices, currency, addInvoicePaymentLog, showToast]);

  return {
    // Data State
    invoices,
    setInvoices,
    payments,
    setPayments,
    invoicePaymentLogs,
    setInvoicePaymentLogs,

    // UI State
    invoiceSearch,
    setInvoiceSearch,
    invoiceRowsPerPage,
    setInvoiceRowsPerPage,
    invoiceCurrentPage,
    setInvoiceCurrentPage,
    activeInvoiceTab,
    setActiveInvoiceTab,
    expandedInvoiceItems,
    setExpandedInvoiceItems,
    expandedInvoicePayments,
    setExpandedInvoicePayments,

    // Modals
    showInvoiceDetailDrawer,
    setShowInvoiceDetailDrawer,
    selectedInvoiceForDetail,
    setSelectedInvoiceForDetail,
    showPaymentHistoryModal,
    setShowPaymentHistoryModal,
    selectedInvoiceForHistory,
    setSelectedInvoiceForHistory,
    showAddInvoiceDrawer,
    setShowAddInvoiceDrawer,
    showAddPaymentDrawer,
    setShowAddPaymentDrawer,
    selectedInvoiceForPayment,
    setSelectedInvoiceForPayment,
    showDeleteInvoiceConfirm,
    setShowDeleteInvoiceConfirm,
    showVoidConfirmModal,
    setShowVoidConfirmModal,
    paymentToVoid,
    setPaymentToVoid,

    // Forms
    addInvoiceFormData,
    setAddInvoiceFormData,
    paymentFormData,
    setPaymentFormData,
    formErrors,
    setFormErrors,
    paymentFormErrors,
    setPaymentFormErrors,
    isEditingInvoice,
    setIsEditingInvoice,
    autoPrefillInvoice,
    setAutoPrefillInvoice,
    autoPrefillPayment,
    setAutoPrefillPayment,

    // Helpers
    getInvoiceMetrics,
    getAgingStatus,
    getInvoiceStatus,
    addInvoicePaymentLog,

    // Final Invoice
    lastInvoiceId,
    setLastInvoiceId,
    maxInvoiceDate,
    isLatestDatedInvoice,
    toggleLastInvoice,

    // Derived State
    totalInvoiced,
    totalPaid,
    outstandingAmount,
    paidRatio,
    overdueAmount,
    poInvoicedRatio,
    poGap,
    calculatedDueDate,

    showExceedConfirmModal,
    setShowExceedConfirmModal,
    showItemQtyExceedConfirmModal,
    setShowItemQtyExceedConfirmModal,
    showZeroAmountConfirmModal,
    setShowZeroAmountConfirmModal,
    exceededItems,
    saveInvoice,
    checkPoValueAndSave,
    proceedAfterQtyExceed,
    deleteInvoiceReason,
    setDeleteInvoiceReason,
    deleteInvoiceReasonError,
    setDeleteInvoiceReasonError,
    voidPaymentReason,
    setVoidPaymentReason,
    voidPaymentReasonError,
    setVoidPaymentReasonError,

    // Handlers
    simulateInvoiceOcr,
    simulatePaymentOcr,
    handleEditInvoice,
    handleAddInvoice,
    handleDeleteInvoice,
    handleAddPayment,
    handleVoidPayment,
  };
};
