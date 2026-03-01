# Metric Sync Feature

## Overview

This feature allows administrators to synchronize average evaluation scores per metric for each personnel member. These synced averages can then be used to auto-populate the manual prediction form, streamlining the prediction process.

## How It Works

### 1. Database Schema Updates

Added new fields to the `Personnel` schema to store individual metric averages:

**For Teaching Personnel:**
- `avgPAA` - Average Professionalism & Attitude
- `avgKSM` - Average Knowledge & Skills Mastery
- `avgTS` - Average Technical Skills
- `avgCM` - Average Communication Management
- `avgAL` - Average Attitude & Leadership
- `avgGO` - Average Goal Orientation

**For Non-Teaching Personnel:**
- `avgJK` - Average Job Knowledge
- `avgWQ` - Average Work Quality
- `avgPR` - Average Productivity
- `avgTW` - Average Teamwork
- `avgRL` - Average Reliability
- `avgIN` - Average Initiative

**Additional Field:**
- `lastMetricSync` - Timestamp of last sync operation

### 2. Backend API Endpoints

**New Endpoints:**

#### Sync Individual Personnel Metrics
```
POST /personnel/:id/sync-metrics
```
Calculates and saves the average scores for each metric based on all evaluations for the specified personnel.

**Response:**
```json
{
  "_id": "...",
  "firstName": "John",
  "lastName": "Doe",
  "avgPAA": 4.25,
  "avgKSM": 4.50,
  "avgTS": 4.10,
  "avgCM": 4.30,
  "avgAL": 4.40,
  "avgGO": 4.20,
  "lastMetricSync": "2026-02-23T..."
}
```

#### Sync All Personnel Metrics
```
POST /personnel/sync-all-metrics
```
Syncs metric averages for all personnel in the system.

**Response:**
```json
{
  "total": 150,
  "synced": 148,
  "failed": 2
}
```

### 3. Frontend Features

#### Personnel Management Page

Added a **"Sync Metrics"** button in the personnel management page (`/admin/personnel`) that:
- Triggers the sync operation for all personnel
- Shows a loading state while syncing
- Displays a success toast with sync results
- Refreshes the personnel list after completion

**Location:** Next to "Calculate Excellence", "Classify All", and "Bulk Upload" buttons

#### Manual Prediction Form

Updated the manual prediction form (`/dashboard/ml/manual-prediction`) to:
- Automatically fetch personnel details when selected
- Auto-populate metric input fields (PAA, KSM, TS, CM, AL, GO) with synced averages
- Display a success toast when metrics are auto-populated
- Allow manual override of auto-populated values

## Usage Instructions

### For Administrators

1. **Initial Sync:**
   - Navigate to `/admin/personnel`
   - Click the **"Sync Metrics"** button
   - Wait for the sync operation to complete
   - Review the success message showing how many personnel were synced

2. **Regular Maintenance:**
   - Re-run the sync periodically (e.g., monthly or after evaluation periods)
   - This ensures the averages reflect the latest evaluation data

### For Users Making Predictions

1. **Manual Prediction with Auto-Population:**
   - Navigate to `/dashboard/ml/manual-prediction`
   - Select a personnel from the dropdown
   - The metric fields will automatically populate with their historical averages
   - (Optional) Adjust any metric values if needed
   - Enter a semester
   - Click "Get Prediction"

2. **Benefits:**
   - Saves time by not manually entering all metrics
   - Uses historical data as a baseline
   - Still allows manual adjustments for specific scenarios

## Technical Implementation Details

### Service Layer (`personnel.service.ts`)

**`syncMetricAverages(personnelId: string)`**
- Fetches all evaluations for the specified personnel
- Separates logic for Teaching vs Non-Teaching personnel
- Calculates average for each metric
- Updates personnel record with rounded averages (2 decimal places)
- Records sync timestamp

**`syncAllMetricAverages()`**
- Iterates through all personnel
- Calls `syncMetricAverages` for each
- Tracks success/failure counts
- Returns summary statistics

### Frontend Integration

**API Functions (`personnel.api.ts`):**
```typescript
export const syncPersonnelMetrics = async (id: string): Promise<Personnel>
export const syncAllMetrics = async (): Promise<{ total, synced, failed }>
export const getPersonnelById = async (id: string): Promise<Personnel>
```

**Auto-Population Logic:**
```typescript
useEffect(() => {
  const loadPersonnelMetrics = async () => {
    if (personnelId) {
      const personnel = await getPersonnelById(personnelId);
      if (personnel.personnelType === 'Teaching' && personnel.avgPAA !== undefined) {
        setMetrics({
          PAA: personnel.avgPAA?.toString() || '',
          KSM: personnel.avgKSM?.toString() || '',
          // ... other metrics
        });
        toast.success('Metrics auto-populated from synced averages');
      }
    }
  };
  loadPersonnelMetrics();
}, [personnelId]);
```

## Data Flow

```
1. Evaluations are submitted normally
   ↓
2. Admin clicks "Sync Metrics"
   ↓
3. System calculates averages from all evaluations
   ↓
4. Averages are stored in personnel records
   ↓
5. User selects personnel in manual prediction
   ↓
6. Form auto-populates with synced averages
   ↓
7. User can adjust values or proceed with prediction
```

## Important Notes

- **Teaching vs Non-Teaching:** The system handles different metric sets automatically based on `personnelType`
- **No Evaluations:** If a personnel has no evaluations, metrics are set to `null`
- **Manual Override:** Auto-populated values can always be manually changed
- **Historical Data:** Synced averages represent ALL historical evaluations, not just recent ones
- **Timestamp:** `lastMetricSync` helps track when data was last refreshed

## Future Enhancements

Potential improvements for this feature:
- Add date range filters for sync (e.g., only last 2 years)
- Individual personnel sync button in personnel table
- Display last sync timestamp in UI
- Scheduled automatic sync (daily/weekly)
- Sync status indicator per personnel
- Weighted averages (more recent evaluations weighted higher)

## Related Files

### Backend
- `api/src/modules/personnel/schemas/personnel.schema.ts` - Schema updates
- `api/src/modules/personnel/personnel.service.ts` - Sync logic
- `api/src/modules/personnel/personnel.controller.ts` - API endpoints

### Frontend
- `web/types/personnel.ts` - TypeScript interface updates
- `web/lib/api/personnel.api.ts` - API client functions
- `web/app/admin/personnel/page.tsx` - Sync button UI
- `web/app/dashboard/ml/manual-prediction/page.tsx` - Auto-population logic

## Testing Checklist

- [ ] Sync all metrics successfully
- [ ] Verify averages are calculated correctly
- [ ] Test auto-population in manual prediction
- [ ] Verify manual override works
- [ ] Test with personnel having no evaluations
- [ ] Test with both Teaching and Non-Teaching personnel
- [ ] Verify sync timestamp is recorded
- [ ] Test error handling for failed syncs
