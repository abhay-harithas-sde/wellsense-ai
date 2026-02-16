# Real-Time Database Sync Guide

**Status:** ✅ CONFIGURED  
**Sync Interval:** 1 second  
**Auto Turn Off:** ❌ DISABLED (Never stops)  
**Date:** February 16, 2026

---

## Overview

The WellSense AI platform now features real-time database synchronization that:
- Syncs every 1 second between frontend and backend
- Never automatically turns off
- Includes watchdog monitoring for automatic restart
- Syncs across PostgreSQL, MongoDB, and Redis

---

## Configuration

### Backend Sync Settings

**File:** `automations/auto-database-sync.js`

```javascript
{
  interval: 1000,           // 1 second
  autoTurnOff: false,       // Never turn off
  syncTables: [
    'users',
    'healthRecords',
    'goals',
    'weightRecords',
    'exerciseRecords',
    'nutritionRecords'
  ]
}
```

### Frontend Sync Settings

**File:** `src/hooks/useHealthDataSync.js`

```javascript
{
  syncInterval: 1000,       // 1 second
  autoSync: true,
  neverStop: true,
  includeProfile: true,
  includeHealthRecords: true,
  includeWeightData: true,
  includeDashboard: true
}
```

---

## Features

### 1. Real-Time Sync (1 Second Interval)

**Backend:**
- Syncs PostgreSQL → MongoDB → Redis
- Processes all configured tables
- Optimized for high-frequency updates
- Reduced logging to prevent console spam

**Frontend:**
- Fetches latest data every second
- Updates UI automatically
- Uses caching for performance
- Fallback to cached data on errors

### 2. Never Auto Turn Off

**Mechanisms:**
- `autoTurnOff: false` flag
- Continuous interval execution
- No timeout or stop conditions
- Runs indefinitely until manually stopped

### 3. Watchdog Monitoring

**File:** `automations/sync-watchdog.js`

**Features:**
- Monitors sync health every 5 seconds
- Detects if sync has stopped or stalled
- Automatically restarts sync if unhealthy
- Tracks restart attempts (max 10)
- Emits health status events

**Health Checks:**
- Verifies sync interval is running
- Checks sync count is increasing
- Validates expected sync frequency
- Auto-restarts on failure

### 4. Performance Optimization

**Reduced Logging:**
- Only logs every 10th sync (every 10 seconds)
- Always logs errors
- Silent operation for normal syncs
- Detailed logs on health issues

**Efficient Queries:**
- Batch processing (100 records per sync)
- Indexed database queries
- Cached results where possible
- Parallel table syncs

---

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  useHealthDataSync Hook (1 second interval)          │  │
│  │  - Fetches latest data                               │  │
│  │  - Updates React state                               │  │
│  │  - Triggers UI re-render                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AutoDatabaseSync (1 second interval)                │  │
│  │  - PostgreSQL → MongoDB                              │  │
│  │  - PostgreSQL → Redis (cache)                        │  │
│  │  - Batch processing                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SyncWatchdog (5 second checks)                      │  │
│  │  - Monitors sync health                              │  │
│  │  - Auto-restarts if needed                           │  │
│  │  - Prevents sync from stopping                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      DATABASES                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │PostgreSQL│  │ MongoDB  │  │  Redis   │                 │
│  │(Primary) │  │(Document)│  │ (Cache)  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Usage

### Starting the System

```bash
# Start GOD server (sync starts automatically)
node god-server.js
```

**Output:**
```
🔄 Auto Database Sync: Starting...
   Interval: 1s (REAL-TIME)
   Tables: users, healthRecords, goals
   Auto Turn Off: NO - CONTINUOUS
✅ Auto Database Sync: Started
   ⚡ REAL-TIME MODE: Syncing every 1 second
   🔒 CONTINUOUS MODE: Will never auto turn off

🐕 Sync Watchdog: Starting...
   Check Interval: 5s
   Max Restarts: 10
   Auto Restart: Enabled
✅ Sync Watchdog: Started
   🔒 Sync will be monitored and auto-restarted if needed
```

### Monitoring Sync Status

**Via API:**
```bash
curl http://localhost:3000/api/automations/status
```

**Response:**
```json
{
  "success": true,
  "status": {
    "modules": {
      "databaseSync": {
        "enabled": true,
        "interval": 1000,
        "syncCount": 1234,
        "lastSyncTime": "2026-02-16T...",
        "isRunning": true
      },
      "watchdog": {
        "enabled": true,
        "isHealthy": true,
        "restartCount": 0,
        "isRunning": true
      }
    }
  }
}
```

### Frontend Usage

**Dashboard automatically syncs:**
```javascript
// Dashboard.jsx already configured
const { dashboardData, isSyncing, lastSyncTime } = useHealthDataSync({
  syncInterval: 1000, // 1 second
  autoSync: true
});
```

