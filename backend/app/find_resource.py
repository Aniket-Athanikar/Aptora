import sys
import traceback
from app.db.session import SessionLocal
from app.models.resource import ResourceDb
from app.processing.document_indexer import DocumentIndexer

def main():
    db = SessionLocal()
    try:
        resource = db.query(ResourceDb).filter(ResourceDb.storage_path.like("%dde10a02-cf97-4799-aae5-640300683844%")).first()
        if not resource:
            # Let's search by stored_filename as well
            resource = db.query(ResourceDb).filter(ResourceDb.stored_filename == "dde10a02-cf97-4799-aae5-640300683844.pdf").first()
            
        if not resource:
            print("Resource not found in database.")
            return
            
        print(f"Found Resource: ID: {resource.id} | Title: {resource.title} | Status: {resource.status} | File: {resource.original_filename} | Path: {resource.storage_path}")
        if resource.status != "COMPLETED":
            print("Running DocumentIndexer.index_document...")
            result = DocumentIndexer.index_document(db, resource)
            print("Indexing completed successfully:", result)
        else:
            print("Resource is already completed.")
            
    except Exception as e:
        print("Error during resource search or indexing:")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
