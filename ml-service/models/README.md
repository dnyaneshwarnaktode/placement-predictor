# Trained Models Directory

This directory will contain the trained machine learning models after running the training script.

## Generated Files

After running `python src/train.py`, the following files will be created:

1. **placement_model.pkl** - Logistic Regression model for placement classification
2. **salary_model.pkl** - Linear Regression model for salary prediction
3. **preprocessor.pkl** - Data preprocessor with fitted encoders

## Usage

These models are loaded by the FastAPI service (`src/main.py`) to make predictions.

## Note

Model files are not included in the repository due to size.
You must train the models locally by running the training script.
