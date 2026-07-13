export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'humid';
}

export interface StateWeather {
  stateId: string;
  name: string;
  weather: WeatherData;
}

class WeatherService {
  private readonly states: StateWeather[] = [
    { stateId: 'punjab', name: 'Punjab', weather: { temperature: 28, humidity: 65, rainfall: 10, condition: 'sunny' } },
    { stateId: 'maharashtra', name: 'Maharashtra', weather: { temperature: 32, humidity: 75, rainfall: 45, condition: 'rainy' } },
    { stateId: 'kerala', name: 'Kerala', weather: { temperature: 26, humidity: 88, rainfall: 120, condition: 'stormy' } },
    { stateId: 'rajasthan', name: 'Rajasthan', weather: { temperature: 40, humidity: 20, rainfall: 0, condition: 'sunny' } },
    { stateId: 'west-bengal', name: 'West Bengal', weather: { temperature: 30, humidity: 80, rainfall: 60, condition: 'humid' } },
    { stateId: 'tamil-nadu', name: 'Tamil Nadu', weather: { temperature: 33, humidity: 60, rainfall: 20, condition: 'cloudy' } },
    { stateId: 'assam', name: 'Assam', weather: { temperature: 29, humidity: 85, rainfall: 90, condition: 'rainy' } },
    { stateId: 'gujarat', name: 'Gujarat', weather: { temperature: 35, humidity: 50, rainfall: 5, condition: 'sunny' } },
    { stateId: 'haryana', name: 'Haryana', weather: { temperature: 31, humidity: 60, rainfall: 15, condition: 'cloudy' } },
    { stateId: 'madhya-pradesh', name: 'Madhya Pradesh', weather: { temperature: 34, humidity: 55, rainfall: 25, condition: 'sunny' } },
  ];

  async getWeatherForState(stateId: string): Promise<WeatherData | undefined> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.states.find(s => s.stateId === stateId)?.weather;
  }

  async getAllStatesWeather(): Promise<StateWeather[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.states;
  }
}

export const weatherService = new WeatherService();
