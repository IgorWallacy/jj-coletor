import { Box, Heading, VStack, Container, Center, Button } from "native-base";
import { FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../service/axios";

const Menu = ({ navigation }) => {
  const [token, setToken] = useState(null);

  const getAsyncStorage = async () => {
    const t = await AsyncStorage.getItem("access_token");
    setToken(JSON.parse(t));
  };

  useEffect(() => {
    api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("access_token");
        const baseURL = await AsyncStorage.getItem("ip-servidor");
        let a = JSON.parse(token);
        if (a) {
          config.baseURL = "http://"+baseURL+":1010"
          config.headers["Authorization"] = "bearer " + a.access_token;
        }
        // console.log(a.access_token)
        return config;
      },
      (error) => {
        return promise.reject(error);
      }
    );

    getAsyncStorage();
  }, []);
  return (
    <Box
      safeAreaTop="1"
      flex={1}
      alignItems="center"
      justifyContent="center"
      bg={{
        linearGradient: {
          colors: [ "#eb575a", "#708090"],
          start: [1, 0],
          end: [0, 0],
        },
      }}
      p="5"
    >
      
        <Heading color="white" m="2">
          Bem vindo {token?.nome}
        </Heading>
        <VStack space={4}>
          
            <Button
              onPress={() => navigation.navigate(`lista-inventario`)}
              colorScheme="darkBlue"
              rounded="full"
              size="lg"
              rightIcon={
                <FontAwesome5
                  name="arrow-alt-circle-right"
                  size={24}
                  color="white"
                />
              }
            >
              Carregar inventários
            </Button>
          
        </VStack>
        
    </Box>
  );
};

export default Menu;
