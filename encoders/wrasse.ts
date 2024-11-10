import { encoderFunction, sampleTuple } from "../lib/types";
import { rgb2freq, scanlineGenerator } from "../lib/utils";

const wrasseEncoder: encoderFunction = async (selectedMode, img, encoder) => {
    if (encoder.resizeImage) img.resize(320, 240, { fit: encoder.objectFit })
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })

    const
        syncPulse: sampleTuple = [1200, 5.5225],
        porch: sampleTuple = [1500, 0.5]

    const
        colorScanDuration = 235,
        colorScanSamples = encoder.sampleRate * (colorScanDuration / 1000),
        colorScanScale = info.width / colorScanSamples

    encoder.sampleCalibrate(55)

    for (const [scanline, y] of scanlineGenerator(data, 'rgb', info, rgb2freq)) {
        encoder.sample(...syncPulse)
        encoder.sample(...porch)

        for (let i = 0; i < 3; ++i) {
            for (let v = 0; v < colorScanSamples; ++v) {
                const freq = scanline[i][Math.floor(v * colorScanScale)]
                encoder.sample(freq, null)
            }
        }
    }
}

export default wrasseEncoder