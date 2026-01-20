import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ManageAnalytics() {
  const [charts, setCharts] = useState([]);
  const [selectedChart, setSelectedChart] = useState("");

  // Form Data
  const [labels, setLabels] = useState("");
  const [dataPoints, setDataPoints] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("https://ims-backend-production-e15c.up.railway.app/api/charts")
      .then((res) => res.json())
      .then((data) => setCharts(data));
  }, []);

  const handleSelect = (e) => {
    const chartName = e.target.value;
    setSelectedChart(chartName);
    const chart = charts.find((c) => c.name === chartName);
    if (chart) {
      setLabels(chart.labels);
      setDataPoints(chart.dataPoints);
      setDescription(chart.description);
    }
  };

  const handleUpdate = async () => {
    const payload = { labels, dataPoints, description };
    await fetch(`https://ims-backend-production-e15c.up.railway.app/api/charts/${selectedChart}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    alert("Chart Updated Successfully!");
    // Refresh local data
    const res = await fetch("https://ims-backend-production-e15c.up.railway.app/api/charts");
    setCharts(await res.json());
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
                bgColor="dark"
                borderRadius="lg"
                coloredShadow="dark"
              >
                <MDTypography variant="h6" color="white">
                  Update Chart Data
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Select Chart to Edit</InputLabel>
                      <Select
                        value={selectedChart}
                        label="Select Chart to Edit"
                        onChange={handleSelect}
                        sx={{ height: 45 }}
                      >
                        {charts.map((c) => (
                          <MenuItem key={c.id} value={c.name}>
                            {c.description} ({c.name})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {selectedChart && (
                    <>
                      <Grid item xs={12}>
                        <MDInput
                          label="Chart Description"
                          fullWidth
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <MDInput
                          label="Labels (comma separated, e.g. M,T,W)"
                          multiline
                          rows={2}
                          fullWidth
                          value={labels}
                          onChange={(e) => setLabels(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <MDInput
                          label="Data Points (comma separated, e.g. 10,20,30)"
                          multiline
                          rows={2}
                          fullWidth
                          value={dataPoints}
                          onChange={(e) => setDataPoints(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <MDButton variant="gradient" color="info" fullWidth onClick={handleUpdate}>
                          Update Chart Visuals
                        </MDButton>
                      </Grid>
                    </>
                  )}
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
export default ManageAnalytics;
