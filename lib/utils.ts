import { Sharp } from "sharp";
import { objectFit, sampleFunction } from "./types";

export function rgb2yuv(r: number, g: number, b: number): number[]{
    return [
        16.0 + (.003906 * ((65.738 * r) + (129.057 * g) + (25.064 * b))),
        128.0 + (.003906 * ((112.439 * r) + (-94.154 * g) + (-18.285 * b))),
        128.0 + (.003906 * ((-37.945 * r) + (-74.494 * g) + (112.439 * b)))
    ]
}

export function yuv2freq(value: number){
    return 1500 + (value * 3.1372549)
}