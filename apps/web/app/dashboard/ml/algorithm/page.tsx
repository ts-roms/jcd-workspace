'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Brain,
  Network,
  Settings,
  TrendingUp,
  Layers,
  Zap,
  FileText,
  CheckCircle,
  Info
} from 'lucide-react';

export default function AlgorithmPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Machine Learning Algorithm
          </h1>
          <p className="text-muted-foreground mt-2">
            Deep Neural Network for Performance Prediction
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          TensorFlow.js v4.x
        </Badge>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="h-4 w-4" />
              Algorithm Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Deep Neural Network</div>
            <p className="text-xs text-muted-foreground mt-1">Supervised Learning - Regression</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32-16-8-1</div>
            <p className="text-xs text-muted-foreground mt-1">4-layer feedforward network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">&lt; 50ms</div>
            <p className="text-xs text-muted-foreground mt-1">Single prediction latency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Accuracy Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%+</div>
            <p className="text-xs text-muted-foreground mt-1">Within ±0.5 points</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Overview</CardTitle>
              <CardDescription>
                Understanding the machine learning model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Purpose</h3>
                <p className="text-sm text-muted-foreground">
                  This deep neural network predicts employee performance scores (GEN AVG) based on six key performance metrics.
                  The model helps identify at-risk employees early and provides data-driven insights for performance improvement.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">How It Works</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Data Collection</h4>
                      <p className="text-sm text-muted-foreground">
                        Historical performance evaluations are collected with six metrics: PAA, KSM, TS, CM, AL, and GO.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Model Training</h4>
                      <p className="text-sm text-muted-foreground">
                        The neural network learns patterns from historical data through 100 training epochs using backpropagation.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Performance Prediction</h4>
                      <p className="text-sm text-muted-foreground">
                        New employee metrics are input, normalized, and passed through the network to predict GEN AVG score.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">Classification & Insights</h4>
                      <p className="text-sm text-muted-foreground">
                        Predictions are classified into performance categories and weak areas are identified for improvement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Key Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Early Intervention</h4>
                      <p className="text-xs text-muted-foreground">Identify at-risk employees before issues escalate</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Data-Driven Decisions</h4>
                      <p className="text-xs text-muted-foreground">Objective performance predictions based on patterns</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Resource Optimization</h4>
                      <p className="text-xs text-muted-foreground">Focus training and support where needed most</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Continuous Learning</h4>
                      <p className="text-xs text-muted-foreground">Model improves with more training data over time</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Architecture Tab */}
        <TabsContent value="architecture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Architecture</CardTitle>
              <CardDescription>
                Detailed layer-by-layer breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Visual Architecture */}
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">Input</Badge>
                    <div className="flex-1 border-l-2 border-primary pl-4">
                      <div className="font-semibold">Input Layer (6 neurons)</div>
                      <div className="text-xs text-muted-foreground">PAA, KSM, TS, CM, AL, GO</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="h-8 w-0.5 bg-gradient-to-b from-primary to-transparent"></div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge>Dense 1</Badge>
                    <div className="flex-1 border-l-2 border-blue-500 pl-4">
                      <div className="font-semibold">32 neurons, ReLU activation</div>
                      <div className="text-xs text-muted-foreground">He Normal initialization, 20% dropout</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="h-8 w-0.5 bg-gradient-to-b from-blue-500 to-transparent"></div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge>Dense 2</Badge>
                    <div className="flex-1 border-l-2 border-purple-500 pl-4">
                      <div className="font-semibold">16 neurons, ReLU activation</div>
                      <div className="text-xs text-muted-foreground">He Normal initialization, 20% dropout</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="h-8 w-0.5 bg-gradient-to-b from-purple-500 to-transparent"></div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge>Dense 3</Badge>
                    <div className="flex-1 border-l-2 border-orange-500 pl-4">
                      <div className="font-semibold">8 neurons, ReLU activation</div>
                      <div className="text-xs text-muted-foreground">He Normal initialization</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="h-8 w-0.5 bg-gradient-to-b from-orange-500 to-transparent"></div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">Output</Badge>
                    <div className="flex-1 border-l-2 border-green-500 pl-4">
                      <div className="font-semibold">Output Layer (1 neuron)</div>
                      <div className="text-xs text-muted-foreground">Linear activation, predicts GEN AVG</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Architecture Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Activation Functions</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="font-medium">ReLU (Hidden Layers)</div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">f(x) = max(0, x)</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prevents vanishing gradients, computationally efficient
                      </p>
                    </div>
                    <div>
                      <div className="font-medium">Linear (Output Layer)</div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">f(x) = x</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Allows continuous value prediction for regression
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Regularization</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="font-medium">Dropout (20%)</div>
                      <p className="text-xs text-muted-foreground">
                        Applied to first two dense layers to prevent overfitting
                      </p>
                    </div>
                    <div>
                      <div className="font-medium">He Normal Initialization</div>
                      <p className="text-xs text-muted-foreground">
                        Optimal weight initialization for ReLU activations
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Design Rationale</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Decreasing layer sizes (32 → 16 → 8 → 1):</strong> Creates a funnel effect that progressively compresses information, forcing the network to learn hierarchical representations from low-level features to high-level abstractions.
                  </p>
                  <p>
                    <strong className="text-foreground">Dropout regularization:</strong> Prevents co-adaptation of neurons and reduces overfitting, especially important when training data is limited.
                  </p>
                  <p>
                    <strong className="text-foreground">ReLU activation:</strong> Industry standard for hidden layers, prevents vanishing gradients while being computationally efficient.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Configuration</CardTitle>
              <CardDescription>
                How the model learns from data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Optimizer</h3>
                    <Badge className="mb-2">Adam (Adaptive Moment Estimation)</Badge>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Learning Rate:</span>
                        <code className="bg-muted px-2 py-0.5 rounded text-xs">0.001</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">β₁ (momentum):</span>
                        <code className="bg-muted px-2 py-0.5 rounded text-xs">0.9</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">β₂ (RMS decay):</span>
                        <code className="bg-muted px-2 py-0.5 rounded text-xs">0.999</code>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Adam combines the benefits of AdaGrad and RMSProp, using adaptive learning rates for each parameter.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Loss Function</h3>
                    <Badge className="mb-2">Mean Squared Error (MSE)</Badge>
                    <code className="block bg-muted px-3 py-2 rounded text-xs my-2">
                      MSE = (1/n) × Σ(y_true - y_pred)²
                    </code>
                    <p className="text-xs text-muted-foreground">
                      Standard loss function for regression. Penalizes large errors more heavily than small ones.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Training Parameters</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Epochs:</span>
                        <Badge variant="outline">100</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Validation Split:</span>
                        <Badge variant="outline">20%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Batch Size:</span>
                        <Badge variant="outline">32 (default)</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Shuffle:</span>
                        <Badge variant="outline">True</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Data Preprocessing</h3>
                    <Badge className="mb-2">Min-Max Normalization</Badge>
                    <code className="block bg-muted px-3 py-2 rounded text-xs my-2">
                      x_norm = (x - x_min) / (x_max - x_min)
                    </code>
                    <p className="text-xs text-muted-foreground">
                      Scales all features to [0, 1] range, preventing features with larger ranges from dominating.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Training Process</h3>
                <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                  <li>Load and validate training data from Excel/CSV file</li>
                  <li>Extract feature vectors (PAA, KSM, TS, CM, AL, GO) and target values (GEN AVG)</li>
                  <li>Split data into training (80%) and testing (20%) sets</li>
                  <li>Fit normalizer to training data and transform both sets</li>
                  <li>Initialize neural network with random weights</li>
                  <li>Train for 100 epochs with backpropagation and gradient descent</li>
                  <li>Evaluate on test set and calculate performance metrics</li>
                  <li>Save model, normalizer parameters, and metadata to disk</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Input Features & Target</CardTitle>
              <CardDescription>
                Understanding the data that drives predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Input Features (6)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>PAA</Badge>
                      <span className="text-xs text-muted-foreground">Feature 1</span>
                    </div>
                    <h4 className="font-semibold">Performance Appraisal A</h4>
                    <p className="text-sm text-muted-foreground">
                      Primary performance assessment score
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>KSM</Badge>
                      <span className="text-xs text-muted-foreground">Feature 2</span>
                    </div>
                    <h4 className="font-semibold">Knowledge, Skills, and Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Expertise and management capability assessment
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>TS</Badge>
                      <span className="text-xs text-muted-foreground">Feature 3</span>
                    </div>
                    <h4 className="font-semibold">Teaching Skills</h4>
                    <p className="text-sm text-muted-foreground">
                      Teaching effectiveness and methodology
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>CM</Badge>
                      <span className="text-xs text-muted-foreground">Feature 4</span>
                    </div>
                    <h4 className="font-semibold">Classroom Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Ability to manage classroom environment
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>AL</Badge>
                      <span className="text-xs text-muted-foreground">Feature 5</span>
                    </div>
                    <h4 className="font-semibold">Administrative Leadership</h4>
                    <p className="text-sm text-muted-foreground">
                      Leadership and administrative capabilities
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>GO</Badge>
                      <span className="text-xs text-muted-foreground">Feature 6</span>
                    </div>
                    <h4 className="font-semibold">Goal Orientation</h4>
                    <p className="text-sm text-muted-foreground">
                      Goal setting and achievement focus
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Target Variable</h3>
                <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="default" className="text-base px-3 py-1">GEN AVG</Badge>
                    <span className="text-sm text-muted-foreground">Output</span>
                  </div>
                  <h4 className="font-semibold text-lg">General Average Performance Score</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Continuous numeric value (typically 1.0 - 5.0) representing overall employee performance.
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Performance Classification</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500">Excellent</Badge>
                      <span className="text-sm">Outstanding performance</span>
                    </div>
                    <code className="text-sm bg-muted px-2 py-1 rounded">≥ 4.5</code>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500">Very Satisfactory</Badge>
                      <span className="text-sm">Above average performance</span>
                    </div>
                    <code className="text-sm bg-muted px-2 py-1 rounded">4.0 - 4.49</code>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-yellow-500">Satisfactory</Badge>
                      <span className="text-sm">Meets expectations</span>
                    </div>
                    <code className="text-sm bg-muted px-2 py-1 rounded">3.5 - 3.99</code>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-orange-500">Fair</Badge>
                      <span className="text-sm">Needs some improvement</span>
                    </div>
                    <code className="text-sm bg-muted px-2 py-1 rounded">3.0 - 3.49</code>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-red-500">Needs Improvement</Badge>
                      <span className="text-sm">Below expectations</span>
                    </div>
                    <code className="text-sm bg-muted px-2 py-1 rounded">&lt; 3.0</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                How we measure model accuracy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Mean Absolute Error (MAE)</h3>
                    <Badge variant="outline">Primary</Badge>
                  </div>
                  <code className="block bg-muted px-3 py-2 rounded text-xs">
                    MAE = (1/n) × Σ|y_true - y_pred|
                  </code>
                  <p className="text-sm text-muted-foreground">
                    Average absolute difference between predicted and actual values. More interpretable than MSE.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Target:</span>
                    <Badge className="bg-green-500">MAE &lt; 0.5</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Predictions should be within ±0.5 points on average
                  </p>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Mean Squared Error (MSE)</h3>
                    <Badge variant="outline">Secondary</Badge>
                  </div>
                  <code className="block bg-muted px-3 py-2 rounded text-xs">
                    MSE = (1/n) × Σ(y_true - y_pred)²
                  </code>
                  <p className="text-sm text-muted-foreground">
                    Average squared difference. Penalizes large errors more heavily than MAE.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Target:</span>
                    <Badge className="bg-green-500">MSE &lt; 0.3</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lower values indicate better model performance
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Model Accuracy</h3>
                <div className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">With Sufficient Data (500+ samples)</span>
                      <Badge className="bg-green-500">Excellent</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">MAE</div>
                        <div className="font-semibold">0.3 - 0.5</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">MSE</div>
                        <div className="font-semibold">0.15 - 0.25</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Accuracy</div>
                        <div className="font-semibold">85%+</div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">With Limited Data (100-500 samples)</span>
                      <Badge className="bg-yellow-500">Good</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">MAE</div>
                        <div className="font-semibold">0.5 - 0.8</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">MSE</div>
                        <div className="font-semibold">0.25 - 0.4</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Accuracy</div>
                        <div className="font-semibold">70-80%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Performance Benchmarks</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>Single Prediction Latency</span>
                    <code className="bg-background px-2 py-1 rounded">&lt; 50ms</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>Batch Prediction (100 employees)</span>
                    <code className="bg-background px-2 py-1 rounded">&lt; 500ms</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>Model Size</span>
                    <code className="bg-background px-2 py-1 rounded">~2-3 MB</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>Memory Usage</span>
                    <code className="bg-background px-2 py-1 rounded">~50-100 MB</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a
                  href="/ML_SPECIFICATION.md"
                  target="_blank"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">ML Technical Specification</div>
                      <div className="text-sm text-muted-foreground">Comprehensive technical documentation</div>
                    </div>
                  </div>
                  <Badge variant="outline">PDF</Badge>
                </a>

                <a
                  href="https://www.tensorflow.org/js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">TensorFlow.js Documentation</div>
                      <div className="text-sm text-muted-foreground">Official framework documentation</div>
                    </div>
                  </div>
                  <Badge variant="outline">External</Badge>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
