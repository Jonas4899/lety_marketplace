import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import AppNavbar from "~/components/AppNavbar";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("recommended");

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 py-20">
        <Container maxWidth="lg">
          <div className="text-center">
            <Typography
              variant="h3"
              component="h1"
              className="text-white mb-4 font-bold"
            >
              Find Your Perfect Veterinary Care
            </Typography>
            <Typography variant="h6" className="text-white mb-8">
              Connect with trusted veterinarians in your area
            </Typography>

            {/* Search Section */}
            <div className="max-w-3xl mx-auto">
              <Card sx={{ p: 2 }}>
                <div className="flex flex-col md:flex-row gap-4">
                  <TextField
                    fullWidth
                    placeholder="Search by vet name or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {/* Replace SearchIcon with Unicode symbol */}
                          <span className="text-gray-400">🔍</span>
                        </InputAdornment>
                      ),
                    }}
                    className="flex-1"
                  />
                  <TextField
                    fullWidth
                    placeholder="Enter location..."
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {/* Replace LocationOnIcon with Unicode symbol */}
                          <span className="text-gray-400">📍</span>
                        </InputAdornment>
                      ),
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="contained"
                    size="large"
                    className="px-8 py-2"
                  >
                    Search
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
