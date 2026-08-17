import { useState, useEffect, useCallback, useRef } from 'react';

export function useLiveStationState(onSleepTimerExpire?: () => void) {
  // 1. Real-time Live Clock with rich precision components & fluid microsecond count
  const [liveTime, setLiveTime] = useState({
    time12: '',
    timeFull: '',
    timeTag: '',
    hours: '12',
    minutes: '00',
    seconds: '00',
    micro: '00',
    ampm: 'PM',
    dayName: 'SUN',
    dateFormatted: '',
    timezone: '',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time12 = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      const timeFull = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const timeTag = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      
      let rawHours = now.getHours();
      const ampm = rawHours >= 12 ? 'PM' : 'AM';
      rawHours = rawHours % 12 || 12;
      const hours = rawHours.toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const ms = now.getMilliseconds();
      const micro = Math.floor(ms / 10).toString().padStart(2, '0');
      
      const dayName = now.toLocaleDateString([], { weekday: 'short' }).toUpperCase();
      const dateFormatted = now.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.replace('_', ' ') || 'LOCAL';

      setLiveTime({
        time12,
        timeFull,
        timeTag,
        hours,
        minutes,
        seconds,
        micro,
        ampm,
        dayName,
        dateFormatted,
        timezone,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 35);
    return () => clearInterval(interval);
  }, []);

  // 2. Realistic Organic Online Listeners Counter (as requested in reference screenshot)
  const [onlineListeners, setOnlineListeners] = useState(318);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineListeners((prev) => {
        // Random organic walk between 295 and 385
        const delta = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
        let next = prev + delta;
        if (next < 295) next = 300 + Math.floor(Math.random() * 10);
        if (next > 385) next = 380 - Math.floor(Math.random() * 10);
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // 3. Sleep / Break Focus Timer (e.g. 15m, 30m, 45m, 60m)
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number | null>(null);
  const [initialSleepMinutes, setInitialSleepMinutes] = useState<number | null>(null);

  const setSleepTimer = useCallback((minutes: number | null) => {
    if (minutes === null || minutes <= 0) {
      setSleepSecondsLeft(null);
      setInitialSleepMinutes(null);
    } else {
      setSleepSecondsLeft(minutes * 60);
      setInitialSleepMinutes(minutes);
    }
  }, []);

  const onExpireRef = useRef(onSleepTimerExpire);
  useEffect(() => {
    onExpireRef.current = onSleepTimerExpire;
  }, [onSleepTimerExpire]);

  useEffect(() => {
    if (sleepSecondsLeft === null) return;

    if (sleepSecondsLeft <= 0) {
      setSleepSecondsLeft(null);
      setInitialSleepMinutes(null);
      if (onExpireRef.current) {
        onExpireRef.current();
      }
      return;
    }

    const timer = setInterval(() => {
      setSleepSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepSecondsLeft]);

  const formattedSleepTimer = sleepSecondsLeft !== null
    ? `${Math.floor(sleepSecondsLeft / 60)}:${(sleepSecondsLeft % 60).toString().padStart(2, '0')}`
    : null;

  // 4. Fullscreen Mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        // Fallback for iframe constraints
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return {
    liveTime,
    onlineListeners,
    sleepSecondsLeft,
    initialSleepMinutes,
    formattedSleepTimer,
    setSleepTimer,
    isFullscreen,
    toggleFullscreen,
  };
}
