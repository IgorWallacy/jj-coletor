import React, { useState, useEffect } from "react";
import { useFonts, Inter_900Black } from "@expo-google-fonts/inter";
import base64 from "react-native-base64";
import axios from "axios";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, Box, Button, Image, KeyboardAvoidingView } from "native-base";
import { Platform, Alert, ImageBackground } from "react-native";
import { TextInput } from "react-native-paper";

export default function Login({ navigation , route }) {
  const [usuario, setUsuario] = useState();
  const [senha, setSenha] = useState();
  const [loading, setLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState(route?.ipServidor);

  let [fontsLoaded] = useFonts({
    Inter_900Black,
  });

  useEffect(() => {
    const getBaseURLAsyncStorage = async () => {
      try {
        const value = await AsyncStorage.getItem("ip-servidor");
        if (value !== null) {
          setBaseUrl(`http://${value}:1010`);
        }
      } catch (e) {
        Alert.alert("Erro", "Não foi possível ler o ip do servidor");
      }
    };

    getBaseURLAsyncStorage();
  }, [route]); // The second argument (array) is empty to ensure it runs only once after the initial render.

  let clientId = "doks";
  let clientSecret = "1234";

  var params = {
    client: "angular",
    username: usuario?.toUpperCase(),
    password: senha,
    grant_type: "password",
  };

  var headers = {
    Authorization: "Basic " + base64.encode(`${clientId}:${clientSecret}`),
    "content-type": "application/x-www-form-urlencoded",
    "content-type": "multipart/form-data",
  };

  const api = axios.create({
    baseURL: baseUrl ? baseUrl : `http://default-url:1010`, // Provide a default value if baseUrl is not set
    headers: headers,
    params: params,
    timeout: 10000,
  });

  const login = async () => {
    try {
      setLoading(true);
      try {
        const response = await api.post("/oauth/token", { params, headers });
        const accessToken = JSON.stringify(response.data);

        try {
          await AsyncStorage.setItem("access_token", accessToken);
          navigation.navigate("Menu");
        } catch (e) {
          // saving error
        }
      } catch (e) {
        Alert.alert(
          "Erro ao realizar login",
          e?.code === "ERR_BAD_REQUEST"
            ? "Código ou senha inválidos"
            : e?.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS == "ios" ? "padding" : "height"}
      w="100%"
    >
      <Box
        flex={1}
        alignItems="center"
        justifyContent="center"
        bg={{
          linearGradient: {
            colors: ["#eb575a", "#708090"],
            start: [1, 0],
            end: [0, 0],
          },
        }}
        width="100%"
        padding={5}
      >
        <ImageBackground
          resizeMode="contain"
          source={require("../../../assets/images/logo_login.png")}
          alt="Logo"
          style={{ flex: 1, width: "100%", height: "100%" }}
        ></ImageBackground>

        <Text fontSize="md" m="0.5" color="#FFFF">
          Informe sua conta uniplus
        </Text>

        <Box m={2} w="100%">
          <TextInput
          //  onFocus={() => getBaseURLAsyncStorage()}
            value={usuario}
            onChangeText={(e) => setUsuario(e)}
            keyboardType="email-address"
            type="text"
            size="2xl"
            label="Código"
            mode="flat"
          />
        </Box>
        <Box m="1" w="100%">
          <TextInput
            value={senha}
            onChangeText={(e) => setSenha(e)}
            type="password"
            keyboardType="numbers-and-punctuation"
            secureTextEntry
            size="2xl"
            label="Senha"
          />
        </Box>
        <Box rounded="lg" width="95%" m="1.5">
          <Button
            leftIcon={
              <FontAwesome5 name="sign-in-alt" size={24} color="white" />
            }
            colorScheme="success"
            borderRadius="full"
            size="lg"
            isLoading={loading}
            isLoadingText="Entrando ..."
            onPress={() => login()}
          >
            Entrar
          </Button>
        </Box>

        <Box justifyContent="center" alignItems="center">
          <Text
            mt={10}
            style={{
              fontFamily: "Inter_900Black",
              fontSize: 22,
              color: "#f4f5f1",
            }}
          >
            JJ Coletor
          </Text>
          <Text style={{ fontWeight: "bold" }} color="#f2f2f2">
            {" "}
            SERVIDOR - {baseUrl}
          </Text>
          <Box>
            <Button
              mt={5}
              leftIcon={
                <MaterialIcons name="settings" size={24} color="white" />
              }
              colorScheme="warmGray"
              borderRadius="full"
              size="lg"
              onPress={() => navigation.navigate("configuracao")}
            >
              <Text color="white">Configurar</Text>
            </Button>
          </Box>
        </Box>
      </Box>
    </KeyboardAvoidingView>
  );
}
