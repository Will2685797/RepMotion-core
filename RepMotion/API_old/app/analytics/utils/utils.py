from __future__ import annotations
import re
import os
import sys
import copy
import json
import time
import uuid
import math
import hashlib
# import requests
import traceback
import numpy as np
import pandas as pd
from typing import Sequence
from scipy.stats import trim_mean
from dataclasses import is_dataclass, asdict
from datetime import datetime, timezone, timedelta
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode, urlunsplit, urlsplit
from typing import Optional, List, Literal, Tuple, Dict, Union, Any, Type
"""
"""




# ==============================================================
# --- Helpers Functions ---
# ==============================================================
# log / print
def log_print(message: str):
    """
    Custom bridge function that both prints to console 
    and adds to the PrintLogger buffer.
    """
    PrintLogger.log(message)
   
# config / dicts 
def _cfg_get(
    d: Dict[str, Any], 
    path: Tuple[str, ...], 
    default: Any = None,
    required: bool = True,
    expected_type: Optional[Union[Type, Tuple[Type, ...]]] = None
) -> Any:
    """
    Default get:
        _cfg_get(cfg, ("parent config name","child config name","key name"), required=True, expected_type=[type])
    
    Safe nested get: 
        _cfg_get(cfg, ("parent config name","child config name","key name"), default=[default value])
    """
    cur = d
    for k in path:
        if not isinstance(cur, dict) or k not in cur:
            if required:
                p = " -> ".join(path)
                raise KeyError(f"[_cfg_get] Missing required Config key: {p}")
            return default
        cur = cur[k]
    
    # --- Type Validation ---
    if expected_type is not None:
        if not isinstance(cur, expected_type):
            p = " -> ".join(path)
            actual_type = type(cur).__name__
            # Handle single type or tuple of types for the error message
            exp_name = expected_type.__name__ if hasattr(expected_type, '__name__') else str(expected_type)
            raise TypeError(
                f"[_cfg_get] Config key '{p}' is {actual_type}, expected {exp_name}."
            )

    return cur
    
# urls/domains
_TRACKING_KEYS = {
    "utm_source","utm_medium","utm_campaign","utm_term","utm_content",
    "at_medium","at_campaign","cmpid","ocid","fbclid","gclid"
}

def _canonical_domain(url: str) -> str:
    try:
        ext = tldextract.extract(url)
        if not ext.domain or not ext.suffix:
            return ""
        return f"{ext.domain}.{ext.suffix}".lower()
    except Exception:
        return ""
    
def _normalize_url(
    url: str
) -> str:
    """
    Canonicalizes URLs by removing tracking parameters like utm_*.
    """
    if not isinstance(url, str):
        return ""
    parsed = urlparse(url)
    # Filter out utm parameters
    query_params = parse_qsl(parsed.query)
    filtered_params = [(k, v) for k, v in query_params if not k.startswith('utm_')]
    
    # Reconstruct URL without tracking params
    new_query = urlencode(filtered_params)
    return urlunparse(parsed._replace(query=new_query))

def _canonical_url(url: str) -> str:
    p = urlsplit(url.strip())
    # normalize: lower host, strip fragments
    netloc = p.netloc.lower()
    scheme = p.scheme.lower() if p.scheme else "https"
    # drop tracking params
    q = [(k, v) for (k, v) in parse_qsl(p.query, keep_blank_values=True) if k.lower() not in _TRACKING_KEYS]
    query = urlencode(q, doseq=True)
    return urlunsplit((scheme, netloc, p.path, query, ""))

def _id_from_url(url: str) -> str:
    u = _canonical_url(url)
    return hashlib.sha256(u.encode("utf-8")).hexdigest()

# reg
def _kw_match(text_lc: str, kw_lc: str) -> bool:
    """Use regex boundaries for short words to prevent (eg) 'oil' in 'spoiled'."""
    if not kw_lc: return False
    if len(kw_lc) <= 3:
        return re.search(rf"\b{re.escape(kw_lc)}\b", text_lc) is not None
    return kw_lc in text_lc
    
