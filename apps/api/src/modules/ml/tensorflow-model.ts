import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs';
import * as path from 'path';

export const FEATURES = ['PAA', 'KSM', 'TS', 'CM', 'AL', 'GO'];
export const TARGET = 'GEN AVG';
export const METRIC_FAILURE_THRESHOLD = 3.0;
export const MODEL_SAVE_PATH = path.join(
  process.cwd(),
  'models',
  'performance-predictor',
);

export interface TrainingData {
  features: number[][];
  targets: number[];
}

export interface ModelMetrics {
  loss: number;
  valLoss?: number;
  mse: number;
  mae: number;
}

export interface TrainingHistory {
  epoch: number[];
  loss: number[];
  valLoss: number[];
  mse: number[];
  mae: number[];
}

/**
 * Normalizes the input data using min-max normalization
 */
export class DataNormalizer {
  private featureMin: number[] = [];
  private featureMax: number[] = [];
  private targetMin = 0;
  private targetMax = 0;

  /**
   * Fit the normalizer to the training data
   */
  fit(features: number[][], targets: number[]): void {
    // Calculate min and max for each feature
    this.featureMin = new Array(features[0].length).fill(Infinity);
    this.featureMax = new Array(features[0].length).fill(-Infinity);

    for (const sample of features) {
      for (let i = 0; i < sample.length; i++) {
        this.featureMin[i] = Math.min(this.featureMin[i], sample[i]);
        this.featureMax[i] = Math.max(this.featureMax[i], sample[i]);
      }
    }

    // Calculate min and max for target
    this.targetMin = Math.min(...targets);
    this.targetMax = Math.max(...targets);
  }

  /**
   * Normalize features
   */
  normalizeFeatures(features: number[][]): number[][] {
    return features.map((sample) =>
      sample.map((value, i) => {
        const range = this.featureMax[i] - this.featureMin[i];
        return range === 0 ? 0 : (value - this.featureMin[i]) / range;
      }),
    );
  }

  /**
   * Normalize targets
   */
  normalizeTargets(targets: number[]): number[] {
    const range = this.targetMax - this.targetMin;
    return targets.map((value) =>
      range === 0 ? 0 : (value - this.targetMin) / range,
    );
  }

  /**
   * Denormalize predictions back to original scale
   */
  denormalizePredictions(predictions: number[]): number[] {
    const range = this.targetMax - this.targetMin;
    return predictions.map((value) => value * range + this.targetMin);
  }

  /**
   * Get normalization parameters for saving
   */
  getParams() {
    return {
      featureMin: this.featureMin,
      featureMax: this.featureMax,
      targetMin: this.targetMin,
      targetMax: this.targetMax,
    };
  }

  /**
   * Load normalization parameters
   */
  loadParams(params: {
    featureMin: number[];
    featureMax: number[];
    targetMin: number;
    targetMax: number;
  }): void {
    this.featureMin = params.featureMin;
    this.featureMax = params.featureMax;
    this.targetMin = params.targetMin;
    this.targetMax = params.targetMax;
  }
}

/**
 * Creates a TensorFlow neural network model for performance prediction.
 * Architecture is sized appropriately for the dataset — smaller networks
 * generalize better on limited data and avoid overfitting.
 */
export function createPerformanceModel(inputDim: number): tf.LayersModel {
  const model = tf.sequential();

  // First hidden layer — moderate size for small datasets
  model.add(
    tf.layers.dense({
      inputShape: [inputDim],
      units: 16,
      activation: 'relu',
      kernelInitializer: 'heNormal',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
    }),
  );

  // Light dropout
  model.add(tf.layers.dropout({ rate: 0.1 }));

  // Second hidden layer
  model.add(
    tf.layers.dense({
      units: 8,
      activation: 'relu',
      kernelInitializer: 'heNormal',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
    }),
  );

  // Output layer (single value for GEN AVG prediction)
  model.add(
    tf.layers.dense({
      units: 1,
      activation: 'linear',
    }),
  );

  // Compile with Adam optimizer — lower learning rate for stability
  model.compile({
    optimizer: tf.train.adam(0.005),
    loss: 'meanSquaredError',
    metrics: ['mae', 'mse'],
  });

  return model;
}

/**
 * Prepares training data from raw records
 */
export function prepareTrainingData(
  data: Record<string, number>[],
): TrainingData {
  const features: number[][] = [];
  const targets: number[] = [];

  for (const record of data) {
    const featureVector = FEATURES.map((feat) => record[feat] || 0);
    features.push(featureVector);
    targets.push(record[TARGET] || 0);
  }

  return { features, targets };
}

/**
 * Augment training data by adding slight noise to create more samples.
 * Helps prevent overfitting on small datasets.
 */
