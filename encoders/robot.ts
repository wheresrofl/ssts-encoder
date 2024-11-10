import { encoderFunction, mode, sampleFunction, sampleTuple } from '../lib/types';
import { resizeImage, rgb2yuv, sampleCalibrate, sstvHeader, yuv2freq } from '../lib/utils';

function scanLine(line: number[], n_samples: number, scale: number, sample: sampleFunction) {
    for (let i = 0; i < n_samples; ++i) {
        sample(line[Math.floor(scale * i)], null);
    }
}

const robotEncoder: encoderFunction = async (selectedMode, img, fit, sample, sampleRate) => {
    img = resizeImage(img, null, 240, fit);
    
    sstvHeader(sample);
    if (selectedMode == mode.ROBOT_36) sampleCalibrate(8, sample);
    else if (selectedMode == mode.ROBOT_72) sampleCalibrate(12, sample);

    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    let yScanDuration: number, uvScanDuration: number, porchFreq: number;

    if (selectedMode == mode.ROBOT_36) {
        yScanDuration = 88;
        uvScanDuration = 44;
        porchFreq = 1500;
    } else if (selectedMode == mode.ROBOT_72) {
        yScanDuration = 138;
        uvScanDuration = 69;
        porchFreq = 1900;
    } else {
        throw Error('Invalid ROBOT mode');
    }
    
    const syncPulse: sampleTuple = [1200, 9];
    const syncPorch: sampleTuple = [1500, 3];
    const separationPulse: sampleTuple = [1500, 4.5];
    const oddSeparationPulse: sampleTuple = [2300, 4.5];
    const porch: sampleTuple = [porchFreq, 1.5];

    const ySamples = sampleRate * (yScanDuration / 1000.0);
    const yScale = info.width / ySamples;
    const uvSamples = sampleRate * (uvScanDuration / 1000.0);
    const uvScale = info.width / uvSamples;
    
    for (let y = 0; y < info.height; ++y) {
        const isEven = y % 2 == 0;

        // create YUV scans: [0,1,2] -> [Y,U,V]
        const yuvScans: number[][] = [[], [], []];
        for (let x = 0; x < info.width; ++x) {
            const offset = (y * info.width + x) * info.channels;
            const yuv = rgb2yuv(data[offset], data[offset + 1], data[offset + 2]);
            for (const c in yuv) yuvScans[c].push(yuv2freq(yuv[c]));
        }

        // sync + Y-scans
        sample(...syncPulse);
        sample(...syncPorch);
        scanLine(yuvScans[0], ySamples, yScale, sample);

        if (selectedMode == mode.ROBOT_36) {
            // U,V scan: U on even, V on odd lines
            sample(...(isEven ? separationPulse : oddSeparationPulse));
            sample(...porch);
            scanLine(yuvScans[isEven ? 1 : 2], uvSamples, uvScale, sample);
        } else if (selectedMode == mode.ROBOT_72) {
            // Both U and V use separation pulse for better quality

            // U-scan
            sample(...separationPulse);
            sample(...porch);
            scanLine(yuvScans[1], uvSamples, uvScale, sample);

            // V-scan
            sample(...separationPulse);
            sample(...porch);
            scanLine(yuvScans[2], uvSamples, uvScale, sample);
        }
    }
};

export default robotEncoder;
