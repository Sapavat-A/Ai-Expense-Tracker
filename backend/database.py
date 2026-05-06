"""
Database connection and management for AI Expense Tracker
Handles MongoDB connection using Motor (async driver)
"""

from motor.motor_asyncio import AsyncIOMotorClient
from motor.motor_asyncio import AsyncIOMotorDatabase
from config import settings
from typing import AsyncGenerator


class Database:
    """
    Database connection class for MongoDB
    """
    
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.database: AsyncIOMotorDatabase = None
    
    async def connect(self):
        """
        Establish connection to MongoDB
        """
        self.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000
        )
        self.database = self.client[settings.DATABASE_NAME]
        
        # Test connection
        await self.client.admin.command('ping')
        print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")
    
    async def disconnect(self):
        """
        Close MongoDB connection
        """
        if self.client:
            self.client.close()
            print("✅ Disconnected from MongoDB")
    
    def get_database(self) -> AsyncIOMotorDatabase:
        """
        Get database instance
        """
        if not self.database:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self.database


# Create global database instance
db = Database()


async def get_database() -> AsyncIOMotorDatabase:
    """
    Dependency function to get database instance
    """
    return db.get_database()


# Collection names
class Collections:
    USERS = "users"
    EXPENSES = "expenses"
    BUDGETS = "budgets"
    ANALYTICS = "analytics"
    REPORTS = "reports"


# Export for use in other modules
__all__ = ["Database", "db", "get_database", "Collections"]
