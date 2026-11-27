"""RC211: persistent local SQLite knowledge graph store."""
import json, sqlite3
class PersistentKnowledgeGraph:
    def __init__(self, path):
        self.path=path
        self.db=sqlite3.connect(path)
        self.db.execute("PRAGMA foreign_keys=ON")
        self.db.executescript("""
        CREATE TABLE IF NOT EXISTS nodes(id TEXT PRIMARY KEY, kind TEXT NOT NULL, label TEXT NOT NULL, metadata TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS edges(source TEXT NOT NULL, relation TEXT NOT NULL, target TEXT NOT NULL, metadata TEXT NOT NULL,
          PRIMARY KEY(source, relation, target), FOREIGN KEY(source) REFERENCES nodes(id), FOREIGN KEY(target) REFERENCES nodes(id));
        """)
        self.db.commit()
    def add_node(self,node_id,kind,label=None,metadata=None):
        if not node_id or not kind: raise ValueError("id and kind required")
        self.db.execute("INSERT INTO nodes(id,kind,label,metadata) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,label=excluded.label,metadata=excluded.metadata",
        (node_id,kind,label or node_id,json.dumps(metadata or {},sort_keys=True)))
        self.db.commit()
    def add_edge(self,source,relation,target,metadata=None):
        if not relation: raise ValueError("relation required")
        try:
            self.db.execute("INSERT INTO edges(source,relation,target,metadata) VALUES(?,?,?,?) ON CONFLICT(source,relation,target) DO UPDATE SET metadata=excluded.metadata",
            (source,relation,target,json.dumps(metadata or {},sort_keys=True)));self.db.commit()
        except sqlite3.IntegrityError as e: self.db.rollback(); raise KeyError("edge endpoints must exist") from e
    def query_node(self,node_id):
        row=self.db.execute("SELECT id,kind,label,metadata FROM nodes WHERE id=?",(node_id,)).fetchone()
        if not row:return None
        node={"id":row[0],"kind":row[1],"label":row[2],"metadata":json.loads(row[3])}
        incoming=self.db.execute("SELECT source,relation,target,metadata FROM edges WHERE target=? ORDER BY source,relation",(node_id,)).fetchall()
        outgoing=self.db.execute("SELECT source,relation,target,metadata FROM edges WHERE source=? ORDER BY target,relation",(node_id,)).fetchall()
        convert=lambda rows:[{"source":r[0],"relation":r[1],"target":r[2],"metadata":json.loads(r[3])} for r in rows]
        return {"node":node,"incoming":convert(incoming),"outgoing":convert(outgoing)}
    def find_by_kind(self,kind):
        rows=self.db.execute("SELECT id,kind,label,metadata FROM nodes WHERE kind=? ORDER BY id",(kind,)).fetchall()
        return [{"id":r[0],"kind":r[1],"label":r[2],"metadata":json.loads(r[3])} for r in rows]
    def export(self):
        return {"nodes":[{"id":r[0],"kind":r[1],"label":r[2],"metadata":json.loads(r[3])} for r in self.db.execute("SELECT id,kind,label,metadata FROM nodes ORDER BY id")],
        "edges":[{"source":r[0],"relation":r[1],"target":r[2],"metadata":json.loads(r[3])} for r in self.db.execute("SELECT source,relation,target,metadata FROM edges ORDER BY source,relation,target")]}
    def close(self): self.db.close()
