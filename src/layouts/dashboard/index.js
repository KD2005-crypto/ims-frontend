import { useState, useEffect, useMemo } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Charts
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";

// Cards
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({ locations: 0, brands: 0 });

  useEffect(() => {
    // 1. Fetch Stats (Locations/Brands)
    fetch("https://ims-backend-production-e15c.up.railway.app/api/dashboard")
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data === 'object') {
            setDashboardStats({
              locations: data.totalLocations || 0,
              brands: data.totalBrands || 0
            });
          }
        })
        .catch(console.error);

    // 2. Fetch Invoices
    fetch("https://ims-backend-production-e15c.up.railway.app/api/invoices")
        .then((res) => res.json())
        .then((data) => {
          setInvoices(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("Dashboard Fetch Error:", err);
          setInvoices([]);
        });
  }, []);

  // --- SMART ANALYTICS LOGIC ---
  const { stats, chartData, recentInvoices, pendingInvoices } = useMemo(() => {

    // Helper to safely parse numbers
    const getVal = (val) => parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;

    const active = invoices.filter(inv => inv.archived !== true);

    let totalRevenue = 0;   // Gross Value of all invoices
    let totalCollected = 0; // Cash in hand
    let totalPending = 0;   // Outstanding Due
    let pendingCount = 0;

    const monthlyData = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    active.forEach(inv => {
      // 1. Get Totals
      const totalAmount = getVal(inv.grandTotal || inv.total || inv.amount || inv.totalAmount || inv.amountPayable);

      // 2. Get Paid
      let paidAmount = getVal(inv.amountPaid || inv.received);

      // Legacy fallback: If status is PAID but amountPaid is 0, assume full amount
      if (paidAmount === 0 && inv.status === "PAID") {
        paidAmount = totalAmount;
      }

      // 3. Calculate Due
      let dueAmount = totalAmount - paidAmount;
      if (dueAmount < 0) dueAmount = 0;

      // 4. Update Aggregates
      totalRevenue += totalAmount;
      totalCollected += paidAmount;
      totalPending += dueAmount;

      if (dueAmount > 0) pendingCount++;

      // 5. Chart Data (Monthly Revenue Generated)
      const dateStr = inv.date || inv.dateOfService || inv.createdAt || new Date();
      const d = new Date(dateStr);
      if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
        monthlyData[d.getMonth()] += totalAmount;
      }
    });

    // Sort Recent (Newest First)
    const recent = [...active]
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 5);

    // Sort Pending (Highest Due Amount First)
    const pendingList = active
        .map(inv => {
          const total = getVal(inv.grandTotal || inv.total || inv.amount || inv.totalAmount || inv.amountPayable);
          const paid = getVal(inv.amountPaid || inv.received);
          const due = total - paid;
          return { ...inv, due: due > 0 ? due : 0 };
        })
        .filter(inv => inv.due > 0) // Only show ones with money owing
        .sort((a, b) => b.due - a.due)
        .slice(0, 5);

    return {
      stats: { totalRevenue, totalCollected, totalPending, count: active.length, pendingCount },
      chartData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{ label: "Sales", data: monthlyData }]
      },
      recentInvoices: recent,
      pendingInvoices: pendingList
    };
  }, [invoices]);

  const formatMoney = (amount) => "Rs. " + Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
      <DashboardLayout>
        <DashboardNavbar />

        <MDBox py={3}>
          {/* STATS CARDS */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                    color="dark"
                    icon="account_balance_wallet"
                    title="Total Revenue"
                    count={formatMoney(stats.totalRevenue)}
                    percentage={{ color: "text", amount: "", label: "gross value" }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                    color="success"
                    icon="check_circle"
                    title="Total Collected"
                    count={formatMoney(stats.totalCollected)}
                    percentage={{ color: "success", amount: "", label: "cash received" }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                    color="primary"
                    icon="store"
                    title="Active Stores"
                    count={dashboardStats.locations}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                    color="info"
                    icon="person_add"
                    title="Brands"
                    count={dashboardStats.brands}
                />
              </MDBox>
            </Grid>
          </Grid>

          <MDBox mt={4.5}>
            <Grid container spacing={3}>
              {/* CHART */}
              <Grid item xs={12} md={6} lg={4}>
                <MDBox mb={3}>
                  <ReportsBarChart
                      color="info"
                      title="Monthly Sales"
                      description="Performance over current year"
                      date="updated real-time"
                      chart={chartData}
                  />
                </MDBox>
              </Grid>

              {/* ACTION NEEDED (PENDING DUE) */}
              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: "100%" }}>
                  <MDBox pt={3} px={3} display="flex" justifyContent="space-between">
                    <MDBox>
                      <MDTypography variant="h6">Action Needed</MDTypography>
                      <MDTypography variant="caption" color="text">{stats.pendingCount} invoices pending</MDTypography>
                    </MDBox>
                    <MDTypography variant="h5" color="error">{formatMoney(stats.totalPending)}</MDTypography>
                  </MDBox>
                  <MDBox p={3}>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          {pendingInvoices.map((inv) => (
                              <TableRow key={inv.id}>
                                <TableCell>
                                  <MDTypography variant="button" fontWeight="medium">{inv.groupName || "Client"}</MDTypography>
                                  <MDTypography variant="caption" display="block">#{inv.invoiceNo}</MDTypography>
                                </TableCell>
                                <TableCell align="right">
                                  <MDTypography variant="button" fontWeight="bold" color="error">
                                    {formatMoney(inv.due)}
                                  </MDTypography>
                                </TableCell>
                              </TableRow>
                          ))}
                          {pendingInvoices.length === 0 && <TableRow><TableCell><MDTypography variant="caption">All payments cleared! 🎉</MDTypography></TableCell></TableRow>}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </MDBox>
                </Card>
              </Grid>

              {/* RECENT ACTIVITY */}
              <Grid item xs={12} md={12} lg={4}>
                <Card sx={{ height: "100%" }}>
                  <MDBox pt={3} px={3}><MDTypography variant="h6">Recent Activity</MDTypography></MDBox>
                  <MDBox p={2}>
                    {recentInvoices.map((inv) => {
                      // Calculate specific totals for display
                      const total = parseFloat(String(inv.grandTotal || inv.amountPayable).replace(/[^0-9.-]+/g, "")) || 0;
                      const paid = parseFloat(String(inv.amountPaid || inv.received).replace(/[^0-9.-]+/g, "")) || 0;
                      const isPaid = (total - paid) <= 0;

                      return (
                          <MDBox key={inv.id} display="flex" mb={2} alignItems="center">
                            <Icon fontSize="medium" color={isPaid ? "success" : "warning"}>{isPaid ? "check_circle" : "schedule"}</Icon>
                            <MDBox ml={2} display="flex" flexDirection="column">
                              <MDTypography variant="button" fontWeight="medium">New Invoice #{inv.invoiceNo}</MDTypography>
                              <MDTypography variant="caption" color="text">
                                {formatMoney(total)} • {isPaid ? "Paid" : "Pending"}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                      );
                    })}
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
  );
}

export default Dashboard;