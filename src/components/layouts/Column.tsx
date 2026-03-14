import { FC, PropsWithChildren } from 'react'

export const Column: FC<
  PropsWithChildren & { width?: number; className?: string }
> = ({
  children,
  width,
  className
}) => (
  <div
    className={`flex flex-col gap-2 rounded-xl border border-[#5a5750] bg-[#35342f] p-4 text-[#d2cdc3] shadow-[0_8px_30px_rgba(0,0,0,0.25)] ${className ?? ''}`}
    style={width ? { width: `${width}px` } : {}}
  >
    {children}
  </div>
)
