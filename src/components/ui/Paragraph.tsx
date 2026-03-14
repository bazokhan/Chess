import { FC, HTMLAttributes, PropsWithChildren } from 'react'

export const Paragraph: FC<
  PropsWithChildren & HTMLAttributes<HTMLParagraphElement> & { className?: string }
> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={`rounded-lg border border-[#5b5750] bg-[#3f3d38] p-3 text-sm font-semibold text-[#ddd8ce] transition-colors hover:bg-[#535046] ${className}`}
      {...props}
    >
      {children}
    </p>
  )
}
