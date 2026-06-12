from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import date


VALID_PRODUCT_LINES = [
    "Classic Cars", "Vintage Cars", "Motorcycles",
    "Planes", "Ships", "Trains", "Trucks and Buses"
]

VALID_DEAL_SIZES = ["Small", "Medium", "Large"]


class PredictRequest(BaseModel):
    quantity: int = Field(..., ge=1, le=100, description="Units ordered")
    price_each: float = Field(..., gt=0.0, description="Price per unit in USD")
    msrp: float = Field(..., gt=0.0, description="Manufacturer suggested retail price")
    product_line: str = Field(..., description="Product category")
    deal_size: str = Field(..., description="Small, Medium, or Large")
    order_date: Optional[date] = Field(None, description="Order date - defaults to today")

    @field_validator("product_line")
    @classmethod
    def check_product_line(cls, v):
        if v not in VALID_PRODUCT_LINES:
            raise ValueError(f"product_line must be one of {VALID_PRODUCT_LINES}")
        return v

    @field_validator("deal_size")
    @classmethod
    def check_deal_size(cls, v):
        if v not in VALID_DEAL_SIZES:
            raise ValueError(f"deal_size must be one of {VALID_DEAL_SIZES}")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "quantity": 38,
                "price_each": 100.0,
                "msrp": 95.0,
                "product_line": "Classic Cars",
                "deal_size": "Medium",
                "order_date": None,
            }
        }
    }


class PredictResponse(BaseModel):
    predicted_sales: float
    confidence_band_low: float
    confidence_band_high: float
    model_note: str
    features_used: dict