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
      className={`flex items-center justify-start rounded-md border-b-2 border-black ${
        active ? (hideCheck ? 'bg-green-900' : 'bg-[#4c4b47]') : 'bg-[#41403d]'
      } p-4 font-black text-white text-opacity-80 transition-all hover:bg-[#4c4b47] ${className}`}
      {...props}
    >
      {children}
      {active && !hideCheck ? (
        <FaCheck className="ml-auto mr-0 text-green-500" />
      ) : null}
    </button>
  )
}
