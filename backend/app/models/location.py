from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base

class LocationDimension(Base):
    __tablename__ = "location_dimension"
    
    location_id = Column(Integer, primary_key=True, index=True)
    property_type = Column(String, nullable=True)
    town = Column(String, nullable=True)
    neighborhood = Column(String, nullable=True)
    
    # Define relationship to fact table
    facts = relationship("Fact", back_populates="location")
    
    def __repr__(self):
        neighborhood_str = f", {self.neighborhood}" if self.neighborhood else ""
        return f"Location(type={self.property_type}, {self.town}{neighborhood_str})" 