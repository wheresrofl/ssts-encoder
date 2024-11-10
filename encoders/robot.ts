import { encoderFunction, mode, sampleTuple } from '../lib/types'
import { rgb2yuv, scanlineGenerator, yuv2freq } from '../lib/utils'

const robotEncoder: encoderFunction = async (selectedMode, img, encoder) => {
    if(encoder.resizeImage) img.resize(320, 240, {fit: encoder.objectFit}) 
        const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })

    if(selectedMode == mode.ROBOT_36) encoder.sampleCalibrate(8)
    else if(selectedMode == mode.ROBOT_72) encoder.sampleCalibrate(12)

    let yScanDuration: number, uvScanDuration: number, porchFreq: number

    if(selectedMode == mode.ROBOT_36){
        yScanDuration = 88
        uvScanDuration = 44
        porchFreq = 1500
    }else if(selectedMode == mode.ROBOT_72){
        yScanDuration = 138
        uvScanDuration = 69
        porchFreq = 1900
    }else{
        throw Error('Invalid ROBOT mode')
    }
    
    const
        syncPulse: sampleTuple = [ 1200, 9 ],
        syncPorch: sampleTuple = [ 1500, 3 ],
        separationPulse: sampleTuple = [ 1500, 4.5 ],
        oddSeparationPulse: sampleTuple = [ 2300, 4.5 ],
        porch: sampleTuple = [ porchFreq, 1.5 ]

    const
        ySamples = encoder.sampleRate * (yScanDuration / 1000.0),
        yScale = info.width / ySamples,
        uvSamples = encoder.sampleRate * (uvScanDuration / 1000.0),
        uvScale = info.width / uvSamples
    
    function scanLine(line: number[], n_samples: number, scale: number){
        for(let i = 0; i < n_samples; ++i)
            encoder.sample(line[Math.floor(scale * i)], null)
    }

    for(const [scanline, y] of scanlineGenerator(data, 'yuv', info, yuv2freq)){
        const isEven = y % 2 == 0

        
        encoder.sample(...syncPulse)
        encoder.sample(...syncPorch)
        scanLine(scanline[0], ySamples, yScale)

        if(selectedMode == mode.ROBOT_36){
            // similar to node-sstv, no averaging is taking place -- too much work

            // {u,v}-scan | scan U on even and Y on odds
            encoder.sample(...(isEven ? separationPulse : oddSeparationPulse))
            encoder.sample(...porch)
            scanLine(scanline[isEven ? 1 : 2], uvSamples, uvScale)
        }else if(selectedMode == mode.ROBOT_72){
            // u-scan
            encoder.sample(...separationPulse)
            encoder.sample(...porch)
            scanLine(scanline[1], uvSamples, uvScale)

            // v-scan
            encoder.sample(...separationPulse)
            encoder.sample(...porch)
            scanLine(scanline[2], uvSamples, uvScale)
        }
    }
}
export default robotEncoder