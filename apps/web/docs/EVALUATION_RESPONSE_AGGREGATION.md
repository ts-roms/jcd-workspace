# Evaluation Response Aggregation for Performance Predictions

## Overview

The Performance Prediction system now aggregates data directly from evaluation form responses (submitted by students/evaluators) instead of relying solely on pre-calculated performance evaluation records. This ensures predictions are based on the most current and comprehensive evaluation data.

## How It Works

### Data Flow

```
1. Students/Evaluators submit evaluation forms
   ↓
2. Responses stored with answers grouped by sections
   ↓
3. User clicks "Predict" on Personnel
   ↓
4. System aggregates all evaluation responses for that personnel
   ↓
5. Responses grouped by section, averaged per section
   ↓
6. Sections mapped to metrics (PAA, KSM, TS, CM, AL, GO)
   ↓
7. Metrics fed into TensorFlow model for prediction
   ↓
8. Prediction displayed with intervention suggestions
```

### Section to Metric Mapping

The system uses the following mapping to convert evaluation form sections to prediction metrics:

| Section Name | Metric Code | Full Metric Name |
|--------------|-------------|------------------|
| Professionalism & Attitude Assessment | PAA | Professionalism & Attitude Assessment |
| Knowledge & Skill Management | KSM | Knowledge & Skill Management |
| Technical Skills | TS | Technical Skills |
| Communication Management | CM | Communication Management |
| Attitude & Leadership | AL | Attitude & Leadership |
| Goal Orientation | GO | Goal Orientation |

**Note:** The mapping is flexible and can handle:
- Full section names (e.g., "Professionalism & Attitude Assessment")
- Abbreviated codes (e.g., "PAA")
- Case-insensitive matching

## Technical Implementation

### Backend Changes

#### ML Module (`api/src/modules/ml/ml.module.ts`)

Added imports:
- `EvaluationFormResponsesModule` - Provides access to evaluation responses
- `EvaluationFormResponse` schema - For database queries

```typescript
@Module({
  imports: [
    PerformanceEvaluationsModule,
    PersonnelModule,
    EvaluationFormResponsesModule, // NEW
    MongooseModule.forFeature([
      { name: PerformanceEvaluation.name, schema: PerformanceEvaluationSchema },
      { name: EvaluationFormResponse.name, schema: EvaluationFormResponseSchema }, // NEW
    ]),
  ],
  // ...
})
```

#### ML Service (`api/src/modules/ml/ml.service.ts`)

**New Method: `aggregateEvaluationResponses(personnelId: string)`**

This method:
1. Fetches personnel details to get their full name
2. Queries evaluation form responses where `evaluator` field matches the personnel's name
3. Aggregates scores by section:
   ```typescript
   responses.forEach((response) => {
     response.answers.forEach((answer) => {
       // Sum scores per section
       sectionScores[answer.section] += answer.score;
       sectionCounts[answer.section] += 1;
     });
   });
   ```
4. Calculates average per section:
   ```typescript
   averageScore = totalScore / count
   ```
5. Maps sections to metrics using `SECTION_TO_METRIC_MAP`
6. Returns metric scores: `{ PAA: 4.5, KSM: 4.2, TS: 4.3, CM: 4.4, AL: 4.6, GO: 4.1 }`

**Updated Method: `predictPerformance(personnelId: string)`**

Now uses a two-tier approach:

```typescript
async predictPerformance(personnelId: string) {
  // PRIMARY: Try evaluation form responses first
  let features = await this.aggregateEvaluationResponses(personnelId);

  // FALLBACK: Use performance evaluation records if no responses found
  if (!features) {
    const latestEvaluation = await this.findLatestByPersonnelId(personnelId);
    if (!latestEvaluation) {
      throw new NotFoundException('No evaluation data found');
    }
    features = latestEvaluation.scores;
  }

  // Predict using TensorFlow model
  const prediction = await predict(model, normalizer, features);

  // ... rest of prediction logic
}
```

### Aggregation Algorithm

**Step-by-Step Process:**

1. **Find Responses**
   ```typescript
   const responses = await evaluationFormResponseModel.find({
     evaluator: personnelFullName
   });
   ```

2. **Initialize Aggregation Maps**
   ```typescript
   const sectionScores = new Map<string, { totalScore: number; count: number }>();
   ```

3. **Aggregate by Section**
   ```typescript
   responses.forEach((response) => {
     response.answers.forEach((answer) => {
       const existing = sectionScores.get(answer.section) || { totalScore: 0, count: 0 };
       existing.totalScore += answer.score;
       existing.count += 1;
       sectionScores.set(answer.section, existing);
     });
   });
   ```

4. **Calculate Averages & Map to Metrics**
   ```typescript
   sectionScores.forEach((data, section) => {
     const average = data.totalScore / data.count;
     const metricKey = SECTION_TO_METRIC_MAP[section];
     if (metricKey) {
       metrics[metricKey] = average;
     }
   });
   ```

5. **Validate Completeness**
   ```typescript
   const hasAllFeatures = FEATURES.every((feature) => feature in metrics);
   if (!hasAllFeatures) {
     return null; // Fall back to performance evaluations
   }
   ```

## Data Structure Examples

### Evaluation Form Response Structure

