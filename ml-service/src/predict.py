"""
Prediction Module
Handles loading models and making predictions on new data.
"""

import joblib
import numpy as np
import pandas as pd
import os

class PlacementPredictor:
    """Make predictions using trained models"""
    
    def __init__(self, models_dir='../models', enable_shap=False):
        """
        Load trained models and preprocessor
        
        Args:
            models_dir: Directory containing trained models
            enable_shap: Whether to enable SHAP explainability (default: False)
        """
        self.models_dir = models_dir
        self.placement_model = None
        self.salary_model = None
        self.preprocessor = None
        self.enable_shap = enable_shap
        self.shap_explainer = None
        
        self.load_models()
        
        if enable_shap:
            self.initialize_shap()
    
    def initialize_shap(self):
        """Initialize SHAP explainer"""
        try:
            from explainer import SHAPExplainer
            self.shap_explainer = SHAPExplainer(self.models_dir)
            print("✓ SHAP explainer initialized")
        except Exception as e:
            print(f"Warning: Could not initialize SHAP explainer: {e}")
            self.enable_shap = False
    
    def load_models(self):
        """Load all required models"""
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
            print("✓ Models loaded successfully")
        except Exception as e:
            print(f"Error loading models: {e}")
            raise
    
    def predict_placement(self, student_data):
        """
        Predict placement probability for a student
        
        Args:
            student_data: dict with student information
            
        Returns:
            dict with placement prediction and probability
        """
        # Preprocess input
        X = self.preprocessor.preprocess_input(student_data)
        
        # Make prediction
        prediction = self.placement_model.predict(X)[0]
        probability = self.placement_model.predict_proba(X)[0]
        
        return {
            'placed': bool(prediction),
            'probability': float(probability[1]),  # Probability of being placed
            'confidence': float(max(probability))
        }
    
    def predict_salary(self, student_data):
        """
        Predict expected salary for a student
        
        Args:
            student_data: dict with student information
            
        Returns:
            dict with salary prediction
        """
        # Preprocess input
        X = self.preprocessor.preprocess_input(student_data)
        
        # Make prediction
        salary = self.salary_model.predict(X)[0]
        
        # Ensure salary is positive and above minimum threshold
        # Minimum salary set to 200,000 (2 LPA) which is reasonable for fresh graduates
        MIN_SALARY = 200000
        salary = max(MIN_SALARY, salary)
        
        # Calculate salary range (±10%)
        salary_min = salary * 0.9
        salary_max = salary * 1.1
        
        return {
            'expected_salary': float(salary),
            'salary_range': {
                'min': float(salary_min),
                'max': float(salary_max)
            }
        }
    
    def analyze_skill_gaps(self, student_data, placement_result):
        """
        Analyze skill gaps and provide recommendations
        
        Args:
            student_data: dict with student information
            placement_result: dict with placement prediction
            
        Returns:
            dict with skill gap analysis
        """
        recommendations = []
        skill_gaps = []
        
        # Academic performance analysis
        avg_score = (
            student_data['ssc_p'] + 
            student_data['hsc_p'] + 
            student_data['degree_p']
        ) / 3
        
        if avg_score < 70:
            skill_gaps.append({
                'area': 'Academic Performance',
                'current': f"{avg_score:.1f}%",
                'target': '70%+',
                'priority': 'high'
            })
            recommendations.append("Focus on improving academic scores through consistent study habits")
        
        # Work experience
        if student_data['workex'] == 'No':
            skill_gaps.append({
                'area': 'Work Experience',
                'current': 'None',
                'target': 'Internship/Job',
                'priority': 'high'
            })
            recommendations.append("Gain practical work experience through internships or part-time jobs")
        
        # MBA performance
        if student_data['mba_p'] < 60:
            skill_gaps.append({
                'area': 'MBA Performance',
                'current': f"{student_data['mba_p']:.1f}%",
                'target': '60%+',
                'priority': 'medium'
            })
            recommendations.append("Improve MBA scores through focused preparation and practice")
        
        # Employability test
        if student_data['etest_p'] < 70:
            skill_gaps.append({
                'area': 'Employability Test',
                'current': f"{student_data['etest_p']:.1f}%",
                'target': '70%+',
                'priority': 'medium'
            })
            recommendations.append("Enhance employability skills through aptitude test practice")
        
        # Overall assessment
        if placement_result['probability'] < 0.5:
            recommendations.append("Consider additional certifications in trending technologies")
            recommendations.append("Build a strong portfolio with real-world projects")
            recommendations.append("Participate in hackathons and coding competitions")
        
        return {
            'skill_gaps': skill_gaps,
            'recommendations': recommendations,
            'overall_score': avg_score,
            'improvement_potential': 'high' if len(skill_gaps) > 2 else 'medium' if len(skill_gaps) > 0 else 'low'
        }
    
    def predict_complete(self, student_data):
        """
        Complete prediction pipeline
        
        Args:
            student_data: dict with student information
            
        Returns:
            dict with all predictions and analysis
        """
        # Predict placement
        placement_result = self.predict_placement(student_data)
        
        # Predict salary (only if likely to be placed)
        salary_result = None
        if placement_result['probability'] > 0.3:
            salary_result = self.predict_salary(student_data)
        
        # Analyze skill gaps
        skill_analysis = self.analyze_skill_gaps(student_data, placement_result)
        
        # Add SHAP explanations if enabled
        shap_explanations = None
        if self.enable_shap and self.shap_explainer:
            try:
                shap_explanations = {
                    'placement': self.shap_explainer.explain_placement_prediction(student_data),
                    'salary': self.shap_explainer.explain_salary_prediction(student_data) if salary_result else None
                }
            except Exception as e:
                print(f"Warning: SHAP explanation failed: {e}")
        
        result = {
            'placement': placement_result,
            'salary': salary_result,
            'skill_analysis': skill_analysis
        }
        
        if shap_explanations:
            result['shap_explanations'] = shap_explanations
        
        return result

if __name__ == "__main__":
    # Test prediction
    predictor = PlacementPredictor()
    
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
    
    print("\nTesting prediction for sample student:")
    print("-" * 60)
    result = predictor.predict_complete(sample_student)
    
    print(f"\nPlacement Prediction:")
    print(f"  Placed: {result['placement']['placed']}")
    print(f"  Probability: {result['placement']['probability']*100:.2f}%")
    
    if result['salary']:
        print(f"\nSalary Prediction:")
        print(f"  Expected: ₹{result['salary']['expected_salary']:,.2f}")
        print(f"  Range: ₹{result['salary']['salary_range']['min']:,.2f} - ₹{result['salary']['salary_range']['max']:,.2f}")
    
    print(f"\nSkill Analysis:")
    print(f"  Skill Gaps: {len(result['skill_analysis']['skill_gaps'])}")
    print(f"  Recommendations: {len(result['skill_analysis']['recommendations'])}")
