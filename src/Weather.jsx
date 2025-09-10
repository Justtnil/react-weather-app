import React, { useState, useEffect, useRef } from 'react';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Sun, CloudRain, Snowflake, ArrowLeft, ArrowRight } from 'lucide-react';

const API_KEY = "9b4713533cc247acb7f163824251009";

export default function Weather() {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [forecastDays, setForecastDays] = useState(7);

    // Refs for scrollable divs
    const hourlyRef = useRef(null);
    const dailyRef = useRef(null);

    // State for hiding/showing arrows
    const [hourlyScroll, setHourlyScroll] = useState({ left: false, right: true });
    const [dailyScroll, setDailyScroll] = useState({ left: false, right: true });

    const fetchWeather = async () => {
        if (!city) return;

        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=${forecastDays}`
            );
            if (!response.ok) throw new Error('City not found');
            const data = await response.json();
            setWeather(data);
        } catch (error) {
            setError(error.message);
            setWeather(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (city) fetchWeather();
    }, [forecastDays]);

    const getWeatherIcon = (condition) => {
        if (condition.includes('Sunny') || condition.includes('Clear')) {
            return <Sun className="w-10 h-10 text-yellow-400 mx-auto" />;
        }
        if (condition.includes('Rain')) {
            return <CloudRain className="w-10 h-10 text-blue-400 mx-auto" />;
        }
        if (condition.includes('Snow')) {
            return <Snowflake className="w-10 h-10 text-blue-300 mx-auto" />;
        }
        return null;
    };

    // Scroll function with arrow visibility update
    const scrollHorizontally = (ref, distance, type) => {
        if (ref.current) {
            ref.current.scrollBy({
                left: distance,
                behavior: 'smooth',
            });
            setTimeout(() => updateScrollState(ref, type), 300); // wait for smooth scroll
        }
    };

    // Update arrow visibility based on scroll position
    const updateScrollState = (ref, type) => {
        if (!ref.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = ref.current;
        const scrollInfo = {
            left: scrollLeft > 0,
            right: scrollLeft < scrollWidth - clientWidth - 1,
        };
        if (type === 'hourly') setHourlyScroll(scrollInfo);
        else if (type === 'daily') setDailyScroll(scrollInfo);
    };

    // Add scroll listener to update arrows dynamically
    const attachScrollListener = (ref, type) => {
        if (!ref.current) return;
        ref.current.addEventListener('scroll', () => updateScrollState(ref, type));
    };

    useEffect(() => {
        attachScrollListener(hourlyRef, 'hourly');
        attachScrollListener(dailyRef, 'daily');
    }, [weather]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4 flex justify-center">
            <Card className="max-w-full w-auto p-8 bg-white rounded-xl shadow-lg">
                <h1 className="text-2xl font-semibold text-center text-blue-600 mb-6">
                    Weather App
                </h1>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <Input
                        type="text"
                        placeholder="Enter city name"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded text-center"
                    />
                    <Button
                        onClick={fetchWeather}
                        className="bg-blue-600 text-white px-5 py-3 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Search'}
                    </Button>
                </div>

                <div className="flex justify-center gap-4 mb-6">
                    {[7, 14].map((days) => (
                        <Button
                            key={days}
                            onClick={() => setForecastDays(days)}
                            className={`px-4 py-2 rounded ${
                                forecastDays === days ? 'bg-blue-700 text-white' : 'bg-gray-200'
                            }`}
                        >
                            {days} Days
                        </Button>
                    ))}
                </div>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {weather && (
                    <>
                        <div className="text-center mt-6">
                            {getWeatherIcon(weather.current.condition.text)}
                            <h2 className="text-xl font-semibold mt-4">
                                {weather.location.name}, {weather.location.country}
                            </h2>
                            <p className="text-4xl font-bold text-blue-600 mt-2">
                                {weather.current.temp_c} °C
                            </p>
                            <p className="text-lg text-gray-700 mt-1">
                                {weather.current.condition.text}
                            </p>
                        </div>

                        {/* Hourly Forecast (24 hrs) */}
                        <h3 className="text-lg font-semibold mt-6 text-center">Hourly Forecast (24 hrs)</h3>
                        <div className="relative mt-4 flex items-center">
                            {hourlyScroll.left && (
                                <button
                                    className="absolute left-0 z-10 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                                    onClick={() => scrollHorizontally(hourlyRef, -160, 'hourly')}
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                            )}

                            <div
                                ref={hourlyRef}
                                className="flex gap-4 overflow-x-auto p-2 scroll-smooth"
                            >
                                {weather.forecast.forecastday[0].hour.map((hour) => (
                                    <Card key={hour.time} className="min-w-[160px] p-3 bg-blue-50 rounded shadow text-center flex-shrink-0">
                                        <p className="font-semibold text-sm">
                                            {new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {getWeatherIcon(hour.condition.text)}
                                        <p className="text-blue-600 font-bold">
                                            {hour.temp_c} °C
                                        </p>
                                        <p className="text-gray-600 text-xs">
                                            {hour.condition.text}
                                        </p>
                                    </Card>
                                ))}
                            </div>

                            {hourlyScroll.right && (
                                <button
                                    className="absolute right-0 z-10 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                                    onClick={() => scrollHorizontally(hourlyRef, 160, 'hourly')}
                                >
                                    <ArrowRight className="w-5 h-5 text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Multi-day Forecast (7 or 14 Days) */}
                        <h3 className="text-lg font-semibold mt-6 text-center">Forecast</h3>
                        <div className="relative mt-4 flex items-center">
                            {dailyScroll.left && (
                                <button
                                    className="absolute left-0 z-10 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                                    onClick={() => scrollHorizontally(dailyRef, -160, 'daily')}
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                            )}

                            <div
                                ref={dailyRef}
                                className="flex gap-4 overflow-x-auto p-2 scroll-smooth"
                            >
                                {weather.forecast.forecastday.map((day) => (
                                    <Card key={day.date} className="min-w-[160px] p-4 bg-blue-50 rounded shadow text-center flex-shrink-0">
                                        <p className="font-semibold">{day.date}</p>
                                        {getWeatherIcon(day.day.condition.text)}
                                        <p className="text-blue-600 font-bold mt-2">
                                            {day.day.avgtemp_c} °C
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            {day.day.condition.text}
                                        </p>
                                    </Card>
                                ))}
                            </div>

                            {dailyScroll.right && (
                                <button
                                    className="absolute right-0 z-10 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                                    onClick={() => scrollHorizontally(dailyRef, 160, 'daily')}
                                >
                                    <ArrowRight className="w-5 h-5 text-gray-600" />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
