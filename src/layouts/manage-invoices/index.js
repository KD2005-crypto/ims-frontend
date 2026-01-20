import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ManageInvoices() {
  const [invoices, setInvoices] = useState([]);

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

  const downloadPdf = async (id) => {
    try {
      const res = await fetch(`https://ims-backend-production-e15c.up.railway.app/api/invoices/${id}/pdf`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("PDF Download error:", err);
    }
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
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Accounts Receivable (Manage Invoices)
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={2}>
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <MDBox
                      key={inv.id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      mb={2}
                      sx={{ border: "1px solid #f0f2f5", borderRadius: "8px" }}
                    >
                      <MDBox>
                        <MDTypography variant="button" fontWeight="bold" display="block">
                          Invoice #{inv.invoiceNo} - {inv.serviceDetails}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          {/* UPDATED: Displays Group Name alongside the Client */}
                          Group: {inv.groupName || "N/A"} | Client: {inv.emailId || "General Client"}
                        </MDTypography>
                      </MDBox>

                      <MDBox textAlign="center">
                        <MDTypography variant="button" fontWeight="bold" display="block">
                          Rs. {inv.amount}
                        </MDTypography>
                        <MDTypography variant="caption" color={inv.status === "PAID" ? "success" : "error"}>
                          {inv.status}
                        </MDTypography>
                      </MDBox>

                      <MDBox display="flex" alignItems="center">
                        <MDButton
                          variant="text"
                          color="info"
                          onClick={() => downloadPdf(inv.id)}
                        >
                          <Icon sx={{ mr: 1 }}>download</Icon> PDF
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  ))
                ) : (
                  <MDTypography variant="caption" p={2}>No invoices generated yet.</MDTypography>
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

export default ManageInvoices;