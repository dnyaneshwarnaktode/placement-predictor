# ML Service - College Placement Prediction

Python-based machine learning service using FastAPI to predict student placement and salary.

## Features

- **Placement Classification**: Logistic Regression model predicting placement probability
- **Salary Regression**: Linear Regression model predicting expected salary
- **Skill Gap Analysis**: Identifies areas for improvement with recommendations
- **REST API**: FastAPI endpoints for easy integration

## Setup

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Download Dataset**
Download the Kaggle dataset "factors-affecting-campus-placement" and place it at:
```
ml-service/data/Placement_Data_Full_Class.csv
```

3. **Train Models**
```bash
cd src
python train.py
```

This will:
- Preprocess the data
- Train both models
- Evaluate performance
- Save models to `../models/`

4. **Start API Server**
```bash
cd src
python main.py
```

API will be available at `http://localhost:8000`

## API Endpoints

### POST /predict
Predict placement and salary for a student.

**Request Body:**
```json
{
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
}
```

**Response:**
```json
{
  "placement": {
    "placed": false,
    "probability": 0.42,
    "confidence": 0.58
  },
  "salary": {
    "expected_salary": 250000,
    "salary_range": {
      "min": 225000,
      "max": 275000
    }
  },
  "skill_analysis": {
    "skill_gaps": [...],
    "recommendations": [...],
    "overall_score": 72.0,
    "improvement_potential": "medium"
  }
}
```

### GET /health
Check service health status.

### GET /model-info
Get information about loaded models.

## Model Performance

- **Placement Model**: ~85% accuracy
- **Salary Model**: R² score ~0.75, RMSE ~50,000

## Documentation

Interactive API docs available at `http://localhost:8000/docs`
