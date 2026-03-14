import { FC, PropsWithChildren } from 'react'

export const GameLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="h-full w-full overflow-hidden p-2 md:p-4">
    {children}
  </div>
)
