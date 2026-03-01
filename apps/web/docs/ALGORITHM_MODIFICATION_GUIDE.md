# Algorithm Modification Guide

This document outlines the changes required when modifying the machine learning algorithm in the Personnel Performance Management System.

---

## Table of Contents

1. [Types of Algorithm Changes](#types-of-algorithm-changes)
2. [Impact Analysis by Component](#impact-analysis-by-component)
3. [Modification Scenarios](#modification-scenarios)
4. [Required File Changes](#required-file-changes)
5. [Testing & Validation](#testing--validation)
6. [Documentation Updates](#documentation-updates)
7. [Migration Strategy](#migration-strategy)

---

## Types of Algorithm Changes

### 1. Architecture Modifications (Low Impact)
- Changing number of layers
- Changing neurons per layer
- Changing activation functions
- Adding/removing dropout layers

### 2. Hyperparameter Tuning (Very Low Impact)
- Learning rate adjustments
- Epoch count changes
- Batch size modifications
- Validation split ratio

### 3. Feature Engineering (Medium Impact)
- Adding new input features
- Removing existing features
- Feature transformation methods
- Normalization strategy changes

### 4. Algorithm Replacement (High Impact)
- Switching from Neural Network to Random Forest
- Using Gradient Boosting (XGBoost, LightGBM)
- Implementing ensemble methods
- Using different frameworks (scikit-learn, Python-based models)

### 5. Target Variable Changes (High Impact)
- Changing from regression to classification
- Multi-output prediction
- Predicting different metrics

---

## Impact Analysis by Component

### Backend Components

| Component | Low Impact | Medium Impact | High Impact |
|-----------|------------|---------------|-------------|
| **tensorflow-model.ts** | ✅ Architecture changes | ✅ Feature changes | ✅ Algorithm replacement |
| **ml.service.ts** | ❌ No changes | ✅ Feature handling | ✅ Complete rewrite |
| **ml.controller.ts** | ❌ No changes | ⚠️ Minor changes | ✅ API changes |
| **Database schemas** | ❌ No changes | ✅ New fields | ✅ Schema redesign |
| **Training data format** | ❌ No changes | ✅ New columns | ✅ Format change |

### Frontend Components

| Component | Low Impact | Medium Impact | High Impact |
|-----------|------------|---------------|-------------|
| **Training page** | ❌ No changes | ✅ Update instructions | ✅ UI redesign |
| **Prediction pages** | ❌ No changes | ✅ Feature inputs | ✅ Complete redesign |
| **Analytics page** | ⚠️ Metric updates | ✅ New visualizations | ✅ Complete redesign |
| **Algorithm details page** | ✅ Update specs | ✅ Update all tabs | ✅ Complete rewrite |

### Documentation

| Document | Low Impact | Medium Impact | High Impact |
|----------|------------|---------------|-------------|
| **ML_SPECIFICATION.md** | ✅ Update specs | ✅ Rewrite sections | ✅ Complete rewrite |
| **README.md** | ✅ Update overview | ✅ Update features | ✅ Major revision |
| **Algorithm UI page** | ✅ Update all tabs | ✅ Redesign | ✅ Complete rebuild |

---

## Modification Scenarios

### Scenario 1: Change Neural Network Architecture

**Example**: Change from 32-16-8-1 to 64-32-16-8-1 (deeper network)

#### Backend Changes

**File**: `api/src/modules/ml/tensorflow-model.ts`

```typescript
// OLD:
export function createPerformanceModel(inputDim: number): tf.LayersModel {
  const model = tf.sequential();

  model.add(tf.layers.dense({
    inputShape: [inputDim],
    units: 32,  // ← CHANGE THIS
    activation: 'relu',
    kernelInitializer: 'heNormal',
  }));

  model.add(tf.layers.dropout({ rate: 0.2 }));

  model.add(tf.layers.dense({
    units: 16,  // ← CHANGE THIS
    activation: 'relu',
    kernelInitializer: 'heNormal',
  }));

  model.add(tf.layers.dropout({ rate: 0.2 }));

  model.add(tf.layers.dense({
    units: 8,  // ← CHANGE THIS
    activation: 'relu',
    kernelInitializer: 'heNormal',
  }));

  model.add(tf.layers.dense({
    units: 1,
    activation: 'linear',
  }));

  return model;
}

// NEW:
export function createPerformanceModel(inputDim: number): tf.LayersModel {
  const model = tf.sequential();

  // Layer 1: 64 neurons
  model.add(tf.layers.dense({
    inputShape: [inputDim],
    units: 64,  // ← CHANGED
    activation: 'relu',
    kernelInitializer: 'heNormal',
  }));
  model.add(tf.layers.dropout({ rate: 0.2 }));

  // Layer 2: 32 neurons
  model.add(tf.layers.dense({
    units: 32,  // ← CHANGED
    activation: 'relu',
    kernelInitializer: 'heNormal',
  }));
  model.add(tf.layers.dropout({ rate: 0.2 }));

  // Layer 3: 16 neurons (NEW LAYER)
  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu',
    kernelInitializer: 'heNormal',
  }));
  model.add(tf.layers.dropout({ rate: 0.2 }));

  // Layer 4: 8 neurons
  model.add(tf.layers.dense({
    units: 8,
    activation: 'relu',
    kernelInitializer: 'heNormal',
  }));

  // Output layer
  model.add(tf.layers.dense({
    units: 1,
    activation: 'linear',
  }));

  return model;
}
```

**File**: `api/src/modules/ml/ml.service.ts`

```typescript
// Update the getModelInfo method
getModelInfo() {
  if (!tensorflowModel) {
    throw new NotFoundException('TensorFlow model not trained yet.');
  }

  return {
    trainedAt: tensorflowModel.trainedAt,
    trainingHistory: tensorflowModel.trainingHistory,
    metrics: tensorflowModel.metrics,
    modelSummary: {
      inputFeatures: FEATURES,
      targetVariable: TARGET,
      architecture: 'Neural Network (64-32-16-8-1)', // ← UPDATE THIS
    },
  };
}
```

#### Frontend Changes

**File**: `web/app/dashboard/ml/algorithm/page.tsx`

Update the architecture display:

```tsx
// Update the badge in header
<Badge variant="outline" className="text-lg px-4 py-2">
  64-32-16-8-1  {/* ← UPDATE */}
</Badge>

// Update the architecture section
<div className="text-2xl font-bold">64-32-16-8-1</div>
<p className="text-xs text-muted-foreground mt-1">5-layer feedforward network</p>

// Update the visual architecture diagram
<Badge>Dense 1</Badge>
<div className="flex-1 border-l-2 border-blue-500 pl-4">
  <div className="font-semibold">64 neurons, ReLU activation</div> {/* ← UPDATE */}
  <div className="text-xs text-muted-foreground">He Normal initialization, 20% dropout</div>
</div>

// Add new layer 3 in the diagram
<Badge>Dense 3</Badge>
<div className="flex-1 border-l-2 border-purple-500 pl-4">
  <div className="font-semibold">16 neurons, ReLU activation</div> {/* ← NEW */}
  <div className="text-xs text-muted-foreground">He Normal initialization, 20% dropout</div>
</div>
```

#### Documentation Changes

**File**: `ML_SPECIFICATION.md`

```markdown
## Model Architecture

### Network Design

```
Input Layer (6 neurons)
    ↓
Dense Layer 1: 64 neurons, ReLU activation, He Normal initialization  ← CHANGED
    ↓
Dropout Layer: 20% dropout rate
    ↓
Dense Layer 2: 32 neurons, ReLU activation, He Normal initialization  ← CHANGED
    ↓
Dropout Layer: 20% dropout rate
    ↓
Dense Layer 3: 16 neurons, ReLU activation, He Normal initialization  ← NEW
    ↓
Dropout Layer: 20% dropout rate
    ↓
Dense Layer 4: 8 neurons, ReLU activation, He Normal initialization
    ↓
Output Layer: 1 neuron, Linear activation
```

### Architecture Rationale

**Decreasing Layer Sizes (64 → 32 → 16 → 8 → 1)**:  ← UPDATE
- Deeper network with more capacity
- Better feature learning with 5 layers instead of 4
- Gradual information compression
```

**File**: `web/README.md`

```markdown
**Model Architecture**: 5-layer feedforward neural network (64-32-16-8-1)  ← UPDATE

### Model Architecture

```
Input Layer (6 features)
    ↓
Dense Layer 1: 64 neurons, ReLU activation, 20% dropout  ← UPDATE
    ↓
Dense Layer 2: 32 neurons, ReLU activation, 20% dropout  ← UPDATE
    ↓
Dense Layer 3: 16 neurons, ReLU activation, 20% dropout  ← NEW
    ↓
Dense Layer 4: 8 neurons, ReLU activation
    ↓
Output Layer: 1 neuron, Linear activation
```
```

---

### Scenario 2: Add New Input Features

**Example**: Add 2 new features: "Research Output" (RO) and "Community Engagement" (CE)

#### Backend Changes

**File**: `api/src/modules/ml/tensorflow-model.ts`

```typescript
// OLD:
export const FEATURES = ['PAA', 'KSM', 'TS', 'CM', 'AL', 'GO'];

// NEW:
export const FEATURES = ['PAA', 'KSM', 'TS', 'CM', 'AL', 'GO', 'RO', 'CE']; // ← ADD NEW
export const TARGET = 'GEN AVG';
export const METRIC_FAILURE_THRESHOLD = 3.0;
```

**File**: `api/src/modules/performance-evaluations/schemas/performance-evaluation.schema.ts`

```typescript
@Schema({ timestamps: true })
export class PerformanceEvaluation {
  // ... existing fields

  @Prop({ required: true, type: Object })
  scores: {
    PAA: number;
    KSM: number;
    TS: number;
    CM: number;
    AL: number;
    GO: number;
    RO: number;  // ← ADD NEW
    CE: number;  // ← ADD NEW
  };
}
```

**File**: `api/src/modules/performance-evaluations/dto/create-performance-evaluation.dto.ts`

```typescript
export class CreatePerformanceEvaluationDto {
  @IsNumber()
  PAA: number;

  @IsNumber()
  KSM: number;

  @IsNumber()
  TS: number;

  @IsNumber()
  CM: number;

  @IsNumber()
  AL: number;

  @IsNumber()
  GO: number;

  @IsNumber()  // ← ADD NEW
  RO: number;

  @IsNumber()  // ← ADD NEW
  CE: number;
}
```

#### Frontend Changes

**File**: `web/types/ml.types.ts`

```typescript
// Update anywhere features are defined
export const ML_FEATURES = ['PAA', 'KSM', 'TS', 'CM', 'AL', 'GO', 'RO', 'CE']; // ← ADD NEW
```

**File**: `web/app/dashboard/ml/manual-prediction/page.tsx`

```tsx
// Add new form fields
<FormField
  control={form.control}
  name="metrics.RO"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Research Output (RO)</FormLabel>
      <FormControl>
        <Input
          type="number"
          step="0.1"
          min="1"
          max="5"
          placeholder="1.0 - 5.0"
          {...field}
        />
      </FormControl>
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="metrics.CE"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Community Engagement (CE)</FormLabel>
      <FormControl>
        <Input
          type="number"
          step="0.1"
          min="1"
          max="5"
          placeholder="1.0 - 5.0"
          {...field}
        />
      </FormControl>
    </FormItem>
  )}
/>
```

**File**: `web/app/dashboard/ml/algorithm/page.tsx`

```tsx
// Add new feature cards in the Features tab
<div className="border rounded-lg p-4 space-y-2">
  <div className="flex items-center justify-between">
    <Badge>RO</Badge>
    <span className="text-xs text-muted-foreground">Feature 7</span>
  </div>
  <h4 className="font-semibold">Research Output</h4>
  <p className="text-sm text-muted-foreground">
    Quality and quantity of research publications
  </p>
</div>

<div className="border rounded-lg p-4 space-y-2">
  <div className="flex items-center justify-between">
    <Badge>CE</Badge>
    <span className="text-xs text-muted-foreground">Feature 8</span>
  </div>
  <h4 className="font-semibold">Community Engagement</h4>
  <p className="text-sm text-muted-foreground">
    Community service and outreach activities
  </p>
</div>

// Update the input layer description
<div className="flex-1 border-l-2 border-primary pl-4">
  <div className="font-semibold">Input Layer (8 neurons)</div> {/* ← CHANGED from 6 */}
  <div className="text-xs text-muted-foreground">PAA, KSM, TS, CM, AL, GO, RO, CE</div>
</div>
```

**File**: `web/app/dashboard/ml/training/page.tsx`

```tsx
// Update the requirements
<li>Required columns: <Badge variant="secondary">PAA</Badge>, <Badge variant="secondary">KSM</Badge>, <Badge variant="secondary">TS</Badge>, <Badge variant="secondary">CM</Badge>, <Badge variant="secondary">AL</Badge>, <Badge variant="secondary">GO</Badge>, <Badge variant="secondary">RO</Badge>, <Badge variant="secondary">CE</Badge>, <Badge variant="secondary">GEN AVG</Badge></li>
```

#### Documentation Changes

**File**: `ML_SPECIFICATION.md`

```markdown
### Input Features

The model uses **eight** performance metrics as input features:  ← CHANGED from six

| Feature | Full Name | Description |
|---------|-----------|-------------|
| PAA | Performance Appraisal A | Primary performance assessment score |
| KSM | Knowledge, Skills, and Management | Expertise and management capability |
| TS | Teaching Skills | Teaching effectiveness and methodology |
| CM | Classroom Management | Classroom environment management |
| AL | Administrative Leadership | Leadership and administrative capabilities |
| GO | Goal Orientation | Goal setting and achievement focus |
| **RO** | **Research Output** | **Quality and quantity of research publications** | ← NEW
| **CE** | **Community Engagement** | **Community service and outreach activities** | ← NEW
```

---

### Scenario 3: Switch to Different Algorithm (e.g., Random Forest)

**Example**: Replace Neural Network with Random Forest Regressor

This is a **HIGH IMPACT** change requiring significant modifications.

#### Decision: Python Backend

Since TensorFlow.js doesn't support Random Forest, you'd need to either:

**Option A**: Create a Python microservice
**Option B**: Use a JavaScript ML library (ml.js)
**Option C**: Use TensorFlow.js with a custom implementation

**Recommended**: Python microservice with Flask/FastAPI

#### New Architecture

```
Frontend (Next.js) → API (NestJS) → ML Service (Python/Flask)
                                      ↓
                                  scikit-learn
```

#### Backend Changes

**NEW File**: `ml-service/app.py` (Python service)

```python
from flask import Flask, request, jsonify
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import pandas as pd
import pickle
import numpy as np

app = Flask(__name__)

# Global model and scaler
model = None
scaler = None

@app.route('/train', methods=['POST'])
def train_model():
    global model, scaler

    # Get uploaded file
    file = request.files['file']
    df = pd.read_excel(file)

    # Extract features and target
    features = ['PAA', 'KSM', 'TS', 'CM', 'AL', 'GO']
    X = df[features]
    y = df['GEN AVG']

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train Random Forest
    model = RandomForestRegressor(
        n_estimators=100,      # Number of trees
        max_depth=10,          # Maximum tree depth
        min_samples_split=5,   # Minimum samples to split
        min_samples_leaf=2,    # Minimum samples per leaf
        random_state=42
    )

    model.fit(X_scaled, y)

    # Save model
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    with open('scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)

    # Calculate metrics
    from sklearn.metrics import mean_absolute_error, mean_squared_error
    predictions = model.predict(X_scaled)
    mae = mean_absolute_error(y, predictions)
    mse = mean_squared_error(y, predictions)

    return jsonify({
        'message': 'Model trained successfully',
        'records': len(df),
        'metrics': {
            'mae': float(mae),
            'mse': float(mse)
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    global model, scaler

    if model is None:
        return jsonify({'error': 'Model not trained'}), 400

    # Get features
    data = request.json
    features = np.array([[
        data['PAA'], data['KSM'], data['TS'],
        data['CM'], data['AL'], data['GO']
    ]])

    # Scale and predict
    features_scaled = scaler.transform(features)
    prediction = model.predict(features_scaled)[0]

    # Get feature importances
    importances = dict(zip(
        ['PAA', 'KSM', 'TS', 'CM', 'AL', 'GO'],
        model.feature_importances_
    ))

    return jsonify({
        'prediction': float(prediction),
        'featureImportances': importances
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**File**: `api/src/modules/ml/ml.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

@Injectable()
export class MlService {
  async trainModelFromFile(fileBuffer: Buffer): Promise<TrainingResponse> {
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]));

    const response = await axios.post(
      `${ML_SERVICE_URL}/train`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  }

  async predictPerformance(metrics: Record<string, number>): Promise<any> {
    const response = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      metrics
    );

    return response.data;
  }
}
```

#### Frontend Changes

**File**: `web/app/dashboard/ml/algorithm/page.tsx`

Complete rewrite needed:

```tsx
// Update all references
<Badge variant="outline">Random Forest</Badge>

// Update architecture section
<div className="text-2xl font-bold">Random Forest</div>
<p className="text-xs text-muted-foreground mt-1">Ensemble of 100 decision trees</p>

// Update algorithm details
<div>
  <h3 className="font-semibold mb-2">Algorithm Type</h3>
  <Badge className="mb-2">Random Forest Regressor</Badge>
  <p className="text-sm text-muted-foreground">
    Ensemble learning method using multiple decision trees
  </p>
</div>

<div>
  <h3 className="font-semibold mb-2">Configuration</h3>
  <div className="text-sm space-y-1">
    <div className="flex justify-between">
      <span className="text-muted-foreground">Number of Trees:</span>
      <code className="bg-muted px-2 py-0.5 rounded text-xs">100</code>
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">Max Depth:</span>
      <code className="bg-muted px-2 py-0.5 rounded text-xs">10</code>
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">Min Samples Split:</span>
      <code className="bg-muted px-2 py-0.5 rounded text-xs">5</code>
    </div>
  </div>
</div>
```

#### Documentation Changes

**File**: `ML_SPECIFICATION.md`

Complete rewrite needed - change everything from neural network to Random Forest.

```markdown
## Algorithm Overview

**Algorithm Type**: Supervised Learning - Regression
**Model Family**: Random Forest (Ensemble Learning)  ← CHANGED
**Framework**: scikit-learn (Python)  ← CHANGED
**Runtime**: Python Flask Microservice  ← CHANGED

### Why Random Forest?

1. **Interpretability**: Feature importance easily extracted
2. **Robustness**: Less prone to overfitting than single decision trees
3. **No Normalization**: Works with raw feature values
4. **Non-linear**: Captures complex relationships automatically

## Model Architecture

Instead of layers, Random Forest uses an ensemble of decision trees:

```
Training Data
    ↓
Bootstrap Sampling (100 subsets)
    ↓
Build 100 Decision Trees (max depth: 10)
    ↓
Average Predictions from All Trees
    ↓
Final Prediction
```

### Hyperparameters

- **n_estimators**: 100 (number of trees)
- **max_depth**: 10 (maximum tree depth)
- **min_samples_split**: 5 (minimum samples to split node)
- **min_samples_leaf**: 2 (minimum samples per leaf)
- **random_state**: 42 (reproducibility)

## Training Process

1. **Bootstrap Sampling**: Create 100 random subsets of training data (with replacement)
2. **Tree Building**: Build one decision tree for each subset
3. **Feature Selection**: At each split, consider random subset of features
4. **Ensemble**: Average predictions from all trees for final output
```

---

### Scenario 4: Change from Regression to Classification

**Example**: Instead of predicting exact score, predict performance category directly

#### Backend Changes

**File**: `api/src/modules/ml/tensorflow-model.ts`

```typescript
// OLD TARGET:
export const TARGET = 'GEN AVG';

// NEW TARGET:
export const TARGET = 'PERFORMANCE_CATEGORY';
export const CATEGORIES = ['Excellent', 'Very Satisfactory', 'Satisfactory', 'Fair', 'Needs Improvement'];
export const NUM_CLASSES = 5;

// OLD OUTPUT LAYER:
model.add(tf.layers.dense({
  units: 1,
  activation: 'linear',
}));

// NEW OUTPUT LAYER:
model.add(tf.layers.dense({
  units: NUM_CLASSES,  // 5 output neurons
  activation: 'softmax',  // For probability distribution
}));

// OLD LOSS FUNCTION:
model.compile({
  optimizer: tf.train.adam(0.001),
  loss: 'meanSquaredError',
  metrics: ['mae', 'mse'],
});

// NEW LOSS FUNCTION:
model.compile({
  optimizer: tf.train.adam(0.001),
  loss: 'categoricalCrossentropy',  // For classification
  metrics: ['accuracy'],
});
```

**File**: `api/src/modules/ml/ml.service.ts`

```typescript
// Update prediction method
async predictPerformance(personnelId: string): Promise<PredictionResponse> {
  // ... get features

  // Make prediction
  const predictionTensor = model.predict(inputTensor) as tf.Tensor;
  const probabilities = await predictionTensor.data();

  // Get class with highest probability
  const predictedClassIndex = probabilities.indexOf(Math.max(...probabilities));
  const predictedCategory = CATEGORIES[predictedClassIndex];
  const confidence = probabilities[predictedClassIndex];

  return {
    category: predictedCategory,
    confidence: confidence,
    probabilities: {
      'Excellent': probabilities[0],
      'Very Satisfactory': probabilities[1],
      'Satisfactory': probabilities[2],
      'Fair': probabilities[3],
      'Needs Improvement': probabilities[4]
    }
  };
}
```

#### Frontend Changes

**File**: `web/app/dashboard/ml/predictions/page.tsx`

```tsx
// Update table columns
<TableHead>Predicted Category</TableHead>  // Instead of "Predicted Score"
<TableHead>Confidence</TableHead>

// Update data display
<TableCell>
  <Badge className={getCategoryColor(prediction.category)}>
    {prediction.category}
  </Badge>
</TableCell>
<TableCell>{(prediction.confidence * 100).toFixed(1)}%</TableCell>

// Add probability breakdown
<div className="space-y-2">
  {Object.entries(prediction.probabilities).map(([category, prob]) => (
    <div key={category} className="flex items-center gap-2">
      <div className="w-32">{category}</div>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full"
          style={{ width: `${prob * 100}%` }}
        />
      </div>
      <div className="w-12 text-sm text-muted-foreground">
        {(prob * 100).toFixed(1)}%
      </div>
    </div>
  ))}
</div>
```

---

## Required File Changes Summary

### For Architecture Changes (Low Impact)

✅ **Must Change**:
- `api/src/modules/ml/tensorflow-model.ts` - Update layer definitions
- `api/src/modules/ml/ml.service.ts` - Update architecture description
- `web/app/dashboard/ml/algorithm/page.tsx` - Update all architecture displays
- `ML_SPECIFICATION.md` - Update architecture section
- `web/README.md` - Update architecture overview

❌ **No Changes Needed**:
- API endpoints
- Database schemas
- Frontend forms
- Type definitions
- Training data format

### For Feature Changes (Medium Impact)

✅ **Must Change**:
- `api/src/modules/ml/tensorflow-model.ts` - Update FEATURES constant
- `api/src/modules/performance-evaluations/schemas/*.ts` - Add new fields
- `api/src/modules/performance-evaluations/dto/*.ts` - Add validation
- `web/types/ml.types.ts` - Update types
- `web/app/dashboard/ml/manual-prediction/page.tsx` - Add form fields
- `web/app/dashboard/ml/algorithm/page.tsx` - Update feature list
- `ML_SPECIFICATION.md` - Update feature documentation
- `web/README.md` - Update feature list

⚠️ **Potentially Change**:
- Database migrations (if adding new fields)
- Existing training data (re-train with new features)

### For Algorithm Replacement (High Impact)

✅ **Must Change**:
- **Everything** - This is essentially a new implementation
- Consider creating new service instead of modifying existing

📋 **Checklist**:
- [ ] Choose new algorithm and framework
- [ ] Set up new ML service (Python/Flask or keep TypeScript)
- [ ] Implement training pipeline
- [ ] Implement prediction pipeline
- [ ] Update all API endpoints
- [ ] Update all frontend components
- [ ] Rewrite all documentation
- [ ] Create migration strategy for existing models
- [ ] Test thoroughly before deployment

---

## Testing & Validation

### After Any Algorithm Change

1. **Unit Tests**:
   ```typescript
   describe('ML Model', () => {
     it('should train with valid data', async () => {
       const result = await mlService.trainModelFromFile(buffer);
       expect(result.metrics.mae).toBeLessThan(0.5);
     });

     it('should predict with correct format', async () => {
       const prediction = await mlService.predictPerformance('id');
       expect(prediction).toHaveProperty('prediction');
       expect(prediction.prediction).toBeGreaterThan(0);
     });
   });
   ```

2. **Integration Tests**:
   - Test API endpoints
   - Test file upload
   - Test prediction flow

3. **Model Validation**:
   - Compare metrics to previous model
   - Test on holdout dataset
   - Validate predictions make sense

4. **UI Testing**:
   - Test all ML pages
   - Verify data displays correctly
   - Test edge cases

---

## Documentation Updates

### Checklist

After **any** algorithm modification:

- [ ] Update `ML_SPECIFICATION.md`
- [ ] Update `web/README.md`
- [ ] Update `web/app/dashboard/ml/algorithm/page.tsx`
- [ ] Update `web/app/dashboard/ml/training/page.tsx`
- [ ] Update API documentation (if endpoints changed)
- [ ] Update version numbers
- [ ] Create changelog entry
- [ ] Update deployment documentation

---

## Migration Strategy

### Model Versioning

Implement model versioning to safely deploy changes:

```typescript
// api/src/modules/ml/tensorflow-model.ts
export const MODEL_VERSION = '2.0.0'; // Increment on changes

// Save model with version
const metadata = {
  modelVersion: MODEL_VERSION,
  architecture: 'Neural Network (64-32-16-8-1)',
  trainedAt: new Date().toISOString(),
  // ...
};
```

### Backward Compatibility

Keep old model while testing new one:

```typescript
// Load specific model version
async function loadModel(version: string = 'latest') {
  const modelPath = version === 'latest'
    ? MODEL_SAVE_PATH
    : `${MODEL_SAVE_PATH}_v${version}`;

  return await tf.loadLayersModel(`file://${modelPath}/model.json`);
}
```

### A/B Testing

Deploy both models and compare:

```typescript
// Predict with both models
const predictionV1 = await predictWithModel(modelV1, features);
const predictionV2 = await predictWithModel(modelV2, features);

// Log comparison
logger.info({
  v1: predictionV1,
  v2: predictionV2,
  difference: Math.abs(predictionV1 - predictionV2)
});
```

### Gradual Rollout

1. Deploy new algorithm to staging
2. Test thoroughly
3. Deploy to production (keep old model)
4. Route 10% of traffic to new model
5. Monitor metrics and errors
6. Gradually increase to 100%
7. Remove old model after validation period

---

## Best Practices

1. **Always Version Models**: Tag each model with version, date, and metrics
2. **Document Changes**: Keep detailed changelog of what changed and why
3. **Test Before Deploy**: Never deploy algorithm changes without thorough testing
4. **Monitor Closely**: Watch error rates and prediction quality after deployment
5. **Keep Rollback Option**: Always be able to revert to previous model
6. **Gradual Migration**: Don't switch algorithms abruptly in production
7. **Update All Docs**: Documentation should always match implementation

---

## Quick Reference

| Change Type | Complexity | Time Estimate | Risk Level |
|-------------|------------|---------------|------------|
| Hyperparameters | Very Low | < 1 hour | Very Low |
| Architecture (same type) | Low | 2-4 hours | Low |
| Add/Remove Features | Medium | 1-2 days | Medium |
| Switch Algorithm | High | 1-2 weeks | High |
| Regression → Classification | High | 1-2 weeks | High |

---

**Last Updated**: 2026-01-23
**Version**: 1.0.0
