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
import Chip from "@mui/material/Chip";

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

// --- CUSTOM STYLED CARD ---
const ModernCard = ({ children, title, icon, color = "info" }) => (
  <Card sx={{ height: "100%", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", borderRadius: "16px", border: "1px solid #f0f2f5" }}>
      <MDBox p={3}>
          <MDBox display="flex" alignItems="center" mb={3}>
              <MDBox
                display="flex" justifyContent="center" alignItems="center"
                width="40px" height="40px" bgColor={color} variant="gradient"
                color="white" borderRadius="lg" shadow="md" mr={2}
              >
                  <Icon fontSize="small">{icon}</Icon>
              </MDBox>
              <MDTypography variant="h6" fontWeight="bold">{title}</MDTypography>
          </MDBox>
          {children}
      </MDBox>
  </Card>
);

// ==============================
// 1. ADMIN DASHBOARD Redesign
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
                Swal.fire({ title: "Success", text: `Leave ${status}ed successfully`, icon: "success", timer: 1500 });
                fetchAdminData();
            }
        } catch (err) { Swal.fire("Error", "Action failed", "error"); }
    };

    return (
      <MDBox mt={2}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <ModernCard title="Team Presence Today" icon="groups" color="info">
                        <List>
                            {employeeAttendance.length === 0 && <MDTypography variant="button" color="text">No active records for today.</MDTypography>}
                            {employeeAttendance.map((emp, i) => (
                              <ListItem key={i} sx={{ px: 0, py: 1.5, borderBottom: "1px solid #f8f9fa" }}>
                                  <ListItemAvatar><Avatar sx={{ bgcolor: "#344767" }}>{emp.email[0].toUpperCase()}</Avatar></ListItemAvatar>
                                  <ListItemText primary={<MDTypography variant="button" fontWeight="bold">{emp.email}</MDTypography>} secondary={<MDTypography variant="caption">Active Log</MDTypography>} />
                                  <Chip label="PRESENT" size="small" color="success" sx={{ fontWeight: "bold", color: "white" }} />
                              </ListItem>
                            ))}
                        </List>
                        <MDBox mt={2} textAlign="right">
                            <MDButton variant="text" color="info" size="small" onClick={fetchAdminData}>Refresh Data</MDButton>
                        </MDBox>
                    </ModernCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <ModernCard title="Daily Summary" icon="pie_chart" color="dark">
                        <MDBox textAlign="center" py={4}>
                            <MDTypography variant="h1" fontWeight="bold" color="info">{employeeAttendance.length}</MDTypography>
                            <MDTypography variant="button" color="text" fontWeight="medium">Employees On-site</MDTypography>
                        </MDBox>
                    </ModernCard>
                </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <ModernCard title="Pending Leave Approvals" icon="fact_check" color="warning">
                        {leaveRequests.length === 0 ? <MDTypography variant="button" color="text">All requests processed!</MDTypography> : (
                          <Grid container spacing={2}>
                              {leaveRequests.map((req) => (
                                <Grid item xs={12} key={req.id}>
                                    <MDBox p={2} sx={{ bgcolor: "#fbfcfd", borderRadius: "12px", border: "1px solid #f0f2f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <MDBox>
                                            <MDTypography variant="button" fontWeight="bold" display="block">{req.email}</MDTypography>
                                            <MDTypography variant="caption" color="text">{req.reason}</MDTypography>
                                        </MDBox>
                                        <MDBox display="flex" gap={1}>
                                            <MDButton variant="gradient" color="success" size="small" onClick={() => handleLeaveAction(req.id, 'approve')}>Approve</MDButton>
                                            <MDButton variant="outlined" color="error" size="small" onClick={() => handleLeaveAction(req.id, 'reject')}>Reject</MDButton>
                                        </MDBox>
                                    </MDBox>
                                </Grid>
                              ))}
                          </Grid>
                        )}
                    </ModernCard>
                </Grid>
            </Grid>
          )}
      </MDBox>
    );
};

