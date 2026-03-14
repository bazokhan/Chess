import { FC, PropsWithChildren } from 'react'

export const GameLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="h-full w-full overflow-x-hidden overflow-y-auto p-2 md:p-4 xl:overflow-y-hidden xl:p-4">
    {children}
  </div>
)
