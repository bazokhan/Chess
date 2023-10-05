import { FC, PropsWithChildren } from 'react'

export const Column: FC<PropsWithChildren & { width?: number }> = ({
  children,
  width
}) => (
  <div
    className="flex flex-col gap-2 rounded-md bg-[#383734] p-4 text-[#9c9b9a]"
    style={width ? { width: `${width}px` } : {}}
  >
    {children}
  </div>
)
