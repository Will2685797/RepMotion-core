#!/usr/bin/env python3
"""
Visualize comparison between current_filters and global_alternating_path strategies
for rowing_5reps_005.json on the az axis.
"""

import json
import sys
from pathlib import Path
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

# Configuration
DATASET_PATH = Path(__file__).parent.parent.parent / "datasets" / "calibration" / "rowing" / "rowing_5reps_005.json"
OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# Load dataset
with open(DATASET_PATH) as f:
    dataset = json.load(f)

samples = dataset["samples"]
signal_z = np.array([s["az"] for s in samples])

# Define events
current_bottoms = [26, 133, 222, 331, 415, 507, 603]
current_tops = [154, 245, 315, 420, 515, 601]

global_bottoms = [133, 222, 331, 442, 507, 557]
global_tops = [154, 315, 420, 455, 515]

# Find common and unique events
current_all = set([(t, idx) for t, idx in [("B", x) for x in current_bottoms] + [("T", x) for x in current_tops]])
global_all = set([(t, idx) for t, idx in [("B", x) for x in global_bottoms] + [("T", x) for x in global_tops]])

common = current_all & global_all
only_current = current_all - global_all
only_global = global_all - current_all

# Create figure with two subplots
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(16, 10))

# --- Plot 1: Signal with overlays ---
x_indices = np.arange(len(signal_z))

# Plot signal
ax1.plot(x_indices, signal_z, color="gray", linewidth=1, label="Signal (az)", alpha=0.7)
ax1.axhline(y=0, color="black", linewidth=0.5, linestyle="--", alpha=0.3)

# Plot current_filters events
for idx in current_bottoms:
    if idx < len(signal_z):
        ax1.plot(idx, signal_z[idx], "o", color="red", markersize=8, label="Bottom current" if idx == current_bottoms[0] else "")
        ax1.text(idx, signal_z[idx] - 500, str(idx), fontsize=8, ha="center", color="red")

for idx in current_tops:
    if idx < len(signal_z):
        ax1.plot(idx, signal_z[idx], "s", color="blue", markersize=8, label="Top current" if idx == current_tops[0] else "")
        ax1.text(idx, signal_z[idx] + 500, str(idx), fontsize=8, ha="center", color="blue")

# Plot global_alternating_path events
for idx in global_bottoms:
    if idx < len(signal_z):
        ax1.plot(idx, signal_z[idx], "^", color="orange", markersize=8, label="Bottom global" if idx == global_bottoms[0] else "")

for idx in global_tops:
    if idx < len(signal_z):
        ax1.plot(idx, signal_z[idx], "v", color="green", markersize=8, label="Top global" if idx == global_tops[0] else "")

ax1.set_xlabel("Sample Index")
ax1.set_ylabel("Signal Value (az)")
ax1.set_title("rowing_5reps_005.json - Strategy Comparison (axis az)")
ax1.legend(loc="upper right")
ax1.grid(True, alpha=0.3)

# --- Plot 2: Comparison table visualization ---
ax2.axis("off")

# Create comparison data
comparison_data = []
all_indices = sorted(current_all | global_all, key=lambda x: x[1])

for event_type, idx in all_indices:
    is_current = (event_type, idx) in current_all
    is_global = (event_type, idx) in global_all
    value = signal_z[idx] if idx < len(signal_z) else 0
    
    comparison_data.append({
        "index": idx,
        "type": event_type,
        "current": "✓" if is_current else "",
        "global": "✓" if is_global else "",
        "value": int(value),
        "kind": "Common" if (is_current and is_global) else ("Current only" if is_current else "Global only")
    })

# Create table
table_data = []
table_data.append(["Index", "Type", "Current", "Global", "Value", "Category"])
for row in comparison_data:
    table_data.append([
        str(row["index"]),
        row["type"],
        row["current"],
        row["global"],
        str(row["value"]),
        row["kind"]
    ])

# Add summary
table_data.append(["", "", "", "", "", ""])
table_data.append([
    f"Common events: {len(common)}",
    f"Current only: {len(only_current)}",
    f"Global only: {len(only_global)}",
    "",
    "",
    ""
])
table_data.append([
    f"Current total: {len(current_all)}",
    f"Global total: {len(global_all)}",
    "",
    "",
    "",
    ""
])