**Custom component:**
```javascript
import useHealthDataSync from '../hooks/useHealthDataSync';

function MyComponent() {
  const {
    healthData,
    isSyncing,
    lastSyncTime,
    syncNow
  } = useHealthDataSync({
    syncInterval: 1000,
    autoSync: true,
    includeHealthRecords: true
  });

  return (
    <div>
      <p>Last sync: {lastSyncTime?.toLocaleTimeString()}</p>
      <p>Status: {isSyncing ? 'Syncing...' : 'Up to date'}</p>
      <button onClick={syncNow}>Force Sync</button>
    </div>
  );
}
```

---

## Monitoring & Debugging

### Check Sync Health

**Console Output:**
```
🔄 Sync #10 completed in 45ms
   Success: 3, Failed: 0
   Last sync: 9:30:45 AM

🔄 Sync #20 completed in 42ms
   Success: 3, Failed: 0
   Last sync: 9:30:55 AM
```

### Watchdog Alerts

**Healthy:**
```
🐕 Watchdog Health Check:
   Sync Running: ✅
   Sync Count: 1234 (10 new)
   Expected Syncs: 5
   Health Status: ✅ HEALTHY
```

**Unhealthy (Auto-restart):**
```
⚠️  Sync appears to be stopped or stalled!
🔄 Attempting to restart sync (Attempt 1/10)...
   ⏹️  Stopped existing sync
   ✅ Sync restarted successfully
   🎉 Sync stable - reset restart counter
```

### Error Handling

**Sync Errors:**
```
❌ Sync failed: healthRecords - Connection timeout
🔄 Retrying in 1 second...
✅ Retry successful
```

**Watchdog Max Restarts:**
```
❌ Max restart attempts reached!
   Manual intervention required.
💡 Check database connections and server logs
```

---

## Performance Metrics

### Expected Performance

| Metric | Value |
|--------|-------|
| Sync Interval | 1 second |
| Sync Duration | 30-100ms |
| Records per Sync | Up to 100 per table |
| Tables Synced | 6 tables |
| Total Syncs/Hour | 3,600 |
| Total Syncs/Day | 86,400 |

### Resource Usage

| Resource | Usage |
|----------|-------|
| CPU | 1-3% (idle) |
| Memory | ~50MB (sync process) |
| Network | ~10KB/sec |
| Database Load | Minimal (indexed queries) |

---

## Configuration Files

### Main Config
- `config/sync-config.js` - Central configuration
- `automations/auto-database-sync.js` - Backend sync
- `src/hooks/useHealthDataSync.js` - Frontend sync
- `automations/sync-watchdog.js` - Watchdog monitor

### Environment Variables

```env
# Sync Configuration
SYNC_INTERVAL=1000
SYNC_AUTO_TURN_OFF=false
SYNC_WATCHDOG_ENABLED=true
SYNC_LOG_VERBOSE=false
```

---

## Troubleshooting

### Sync Not Running

**Check:**
1. GOD server is running
2. Database connections are healthy
3. Check console for errors
4. Verify watchdog is enabled

**Solution:**
```bash
# Restart GOD server
Ctrl+C
node god-server.js
```

### Sync Too Slow

**Symptoms:**
- Sync duration > 500ms
- UI feels laggy
- High CPU usage

**Solutions:**
1. Reduce batch size in config
2. Add database indexes
3. Optimize queries
4. Increase sync interval to 2-3 seconds

### Watchdog Constantly Restarting

**Symptoms:**
- Frequent restart messages
- Restart count increasing
- Sync unstable

**Solutions:**
1. Check database connections
2. Review error logs
3. Increase watchdog check interval
4. Verify network stability

---

## Best Practices

### Do's ✅
- Monitor sync health regularly
- Keep database indexes updated
- Use caching where possible
- Log errors for debugging
- Test sync performance under load

### Don'ts ❌
- Don't manually stop sync (watchdog will restart)
- Don't reduce interval below 1 second
- Don't sync large datasets without batching
- Don't ignore watchdog alerts
- Don't disable error logging

---

## API Endpoints

### Get Sync Status
```
GET /api/automations/status
```

### Force Sync Now
```
POST /api/automations/sync-now
```

### Get Sync History
```
GET /api/automations/sync-history?limit=100
```

### Restart Sync
```
POST /api/automations/restart-sync
```

---

## Future Enhancements

- [ ] WebSocket-based real-time updates
- [ ] Selective sync (only changed records)
- [ ] Sync priority queues
- [ ] Multi-region sync
- [ ] Conflict resolution
- [ ] Sync analytics dashboard
- [ ] Custom sync intervals per table
- [ ] Sync pause/resume API

---

## Summary

✅ Real-time sync every 1 second  
✅ Never auto turns off  
✅ Watchdog monitoring  
✅ Auto-restart on failure  
✅ Optimized performance  
✅ Comprehensive error handling  
✅ Production ready  

**Status:** 🟢 OPERATIONAL

---

**Last Updated:** February 16, 2026  
**Version:** 2.0.0  
**Sync Mode:** REAL-TIME CONTINUOUS
