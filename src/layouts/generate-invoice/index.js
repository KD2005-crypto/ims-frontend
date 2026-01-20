import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function GenerateInvoice() {
  // --- STATE ---
  const [estimates, setEstimates] = useState([]);
  const [selectedEstimateId, setSelectedEstimateId] = useState("");

  // Invoice Data (Auto-filled from Estimate)
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: "",
    serviceDetails: "",
    quantity: 0,
    costPerQty: 0,
    amountPayable: 0,
    amountPaid: 0,
    balance: 0,
    emailId: "",
  });

  const [pdfUrl, setPdfUrl] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // 1. Load Estimates on Start (FIXED URL)
  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async () => {
    try {
      // ADDED HTTPS HERE
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/estimates");
      const data = await response.json();
      setEstimates(data);
    } catch (err) {
      console.error("Error loading estimates:", err);
    }
  };

  // 2. Handle Estimate Selection (AUTO-FILL)
  const handleEstimateSelect = (estId) => {
    setSelectedEstimateId(estId);

    // Find the full estimate object
    const selectedEst = estimates.find(e => e.estimatedId === estId);

    if (selectedEst) {
      setInvoiceData({
        ...invoiceData,
        serviceDetails: selectedEst.service,
        quantity: selectedEst.qty,
        costPerQty: selectedEst.costPerUnit,
        amountPayable: selectedEst.totalCost, // Includes GST!
        // Reset payment fields
        amountPaid: 0,
        balance: selectedEst.totalCost
      });
    }
  };

  // 3. Handle Payment Input (Auto-Calc Balance)
  const handlePaymentChange = (amountPaid) => {
    const paid = parseFloat(amountPaid) || 0;
    const payable = invoiceData.amountPayable;

    setInvoiceData({
      ...invoiceData,
      amountPaid: paid,
      balance: payable - paid
    });
  };

  // 4. GENERATE INVOICE (FIXED URL)
  const handleGenerate = async () => {
    const payload = {
      estimatedId: selectedEstimateId,
      serviceDetails: invoiceData.serviceDetails,
      quantity: invoiceData.quantity,
      costPerQty: invoiceData.costPerQty,
      amount: invoiceData.amountPayable,
      amountPaid: invoiceData.amountPaid,
      emailId: invoiceData.emailId
    };

    try {
      // ADDED HTTPS HERE
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const invoice = await response.json();
        // Trigger PDF Download
        downloadPdf(invoice.id);
        setShowSuccess(true);
      } else {
        alert("Failed to create invoice");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const downloadPdf = async (id) => {
    try {
      // ADDED HTTPS HERE
      const res = await fetch(`https://ims-backend-production-e15c.up.railway.app/api/invoices/${id}/pdf`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);

      // Auto Click to Download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Invoice.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("PDF Error:", err);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Generate Invoice from Estimate
                </MDTypography>
              </MDBox>
              <MDBox p={3}>

                {/* STEP 1: Select Estimate */}
                <MDBox mb={3}>
                  <FormControl fullWidth>
                    <InputLabel>Select Pending Estimate</InputLabel>
                    <Select
                      value={selectedEstimateId}
                      label="Select Pending Estimate"
                      onChange={(e) => handleEstimateSelect(e.target.value)}
                      sx={{ height: "45px" }}
                    >
                      {estimates.map((est) => (
                        <MenuItem key={est.estimatedId} value={est.estimatedId}>
                          {est.chain.chainName} - {est.service} (Rs. {est.totalCost})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </MDBox>

                {/* STEP 2: Verify Details (Read Only) */}
                {selectedEstimateId && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <MDTypography variant="button" fontWeight="bold">Invoice Details</MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDInput label="Service" fullWidth value={invoiceData.serviceDetails} disabled />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <MDInput label="Qty" fullWidth value={invoiceData.quantity} disabled />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <MDInput label="Total Payable (Inc. GST)" fullWidth value={invoiceData.amountPayable} disabled />
                    </Grid>

                    {/* STEP 3: Enter Payment */}
                    <Grid item xs={12} mt={2}>
                      <MDTypography variant="button" fontWeight="bold">Payment Status</MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="number"
                        label="Amount Paid Now"
                        fullWidth
                        value={invoiceData.amountPaid}
                        onChange={(e) => handlePaymentChange(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        label="Balance Remaining"
                        fullWidth
                        value={invoiceData.balance}
                        disabled
                        error={invoiceData.balance > 0}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDInput
                        label="Client Email (for record)"
                        fullWidth
                        value={invoiceData.emailId}
                        onChange={(e) => setInvoiceData({...invoiceData, emailId: e.target.value})}
                      />
                    </Grid>

                    {/* STEP 4: Generate */}
                    <Grid item xs={12} mt={3}>
                      <MDButton variant="gradient" color="success" fullWidth onClick={handleGenerate}>
                        Generate Invoice & Download PDF
                      </MDButton>
                    </Grid>
                  </Grid>
                )}

                {/* Success Message */}
                {showSuccess && (
                  <MDBox mt={3} textAlign="center">
                    <MDTypography variant="h5" color="success" fontWeight="medium">
                      Invoice Generated Successfully!
                    </MDTypography>
                  </MDBox>
                )}

              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default GenerateInvoice;