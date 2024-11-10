import { encoderFunction, mode } from "../lib/types"
import RobotEncoder from "./robot"

const modeToEncoderMapping: { [key in mode]: encoderFunction } = {
    [mode.ROBOT_36  ]: RobotEncoder,
    [mode.ROBOT_72  ]: RobotEncoder,
}

export function getEncoder(selectedMode: mode): encoderFunction | null {
    return modeToEncoderMapping[selectedMode] ?? null
}