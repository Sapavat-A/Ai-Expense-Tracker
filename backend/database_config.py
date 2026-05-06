import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    # Fallback to SQLite for development
    "sqlite:///./expenses.db"
)

# Database engine configuration
engine_kwargs = {
    "echo": os.getenv("DB_ECHO", "false").lower() == "true",
    "pool_pre_ping": True,
    "pool_recycle": 300,
}

# Create engine based on database type
if DATABASE_URL.startswith("sqlite"):
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=engine_kwargs["echo"]
    )
    logger.info("Using SQLite database")
elif DATABASE_URL.startswith("postgresql"):
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        **engine_kwargs
    )
    logger.info("Using PostgreSQL database")
else:
    # Default to PostgreSQL for unknown database types
    engine = create_engine(
        DATABASE_URL,
        **engine_kwargs
    )
    logger.warning(f"Unknown database type in URL: {DATABASE_URL}, defaulting to PostgreSQL configuration")

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()

def get_db():
    """
    Dependency to get database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_database():
    """
    Initialize database tables.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")
        raise

def get_database_info():
    """
    Get information about current database configuration.
    """
    db_type = "SQLite" if DATABASE_URL.startswith("sqlite") else "PostgreSQL"
    
    if DATABASE_URL.startswith("postgresql"):
        # Extract connection info from PostgreSQL URL
        try:
            import re
            match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', DATABASE_URL)
            if match:
                return {
                    "type": db_type,
                    "host": match.group(3),
                    "port": match.group(4),
                    "database": match.group(5),
                    "user": match.group(1),
                    "url": DATABASE_URL
                }
        except:
            pass
    
    return {
        "type": db_type,
        "url": DATABASE_URL
    }

def test_database_connection():
    """
    Test database connection.
    """
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1").scalar()
            return True, "Connection successful"
    except Exception as e:
        return False, f"Connection failed: {str(e)}"
