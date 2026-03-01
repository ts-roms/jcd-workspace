# Default Training File Configuration

## Overview

The ML training system now includes a default training dataset that can be used to quickly train the performance prediction model without uploading a custom file. This simplifies the initial setup and provides a working baseline model.

## Default File Location

**File Path:** `api/data/employee_history_sample.csv`

**Original Source:** `C:\Users\iamroms\Desktop\employee_history_sample.csv`

## File Structure

The default CSV file contains historical employee performance data with the following columns:

| Column | Description | Data Type | Range |
|--------|-------------|-----------|-------|
| PAA | Professionalism & Attitude Assessment | Number | 1.0 - 5.0 |
| KSM | Knowledge & Skill Management | Number | 1.0 - 5.0 |
| TS | Technical Skills | Number | 1.0 - 5.0 |
| CM | Communication Management | Number | 1.0 - 5.0 |
| AL | Attitude & Leadership | Number | 1.0 - 5.0 |
| GO | Goal Orientation | Number | 1.0 - 5.0 |
| GEN AVG | General Average (Target) | Number | 1.0 - 5.0 |

### Sample Data

```csv
PAA,KSM,TS,CM,AL,GO,GEN AVG
4.63,4.62,4.61,4.62,4.62,4.58,4.61
4.36,4.41,4.42,4.39,4.41,4.40,4.40
3.69,3.72,3.74,3.59,3.54,3.58,3.64
4.02,3.98,4.03,4.05,4.04,3.99,4.02
```

## How It Works

### Backend Implementation

**File:** `api/src/modules/ml/ml.controller.ts`

The training endpoint now makes file upload optional:

```typescript
@Post('train')
@UseInterceptors(FileInterceptor('file'))
async trainModel(
  @UploadedFile() file?: Express.Multer.File,
): Promise<TrainingResponse> {
  let fileBuffer: Buffer;

  if (file) {
    // Use uploaded file
    fileBuffer = file.buffer;
  } else {
    // Use default CSV file
    const defaultFilePath = path.join(
      __dirname, '..', '..', '..', 'data', 'employee_history_sample.csv'
    );

    if (!fs.existsSync(defaultFilePath)) {
      throw new BadRequestException(
        'No file uploaded and default training file not found. ' +
        'Please upload a CSV file or ensure employee_history_sample.csv exists in the data directory.'
      );
    }

    fileBuffer = fs.readFileSync(defaultFilePath);
  }

  return this.mlService.trainModelFromFile(fileBuffer);
}
```

**Logic Flow:**

1. Check if user uploaded a file
2. If yes → Use uploaded file buffer
3. If no → Load default CSV from `api/data/employee_history_sample.csv`
4. If default file doesn't exist → Throw error
5. Pass buffer to `trainModelFromFile()` service method

### Frontend Implementation

**File:** `web/app/dashboard/ml/training/page.tsx`

Added two training options:

#### Option 1: Use Default Dataset

```typescript
const handleTrainWithDefault = () => {
  const formData = new FormData();
  // Don't append file, backend will use default
  trainMutation.mutate(formData);
};
```

**Button:**
```tsx
<Button
  onClick={handleTrainWithDefault}
  disabled={trainMutation.isPending}
  variant="outline"
>
  <Brain className="mr-2 h-4 w-4" />
  Use Default Dataset
</Button>
```

#### Option 2: Train with Custom File

```typescript
const handleSubmit = () => {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  trainMutation.mutate(formData);
};
```

**Button:**
```tsx
<Button onClick={handleSubmit} disabled={trainMutation.isPending || !file}>
  <Upload className="mr-2 h-4 w-4" />
  Train with Custom File
</Button>
```

## User Interface

### Green Alert Notice

A new green alert box informs users about the default dataset:

```tsx
<Alert className="border-green-200 bg-green-50">
  <Info className="h-4 w-4 text-green-600" />
  <AlertTitle>Default Training File Available</AlertTitle>
  <AlertDescription>
    <p>A default training dataset (employee_history_sample.csv) is available for quick model training.</p>
    <p>You can either use the default file or upload your own custom dataset.</p>
  </AlertDescription>
</Alert>
```

### Training Options

Users now see two buttons:

1. **"Use Default Dataset"** - Trains immediately with the built-in CSV
2. **"Train with Custom File"** - Requires file selection first

## Usage Instructions

### Quick Start (Default Dataset)

1. Navigate to `/dashboard/ml/training`
2. Click **"Use Default Dataset"** button
3. Wait for training to complete (~10-30 seconds)
4. Model is now ready for predictions

**No file selection needed!**

### Custom Dataset Training

1. Navigate to `/dashboard/ml/training`
2. Click **"Select File"** and choose your CSV/Excel file
3. Verify file name appears next to input
4. Click **"Train with Custom File"**
5. Wait for training to complete
6. Model is updated with your custom data

## Updating the Default File

### Option 1: Replace Existing File

```bash
# From project root
cp /path/to/new/dataset.csv api/data/employee_history_sample.csv
```

