import { FC, PropsWithChildren } from 'react'

export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-b from-[#31302c] to-[#51504c] text-white">
      {children}
    </div>
  )
}
