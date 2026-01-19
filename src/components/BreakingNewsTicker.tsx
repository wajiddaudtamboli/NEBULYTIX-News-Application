import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Radio, TrendingUp, Clock, Zap } from 'lucide-react'

interface BreakingNewsItem {
  id: string
  title: string
  category?: string
  timestamp?: string
  isLive?: boolean
}

interface BreakingNewsTickerProps {
  news: BreakingNewsItem[]
  speed?: number
}

export function BreakingNewsTicker({ news, speed = 35 }: BreakingNewsTickerProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  if (!news || news.length === 0) return null

  // Duplicate news items for seamless infinite scroll
  const duplicatedNews = [...news, ...news, ...news]

  return (
    <div 
      className="breaking-ticker relative z-40 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Breaking News Label - Fixed left */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-3 bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-4 sm:px-6 shadow-xl border-r-2 border-red-800">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="flex items-center justify-center"
        >
          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </motion.div>
        <div className="hidden sm:flex flex-col">
          <span className="font-black text-white text-sm tracking-widest uppercase leading-none">
            BREAKING
          </span>
          <span className="text-[10px] text-white/70 uppercase tracking-wide">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <span className="sm:hidden font-black text-white text-xs tracking-wider uppercase">
          LIVE
        </span>
      </div>

      {/* Ticker Content */}
      <div className="overflow-hidden ml-24 sm:ml-36">
        <motion.div
          className="flex items-center gap-10 sm:gap-14 py-2.5 sm:py-3"
          animate={{
            x: isHovered ? 0 : [0, -33.33 + '%'],
          }}
          transition={{
            x: {
              duration: speed,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
          style={{ animationPlayState: isHovered ? 'paused' : 'running' }}
        >
          {duplicatedNews.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex items-center gap-3 sm:gap-4 whitespace-nowrap shrink-0"
            >
              {/* Live indicator */}
              {item.isLive && (
                <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/15 rounded text-[11px] font-bold uppercase tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  LIVE
                </span>
              )}
              
              {/* News Title */}
              <span className="text-sm sm:text-base font-semibold text-white tracking-wide">
                {item.title}
              </span>
              
              {/* Timestamp */}
              {item.timestamp && (
                <span className="hidden md:flex items-center gap-1 text-xs text-white/60 font-medium">
                  <Clock className="h-3 w-3" />
                  {item.timestamp}
                </span>
              )}
              
              {/* Separator */}
              <span className="text-white/30 text-lg mx-1">|</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right fade gradient */}
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-red-600 via-red-600/80 to-transparent pointer-events-none" />
    </div>
  )
}

// Compact version for secondary breaking news
export function BreakingNewsBar({ news }: { news: BreakingNewsItem[] }) {
  if (!news || news.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
      <div className="content-container py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Radio className="h-4 w-4" />
            </motion.div>
            <span className="text-xs font-bold uppercase tracking-wider">Breaking</span>
          </div>
          
          <div className="overflow-hidden flex-1">
            <motion.div
              className="flex items-center gap-8 whitespace-nowrap"
              animate={{ x: [0, -100 + '%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              {[...news, ...news].map((item, i) => (
                <span key={`${item.id}-${i}`} className="text-sm font-medium">
                  {item.title}
                  <span className="mx-4 text-white/40">|</span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
