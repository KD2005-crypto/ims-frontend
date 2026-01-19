import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    totalLocations: 0,
    totalBrands: 0,
  });

  // 1. CHART STATE
  const [salesChart, setSalesChart] = useState(null);
  const [growthChart, setGrowthChart] = useState(null);
  const [tasksChart, setTasksChart] = useState(null);

  useEffect(() => {
    // Fetch Stats
    fetch("ims-backend-production-e15c.up.railway.app/api/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Stats Error:", err));

    // Fetch Charts
    fetch("ims-backend-production-e15c.up.railway.app/api/charts")
      .then((res) => res.json())
      .then((data) => {
        data.forEach((chart) => {
          // Helper to parse "10,20,30" into [10, 20, 30]
          const parsedData = {
            labels: chart.labels.split(","),
            datasets: { label: "Data", data: chart.dataPoints.split(",").map(Number) },
          };

          if (chart.name === "sales") setSalesChart(parsedData);
          if (chart.name === "growth") setGrowthChart(parsedData);
          if (chart.name === "tasks") setTasksChart(parsedData);
        });
      })
      .catch((err) => console.error("Charts Error:", err));
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* ROW 1: STATS CARDS */}
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

        {/* ROW 2: DYNAMIC CHARTS */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            {/* Chart 1: Sales */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                {salesChart && (
                  <ReportsBarChart
                    color="info"
                    title="Weekly Sales"
                    description="Verified Admin Data"
                    date="just updated"
                    chart={salesChart}
                  />
                )}
              </MDBox>
            </Grid>

            {/* Chart 2: Growth */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                {growthChart && (
                  <ReportsLineChart
                    color="success"
                    title="Monthly Growth"
                    description="Performance Trends"
                    date="just updated"
                    chart={growthChart}
                  />
                )}
              </MDBox>
            </Grid>

            {/* Chart 3: Tasks/Locations */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                {tasksChart && (
                  <ReportsLineChart
                    color="dark"
                    title="Active Locations"
                    description="Store expansion"
                    date="just updated"
                    chart={tasksChart}
                  />
                )}
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* ROW 3: PROJECTS TABLE */}
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
