"""
SHAP Explainability Module
Provides model interpretability using SHAP (SHapley Additive exPlanations).
"""

import shap
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import joblib
import os


class SHAPExplainer:
    """SHAP-based explainer for placement prediction models"""
    
    def __init__(self, models_dir='../models'):
        """Initialize SHAP explainers for both models"""
        self.models_dir = models_dir
        self.placement_model = None
        self.salary_model = None
        self.preprocessor = None
        self.placement_explainer = None
        self.salary_explainer = None
        self.background_data = None
        
        self.load_models()
        self.initialize_explainers()
    
    def load_models(self):
        """Load trained models and preprocessor"""
        try:
            self.placement_model = joblib.load(
                os.path.join(self.models_dir, 'placement_model.pkl')
            )
            self.salary_model = joblib.load(
                os.path.join(self.models_dir, 'salary_model.pkl')
            )
            self.preprocessor = joblib.load(
                os.path.join(self.models_dir, 'preprocessor.pkl')
            )
            print("✓ Models loaded for SHAP explainer")
        except Exception as e:
            print(f"Error loading models for SHAP: {e}")
            raise
    
    def initialize_explainers(self, background_samples=100):
        """
        Initialize SHAP explainers with background data
        
        Args:
            background_samples: Number of samples for background dataset
        """
        try:
            # Create synthetic background data based on typical ranges
            # This is used as reference for SHAP calculations
            background_data = self._create_background_data(background_samples)
            
            # Initialize explainers
            # For linear models, we use LinearExplainer which is faster and exact
            self.placement_explainer = shap.LinearExplainer(
                self.placement_model,
                background_data,
                feature_perturbation="interventional"
            )
            
            self.salary_explainer = shap.LinearExplainer(
                self.salary_model,
                background_data
            )
            
            self.background_data = background_data
            print("✓ SHAP explainers initialized")
            
        except Exception as e:
            print(f"Error initializing SHAP explainers: {e}")
            raise
    
    def _create_background_data(self, n_samples=100):
        """
        Create synthetic background data for SHAP
        
        Args:
            n_samples: Number of background samples to generate
            
        Returns:
            DataFrame with background data
        """
        # Generate realistic background data based on typical student profiles
        np.random.seed(42)
        
        background = pd.DataFrame({
            'gender': np.random.randint(0, 2, n_samples),  # 0 or 1
            'ssc_p': np.random.uniform(40, 95, n_samples),
            'ssc_b': np.random.randint(0, 2, n_samples),
            'hsc_p': np.random.uniform(40, 95, n_samples),
            'hsc_b': np.random.randint(0, 2, n_samples),
            'hsc_s': np.random.randint(0, 3, n_samples),  # 3 specializations
            'degree_p': np.random.uniform(45, 90, n_samples),
            'degree_t': np.random.randint(0, 3, n_samples),
            'workex': np.random.randint(0, 2, n_samples),
            'etest_p': np.random.uniform(50, 95, n_samples),
            'specialisation': np.random.randint(0, 2, n_samples),
            'mba_p': np.random.uniform(50, 90, n_samples),
        })
        
        # Add engineered features
        background['avg_academic_score'] = (
            background['ssc_p'] + 
            background['hsc_p'] + 
            background['degree_p']
        ) / 3
        
        background['academic_consistency'] = background[['ssc_p', 'hsc_p', 'degree_p']].std(axis=1)
        background['mba_performance'] = background['mba_p']
        
        return background
    
    def explain_placement_prediction(self, student_data: Dict) -> Dict:
        """
        Explain placement prediction for a single student
        
        Args:
            student_data: Dictionary with student information
            
        Returns:
            Dictionary with SHAP values and feature impacts
        """
        # Preprocess input
        X = self.preprocessor.preprocess_input(student_data)
        
        # Calculate SHAP values
        shap_values = self.placement_explainer.shap_values(X)
        
        # Get base value (expected value)
        base_value = self.placement_explainer.expected_value
        
        # For binary classification, shap_values might be 2D
        if isinstance(shap_values, list):
            shap_values = shap_values[1]  # Use positive class
        
        # Create feature impact list
        feature_impacts = []
        feature_names = self.preprocessor.feature_columns
        
        for i, (feature, shap_val) in enumerate(zip(feature_names, shap_values[0])):
            feature_impacts.append({
                'feature': self._get_readable_feature_name(feature),
                'feature_key': feature,
                'value': float(X.iloc[0, i]),
                'shap_value': float(shap_val),
                'impact': 'positive' if shap_val > 0 else 'negative',
                'abs_impact': abs(float(shap_val))
            })
        
        # Sort by absolute impact
        feature_impacts.sort(key=lambda x: x['abs_impact'], reverse=True)
        
        return {
            'base_value': float(base_value) if isinstance(base_value, np.ndarray) else float(base_value),
            'prediction_value': float(base_value + shap_values[0].sum()),
            'feature_impacts': feature_impacts,
            'top_positive_features': [f for f in feature_impacts if f['impact'] == 'positive'][:5],
            'top_negative_features': [f for f in feature_impacts if f['impact'] == 'negative'][:5]
        }
    
    def explain_salary_prediction(self, student_data: Dict) -> Dict:
        """
        Explain salary prediction for a single student
        
        Args:
            student_data: Dictionary with student information
            
        Returns:
            Dictionary with SHAP values and feature impacts
        """
        # Preprocess input
        X = self.preprocessor.preprocess_input(student_data)
        
        # Calculate SHAP values
        shap_values = self.salary_explainer.shap_values(X)
        
        # Get base value
        base_value = self.salary_explainer.expected_value
        
        # Create feature impact list
        feature_impacts = []
        feature_names = self.preprocessor.feature_columns
        
        for i, (feature, shap_val) in enumerate(zip(feature_names, shap_values[0])):
            feature_impacts.append({
                'feature': self._get_readable_feature_name(feature),
                'feature_key': feature,
                'value': float(X.iloc[0, i]),
                'shap_value': float(shap_val),
                'impact': 'positive' if shap_val > 0 else 'negative',
                'abs_impact': abs(float(shap_val))
            })
        
        # Sort by absolute impact
        feature_impacts.sort(key=lambda x: x['abs_impact'], reverse=True)
        
        return {
            'base_value': float(base_value),
            'prediction_value': float(base_value + shap_values[0].sum()),
            'feature_impacts': feature_impacts,
            'top_positive_features': [f for f in feature_impacts if f['impact'] == 'positive'][:5],
            'top_negative_features': [f for f in feature_impacts if f['impact'] == 'negative'][:5]
        }
    
    def get_global_feature_importance(self, model_type='placement') -> List[Dict]:
        """
        Get global feature importance across all predictions
        
        Args:
            model_type: 'placement' or 'salary'
            
        Returns:
            List of features with importance scores
        """
        explainer = self.placement_explainer if model_type == 'placement' else self.salary_explainer
        
        # Calculate SHAP values for background data
        shap_values = explainer.shap_values(self.background_data)
        
        # Handle binary classification
        if isinstance(shap_values, list):
            shap_values = shap_values[1]
        
        # Calculate mean absolute SHAP values
        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        
        # Create importance list
        feature_importance = []
        for i, (feature, importance) in enumerate(zip(self.preprocessor.feature_columns, mean_abs_shap)):
            feature_importance.append({
                'feature': self._get_readable_feature_name(feature),
                'feature_key': feature,
                'importance': float(importance),
                'rank': i + 1
            })
        
        # Sort by importance
        feature_importance.sort(key=lambda x: x['importance'], reverse=True)
        
        # Update ranks
        for i, item in enumerate(feature_importance):
            item['rank'] = i + 1
        
        return feature_importance
    
    def _get_readable_feature_name(self, feature_key: str) -> str:
        """Convert feature key to readable name"""
        name_mapping = {
            'gender': 'Gender',
            'ssc_p': 'SSC Percentage',
            'ssc_b': 'SSC Board',
            'hsc_p': 'HSC Percentage',
            'hsc_b': 'HSC Board',
            'hsc_s': 'HSC Stream',
            'degree_p': 'Degree Percentage',
            'degree_t': 'Degree Type',
            'workex': 'Work Experience',
            'etest_p': 'Employability Test',
            'specialisation': 'MBA Specialization',
            'mba_p': 'MBA Percentage',
            'avg_academic_score': 'Average Academic Score',
            'academic_consistency': 'Academic Consistency',
            'mba_performance': 'MBA Performance'
        }
        return name_mapping.get(feature_key, feature_key)


