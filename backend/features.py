"""
features.py
-----------
All feature-engineering logic lives here so the training script and the
API both call the exact same code. Learned this the hard way - had a subtle
mismatch once that caused the model to silently get wrong inputs.
"""

from datetime import datetime, date


def build_input_row(quantity: int, price: float, msrp: float,
                    product_line: str, deal_size: str,
                    order_date=None) -> dict:
    """
    Turns raw user inputs into the feature dict the sklearn pipeline expects.
    order_date can be a datetime, a date, or None (defaults to today).
    """
    if order_date is None:
        order_date = datetime.today()
    elif isinstance(order_date, date) and not isinstance(order_date, datetime):
        order_date = datetime(order_date.year, order_date.month, order_date.day)

    month = order_date.month
    quarter = (month - 1) // 3 + 1

    row = {
        "QUANTITYORDERED": quantity,
        "PRICEEACH": price,
        "MSRP": msrp,
        "month": month,
        "quarter": quarter,
        "PRODUCTLINE": product_line,
        "DEALSIZE": deal_size,
    }

    return row


def infer_deal_size(quantity: int, price: float) -> str:
    """
    Rough heuristic to auto-suggest a deal size when the user hasn't picked one.
    These thresholds came from eyeballing the EDA - not perfect but decent defaults.
    """
    total = quantity * price

    if total < 3000:
        return "Small"
    elif total < 7000:
        return "Medium"
    else:
        return "Large"