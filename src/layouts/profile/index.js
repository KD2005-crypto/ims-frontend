import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDAvatar from "components/MDAvatar";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// SweetAlert
import Swal from "sweetalert2";

const API_URL = "https://ims-backend-production-e15c.up.railway.app/api";

// --- CUSTOM UI COMPONENTS ---
const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: "100%", p: 2, border: "1px solid #e0e0e0", boxShadow: "none" }}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
              <MDTypography variant="caption" fontWeight="bold" color="text" textTransform="uppercase">{title}</MDTypography>
              <MDTypography variant="h4" fontWeight="bold">{value}</MDTypography>
          </MDBox>
          <MDBox variant="gradient" bgColor={color} color="white" width="3rem" height="3rem" borderRadius="md" display="flex" justifyContent="center" alignItems="center">
              <Icon fontSize="medium" color="inherit">{icon}</Icon>
          </MDBox>
      </MDBox>
  </Card>
);

// ==============================
// 1. ADMIN DASHBOARD
// ==============================
const AdminDashboard = ({ activeTab }) => {
    const [employeeAttendance, setEmployeeAttendance] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);

    useEffect(() => { fetchAdminData(); }, []);

    const fetchAdminData = async () => {
        const token = localStorage.getItem("token");
        try {
            const attRes = await fetch(`${API_URL}/attendance/today`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (attRes.ok) setEmployeeAttendance(await attRes.json());
            const leaveRes = await fetch(`${API_URL}/leaves/pending`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (leaveRes.ok) setLeaveRequests(await leaveRes.json());
        } catch (error) { console.error("Error:", error); }
    };

    const handleLeaveAction = async (id, status) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/leaves/${id}/status?status=${status}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                Swal.fire("Success", `Request ${status === 'approve' ? 'Approved' : 'Rejected'}`, "success");
                fetchAdminData();
            }
        } catch (err) { Swal.fire("Error", "Action failed", "error"); }
    };

    return (
      <MDBox mt={2}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}><StatCard title="Team Present" value={employeeAttendance.length} icon="groups" color="info" /></Grid>
                <Grid item xs={12} md={4}><StatCard title="Pending Leaves" value={leaveRequests.length} icon="event_busy" color="warning" /></Grid>
                <Grid item xs={12} md={4}><StatCard title="System Status" value="Online" icon="sensors" color="success" /></Grid>
                <Grid item xs={12}>
                    <Card sx={{ border: "1px solid #e0e0e0", boxShadow: "none" }}>
                        <MDBox p={3}>
                            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <MDTypography variant="h6" fontWeight="bold">Live Attendance Log</MDTypography>
                                <MDButton variant="outlined" color="info" size="small" onClick={fetchAdminData}>Refresh</MDButton>
                            </MDBox>
                            <List>
                                {employeeAttendance.length === 0 && <MDTypography variant="button" color="text">No one has checked in yet today.</MDTypography>}
                                {employeeAttendance.map((emp, i) => (
                                  <ListItem key={i} sx={{ px: 0, py: 1, borderBottom: "1px solid #f0f0f0" }}>
                                      <ListItemAvatar><Avatar sx={{ bgcolor: "#344767", fontSize: "14px" }}>{emp.email ? emp.email[0].toUpperCase() : "U"}</Avatar></ListItemAvatar>
                                      <ListItemText primary={<MDTypography variant="button" fontWeight="bold">{emp.email}</MDTypography>} />
                                      <MDBox bgColor="success" borderRadius="sm" px={1.5} py={0.5}><MDTypography variant="caption" color="white" fontWeight="bold">PRESENT</MDTypography></MDBox>
                                  </ListItem>
                                ))}
                            </List>
                        </MDBox>
                    </Card>
                </Grid>
            </Grid>
          )}
          {activeTab === 1 && (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card sx={{ border: "1px solid #e0e0e0", boxShadow: "none" }}>
                        <MDBox p={3}>
                            <MDTypography variant="h6" fontWeight="bold" mb={3}>Pending Leave Approvals</MDTypography>
                            {leaveRequests.length === 0 ? <MDTypography variant="button" color="text">No pending requests.</MDTypography> : (
                              <Grid container spacing={2}>
                                  {leaveRequests.map((req) => (
                                    <Grid item xs={12} key={req.id}>
                                        <MDBox p={2} sx={{ bgcolor: "#f8f9fa", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <MDBox><MDTypography variant="button" fontWeight="bold" display="block">{req.email}</MDTypography><MDTypography variant="caption" color="text">{req.reason}</MDTypography></MDBox>
                                            <MDBox display="flex" gap={1}>
                                                <MDButton variant="gradient" color="success" size="small" onClick={() => handleLeaveAction(req.id, 'approve')}>Approve</MDButton>
                                                <MDButton variant="outlined" color="error" size="small" onClick={() => handleLeaveAction(req.id, 'reject')}>Reject</MDButton>
                                            </MDBox>
                                        </MDBox>
                                    </Grid>
                                  ))}
                              </Grid>
                            )}
                        </MDBox>
                    </Card>
                </Grid>
            </Grid>
          )}
      </MDBox>
    );
};

