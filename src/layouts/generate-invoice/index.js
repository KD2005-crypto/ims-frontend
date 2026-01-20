import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
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

// SweetAlert for Success
import Swal from "sweetalert2";

function GenerateInvoice() {
  // --- STATE ---
  const [estimates, setEstimates] = useState([]);
  const [selectedEstimateId, setSelectedEstimateId] = useState("");

  // Invoice Data
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

  // 1. Load Estimates on Start
  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async () => {
    try {
      console.log("Fetching Estimates...");
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/estimates");
      const data = await response.json();
      console.log("Loaded Estimates:", data); // Check Console to see your data!
      setEstimates(data);
    } catch (err) {
      console.error("Error loading estimates:", err);
    }
  };

  // 2. Handle Estimate Selection (THE UNIVERSAL FIX)
  const handleEstimateSelect = (estId) => {
    setSelectedEstimateId(estId);

    // Find the full estimate object
    const selectedEst = estimates.find(e => e.estimatedId === estId);

    if (selectedEst) {
      console.log("Selected Estimate:", selectedEst);

      // --- SMART ADAPTER: Checks all possible names ---
      const qty = selectedEst.qty || selectedEst.quantity || 1;
      const cost = selectedEst.costPerUnit || selectedEst.cost || selectedEst.rate || 0;
      const service = selectedEst.service || selectedEst.serviceDetails || "Service";

      // Calculate Total safely
      // If backend sends 'totalCost', use it. Otherwise, calculate manually (Qty * Cost) + GST
      let total = selectedEst.totalCost;
      if (!total) {
        const gst = selectedEst.gstRate || 0;
        const baseAmount = qty * cost;
        const gstAmount = baseAmount * (gst / 100);
        total = baseAmount + gstAmount;
      }

      setInvoiceData({
        ...invoiceData,
        serviceDetails: service,
        quantity: qty,
        costPerQty: cost,
        amountPayable: parseFloat(total.toFixed(2)), // Round to 2 decimals
        amountPaid: 0,
        balance: parseFloat(total.toFixed(2))
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
      balance: (payable - paid).toFixed(2)
    });
  };

  // 4. GENERATE INVOICE
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
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const invoice = await response.json();

        Swal.fire({
          icon: 'success',
          title: 'Invoice Generated!',
          text: 'Downloading PDF...',
          timer: 2000,
          showConfirmButton: false
        });

        downloadPdf(invoice.id);

      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create invoice.' });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const downloadPdf = async (id) => {
    try {
      const res = await fetch(`https://ims-backend-production-e15c.up.railway.app/api/invoices/${id}/pdf`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

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
                          {est.chain ? est.chain.chainName : "Client"} - {est.service} (Rs. {est.totalCost || (est.qty * est.costPerUnit)})
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