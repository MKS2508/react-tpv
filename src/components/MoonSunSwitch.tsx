import React from 'react'
import styles from './MoonSunSwitch.module.css'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

type DarkModeToggleProps = {
    isDarkMode: boolean
    toggleDarkMode: () => void
    size?: Size
}

const sizeClasses: Record<Size, string> = {
    'xs': 'w-8 h-4',
    'sm': 'w-10 h-5',
    'md': 'w-12 h-6',
    'lg': 'w-14 h-7',
    'xl': 'w-16 h-8',
    '2xl': 'w-20 h-10'
}

const containerSizeClasses: Record<Size, string> = {
    'xs': 'w-16 h-16',
    'sm': 'w-18 h-18',
    'md': 'w-20 h-20',
    'lg': 'w-24 h-24',
    'xl': 'w-28 h-28',
    '2xl': 'w-32 h-32'
}

const MoonSunSwitch: React.FC<DarkModeToggleProps> = ({ isDarkMode, toggleDarkMode, size = 'md' }) => {
    const switchSize = sizeClasses[size]
    const containerSize = containerSizeClasses[size]

    return (
        <div className={`flex items-center justify-center bg-transparent text-foreground ${containerSize}`}>
            <label className={`${styles.container} relative inline-block ${switchSize}`}>
                <input
                    type="checkbox"
                    className="opacity-0 w-0 h-0"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                />
                <span className={`${styles.slider} ${styles.round} absolute cursor-pointer inset-0 bg-gradient-to-b from-sky-400 to-cyan-800 shadow-inner transition-all duration-400 overflow-hidden z-[1] rounded-full`}>
                    <div className={`${styles.background} absolute w-1.5 h-1.5 bg-white rounded-full bottom-0 right-0 transition-all duration-400`}></div>
                    <div className={`${styles.star} scale-0 transition-all duration-400`}></div>
                    <div className={`${styles.star} scale-0 transition-all duration-400`}></div>
                </span>
            </label>
        </div>
    )
}

export default MoonSunSwitch