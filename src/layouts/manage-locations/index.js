import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ManageLocations() {
  // State variables
  const [locations, setLocations] = useState([]);
  const [brands, setBrands] = useState([]); // Stores list of Brands for dropdown

  // Form inputs
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [error, setError] = useState("");

  // 1. Load Data on Page Start
  useEffect(() => {
    fetchBrands();
    fetchLocations();
  }, []);

  // --- API FUNCTIONS ---

  const fetchBrands = async () => {
    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/brands");
      const data = await response.json();
      setBrands(data);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/locations");
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  const handleAddLocation = async () => {
    if (!locationName || !selectedBrandId || !address) {
      setError("Please fill in all fields (Brand, Name, Address).");
      return;
    }

    const payload = {
      locationName: locationName,
      address: address,
      brandId: selectedBrandId,
    };

    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setLocationName("");
        setAddress("");
        setSelectedBrandId("");
        setError("");
        fetchLocations(); // Refresh list immediately
      } else {
        setError("Failed to add location.");
      }
    } catch (err) {
      setError("Server Error.");
    }
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      await fetch(`https://ims-backend-production-e15c.up.railway.app/api/locations/${id}`, { method: "DELETE" });
      fetchLocations();
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          {/* Section 1: Add Location Form */}
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
                  Add New Location
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={2} alignItems="center">
                  {/* Dropdown to Select Brand */}
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="brand-select-label">Select Brand</InputLabel>
                      <Select
                        labelId="brand-select-label"
                        value={selectedBrandId}
                        label="Select Brand"
                        onChange={(e) => setSelectedBrandId(e.target.value)}
                        sx={{ height: "45px" }}
                      >
                        {brands.map((brand) => (
                          <MenuItem key={brand.brandId} value={brand.brandId}>
                            {brand.brandName} (Chain: {brand.chain.chainName})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Location Name Input */}
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="Location Name (e.g. Bandra West)"
                      fullWidth
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                    />
                  </Grid>

                  {/* Address Input */}
                  <Grid item xs={12} md={4}>
                    <MDInput
                      label="Address (e.g. Shop 5, Linking Rd)"
                      fullWidth
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </Grid>

                  {/* Add Button */}
                  <Grid item xs={12} md={2}>
                    <MDButton
                      variant="gradient"
                      color="success"
                      fullWidth
                      onClick={handleAddLocation}
                    >
                      Add
                    </MDButton>
                  </Grid>
                </Grid>

                {error && (
                  <MDTypography variant="caption" color="error" mt={2} display="block">
                    {error}
                  </MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Section 2: List of Locations */}
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
                  Existing Locations
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={2}>
                {locations.map((loc) => (
                  <MDBox
                    key={loc.locationId}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    p={2}
                    mb={1}
                    sx={{ borderBottom: "1px solid #f0f2f5" }}
                  >
                    <MDBox>
                      <MDTypography variant="button" fontWeight="medium" display="block">
                        {loc.locationName}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Brand: {loc.brand.brandName} | Address: {loc.address}
                      </MDTypography>
                    </MDBox>
                    <MDButton
                      variant="text"
                      color="error"
                      onClick={() => handleDeleteLocation(loc.locationId)}
                    >
                      <Icon>delete</Icon>&nbsp;Delete
                    </MDButton>
                  </MDBox>
                ))}

                {locations.length === 0 && (
                  <MDTypography variant="caption" color="text" p={2}>
                    No locations found. Create one above.
                  </MDTypography>
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

export default ManageLocations;
