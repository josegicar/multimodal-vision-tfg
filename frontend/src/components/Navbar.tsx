import { useLanguage, type LanguageCode } from '../context/LanguageContext'

export function Navbar() {
  const { language, setLanguage, t, allLanguages } = useLanguage()

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-gray-950 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      
      {/* Logo / Título */}
      <div className="flex items-center gap-2">
        <img src="/chatbot.svg" alt="logo" className="w-8 h-8 rounded-full" />
        <span className="font-bold text-white text-lg">{t.title}</span>
      </div>

      {/* Selector de idioma */}
      <div className="relative">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer pr-8"
        >
          {Object.values(allLanguages).map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
      </div>

    </nav>
  )
}