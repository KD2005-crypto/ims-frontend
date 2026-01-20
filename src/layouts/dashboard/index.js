import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

function Dashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalInvoices: 0, totalLocations: 0, totalBrands: 0 });

  useEffect(() => {
    // FIX: Added https:// to the Railway URL
    fetch("https://ims-backend-production-e15c.up.railway.app/api/dashboard")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Stats Error:", err));
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard color="dark" icon="weekend" title="Total Revenue" count={`₹${stats.totalRevenue}`} />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard icon="leaderboard" title="Total Invoices" count={stats.totalInvoices} />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard color="success" icon="store" title="Active Stores" count={stats.totalLocations} />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard color="primary" icon="branding_watermark" title="Brands" count={stats.totalBrands} />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}
export default Dashboard;