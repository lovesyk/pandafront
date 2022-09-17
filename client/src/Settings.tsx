import SyncIcon from '@mui/icons-material/Sync';
import SyncDisabledIcon from '@mui/icons-material/SyncDisabled';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import './App.css';
import BackendClient from './BackendClient';
import { ScannerStats } from './models/scannerStats.model';

export default function Settings() {
  const backend = new BackendClient()

  const [scannerStats, setScannerStats] = useState<ScannerStats>()
  useEffect(() => {
    updateScannerStats()
  }, [])
  function updateScannerStats() {
    backend.getScannerStats().then(setScannerStats)
  }

  return (
    <div>
      {scannerStats?.enabled ?
        <Button variant="contained" endIcon={<SyncDisabledIcon />} onClick={() => { backend.disableScanner(); updateScannerStats(); }}>Disable Scanner</Button>
        : <Button variant="contained" endIcon={<SyncIcon />} onClick={() => { backend.enableScanner(); updateScannerStats(); }}>Enable Scanner</Button>
      }
    </div>
  );
}
