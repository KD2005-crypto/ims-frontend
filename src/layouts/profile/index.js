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

// Images
import backgroundImage from "assets/images/bg-profile.jpeg";
import burceMars from "assets/images/bruce-mars.jpg";

// SweetAlert
import Swal from "sweetalert2";

// ✅ LIVE BACKEND URL
const API_URL = "https://ims-backend-production-e15c.up.railway.app/api";

// ==============================
// 1. ADMIN DASHBOARD COMPONENT
// ==============================
const AdminDashboard = ({ activeTab }) => {
  const [employeeAttendance, setEmployeeAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // 1. Get Today's Attendance
      const attRes = await fetch(`${API_URL}/attendance/today`);
      if (attRes.ok) setEmployeeAttendance(await attRes.json());

      // 2. Get Pending Leaves
      const leaveRes = await fetch(`${API_URL}/leaves/pending`);
      if (leaveRes.ok) setLeaveRequests(await leaveRes.json());
    } catch (error) {
      console.error("Backend Error:", error);
    }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/leaves/${id}/${status}`, { method: 'PUT' });
      if (res.ok) {
        Swal.fire("Success", `Request ${status}d`, "success");
        fetchAdminData(); // Refresh list
      }
    } catch (err) { Swal.fire("Error", "Network error", "error"); }
  };

  return (
    <MDBox mt={2}>
      {/* TAB 0: ATTENDANCE */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card><MDBox p={3}>
              <MDBox display="flex" justifyContent="space-between" mb={2}>
                <MDTypography variant="h6">Team Attendance</MDTypography>
                <MDButton size="small" onClick={fetchAdminData}>Refresh</MDButton>
              </MDBox>
              <List>
                {employeeAttendance.length === 0 && <MDTypography variant="caption">No records today.</MDTypography>}
                {employeeAttendance.map((emp, i) => (
                  <ListItem key={i} divider>
                    <ListItemAvatar><Avatar>{emp.name ? emp.name[0] : "U"}</Avatar></ListItemAvatar>
                    <ListItemText primary={emp.name || "Unknown"} secondary={emp.status} />
                    <MDBox bgColor={emp.status === "Present" ? "success" : "error"} borderRadius="lg" px={1}>
                      <MDTypography variant="caption" color="white" fontWeight="bold">{emp.status}</MDTypography>
                    </MDBox>
                  </ListItem>
                ))}
              </List>
            </MDBox></Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{height: '100%', textAlign: 'center', p: 3}}>
              <Icon fontSize="large" color="info">groups</Icon>
              <MDTypography variant="h3">{employeeAttendance.length}</MDTypography>
              <MDTypography variant="button">Present Today</MDTypography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: APPROVALS */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}><Card><MDBox p={3}>
            <MDTypography variant="h6" mb={2}>Pending Approvals</MDTypography>
            {leaveRequests.length === 0 ? <MDTypography variant="caption">No pending requests.</MDTypography> : (
              <List>
                {leaveRequests.map((req) => (
                  <ListItem key={req.id} divider>
                    <ListItemText primary={req.name} secondary={req.reason} />
                    <MDBox display="flex" gap={1}>
                      <MDButton size="small" color="success" onClick={() => handleLeaveAction(req.id, 'approve')}>Approve</MDButton>
                      <MDButton size="small" color="error" onClick={() => handleLeaveAction(req.id, 'reject')}>Reject</MDButton>
                    </MDBox>
                  </ListItem>
                ))}
              </List>
            )}
          </MDBox></Card></Grid>
        </Grid>
      )}
    </MDBox>
  );
};

// ==============================
// 2. STAFF DASHBOARD COMPONENT
// ==============================
const StaffDashboard = ({ activeTab, user }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);

  // LEAVE STATE
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [myLeaveHistory, setMyLeaveHistory] = useState([]);

  useEffect(() => {
    // 1. Check Local Attendance State
    const today = new Date().toLocaleDateString();
    const storedDate = localStorage.getItem("attendanceDate");
    const storedTime = localStorage.getItem("checkInTime");

    if (storedDate === today && storedTime) {
      setIsCheckedIn(true);
      setCheckInTime(storedTime);
    } else {
      localStorage.removeItem("checkInTime");
      setIsCheckedIn(false);
    }
  }, []);

  const handleAttendance = async () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayDate = new Date().toLocaleDateString();

    if (isCheckedIn) {
      // --- CHECK OUT ---
      try {
        const res = await fetch(`${API_URL}/attendance/check-out`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        });

        if (res.ok) {
          setIsCheckedIn(false);
          setCheckInTime(null);
          localStorage.removeItem("checkInTime");
          Swal.fire("Success", "Checked Out Successfully!", "success");
        } else {
          Swal.fire("Error", "Check-out failed", "error");
        }
      } catch (e) { Swal.fire("Error", "Network Error", "error"); }

    } else {
      // --- CHECK IN ---
      try {
        const res = await fetch(`${API_URL}/attendance/check-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, name: user.fullName })
        });

        if (res.ok) {
          setIsCheckedIn(true);
          setCheckInTime(nowTime);
          localStorage.setItem("checkInTime", nowTime);
          localStorage.setItem("attendanceDate", todayDate);
          Swal.fire("Success", `Checked In at ${nowTime}`, "success");
        } else {
          const text = await res.text();
          Swal.fire("Info", text, "info");
          // If already checked in, sync state
          setIsCheckedIn(true);
        }
      } catch (e) { Swal.fire("Error", "Could not connect to server", "error"); }
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveDate) return Swal.fire("Error", "Select a date", "warning");

    setMyLeaveHistory([{ date: leaveDate, reason: leaveReason, status: "Pending" }, ...myLeaveHistory]);
    Swal.fire("Sent", "Leave request sent.", "success");
    setLeaveDate(""); setLeaveReason("");
  };

  return (
    <MDBox mt={2}>
      {/* TAB 0: CHECK IN */}
      {activeTab === 0 && (
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", textAlign: "center", p: 4 }}>
              <MDTypography variant="h5">Daily Attendance</MDTypography>
              <MDButton
                variant="gradient"
                color={isCheckedIn ? "warning" : "success"}
                size="large" circular sx={{ width: 150, height: 150, my: 3 }}
                onClick={handleAttendance}
              >
                {isCheckedIn ? "CHECK OUT" : "CHECK IN"}
              </MDButton>
              {isCheckedIn && <MDTypography variant="h6" color="success">Checked In at {checkInTime}</MDTypography>}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: APPLY LEAVE */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}><Card><MDBox p={3}>
            <MDTypography variant="h6" mb={2}>Apply for Leave</MDTypography>
            <MDBox component="form" onSubmit={handleApplyLeave}>
              <MDInput type="date" fullWidth value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} sx={{mb: 2}} />
              <MDInput label="Reason" multiline rows={3} fullWidth value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} sx={{mb: 2}} />
              <MDButton variant="gradient" color="dark" fullWidth type="submit">Send Request</MDButton>
            </MDBox>
          </MDBox></Card></Grid>
          <Grid item xs={12} md={5}><Card><MDBox p={3}>
            <MDTypography variant="h6">My History</MDTypography>
            {myLeaveHistory.map((item, i) => (
              <MDBox key={i} p={1} mb={1} bgColor="grey-100"><MDTypography variant="caption">{item.date} - {item.status}</MDTypography></MDBox>
            ))}
          </MDBox></Card></Grid>
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

    if (!storedUser) {
      navigate("/authentication/sign-in");
      return;
    }

    // 🛡️ ROLE RECOVERY LOGIC
    let finalRole = "staff";

    // 1. Check LocalStorage
    if (storedRole && storedRole.toLowerCase() === "admin") finalRole = "admin";

    // 2. Check User Object
    if (storedUser.role && storedUser.role.toLowerCase() === "admin") finalRole = "admin";

    // 3. (Optional) Force Admin if email contains "admin"
    if (storedUser.email && storedUser.email.toLowerCase().includes("admin")) finalRole = "admin";

    setUser({ ...storedUser, role: finalRole });
  }, [navigate]);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  if (!user) return <MDTypography p={3}>Loading...</MDTypography>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <MDBox position="relative" mb={5}>
        <MDBox display="flex" alignItems="center" position="relative" minHeight="18.75rem" borderRadius="xl" sx={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "50%" }} />
        <Card sx={{ position: "relative", mt: -8, mx: 3, py: 2, px: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item><MDAvatar src={burceMars} alt="profile-image" size="xl" shadow="sm" /></Grid>
            <Grid item>
              <MDBox height="100%" mt={0.5} lineHeight={1}>
                <MDTypography variant="h5" fontWeight="medium">{user.fullName}</MDTypography>
                <MDTypography variant="button" color="text" fontWeight="regular">{user.email} • <b style={{color: user.role === 'admin' ? 'red' : 'green'}}>{user.role.toUpperCase()}</b></MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={5} sx={{ ml: "auto" }}>
              <AppBar position="static">
                <Tabs orientation="horizontal" value={activeTab} onChange={handleTabChange}>
                  <Tab label="Workspace" icon={<Icon>work</Icon>} />
                  <Tab label={user.role === 'admin' ? "Approvals" : "Messages"} icon={<Icon>email</Icon>} />
                  <Tab label="Settings" icon={<Icon>settings</Icon>} />
                </Tabs>
              </AppBar>
            </Grid>
          </Grid>
        </Card>
      </MDBox>

      <MDBox mt={3} mb={3}>
        {/* RENDER DASHBOARDS (Tabs 0 & 1) */}
        {user.role === 'admin' ? <AdminDashboard activeTab={activeTab} /> : <StaffDashboard activeTab={activeTab} user={user} />}

        {/* ✅ TAB 2: SETTINGS */}
        {activeTab === 2 && (
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={3}>Account Settings</MDTypography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MDTypography variant="caption" fontWeight="bold" color="text">PROFILE INFO</MDTypography>
                  <MDBox mt={2} mb={2}><MDInput label="Full Name" value={user.fullName} fullWidth /></MDBox>
                  <MDBox mb={2}><MDInput label="Email Address" value={user.email} fullWidth disabled /></MDBox>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDTypography variant="caption" fontWeight="bold" color="text">SECURITY</MDTypography>
                  <MDBox mt={2} mb={2}><MDInput label="New Password" type="password" fullWidth placeholder="Leave blank to keep current" /></MDBox>
                  <MDBox display="flex" alignItems="center" mb={2}><Switch defaultChecked /><MDTypography variant="button" color="text" ml={1}>Email Notifications</MDTypography></MDBox>
                </Grid>
                <Grid item xs={12}><Divider /><MDButton variant="gradient" color="info">Save Changes</MDButton></Grid>
              </Grid>
            </MDBox>
          </Card>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Profile;