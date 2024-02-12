from joblib import load

import sys
args = sys.argv[1:]

humidity = int(args[0])
temperature = round(float(args[1]), 2)

weather_model = load('models/weather.joblib')
precipitation_model = load('models/precipitation.joblib')

predictions = {
    'weather': list(weather_model.predict([[humidity, temperature]])[0]),
    'precipitation': precipitation_model.predict([[humidity, temperature]])[0]
}

data = {
    'humidity': humidity,
    'temperature': temperature,
    'predictions': predictions
}

print(data, end='')
