import { FC, PropsWithChildren } from 'react'

export const GameLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="h-full w-full overflow-x-hidden overflow-y-auto p-3 md:p-6 xl:p-8">
    {children}
  </div>
)
