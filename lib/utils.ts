import { Sharp } from "sharp";
import { objectFit, sampleFunction } from "./types";

export function resizeImage(image: Sharp, width: number | null, height: number | null, objectFit: objectFit | null) {
    return objectFit != null ? image.resize(width, height, { fit: objectFit! }) : image
}

export function sampleCalibrate(visCode: number, sample: sampleFunction) {
    sample(1900, 300); // leader tone
    sample(1200, 10); // break
    sample(1900, 300); // leader tone
    sample(1200, 30); // VIS start bit

    // visCode is sent as 6-bit LSB with the 7th bit as parity
    let isEven = false;
    for (let i=0; i<7; ++i) {
        const mask = (visCode & (1 << i)) != 0;
        sample(mask ? 1100 : 1300, 30);
        if (mask) isEven = !isEven;
    }
    sample(isEven ? 1300 : 1100, 30);

    sample(1200, 30);
}

// equation copied directly from the pdf
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

export function sstvHeader(sample: sampleFunction){
    sample(1900, 100)
    sample(1500, 100)
    sample(1900, 100)
    sample(1500, 100)
    sample(2300, 100)
    sample(1500, 100)
    sample(2300, 100)
    sample(1500, 100)
}