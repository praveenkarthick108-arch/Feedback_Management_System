import io
from datetime import datetime, timezone
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import delete, insert
from models import ETLRun, AnalyticsFeedback, ProgramAnalytics


REQUIRED_COLUMNS = {"participant_name", "program_name", "rating"}
SUPPORTED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


class ETLExtractError(Exception):
    pass


class ETLPipeline:
    def __init__(self, db: Session):
        self.db = db

    def run(self, file_bytes: bytes, filename: str) -> dict:
        run = self._create_run(filename)
        try:
            raw_df = self._extract(file_bytes, filename)
            clean_df, counts = self._transform(raw_df)
            loaded = self._load(clean_df, run.run_id)
            self._refresh_program_analytics(run.run_id)
            self._finalize(run, "success", counts=counts, loaded=loaded)
            return {
                "success": True,
                "run_id": run.run_id,
                "total_rows": counts["total_rows"],
                "valid_rows": counts["valid_rows"],
                "duplicate_rows": counts["duplicate_rows"],
                "invalid_rows": counts["invalid_rows"],
                "loaded_rows": loaded,
            }
        except ETLExtractError as e:
            self._finalize(run, "failed", error=str(e))
            return {"success": False, "run_id": run.run_id, "error": str(e)}
        except Exception as e:
            self._finalize(run, "failed", error=f"Unexpected error: {str(e)}")
            return {"success": False, "run_id": run.run_id, "error": f"Unexpected error: {str(e)}"}

    # ── Extract ────────────────────────────────────────────────────────────────

    def _extract(self, file_bytes: bytes, filename: str) -> pd.DataFrame:
        ext = self._get_extension(filename)
        if ext not in SUPPORTED_EXTENSIONS:
            raise ETLExtractError(f"Unsupported file type: {ext}. Use .csv or .xlsx")

        try:
            if ext == ".csv":
                df = pd.read_csv(io.BytesIO(file_bytes), dtype=str, keep_default_na=False)
            else:
                df = pd.read_excel(io.BytesIO(file_bytes), dtype=str, keep_default_na=False, engine="openpyxl")
        except Exception as e:
            raise ETLExtractError(f"Failed to parse file: {str(e)}")

        df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_").str.replace(r"[^a-z0-9_]", "", regex=True)

        missing = REQUIRED_COLUMNS - set(df.columns)
        if missing:
            raise ETLExtractError(f"Missing required columns: {', '.join(sorted(missing))}")

        if "comments" not in df.columns:
            df["comments"] = ""
        if "submitted_at" not in df.columns:
            df["submitted_at"] = ""

        return df

    # ── Transform ──────────────────────────────────────────────────────────────

    def _transform(self, df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
        total_rows = len(df)
        now = datetime.now(timezone.utc)

        # Strip whitespace from text fields
        for col in ["participant_name", "program_name", "comments"]:
            df[col] = df[col].astype(str).str.strip()

        # Mark rows with empty name or program as invalid
        invalid_mask = (df["participant_name"] == "") | (df["participant_name"].str.lower() == "nan") | \
                       (df["program_name"] == "") | (df["program_name"].str.lower() == "nan")

        # Coerce rating to numeric; out-of-range or non-numeric → invalid
        df["rating_numeric"] = pd.to_numeric(df["rating"], errors="coerce")
        df["rating_numeric"] = df["rating_numeric"].round().astype("Int64")
        invalid_rating = df["rating_numeric"].isna() | (df["rating_numeric"] < 1) | (df["rating_numeric"] > 5)
        invalid_mask = invalid_mask | invalid_rating

        # Remove all invalid rows
        invalid_count = int(invalid_mask.sum())
        df = df[~invalid_mask].copy()
        df["rating"] = df["rating_numeric"].astype(int)

        # Deduplicate: key = (name_lower, program_lower, rating, date_only)
        df["_name_key"] = df["participant_name"].str.lower()
        df["_prog_key"] = df["program_name"].str.lower()
        df["_date_key"] = df["submitted_at"].astype(str).str[:10]
        dup_mask = df.duplicated(subset=["_name_key", "_prog_key", "rating", "_date_key"], keep="first")
        duplicate_count = int(dup_mask.sum())
        df = df[~dup_mask].copy()

        # Normalize text case
        df["participant_name"] = df["participant_name"].str.title()
        df["program_name"] = df["program_name"].str.title()

        # Parse submitted_at; fill failures with now
        df["submitted_at"] = pd.to_datetime(df["submitted_at"], errors="coerce", format="mixed", dayfirst=False)
        df["submitted_at"] = df["submitted_at"].fillna(pd.Timestamp(now))
        # Normalize to UTC — handle both tz-naive and tz-aware entries
        def _to_utc(ts):
            if pd.isna(ts):
                return pd.Timestamp(now)
            if ts.tzinfo is None:
                return ts.tz_localize("UTC")
            return ts.tz_convert("UTC")
        df["submitted_at"] = df["submitted_at"].apply(_to_utc)

        # Derive month_year for trend grouping
        df["month_year"] = df["submitted_at"].dt.strftime("%Y-%m")

        # Clean up helper columns
        df = df.drop(columns=["_name_key", "_prog_key", "_date_key", "rating_numeric"], errors="ignore")

        # Normalize comments
        df["comments"] = df["comments"].replace({"nan": None, "": None}).where(df["comments"].notna(), None)

        valid_count = len(df)
        counts = {
            "total_rows": total_rows,
            "valid_rows": valid_count,
            "duplicate_rows": duplicate_count,
            "invalid_rows": invalid_count,
        }
        return df, counts

    # ── Load ───────────────────────────────────────────────────────────────────

    def _load(self, df: pd.DataFrame, run_id: int) -> int:
        # Delete any previous records for this run (idempotent re-run)
        self.db.execute(delete(AnalyticsFeedback).where(AnalyticsFeedback.run_id == run_id))
        self.db.commit()

        records = []
        for _, row in df.iterrows():
            submitted = row["submitted_at"]
            if hasattr(submitted, "to_pydatetime"):
                submitted = submitted.to_pydatetime()
            records.append({
                "run_id": run_id,
                "participant_name": str(row["participant_name"]),
                "program_name": str(row["program_name"]),
                "rating": int(row["rating"]),
                "comments": row["comments"] if pd.notna(row["comments"]) and row["comments"] else None,
                "submitted_at": submitted,
                "month_year": str(row["month_year"]),
            })

        if records:
            self.db.execute(insert(AnalyticsFeedback), records)
            self.db.commit()

        return len(records)

    # ── Program analytics ─────────────────────────────────────────────────────

    def _refresh_program_analytics(self, run_id: int):
        rows = self.db.query(AnalyticsFeedback).filter(AnalyticsFeedback.run_id == run_id).all()
        if not rows:
            return

        data = [{"program_name": r.program_name, "rating": r.rating} for r in rows]
        df = pd.DataFrame(data)

        grouped = df.groupby("program_name")
        agg = grouped["rating"].agg(["count", "mean"]).reset_index()
        agg.columns = ["program_name", "total_responses", "avg_rating"]

        # Delete old program analytics for this run
        self.db.execute(delete(ProgramAnalytics).where(ProgramAnalytics.run_id == run_id))
        self.db.commit()

        for _, row in agg.iterrows():
            prog_df = df[df["program_name"] == row["program_name"]]
            rating_counts = prog_df["rating"].value_counts()

            pa = ProgramAnalytics(
                run_id=run_id,
                program_name=str(row["program_name"]),
                total_responses=int(row["total_responses"]),
                avg_rating=round(float(row["avg_rating"]), 2),
                five_star_count=int(rating_counts.get(5, 0)),
                four_star_count=int(rating_counts.get(4, 0)),
                three_star_count=int(rating_counts.get(3, 0)),
                two_star_count=int(rating_counts.get(2, 0)),
                one_star_count=int(rating_counts.get(1, 0)),
            )
            self.db.add(pa)

        self.db.commit()

    # ── Helpers ────────────────────────────────────────────────────────────────

    def _create_run(self, filename: str) -> ETLRun:
        ext = self._get_extension(filename)
        run = ETLRun(filename=filename, file_type=ext.lstrip("."), status="running")
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)
        return run

    def _finalize(self, run: ETLRun, status: str, counts: dict = None, loaded: int = None, error: str = None):
        run.status = status
        run.completed_at = datetime.now(timezone.utc)
        run.error_message = error
        if counts:
            run.total_rows = counts.get("total_rows")
            run.valid_rows = counts.get("valid_rows")
            run.duplicate_rows = counts.get("duplicate_rows")
            run.invalid_rows = counts.get("invalid_rows")
        if loaded is not None:
            run.loaded_rows = loaded
        self.db.commit()

    @staticmethod
    def _get_extension(filename: str) -> str:
        lower = filename.lower()
        if lower.endswith(".xlsx"):
            return ".xlsx"
        if lower.endswith(".xls"):
            return ".xls"
        if lower.endswith(".csv"):
            return ".csv"
        dot = filename.rfind(".")
        return filename[dot:].lower() if dot != -1 else ""
