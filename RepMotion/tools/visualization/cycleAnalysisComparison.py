#!/usr/bin/env python3
"""
Analyze how the selected events from each strategy convert to reps via CycleAnalyzer.
This helps understand the difference between current_filters (2 reps) and global_alternating_path (5 reps).
"""

import json
from pathlib import Path

# Configuration
DATASET_PATH = Path(__file__).parent.parent.parent / "datasets" / "calibration" / "rowing" / "rowing_5reps_005.json"
OUTPUT_DIR = Path(__file__).parent / "output"

# Load dataset
with open(DATASET_PATH) as f:
    dataset = json.load(f)

samples = dataset["samples"]
signal_z = [s["az"] for s in samples]

# Define events
current_events = [
    ("B", 26), ("T", 154), ("B", 133), ("B", 222), ("T", 245), ("T", 315),
    ("B", 331), ("B", 415), ("T", 420), ("B", 507), ("T", 515), ("T", 601), ("B", 603)
]

current_events_sorted = sorted(current_events, key=lambda x: x[1])

global_events = [
    ("B", 133), ("T", 154), ("B", 222), ("T", 315), ("B", 331), ("T", 420),
    ("B", 442), ("T", 455), ("B", 507), ("T", 515), ("B", 557)
]

# Parse into sequences looking for B-T-B patterns (complete cycles)
def find_cycles(events_list):
    """Find complete B-T-B cycles in the event sequence"""
    cycles = []
    i = 0
    while i < len(events_list) - 2:
        event_type, idx = events_list[i]
        if event_type == "B":  # Start looking for B-T-B
            if i + 1 < len(events_list) and events_list[i + 1][0] == "T":
                if i + 2 < len(events_list) and events_list[i + 2][0] == "B":
                    bottom_start = events_list[i][1]
                    top = events_list[i + 1][1]
                    bottom_end = events_list[i + 2][1]
                    
                    concentric = top - bottom_start  # Going up (negative az)
                    eccentric = bottom_end - top      # Going down (positive az)
                    total = bottom_end - bottom_start
                    
                    cycles.append({
                        "cycle": len(cycles) + 1,
                        "bottom_start": bottom_start,
                        "top": top,
                        "bottom_end": bottom_end,
                        "concentric_duration": concentric,
                        "eccentric_duration": eccentric,
                        "total_duration": total,
                        "valid": concentric >= 8 and eccentric >= 8 and total >= 45
                    })
                    i += 2  # Move past the B-T pair for next cycle start
                else:
                    i += 1
            else:
                i += 1
        else:
            i += 1
    
    return cycles

print("=" * 80)
print("CYCLE ANALYSIS - How Events Convert to Reps")
print("=" * 80)

print("\n--- CURRENT_FILTERS STRATEGY ---")
print(f"Events sequence: {len(current_events_sorted)} events")
for i, (event_type, idx) in enumerate(current_events_sorted):
    value = signal_z[idx] if idx < len(signal_z) else 0
    print(f"  {i+1:2d}. {event_type} @ index {idx:3d} (value: {value:6.0f})")

current_cycles = find_cycles(current_events_sorted)
print(f"\nFound {len(current_cycles)} complete B-T-B cycles:")
for cycle in current_cycles:
    print(f"  Cycle {cycle['cycle']}: [{cycle['bottom_start']:3d}]-[{cycle['top']:3d}]-[{cycle['bottom_end']:3d}]")
    print(f"    Concentric: {cycle['concentric_duration']:3d}  |  Eccentric: {cycle['eccentric_duration']:3d}  |  Total: {cycle['total_duration']:3d}")
    print(f"    Valid (conc≥8, ecc≥8, total≥45): {cycle['valid']}")

valid_current = sum(1 for c in current_cycles if c['valid'])
print(f"\nValid reps (meeting constraints): {valid_current}")

print("\n" + "-" * 80)
print("\n--- GLOBAL_ALTERNATING_PATH STRATEGY ---")
print(f"Events sequence: {len(global_events)} events")
for i, (event_type, idx) in enumerate(global_events):
    value = signal_z[idx] if idx < len(signal_z) else 0
    print(f"  {i+1:2d}. {event_type} @ index {idx:3d} (value: {value:6.0f})")

global_cycles = find_cycles(global_events)
print(f"\nFound {len(global_cycles)} complete B-T-B cycles:")
for cycle in global_cycles:
    print(f"  Cycle {cycle['cycle']}: [{cycle['bottom_start']:3d}]-[{cycle['top']:3d}]-[{cycle['bottom_end']:3d}]")
    print(f"    Concentric: {cycle['concentric_duration']:3d}  |  Eccentric: {cycle['eccentric_duration']:3d}  |  Total: {cycle['total_duration']:3d}")
    print(f"    Valid (conc≥8, ecc≥8, total≥45): {cycle['valid']}")

valid_global = sum(1 for c in global_cycles if c['valid'])
print(f"\nValid reps (meeting constraints): {valid_global}")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Current_filters: {valid_current} valid reps (expected: 2)")
print(f"Global_alternating_path: {valid_global} valid reps (expected: 5)")
print("=" * 80)

# Save detailed analysis to file
analysis_path = OUTPUT_DIR / "cycle_analysis_rowing_005.txt"
with open(analysis_path, "w", encoding="utf-8") as f:
    f.write("CYCLE ANALYSIS - How Events Convert to Reps\n")
    f.write("=" * 80 + "\n\n")
    
    f.write("CURRENT_FILTERS STRATEGY\n")
    f.write(f"Events sequence: {len(current_events_sorted)} events\n")
    for i, (event_type, idx) in enumerate(current_events_sorted):
        value = signal_z[idx] if idx < len(signal_z) else 0
        f.write(f"  {i+1:2d}. {event_type} @ index {idx:3d} (value: {value:6.0f})\n")
    
    f.write(f"\nFound {len(current_cycles)} complete B-T-B cycles:\n")
    for cycle in current_cycles:
        f.write(f"  Cycle {cycle['cycle']}: [{cycle['bottom_start']:3d}]-[{cycle['top']:3d}]-[{cycle['bottom_end']:3d}]\n")
        f.write(f"    Concentric: {cycle['concentric_duration']:3d}  |  Eccentric: {cycle['eccentric_duration']:3d}  |  Total: {cycle['total_duration']:3d}\n")
        f.write(f"    Valid: {cycle['valid']}\n")
    
    f.write(f"\nValid reps: {valid_current}\n\n")
    
    f.write("=" * 80 + "\n\n")
    f.write("GLOBAL_ALTERNATING_PATH STRATEGY\n")
    f.write(f"Events sequence: {len(global_events)} events\n")
    for i, (event_type, idx) in enumerate(global_events):
        value = signal_z[idx] if idx < len(signal_z) else 0
        f.write(f"  {i+1:2d}. {event_type} @ index {idx:3d} (value: {value:6.0f})\n")
    
    f.write(f"\nFound {len(global_cycles)} complete B-T-B cycles:\n")
    for cycle in global_cycles:
        f.write(f"  Cycle {cycle['cycle']}: [{cycle['bottom_start']:3d}]-[{cycle['top']:3d}]-[{cycle['bottom_end']:3d}]\n")
        f.write(f"    Concentric: {cycle['concentric_duration']:3d}  |  Eccentric: {cycle['eccentric_duration']:3d}  |  Total: {cycle['total_duration']:3d}\n")
        f.write(f"    Valid: {cycle['valid']}\n")
    
    f.write(f"\nValid reps: {valid_global}\n")

print(f"\n[OK] Saved detailed analysis to {analysis_path}")
