import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react'
import { FaCheck } from 'react-icons/fa'

export const Switch: FC<
  PropsWithChildren &
    ButtonHTMLAttributes<HTMLButtonElement> & {
      active: boolean
      hideCheck?: boolean
    }
> = ({ children, className, active, hideCheck, ...props }) => {
  return (
    <button
      className={`flex items-center justify-start gap-2 rounded-lg border border-[#5b5750] ${
        active
          ? hideCheck
            ? 'bg-[#1e5f48] text-[#e2fff4]'
            : 'bg-[#4f4c44] text-[#f2ece0]'
          : 'bg-[#3f3d38] text-[#d8d3c8]'
      } p-3 text-sm font-semibold transition-all duration-200 hover:border-[#7b766d] hover:bg-[#57534a] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8bfa8] ${className}`}
      {...props}
    >
      {children}
      {active && !hideCheck ? (
        <FaCheck className="ml-auto mr-0 text-green-400" />
      ) : null}
    </button>
  )
}
