import { useState, useEffect, useMemo } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDProgress from "components/MDProgress";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Charts
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";

// Statistics Cards
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

function ManageAnalytics() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH LIVE DATA
  useEffect(() => {
    fetch("https://ims-backend-production-e15c.up.railway.app/api/invoices")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setInvoices(data);
          else setInvoices([]);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Analytics Fetch Error:", err);
          setInvoices([]);
          setLoading(false);
        });
  }, []);

  // 2. THE ANALYTICS ENGINE
  const analytics = useMemo(() => {
    const activeInvoices = invoices.filter(inv => inv.archived !== true);

    const monthlyRevenue = Array(12).fill(0);
    const monthlyInvoices = Array(12).fill(0);

    const serviceStats = {};
    const paymentModeStats = { UPI: 0, Bank: 0, Cash: 0, Cheque: 0 };

    let totalPending = 0;
    let totalPaid = 0;
    let totalRevenue = 0;

    // FIX: Track Names instead of Emails for better accuracy
    const clientSet = new Set();

    activeInvoices.forEach((inv) => {
      // 1. Get Totals
      let rawTotal = inv.amount || inv.total || inv.amountPayable || 0;
      let totalAmount = parseFloat(String(rawTotal).replace(/[^0-9.-]+/g, "")) || 0;

      // 2. Get Paid
      let rawPaid = inv.amountPaid || inv.received || 0;
      let paidAmount = parseFloat(String(rawPaid).replace(/[^0-9.-]+/g, "")) || 0;

      // Legacy fallback
      if (paidAmount === 0 && inv.status === "PAID") {
        paidAmount = totalAmount;
      }

      // 3. Calc Pending
      let pendingAmount = totalAmount - paidAmount;
      if (pendingAmount < 0) pendingAmount = 0;

      // 4. Update Aggregates
      totalRevenue += totalAmount; // Gross Revenue (Total Invoiced)
      totalPaid += paidAmount;     // Cash Collected
      totalPending += pendingAmount; // Outstanding

      // 5. Monthly Data
      const dateStr = inv.dateOfService || inv.date || inv.invoiceDate || inv.createdAt || new Date();
      const date = new Date(dateStr);
      const month = date.getMonth();
      const currentYear = new Date().getFullYear();

      if (date.getFullYear() === currentYear) {
        monthlyRevenue[month] += totalAmount;
        monthlyInvoices[month] += 1;
      }

      // 6. Unique Clients (FIXED: Use GroupName/ClientName)
      const clientName = inv.groupName || inv.clientName || inv.serviceDetails || "Unknown";
      if (clientName !== "Unknown") {
        clientSet.add(clientName.trim().toLowerCase());
      }

      // 7. Service Stats
      const serviceName = inv.serviceDetails || "General Service";
      if (!serviceStats[serviceName]) serviceStats[serviceName] = 0;
      serviceStats[serviceName] += totalAmount;
    });

    // Sort Top Services
    const topServices = Object.entries(serviceStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    return {
      monthlyRevenue,
      monthlyInvoices,
      totalPending,
      totalPaid,
      totalRevenue,
      uniqueClients: clientSet.size, // Now accurately counts unique names
      topServices,
      avgInvoiceValue: activeInvoices.length > 0 ? totalRevenue / activeInvoices.length : 0,
    };
  }, [invoices]);

  // Chart Config
  const revenueChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: { label: "Revenue (Rs)", data: analytics.monthlyRevenue },
  };

  const workloadChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: { label: "Invoices", data: analytics.monthlyInvoices },
  };

  const formatMoney = (amount) => "Rs. " + Number(amount.toFixed(0)).toLocaleString("en-IN");

  return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>

          <MDBox mb={3}>
            <MDTypography variant="h4" fontWeight="medium">Financial Analytics</MDTypography>
            <MDTypography variant="button" color="text">
              Real-time metrics from {invoices.length} records
            </MDTypography>
          </MDBox>

          {/* STATS CARDS */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                  color="dark"
                  icon="account_balance_wallet"
                  title="Total Revenue"
                  count={formatMoney(analytics.totalRevenue)}
                  percentage={{ color: "text", amount: "", label: "gross invoiced" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                  icon="people"
                  title="Active Clients"
                  count={analytics.uniqueClients}
                  percentage={{ color: "success", amount: "", label: "unique customers" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                  color="success"
                  icon="check_circle"
                  title="Collected"
                  count={formatMoney(analytics.totalPaid)}
                  percentage={{ color: "success", amount: "", label: "cash received" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                  color="error"
                  icon="pending_actions"
                  title="Pending"
                  count={formatMoney(analytics.totalPending)}
                  percentage={{ color: "error", amount: "", label: "outstanding" }}
              />
            </Grid>
          </Grid>

          {/* CHARTS */}
          <MDBox mt={4.5}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={6}>
                <MDBox mb={3}>
                  <ReportsBarChart
                      color="info"
                      title="Monthly Revenue"
                      description="Total value of invoices generated"
                      date="live data"
                      chart={revenueChartData}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} lg={6}>
                <MDBox mb={3}>
                  <ReportsLineChart
                      color="success"
                      title="Invoice Volume"
                      description="Number of invoices created"
                      date="live data"
                      chart={workloadChartData}
                  />
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>

          {/* DEEP INSIGHTS */}
          <Grid container spacing={3} mt={2}>
            <Grid item xs={12} md={8}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6">Top Performing Services</MDTypography>
                  <MDBox mt={2}>
                    {analytics.topServices.map(([name, amount], index) => (
                        <MDBox key={name} mb={2}>
                          <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                            <MDTypography variant="button" fontWeight="medium" textTransform="capitalize">{index + 1}. {name}</MDTypography>
                            <MDTypography variant="caption" fontWeight="bold">{formatMoney(amount)}</MDTypography>
                          </MDBox>
                          <MDProgress value={(amount / analytics.totalRevenue) * 100} color={index === 0 ? "info" : "warning"} variant="gradient" />
                        </MDBox>
                    ))}
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <MDBox p={3}>
                  <MDTypography variant="h6" gutterBottom>Collection Health</MDTypography>
                  <MDBox mt={3}>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontSize="12px">Collected</MDTypography>
                      <MDTypography variant="caption" fontWeight="bold" color="success">
                        {analytics.totalRevenue > 0 ? ((analytics.totalPaid / analytics.totalRevenue) * 100).toFixed(1) : 0}%
                      </MDTypography>
                    </MDBox>
                    <MDProgress value={analytics.totalRevenue > 0 ? (analytics.totalPaid / analytics.totalRevenue) * 100 : 0} color="success" />
                  </MDBox>
                  <MDBox mt={4}>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontSize="12px">Pending</MDTypography>
                      <MDTypography variant="caption" fontWeight="bold" color="error">
                        {analytics.totalRevenue > 0 ? ((analytics.totalPending / analytics.totalRevenue) * 100).toFixed(1) : 0}%
                      </MDTypography>
                    </MDBox>
                    <MDProgress value={analytics.totalRevenue > 0 ? (analytics.totalPending / analytics.totalRevenue) * 100 : 0} color="error" />
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
        <Footer />
      </DashboardLayout>
  );
}

export default ManageAnalytics;