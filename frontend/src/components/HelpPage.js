import React from "react";
import { Typography, List, ListItem, ListItemText, Paper } from "@mui/material";

const HelpPage = () => {
  return (
    <div style={{ padding: "32px", maxWidth: "800px", margin: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "600" }}>
        Help & Support
      </Typography>
      <Typography variant="body1" gutterBottom>
        Welcome to FareFinder! This page will guide you through the features of the application and how to use them
        effectively.
      </Typography>

      <Paper elevation={3} sx={{ padding: "16px", marginTop: "16px" }}>
        <Typography variant="h5" gutterBottom>
          Features
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Search for Rides"
              secondary="Enter your pickup and destination locations to find the best ride options available."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Profile Management"
              secondary="Update your personal information, view ride history, and set preferences in your profile."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Change Password"
              secondary="Securely update your password from the Change Password page."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Forgot Password"
              secondary="Reset your password if you forget it by providing your registered email address."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ padding: "16px", marginTop: "16px" }}>
        <Typography variant="h5" gutterBottom>
          How to Use
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Step 1: Register or Login"
              secondary="Create an account or log in using your credentials to access the application."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Step 2: Enter Locations"
              secondary="Use the input fields on the homepage to specify your pickup and destination locations."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Step 3: View Ride Options"
              secondary="FareFinder will display the best ride options based on your input."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Step 4: Manage Your Profile"
              secondary="Access your profile to view ride history, update preferences, or change your password."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ padding: "16px", marginTop: "16px" }}>
        <Typography variant="h5" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Why can't I log in?"
              secondary="Ensure that your username and password are correct. If you forgot your password, use the Forgot Password option."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="How do I update my profile?"
              secondary="Go to the Profile page and edit your information. Don't forget to save your changes."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Is my data secure?"
              secondary="Yes, FareFinder uses secure protocols to protect your data."
            />
          </ListItem>
        </List>
      </Paper>

      <Typography variant="body2" color="textSecondary" sx={{ marginTop: "16px" }}>
        If you need further assistance, please contact our support team at support@farefinder.com.
      </Typography>
    </div>
  );
};

export default HelpPage;
