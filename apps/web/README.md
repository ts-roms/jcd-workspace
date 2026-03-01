# Personnel Performance Management System

A modern, AI-powered web application for managing and predicting personnel performance using machine learning.

## Overview

This system combines traditional performance evaluation management with advanced machine learning capabilities to predict employee performance, identify at-risk individuals, and provide data-driven recommendations for improvement.

### Key Features

- **Performance Evaluation Management**: Track and manage employee performance evaluations
- **ML-Powered Predictions**: Deep learning model predicts future performance based on historical metrics
- **Real-time Analytics**: Comprehensive dashboards showing performance trends and insights
- **Department Management**: Organize personnel by departments with role-based access control
- **Audit Logging**: Complete audit trail of all system activities
- **Excellence Tracking**: Automatic identification and tracking of top performers

---

## Machine Learning Algorithm

### Quick Overview

The system uses a **Deep Neural Network** built with **TensorFlow.js** to predict employee performance scores.

**Algorithm Type**: Supervised Learning (Regression)
**Framework**: TensorFlow.js
**Model Architecture**: 4-layer feedforward neural network (32-16-8-1)

### Input Features

The model uses six performance metrics as input features:
- **PAA** - Performance Appraisal A
- **KSM** - Knowledge, Skills, and Management
- **TS** - Teaching Skills
- **CM** - Classroom Management
- **AL** - Administrative Leadership
- **GO** - Goal Orientation

### Output

**GEN AVG** - General Average Performance Score (continuous value, typically 1.0 - 5.0)

### Model Architecture

```
Input Layer (6 features)
    ↓
Dense Layer 1: 32 neurons, ReLU activation, 20% dropout
    ↓
Dense Layer 2: 16 neurons, ReLU activation, 20% dropout
    ↓
Dense Layer 3: 8 neurons, ReLU activation
    ↓
Output Layer: 1 neuron, Linear activation
```

### Training Configuration

- **Optimizer**: Adam (learning rate: 0.001)
- **Loss Function**: Mean Squared Error (MSE)
- **Metrics**: MAE, MSE
- **Epochs**: 100
- **Validation Split**: 20%
- **Data Preprocessing**: Min-Max Normalization

### Performance Metrics

- **Mean Absolute Error (MAE)**: Target < 0.5
- **Mean Squared Error (MSE)**: Target < 0.3
- **Accuracy**: Predictions within ±0.5 points (85%+ with sufficient data)

### How It Works

1. **Training**:
   - Upload historical performance data (Excel/CSV)
   - System extracts features and target values
   - Neural network trains for 100 epochs
   - Model saved to disk with normalizer parameters

2. **Prediction**:
   - Input current performance metrics
   - System normalizes data using training parameters
   - Neural network predicts GEN AVG score
   - System classifies performance category
   - Identifies metrics needing improvement (< 3.0)

3. **Classification**:
   - Excellent: ≥ 4.5
   - Very Satisfactory: 4.0 - 4.49
   - Satisfactory: 3.5 - 3.99
   - Fair: 3.0 - 3.49
   - Needs Improvement: < 3.0

### Detailed Documentation

For comprehensive technical details, see [ML_SPECIFICATION.md](../ML_SPECIFICATION.md)

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (React 18+)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation

### Backend (API)
- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with httpOnly cookies
- **ML Library**: TensorFlow.js 4.x
- **File Processing**: xlsx, multer

### DevOps
- **Containerization**: Docker
- **Package Manager**: npm
- **Version Control**: Git

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB instance (local or cloud)
- (Optional) Docker for containerized deployment

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd demo/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Backend Setup

See the [API README](../api/README.md) for backend setup instructions.

---

## Project Structure

```
web/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication pages
│   ├── admin/                    # Admin-only pages
│   ├── dashboard/                # User dashboard
│   │   ├── ml/                   # ML-specific pages
│   │   │   ├── training/         # Model training interface
│   │   │   ├── predictions/      # View predictions
│   │   │   ├── analytics/        # ML analytics
│   │   │   └── manual-prediction/ # Manual prediction form
│   ├── components/               # React components
│   │   ├── auth/                 # Authentication components
│   │   ├── guards/               # Route & permission guards
│   │   ├── layouts/              # Layout components
│   │   ├── ml/                   # ML-specific components
│   │   └── ui/                   # Reusable UI components
│   └── layout.tsx                # Root layout
├── lib/                          # Utility libraries
│   ├── api/                      # API client functions
│   │   ├── ml.api.ts             # ML API endpoints
│   │   └── axios.ts              # Axios configuration
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom React hooks
│   │   ├── useMLPredictions.ts   # ML predictions hook
│   │   ├── useMLTraining.ts      # ML training hook
│   │   └── useMLAnalytics.ts     # ML analytics hook
│   └── utils/                    # Utility functions
├── types/                        # TypeScript type definitions
│   ├── ml.types.ts               # ML-specific types
│   └── ...
└── public/                       # Static assets
```

---

## Machine Learning Features

### 1. Model Training

**Location**: Dashboard → ML → Training

**Features**:
- Upload training data (Excel/CSV)
- Automatic data validation
- Training progress monitoring
- Model metrics display (MAE, MSE, loss curves)
- Training history tracking

**API Endpoint**: `POST /ml/train`

### 2. Performance Prediction

**Location**: Dashboard → ML → Manual Prediction

