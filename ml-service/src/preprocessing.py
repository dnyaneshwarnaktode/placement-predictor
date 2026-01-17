"""
Data Preprocessing Module
Handles data cleaning, encoding, and feature engineering for the placement prediction models.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

class PlacementDataPreprocessor:
    """Preprocessor for campus placement dataset"""
    
    def __init__(self):
        self.label_encoders = {}
        self.feature_columns = []
        
    def load_data(self, filepath):
        """Load the placement dataset"""
        df = pd.read_csv(filepath)
        print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
        return df
    
    def clean_data(self, df):
        """Clean and handle missing values"""
        # Display missing values
        print("\nMissing values:")
        print(df.isnull().sum())
        
        # Fill missing salary values (for students not placed)
        df['salary'] = df['salary'].fillna(0)
        
        # Remove any rows with other missing values
        df = df.dropna()
        
        print(f"\nDataset after cleaning: {df.shape[0]} rows")
        return df
    
    def encode_categorical(self, df, fit=True):
        """Encode categorical variables"""
        categorical_cols = ['gender', 'ssc_b', 'hsc_b', 'hsc_s', 'degree_t', 'workex', 'specialisation']
        
        df_encoded = df.copy()
        
        for col in categorical_cols:
            if col in df.columns:
                if fit:
                    # Create and fit encoder
                    le = LabelEncoder()
                    df_encoded[col] = le.fit_transform(df[col])
                    self.label_encoders[col] = le
                else:
                    # Use existing encoder
                    if col in self.label_encoders:
                        df_encoded[col] = self.label_encoders[col].transform(df[col])
        
        return df_encoded
    
    def engineer_features(self, df):
        """Create additional features"""
        df_featured = df.copy()
        
        # Average academic score
        df_featured['avg_academic_score'] = (
            df_featured['ssc_p'] + 
            df_featured['hsc_p'] + 
            df_featured['degree_p']
        ) / 3
        
        # Academic consistency (lower std = more consistent)
        df_featured['academic_consistency'] = df_featured[['ssc_p', 'hsc_p', 'degree_p']].std(axis=1)
        
        # MBA performance indicator
        df_featured['mba_performance'] = df_featured['mba_p']
        
        return df_featured
    
    def prepare_features(self, df, target_col=None):
        """Prepare feature matrix and target variable"""
        # Define feature columns
        self.feature_columns = [
            'gender', 'ssc_p', 'ssc_b', 'hsc_p', 'hsc_b', 'hsc_s',
            'degree_p', 'degree_t', 'workex', 'etest_p', 'specialisation', 'mba_p',
            'avg_academic_score', 'academic_consistency', 'mba_performance'
        ]
        
        X = df[self.feature_columns]
        
        if target_col:
            y = df[target_col]
            return X, y
        
        return X
    
    def split_data(self, X, y, test_size=0.2, random_state=42):
        """Split data into training and testing sets"""
        return train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y if len(np.unique(y)) < 10 else None)
    
    def preprocess_pipeline(self, filepath):
        """Complete preprocessing pipeline"""
        # Load data
        df = self.load_data(filepath)
        
        # Clean data
        df = self.clean_data(df)
        
        # Encode categorical variables
        df = self.encode_categorical(df, fit=True)
        
        # Engineer features
        df = self.engineer_features(df)
        
        return df
    
    def preprocess_input(self, input_data):
        """Preprocess single input for prediction"""
        # Convert to DataFrame
        df = pd.DataFrame([input_data])
        
        # Encode categorical variables (using fitted encoders)
        df = self.encode_categorical(df, fit=False)
        
        # Engineer features
        df = self.engineer_features(df)
        
        # Select feature columns
        X = df[self.feature_columns]
        
        return X

if __name__ == "__main__":
    # Test preprocessing
    preprocessor = PlacementDataPreprocessor()
    df = preprocessor.preprocess_pipeline("../data/Placement_Data_Full_Class.csv")
    print("\nPreprocessed data shape:", df.shape)
    print("\nFirst few rows:")
    print(df.head())
    print("\nData types:")
    print(df.dtypes)
