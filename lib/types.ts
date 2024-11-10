import { Sharp } from "sharp";
import encoder from "./encoder";

// fitEnum
export type objectFit = 'cover' | 'contain' | 'inside' | 'outside';

export enum mode {
    // ROBOT modes
    ROBOT_36,
    ROBOT_72,

    // @TODO: add more
}

export enum pcmFormat {
    UNSIGNED_8,
    UNSIGNED_16_LE,
    UNSIGNED_16_BE,
    UNSIGNED_24_LE,
    UNSIGNED_24_BE,
    UNSIGNED_32_LE,
    UNSIGNED_32_BE,

    SIGNED_8,
    SIGNED_16_LE,
    SIGNED_16_BE,
    SIGNED_24_LE,
    SIGNED_24_BE,
    SIGNED_32_LE,
    SIGNED_32_BE,

    FLOAT_32_LE,
    FLOAT_32_BE,
    FLOAT_64_LE,
    FLOAT_64_BE
}

export type encoderOptions = {
    sampleRate?: number;
    pcmFormat?: pcmFormat;
    objectFit?: objectFit;
    resizeImage?: boolean;
}

export type sampleFunction = (frequency: number, duration: number | null) => void;

export type sampleTuple = [number, number];

export type encoderFunction = (mode: mode, image: Sharp, encoder: encoder) => Promise<void>