function augmentData(
  features: number[][],
  targets: number[],
  factor = 3,
  noiseLevel = 0.02,
): { features: number[][]; targets: number[] } {
  const augFeatures = [...features];
  const augTargets = [...targets];

  for (let i = 0; i < factor; i++) {
    for (let j = 0; j < features.length; j++) {
      const noisyFeature = features[j].map(
        (v) => v + (Math.random() - 0.5) * 2 * noiseLevel * v,
      );
      const noisyTarget =
        targets[j] + (Math.random() - 0.5) * 2 * noiseLevel * targets[j];
      augFeatures.push(noisyFeature);
      augTargets.push(noisyTarget);
    }
  }

  return { features: augFeatures, targets: augTargets };
}

/**
 * Trains the TensorFlow model with data augmentation and early stopping
 */
export async function trainModel(
  model: tf.LayersModel,
  normalizer: DataNormalizer,
  trainingData: TrainingData,
  epochs = 300,
  validationSplit = 0.2,
): Promise<TrainingHistory> {
  // Augment data to improve generalization on small datasets
  const augmented = augmentData(
    trainingData.features,
    trainingData.targets,
    4,
    0.03,
  );

  // Fit normalizer to original data only (not augmented) to preserve true ranges
  normalizer.fit(trainingData.features, trainingData.targets);

  // Normalize augmented data
  const normalizedFeatures = normalizer.normalizeFeatures(augmented.features);
  const normalizedTargets = normalizer.normalizeTargets(augmented.targets);

  // Convert to tensors
  const xs = tf.tensor2d(normalizedFeatures);
  const ys = tf.tensor2d(normalizedTargets, [normalizedTargets.length, 1]);

  // Early stopping tracking
  let bestValLoss = Infinity;
  let patienceCounter = 0;
  const patience = 30;
  let stoppedEpoch = epochs;

  // Train the model
  const history = await model.fit(xs, ys, {
    epochs,
    validationSplit,
    shuffle: true,
    verbose: 0,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (epoch % 50 === 0) {
          console.log(
            `Epoch ${epoch}: loss = ${logs?.loss.toFixed(6)}, val_loss = ${logs?.val_loss?.toFixed(6) || 'N/A'}, mae = ${logs?.mae?.toFixed(6) || 'N/A'}`,
          );
        }

        // Early stopping
        const valLoss = logs?.val_loss ?? logs?.loss ?? Infinity;
        if (valLoss < bestValLoss - 0.0001) {
          bestValLoss = valLoss;
          patienceCounter = 0;
        } else {
          patienceCounter++;
        }
        if (patienceCounter >= patience) {
          stoppedEpoch = epoch + 1;
          model.stopTraining = true;
          console.log(`Early stopping at epoch ${stoppedEpoch}`);
        }
      },
    },
  });

  // Clean up tensors
  xs.dispose();
  ys.dispose();

  // Extract history (only up to the epoch we stopped at)
  const actualEpochs = (history.history.loss as number[]).length;
  const trainingHistory: TrainingHistory = {
    epoch: Array.from({ length: actualEpochs }, (_, i) => i + 1),
    loss: history.history.loss as number[],
    valLoss: (history.history.val_loss as number[]) || [],
    mse: history.history.mse as number[],
    mae: history.history.mae as number[],
  };

  return trainingHistory;
}

/**
 * Makes predictions using the trained model
 */
export async function predict(
  model: tf.LayersModel,
  normalizer: DataNormalizer,
  features: Record<string, number>,
): Promise<number> {
  // Convert features to array
  const featureVector = FEATURES.map((feat) => features[feat] || 0);

  // Normalize
  const normalizedFeatures = normalizer.normalizeFeatures([featureVector]);

  // Convert to tensor
  const inputTensor = tf.tensor2d(normalizedFeatures);

  // Make prediction
  const predictionTensor = model.predict(inputTensor) as tf.Tensor;
  const normalizedPrediction = await predictionTensor.data();

  // Denormalize
  const prediction = normalizer.denormalizePredictions([
    normalizedPrediction[0],
  ])[0];

  // Clean up tensors
  inputTensor.dispose();
  predictionTensor.dispose();

  return prediction;
}

/**
 * Evaluates model performance on test data
 */
export async function evaluateModel(
  model: tf.LayersModel,
  normalizer: DataNormalizer,
  testData: TrainingData,
): Promise<ModelMetrics> {
  const normalizedFeatures = normalizer.normalizeFeatures(testData.features);
  const normalizedTargets = normalizer.normalizeTargets(testData.targets);

  const xs = tf.tensor2d(normalizedFeatures);
  const ys = tf.tensor2d(normalizedTargets, [normalizedTargets.length, 1]);

  const result = model.evaluate(xs, ys) as tf.Scalar[];
  const loss = await result[0].data();
  const mae = await result[1].data();
  const mse = await result[2].data();

  xs.dispose();
  ys.dispose();
  result.forEach((tensor) => tensor.dispose());

  return {
    loss: loss[0],
    mse: mse[0],
    mae: mae[0],
  };
}

