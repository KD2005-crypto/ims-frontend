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
  const [invoice, setInvoice] = useState({ client: "", amount: "", desc: "" });

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("CODE-B IMS INVOICE", 20, 20);
    doc.setFontSize(12);
    doc.text(`Client: ${invoice.client}`, 20, 40);
    doc.text(`Amount: INR ${invoice.amount}`, 20, 50);
    doc.text(`Description: ${invoice.desc}`, 20, 60);
    doc.save(`Invoice_${invoice.client}.pdf`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
            <Card><MDBox p={3}>
              <MDTypography variant="h5">Generate Invoice</MDTypography>
              <MDBox mt={3}>
                <MDInput label="Client Name" fullWidth onChange={(e) => setInvoice({...invoice, client: e.target.value})} />
                <MDBox mt={2}><MDInput label="Amount" fullWidth onChange={(e) => setInvoice({...invoice, amount: e.target.value})} /></MDBox>
                <MDBox mt={2}><MDInput label="Description" multiline rows={4} fullWidth onChange={(e) => setInvoice({...invoice, desc: e.target.value})} /></MDBox>
                <MDBox mt={3}><MDButton variant="gradient" color="info" fullWidth onClick={downloadPDF}>Download PDF</MDButton></MDBox>
              </MDBox>
            </MDBox></Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
export default GenerateInvoice;