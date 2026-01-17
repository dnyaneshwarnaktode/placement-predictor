# SHAP Explainability - Implementation Guide

## Overview

SHAP (SHapley Additive exPlanations) has been integrated into the placement prediction system to provide model interpretability and explainability.

## Features

### 1. Individual Prediction Explanations
- Shows which features contributed most to a specific prediction
- Provides positive and negative feature impacts
- Displays SHAP values for each feature

### 2. Global Feature Importance
- Aggregates feature importance across all predictions
- Ranks features by their average impact
- Available for both placement and salary models

### 3. Feature Impact Values
- Quantifies the exact contribution of each feature
- Shows whether impact is positive or negative
- Helps understand model decisions

## Implementation Details

### Files Modified/Created

#### [NEW] `explainer.py`
SHAP explainer module with:
- `SHAPExplainer` class
- `explain_placement_prediction()` - Individual placement explanation
- `explain_salary_prediction()` - Individual salary explanation
- `get_global_feature_importance()` - Global feature importance

#### [MODIFIED] `predict.py`
- Added `enable_shap` parameter to `PlacementPredictor`
- Integrated SHAP explanations in `predict_complete()`
- SHAP explanations included in prediction response when enabled

#### [MODIFIED] `main.py`
- Enabled SHAP by default in predictor initialization
- Added SHAP response models: `FeatureImpact`, `SHAPExplanation`, `SHAPExplanations`
- Updated `PredictionResponse` to include optional `shap_explanations`
- Added `/feature-importance/{model_type}` endpoint

#### [MODIFIED] `requirements.txt`
- Added `shap==0.44.0`

## API Endpoints

### 1. `/predict` (POST)
Returns predictions with SHAP explanations included:
```json
{
  "placement": {...},
  "salary": {...},
  "skill_analysis": {...},
  "shap_explanations": {
    "placement": {
      "base_value": 0.5,
      "prediction_value": 0.75,
      "feature_impacts": [...],
      "top_positive_features": [...],
      "top_negative_features": [...]
    },
    "salary": {...}
  }
}
```

### 2. `/feature-importance/{model_type}` (GET)
Get global feature importance for placement or salary model:
```bash
GET /feature-importance/placement
GET /feature-importance/salary
```

Response:
```json
{
  "model_type": "placement",
  "feature_importance": [
    {
      "feature": "MBA Percentage",
      "feature_key": "mba_p",
      "importance": 0.234,
      "rank": 1
    },
    ...
  ]
}
```

### 3. `/model-info` (GET)
Now includes `shap_enabled` field to indicate if SHAP is available

## Usage Examples

### Python Test
```bash
cd ml-service/src
python explainer.py
```

### API Testing
```bash
# Start ML service
cd ml-service
python src/main.py

# Test prediction with SHAP (in another terminal)
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "M",
    "ssc_p": 67.0,
    "ssc_b": "Others",
    "hsc_p": 91.0,
    "hsc_b": "Others",
    "hsc_s": "Commerce",
    "degree_p": 58.0,
    "degree_t": "Sci&Tech",
    "workex": "No",
    "etest_p": 55.0,
    "specialisation": "Mkt&HR",
    "mba_p": 58.8
  }'

# Get feature importance
curl "http://localhost:8000/feature-importance/placement"
```

## Understanding SHAP Values

### Base Value
- The average prediction across all training data
- Represents what the model would predict without any features

### SHAP Value
- The contribution of each feature to the prediction
- Positive values push prediction higher
- Negative values push prediction lower

### Feature Impact
- `positive`: Feature increases prediction
- `negative`: Feature decreases prediction
- `abs_impact`: Absolute magnitude of impact

## Performance Considerations

- SHAP calculations add ~100-200ms to prediction time
- Background data uses 100 samples for faster computation
- Linear models use `LinearExplainer` for exact, fast explanations

## Disabling SHAP

To disable SHAP (for faster predictions):

In `main.py`:
```python
predictor = PlacementPredictor(models_dir='../models', enable_shap=False)
```

## Next Steps

### Frontend Integration (Optional)
1. Display SHAP feature impact charts
2. Show top contributing features
3. Visualize positive/negative impacts with bar charts
4. Add feature importance dashboard

### Backend Enhancement (Optional)
1. Store SHAP values with predictions in MongoDB
2. Track feature importance trends over time
3. Generate SHAP summary reports
