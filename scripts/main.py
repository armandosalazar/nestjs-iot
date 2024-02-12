import sys
from joblib import load

humidity = int(sys.argv[1])
temperature = round(float(sys.argv[2]), 2)

weather_model = load('models/weather.joblib')
precipitation_model = load('models/precipitation.joblib')

data = {
    'humidity': humidity,
    'temperature': temperature,
    'weather': list(weather_model.predict([[humidity, temperature]])[0])[0],
    'description': list(weather_model.predict([[humidity, temperature]])[0])[1],
    'precipitation': round(precipitation_model.predict([[humidity, temperature]])[0], 2)
}

print(data, end='')
