// Live Weather and Atmospheric Tone Service with Real Device Geolocation for Mixed Signals

export type WeatherConditionType = 
  | 'clear_night'
  | 'sunset_warmth'
  | 'rainy_drizzle'
  | 'heavy_storm'
  | 'foggy_overcast'
  | 'sunny_day';

export interface WeatherToneData {
  condition: WeatherConditionType;
  conditionLabel: string;
  cityName: string;
  temperatureC: number;
  rainIntensity: number; // 0.0 to 1.0
  visualTone: {
    overlayFilter: string;
    ambientTint: string;
    glowMultiplier: number;
    brightness: number;
  };
  isDaytime: boolean;
  hasThunder: boolean;
}

/**
 * Extracts a friendly city & region name from the browser's device timezone
 * e.g. "Asia/Karachi" -> "Karachi", "America/New_York" -> "New York", "Europe/London" -> "London"
 */
export function getDeviceLocalCity(): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone) return 'Local Station';
    
    const parts = timeZone.split('/');
    if (parts.length >= 2) {
      const city = parts[parts.length - 1].replace(/_/g, ' ');
      return city;
    }
    return timeZone;
  } catch {
    return 'Local Station';
  }
}

export const WEATHER_PRESETS: WeatherToneData[] = [
  {
    condition: 'clear_night',
    conditionLabel: 'Clear Starry Night',
    cityName: getDeviceLocalCity(),
    temperatureC: 22,
    rainIntensity: 0,
    visualTone: {
      overlayFilter: 'saturate(1.1) contrast(1.08)',
      ambientTint: 'rgba(6, 182, 212, 0.08)',
      glowMultiplier: 1.0,
      brightness: 0.98,
    },
    isDaytime: false,
    hasThunder: false,
  },
  {
    condition: 'rainy_drizzle',
    conditionLabel: 'Midnight Rain Drizzle',
    cityName: getDeviceLocalCity(),
    temperatureC: 18,
    rainIntensity: 0.45,
    visualTone: {
      overlayFilter: 'hue-rotate(-5deg) saturate(1.15) contrast(1.1)',
      ambientTint: 'rgba(56, 189, 248, 0.10)',
      glowMultiplier: 1.1,
      brightness: 0.95,
    },
    isDaytime: false,
    hasThunder: false,
  },
  {
    condition: 'heavy_storm',
    conditionLabel: 'Late Night Thunderstorm',
    cityName: getDeviceLocalCity(),
    temperatureC: 16,
    rainIntensity: 0.85,
    visualTone: {
      overlayFilter: 'hue-rotate(15deg) saturate(0.95) contrast(1.2)',
      ambientTint: 'rgba(99, 102, 241, 0.14)',
      glowMultiplier: 1.25,
      brightness: 0.90,
    },
    isDaytime: false,
    hasThunder: true,
  },
  {
    condition: 'sunset_warmth',
    conditionLabel: 'Golden Sunset Dusk',
    cityName: getDeviceLocalCity(),
    temperatureC: 26,
    rainIntensity: 0,
    visualTone: {
      overlayFilter: 'sepia(0.18) saturate(1.25) hue-rotate(-10deg)',
      ambientTint: 'rgba(251, 146, 60, 0.12)',
      glowMultiplier: 1.15,
      brightness: 1.0,
    },
    isDaytime: true,
    hasThunder: false,
  },
  {
    condition: 'foggy_overcast',
    conditionLabel: 'Moody Midnight Mist',
    cityName: getDeviceLocalCity(),
    temperatureC: 15,
    rainIntensity: 0.15,
    visualTone: {
      overlayFilter: 'saturate(0.9) contrast(1.05)',
      ambientTint: 'rgba(148, 163, 184, 0.10)',
      glowMultiplier: 0.95,
      brightness: 0.92,
    },
    isDaytime: false,
    hasThunder: false,
  },
];

