import { createCluster } from "./clusterUtils";

export const p2pCluster = createCluster(["signal_router","sync_engine","stream_codec","bitrate_adapter","p2p_mesh","offline_sync","webrtc_quality","turn_optimizer","edge_worker"]);
