import { useState, useEffect, useMemo } from "react";

// Standard MUI Components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Divider from "@mui/material/Divider";

// Material Dashboard Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ManageInvoices() {
  // ✅ 1. GET USER ROLE
  const role = localStorage.getItem("role");

  const [invoices, setInvoices] = useState([]);
  const [showBackups, setShowBackups] = useState(false);
  const [search, setSearch] = useState("");

  // Modal State
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Payment Form Data
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/invoices");
      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setInvoices([]);
    }
  };

  // --- STRICT MATH LOGIC ---
  const getVal = (val) => parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;

  const getFinancials = (inv) => {
    if (!inv) return { total: 0, paid: 0, balance: 0, status: "PENDING", color: "warning" };

    const total = getVal(inv.grandTotal || inv.total || inv.amount || inv.totalAmount || inv.amountPayable);
    let paid = getVal(inv.amountPaid || inv.received);

    let balance = total - paid;
    if (balance < 1) balance = 0;

    let status = "PENDING";
    let color = "warning";

    if (balance === 0 && total > 0) {
      status = "PAID";
      color = "success";
    } else if (paid > 0 && balance > 0) {
      status = "PARTIAL";
      color = "info";
    } else {
      status = "PENDING";
      color = "warning";
    }

    return { total, paid, balance, status, color };
  };

  const formatMoney = (amount) => "Rs. " + Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // --- ACTIONS ---
  const handleOpenPayment = (inv) => {
    const { balance } = getFinancials(inv);
    setSelectedInvoice(inv);
    setPaymentAmount(balance);
    setPaymentNote("");
    setPaymentMode("UPI");
    setOpenPaymentModal(true);
  };

  const submitPayment = async () => {
    if (!selectedInvoice) return;
    try {
      await fetch(`https://ims-backend-production-e15c.up.railway.app/api/invoices/${selectedInvoice.id}/confirm-payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: paymentNote,
          paymentMode: paymentMode,
          amount: getVal(paymentAmount)
        })
      });

      setOpenPaymentModal(false);
      fetchInvoices();
      alert("Payment Recorded Successfully! Balance updated.");

    } catch (err) {
      alert("Network Error: Could not save payment.");
    }
  };

  // PERMANENT DELETE FUNCTION
  const deletePermanently = async (id) => {
    if(!window.confirm("⚠️ ARE YOU SURE? This will permanently delete the invoice. This cannot be undone.")) return;
    try {
      await fetch(`https://ims-backend-production-e15c.up.railway.app/api/invoices/${id}`, { method: 'DELETE' });
      fetchInvoices(); // Refresh list
      alert("Invoice deleted forever.");
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const downloadPdf = async (id) => {
    try {
      const res = await fetch(`https://ims-backend-production-e15c.up.railway.app/api/invoices/${id}/pdf`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `Invoice_${id}.pdf`);
      document.body.appendChild(link); link.click();
    } catch (err) { alert("PDF Failed"); }
  };

  // --- FILTER & CALCULATE ---
  const processedInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const isArchived = !!inv.archived;
      if (showBackups && !isArchived) return false;
      if (!showBackups && isArchived) return false;

      const term = search.toLowerCase();
      return (inv.groupName || "").toLowerCase().includes(term) || (inv.invoiceNo || "").toLowerCase().includes(term);
    });
  }, [invoices, search, showBackups]);

  const totals = useMemo(() => processedInvoices.reduce((acc, curr) => {
    const { total, paid, balance } = getFinancials(curr);
    acc.total += total;
    acc.paid += paid;
    acc.pending += balance;
    return acc;
  }, { total: 0, paid: 0, pending: 0 }), [processedInvoices]);

  const StatusLabel = ({ text, color }) => (
      <span style={{
        padding: "5px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "bold",
        color: "white",
        backgroundColor: color === "success" ? "#4CAF50" : color === "info" ? "#2196F3" : "#FF9800",
      }}>
          {text}
      </span>
  );

  return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>

          {/* HEADER */}
          <MDBox display="flex" justifyContent="space-between" mb={3} bgColor="white" p={2} borderRadius="lg" shadow="sm">
            <MDBox display="flex" alignItems="center">
              <MDTypography variant="button" fontWeight="bold" mr={2}>Active</MDTypography>
              <Switch checked={showBackups} onChange={() => setShowBackups(!showBackups)} color="warning" />
              <MDTypography variant="button" fontWeight="bold" ml={2} color={showBackups ? "error" : "text"}>Backups</MDTypography>
            </MDBox>
            <MDBox width="200px">
              <MDInput label="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </MDBox>
          </MDBox>

          {/* STATS */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}><Card><MDBox p={2} textAlign="center"><MDTypography variant="h6">{formatMoney(totals.total)}</MDTypography><MDTypography variant="caption">Total Revenue</MDTypography></MDBox></Card></Grid>
            <Grid item xs={12} md={4}><Card><MDBox p={2} textAlign="center"><MDTypography variant="h6" color="success">{formatMoney(totals.paid)}</MDTypography><MDTypography variant="caption">Total Collected</MDTypography></MDBox></Card></Grid>
            <Grid item xs={12} md={4}><Card><MDBox p={2} textAlign="center"><MDTypography variant="h6" color="error">{formatMoney(totals.pending)}</MDTypography><MDTypography variant="caption">Total Due</MDTypography></MDBox></Card></Grid>
          </Grid>

          {/* LIST */}
          <Card>
            <MDBox p={3}>
              {processedInvoices.length === 0 && <MDTypography textAlign="center">No invoices found.</MDTypography>}

              {processedInvoices.map((inv) => {
                const { total, paid, balance, status, color } = getFinancials(inv);

                return (
                    <MDBox key={inv.id} mb={2} p={2} sx={{ border: "1px solid #eee", borderRadius: "8px", background: showBackups ? "#fff0f0" : "white" }}>
                      <Grid container alignItems="center">
                        {/* INFO */}
                        <Grid item xs={12} md={4}>
                          <MDTypography variant="button" fontWeight="bold" fontSize="1rem">#{inv.invoiceNo}</MDTypography>
                          <MDTypography variant="caption" display="block" color="text" fontWeight="medium">{inv.groupName}</MDTypography>
                        </Grid>

                        {/* STATUS */}
                        <Grid item xs={6} md={2} textAlign="center">
                          <StatusLabel text={status} color={color} />
                        </Grid>

                        {/* MONEY */}
                        <Grid item xs={6} md={3} textAlign="right" pr={2}>
                          <MDTypography variant="caption" display="block" color="text">Total: {formatMoney(total)}</MDTypography>
                          {paid > 0 && <MDTypography variant="caption" display="block" color="success">Paid: {formatMoney(paid)}</MDTypography>}

                          {balance > 0 ? (
                              <MDTypography variant="button" color="error" fontWeight="bold">Due: {formatMoney(balance)}</MDTypography>
                          ) : (
                              <MDTypography variant="caption" color="success" fontWeight="bold">Fully Paid</MDTypography>
                          )}
                        </Grid>

                        {/* ACTIONS */}
                        <Grid item xs={12} md={3} textAlign="right">
                          {/* 1. Payment (Only if Active & Balance > 0) */}
                          {!showBackups && balance > 0 && (
                              <MDButton variant="text" color="success" onClick={() => handleOpenPayment(inv)} title="Record Payment">
                                <Icon>payment</Icon>
                              </MDButton>
                          )}

                          {/* 2. Download PDF (Always visible) */}
                          <MDButton variant="text" color="info" onClick={() => downloadPdf(inv.id)} title="Download PDF">
                            <Icon>download</Icon>
                          </MDButton>

                          {/* 3. Archive / Restore Toggle */}
                          <MDButton variant="text" color="warning" onClick={() => {
                            if(window.confirm(showBackups ? "Restore this invoice?" : "Move to Archive?")) {
                              const endpoint = showBackups ? "restore" : "archive";
                              fetch(`https://ims-backend-production-e15c.up.railway.app/api/invoices/${inv.id}/${endpoint}`, { method: 'PUT' }).then(fetchInvoices);
                            }
                          }} title={showBackups ? "Restore" : "Archive"}>
                            <Icon>{showBackups ? "restore" : "archive"}</Icon>
                          </MDButton>

                          {/* 4. 🔴 PERMANENT DELETE (LOCKED FOR STAFF) */}
                          {showBackups && role === "admin" && (
                              <MDButton variant="text" color="error" onClick={() => deletePermanently(inv.id)} title="Delete Forever" style={{ marginLeft: '8px' }}>
                                <Icon>delete_forever</Icon>
                              </MDButton>
                          )}
                        </Grid>
                      </Grid>
                    </MDBox>
                );
              })}
            </MDBox>
          </Card>

          {/* PAYMENT MODAL */}
          <Dialog open={openPaymentModal} onClose={() => setOpenPaymentModal(false)} maxWidth="sm" fullWidth>
            <DialogTitle style={{ borderBottom: "1px solid #eee" }}>Record Payment</DialogTitle>
            <DialogContent>
              {selectedInvoice && (() => {
                const { total, paid, balance } = getFinancials(selectedInvoice);
                return (
                    <MDBox pt={2}>
                      <MDBox bgColor="#f8f9fa" p={2} borderRadius="lg" mb={3}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}><MDTypography variant="caption">Customer</MDTypography><MDTypography variant="button" fontWeight="bold" display="block">{selectedInvoice.groupName}</MDTypography></Grid>
                          <Grid item xs={6} textAlign="right"><MDTypography variant="caption">Invoice #</MDTypography><MDTypography variant="button" fontWeight="bold" display="block">{selectedInvoice.invoiceNo}</MDTypography></Grid>
                          <Grid item xs={12}><Divider /></Grid>
                          <Grid item xs={4}><MDTypography variant="caption">Total</MDTypography><MDTypography variant="h6">{formatMoney(total)}</MDTypography></Grid>
                          <Grid item xs={4} textAlign="center"><MDTypography variant="caption" color="success">Paid</MDTypography><MDTypography variant="h6" color="success">{formatMoney(paid)}</MDTypography></Grid>
                          <Grid item xs={4} textAlign="right"><MDTypography variant="caption" color="error">Due</MDTypography><MDTypography variant="h6" color="error">{formatMoney(balance)}</MDTypography></Grid>
                        </Grid>
                      </MDBox>
                      <Grid container spacing={2}>
                        <Grid item xs={12}><MDInput label="Amount (Rs)" type="number" fullWidth value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} /></Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Mode</InputLabel>
                            <Select value={paymentMode} label="Mode" onChange={(e) => setPaymentMode(e.target.value)} style={{ padding: "12px" }}>
                              <MenuItem value="UPI">UPI</MenuItem><MenuItem value="Cash">Cash</MenuItem><MenuItem value="Bank">Bank Transfer</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}><MDInput label="Note / Txn ID" fullWidth value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} /></Grid>
                      </Grid>
                    </MDBox>
                );
              })()}
            </DialogContent>
            <DialogActions style={{ padding: "16px 24px" }}>
              <MDButton onClick={() => setOpenPaymentModal(false)} color="secondary">Cancel</MDButton>
              <MDButton onClick={submitPayment} color="success" variant="gradient">Confirm</MDButton>
            </DialogActions>
          </Dialog>

        </MDBox>
        <Footer />
      </DashboardLayout>
  );
}

export default ManageInvoices;