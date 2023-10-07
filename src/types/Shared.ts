export type Tree = {
  id: string
  evaluation: number
  next?: Tree[]
}

export type TreeGeneric<T> = T & {
  evaluation: number
  next?: TreeGeneric<T>[]
}

export type TreeSelfEvaluating<T, S> = T & {
  position?: S
  evaluation: number
  next?: TreeSelfEvaluating<T, S>[]
}
