import { FusedSample } from "../models/motionTypes";
import { MotionSessionBuffer } from "./motionSessionBuffer";
import {
    CalibrationSessionRecording, 
    CalibrationSessionRecorderState
} from "../models/motionCalibrationSessionTypes";

export class MotionCalibrationSessionRecorder {
    private readonly buffer = new MotionSessionBuffer();
    private state: CalibrationSessionRecorderState = "idle";
    private sessionId: string | null = null;
    private startedAtMs: number | null = null;
    private stoppedAtMs: number | null = null;

    public start(sessionId?: string): void {
        this.buffer.reset();
        this.state = "recording";
        this.sessionId = sessionId ?? buildSessionId();
        this.startedAtMs = null;
        this.stoppedAtMs = null;
    }

    public push(sample: FusedSample): void {
        if (this.state !== "recording") return;

        if (this.startedAtMs == null) {
            this.startedAtMs = sample.t_ms;
        }

        this.buffer.push(sample);
    }

    public stop(): CalibrationSessionRecording {
        const samples = this.buffer.getAll();
        this.state = "stopped";
        this.stoppedAtMs = samples.length > 0 ? samples[samples.length - 1].t_ms : this.startedAtMs;

        return {
            session_id: this.sessionId ?? buildSessionId(),
            started_at_ms: this.startedAtMs,
            stopped_at_ms: this.stoppedAtMs,
            sample_count: samples.length,
            duration_s:
                samples.length >= 2
                    ? (samples[samples.length - 1].t_ms - samples[0].t_ms) / 1000
                    : 0,
            samples,
        };
    }

    public reset(): void {
        this.buffer.reset();
        this.state = "idle";
        this.sessionId = null;
        this.startedAtMs = null;
        this.stoppedAtMs = null;
    }

    public getState(): CalibrationSessionRecorderState {
        return this.state;
    }

    public getSampleCount(): number {
        return this.buffer.size();
    }

    public getDurationSeconds(): number {
        return this.buffer.durationSeconds();
    }
}

function buildSessionId(): string {
    return `calib_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