```json
{
  "_id": "...",
  "form": "formId123",
  "respondentName": "John Doe",
  "respondentEmail": "john@example.com",
  "evaluator": "Jane Smith",
  "semester": "2025 - 1st Semester",
  "answers": [
    {
      "section": "Professionalism & Attitude Assessment",
      "item": "Demonstrates professional behavior",
      "score": 5
    },
    {
      "section": "Professionalism & Attitude Assessment",
      "item": "Shows respect to students",
      "score": 4
    },
    {
      "section": "Knowledge & Skill Management",
      "item": "Demonstrates subject expertise",
      "score": 5
    }
    // ... more answers
  ],
  "totalScore": 142
}
```

### Aggregated Metrics Output

```json
{
  "PAA": 4.5,  // Average of all PAA section items
  "KSM": 4.6,  // Average of all KSM section items
  "TS": 4.3,   // Average of all TS section items
  "CM": 4.4,   // Average of all CM section items
  "AL": 4.7,   // Average of all AL section items
  "GO": 4.2    // Average of all GO section items
}
```

## Advantages of This Approach

### 1. Real-Time Data
- Predictions based on actual evaluation submissions
- No delay waiting for performance evaluation records to be created
- Reflects the most current evaluator feedback

### 2. Comprehensive Aggregation
- Combines feedback from multiple evaluators
- More statistically robust than single evaluation
- Captures diverse perspectives on personnel performance

### 3. Granular Insights
- Section-level aggregation preserves detail
- Can identify specific areas needing improvement
- Supports targeted intervention strategies

### 4. Automatic Updates
- New evaluation responses automatically included
- No manual data entry required
- System stays in sync with evaluation submissions

### 5. Fallback Mechanism
- Still works with legacy performance evaluation records
- Graceful degradation if no responses exist
- Supports both data sources seamlessly

## Usage

### For Administrators

1. **Ensure Evaluation Forms Are Submitted:**
   - Students/evaluators complete evaluation forms
   - Forms include section-based questions
   - Sections must match or map to metrics (PAA, KSM, TS, CM, AL, GO)

2. **Run Predictions:**
   - Navigate to `/dashboard/ml/predictions`
   - Click "Predict" on any personnel card
   - System automatically aggregates responses and generates prediction

3. **View Results:**
   - Prediction score displayed (e.g., 4.25)
   - Failed metrics listed (if any below threshold 3.5)
   - Intervention suggestions provided

### For System Configuration

If using custom section names, update the mapping in `ml.service.ts`:

```typescript
const SECTION_TO_METRIC_MAP: Record<string, string> = {
  'Your Custom Section Name 1': 'PAA',
  'Your Custom Section Name 2': 'KSM',
  // ... etc
};
```

## Validation & Error Handling

### Required Data Validation

1. **Personnel Existence:**
   ```typescript
   if (!personnel) {
     return null; // Personnel not found
   }
   ```

2. **Response Availability:**
   ```typescript
   if (responses.length === 0) {
     return null; // No responses, fall back to performance evaluations
   }
   ```

3. **Metric Completeness:**
   ```typescript
   const hasAllFeatures = FEATURES.every((feature) => feature in metrics);
   if (!hasAllFeatures) {
     return null; // Missing required metrics, use fallback
   }
   ```

### Error Messages

- **No Model Trained:**
  ```
  "TensorFlow model not trained yet. Please upload a training file."
  ```

- **No Evaluation Data:**
  ```
  "No evaluation data found for this person. Please add evaluation responses or performance evaluation first."
  ```

## Performance Considerations

### Query Optimization

- Responses are queried once per prediction
- Aggregation happens in-memory (fast)
- No complex database joins required

### Caching Opportunities

Future enhancement: Cache aggregated metrics per personnel with invalidation on new responses:

```typescript
// Pseudo-code for future caching
const cacheKey = `metrics:${personnelId}`;
let metrics = await cache.get(cacheKey);
if (!metrics) {
  metrics = await aggregateEvaluationResponses(personnelId);
  await cache.set(cacheKey, metrics, { ttl: 3600 }); // 1 hour
}
```

## Testing Checklist

- [ ] Prediction works with evaluation form responses
- [ ] Aggregation correctly averages scores per section
- [ ] Section-to-metric mapping works for all metrics
- [ ] Fallback to performance evaluations works when no responses exist
- [ ] Error handling works for missing data
- [ ] Multiple responses per personnel are correctly aggregated
- [ ] Predictions are accurate compared to manual calculations
- [ ] Failed metrics are correctly identified

## Related Files

### Backend
- `api/src/modules/ml/ml.module.ts` - Module configuration
- `api/src/modules/ml/ml.service.ts` - Aggregation logic
- `api/src/modules/evaluation-form-responses/schemas/evaluation-form-response.schema.ts` - Response schema

### Frontend
- `web/app/dashboard/ml/predictions/page.tsx` - Predictions UI
- `web/lib/api/ml.api.ts` - API client

## Future Enhancements

1. **Semester-Specific Aggregation:**
   - Allow predictions based on specific semester data
   - Compare performance trends across semesters

2. **Weighted Averages:**
   - Weight more recent responses higher
   - Consider evaluator credibility/experience

3. **Custom Section Mapping UI:**
   - Admin interface to configure section-to-metric mapping
   - Support for dynamic evaluation form structures

4. **Aggregation Analytics:**
   - Show which evaluations contributed to prediction
   - Display response count per metric
   - Confidence scores based on sample size

5. **Real-Time Updates:**
   - Invalidate cached predictions when new responses arrive
   - Push notifications for prediction changes
