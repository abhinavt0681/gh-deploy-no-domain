from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base

class Fact(Base):
    __tablename__ = "fact_table"
    
    fact_id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("location_dimension.location_id"))
    year = Column(Integer, nullable=True)
    
    # Market metrics
    total_listings = Column(Integer, nullable=True)
    avg_days_on_market = Column(Integer, nullable=True)
    avg_days_to_offer = Column(Integer, nullable=True)
    average_sale_price = Column(Integer, nullable=True)
    average_list_price = Column(Integer, nullable=True)
    sp_lp_ratio = Column(Integer, nullable=True)
    average_orig_price = Column(Integer, nullable=True)
    sp_op_ratio = Column(Integer, nullable=True)
    lowest_price = Column(Float, nullable=True)
    highest_price = Column(Float, nullable=True)
    median_price = Column(Float, nullable=True)
    total_market_volume = Column(Float, nullable=True)
    sale_list_percentage = Column(Float, nullable=True)
    total_market_volume_millions = Column(Float, nullable=True)
    
    # Define relationship to location dimension
    location = relationship("LocationDimension", back_populates="facts")
    
    def __repr__(self):
        return f"Fact(location_id={self.location_id}, year={self.year})" 