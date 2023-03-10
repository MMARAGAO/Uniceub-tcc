import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Button, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/FontAwesome";

const API_KEY = "452df1420641110cce47849f0de42d25";

export default function App() {
  const [location, setLocation] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [searchText, setSearchText] = React.useState("");
  const [markers, setMarkers] = React.useState([]);
  const [weatherData, setWeatherData] = React.useState(null);
  const mapRef = React.useRef(null);

  const searchLocation = async () => {
    if (!searchText) return;
    const result = await Location.geocodeAsync(searchText);
    if (result.length > 0) {
      setMarkers([result[0]]);
      mapRef.current.animateToRegion(
        {
          latitude: result[0].latitude,
          longitude: result[0].longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        1000
      );
      fetchWeatherData(result[0].latitude, result[0].longitude);
    }
  };

  async function fetchWeatherData(lat, lon) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=pt_br&units=metric`
    );
    const data = await response.json();
    setWeatherData(data);
  }

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permissão para acessar a localização foi negada");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      fetchWeatherData(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* status bar sem aparecer os icones e trasnparente */}
      <StatusBar style="auto" hidden={true} translucent={true} />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar localização"
          onChangeText={setSearchText}
          onSubmitEditing={searchLocation}
        />
        <Button title="Pesquisar" onPress={searchLocation} />
      </View>
      {location ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Minha localização"
            >
              <Icon name="map-marker" size={50} color="blue" />
            </Marker>
            {markers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={searchText}
              >
                <Icon name="map-marker" size={50} color="red" />
              </Marker>
            ))}
          </MapView>
          {weatherData && (
            <View style={styles.weatherContainer}>
              <Text>Temperatura: {weatherData.main.temp} °C</Text>
              <Text>Umidade: {weatherData.main.humidity}%</Text>
              <Text>Velocidade do vento: {weatherData.wind.speed} m/s</Text>
              <Text>
                Nascer do sol:{" "}
                {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}
              </Text>
              <Text>
                Pôr do sol:{" "}
                {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}
              </Text>
              <Text>Pressão: {weatherData.main.pressure} hPa</Text>
              <Text>Sensação térmica: {weatherData.main.feels_like} °C</Text>
              <Text>Descrição: {weatherData.weather[0].description}</Text>
            </View>
          )}
        </>
      ) : (
        <Text>{errorMsg || "Carregando..."}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  map: {
    flex: 1,
  },
  weatherContainer: {
    backgroundColor: "#f0f0f0",
    padding: 10,
  },
});
