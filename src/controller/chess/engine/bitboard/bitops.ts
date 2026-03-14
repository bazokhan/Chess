const BIT_TO_INDEX = new Map<bigint, number>()

for (let i = 0; i < 64; i += 1) {
  BIT_TO_INDEX.set(1n << BigInt(i), i)
}

export const sqBit = (index: number) => 1n << BigInt(index)

export const bitScanForward = (bit: bigint) => {
  return BIT_TO_INDEX.get(bit) ?? -1
}

export const iterateBits = (board: bigint, cb: (square: number) => void) => {
  let bits = board
  while (bits) {
    const lsb = bits & -bits
    cb(bitScanForward(lsb))
    bits ^= lsb
  }
}