/**
 * Saves the TensorFlow model and normalizer to disk.
 * Uses a custom IOHandler because file:// is only supported with @tensorflow/tfjs-node.
 */
export async function saveModel(
  model: tf.LayersModel,
  normalizer: DataNormalizer,
  trainingHistory: TrainingHistory,
  metrics: ModelMetrics,
): Promise<void> {
  if (!fs.existsSync(MODEL_SAVE_PATH)) {
    fs.mkdirSync(MODEL_SAVE_PATH, { recursive: true });
  }

  await model.save(
    tf.io.withSaveHandler(async (artifacts) => {
      const weightsPath = path.join(MODEL_SAVE_PATH, 'weights.bin');
      const weightData =
        artifacts.weightData != null
          ? Array.isArray(artifacts.weightData)
            ? Buffer.concat(
                artifacts.weightData.map((ab) => Buffer.from(new Uint8Array(ab))),
              )
            : Buffer.from(new Uint8Array(artifacts.weightData))
          : Buffer.alloc(0);
      fs.writeFileSync(weightsPath, weightData);
      const modelJson = {
        modelTopology: artifacts.modelTopology,
        weightsManifest: [
          {
            paths: ['weights.bin'],
            weights: artifacts.weightSpecs,
          },
        ],
      };
      const modelJsonPath = path.join(MODEL_SAVE_PATH, 'model.json');
      const modelJsonStr = JSON.stringify(modelJson, null, 2);
      fs.writeFileSync(modelJsonPath, modelJsonStr);
      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: 'JSON' as const,
          modelTopologyBytes: Buffer.byteLength(modelJsonStr, 'utf-8'),
          weightSpecsBytes: JSON.stringify(artifacts.weightSpecs).length,
          weightDataBytes: weightData.length,
        },
      };
    }),
  );

  const metadata = {
    normalizerParams: normalizer.getParams(),
    trainingHistory,
    metrics,
    trainedAt: new Date().toISOString(),
    modelVersion: '1.0.0',
  };
  const metadataPath = path.join(MODEL_SAVE_PATH, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log(`Model saved successfully to ${MODEL_SAVE_PATH}`);
}

/**
 * Loads the TensorFlow model and normalizer from disk.
 * Uses a custom IOHandler because file:// is only supported with @tensorflow/tfjs-node.
 */
export async function loadModel(): Promise<{
  model: tf.LayersModel;
  normalizer: DataNormalizer;
  trainingHistory: TrainingHistory;
  metrics: ModelMetrics;
  trainedAt: Date;
} | null> {
  try {
    const modelJsonPath = path.join(MODEL_SAVE_PATH, 'model.json');
    const metadataPath = path.join(MODEL_SAVE_PATH, 'metadata.json');

    if (!fs.existsSync(modelJsonPath) || !fs.existsSync(metadataPath)) {
      console.log('No saved model found');
      return null;
    }

    const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, 'utf-8'));
    const weightsPath = path.join(MODEL_SAVE_PATH, 'weights.bin');
    if (!fs.existsSync(weightsPath)) {
      console.log('Weights file not found');
      return null;
    }
    const weightData = fs.readFileSync(weightsPath);
    const weightSpecs = modelJson.weightsManifest?.[0]?.weights ?? [];
    const weightDataArrayBuffer = new Uint8Array(weightData).buffer;

    const handler: tf.io.IOHandler = {
      load: async () => ({
        modelTopology: modelJson.modelTopology,
        weightSpecs,
        weightData: weightDataArrayBuffer,
      }),
    };
    const model = await tf.loadLayersModel(handler);

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    const normalizer = new DataNormalizer();
    normalizer.loadParams(metadata.normalizerParams);

    console.log(`Model loaded successfully from ${MODEL_SAVE_PATH}`);
    console.log(`Model was trained at: ${metadata.trainedAt}`);

    return {
      model,
      normalizer,
      trainingHistory: metadata.trainingHistory,
      metrics: metadata.metrics,
      trainedAt: new Date(metadata.trainedAt),
    };
  } catch (error) {
    console.error('Error loading model:', error);
    return null;
  }
}

/**
 * Checks if a saved model exists
 */
export function modelExists(): boolean {
  const modelJsonPath = path.join(MODEL_SAVE_PATH, 'model.json');
  return fs.existsSync(modelJsonPath);
}
