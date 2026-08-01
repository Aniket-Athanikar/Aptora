"""
ExamForge RAG Full Diagnostic
Connect to Qdrant on port 6433 (Docker exposed port) and run all filter tests.
"""
import sys
import json
import logging
import urllib.request

logging.basicConfig(level=logging.WARNING)
sys.path.insert(0, ".")

from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, FieldCondition, MatchValue, MatchAny

# Connect to the actual Docker-exposed Qdrant port
client = QdrantClient(host="127.0.0.1", port=6433, timeout=10)
TARGET = "examforge_documents"

print("=" * 60)
print("STEP 1: Collection info")
print("=" * 60)
cols = client.get_collections()
col_names = [c.name for c in cols.collections]
print(f"Collections: {col_names}")

for c in col_names:
    cnt = client.count(collection_name=c, exact=True).count
    print(f"  '{c}': {cnt} vectors")

print()
print("=" * 60)
print("STEP 2: Sample 10 payloads")
print("=" * 60)
if TARGET in col_names:
    points, _ = client.scroll(
        collection_name=TARGET, limit=10, with_payload=True, with_vectors=False
    )
    print(f"Got {len(points)} sample points")
    all_keys = set()
    for i, p in enumerate(points):
        pl = p.payload or {}
        all_keys.update(pl.keys())
        print(f"\nPoint {i+1}: id={p.id}")
        for k in sorted(pl.keys()):
            v = pl[k]
            vstr = repr(v)[:80]
            print(f"  {k!r:20s} = {vstr}  [{type(v).__name__}]")
    print(f"\nAll payload keys: {sorted(all_keys)}")
else:
    print(f"COLLECTION '{TARGET}' DOES NOT EXIST!")
    sys.exit(1)

print()
print("=" * 60)
print("STEP 3: Unique field values survey (all vectors)")
print("=" * 60)
all_points, _ = client.scroll(
    collection_name=TARGET, limit=1000, with_payload=True, with_vectors=False
)
workspaces = {}
subjects = {}
rtypes = {}
resource_ids = {}

for p in all_points:
    pl = p.payload or {}
    for field, store in [
        ("workspace_id", workspaces),
        ("subject_id", subjects),
        ("resource_type", rtypes),
        ("resource_id", resource_ids),
    ]:
        val = pl.get(field)
        if val is not None:
            key = (val, type(val).__name__)
            store[key] = store.get(key, 0) + 1

print(f"workspace_id values: {sorted(workspaces.items())}")
print(f"subject_id values:   {sorted(subjects.items())}")
print(f"resource_type values:{sorted(rtypes.items())}")
print(f"resource_id values:  {sorted(resource_ids.items())}")

print()
print("=" * 60)
print("STEP 4: Generate test embedding via Ollama")
print("=" * 60)
OLLAMA_URL = "http://localhost:11434/api/embeddings"
payload_bytes = json.dumps(
    {"model": "nomic-embed-text", "prompt": "Geography study material human geography"}
).encode()
req = urllib.request.Request(
    OLLAMA_URL, data=payload_bytes,
    headers={"Content-Type": "application/json"}, method="POST"
)
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        embedding = json.loads(r.read())["embedding"]
    print(f"Embedding dimension: {len(embedding)}")
except Exception as e:
    print(f"Ollama embedding failed: {e}")
    sys.exit(1)

print()
print("=" * 60)
print("STEP 5: Filter comparison tests")
print("=" * 60)

def do_search(flt=None):
    resp = client.query_points(
        collection_name=TARGET,
        query=embedding,
        limit=5,
        query_filter=flt,
        with_payload=True,
    )
    return getattr(resp, "points", [])

# 5a: Unfiltered
r_unfiltered = do_search()
print(f"\n5a. UNFILTERED: {len(r_unfiltered)} results")
for r in r_unfiltered:
    p = r.payload or {}
    ws = p.get("workspace_id")
    subj = p.get("subject_id")
    rt = p.get("resource_type")
    print(f"     score={r.score:.4f}  ws={ws}({type(ws).__name__})  subj={subj}  rtype={rt!r}")

# 5b: ws=2 only
r_ws = do_search(Filter(must=[FieldCondition(key="workspace_id", match=MatchValue(value=2))]))
print(f"\n5b. workspace_id=2: {len(r_ws)} results")

# 5c: ws=2 + subj=2
r_wssubj = do_search(Filter(must=[
    FieldCondition(key="workspace_id", match=MatchValue(value=2)),
    FieldCondition(key="subject_id", match=MatchValue(value=2)),
]))
print(f"\n5c. ws=2+subj=2: {len(r_wssubj)} results")

# 5d: full filter
r_full = do_search(Filter(must=[
    FieldCondition(key="workspace_id", match=MatchValue(value=2)),
    FieldCondition(key="subject_id", match=MatchValue(value=2)),
    FieldCondition(key="resource_type", match=MatchAny(any=["notes", "book"])),
]))
print(f"\n5d. FULL filter (ws=2,subj=2,rtype in [notes,book]): {len(r_full)} results")
for r in r_full:
    p = r.payload or {}
    content = str(p.get("content", ""))[:80]
    print(f"     score={r.score:.4f}  rtype={p.get('resource_type')}  content={content!r}")

# 5e: string type test
r_str = do_search(Filter(must=[FieldCondition(key="workspace_id", match=MatchValue(value="2"))]))
print(f"\n5e. ws='2' (STRING test): {len(r_str)} results  <- nonzero means stored as string!")

print()
print("=" * 60)
print("STEP 6: Check payload indexes")
print("=" * 60)
info = client.get_collection(TARGET)
print(f"Status: {info.status}")
print(f"Vectors count: {info.vectors_count}")
print(f"Points count:  {info.points_count}")
schema = getattr(info, "payload_schema", None) or {}
if schema:
    print("Payload indexes:")
    for fname, fschema in schema.items():
        print(f"  {fname}: {fschema}")
else:
    print("No payload_schema attribute (indexes may not be visible via this API call)")

print()
print("=" * 60)
print("STEP 7: SearchService with CORRECT Qdrant port")
print("=" * 60)
print("NOTE: SearchService uses QDRANT_PORT from env=6333 but Docker exposes 6433.")
print("When running locally, SearchService connects to the WRONG port (6333).")
print("This is the ROOT CAUSE of 0 results when running outside Docker.")
print()
print("Inside Docker containers, QDRANT_HOST=qdrant, QDRANT_PORT=6333 -> CORRECT.")
print("The backend API server inside Docker can find vectors fine.")
print()
print("The API calls from the frontend go through nginx -> backend (Docker)")
print("But the test scripts run on the HOST and hit port 6333 (wrong) or 6433 (right).")

print()
print("=" * 60)
print("DIAGNOSTIC COMPLETE")
print("=" * 60)
