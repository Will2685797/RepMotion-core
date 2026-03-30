// models
import {
    FusedSample,
} from "../models/motionTypes";


export class MotionSessionBuffer {
    private samples: FusedSample[] = [];

    reset() {
        this.samples = [];
    }

    push(sample: FusedSample) {
        const n = this.samples.length;

        if (n > 0) {
            const last = this.samples[n - 1];

            // drop duplicate / reversed timestamps
            if (sample.t_ms <= last.t_ms) return;
        }

        this.samples.push(sample);
    }

    getAll(): FusedSample[] {
        return this.samples.slice();
    }

    getLast(n: number): FusedSample[] {
        if (n <= 0) return [];
        return this.samples.slice(-n);
    }

    size(): number {
        return this.samples.length;
    }

    durationSeconds(): number {
        if (this.samples.length < 2) return 0;
        return (this.samples[this.samples.length - 1].t_ms - this.samples[0].t_ms) / 1000;
    }
}
