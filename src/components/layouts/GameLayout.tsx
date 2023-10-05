import { Children, FC, PropsWithChildren } from 'react'

export const GameLayout: FC<PropsWithChildren> = ({ children }) => (
  <div
    className="grid h-full w-full justify-center gap-8 p-20"
    style={{
      gridTemplateColumns: `repeat(${Children.count(children)}, auto)`
    }}
  >
    {children}
  </div>
)
