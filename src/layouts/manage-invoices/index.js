import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";

// Dialog Components (The Pop-up)
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ManageInvoices() {
  const [invoices, setInvoices] = useState([]);

  // --- POP-UP STATE ---
  const [open, setOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: "",
    paymentMode: "UPI",
    transactionId: ""
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/invoices");
      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  // --- 1. OPEN POP-UP ---
  const handleOpenPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amountPaid: invoice.balance, // Auto-fill with remaining balance
      paymentMode: "UPI",
      transactionId: ""
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedInvoice(null);
  };

  // --- 2. SUBMIT PAYMENT ---
  const handleConfirmPayment = async () => {
    if (!paymentForm.transactionId || !paymentForm.amountPaid) {
      alert("Please enter Transaction ID and Amount");
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        paymentMode: paymentForm.paymentMode,
        transactionId: paymentForm.transactionId,
        amountPaid: paymentForm.amountPaid
      });

      const response = await fetch(`https://ims-backend-production-e15c.up.railway.app/api/invoices/${selectedInvoice.id}/confirm-payment?${queryParams}`, {
        method: "PUT"
      });

      if (response.ok) {
        alert("Payment Confirmed! Status Updated.");
        fetchInvoices(); // Refresh the list
        handleClose();
      } else {
        alert("Failed to update payment.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // --- 3. DOWNLOAD PDF ---
  const handleDownload = async (id, invoiceNo) => {
    try {
      const res = await fetch(`https://ims-backend-production-e15c.up.railway.app/api/invoices/${id}/pdf`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Create invisible link to download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("PDF Error:", err);
    }
  };

  // Helper for Status Colors
  const getStatusColor = (status) => {
    if (status === "PAID") return "success";
    if (status === "PARTIAL") return "warning";
    return "error"; // PENDING
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="primary"
                borderRadius="lg"
                coloredShadow="primary"
              >
                <MDTypography variant="h6" color="white">
                  Accounts Receivable (Manage Invoices)
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={2}>

                {invoices.length === 0 ? (
                  <MDTypography variant="caption">No invoices found. Generate one first!</MDTypography>
                ) : (
                  invoices.map((inv) => (
                    <MDBox key={inv.id} display="flex" justifyContent="space-between" alignItems="center" p={2} mb={1} sx={{ borderBottom: "1px solid #f0f2f5" }}>

                      {/* Column 1: Details */}
                      <MDBox>
                        <MDTypography variant="button" fontWeight="bold" display="block">
                          #{inv.invoiceNo} - {inv.serviceDetails}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Date: {inv.dateOfService} | Est ID: {inv.estimatedId}
                        </MDTypography>
                      </MDBox>

                      {/* Column 2: Financials */}
                      <MDBox textAlign="right">
                        <MDTypography variant="button" fontWeight="bold" display="block">
                          Rs. {inv.amountPayable}
                        </MDTypography>
                        <MDTypography variant="caption" color="text" display="block">
                          Paid: {inv.amountPaid} | Bal: {inv.balance}
                        </MDTypography>
                      </MDBox>

                      {/* Column 3: Status Badge */}
                      <MDBox ml={2}>
                        <MDBadge badgeContent={inv.status} color={getStatusColor(inv.status)} container />
                      </MDBox>

                      {/* Column 4: Actions */}
                      <MDBox ml={2} display="flex" gap={1}>
                        {inv.status !== "PAID" && (
                          <MDButton
                            size="small"
                            variant="outlined"
                            color="info"
                            onClick={() => handleOpenPayment(inv)}
                          >
                            Confirm Pay
                          </MDButton>
                        )}

                        <MDButton
                          size="small"
                          variant="text"
                          color="dark"
                          onClick={() => handleDownload(inv.id, inv.invoiceNo)}
                        >
                          <Icon>download</Icon>&nbsp;PDF
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  ))
                )}

              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* --- PAYMENT POP-UP DIALOG --- */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Payment Receipt</DialogTitle>
        <DialogContent>
          <MDTypography variant="caption" mb={2} display="block">
            Enter details for Invoice #{selectedInvoice?.invoiceNo}
          </MDTypography>

          <TextField
            margin="dense"
            label="Amount Received (Rs)"
            type="number"
            fullWidth
            value={paymentForm.amountPaid}
            onChange={(e) => setPaymentForm({...paymentForm, amountPaid: e.target.value})}
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Payment Mode</InputLabel>
            <Select
              value={paymentForm.paymentMode}
              label="Payment Mode"
              onChange={(e) => setPaymentForm({...paymentForm, paymentMode: e.target.value})}
              sx={{ height: "45px" }}
            >
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="NEFT">NEFT / RTGS</MenuItem>
              <MenuItem value="CHEQUE">Cheque</MenuItem>
              <MenuItem value="CASH">Cash</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Transaction / Reference ID"
            type="text"
            fullWidth
            sx={{ mt: 2 }}
            value={paymentForm.transactionId}
            onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">Cancel</Button>
          <Button onClick={handleConfirmPayment} color="success" variant="contained">
            Confirm & Update
          </Button>
        </DialogActions>
      </Dialog>

    </DashboardLayout>
  );
}

export default ManageInvoices;