// ==============================
// 2. STAFF DASHBOARD
// ==============================
const StaffDashboard = ({ activeTab, user }) => {
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);
    const [leaveDate, setLeaveDate] = useState("");
    const [leaveReason, setLeaveReason] = useState("");
    const [myLeaveHistory, setMyLeaveHistory] = useState([]);

    useEffect(() => {
        const today = new Date().toLocaleDateString();
        const storedDate = localStorage.getItem("attendanceDate");
        const storedTime = localStorage.getItem("checkInTime");
        if (storedDate === today && storedTime) {
            setIsCheckedIn(true);
            setCheckInTime(storedTime);
        }
    }, []);

    const handleAttendance = async () => {
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const token = localStorage.getItem("token");
        const endpoint = isCheckedIn ? "check-out" : "check-in";
        const method = isCheckedIn ? "PUT" : "POST";

        try {
            const res = await fetch(`${API_URL}/attendance/${endpoint}`, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: user.email })
            });
            if (res.ok) {
                if (!isCheckedIn) {
                    setIsCheckedIn(true);
                    setCheckInTime(nowTime);
                    localStorage.setItem("checkInTime", nowTime);
                    localStorage.setItem("attendanceDate", new Date().toLocaleDateString());
                    Swal.fire("Success", `Checked in at ${nowTime}`, "success");
                } else {
                    setIsCheckedIn(false);
                    setCheckInTime(null);
                    localStorage.removeItem("checkInTime");
                    Swal.fire("Success", "Checked out!", "success");
                }
            } else {
                Swal.fire("Info", "Check-in failed or already recorded.", "info");
            }
        } catch (e) { Swal.fire("Error", "Server error", "error"); }
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/leaves/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: user.email, reason: leaveReason, startDate: leaveDate, endDate: leaveDate })
            });
            if (res.ok) {
                const newLeave = await res.json();
                setMyLeaveHistory([newLeave, ...myLeaveHistory]);
                Swal.fire("Sent", "Request submitted", "success");
                setLeaveDate(""); setLeaveReason("");
            }
        } catch (err) { Swal.fire("Error", "Failed to apply", "error"); }
    };

    return (
      <MDBox mt={2}>
          {activeTab === 0 && (
            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 5, textAlign: "center", border: "1px solid #e0e0e0", boxShadow: "none" }}>
                        <MDTypography variant="h5" fontWeight="bold" mb={1}>Daily Attendance</MDTypography>
                        <MDBox display="flex" justifyContent="center" my={4}>
                            <MDButton
                              variant="gradient"
                              color={isCheckedIn ? "warning" : "info"}
                              sx={{ width: 160, height: 160, borderRadius: "50%", fontSize: "1.1rem" }}
                              onClick={handleAttendance}
                            >
                                {isCheckedIn ? "CHECK OUT" : "CHECK IN"}
                            </MDButton>
                        </MDBox>
                        {isCheckedIn && <MDBox bgColor="success" borderRadius="lg" p={1} sx={{ display: "inline-block" }}><MDTypography variant="button" color="white" fontWeight="bold">Active Since {checkInTime}</MDTypography></MDBox>}
                    </Card>
                </Grid>
            </Grid>
          )}
          {activeTab === 1 && (
            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Card sx={{ p: 3, border: "1px solid #e0e0e0", boxShadow: "none" }}>
                        <MDTypography variant="h6" fontWeight="bold" mb={2}>Apply for Leave</MDTypography>
                        <MDBox component="form" onSubmit={handleApplyLeave}>
                            <MDInput type="date" fullWidth value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} sx={{mb: 2}} />
                            <MDInput label="Reason" multiline rows={4} fullWidth value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} sx={{mb: 3}} />
                            <MDButton variant="gradient" color="dark" fullWidth type="submit">Submit</MDButton>
                        </MDBox>
                    </Card>
                </Grid>
            </Grid>
          )}
      </MDBox>
    );
};

