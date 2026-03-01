# Machine Learning Technical Specification

## Executive Summary

This document provides a comprehensive technical specification of the machine learning system implemented for performance prediction in the Personnel Performance Management System. The system uses a deep neural network built with TensorFlow.js to predict employee performance scores based on historical evaluation metrics.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Algorithm Overview](#algorithm-overview)
3. [Model Architecture](#model-architecture)
4. [Training Process](#training-process)
5. [Prediction Process](#prediction-process)
6. [Data Preprocessing](#data-preprocessing)
7. [Model Evaluation](#model-evaluation)
8. [Implementation Details](#implementation-details)
9. [API Endpoints](#api-endpoints)
10. [Performance Metrics](#performance-metrics)
11. [Deployment](#deployment)
12. [Future Improvements](#future-improvements)

---

## Problem Statement

**Objective**: Predict employee performance scores (GEN AVG) based on six performance evaluation metrics.

**Business Value**:
- Early identification of at-risk employees
- Data-driven performance improvement recommendations
- Proactive intervention strategies
- Evidence-based resource allocation

**Success Criteria**:
- Mean Absolute Error (MAE) < 0.5
- Mean Squared Error (MSE) < 0.3
- Model can generalize to unseen employees

---

## Algorithm Overview

**Algorithm Type**: Supervised Learning - Regression
**Model Family**: Feedforward Neural Network (Deep Learning)
**Framework**: TensorFlow.js v4.x
**Runtime**: Node.js (Backend)

### Why Deep Neural Network?

1. **Non-linear Relationships**: Captures complex interactions between performance metrics
2. **Feature Learning**: Automatically learns relevant patterns from data
3. **Scalability**: Can handle increasing amounts of training data
4. **Flexibility**: Easy to adjust architecture and hyperparameters

### Alternative Approaches Considered

| Algorithm | Pros | Cons | Decision |
|-----------|------|------|----------|
| Linear Regression | Simple, interpretable | Cannot capture non-linear patterns | ❌ Rejected |
| Random Forest | Good performance, handles non-linearity | Black box, harder to deploy in JS | ❌ Rejected |
| Gradient Boosting (XGBoost) | Excellent accuracy | Requires Python/additional dependencies | ❌ Rejected |
| Neural Network | Flexible, good for complex patterns, JS native | Requires more data, harder to interpret | ✅ **Selected** |

---

## Model Architecture

### Network Design

```
Input Layer (6 neurons)
    ↓
Dense Layer 1: 32 neurons, ReLU activation, He Normal initialization
    ↓
Dropout Layer: 20% dropout rate
    ↓
Dense Layer 2: 16 neurons, ReLU activation, He Normal initialization
    ↓
Dropout Layer: 20% dropout rate
    ↓
Dense Layer 3: 8 neurons, ReLU activation, He Normal initialization
    ↓
Output Layer: 1 neuron, Linear activation
```

### Layer-by-Layer Breakdown

#### Input Layer
- **Size**: 6 features
- **Features**: PAA, KSM, TS, CM, AL, GO
- **Data Type**: Normalized continuous values [0, 1]

#### Hidden Layer 1
- **Neurons**: 32
- **Activation Function**: ReLU (Rectified Linear Unit)
  - Formula: `f(x) = max(0, x)`
  - Purpose: Introduces non-linearity, prevents vanishing gradients
- **Initialization**: He Normal
  - Purpose: Optimal weight initialization for ReLU activation
  - Formula: `W ~ N(0, sqrt(2/n_in))`
- **Dropout**: 20%
  - Purpose: Regularization to prevent overfitting
  - During training: Randomly sets 20% of neurons to 0
  - During inference: All neurons active, scaled by 0.8

#### Hidden Layer 2
- **Neurons**: 16
- **Activation**: ReLU
- **Initialization**: He Normal
- **Dropout**: 20%
- **Purpose**: Learn mid-level feature representations

#### Hidden Layer 3
- **Neurons**: 8
- **Activation**: ReLU
- **Initialization**: He Normal
- **Purpose**: Learn high-level abstract features

#### Output Layer
- **Neurons**: 1
- **Activation**: Linear
  - Formula: `f(x) = x`
  - Purpose: Allows prediction of continuous values (regression)
- **Output**: Predicted GEN AVG score (continuous value)

### Architecture Rationale

**Decreasing Layer Sizes (32 → 16 → 8 → 1)**:
- Creates a funnel effect
- Progressively compresses information
- Forces the network to learn hierarchical representations

**Dropout Regularization**:
- Prevents co-adaptation of neurons
- Reduces overfitting on small datasets
- 20% rate is empirically proven effective

**ReLU Activation**:
- Computationally efficient
- Prevents vanishing gradient problem
- Industry standard for hidden layers

---

## Training Process

### Training Configuration

```typescript
{
  optimizer: 'adam',
  learningRate: 0.001,
  lossFunction: 'meanSquaredError',
  metrics: ['mae', 'mse'],
  epochs: 100,
  validationSplit: 0.2,
  batchSize: 32 (default),
  shuffle: true
}
```

### Optimizer: Adam

**Full Name**: Adaptive Moment Estimation

**Why Adam?**
- Combines benefits of AdaGrad and RMSProp
- Adaptive learning rates for each parameter
- Works well with sparse gradients
- Industry standard for neural networks

**Parameters**:
- Learning Rate (α): 0.001
- β₁ (momentum): 0.9 (TensorFlow.js default)
- β₂ (RMS decay): 0.999 (TensorFlow.js default)
- ε (numerical stability): 10⁻⁷ (default)

### Loss Function: Mean Squared Error (MSE)

**Formula**:
```
MSE = (1/n) × Σ(y_true - y_pred)²
```

**Why MSE?**
- Standard for regression problems
- Penalizes large errors more heavily
- Differentiable (required for backpropagation)
- Encourages predictions close to actual values

### Training Steps

1. **Data Loading**: Read Excel file with performance evaluations
2. **Data Validation**: Ensure all required columns present
3. **Feature Extraction**: Extract PAA, KSM, TS, CM, AL, GO values
4. **Target Extraction**: Extract GEN AVG values
5. **Train-Test Split**: 80% training, 20% testing
6. **Normalization**: Apply min-max scaling
7. **Model Creation**: Initialize neural network
8. **Training Loop**:
   - For each epoch (1-100):
     - Forward pass: Compute predictions
     - Loss calculation: Compute MSE
     - Backward pass: Compute gradients
     - Weight update: Apply Adam optimizer
     - Validation: Evaluate on validation set
9. **Model Evaluation**: Test on held-out test set
10. **Model Persistence**: Save model and normalizer to disk

### Early Stopping Strategy

Currently **not implemented**, but recommended for future versions:
- Monitor validation loss
- Stop training if validation loss doesn't improve for 10 epochs
- Prevents overfitting on training data

---

## Prediction Process

### Inference Workflow

1. **Input Validation**: Verify all 6 features are provided
2. **Normalization**: Apply same min-max scaling from training
3. **Forward Pass**:
   ```
   Input (6) → Dense(32) → Dropout → Dense(16) → Dropout → Dense(8) → Output(1)
   ```
4. **Denormalization**: Convert normalized output back to original scale
5. **Post-processing**:
   - Round to 2 decimal places
   - Classify performance category
   - Identify failed metrics (< 3.0)

### Performance Classification

```typescript
if (score >= 4.5) return 'Excellent'
else if (score >= 4.0) return 'Very Satisfactory'
else if (score >= 3.5) return 'Satisfactory'
else if (score >= 3.0) return 'Fair'
else return 'Needs Improvement'
```

### Prediction Types

1. **Automatic Prediction**:
   - Uses latest performance evaluation
   - Endpoint: `POST /ml/predict/:personnelId`

2. **Manual Prediction**:
   - Accepts custom metric values
   - Validates no duplicate for same semester
   - Endpoint: `POST /ml/predict-manual`

---

## Data Preprocessing

### Normalization: Min-Max Scaling

**Formula**:
```
x_normalized = (x - x_min) / (x_max - x_min)
```

**Purpose**:
- Scales all features to [0, 1] range
- Prevents features with larger ranges from dominating
- Improves gradient descent convergence
- Required for consistent model performance

**Implementation**:
```typescript
class DataNormalizer {
  private featureMin: number[]
  private featureMax: number[]
  private targetMin: number
  private targetMax: number

  fit(features, targets) { /* Calculate min/max */ }
  normalizeFeatures(features) { /* Apply formula */ }
  denormalizePredictions(predictions) { /* Reverse formula */ }
}
```

### Data Validation

**Required Checks**:
- All features must be numeric
- No missing values (impute with 0 if missing)
- Features should be within expected range [0-5]
- Sufficient training samples (minimum 20 recommended)

---

## Model Evaluation

### Metrics

#### 1. Mean Absolute Error (MAE)

**Formula**:
```
MAE = (1/n) × Σ|y_true - y_pred|
```

**Interpretation**:
- Average absolute difference between predictions and actual values
- In same units as target variable (GEN AVG score)
- **Target**: MAE < 0.5 (predictions within ±0.5 points)

#### 2. Mean Squared Error (MSE)

**Formula**:
```
MSE = (1/n) × Σ(y_true - y_pred)²
```

**Interpretation**:
- Average squared difference
- Penalizes large errors more heavily
- **Target**: MSE < 0.3

#### 3. Training Loss

**Purpose**: Monitor model convergence during training
**Expected Behavior**: Should decrease over epochs
**Warning Signs**:
- Loss increasing → model diverging
- Loss plateauing early → need more capacity or different architecture

### Model Validation Strategy

**Current**: Simple train-test split (80-20)

**Recommended for Production**:
- K-Fold Cross-Validation (k=5)
- Stratified sampling if performance categories are imbalanced
- Time-based split for temporal data

---

## Implementation Details

### Technology Stack

**Backend**:
- **Runtime**: Node.js 18+
- **Framework**: NestJS 10.x
- **ML Library**: TensorFlow.js 4.x
- **File Processing**: xlsx (Excel parsing)

**Frontend**:
- **Framework**: Next.js 14+ (React)
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts

### File Structure

```
api/src/modules/ml/
├── ml.module.ts              # NestJS module definition
├── ml.controller.ts          # REST API endpoints
├── ml.service.ts             # Business logic
├── tensorflow-model.ts       # Core ML implementation
└── dto/
    └── manual-prediction.dto.ts

web/app/dashboard/ml/
├── training/page.tsx         # Model training interface
├── predictions/page.tsx      # View predictions
├── analytics/page.tsx        # Performance analytics
└── manual-prediction/page.tsx # Manual prediction form

web/lib/api/
└── ml.api.ts                 # API client for ML endpoints

web/types/
└── ml.types.ts               # TypeScript type definitions
```

### Model Persistence

**Storage Location**: `models/performance-predictor/`

**Saved Artifacts**:
1. **model.json**: Model architecture and weights
2. **model.weights.bin**: Binary weight data
3. **metadata.json**:
   - Normalizer parameters (min/max values)
   - Training history (loss per epoch)
   - Evaluation metrics (MAE, MSE)
   - Training timestamp
   - Model version

**Loading Strategy**:
- Model loaded on application startup
- Cached in memory for fast inference
- Automatically reloaded after retraining

---

## API Endpoints

### Training Endpoints

#### Train Model
```
POST /ml/train
Content-Type: multipart/form-data

Request:
  - file: Excel file (.xlsx, .xls, .csv)
  - Required columns: PAA, KSM, TS, CM, AL, GO, GEN AVG

Response:
{
  "message": "TensorFlow model trained successfully from file.",
  "records": 150,
  "trainingHistory": {
    "epoch": [1, 2, ..., 100],
    "loss": [0.5, 0.4, ..., 0.1],
    "valLoss": [0.6, 0.5, ..., 0.12],
    "mse": [...],
    "mae": [...]
  },
  "metrics": {
    "loss": 0.12,
    "mse": 0.15,
    "mae": 0.35
  },
  "trainedAt": "2026-01-23T10:30:00.000Z"
}
```

#### Get Model Info
```
GET /ml/model-info

Response:
{
  "trainedAt": "2026-01-23T10:30:00.000Z",
  "trainingHistory": { ... },
  "metrics": { ... },
  "modelSummary": {
    "inputFeatures": ["PAA", "KSM", "TS", "CM", "AL", "GO"],
    "targetVariable": "GEN AVG",
    "architecture": "Neural Network (32-16-8-1)"
  }
}
```

### Prediction Endpoints

#### Predict Performance (Automatic)
```
POST /ml/predict/:personnelId

Response:
{
  "prediction": 4.25,
  "trainedAt": "2026-01-23T10:30:00.000Z",
  "failedMetrics": ["TS", "CM"],
  "modelMetrics": {
    "loss": 0.12,
    "mse": 0.15,
    "mae": 0.35
  }
}
```

#### Predict Performance (Manual)
```
POST /ml/predict-manual

Request:
{
  "personnelId": "507f1f77bcf86cd799439011",
  "semester": "1st Semester 2024-2025",
  "metrics": {
    "PAA": 4.5,
    "KSM": 4.0,
    "TS": 3.5,
    "CM": 4.2,
    "AL": 4.8,
    "GO": 4.3
  }
}

Response:
{
  "prediction": 4.22,
  "trainedAt": "2026-01-23T10:30:00.000Z",
  "failedMetrics": [],
  "modelMetrics": { ... }
}
```

### Analytics Endpoints

#### Get Analytics
```
GET /ml/analytics

Response:
{
  "overallAverages": {
    "PAA": 4.2,
    "KSM": 4.0,
    "TS": 3.8,
    "CM": 4.1,
    "AL": 4.5,
    "GO": 4.3,
    "totalEvaluations": 150
  },
  "semesterTrends": [
    { "_id": "1st Semester 2023-2024", "avgScore": 4.1 },
    { "_id": "2nd Semester 2023-2024", "avgScore": 4.3 }
  ]
}
```

#### Get Accuracy Trends
```
GET /ml/accuracy-trends

Response:
[
  {
    "date": "2026-01-23T10:00:00.000Z",
    "accuracy": 75.5,
    "count": 1
  },
  {
    "date": "2026-01-23T10:05:00.000Z",
    "accuracy": 82.3,
    "count": 2
  }
]
```

---

## Performance Metrics

### Computational Performance

**Training Time**:
- 100 samples: ~5-10 seconds
- 500 samples: ~15-25 seconds
- 1000 samples: ~30-45 seconds

**Inference Time**:
- Single prediction: < 50ms
- Batch prediction (100): < 500ms

**Memory Usage**:
- Model size: ~2-3 MB
- Runtime memory: ~50-100 MB

### Model Performance (Expected)

**With Sufficient Training Data (500+ samples)**:
- MAE: 0.3 - 0.5
- MSE: 0.15 - 0.25
- Accuracy within ±0.5: 85%+

**With Limited Training Data (100-500 samples)**:
- MAE: 0.5 - 0.8
- MSE: 0.25 - 0.4
- Accuracy within ±0.5: 70-80%

---

## Deployment

### Production Environment

**Requirements**:
- Node.js 18+
- Minimum 2 GB RAM
- 1 GB disk space for models and data
- CPU-based inference (no GPU required for this scale)

### Scaling Considerations

**Current Implementation**: Single-server deployment

**For Scale (1000+ predictions/day)**:
- Implement model caching
- Consider TensorFlow Serving for dedicated ML inference
- Load balancing across multiple instances
- Queue-based prediction processing

### Monitoring

**Recommended Metrics**:
- Prediction latency (p50, p95, p99)
- Error rates
- Model drift (compare predictions vs actuals over time)
- Data quality issues (missing features, out-of-range values)

---

## Future Improvements

### Short-term Enhancements

1. **Confidence Intervals**:
   - Implement prediction uncertainty estimation
   - Use Monte Carlo Dropout or ensemble methods
   - Display confidence ranges in UI

2. **Feature Importance**:
   - Implement SHAP or permutation importance
   - Show which metrics most influence predictions
   - Guide intervention strategies

3. **Model Versioning**:
   - Track multiple model versions
   - A/B testing between models
   - Rollback capabilities

### Medium-term Enhancements

1. **Advanced Architectures**:
   - LSTM for temporal patterns (if historical data available)
   - Attention mechanisms for feature weighting
   - Ensemble models (combine multiple models)

2. **Automated Retraining**:
   - Scheduled retraining on new data
   - Trigger retraining when performance degrades
   - Automated validation and deployment

3. **Explainability**:
   - LIME or SHAP for individual predictions
   - Counterfactual explanations ("If PAA increased by 0.5...")
   - Natural language explanations

### Long-term Vision

1. **Recommendation System**:
   - Personalized improvement recommendations
   - Intervention strategy suggestions
   - Resource allocation optimization

2. **Multi-task Learning**:
   - Predict multiple outcomes simultaneously
   - Predict promotion likelihood
   - Predict training needs

3. **Causal Inference**:
   - Identify causal factors (not just correlations)
   - Estimate intervention effects
   - Optimize resource allocation

---

## Appendix

### Glossary

- **Activation Function**: Mathematical function that determines neuron output
- **Backpropagation**: Algorithm for computing gradients in neural networks
- **Epoch**: One complete pass through the entire training dataset
- **Gradient Descent**: Optimization algorithm for minimizing loss function
- **Overfitting**: Model memorizes training data, performs poorly on new data
- **Regularization**: Techniques to prevent overfitting (e.g., dropout)

### References

1. TensorFlow.js Documentation: https://www.tensorflow.org/js
2. Goodfellow, I., Bengio, Y., & Courville, A. (2016). Deep Learning. MIT Press.
3. Kingma, D. P., & Ba, J. (2014). Adam: A Method for Stochastic Optimization. arXiv:1412.6980

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial specification |

---

**Document Maintained By**: Development Team
**Last Updated**: 2026-01-23
**Next Review**: 2026-04-23
