from typing import Optional, List
from pydantic import BaseModel

class UserLoginRequest(BaseModel):
    identifier: str
    name: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str

class DLDetailsSchema(BaseModel):
    dlNumber: str
    holderName: str
    issueDate: str
    validUntil: str
    vehicleClasses: List[str]
    issuingRTO: str
    status: str
    bloodGroup: Optional[str] = None

class UserProfileSchema(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    avatar: Optional[str] = None
    dlNumber: Optional[str] = None
    dlVerified: bool = True
    dlDetails: Optional[DLDetailsSchema] = None
    isAuthenticated: bool = True
    joinedDate: str = "Aug 2022"
    historicalSafeScore: float = 88.0
    totalKms: float = 1840.0
    totalRides: int = 42
    autoDetectRidesEnabled: bool = True
    autoDetectThresholdSpeed: int = 15
    driverRole: str = "Motorcycle Cruiser • Regular Commuter"
    badgeLabel: str = "TOP 10% SAFE RIDER"

class VehicleSchema(BaseModel):
    type: str = "motorcycle"
    model: str = "Royal Enfield Hunter 350"
    registrationNumber: str = "DL 01 AB 7890"
    fuelType: str = "Petrol"

class EmergencyContactSchema(BaseModel):
    name: str = "Priya Sharma"
    phone: str = "+91 98765 43210"
    relationship: str = "Spouse"

class TripRecordSchema(BaseModel):
    id: str
    startTime: str
    endTime: str
    distanceKm: float
    durationSec: int
    safetyScore: float
    pointsEarned: int
    xpEarned: int
    harshBrakingCount: int = 0
    harshCorneringCount: int = 0
    speedingDurationSec: int = 0
    tailgatingDurationSec: int = 0
    phoneDistractionSec: int = 0
    startLocation: Optional[str] = "Connaught Place, New Delhi"
    endLocation: Optional[str] = "Cyber City, Gurugram"

class PointTransactionSchema(BaseModel):
    id: str
    timestamp: str
    description: str
    pointsDelta: int
    category: str

class UserSessionPayloadSchema(BaseModel):
    userProfile: UserProfileSchema
    vehicle: VehicleSchema
    emergencyContact: EmergencyContactSchema
    points: int
    xp: int
    trips: List[TripRecordSchema]
    transactions: List[PointTransactionSchema]

class LoginResponse(BaseModel):
    session: UserSessionPayloadSchema
    token: str

class TelemetrySampleItem(BaseModel):
    lat: float
    lng: float
    speed: float
    speedLimit: float
    brakingG: float
    corneringG: float
    kineticBufferSec: float
    phoneDistraction: bool = False
    timestamp: float

class TelemetryBatchRequest(BaseModel):
    tripId: Optional[str] = None
    driverId: str
    timestamp: float
    samples: List[TelemetrySampleItem]

class EmergencyDispatchPayload(BaseModel):
    event: dict
    contact: EmergencyContactSchema
    coords: Optional[dict] = None
