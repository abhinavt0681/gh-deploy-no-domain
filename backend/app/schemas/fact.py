from typing import Optional
from pydantic import BaseModel

class FactBase(BaseModel):
    location_id: int
    year: Optional[int] = None
    total_listings: Optional[int] = None
    avg_days_on_market: Optional[int] = None
    avg_days_to_offer: Optional[int] = None
    average_sale_price: Optional[int] = None
    average_list_price: Optional[int] = None
    sp_lp_ratio: Optional[int] = None
    average_orig_price: Optional[int] = None
    sp_op_ratio: Optional[int] = None
    lowest_price: Optional[float] = None
    highest_price: Optional[float] = None
    median_price: Optional[float] = None
    total_market_volume: Optional[float] = None
    sale_list_percentage: Optional[float] = None
    total_market_volume_millions: Optional[float] = None

class FactCreate(FactBase):
    pass

class FactUpdate(FactBase):
    location_id: Optional[int] = None

class FactInDBBase(FactBase):
    fact_id: int

    class Config:
        orm_mode = True
        from_attributes = True

class Fact(FactInDBBase):
    pass

class FactInDB(FactInDBBase):
    pass 