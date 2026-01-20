import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { jsPDF } from "jspdf";

function GenerateInvoice() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: Math.floor(1000 + Math.random() * 9000),
    estimateId: 23,
    chainId: 2912,
    serviceDetails: "Maintenance of Propeller Shaft",
    qty: 10,
    costPerQty: 500,
    amountPayable: 5000,
    amountPaid: 5000,
    balance: 0,
    deliveryDate: "2024-12-14",
    deliveryDetails: "Delta Tech Pvt Ltd, 2-A1",
    email: "",
  });

  const handleEmailChange = (e) => {
    setInvoiceData({ ...invoiceData, email: e.target.value });
  };

  const handleGenerate = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("INVOICE", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text(`Invoice No: ${invoiceData.invoiceNo}`, 20, 40);
    doc.text(`Estimate ID: ${invoiceData.estimateId}`, 120, 40);
    doc.text(`Service: ${invoiceData.serviceDetails}`, 20, 50);
    doc.text(`Total Amount: INR ${invoiceData.amountPayable}`, 20, 80);
    doc.save(`Invoice_${invoiceData.invoiceNo}.pdf`);
    alert(`Invoice Generated! Email sent to: ${invoiceData.email}`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={10}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" mb={3}>
                  Create Invoice Section
                </MDTypography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <MDInput label="Invoice No" value={invoiceData.invoiceNo} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDInput label="Estimate ID" value={invoiceData.estimateId} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDInput label="Chain ID" value={invoiceData.chainId} fullWidth disabled />
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <MDInput label="Service Provided" value={invoiceData.serviceDetails} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDInput label="Quantity" value={invoiceData.qty} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDInput label="Cost/Qty" value={invoiceData.costPerQty} fullWidth disabled />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <MDInput label="Amount Payable" value={invoiceData.amountPayable} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDInput label="Amount Paid" value={invoiceData.amountPaid} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDInput label="Balance" value={invoiceData.balance} fullWidth disabled />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <MDInput label="Delivery Date" value={invoiceData.deliveryDate} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDInput label="Details" value={invoiceData.deliveryDetails} multiline rows={3} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDInput label="Enter Email ID" value={invoiceData.email} onChange={handleEmailChange} fullWidth placeholder="client@email.com"/>
                  </Grid>

                  <Grid item xs={12}>
                    <MDButton variant="gradient" color="info" fullWidth onClick={handleGenerate}>
                      Generate Invoice
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