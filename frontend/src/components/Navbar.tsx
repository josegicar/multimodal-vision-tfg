import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useLanguage, type LanguageCode } from '../context/LanguageContext'

export function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t, allLanguages } = useLanguage()

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-800 px-6 py-3 flex items-center justify-between transition-colors duration-500">
      
      {/* Logo / Título */}
      <div className="flex items-center gap-2">
        <img src="/chatbot.svg" alt="logo" className="w-8 h-8 rounded-full" />
        <span className="font-bold text-gray-900 dark:text-white text-lg transition-colors">{t.title}</span>
      </div>

      {/* Zona derecha Claro / Oscuro + Idioma */}
      <div className="flex items-center gap-4">
        {/* Selector de claro/oscuro */}
        <button 
          onClick={toggleTheme} 
          className="p-1.5 text-gray-500 hover:text-purple-400 dark:text-gray-400 transition-colors dark:hover:text-purple-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          title={theme === 'dark' ? t.switchToLight : t.switchToDark}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Selector de idioma */}
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="bg-white dark:bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer pr-8"
          >
            {Object.values(allLanguages).map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
        </div>
      </div>

    </nav>
  )
}