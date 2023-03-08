import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Button, ButtonGroup, Divider, SwipeableDrawer } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import './App.css';
import BackendClient from './BackendClient';
import { ScannerStats } from './models/scannerStats.model';


export default function Settings() {
  const backend = new BackendClient()

  const [scannerStats, setScannerStats] = useState<ScannerStats | null>(null)
  useEffect(() => {
    setTimeout(() => updateScannerStats(), 5000);
  }, [scannerStats])
  function updateScannerStats() {
    backend.getScannerStats().then(setScannerStats)
  }

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const toggleDrawer =
    (open: boolean) =>
      (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
          event &&
          event.type === 'keydown' &&
          ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
          return;
        }

        setDrawerOpen(open);
      };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            pandafront
          </Typography>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open settings"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <Box alignItems="center"
          sx={{ width: '360px', maxWidth: 360 }}
          justifyContent="space-between"
          display="flex"
          padding={2}>
          <Typography>
            Settings
          </Typography>
          <IconButton color="primary" aria-label="close settings" onClick={toggleDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider variant="fullWidth" />
        <Box sx={{ width: '360px', maxWidth: 360 }}
          padding={2}>
          <Typography variant="overline">Scanner {!scannerStats ? "(Loading...)" : scannerStats.initialScanRunning ? "(Running...)" : ""}</Typography>
          {scannerStats ?
            <ButtonGroup size="large" fullWidth={true}>
              <Button variant={scannerStats.enabled ? 'contained' : 'outlined'} disabled={scannerStats.initialScanRunning ? true : false} startIcon={<VisibilityIcon />} onClick={async () => { setScannerStats(null); await backend.enableScanner(); await updateScannerStats(); }}>Enabled</Button>
              <Button variant={scannerStats.enabled ? 'outlined' : 'contained'} disabled={scannerStats.initialScanRunning ? true : false} startIcon={<VisibilityOffIcon />} onClick={async () => { setScannerStats(null); await backend.disableScanner(); await updateScannerStats(); }}>Disabled</Button>
            </ButtonGroup>
            : ""}
        </Box>
      </SwipeableDrawer>
    </Box>
  );
}
