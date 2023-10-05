import { FC, PropsWithChildren } from 'react'

export const Paragraph: FC<PropsWithChildren & { className?: string }> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={`rounded-md border-b-2 border-black bg-[#41403d] p-4 font-black text-opacity-80 transition-all hover:bg-[#4c4b47] ${className}`}
      {...props}
    >
      {children}
    </p>
  )
}