**Features**:
- Input performance metrics manually
- Automatic prediction from latest evaluation
- Batch prediction for multiple employees
- Confidence indicators
- Failed metrics identification
- Performance category classification

**API Endpoints**:
- `POST /ml/predict/:personnelId` - Automatic prediction
- `POST /ml/predict-manual` - Manual prediction

### 3. ML Analytics

**Location**: Dashboard → ML → Analytics

**Features**:
- Model performance metrics
- Accuracy trends over time
- Feature importance visualization
- Department-wise insights
- Performance distribution charts

**API Endpoints**:
- `GET /ml/analytics` - Overall analytics
- `GET /ml/accuracy-trends` - Accuracy trends
- `GET /ml/model-info` - Model information

### 4. Predictions History

**Location**: Dashboard → ML → Predictions

**Features**:
- View all predictions
- Filter by department, performance category, date
- Prediction confidence scores
- Comparison with actual outcomes
- Export capabilities

---

## Usage Guide

### Training the Model

1. Navigate to **Dashboard → ML → Training**
2. Prepare your training data:
   - Excel file (.xlsx, .xls) or CSV
   - Required columns: PAA, KSM, TS, CM, AL, GO, GEN AVG
   - Minimum 20 rows recommended (100+ for best results)
3. Click "Upload Training Data"
4. Select your file and click "Train Model"
5. Wait for training to complete (typically 10-30 seconds)
6. Review model metrics (MAE, MSE should be low)

### Making Predictions

**Option 1: Automatic Prediction**
1. Navigate to **Dashboard → Personnel**
2. Click on a personnel record
3. Click "Predict Performance"
4. System uses latest evaluation data automatically

**Option 2: Manual Prediction**
1. Navigate to **Dashboard → ML → Manual Prediction**
2. Select personnel from dropdown
3. Choose semester
4. Enter performance metrics (PAA, KSM, TS, CM, AL, GO)
5. Click "Predict Performance"
6. View prediction and recommendations

### Viewing Analytics

1. Navigate to **Dashboard → ML → Analytics**
2. View model performance metrics
3. Explore accuracy trends chart
4. Review department-wise insights
5. Analyze performance distribution

---

## API Integration

### ML API Client

```typescript
import { mlApi } from '@/lib/api/ml.api';

// Train model
const result = await mlApi.trainModel(formData);

// Predict performance
const prediction = await mlApi.predictPerformance(personnelId);

// Get analytics
const analytics = await mlApi.getModelPerformance();

// Get training history
const history = await mlApi.getTrainingHistory();
```

### Type Definitions

All ML types are defined in `types/ml.types.ts`:

```typescript
interface MLPrediction {
  _id: string;
  personnel: Personnel;
  prediction: PredictionResult;
  featureImportance?: Record<string, number>;
  riskFactors?: RiskFactor[];
  recommendations?: Recommendation[];
}
```

---

## Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Authentication (if applicable)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Model Configuration

Model parameters can be adjusted in `api/src/modules/ml/tensorflow-model.ts`:

```typescript
// Training epochs
const EPOCHS = 100;

// Learning rate
const LEARNING_RATE = 0.001;

// Architecture
const LAYER_1_UNITS = 32;
const LAYER_2_UNITS = 16;
const LAYER_3_UNITS = 8;
```

---

## Security

### Authentication
- JWT tokens with httpOnly cookies
- Role-based access control (RBAC)
- Permission-based route protection

### Data Protection
- Input validation with Zod schemas
- XSS protection (React auto-escaping)
- CSRF protection (SameSite cookies)
- Secure file uploads

### Audit Logging
- All ML operations logged
- User actions tracked
- Model training history maintained

---

## Performance

### Frontend Optimization
- Next.js automatic code splitting
- React Query caching
- Lazy loading of components
- Optimized images and assets

### Backend Optimization
- Model caching in memory
- Efficient MongoDB queries
- Batch prediction support
- Response compression

### ML Inference
- Single prediction: < 50ms
- Batch prediction (100): < 500ms
- Model size: ~2-3 MB
- Memory usage: ~50-100 MB

---

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

---

## Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t personnel-management-web .

# Run container
docker run -p 3000:3000 personnel-management-web
```

### Environment-specific Builds

- **Development**: `npm run dev`
- **Staging**: `npm run build && npm start`
- **Production**: `npm run build && npm start`

---

## Troubleshooting

### Common Issues

1. **Model not loading**
   - Ensure model is trained first
   - Check `models/performance-predictor/` directory exists
   - Verify file permissions

2. **Predictions failing**
   - Verify all 6 features provided
   - Check feature values are numeric
   - Ensure model is trained

3. **Poor model performance**
   - Increase training data (500+ samples recommended)
   - Check data quality (no missing values)
   - Verify feature ranges are reasonable

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.

---

## Documentation

- **[ML_SPECIFICATION.md](../ML_SPECIFICATION.md)** - Comprehensive ML technical specification
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture overview
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Developer documentation
- **[README_RBAC.md](./README_RBAC.md)** - Role-based access control documentation

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

[Specify your license here]

---

## Support

For questions or issues:
- Check the [Documentation](#documentation)
- Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Contact the development team

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- ML powered by [TensorFlow.js](https://www.tensorflow.org/js)
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

**Version**: 1.0.0
**Last Updated**: 2026-01-23