# str
def _safe_lower(s: str) -> str:
    return (s or "").strip().lower()

def _normalize_title(s: str) -> str:
    s = _safe_lower(s)
    s = re.sub(r"<.*?>", " ", s)
    s = re.sub(r"[^a-z0-9\s]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def _norm(s: str) -> str:
    s = (s or "").lower()
    s = re.sub(r"\s+", " ", s)
    return s.strip()

def _clean_text(s: str) -> str:
    return " ".join((s or "").lower().split())

def _normalize_token(s: str) -> str:
    s = _safe_lower(s or "")
    s = re.sub(r"[^a-z0-9_\- ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

# hashing
def _get_text_hash(text: str) -> str:
        return hashlib.sha256(text.lower().encode()).hexdigest()

def _hash_fingerprint(text: str, n: int = 12) -> str:
    h = hashlib.sha1(text.encode("utf-8", errors="ignore")).hexdigest()
    return h[:n]

# tz
def _utc_now() -> datetime:
    return datetime.now(timezone.utc)

def _dt_to_iso_utc(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()

def _floor_utc(ts: datetime, tf_s: int) -> datetime:
    if ts.tzinfo is None:
        # enforce UTC-aware; you can also assert instead
        ts = ts.replace(tzinfo=timezone.utc)
    epoch = int(ts.timestamp())
    floored = epoch - (epoch % tf_s)
    return datetime.fromtimestamp(floored, tz=timezone.utc)

# math
def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))

def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, float(x)))

def _clamp(x: float, lo: float, hi: float) -> float:
    if x < lo:
        return lo
    if x > hi:
        return hi
    return x

def _median(xs: Sequence[float], default: float = 0.0) -> float:
    if not xs:
        return float(default)
    return float(np.median(np.asarray(xs, dtype=float)))

def _trimmed_mean(xs: Sequence[float], proportiontocut: float = 0.1, default: float = 0.0) -> float:
    if not xs:
        return float(default)
    if len(xs) < 3:
        return float(np.mean(np.asarray(xs, dtype=float)))
    # scipy.stats.trim_mean is stable and deterministic
    return float(trim_mean(np.asarray(xs, dtype=float), proportiontocut=proportiontocut))

def _std(xs: Sequence[float]) -> float:
    if len(xs) <= 1:
        return 0.0
    return float(np.std(np.asarray(xs, dtype=float)))

def _dist_metrics(scores: Dict[str, float], *, k: int = 5) -> dict:
    """
    Convert raw scores -> probability distribution + uncertainty metrics.
    Deterministic, no training, stable across cycles.

    Returns:
        {
        "topk": tuple[(label, prob), ...],
        "entropy": float in [0,1],
        "top2_margin": float in [0,1],
        "probs": dict[label, prob]   # full dist (optional but recommended)
        }
    """
    if not scores:
        return {"topk": (), "entropy": 1.0, "top2_margin": 0.0, "probs": {}}

    # keep only finite, non-negative
    cleaned: Dict[str, float] = {}
    for lab, v in scores.items():
        try:
            x = float(v)
        except Exception:
            x = 0.0
        if not np.isfinite(x) or x < 0:
            x = 0.0
        cleaned[str(lab)] = x

    labels = list(cleaned.keys())
    vals = np.asarray([cleaned[l] for l in labels], dtype=float)
    s = float(vals.sum())
    if s <= 0.0:
        # totally uncertain
        n = max(1, len(labels))
        p = np.full(n, 1.0 / n, dtype=float)
    else:
        p = vals / s

    # normalized entropy in [0,1]
    ent = -float(np.sum(p * np.log(p + 1e-12)))
    ent_norm = ent / float(np.log(len(p) + 1e-12))
    ent_norm = max(0.0, min(1.0, float(ent_norm)))
    
    # top2 margin
    sp = np.sort(p)[::-1]
    p1 = float(sp[0]) if len(sp) > 0 else 0.0
    p2 = float(sp[1]) if len(sp) > 1 else 0.0
    margin = p1 - p2
    margin = max(0.0, min(1.0, float(margin)))

    # full dist (stable ordering not required, but keep as dict)
    probs_distribution = {labels[i]: float(p[i]) for i in range(len(labels))}

    # topk sorted by prob desc
    items = sorted(probs_distribution.items(), key=lambda kv: kv[1], reverse=True)
    topk = tuple(items[: max(0, int(k))])

    return {"topk": topk, "entropy": float(ent_norm), "top2_margin": float(margin), "probs_distribution": probs_distribution}

