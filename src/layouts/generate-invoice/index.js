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
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/estimates");
      const data = await response.json();
      console.log("Loaded Estimates:", data); // DEBUG: Check console to see if estimates loaded
      setEstimates(data);
    } catch (err) {
      console.error("Error loading estimates:", err);
    }
  };

  // 2. Handle Estimate Selection
  const handleEstimateSelect = (estId) => {
    setSelectedEstimateId(estId);

    const selectedEst = estimates.find(e => e.estimatedId === estId);

    if (selectedEst) {
      // Smart Data Mapping (Handles different variable names)
      const qty = selectedEst.qty || selectedEst.quantity || 1;
      const cost = selectedEst.costPerUnit || selectedEst.cost || 0;
      const total = selectedEst.totalCost || (qty * cost); // Fallback calculation

      setInvoiceData({
        ...invoiceData,
        serviceDetails: selectedEst.service || "Service",
        quantity: qty,
        costPerQty: cost,
        amountPayable: total,
        amountPaid: 0,
        balance: total
      });
    }
  };

  // 3. Handle Manual Input Changes (Unlocks the form)
  const handleChange = (field, value) => {
    setInvoiceData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-Recalculate Totals if Quantity or Cost changes
      if (field === 'quantity' || field === 'costPerQty') {
        const qty = parseFloat(newData.quantity) || 0;
        const cost = parseFloat(newData.costPerQty) || 0;
        newData.amountPayable = qty * cost;
        newData.balance = newData.amountPayable - (parseFloat(newData.amountPaid) || 0);
      }

      // Auto-Update Balance if Payment changes
      if (field === 'amountPaid') {
        const payable = parseFloat(newData.amountPayable) || 0;
        const paid = parseFloat(value) || 0;
        newData.balance = payable - paid;
      }

      return newData;
    });
  };

  // 4. GENERATE INVOICE (With Crash Protection)
  const handleGenerate = async () => {
    // CRASH FIX: Convert empty string "" to null
    const safeEstimateId = selectedEstimateId === "" ? null : selectedEstimateId;

    const payload = {
      estimatedId: safeEstimateId,
      serviceDetails: invoiceData.serviceDetails || "General Service",
      quantity: parseInt(invoiceData.quantity) || 1,
      costPerQty: parseFloat(invoiceData.costPerQty) || 0,
      amount: parseFloat(invoiceData.amountPayable) || 0,
      amountPaid: parseFloat(invoiceData.amountPaid) || 0,
      emailId: invoiceData.emailId || "client@email.com"
    };

    console.log("Sending Payload:", payload); // DEBUG: Check this in Console!

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
          text: 'PDF Download Starting...',
          timer: 2000,
          showConfirmButton: false
        });

        downloadPdf(invoice.id);
      } else {
        const errorText = await response.text();
        console.error("Backend Error:", errorText);
        Swal.fire({ icon: 'error', title: 'Failed', text: 'Backend rejected the data. Check Console.' });
      }
    } catch (error) {
      console.error("Network Error:", error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Network Connection Failed.' });
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
                  Generate Invoice
                </MDTypography>
              </MDBox>
              <MDBox p={3}>

                {/* STEP 1: Select Estimate */}
                <MDBox mb={3}>
                  <FormControl fullWidth>
                    <InputLabel>Select Estimate (Optional)</InputLabel>
                    <Select
                      value={selectedEstimateId}
                      label="Select Estimate (Optional)"
                      onChange={(e) => handleEstimateSelect(e.target.value)}
                      sx={{ height: "45px" }}
                    >
                      <MenuItem value=""><em>None (Create Manual Invoice)</em></MenuItem>
                      {estimates.map((est) => (
                        <MenuItem key={est.estimatedId} value={est.estimatedId}>
                          {est.chain ? est.chain.chainName : "Client"} - {est.service} (Rs. {est.totalCost})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </MDBox>

                {/* STEP 2: Edit Details (Now Unlocked!) */}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <MDTypography variant="button" fontWeight="bold">Invoice Details</MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      label="Service" fullWidth
                      value={invoiceData.serviceDetails}
                      onChange={(e) => handleChange('serviceDetails', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <MDInput
                      type="number" label="Qty" fullWidth
                      value={invoiceData.quantity}
                      onChange={(e) => handleChange('quantity', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <MDInput
                      type="number" label="Cost/Unit" fullWidth
                      value={invoiceData.costPerQty}
                      onChange={(e) => handleChange('costPerQty', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      label="Total Payable" fullWidth
                      value={invoiceData.amountPayable}
                      disabled // Auto-calculated
                    />
                  </Grid>

                  {/* STEP 3: Enter Payment */}
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="number" label="Amount Paid Now" fullWidth
                      value={invoiceData.amountPaid}
                      onChange={(e) => handleChange('amountPaid', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      label="Balance" fullWidth
                      value={invoiceData.balance}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      label="Client Email" fullWidth
                      value={invoiceData.emailId}
                      onChange={(e) => handleChange('emailId', e.target.value)}
                    />
                  </Grid>

                  {/* STEP 4: Generate */}
                  <Grid item xs={12} mt={3}>
                    <MDButton variant="gradient" color="success" fullWidth onClick={handleGenerate}>
                      Generate Invoice & Download PDF
                    </MDButton>
                  </Grid>
                </Grid>

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