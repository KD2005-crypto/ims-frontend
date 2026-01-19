import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Chart Components
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";

function Dashboard() {
  // 1. State for Real Backend Data
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    totalLocations: 0,
    totalBrands: 0,
  });

  // 2. Fetch Live Data on Load
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("ims-backend-production-e15c.up.railway.app/api/dashboard");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    }
    fetchStats();
  }, []);

  // 3. Chart Data Configuration (Visuals)
  const salesChartData = {
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    datasets: { label: "Sales", data: [50, 20, 10, 22, 50, 10, 40] },
  };

  const tasksChartData = {
    labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: { label: "Invoices", data: [50, 40, 300, 320, 500, 350, 200, 230, 500] },
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* --- ROW 1: REAL LIVE DATA CARDS --- */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="weekend"
                title="Total Revenue"
                count={`₹${stats.totalRevenue.toLocaleString()}`}
                percentage={{ color: "success", amount: "+", label: "verified income" }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="leaderboard"
                title="Total Invoices"
                count={stats.totalInvoices}
                percentage={{ color: "success", amount: "+", label: "bills generated" }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Active Stores"
                count={stats.totalLocations}
                percentage={{ color: "success", amount: "+", label: "locations tracked" }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="branding_watermark"
                title="Brands Onboarded"
                count={stats.totalBrands}
                percentage={{ color: "success", amount: "", label: "Just updated" }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* --- ROW 2: ATTRACTIVE CHARTS --- */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            {/* Chart 1: Website Views (Bar Chart) */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Weekly Sales"
                  description="Performance of last week"
                  date="updated just now"
                  chart={salesChartData}
                />
              </MDBox>
            </Grid>

            {/* Chart 2: Daily Sales (Line Chart) */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Monthly Growth"
                  description={
                    <>
                      (<strong>+15%</strong>) increase in invoices.
                    </>
                  }
                  date="updated 4 min ago"
                  chart={tasksChartData}
                />
              </MDBox>
            </Grid>

            {/* Chart 3: Completed Tasks (Line Chart) */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="Active Locations"
                  description="New stores added"
                  date="just updated"
                  chart={tasksChartData}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Welcome Message */}
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDBox p={3} bgColor="white" borderRadius="xl" coloredShadow="info">
                <h3 style={{ margin: 0 }}>Welcome to Code-B Enterprise System</h3>
                <p style={{ color: "gray", margin: 0 }}>
                  System status: <strong>Online</strong>.
                </p>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