# Render table
table = ax2.table(cellText=table_data, cellLoc="center", loc="center", 
                  colWidths=[0.1, 0.1, 0.1, 0.1, 0.15, 0.2])
table.auto_set_font_size(False)
table.set_fontsize(9)
table.scale(1, 2)

# Style header row
for i in range(6):
    table[(0, i)].set_facecolor("#4CAF50")
    table[(0, i)].set_text_props(weight="bold", color="white")

# Style summary rows
for i in range(6):
    table[(len(table_data) - 2, i)].set_facecolor("#f0f0f0")
    table[(len(table_data) - 1, i)].set_facecolor("#e0e0e0")

# Color common rows
for row_idx in range(1, len(comparison_data) + 1):
    row_data = comparison_data[row_idx - 1]
    if row_data["kind"] == "Common":
        for i in range(6):
            table[(row_idx, i)].set_facecolor("#e8f5e9")

plt.tight_layout()
output_path = OUTPUT_DIR / "strategy_comparison_rowing_005.png"
plt.savefig(output_path, dpi=150, bbox_inches="tight")
print(f"✓ Saved PNG to {output_path}")

# Generate summary text
summary_path = OUTPUT_DIR / "strategy_comparison_rowing_005_summary.txt"
with open(summary_path, "w", encoding="utf-8") as f:
    f.write("STRATEGY COMPARISON SUMMARY\n")
    f.write("=" * 60 + "\n")
    f.write(f"Dataset: rowing_5reps_005.json\n")
    f.write(f"Calibration Axis: az\n")
    f.write(f"Total Samples: {len(signal_z)}\n\n")
    
    f.write("CURRENT_FILTERS CHAIN:\n")
    f.write(f"  Bottoms: {current_bottoms}\n")
    f.write(f"  Tops: {current_tops}\n")
    f.write(f"  Total events: {len(current_all)}\n\n")
    
    f.write("GLOBAL_ALTERNATING_PATH CHAIN:\n")
    f.write(f"  Bottoms: {global_bottoms}\n")
    f.write(f"  Tops: {global_tops}\n")
    f.write(f"  Total events: {len(global_all)}\n\n")
    
    f.write("COMPARISON:\n")
    f.write(f"  Common events: {len(common)}\n")
    f.write(f"  Current only: {len(only_current)}\n")
    f.write(f"  Global only: {len(only_global)}\n\n")
    
    f.write("DETAILED EVENTS:\n")
    f.write("-" * 60 + "\n")
    f.write("Index | Type | Current | Global | Value | Category\n")
    f.write("-" * 60 + "\n")
    for row in comparison_data:
        current_mark = "Y" if row["current"] else " "
        global_mark = "Y" if row["global"] else " "
        f.write(f"{row['index']:5d} | {row['type']:4s} | {current_mark:7s} | {global_mark:6s} | {row['value']:5d} | {row['kind']}\n")

print("[OK] Saved summary to", summary_path)

# Print to stdout
print("\n" + "=" * 60)
print("STRATEGY COMPARISON SUMMARY")
print("=" * 60)
print(f"Dataset: rowing_5reps_005.json")
print(f"Calibration Axis: az")
print(f"Total Samples: {len(signal_z)}\n")

print("CURRENT_FILTERS CHAIN:")
print(f"  Bottoms: {current_bottoms}")
print(f"  Tops: {current_tops}")
print(f"  Total events: {len(current_all)}\n")

print("GLOBAL_ALTERNATING_PATH CHAIN:")
print(f"  Bottoms: {global_bottoms}")
print(f"  Tops: {global_tops}")
print(f"  Total events: {len(global_all)}\n")

print("COMPARISON:")
print(f"  Common events: {len(common)}")
print(f"  Current only: {len(only_current)}")
print(f"  Global only: {len(only_global)}\n")

print("DETAILED EVENTS:")
print("-" * 70)
print(f"{'Index':>6} | {'Type':>4} | {'Current':>7} | {'Global':>7} | {'Value':>6} | Category")
print("-" * 70)
for row in comparison_data:
    current_mark = "Y" if row["current"] else " "
    global_mark = "Y" if row["global"] else " "
    print(f"{row['index']:6d} | {row['type']:4s} | {current_mark:7s} | {global_mark:7s} | {row['value']:6d} | {row['kind']}")