class WeatherService {
  private cachedWeather: WeatherToneData | null = null;
  private isFetching: boolean = false;

  /**
   * Determine weather automatically based on device hour and real local city
   */
  public getAutoWeatherForCurrentHour(customCityName?: string): WeatherToneData {
    const hour = new Date().getHours();
    const localCity = customCityName || getDeviceLocalCity();
    
    // Dawn / Morning (6 to 11)
    if (hour >= 6 && hour < 12) {
      return {
        condition: 'sunny_day',
        conditionLabel: 'Morning Clarity',
        cityName: localCity,
        temperatureC: 22,
        rainIntensity: 0,
        visualTone: {
          overlayFilter: 'saturate(1.15) contrast(1.05)',
          ambientTint: 'rgba(254, 240, 138, 0.08)',
          glowMultiplier: 1.05,
          brightness: 1.02,
        },
        isDaytime: true,
        hasThunder: false,
      };
    }

    // Afternoon / Sunset Dusk (17 to 20)
    if (hour >= 17 && hour < 21) {
      return {
        ...WEATHER_PRESETS[3],
        cityName: localCity,
      };
    }

    // Late night / Midnight (21 to 5)
    return {
      ...WEATHER_PRESETS[0],
      cityName: localCity,
    };
  }

  /**
   * Automatically attempts to detect device geolocation and fetch live real-world weather
   */
  public async detectRealDeviceWeather(): Promise<WeatherToneData> {
    if (this.cachedWeather) return this.cachedWeather;
    if (this.isFetching) return this.getAutoWeatherForCurrentHour();

    this.isFetching = true;
    const defaultCity = getDeviceLocalCity();

    try {
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 600000,
          });
        }).catch(() => null);

        if (position && position.coords) {
          const { latitude, longitude } = position.coords;
          // Free Open-Meteo API
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code&timezone=auto`
          );

          if (response.ok) {
            const data = await response.json();
            const temp = Math.round(data.current?.temperature_2m ?? 22);
            const isDay = Boolean(data.current?.is_day);
            const weatherCode = data.current?.weather_code ?? 0;
            const isRain = weatherCode >= 51 && weatherCode <= 82;
            const isThunder = weatherCode >= 95;

            let condition: WeatherConditionType = 'clear_night';
            let label = 'Clear Night Sky';
            let rainIntensity = 0;

            if (isThunder) {
              condition = 'heavy_storm';
              label = 'Thunderstorm';
              rainIntensity = 0.85;
            } else if (isRain) {
              condition = 'rainy_drizzle';
              label = 'Rain Drizzle';
              rainIntensity = 0.45;
            } else if (isDay) {
              condition = 'sunny_day';
              label = 'Sunny Sky';
            } else {
              condition = 'clear_night';
              label = 'Clear Night Sky';
            }

            const tone = WEATHER_PRESETS.find(p => p.condition === condition) || WEATHER_PRESETS[0];

            this.cachedWeather = {
              condition,
              conditionLabel: label,
              cityName: defaultCity,
              temperatureC: temp,
              rainIntensity,
              visualTone: tone.visualTone,
              isDaytime: isDay,
              hasThunder: isThunder,
            };

            this.isFetching = false;
            return this.cachedWeather;
          }
        }
      }
    } catch {
      // Fallback seamlessly to device time based local weather
    }

    this.isFetching = false;
    this.cachedWeather = this.getAutoWeatherForCurrentHour(defaultCity);
    return this.cachedWeather;
  }

  /**
   * Fetches live station weather preset or auto-detected
   */
  public async fetchLiveStationWeather(presetIndex?: number): Promise<WeatherToneData> {
    if (presetIndex !== undefined && WEATHER_PRESETS[presetIndex]) {
      return {
        ...WEATHER_PRESETS[presetIndex],
        cityName: getDeviceLocalCity(),
      };
    }
    return this.detectRealDeviceWeather();
  }
}

export const weatherService = new WeatherService();
