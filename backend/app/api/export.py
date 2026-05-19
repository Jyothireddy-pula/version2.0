import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session

from app.api.opportunities import serialize
from app.core.database import get_db
from app.models.opportunity import Opportunity


router = APIRouter(prefix="/export", tags=["export"])


@router.get("/json")
def export_json(db: Session = Depends(get_db)):
    records = db.query(Opportunity).all()
    return JSONResponse([serialize(r) for r in records])


@router.get("/csv")
def export_csv(db: Session = Depends(get_db)):
    records = db.query(Opportunity).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Title", "Type", "Organizer", "Location", "Deadline", "Source", "Application Link"])
    for r in records:
        writer.writerow([r.title, r.type, r.organizer, r.location, r.deadline, r.source, r.application_link])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=opportunities.csv"})