"""RC-166 retry/recovery decision helper (pure logic, no scheduling or persistence)."""
SAFE_RETRY_ERRORS={"temporary_unavailable","timeout","worker_failed"}
def recovery_decision(error_code:str,attempt:int,max_attempts:int,base_delay_seconds:int=2,max_delay_seconds:int=60):
 if not isinstance(error_code,str) or not isinstance(attempt,int) or not isinstance(max_attempts,int):return {"retry":False,"reason":"invalid_input"}
 if attempt<1 or max_attempts<1 or attempt>=max_attempts:return {"retry":False,"reason":"attempt_limit"}
 if error_code not in SAFE_RETRY_ERRORS:return {"retry":False,"reason":"non_retryable"}
 delay=min(max_delay_seconds,base_delay_seconds*(2**(attempt-1)))
 return {"retry":True,"reason":"retryable","delay_seconds":max(0,delay)}
