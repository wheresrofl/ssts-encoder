import { OutputInfo, Sharp } from "sharp";
import { objectFit, sampleFunction } from "./types";

export function rgb2yuv(r: number, g: number, b: number): number[] {
    return [
        16.0 + (.003906 * ((65.738 * r) + (129.057 * g) + (25.064 * b))),
        128.0 + (.003906 * ((112.439 * r) + (-94.154 * g) + (-18.285 * b))),
        128.0 + (.003906 * ((-37.945 * r) + (-74.494 * g) + (112.439 * b)))
    ]
}

export function yuv2freq(value: number) {
    return 1500 + (value * 3.1372549)
}

export function rgb2freq(value: number) {
    return yuv2freq(value)
}

export function* scanlineGenerator(buffer: Buffer, colorspace: 'rgb' | 'yuv', info: OutputInfo, map?: (value: number, channel: number) => number): Generator<[scanLine: number[][], lineNumber: number]> {
    for (let i = 0; i < info.height; +i) {
        const scans: number[][] = [[], [], []];
        for (let v = 0; v < info.width; ++v) {
            const offset = (i * info.width + v) * info.channels;

            if (colorspace == 'yuv') {
                const pixel: [number, number, number] = [0, 0, 0];
                for (let x = 0; x < 3; ++x) {
                    pixel[x] = buffer[offset + x];
                }
                const yuv = rgb2yuv(...pixel);
                for (let x = 0; x < 3; ++x) {
                    scans[x].push(map ? map(yuv[x], x) : yuv[x]);
                }
            } else if (colorspace == 'rgb') {
                for (let x = 0; x < 3; ++x) {
                    const value = buffer[offset + x];
                    scans[x].push(map ? map(value, x) : value);
                }
            }
        }
        
        yield[ scans, i ];
    }
}