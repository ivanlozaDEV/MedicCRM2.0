"""
Migration: Add condition_id column to patient_conditions table
Date: 2025-11-13
Purpose: Add foreign key relationship to conditions catalog table
"""

from models import db
from models.patient_condition import PatientCondition
from models.condition import Condition
from sqlalchemy import text


def add_condition_id_column():
    """Add condition_id column to patient_conditions table"""
    
    print("🔄 Adding condition_id column to patient_conditions table...")
    
    try:
        # Check if column already exists
        result = db.session.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'patient_conditions' 
            AND column_name = 'condition_id'
        """))
        
        if result.fetchone():
            print("✅ Column condition_id already exists in patient_conditions table")
            return True
            
        # Add the condition_id column
        db.session.execute(text("""
            ALTER TABLE patient_conditions 
            ADD COLUMN condition_id INTEGER;
        """))
        
        # Add foreign key constraint
        db.session.execute(text("""
            ALTER TABLE patient_conditions 
            ADD CONSTRAINT fk_patient_conditions_condition_id 
            FOREIGN KEY (condition_id) REFERENCES conditions(id) ON DELETE SET NULL;
        """))
        
        # Add index for performance
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_patient_conditions_condition_id 
            ON patient_conditions(condition_id);
        """))
        
        db.session.commit()
        print("✅ Successfully added condition_id column with foreign key constraint and index")
        return True
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error adding condition_id column: {e}")
        return False


if __name__ == '__main__':
    from app import app
    
    with app.app_context():
        success = add_condition_id_column()
        if success:
            print("🎉 Migration completed successfully!")
        else:
            print("💀 Migration failed!")