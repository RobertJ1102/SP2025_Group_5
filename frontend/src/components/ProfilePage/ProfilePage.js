import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { Box, List, ListItem, ListItemText } from "@mui/material";
import Info from "./Info";
import History from "./History";
import Preferences from "./Preferences";

function ProfilePage() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "calc(100vh - 64px)", // Subtract header height
        backgroundColor: "#f5f5f5",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <Box
          sx={{
            minWidth: "max-content",
            borderRight: "1px solid #ddd",
            padding: "16px",
          }}
        >
          <List component="nav">
            <ListItem
              button
              component={Link}
              to="/profile/info"
              sx={{ "&:hover": { backgroundColor: "#e0e0e0" } }}
            >
              <ListItemText
                primary="Info"
                sx={{
                  "& .MuiListItemText-primary": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                  },
                }}
              />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/profile/history"
              sx={{ "&:hover": { backgroundColor: "#e0e0e0" } }}
            >
              <ListItemText
                primary="History"
                sx={{
                  "& .MuiListItemText-primary": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                  },
                }}
              />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/profile/preferences"
              sx={{ "&:hover": { backgroundColor: "#e0e0e0" } }}
            >
              <ListItemText
                primary="Preferences"
                sx={{
                  "& .MuiListItemText-primary": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                  },
                }}
              />
            </ListItem>
          </List>
        </Box>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Navigate to="info" />} />
            <Route path="info" element={<Info />} />
            <Route path="history" element={<History />} />
            <Route path="preferences" element={<Preferences />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default ProfilePage;
