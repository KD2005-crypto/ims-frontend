import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// SweetAlert for beautiful alerts
import Swal from "sweetalert2";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ManageEstimates() {
  // --- STATE VARIABLES ---
  const [estimates, setEstimates] = useState([]);

  // Dropdown Data
  const [chains, setChains] = useState([]);
  const [groups, setGroups] = useState([]);
  const [brands, setBrands] = useState([]);

  // Form Inputs
  const [selectedChainId, setSelectedChainId] = useState("");
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [selectedBrandName, setSelectedBrandName] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [service, setService] = useState("");
  const [qty, setQty] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [gstRate, setGstRate] = useState("18"); // Default 18%
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryDetails, setDeliveryDetails] = useState("");

  // --- 1. LOAD DATA ON START ---
  useEffect(() => {
    fetchDropdownData();
    fetchEstimates();
  }, []);

  const fetchDropdownData = async () => {
    try {
      // Ensure HTTPS
      const chainsRes = await fetch("https://ims-backend-production-e15c.up.railway.app/api/chains");
      const groupsRes = await fetch("https://ims-backend-production-e15c.up.railway.app/api/groups");
      const brandsRes = await fetch("https://ims-backend-production-e15c.up.railway.app/api/brands");

      setChains(await chainsRes.json());
      setGroups(await groupsRes.json());
      setBrands(await brandsRes.json());
    } catch (err) {
      console.error("Error loading dropdowns:", err);
    }
  };

  const fetchEstimates = async () => {
    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/estimates");
      const data = await response.json();
      setEstimates(data);
    } catch (err) {
      console.error("Error fetching estimates:", err);
    }
  };

  // --- 2. CREATE ESTIMATE ---
  const handleCreateEstimate = async () => {
    // Validation with SweetAlert
    if (!selectedChainId || !service || !qty || !costPerUnit) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields (Client, Service, Qty, Cost).',
      });
      return;
    }

    const payload = {
      chainId: selectedChainId,
      groupName: selectedGroupName,
      brandName: selectedBrandName,
      zoneName: zoneName,
      service: service,
      qty: parseInt(qty),
      costPerUnit: parseFloat(costPerUnit),
      gstRate: parseFloat(gstRate),
      deliveryDate: deliveryDate,
      deliveryDetails: deliveryDetails
    };

    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newEst = await response.json();

        // Success Alert
        Swal.fire({
          icon: 'success',
          title: 'Estimate Created!',
          text: `Total Value: Rs. ${newEst.totalCost} (incl. GST)`,
          confirmButtonColor: '#4caf50'
        });

        // Clear Form
        setService("");
        setQty("");
        setCostPerUnit("");
        setDeliveryDetails("");
        fetchEstimates(); // Refresh Table
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Could not save the estimate. Please try again.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'Check your internet connection.',
      });
    }
  };

  // --- 3. DELETE ESTIMATE (With Confirmation) ---
  const handleDeleteEstimate = async (id) => {
    // Beautiful Confirmation Dialog
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`https://ims-backend-production-e15c.up.railway.app/api/estimates/${id}`, { method: "DELETE" });

          Swal.fire(
            'Deleted!',
            'The estimate has been removed.',
            'success'
          );
          fetchEstimates();
        } catch (error) {
          Swal.fire('Error', 'Failed to delete estimate.', 'error');
        }
      }
    });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>

          {/* --- FORM SECTION --- */}
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="warning"
                borderRadius="lg"
                coloredShadow="warning"
              >
                <MDTypography variant="h6" color="white">
                  Create Sales Estimate
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={2}>

                  {/* Row 1: Dropdowns */}
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Select Group</InputLabel>
                      <Select
                        value={selectedGroupName}
                        label="Select Group"
                        onChange={(e) => setSelectedGroupName(e.target.value)}
                        sx={{ height: "45px" }}
                      >
                        {groups.map((g) => <MenuItem key={g.groupId} value={g.groupName}>{g.groupName}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Select Chain (Client)</InputLabel>
                      <Select
                        value={selectedChainId}
                        label="Select Chain (Client)"
                        onChange={(e) => setSelectedChainId(e.target.value)}
                        sx={{ height: "45px" }}
                      >
                        {chains.map((c) => <MenuItem key={c.chainId} value={c.chainId}>{c.chainName}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Select Brand</InputLabel>
                      <Select
                        value={selectedBrandName}
                        label="Select Brand"
                        onChange={(e) => setSelectedBrandName(e.target.value)}
                        sx={{ height: "45px" }}
                      >
                        {brands.map((b) => <MenuItem key={b.brandId} value={b.brandName}>{b.brandName}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <MDInput label="Zone / Location" fullWidth value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
                  </Grid>

                  {/* Row 2: Service Details */}
                  <Grid item xs={12} md={6}>
                    <MDInput label="Service Description" fullWidth value={service} onChange={(e) => setService(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDInput type="number" label="Quantity" fullWidth value={qty} onChange={(e) => setQty(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDInput type="number" label="Cost Per Unit" fullWidth value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDInput type="number" label="GST Rate %" fullWidth value={gstRate} onChange={(e) => setGstRate(e.target.value)} />
                  </Grid>

                  {/* Row 3: Delivery */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      type="date"
                      fullWidth
                      label="Delivery Date"
                      InputLabelProps={{ shrink: true }}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput label="Delivery Address / Details" fullWidth value={deliveryDetails} onChange={(e) => setDeliveryDetails(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDButton variant="gradient" color="warning" fullWidth onClick={handleCreateEstimate}>
                      Save Estimate
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>

          {/* --- TABLE SECTION --- */}
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
                  Existing Estimates
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={2}>
                {estimates.map((est) => (
                  <MDBox key={est.estimatedId} display="flex" justifyContent="space-between" alignItems="center" p={2} mb={1} sx={{ borderBottom: "1px solid #f0f2f5" }}>
                    <MDBox>
                      <MDTypography variant="button" fontWeight="bold" display="block">
                        {est.service} (Qty: {est.qty})
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Client: {est.chain?.chainName} | Brand: {est.brandName}
                      </MDTypography>
                    </MDBox>
                    <MDBox textAlign="right">
                      <MDTypography variant="button" fontWeight="bold" color="success" display="block">
                        Total: Rs. {est.totalCost}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        (Base: {est.costPerUnit * est.qty} + GST: {est.gstRate}%)
                      </MDTypography>
                    </MDBox>
                    <MDButton variant="text" color="error" onClick={() => handleDeleteEstimate(est.estimatedId)}>
                      <Icon>delete</Icon>
                    </MDButton>
                  </MDBox>
                ))}
                {estimates.length === 0 && <MDTypography p={2} variant="caption">No estimates found.</MDTypography>}
              </MDBox>
            </Card>
          </Grid>

        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ManageEstimates;