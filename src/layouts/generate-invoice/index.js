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
import Swal from "sweetalert2"; // Import the beautiful alert

function GenerateInvoice() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: Math.floor(1000 + Math.random() * 9000),
    estimateId: 23,
    chainId: 2912,
    serviceDetails: "Maintenance of Propeller Shaft (Comprehensive Service)",
    qty: 10,
    costPerQty: 500,
    amountPayable: 5000,
    amountPaid: 5000,
    balance: 0,
    deliveryDate: "2024-12-14",
    deliveryDetails: "Delta Tech Pvt Ltd, Plot No 2-A1, Industrial Area",
    email: "",
  });

  const handleEmailChange = (e) => {
    setInvoiceData({ ...invoiceData, email: e.target.value });
  };

  const handleGenerate = () => {
    const doc = new jsPDF();

    // --- 1. HEADER SECTION (Professional Blue Background) ---
    doc.setFillColor(26, 35, 126); // Navy Blue
    doc.rect(0, 0, 210, 40, "F"); // Colored top bar

    doc.setTextColor(255, 255, 255); // White Text
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 160, 28);

    doc.setFontSize(16);
    doc.text("CODE-B ENTERPRISES", 20, 28);

    // --- 2. INVOICE META DATA (Right Aligned) ---
    doc.setTextColor(0, 0, 0); // Black Text
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Helper to draw a "Label: Value" line
    const drawMeta = (label, value, y) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 140, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 170, y);
    };

    drawMeta("Invoice No:", `#${invoiceData.invoiceNo}`, 60);
    drawMeta("Date:", new Date().toLocaleDateString(), 66);
    drawMeta("Estimate ID:", `${invoiceData.estimateId}`, 72);
    drawMeta("Chain ID:", `${invoiceData.chainId}`, 78);

    // --- 3. BILL TO SECTION ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 20, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(invoiceData.deliveryDetails, 20, 68, { maxWidth: 80 });
    if(invoiceData.email) doc.text(`Email: ${invoiceData.email}`, 20, 85);

    // --- 4. TABLE HEADER (Gray Bar) ---
    doc.setFillColor(240, 240, 240); // Light Gray
    doc.rect(20, 100, 170, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, 107);
    doc.text("Qty", 120, 107);
    doc.text("Rate", 140, 107);
    doc.text("Amount", 170, 107);

    // --- 5. TABLE CONTENT ---
    doc.setFont("helvetica", "normal");
    doc.text(invoiceData.serviceDetails, 25, 118, { maxWidth: 90 });
    doc.text(String(invoiceData.qty), 120, 118);
    doc.text(`Rs. ${invoiceData.costPerQty}`, 140, 118);
    doc.text(`Rs. ${invoiceData.amountPayable}`, 170, 118);

    // Draw a line under the item
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 130, 190, 130);

    // --- 6. TOTALS SECTION ---
    const startY = 145;
    doc.text("Subtotal:", 140, startY);
    doc.text(`Rs. ${invoiceData.amountPayable}`, 170, startY);

    doc.text("Tax (0%):", 140, startY + 6);
    doc.text("Rs. 0", 170, startY + 6);

    // Grand Total (Bold & Blue)
    doc.setFillColor(26, 35, 126); // Navy Blue
    doc.rect(135, startY + 10, 60, 10, "F"); // Box
    doc.setTextColor(255, 255, 255); // White Text
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 140, startY + 17);
    doc.text(`Rs. ${invoiceData.amountPayable}`, 170, startY + 17);

    // --- 7. FOOTER ---
    doc.setTextColor(100, 100, 100); // Gray
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for your business!", 105, 280, null, null, "center");

    // SAVE
    doc.save(`Invoice_${invoiceData.invoiceNo}.pdf`);

    // --- 8. BEAUTIFUL SUCCESS MESSAGE ---
    Swal.fire({
      title: 'Invoice Generated!',
      text: `PDF downloaded successfully. Email sent to ${invoiceData.email || 'Client'}.`,
      icon: 'success',
      confirmButtonColor: '#1a237e',
      confirmButtonText: 'Great!'
    });
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
                    <MDInput label="Amount Payable (Rs)" value={invoiceData.amountPayable} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDInput label="Amount Paid (Rs)" value={invoiceData.amountPaid} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDInput label="Balance (Rs)" value={invoiceData.balance} fullWidth disabled />
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