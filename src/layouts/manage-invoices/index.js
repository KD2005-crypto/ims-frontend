import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Mock Data matching the PDF table [cite: 139-148]
const initialRows = [
  { id: 1, invoiceNo: 1134, estimateId: 23, chainId: 2912, company: "Delta Tech", service: "Shaft Maint", total: 5000 },
  { id: 2, invoiceNo: 1135, estimateId: 25, chainId: 3000, company: "Skava", service: "Engine Repair", total: 7500 },
];

function ManageInvoices() {
  const [rows, setRows] = useState(initialRows);
  const [searchTerm, setSearchTerm] = useState("");

  // Search Functionality
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = initialRows.filter(
      (row) =>
        row.invoiceNo.toString().includes(term) ||
        row.chainId.toString().includes(term) ||
        row.company.toLowerCase().includes(term)
    );
    setRows(filtered);
  };

  // Delete Functionality with Warning
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const columns = [
    { Header: "Invoice No", accessor: "invoiceNo", align: "left" },
    { Header: "Est ID", accessor: "estimateId", align: "left" },
    { Header: "Chain ID", accessor: "chainId", align: "center" },
    { Header: "Company", accessor: "company", align: "left" },
    { Header: "Service", accessor: "service", align: "left" },
    { Header: "Total (Rs)", accessor: "total", align: "center" },
    {
      Header: "Action",
      accessor: "action",
      align: "center",
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
          {/* Edit Button (Yellow) [cite: 33] */}
          <MDButton variant="text" color="warning">
            <Icon>edit</Icon>&nbsp;Edit
          </MDButton>
          {/* Delete Button (Red) [cite: 34] */}
          <MDButton variant="text" color="error" onClick={() => handleDelete(row.original.id)}>
            <Icon>delete</Icon>&nbsp;Delete
          </MDButton>
        </MDBox>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <MDTypography variant="h5">Manage Invoices</MDTypography>
                  {/* Search Bar  */}
                  <MDBox width="20rem">
                    <MDInput
                      placeholder="Search Invoice No, Chain ID..."
                      fullWidth
                      value={searchTerm}
                      onChange={handleSearch}
                      icon={{ component: "search", direction: "left" }}
                    />
                  </MDBox>
                </MDBox>

                <DataTable
                  table={{ columns, rows }}
                  showTotalEntries={false}
                  isSorted={false}
                  noEndBorder
                  entriesPerPage={false}
                />
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