// ==============================
// 2. STAFF DASHBOARD Redesign
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

        // If data exists for today, set the state so the button knows we are active
        if (storedDate === today && storedTime) {
            setIsCheckedIn(true);
            setCheckInTime(storedTime);
        }
    }, []);

    const handleAttendance = async () => {
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const token = localStorage.getItem("token");

        // Always determine the endpoint based on the current state
        const endpoint = isCheckedIn ? "check-out" : "check-in";
        const method = isCheckedIn ? "PUT" : "POST";

        try {
            const res = await fetch(`${API_URL}/attendance/${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: user.email })
            });

            if (res.ok) {
                if (!isCheckedIn) {
                    // Action: CHECK IN
                    setIsCheckedIn(true);
                    setCheckInTime(nowTime);
                    localStorage.setItem("checkInTime", nowTime);
                    localStorage.setItem("attendanceDate", new Date().toLocaleDateString());
                    Swal.fire("Success", `Checked in at ${nowTime}`, "success");
                } else {
                    // Action: CHECK OUT
                    setIsCheckedIn(false);
                    setCheckInTime(null);
                    localStorage.removeItem("checkInTime");
                    localStorage.removeItem("attendanceDate");
                    Swal.fire("Success", "Checked out successfully!", "success");
                }
            } else {
                // Handle the "Already Checked In" case from Backend
                const errorMsg = await res.text();
                if (errorMsg.includes("already checked in")) {
                    setIsCheckedIn(true);
                    Swal.fire("Info", "Check-in already recorded for today.", "info");
                } else {
                    Swal.fire("Error", "Action could not be completed.", "error");
                }
            }
        } catch (e) {
            Swal.fire("Server Error", "Could not connect to the attendance service.", "error");
        }
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
                Swal.fire("Request Sent", "Admin will review your request", "success");
                setLeaveDate(""); setLeaveReason("");
            }
        } catch (err) { Swal.fire("Error", "Submission failed", "error"); }
    };

    return (
      <MDBox mt={2}>
          {activeTab === 0 && (
            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} md={6}>
                    <ModernCard title="Daily Presence" icon="schedule" color="info">
                        <MDBox textAlign="center" py={2}>
                            <MDTypography variant="caption" color="text" mb={3} display="block">
                                {isCheckedIn ? "You are currently on duty." : "Press to record your today's attendance"}
                            </MDTypography>
                            <MDBox display="flex" justifyContent="center" mb={3}>
                                <MDButton
                                  variant="gradient"
                                  color={isCheckedIn ? "warning" : "success"}
                                  sx={{
                                      width: 140,
                                      height: 140,
                                      borderRadius: "50%",
                                      fontSize: "1rem",
                                      fontWeight: "bold",
                                      border: "8px solid #f0f2f5"
                                  }}
                                  onClick={handleAttendance}
                                >
                                    {isCheckedIn ? "CHECK OUT" : "CHECK IN"}
                                </MDButton>
                            </MDBox>
                            {isCheckedIn && (
                              <Chip
                                icon={<Icon>check_circle</Icon>}
                                label={`Active Since ${checkInTime}`}
                                color="success"
                                sx={{ color: "white", fontWeight: "bold" }}
                              />
                            )}
                        </MDBox>
                    </ModernCard>
                </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ModernCard title="Apply for Absence" icon="event" color="dark">
                        <MDBox component="form" onSubmit={handleApplyLeave}>
                            <MDInput type="date" fullWidth value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} sx={{mb: 2}} />
                            <MDInput label="Reason for Leave" multiline rows={4} fullWidth value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} sx={{mb: 3}} />
                            <MDButton variant="gradient" color="info" fullWidth type="submit">Submit Application</MDButton>
                        </MDBox>
                    </ModernCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <ModernCard title="Your Leave Tracker" icon="history" color="info">
                        {myLeaveHistory.length === 0 ? <MDTypography variant="button" color="text">No previous requests found.</MDTypography> : (
                          <List>
                              {myLeaveHistory.map((item, i) => (
                                <ListItem key={i} sx={{ px: 0, py: 1.5, borderBottom: "1px solid #f8f9fa" }}>
                                    <ListItemText
                                      primary={<MDTypography variant="button" fontWeight="bold">{item.startDate}</MDTypography>}
                                      secondary={<MDTypography variant="caption" color="text">{item.reason}</MDTypography>}
                                    />
                                    <Chip
                                      label={item.status}
                                      size="small"
                                      color={item.status === 'PENDING' ? 'warning' : item.status === 'APPROVED' ? 'success' : 'error'}
                                      sx={{ fontWeight: "bold", color: "white" }}
                                    />
                                </ListItem>
                              ))}
                          </List>
                        )}
                    </ModernCard>
                </Grid>
            </Grid>
          )}
      </MDBox>
    );
};
// ==============================
// 3. MAIN PROFILE CONTAINER
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
          <MDBox position="relative" mb={5}>
              <MDBox
                display="flex" alignItems="center" position="relative" minHeight="12rem" borderRadius="xl"
                sx={{ background: "linear-gradient(135deg, #1a237e 0%, #344767 100%)", overflow: "hidden" }}
              >
                  <MDBox sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.1, backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
              </MDBox>
              <Card sx={{ position: "relative", mt: -8, mx: 3, py: 3, px: 3, boxShadow: "0px 10px 30px rgba(0,0,0,0.1)", borderRadius: "16px" }}>
                  <Grid container spacing={3} alignItems="center">
                      <Grid item>
                          <Avatar sx={{ width: 70, height: 70, bgcolor: "#344767", fontSize: "1.8rem", shadow: "lg" }}>
                              {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                          </Avatar>
                      </Grid>
                      <Grid item>
                          <MDBox lineHeight={1}>
                              <MDTypography variant="h4" fontWeight="bold">{user.fullName}</MDTypography>
                              <MDBox display="flex" alignItems="center" mt={0.5}>
                                  <MDTypography variant="button" color="text" fontWeight="regular" mr={1}>{user.email}</MDTypography>
                                  <Chip label={user.role.toUpperCase()} size="small" color={user.role === 'admin' ? "error" : "success"} sx={{ fontWeight: "bold", color: "white", height: "20px" }} />
                              </MDBox>
                          </MDBox>
                      </Grid>
                      <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>
                          <AppBar position="static" sx={{ bgcolor: "transparent", boxShadow: "none" }}>
                              <Tabs orientation="horizontal" value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ "& .MuiTabs-indicator": { height: "4px", borderRadius: "2px" } }}>
                                  <Tab label="Workspace" icon={<Icon>dashboard</Icon>} />
                                  <Tab label={user.role === 'admin' ? "Approvals" : "Leave Log"} icon={<Icon>fact_check</Icon>} />
                                  <Tab label="Settings" icon={<Icon>settings</Icon>} />
                              </Tabs>
                          </AppBar>
                      </Grid>
                  </Grid>
              </Card>
          </MDBox>

          <MDBox mb={5}>
              {activeTab !== 2 && (
                user.role === 'admin' ? <AdminDashboard activeTab={activeTab} /> : <StaffDashboard activeTab={activeTab} user={user} />
              )}

              {activeTab === 2 && (
                <ModernCard title="Security & Profile" icon="security" color="dark">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <MDTypography variant="caption" fontWeight="bold" color="text" display="block" mb={2}>ACCOUNT DETAILS</MDTypography>
                            <MDInput label="Display Name" value={user.fullName} fullWidth sx={{mb:2}} />
                            <MDInput label="Registered Email" value={user.email} fullWidth disabled />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <MDTypography variant="caption" fontWeight="bold" color="text" display="block" mb={2}>AUTHENTICATION</MDTypography>
                            <MDInput label="Update Password" type="password" fullWidth placeholder="New Secure Password" sx={{mb: 2}} />
                            <MDBox display="flex" alignItems="center"><Switch defaultChecked /><MDTypography variant="button" color="text" ml={1}>Biometric Login</MDTypography></MDBox>
                        </Grid>
                        <Grid item xs={12} textAlign="right">
                            <Divider sx={{my: 3}} />
                            <MDButton variant="gradient" color="info" shadow="lg">Save Updated Info</MDButton>
                        </Grid>
                    </Grid>
                </ModernCard>
              )}
          </MDBox>
          <Footer />
      </DashboardLayout>
    );
}

export default Profile;