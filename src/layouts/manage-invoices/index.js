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

// SweetAlert for beautiful popups
import Swal from "sweetalert2";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ManageInvoices() {
  const [invoices, setInvoices] = useState([]);

  // --- POP-UP STATE ---
  const [open, setOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // New Form Structure
  const [paymentForm, setPaymentForm] = useState({
    payingNow: "", // The new money entering
    paymentMode: "UPI",
    transactionId: ""
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // Ensure https is present
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
      payingNow: "", // Start empty so user types fresh amount
      paymentMode: "UPI",
      transactionId: ""
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedInvoice(null);
  };

  // --- 2. SUBMIT PAYMENT (Updated) ---
  const handleConfirmPayment = async () => {
    if (!paymentForm.transactionId || !paymentForm.payingNow) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Details',
        text: 'Please enter both Amount and Transaction ID!',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        paymentMode: paymentForm.paymentMode,
        transactionId: paymentForm.transactionId,
        amountPaid: paymentForm.payingNow // Send the NEW amount
      });

      const response = await fetch(`https://ims-backend-production-e15c.up.railway.app/api/invoices/${selectedInvoice.id}/confirm-payment?${queryParams}`, {
        method: "PUT"
      });

      if (response.ok) {
        // BEAUTIFUL SUCCESS ALERT
        Swal.fire({
          icon: 'success',
          title: 'Payment Recorded!',
          text: `Successfully added Rs. ${paymentForm.payingNow} via ${paymentForm.paymentMode}`,
          confirmButtonColor: '#4caf50', // Green button
        });

        fetchInvoices(); // Refresh the list
        handleClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong on the server.',
        });
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

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("PDF Error:", err);
    }
  };

  const getStatusColor = (status) => {
    if (status === "PAID") return "success";
    if (status === "PARTIAL") return "warning";
    return "error";
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

                      <MDBox>
                        <MDTypography variant="button" fontWeight="bold" display="block">
                          #{inv.invoiceNo} - {inv.serviceDetails}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Chain ID: {inv.chainId} | Est ID: {inv.estimatedId}
                        </MDTypography>
                      </MDBox>

                      <MDBox textAlign="right">
                        <MDTypography variant="button" fontWeight="bold" display="block">
                          Rs. {inv.amountPayable}
                        </MDTypography>
                        <MDTypography variant="caption" color="text" display="block">
                          Paid: {inv.amountPaid} | Bal: {inv.balance}
                        </MDTypography>
                      </MDBox>

                      <MDBox ml={2}>
                        <MDBadge badgeContent={inv.status} color={getStatusColor(inv.status)} container />
                      </MDBox>

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

      {/* --- IMPROVED POP-UP DIALOG --- */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#1a73e8' }}>
          Confirm Payment Receipt
        </DialogTitle>
        <DialogContent>
          <MDTypography variant="caption" mb={2} display="block" textAlign="center">
            Record a new payment for Invoice #{selectedInvoice?.invoiceNo}
          </MDTypography>

          <MDBox component="form" role="form" mt={2}>

            {/* 1. READ ONLY: Balance Due */}
            <TextField
              margin="dense"
              label="Current Balance Due (Read-Only)"
              type="number"
              fullWidth
              variant="filled" // Different style to show it's disabled
              value={selectedInvoice?.balance || 0}
              disabled // User cannot change this
              sx={{ mb: 2, backgroundColor: '#f0f2f5' }}
            />

            {/* 2. INPUT: Amount Paying Now */}
            <TextField
              autoFocus
              margin="dense"
              label="Enter Amount Paying Now"
              type="number"
              fullWidth
              value={paymentForm.payingNow}
              onChange={(e) => setPaymentForm({...paymentForm, payingNow: e.target.value})}
              placeholder="e.g. 5000"
              sx={{ mb: 2 }}
            />

            {/* 3. INPUT: Payment Mode */}
            <FormControl fullWidth sx={{ mb: 2 }}>
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

            {/* 4. INPUT: Transaction ID */}
            <TextField
              margin="dense"
              label="Transaction / Reference ID"
              type="text"
              fullWidth
              value={paymentForm.transactionId}
              onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
            />
          </MDBox>

        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={handleClose} color="error" variant="outlined" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmPayment} color="success" variant="contained">
            Confirm & Update
          </Button>
        </DialogActions>
      </Dialog>

    </DashboardLayout>
  );
}

export default ManageInvoices;