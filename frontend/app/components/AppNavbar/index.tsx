import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Cat, Hospital } from "lucide-react";

const pages = ["Products", "Pricing", "Blog"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

export default function AppNavbar() {
  const [auth, setAuth] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenRegisterModal = () => {
    setOpenRegisterModal(true);
  };

  const handleCloseRegisterModal = () => {
    setOpenRegisterModal(false);
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "background.paper" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: "flex",
              flexGrow: 1,
              fontWeight: 400,
              letterSpacing: ".1rem",
              color: "black",
              textDecoration: "none",
            }}
          >
            Lety Marketplace
          </Typography>

          {auth ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography sx={{ textAlign: "center" }}>
                      {setting}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="text" sx={{ color: "primary.main" }}>
                Iniciar Sesión
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenRegisterModal}
              >
                Registrarse
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>

      {/* Modal de registro */}
      <Dialog
        open={openRegisterModal}
        onClose={handleCloseRegisterModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          ¿Cómo deseas registrarte?
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Grid
            container
            spacing={3}
            justifyContent="center"
            sx={{ p: 2, gap: 2 }}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  textAlign: "center",
                  height: "100%",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                  },
                }}
                onClick={() => console.log("Registro como dueño de mascota")}
              >
                <Cat size={48} strokeWidth={1.5} color="#1976d2" />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Dueño de Mascota
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Registrate como dueño de mascota para encontrar servicios
                  veterinarios
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  textAlign: "center",
                  height: "100%",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                  },
                }}
                onClick={() => console.log("Registro como clínica veterinaria")}
              >
                <Hospital size={48} strokeWidth={1.5} color="#1976d2" />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Clínica Veterinaria
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Registrate como clínica para ofrecer tus servicios
                  veterinarios
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </AppBar>
  );
}