if __name__ == "__main__":
    # Test SHAP explainer
    print("\n" + "="*60)
    print("Testing SHAP Explainer")
    print("="*60)
    
    explainer = SHAPExplainer()
    
    # Sample student data
    sample_student = {
        'gender': 'M',
        'ssc_p': 67.0,
        'ssc_b': 'Others',
        'hsc_p': 91.0,
        'hsc_b': 'Others',
        'hsc_s': 'Commerce',
        'degree_p': 58.0,
        'degree_t': 'Sci&Tech',
        'workex': 'No',
        'etest_p': 55.0,
        'specialisation': 'Mkt&HR',
        'mba_p': 58.8
    }
    
    print("\n[1/3] Explaining placement prediction...")
    placement_explanation = explainer.explain_placement_prediction(sample_student)
    print(f"Base Value: {placement_explanation['base_value']:.4f}")
    print(f"Prediction Value: {placement_explanation['prediction_value']:.4f}")
    print("\nTop 3 Positive Features:")
    for feat in placement_explanation['top_positive_features'][:3]:
        print(f"  {feat['feature']}: {feat['shap_value']:+.4f}")
    
    print("\n[2/3] Explaining salary prediction...")
    salary_explanation = explainer.explain_salary_prediction(sample_student)
    print(f"Base Value: ₹{salary_explanation['base_value']:,.2f}")
    print(f"Prediction Value: ₹{salary_explanation['prediction_value']:,.2f}")
    print("\nTop 3 Positive Features:")
    for feat in salary_explanation['top_positive_features'][:3]:
        print(f"  {feat['feature']}: ₹{feat['shap_value']:+,.2f}")
    
    print("\n[3/3] Global feature importance (Placement)...")
    global_importance = explainer.get_global_feature_importance('placement')
    print("\nTop 5 Most Important Features:")
    for feat in global_importance[:5]:
        print(f"  {feat['rank']}. {feat['feature']}: {feat['importance']:.4f}")
    
    print("\n" + "="*60)
    print("✓ SHAP Explainer Test Completed")
    print("="*60)
