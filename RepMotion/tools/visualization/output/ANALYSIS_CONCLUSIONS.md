# Strategy Comparison Analysis - rowing_5reps_005.json

## Execution Summary

Successfully generated visual comparison between `current_filters` and `global_alternating_path` strategies on rowing dataset.

## Key Findings

### 1. Event Selection Comparison

| Metric | current_filters | global_alternating_path |
|--------|-----------------|------------------------|
| Total Events | 13 | 11 |
| Bottoms | 7 | 6 |
| Tops | 6 | 5 |
| Common Events | 8 | 8 |
| Strategy-Only Events | 5 | 3 |

### 2. Event Overlap Analysis

**Common Selected Events (8):**
- Bottom events: 133, 222, 331, 507
- Top events: 154, 315, 420, 515
- These represent the high-confidence pivot points both strategies agree on

**Current-Only Events (5):**
- Index 26 (Bottom): Beginning edge boundary - possible artifact
- Index 245 (Top): Minor oscillation between consensus peaks
- Index 415 (Bottom): Isolated bottom between 331 and 507
- Index 601 (Top): Final descent phase
- Index 603 (Bottom): End boundary artifact

**Global-Only Events (3):**
- Index 442 (Bottom): Positioned between 420 and 507, close to 455 top (13 sample gap)
- Index 455 (Top): Short duration cycle with 442, 507
- Index 557 (Bottom): Final bottom selection near signal tail

### 3. Rep Counting Structure

**current_filters Event Sequence:**
```
26(B) → 133(B) → 154(T) → 222(B) → 245(T) → 315(T) → 331(B) → 415(B) → 420(T) → 507(B) → 515(T) → 601(T) → 603(B)
```

**Issues with structure:**
- Consecutive bottoms at indices: (26,133), (331,415), (220 implicit)
- Consecutive tops at indices: (245,315), (601,T implicit)
- Non-alternating pattern → difficult cycle extraction

**global_alternating_path Event Sequence:**
```
133(B) → 154(T) → 222(B) → 315(T) → 331(B) → 420(T) → 442(B) → 455(T) → 507(B) → 515(T) → 557(B)
```

**Advantages of structure:**
- Perfect alternation: B-T-B-T-B-T-B-T-B-T-B (11 events forming 5 cycles)
- Enables clear B-T-B cycle extraction
- Results in consistent 5 reps when passed to CycleAnalyzer

### 4. Signal Value Distribution

All selected events cluster in valid ranges:
- Bottoms: 12,380 to 17,604 (center ~14,500)
- Tops: 21,800 to 27,252 (center ~25,000)
- Clear amplitude separation between bottom and top phases

## Interpretation

### current_filters Behavior
- Generates multiple adjacent candidates
- Preserves edge effects (indices 26, 603)
- Includes oscillation details
- Produces non-alternating event sequence
- Resulting rep count: 1-2 reps (ambiguous structure)

### global_alternating_path Behavior  
- Enforces strict alternation constraint
- Skips edge boundary effects
- Integrates adjacent minor oscillations into main cycles
- Produces clean B-T-B-T-B pattern
- Resulting rep count: 5 reps (clear structure)

## Signal Biomechanics Context (Rowing Motion)

The rowing movement involves:
1. **Catch phase** (bottom) - arms fully extended at start
2. **Drive phase** (upward motion) - concentric, pulling through
3. **Finish phase** (top) - maximum flexion/pull
4. **Recovery phase** (downward motion) - eccentric, extending arms back

The `global_alternating_path` selection (11 events → 5 reps) aligns with expected 5 rowing repetitions, suggesting:
- Cleaner identification of true catch-finish-catch cycles
- Better filtering of within-phase oscillations
- More biomechanically coherent rep boundaries

## Generated Files

- `strategy_comparison_rowing_005.png` - Visual overlay of both strategies on signal
- `strategy_comparison_rowing_005_summary.txt` - Detailed event comparison table
- `cycle_analysis_rowing_005.txt` - Cycle-by-cycle rep structure analysis
- `compareStrategies.py` - Visualization generation script
- `cycleAnalysisComparison.py` - Cycle analysis script

## Conclusion

The `global_alternating_path` strategy produces:
1. **Cleaner event sequencing** (strict alternation B-T-B-T-B)
2. **Consistent rep counting** (5 reps matching expected input)
3. **Biomechanically coherent cycles** (proper catch-drive-finish-recovery structure)
4. **Reduced noise** (filters out edge effects and micro-oscillations)

The visual comparison shows 8 consensus events between strategies, indicating both approaches identify core biomechanical transitions. The difference in total events (13 vs 11) reflects strategy philosophy:
- **current_filters**: Conservative capture of all oscillations
- **global_alternating_path**: Optimization for coherent multi-cycle structure
