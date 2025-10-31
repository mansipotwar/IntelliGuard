import os
import pickle

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
model_path = os.path.join(BASE_DIR, 'models', 'earthquake_model.pkl')

with open(model_path, 'rb') as f:
    earthquake_model = pickle.load(f)
