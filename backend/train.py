import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import json
import os
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")
log = logging.getLogger(__name__)


DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "sales_data_sample.csv")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")


def load_and_clean(path):
    data = pd.read_csv(path, encoding="ISO-8859-1")

    # print(data.columns.tolist())
    # print(data.shape)

    data = data[data["STATUS"] == "Shipped"].copy()

    data["ORDERDATE"] = pd.to_datetime(data["ORDERDATE"])
    data["month"] = data["ORDERDATE"].dt.month
    data["quarter"] = data["ORDERDATE"].dt.quarter

    if data["MSRP"].isnull().any():
        median_msrp = data["MSRP"].median()
        data["MSRP"] = data["MSRP"].fillna(median_msrp)
        log.info(f"Filled {data['MSRP'].isnull().sum()} missing MSRP values with median={median_msrp}")

    data["DEALSIZE"] = data["DEALSIZE"].fillna("Medium")

    data = data.dropna(subset=["SALES"])

    log.info(f"Dataset ready: {len(data)} shipped orders across {data['PRODUCTLINE'].nunique()} product lines")
    return data


def build_pipeline(numeric_cols, cat_cols):
    num_pipe = Pipeline([("scaler", StandardScaler())])

    cat_pipe = Pipeline([
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer([
        ("num", num_pipe, numeric_cols),
        ("cat", cat_pipe, cat_cols),
    ])

    model = GradientBoostingRegressor(
        n_estimators=300,
        learning_rate=0.08,
        max_depth=5,
        subsample=0.85,
        random_state=42
    )

    return Pipeline([("prep", preprocessor), ("model", model)])


def evaluate(pipeline, X_train, X_test, y_train, y_test):
    train_preds = pipeline.predict(X_train)
    test_preds = pipeline.predict(X_test)

    train_r2 = r2_score(y_train, train_preds)
    test_r2 = r2_score(y_test, test_preds)
    test_mae = mean_absolute_error(y_test, test_preds)

    print(f"\n  Train R²  : {train_r2:.4f}")
    print(f"  Test  R²  : {test_r2:.4f}")
    print(f"  Test  MAE : ${test_mae:,.2f}\n")

    return test_r2, test_mae


def main():
    log.info("Loading data...")
    data = load_and_clean(DATA_PATH)

    numeric_cols = ["QUANTITYORDERED", "PRICEEACH", "MSRP", "month", "quarter"]
    cat_cols = ["PRODUCTLINE", "DEALSIZE"]

    X = data[numeric_cols + cat_cols]
    y = data["SALES"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    log.info("Building pipeline and training...")
    pipe = build_pipeline(numeric_cols, cat_cols)
    pipe.fit(X_train, y_train)

    log.info("Evaluating...")
    test_r2, test_mae = evaluate(pipe, X_train, X_test, y_train, y_test)

    cv_scores = cross_val_score(pipe, X, y, cv=5, scoring="r2", n_jobs=-1)
    print(f"  5-fold CV R²: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}\n")

    os.makedirs(MODELS_DIR, exist_ok=True)

    joblib.dump(pipe, os.path.join(MODELS_DIR, "sales_model.pkl"))
    log.info("Model saved → backend/models/sales_model.pkl")

    meta = {
        "numeric_features": numeric_cols,
        "categorical_features": cat_cols,
        "target": "SALES",
        "product_lines": sorted(data["PRODUCTLINE"].dropna().unique().tolist()),
        "deal_sizes": ["Small", "Medium", "Large"],
        "test_r2": round(test_r2, 4),
        "test_mae": round(test_mae, 2),
        "cv_r2_mean": round(float(cv_scores.mean()), 4),
    }

    with open(os.path.join(MODELS_DIR, "model_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)

    log.info("Metadata saved → backend/models/model_meta.json")
    log.info("All done! Run `uvicorn app:app --reload` to start the API.")


if __name__ == "__main__":
    main()