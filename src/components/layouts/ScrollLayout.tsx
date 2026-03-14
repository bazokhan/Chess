import { FC, PropsWithChildren } from 'react'

export const ScrollLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="h-full w-full overflow-x-hidden overflow-y-auto p-2 md:p-4">
    {children}
  </div>
)
