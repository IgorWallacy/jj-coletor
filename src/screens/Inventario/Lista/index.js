import {
  Box,
  FlatList,
  Center,
  HStack,
  VStack,
  Text,
  Button,
  ScrollView,
} from "native-base";
import { FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import api from "../../../service/axios";
import moment from "moment";
import "moment/locale/pt-br";

moment.locale("pt-br");

const ListaInventarios = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [inventarioList, setInventarioList] = useState([]);

  const getInventario = () => {
    return api
      .get("/api/produto/contagem/inventarios")
      .then((r) => {
       // console.log(r.data)
        setInventarioList(r.data);
      })
      .catch((e) => {
        alert(e?.message);
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getInventario()
  }, [])

  return (
    <Box
      safeAreaTop="8"
      flex={1}
      alignItems="center"
      justifyContent="center"
      bg={{
        linearGradient: {
          colors: ["#C8555A", "#C85B"],
          start: [0, 1],
          end: [1, 0],
        },
      }}
      p="5"
    >
      <FlatList
        data={inventarioList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <ScrollView w="container">
              <Center
                w="96"
                h="48"
                bg={item.status  ? "green.600" : "red.600"}
                rounded="md"
                shadow={5}
                m={1}
                p={1}
              >
                <VStack space="1">
                  <Text color="white" fontSize="md">
                    {item?.nome.toUpperCase()}
                  </Text>
                  <Text color="white" fontSize="md">
                   
                    Status : {item?.status ? 'Aberto' : 'Fechado'}
                  </Text>
                  <Text color="white" fontSize="md">
                    Abertura:
                    {moment(item?.dataInicio).format("DD/MM/YYYY - dddd")}
                  </Text>
                  <Text color="white" fontSize="md">
                    Termino:
                    {moment(item?.dataInicio).format("DD/MM/YYYY - dddd")}
                  </Text>
                </VStack>
                <HStack>
                  {item.status  ? (
                    <Button
                      variant="solid"
                      colorScheme="indigo"
                      rounded="full"
                      size="lg"
                      m="2"
                      rightIcon={
                        <FontAwesome5 name="barcode" size={24} color="white" />
                      }
                      disabled={!item.status }
                      onPress={() =>
                        navigation.navigate("nova-contagem", {
                          itemId: parseInt(item?.id),
                          loja: item?.loja,
                          idfilial: item?.idfilial,
                        })
                      }
                    >
                      {item.status  ? "Iniciar contagem" : ""}
                    </Button>
                  ) : (
                    <></>
                  )}
                </HStack>
              </Center>
            </ScrollView>
          );
        }}
      />
    </Box>
  );
};

export default ListaInventarios;
