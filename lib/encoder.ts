import sharp from 'sharp'
import { mode, pcmFormat, encoderOptions, objectFit, sampleFunction } from './types'
import { getEncoder } from '../encoders'

export default class encoder {
    sampleRate: number
    pcmFormat: pcmFormat
    objectFit: objectFit
    resizeImage: boolean

    samples: number[]
    phase: number

    constructor(options: encoderOptions = {}) {
        this.sampleRate = options.sampleRate ?? 44100
        this.pcmFormat = options.pcmFormat ?? pcmFormat.UNSIGNED_16_LE
        this.objectFit = options.objectFit ?? 'cover'
        this.resizeImage = options.resizeImage ?? true

        this.samples = []
        this.phase = 0
    }

    private reset() {
        this.samples = []
        this.phase = 0
    }

    // this logic was mostly transcribed from echicken/node-sstv
    private sample: sampleFunction = (frequency: number, duration: number | null) => {
        const n_samples = duration ? (this.sampleRate * (duration / 1000.0)) : 1
        for (let i = 0; i < n_samples; ++i) {
            this.samples.push(Math.sin(this.phase))
            this.phase += (2 * Math.PI * frequency) / this.sampleRate
            if (this.phase > (2 * Math.PI)) this.phase -= 2 * Math.PI
        }
    }

    async encode(selectedMode: mode, image: string | Buffer | sharp.Sharp): Promise<Buffer> {
        this.reset()

        // get the sharp image
        console.time('image.load')
        let img: sharp.Sharp
        if (typeof image === 'string' || Buffer.isBuffer(image)) img = sharp(image)
        else img = image // assume it is a sharp.Sharp otherwise
        console.timeEnd('image.load')

        // encode the image
        console.time('encode')
        await getEncoder(selectedMode)!(
            selectedMode,
            img,
            this.resizeImage ? this.objectFit : null,
            this.sample.bind(this),
            this.sampleRate
        )
        console.timeEnd('encode')

        // @TODO: create a sample writer
        console.time('buffer.aloc')
        const buffer = Buffer.alloc(this.samples.length * 4)
        console.timeEnd('buffer.aloc')
        console.time('buffer.write')
        for (const i in this.samples) {
            const sample = this.samples[i]
            buffer.writeFloatLE(sample, parseInt(i, 10) * 4)
        }
        console.timeEnd('buffer.write')
        return buffer
    }
}