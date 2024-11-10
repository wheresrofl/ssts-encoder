import { encoderFunction, mode } from "../lib/types"
import robotEncoder from "./robot"
import wrasseEncoder from "./wrasse"


const modeToEncoderMapping: { [key in mode]: encoderFunction } = {
    [mode.ROBOT_36]: robotEncoder,
    [mode.ROBOT_72]: robotEncoder,
    [mode.SC2_180]: wrasseEncoder
}

export function getEncoder(selectedMode: mode): encoderFunction | null {
    return modeToEncoderMapping[selectedMode] ?? null
}