"""
Model Training Module
Trains classification and regression models for placement prediction.
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import os
from preprocessing import PlacementDataPreprocessor

class PlacementModelTrainer:
    """Train and evaluate placement prediction models"""
    
    def __init__(self):
        self.placement_model = None
        self.salary_model = None
        self.preprocessor = PlacementDataPreprocessor()
        
    def train_placement_model(self, X_train, y_train):
        """Train logistic regression for placement classification"""
        print("\n" + "="*60)
        print("Training Placement Classification Model")
        print("="*60)
        
        # Initialize and train model
        self.placement_model = LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight='balanced'
        )
        
        self.placement_model.fit(X_train, y_train)
        print("✓ Model training completed")
        
        return self.placement_model
    
    def train_salary_model(self, X_train, y_train):
        """Train linear regression for salary prediction"""
        print("\n" + "="*60)
        print("Training Salary Regression Model")
        print("="*60)
        
        # Initialize and train model
        self.salary_model = LinearRegression()
        self.salary_model.fit(X_train, y_train)
        
        print("✓ Model training completed")
        
        return self.salary_model
    
    def evaluate_placement_model(self, X_test, y_test):
        """Evaluate placement classification model"""
        print("\n" + "-"*60)
        print("Placement Model Evaluation")
        print("-"*60)
        
        # Make predictions
        y_pred = self.placement_model.predict(X_test)
        y_pred_proba = self.placement_model.predict_proba(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"\nAccuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=['Not Placed', 'Placed']))
        print("\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.preprocessor.feature_columns,
            'coefficient': self.placement_model.coef_[0]
        }).sort_values('coefficient', ascending=False)
        
        print("\nTop 5 Most Important Features (Positive Impact):")
        print(feature_importance.head())
        print("\nTop 5 Least Important Features (Negative Impact):")
        print(feature_importance.tail())
        
        return {
            'accuracy': accuracy,
            'feature_importance': feature_importance
        }
    
    def evaluate_salary_model(self, X_test, y_test):
        """Evaluate salary regression model"""
        print("\n" + "-"*60)
        print("Salary Model Evaluation")
        print("-"*60)
        
        # Make predictions
        y_pred = self.salary_model.predict(X_test)
        
        # Calculate metrics
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"\nR² Score: {r2:.4f}")
        print(f"RMSE: ₹{rmse:,.2f}")
        print(f"MAE: ₹{mae:,.2f}")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.preprocessor.feature_columns,
            'coefficient': self.salary_model.coef_
        }).sort_values('coefficient', ascending=False)
        
        print("\nTop 5 Most Important Features for Salary:")
        print(feature_importance.head())
        
        return {
            'rmse': rmse,
            'mae': mae,
            'r2': r2,
            'feature_importance': feature_importance
        }
    
    def save_models(self, models_dir='../models'):
        """Save trained models and preprocessor"""
        os.makedirs(models_dir, exist_ok=True)
        
        # Save models
        joblib.dump(self.placement_model, os.path.join(models_dir, 'placement_model.pkl'))
        joblib.dump(self.salary_model, os.path.join(models_dir, 'salary_model.pkl'))
        joblib.dump(self.preprocessor, os.path.join(models_dir, 'preprocessor.pkl'))
        
        print(f"\n✓ Models saved to {models_dir}/")
        print("  - placement_model.pkl")
        print("  - salary_model.pkl")
        print("  - preprocessor.pkl")

def main():
    """Main training pipeline"""
    print("\n" + "="*60)
    print("COLLEGE PLACEMENT PREDICTION - MODEL TRAINING")
    print("="*60)
    
    # Initialize trainer
    trainer = PlacementModelTrainer()
    
    # Preprocess data
    print("\n[1/5] Loading and preprocessing data...")
    df = trainer.preprocessor.preprocess_pipeline("../data/Placement_Data_Full_Class.csv")
    
    # Prepare placement classification data
    print("\n[2/5] Preparing placement classification data...")
    X_placement, y_placement = trainer.preprocessor.prepare_features(df, 'status')
    
    # Convert status to binary (Placed=1, Not Placed=0)
    y_placement_binary = (y_placement == 'Placed').astype(int)
    
    X_train_p, X_test_p, y_train_p, y_test_p = trainer.preprocessor.split_data(
        X_placement, y_placement_binary
    )
    
    # Train placement model
    print("\n[3/5] Training placement model...")
    trainer.train_placement_model(X_train_p, y_train_p)
    placement_metrics = trainer.evaluate_placement_model(X_test_p, y_test_p)
    
    # Prepare salary regression data (only for placed students)
    print("\n[4/5] Preparing salary regression data...")
    df_placed = df[df['status'] == 'Placed'].copy()
    X_salary, y_salary = trainer.preprocessor.prepare_features(df_placed, 'salary')
    
    X_train_s, X_test_s, y_train_s, y_test_s = trainer.preprocessor.split_data(
        X_salary, y_salary, test_size=0.2, random_state=42
    )
    
    # Train salary model
    trainer.train_salary_model(X_train_s, y_train_s)
    salary_metrics = trainer.evaluate_salary_model(X_test_s, y_test_s)
    
    # Save models
    print("\n[5/5] Saving models...")
    trainer.save_models()
    
    # Summary
    print("\n" + "="*60)
    print("TRAINING SUMMARY")
    print("="*60)
    print(f"✓ Placement Model Accuracy: {placement_metrics['accuracy']*100:.2f}%")
    print(f"✓ Salary Model R² Score: {salary_metrics['r2']:.4f}")
    print(f"✓ Salary Model RMSE: ₹{salary_metrics['rmse']:,.2f}")
    print("\n✓ All models trained and saved successfully!")
    print("="*60)

if __name__ == "__main__":
    main()
