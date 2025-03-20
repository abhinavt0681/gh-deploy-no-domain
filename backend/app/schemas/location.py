from typing import Optional
from pydantic import BaseModel

class LocationBase(BaseModel):
    property_type: Optional[str] = None
    town: Optional[str] = None
    neighborhood: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class LocationUpdate(LocationBase):
    pass

class LocationInDBBase(LocationBase):
    location_id: int

    class Config:
        orm_mode = True
        from_attributes = True

class Location(LocationInDBBase):
    pass

class LocationInDB(LocationInDBBase):
    pass 