def _norm_probs(probs: Dict[str, float], labels: Tuple[str, ...]) -> Dict[str, float]:
    out = {lab: max(0.0, float(probs.get(lab, 0.0))) for lab in labels}
    s = sum(out.values())
    if s <= 0:
        return {lab: 1.0 / len(labels) for lab in labels}
    return {lab: out[lab] / s for lab in labels}

# json
def _jsonify(x):
    if x is None:
        return None
    if is_dataclass(x):
        return asdict(x)
    if isinstance(x, dict):
        return {k: _jsonify(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [_jsonify(v) for v in x]
    return x

def _float_or_none(x):
    if x in ("", None):
        return None
    return float(x)

def _safe_none(x):
    return "" if x is None else str(x)

def _safe_str(x):
    return None if x is None else str(x)

def _safe_int(x):
    return None if x is None else int(x)

def _safe_float(x):
    return None if x is None else float(x)

def _dedupe_payloads(payloads, key):
    out = []
    seen = set()
    for p in payloads:
        k = key(p)
        if k in seen:
            continue
        seen.add(k)
        out.append(p)
    return out




# ==============================================================
# --- Helpers Classes ---
# ==============================================================
# cfg
class ConfigError(ValueError):
    def __init__(self, message: str):
        stack = "".join(traceback.format_stack()[:-1]) 
        full_log_msg = f"{message}\nStack Trace:\n{stack}"
        log_print(full_log_msg)
        super().__init__(message)
        
# cfg
class EngineError(RuntimeError):
    def __init__(self, message: str):
        stack = "".join(traceback.format_stack()[:-1]) 
        full_log_msg = f"{message}\nStack Trace:\n{stack}"
        log_print(full_log_msg)
        super().__init__(message)
  
# api
class APIConnectionError(RuntimeError):
    def __init__(self, message: str):
        stack = "".join(traceback.format_stack()[:-1]) 
        full_log_msg = f"{message}\nStack Trace:\n{stack}"
        log_print(full_log_msg)
        super().__init__(message)
        
class APITimeoutError(RuntimeError):
    def __init__(self, message: str):
        stack = "".join(traceback.format_stack()[:-1]) 
        full_log_msg = f"{message}\nStack Trace:\n{stack}"
        log_print(full_log_msg)
        super().__init__(message)     
        
class APIAuthError(RuntimeError):
    def __init__(self, message: str):
        stack = "".join(traceback.format_stack()[:-1]) 
        full_log_msg = f"{message}\nStack Trace:\n{stack}"
        log_print(full_log_msg)
        super().__init__(message)   
        
class APIResponseError(RuntimeError):
    def __init__(self, message: str):
        stack = "".join(traceback.format_stack()[:-1]) 
        full_log_msg = f"{message}\nStack Trace:\n{stack}"
        log_print(full_log_msg)
        super().__init__(message)                        

# fmp
class FMPConnectionError(RuntimeError): ...
class FMPTimeoutError(RuntimeError): ...
class FMPAuthError(RuntimeError): ...
class FMPResponseError(RuntimeError): ...
class FMPMappingError(RuntimeError): ...