### Option 2: Update Location in Code

Edit `api/src/modules/ml/ml.controller.ts`:

```typescript
const defaultFilePath = path.join(
  __dirname, '..', '..', '..', 'data', 'your-new-file.csv'
);
```

### File Requirements

Any replacement file must have:
- CSV format (or XLSX/XLS)
- Required columns: PAA, KSM, TS, CM, AL, GO, GEN AVG
- Numeric values in range 1.0 - 5.0
- At least 20 rows (recommended: 100+)
- No missing values

## Benefits

### 1. Faster Onboarding
- New users can train model immediately
- No need to prepare training data upfront
- Working model available in seconds

### 2. Consistent Baseline
- All deployments start with same baseline model
- Predictable initial performance
- Easier to compare custom models against baseline

### 3. Demo & Testing
- Perfect for demonstrations
- QA testing doesn't require custom data
- Development environments work out-of-box

### 4. Fallback Option
- If custom training fails, can revert to default
- Always have a working dataset available
- Reduces support burden

## Error Handling

### Missing Default File

**Error:**
```
BadRequestException: No file uploaded and default training file not found.
Please upload a CSV file or ensure employee_history_sample.csv exists in the data directory.
```

**Solution:**
1. Verify `api/data/employee_history_sample.csv` exists
2. Check file path in controller code
3. Re-copy file from source location

### Invalid Default File

**Error:**
```
Error: No data found in the uploaded file
```

**Solution:**
1. Verify CSV has header row
2. Check file isn't corrupted
3. Ensure proper column names (PAA, KSM, etc.)

### Permissions Error

**Error:**
```
EACCES: permission denied
```

**Solution:**
```bash
# Make file readable
chmod 644 api/data/employee_history_sample.csv
```

## Testing Checklist

- [ ] Default file exists at `api/data/employee_history_sample.csv`
- [ ] "Use Default Dataset" button appears on training page
- [ ] Clicking default button trains model successfully
- [ ] Custom file upload still works
- [ ] Both training methods produce valid models
- [ ] Error message shows if default file is missing
- [ ] Training completes in reasonable time (<60 seconds)
- [ ] Model predictions work after default training

## Performance Considerations

### Default File Size

Current file: **~1 KB** (very small, fast loading)

For larger default files:
- Consider async file reading: `fs.promises.readFile()`
- Add file size validation
- Show progress indicator for large files

### Caching

The file is read from disk on each training request. For optimization:

```typescript
// Cache the default file buffer
let defaultFileBuffer: Buffer | null = null;

if (!file) {
  if (!defaultFileBuffer) {
    defaultFileBuffer = fs.readFileSync(defaultFilePath);
  }
  fileBuffer = defaultFileBuffer;
}
```

## Future Enhancements

### 1. Multiple Default Datasets

Provide several pre-configured datasets:
- `employee_history_sample.csv` - General baseline
- `high_performers.csv` - High-performing employees only
- `diverse_sample.csv` - Diverse performance range

### 2. Auto-Update Default File

Periodically update default file with anonymized production data:

```typescript
@Cron('0 0 1 * *') // Monthly
async updateDefaultDataset() {
  const recentData = await this.getAnonymizedPerformanceData();
  await this.saveToDefaultFile(recentData);
}
```

### 3. Dataset Metadata

Add JSON file with dataset info:

```json
{
  "name": "Employee History Sample",
  "version": "1.0",
  "rows": 20,
  "dateCreated": "2026-02-23",
  "description": "Baseline performance dataset",
  "expectedMAE": 0.35,
  "expectedMSE": 0.18
}
```

### 4. UI Preview

Show preview of default dataset before training:

```tsx
<Button onClick={() => setShowPreview(true)}>
  Preview Default Dataset
</Button>

<Dialog open={showPreview}>
  <Table>
    {/* Show first 10 rows of default CSV */}
  </Table>
</Dialog>
```

## Related Files

### Backend
- `api/src/modules/ml/ml.controller.ts` - Training endpoint
- `api/src/modules/ml/ml.service.ts` - Training service
- `api/data/employee_history_sample.csv` - Default dataset

### Frontend
- `web/app/dashboard/ml/training/page.tsx` - Training UI

## Deployment Notes

When deploying to production:

1. **Ensure file is included in build:**
   ```json
   // package.json
   {
     "files": [
       "data/employee_history_sample.csv"
     ]
   }
   ```

2. **Docker: Copy file to container:**
   ```dockerfile
   COPY api/data /app/data
   ```

3. **Environment-specific defaults:**
   ```typescript
   const defaultFile = process.env.NODE_ENV === 'production'
     ? 'production_dataset.csv'
     : 'employee_history_sample.csv';
   ```

4. **Health check:**
   ```typescript
   @Get('health')
   checkHealth() {
     const defaultFileExists = fs.existsSync(defaultFilePath);
     return {
       status: 'ok',
       defaultDataset: defaultFileExists ? 'available' : 'missing'
     };
   }
   ```