// ==============================
// 3. MAIN PROFILE
// ==============================
function Profile() {
    const [activeTab, setActiveTab] = useState(0);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const storedRole = localStorage.getItem("role");
        if (!storedUser) { navigate("/authentication/sign-in"); return; }
        let finalRole = (storedRole || storedUser.role || "staff").toLowerCase();
        if (storedUser.email?.toLowerCase().includes("admin")) finalRole = "admin";
        setUser({ ...storedUser, role: finalRole });
    }, [navigate]);

    if (!user) return null;

    return (
      <DashboardLayout>
          <DashboardNavbar />
          <MDBox mb={2} />
          {/* ✅ UPDATED HEADER: No mountains, just clean professional tech theme */}
          <MDBox position="relative" mb={5}>
              <MDBox
                display="flex"
                alignItems="center"
                position="relative"
                minHeight="12rem"
                borderRadius="xl"
                sx={{
                    background: "linear-gradient(135deg, #1a237e 0%, #344767 100%)",
                    boxShadow: "inset 0 0 100px rgba(0,0,0,0.2)"
                }}
              />
              <Card sx={{ position: "relative", mt: -8, mx: 3, py: 3, px: 3, border: "1px solid #e0e0e0", boxShadow: "none" }}>
                  <Grid container spacing={3} alignItems="center">
                      <Grid item><Avatar sx={{ width: 70, height: 70, bgcolor: "#344767", fontSize: "1.8rem" }}>{user.fullName ? user.fullName[0].toUpperCase() : "U"}</Avatar></Grid>
                      <Grid item>
                          <MDBox lineHeight={1}>
                              <MDTypography variant="h4" fontWeight="bold">{user.fullName}</MDTypography>
                              <MDBox display="flex" alignItems="center" mt={0.5}>
                                  <MDTypography variant="button" color="text" fontWeight="regular" mr={1}>{user.email}</MDTypography>
                                  <MDBox px={1.5} py={0.2} borderRadius="xl" sx={{ bgcolor: user.role === 'admin' ? '#f44336' : '#4caf50' }}>
                                      <MDTypography variant="caption" color="white" fontWeight="bold">{user.role.toUpperCase()}</MDTypography>
                                  </MDBox>
                              </MDBox>
                          </MDBox>
                      </Grid>
                      <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>
                          <AppBar position="static" sx={{ bgcolor: "transparent", boxShadow: "none" }}>
                              <Tabs orientation="horizontal" value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                                  <Tab label="Work" icon={<Icon>dashboard</Icon>} />
                                  <Tab label={user.role === 'admin' ? "Approvals" : "Leave"} icon={<Icon>fact_check</Icon>} />
                                  <Tab label="Profile" icon={<Icon>person</Icon>} />
                              </Tabs>
                          </AppBar>
                      </Grid>
                  </Grid>
              </Card>
          </MDBox>
          <MDBox mb={5}>
              {user.role === 'admin' ? <AdminDashboard activeTab={activeTab} /> : <StaffDashboard activeTab={activeTab} user={user} />}
          </MDBox>
          <Footer />
      </DashboardLayout>
    );
}

export default Profile;