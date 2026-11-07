import { createCluster } from "./clusterUtils";

export const analyticsCluster = createCluster(["data","funnel_tracker","cohort_analyst","ab_test_analyst","sentiment_analyzer","cost_tracker","quality_scorer","markets","tokenomics_lab"]);
