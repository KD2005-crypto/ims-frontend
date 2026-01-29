import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Swal from "sweetalert2";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// ✅ CONFIG: Backend URL (Centralized for safety)
const API_BASE_URL = "https://ims-backend-production-e15c.up.railway.app/api";

function ManageEstimates() {
  // ✅ FIX 1: Ensure initial state is ALWAYS an array
  const [estimates, setEstimates] = useState([]);
  const [chains, setChains] = useState([]);
  const [groups, setGroups] = useState([]);
  const [brands, setBrands] = useState([]);

  // Form State
  const [selectedChainId, setSelectedChainId] = useState("");
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [selectedBrandName, setSelectedBrandName] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [service, setService] = useState("");
  const [qty, setQty] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryDetails, setDeliveryDetails] = useState("");

  useEffect(() => {
    fetchDropdownData();
    fetchEstimates();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const chainsRes = await fetch(`${API_BASE_URL}/chains`);
      const groupsRes = await fetch(`${API_BASE_URL}/groups`);
      const brandsRes = await fetch(`${API_BASE_URL}/brands`);

      // Safety checks for dropdowns too
      const cData = await chainsRes.json();
      const gData = await groupsRes.json();
      const bData = await brandsRes.json();

      setChains(Array.isArray(cData) ? cData : []);
      setGroups(Array.isArray(gData) ? gData : []);
      setBrands(Array.isArray(bData) ? bData : []);
    } catch (err) { console.error("Dropdown loading error:", err); }
  };

  const fetchEstimates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/estimates`);
      const data = await response.json();

      // ✅ FIX 2: THE CRASH STOPPER
      // If the backend sends an error (Object), we ignore it and use []
      if (Array.isArray(data)) {
        setEstimates(data);
      } else {
        console.error("Backend returned non-array (likely 500 error):", data);
        setEstimates([]); // Keeps the page alive!
      }
    } catch (err) {
      console.error("Estimate fetch error:", err);
      setEstimates([]);
    }
  };

  const handleCreateEstimate = async () => {
    if (!selectedChainId || !service || !qty || !costPerUnit || !selectedGroupName) {
      Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Please select Group, Client, and fill Service details.' });
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
      const response = await fetch(`${API_BASE_URL}/estimates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Estimate Saved!', timer: 2000, showConfirmButton: false });
        setService(""); setQty(""); setCostPerUnit("");
        fetchEstimates();
      } else {
        Swal.fire({ icon: 'error', title: 'Save Failed', text: 'Backend rejected the data.' });
      }
    } catch (err) { console.error("Submission error:", err); }
  };

  const handleDeleteEstimate = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Estimate?',
      text: "This cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33'
    });
    if (result.isConfirmed) {
      await fetch(`${API_BASE_URL}/estimates/${id}`, { method: "DELETE" });
      fetchEstimates();
      Swal.fire('Deleted!', '', 'success');
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="warning" borderRadius="lg" coloredShadow="warning">
                <MDTypography variant="h6" color="white">Create Sales Estimate</MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth><InputLabel>Select Group</InputLabel>
                      <Select value={selectedGroupName} label="Select Group" onChange={(e) => setSelectedGroupName(e.target.value)} sx={{ height: "45px" }}>
                        {groups.map((g) => <MenuItem key={g.groupId} value={g.groupName}>{g.groupName}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth><InputLabel>Select Client (Chain)</InputLabel>
                      <Select value={selectedChainId} label="Select Client" onChange={(e) => setSelectedChainId(e.target.value)} sx={{ height: "45px" }}>
                        {chains.map((c) => <MenuItem key={c.chainId} value={c.chainId}>{c.chainName}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth><InputLabel>Select Brand</InputLabel>
                      <Select value={selectedBrandName} label="Select Brand" onChange={(e) => setSelectedBrandName(e.target.value)} sx={{ height: "45px" }}>
                        {brands.map((b) => <MenuItem key={b.brandId} value={b.brandName}>{b.brandName}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput label="Zone / Location" fullWidth value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
                  </Grid>
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
                    <MDInput type="number" label="GST %" fullWidth value={gstRate} onChange={(e) => setGstRate(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField type="date" fullWidth label="Delivery Date" InputLabelProps={{ shrink: true }} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput label="Delivery Details" fullWidth value={deliveryDetails} onChange={(e) => setDeliveryDetails(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDButton variant="gradient" color="warning" fullWidth onClick={handleCreateEstimate}>Save Estimate</MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="dark" borderRadius="lg" coloredShadow="dark">
                <MDTypography variant="h6" color="white">Existing Estimates</MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={2}>
                {/* ✅ FIX 3: Safe Mapping. This will never crash even if 'estimates' is empty. */}
                {Array.isArray(estimates) && estimates.map((est) => (
                  <MDBox key={est.estimatedId} display="flex" justifyContent="space-between" alignItems="center" p={2} mb={1} sx={{ borderBottom: "1px solid #f0f2f5" }}>
                    <MDBox>
                      <MDTypography variant="button" fontWeight="bold" display="block">{est.service} (Qty: {est.qty})</MDTypography>
                      <MDTypography variant="caption" color="text">
                        Group: {est.groupName || "N/A"} | Client: {est.chain?.chainName || "N/A"} | Brand: {est.brandName || "N/A"}
                      </MDTypography>
                    </MDBox>
                    <MDBox textAlign="right">
                      <MDTypography variant="button" fontWeight="bold" color="success" display="block">Rs. {est.totalCost}</MDTypography>
                      <MDTypography variant="caption" color="text">(Incl. {est.gstRate}% GST)</MDTypography>
                    </MDBox>
                    <MDButton variant="text" color="error" onClick={() => handleDeleteEstimate(est.estimatedId)}><Icon>delete</Icon></MDButton>
                  </MDBox>
                ))}
                {(!Array.isArray(estimates) || estimates.length === 0) && <MDTypography p={2} variant="caption">No records found (or server error).</MDTypography>}
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