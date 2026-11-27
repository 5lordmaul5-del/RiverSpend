"""RC210: simple offline knowledge graph with explicit triples and query helpers."""
class KnowledgeGraph:
    def __init__(self):
        self._nodes={}
        self._edges=[]

    def add_node(self,node_id,kind,label=None,metadata=None):
        if not node_id or not kind: raise ValueError("node_id and kind required")
        self._nodes[node_id]={"id":node_id,"kind":kind,"label":label or node_id,"metadata":metadata or {}}
        return dict(self._nodes[node_id])

    def add_edge(self,source,relation,target,metadata=None):
        if source not in self._nodes or target not in self._nodes:
            raise KeyError("both edge endpoints must exist")
        if not relation: raise ValueError("relation required")
        edge={"source":source,"relation":relation,"target":target,"metadata":metadata or {}}
        if edge not in self._edges: self._edges.append(edge)
        return dict(edge)

    def query_node(self,node_id):
        node=self._nodes.get(node_id)
        if not node:return None
        return {"node":dict(node),"incoming":[e for e in self._edges if e["target"]==node_id],
                "outgoing":[e for e in self._edges if e["source"]==node_id]}

    def find_by_kind(self,kind):
        return [dict(n) for n in sorted(self._nodes.values(),key=lambda n:n["id"]) if n["kind"]==kind]

    def export(self):
        return {"nodes":[dict(n) for n in sorted(self._nodes.values(),key=lambda n:n["id"])],
                "edges":sorted([dict(e) for e in self._edges],key=lambda e:(e["source"],e["relation"],e["target"]))}
