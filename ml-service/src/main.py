"""
FastAPI ML Service
REST API for college placement prediction models.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import uvicorn
from predict import PlacementPredictor

# Initialize FastAPI app
app = FastAPI(
    title="College Placement Prediction API",
    description="AI-powered API for predicting student placement and salary",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictor with SHAP enabled
try:
    predictor = PlacementPredictor(models_dir='../models', enable_shap=True)
except Exception as e:
    print(f"Warning: Could not load models. Please train models first. Error: {e}")
    predictor = None

# Pydantic models for request/response
class StudentData(BaseModel):
    """Student data for prediction"""
    gender: str = Field(..., description="Gender: M or F")
    ssc_p: float = Field(..., ge=0, le=100, description="Secondary Education percentage (10th)")
    ssc_b: str = Field(..., description="Board of Education (SSC): Central or Others")
    hsc_p: float = Field(..., ge=0, le=100, description="Higher Secondary percentage (12th)")
    hsc_b: str = Field(..., description="Board of Education (HSC): Central or Others")
    hsc_s: str = Field(..., description="Specialization: Commerce, Science, or Arts")
    degree_p: float = Field(..., ge=0, le=100, description="Degree percentage")
    degree_t: str = Field(..., description="Degree type: Sci&Tech, Comm&Mgmt, or Others")
    workex: str = Field(..., description="Work experience: Yes or No")
    etest_p: float = Field(..., ge=0, le=100, description="Employability test percentage")
    specialisation: str = Field(..., description="MBA specialization: Mkt&HR or Mkt&Fin")
    mba_p: float = Field(..., ge=0, le=100, description="MBA percentage")
    
    class Config:
        json_schema_extra = {
            "example": {
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
        }

class PlacementResult(BaseModel):
    """Placement prediction result"""
    placed: bool
    probability: float
    confidence: float

class SalaryRange(BaseModel):
    """Salary range"""
    min: float
    max: float

class SalaryResult(BaseModel):
    """Salary prediction result"""
    expected_salary: float
    salary_range: SalaryRange

class SkillGap(BaseModel):
    """Skill gap information"""
    area: str
    current: str
    target: str
    priority: str

class SkillAnalysis(BaseModel):
    """Skill analysis result"""
    skill_gaps: List[SkillGap]
    recommendations: List[str]
    overall_score: float
    improvement_potential: str

class FeatureImpact(BaseModel):
    """Feature impact from SHAP"""
    feature: str
    feature_key: str
    value: float
    shap_value: float
    impact: str
    abs_impact: float

class SHAPExplanation(BaseModel):
    """SHAP explanation for a prediction"""
    base_value: float
    prediction_value: float
    feature_impacts: List[FeatureImpact]
    top_positive_features: List[FeatureImpact]
    top_negative_features: List[FeatureImpact]

class SHAPExplanations(BaseModel):
    """SHAP explanations for both models"""
    placement: SHAPExplanation
    salary: Optional[SHAPExplanation]

class PredictionResponse(BaseModel):
    """Complete prediction response"""
    placement: PlacementResult
    salary: Optional[SalaryResult]
    skill_analysis: SkillAnalysis
    shap_explanations: Optional[SHAPExplanations] = None

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "College Placement Prediction API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "predict": "/predict (POST)",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    models_loaded = predictor is not None
    return {
        "status": "healthy" if models_loaded else "models_not_loaded",
        "models_loaded": models_loaded,
        "message": "Service is running" if models_loaded else "Please train models first"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_placement(student: StudentData):
    """
    Predict placement probability and expected salary for a student
    
    Args:
        student: Student data
        
    Returns:
        Prediction results with placement probability, salary, and skill analysis
    """
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Please train models first by running train.py"
        )
    
    try:
        # Convert Pydantic model to dict
        student_dict = student.model_dump()
        
        # Make prediction
        result = predictor.predict_complete(student_dict)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@app.get("/model-info")
async def model_info():
    """Get information about the loaded models"""
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded"
        )
    
    return {
        "placement_model": "Logistic Regression",
        "salary_model": "Linear Regression",
        "features": predictor.preprocessor.feature_columns,
        "feature_count": len(predictor.preprocessor.feature_columns),
        "shap_enabled": predictor.enable_shap
    }

@app.get("/feature-importance/{model_type}")
async def get_feature_importance(model_type: str):
    """
    Get global feature importance using SHAP
    
    Args:
        model_type: 'placement' or 'salary'
        
    Returns:
        List of features with importance scores
    """
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded"
        )
    
    if not predictor.enable_shap or not predictor.shap_explainer:
        raise HTTPException(
            status_code=503,
            detail="SHAP explainer not available"
        )
    
    if model_type not in ['placement', 'salary']:
        raise HTTPException(
            status_code=400,
            detail="model_type must be 'placement' or 'salary'"
        )
    
    try:
        importance = predictor.shap_explainer.get_global_feature_importance(model_type)
        return {
            "model_type": model_type,
            "feature_importance": importance
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get feature importance: {str(e)}"
        )

# Run server
if __name__ == "__main__":
    print("\n" + "="*60)
    print("Starting College Placement Prediction API")
    print("="*60)
    print("\nAPI Documentation: http://localhost:8000/docs")
    print("Health Check: http://localhost:8000/health")
    print("\n" + "="*60 + "\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
