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
  // ✅ 1. ROLE CHECK
  const rawRole = localStorage.getItem("role");
  const role = (rawRole || "").toLowerCase().trim();

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

  // --- MATH LOGIC ---
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
      alert("Payment Recorded Successfully!");

    } catch (err) {
      alert("Network Error: Could not save payment.");
    }
  };

  const deletePermanently = async (id) => {
    if(!window.confirm("⚠️ PERMANENT DELETE: This cannot be undone. Are you sure?")) return;
    try {
      await fetch(`https://ims-backend-production-e15c.up.railway.app/api/invoices/${id}`, { method: 'DELETE' });
      fetchInvoices();
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

  // --- ✅ FIXED FILTER LOGIC ---
  const processedInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const isArchived = !!inv.archived;
      if (showBackups && !isArchived) return false;
      if (!showBackups && isArchived) return false;

      const term = search.toLowerCase();

      // ✅ FIX: Force conversion to string to prevent ".toLowerCase is not a function" error
      const groupName = String(inv.groupName || "").toLowerCase();
      const invoiceNo = String(inv.invoiceNo || "").toLowerCase();
      const clientName = String(inv.clientName || "").toLowerCase();

      return groupName.includes(term) || invoiceNo.includes(term) || clientName.includes(term);
    });
  }, [invoices, search, showBackups]);

  const totals = useMemo(() => processedInvoices.reduce((acc, curr) => {
    const { total, paid, balance } = getFinancials(curr);
    acc.total += total;
    acc.paid += paid;
    acc.pending += balance;
    return acc;
  }, { total: 0, paid: 0, pending: 0 }), [processedInvoices]);

  const archivedGrandTotal = useMemo(() => invoices
      .filter(inv => inv.archived)
      .reduce((sum, inv) => sum + getFinancials(inv).total, 0),
    [invoices]);

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

  const cardGridSize = showBackups ? 3 : 4;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>

        {/* HEADER */}
        <MDBox display="flex" justifyContent="space-between" mb={3} bgColor="white" p={2} borderRadius="lg" shadow="sm">
          {role === "admin" ? (
            <MDBox display="flex" alignItems="center">
              <MDTypography variant="button" fontWeight="bold" mr={2}>Active</MDTypography>
              <Switch checked={showBackups} onChange={() => setShowBackups(!showBackups)} color="warning" />
              <MDTypography variant="button" fontWeight="bold" ml={2} color={showBackups ? "error" : "text"}>Backups</MDTypography>
            </MDBox>
          ) : (
            <MDTypography variant="h6" ml={2}>Active Invoices</MDTypography>
          )}

          <MDBox width="200px">
            <MDInput
              label="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              // Added clear icon for better UI
              InputProps={{
                endAdornment: search && (
                  <Icon sx={{ cursor: "pointer" }} onClick={() => setSearch("")}>close</Icon>
                ),
              }}
            />
          </MDBox>
        </MDBox>

        {/* STATS CARDS */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={cardGridSize}><Card><MDBox p={2} textAlign="center"><MDTypography variant="h6">{formatMoney(totals.total)}</MDTypography><MDTypography variant="caption">{showBackups ? "Backup Revenue" : "Total Revenue"}</MDTypography></MDBox></Card></Grid>
          <Grid item xs={12} md={cardGridSize}><Card><MDBox p={2} textAlign="center"><MDTypography variant="h6" color="success">{formatMoney(totals.paid)}</MDTypography><MDTypography variant="caption">Total Collected</MDTypography></MDBox></Card></Grid>
          <Grid item xs={12} md={cardGridSize}><Card><MDBox p={2} textAlign="center"><MDTypography variant="h6" color="error">{formatMoney(totals.pending)}</MDTypography><MDTypography variant="caption">Total Due</MDTypography></MDBox></Card></Grid>

          {showBackups && (
            <Grid item xs={12} md={3}>
              <Card sx={{ border: "1px solid #ffcdd2", backgroundColor: "#ffebee" }}>
                <MDBox p={2} textAlign="center">
                  <MDTypography variant="h6" color="error">
                    {formatMoney(archivedGrandTotal)}
                  </MDTypography>
                  <MDTypography variant="caption" color="error" fontWeight="bold">
                    Total Archived Value
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* LIST */}
        <Card>
          <MDBox p={3}>
            {processedInvoices.length === 0 ? (
              <MDTypography textAlign="center" py={3}>No invoices found matching your criteria.</MDTypography>
            ) : (
              processedInvoices.map((inv) => {
                const { total, paid, balance, status, color } = getFinancials(inv);

                return (
                  <MDBox key={inv.id} mb={2} p={2} sx={{ border: "1px solid #eee", borderRadius: "8px", background: showBackups ? "#fff0f0" : "white" }}>
                    <Grid container alignItems="center">
                      <Grid item xs={12} md={4}>
                        <MDTypography variant="button" fontWeight="bold" fontSize="1rem">#{inv.invoiceNo}</MDTypography>
                        <MDTypography variant="caption" display="block" color="text" fontWeight="medium">{inv.groupName}</MDTypography>
                      </Grid>

                      <Grid item xs={6} md={2} textAlign="center">
                        <StatusLabel text={status} color={color} />
                      </Grid>

                      <Grid item xs={6} md={3} textAlign="right" pr={2}>
                        <MDTypography variant="caption" display="block" color="text">Total: {formatMoney(total)}</MDTypography>
                        {balance > 0 ? (
                          <MDTypography variant="button" color="error" fontWeight="bold">Due: {formatMoney(balance)}</MDTypography>
                        ) : (
                          <MDTypography variant="caption" color="success" fontWeight="bold">Fully Paid</MDTypography>
                        )}
                      </Grid>

                      <Grid item xs={12} md={3} textAlign="right">
                        {!showBackups && balance > 0 && (
                          <MDButton variant="text" color="success" onClick={() => handleOpenPayment(inv)} title="Record Payment">
                            <Icon>payment</Icon>
                          </MDButton>
                        )}

                        <MDButton variant="text" color="info" onClick={() => downloadPdf(inv.id)} title="Download PDF">
                          <Icon>download</Icon>
                        </MDButton>

                        <MDButton variant="text" color="warning" onClick={() => {
                          if(window.confirm(showBackups ? "Restore this invoice?" : "Archive this invoice?")) {
                            const endpoint = showBackups ? "restore" : "archive";
                            fetch(`https://ims-backend-production-e15c.up.railway.app/api/invoices/${inv.id}/${endpoint}`, { method: 'PUT' }).then(fetchInvoices);
                          }
                        }} title={showBackups ? "Restore" : "Archive"}>
                          <Icon>{showBackups ? "restore" : "archive"}</Icon>
                        </MDButton>

                        {showBackups && role === "admin" && (
                          <MDButton
                            variant="text"
                            color="error"
                            onClick={() => deletePermanently(inv.id)}
                            title="Delete Forever"
                            sx={{ marginLeft: '8px' }}
                          >
                            <Icon>delete_forever</Icon>
                          </MDButton>
                        )}
                      </Grid>
                    </Grid>
                  </MDBox>
                );
              })
            )}
          </MDBox>
        </Card>

        {/* PAYMENT MODAL */}
        <Dialog open={openPaymentModal} onClose={() => setOpenPaymentModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogContent>
            <MDBox pt={2}>
              <MDInput label="Amount" type="number" fullWidth value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
              <br /><br />
              <FormControl fullWidth>
                <InputLabel>Mode</InputLabel>
                <Select value={paymentMode} label="Mode" onChange={(e) => setPaymentMode(e.target.value)} sx={{ height: 45 }}>
                  <MenuItem value="UPI">UPI</MenuItem><MenuItem value="Cash">Cash</MenuItem><MenuItem value="Bank">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
              <br /><br />
              <MDInput label="Note / Txn ID" fullWidth value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} />
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setOpenPaymentModal(false)} color="secondary">Cancel</MDButton>
            <MDButton onClick={submitPayment} color="success">Confirm</MDButton>
          </DialogActions>
        </Dialog>

      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ManageInvoices;