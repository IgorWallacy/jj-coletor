import {
  Box,
  FlatList,
  HStack,
  VStack,
  Text,
  Button,
  ScrollView,
} from "native-base";

import {
  ProgressBar,
  MD3Colors,
  Card,
  Text as TextP,
} from "react-native-paper";

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
    setLoading(true);
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
    getInventario();
  }, []);

  return (
    <Box
      safeAreaTop="8"
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
    >
      {loading ? (
        <>
          <Box w="container">
            <Text color="#f2f2f2" fontSize="2xl">
              Carregando...
            </Text>
            <ProgressBar
              indeterminate
              progress={1}
              color={MD3Colors.success50}
            />
          </Box>
        </>
      ) : (
        <>
          <FlatList
            data={inventarioList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              return (
                <ScrollView>
                  <VStack space="1" p="2" w="96">
                    <Card>
                      <Card.Content>
                        <Text
                          fontWeight="extrabold"
                          color={item?.status ? "green.800" : "red.500"}
                          fontSize="md"
                        >
                          {item?.id} - {item?.nome?.toUpperCase()}
                        </Text>
                        <Text
                          fontWeight="bold"
                          color={item?.status ? "green.800" : "red.500"}
                          fontSize="md"
                        >
                          Status : {item?.status ? "Aberto" : "Fechado"}
                        </Text>
                        <Text
                          color={item?.status ? "green.800" : "red.500"}
                          fontSize="md"
                        >
                          Abertura :{" "}
                          {moment(item?.inicio).format("DD/MM/YYYY - dddd")}
                        </Text>
                        {item?.fim ? (
                          <>
                            <Text
                              color={item?.status ? "green.800" : "red.500"}
                              fontSize="md"
                            >
                              Fim :{" "}
                              {moment(item?.fim).format("DD/MM/YYYY - dddd")}
                            </Text>
                          </>
                        ) : (
                          ""
                        )}

                        <HStack>
                          {item.status ? (
                            <Button
                              variant="solid"
                              colorScheme="text"
                              rounded="md"
                              size="lg"
                              m="2"
                              rightIcon={
                                <FontAwesome5
                                  name="barcode"
                                  size={24}
                                  color="white"
                                />
                              }
                              disabled={!item.status}
                              onPress={() =>
                                navigation.navigate("nova-contagem", {
                                  itemId: parseInt(item?.id),
                                  loja: item?.loja,
                                  idfilial: item?.idfilial,
                                })
                              }
                            >
                              {item.status ? "Iniciar contagem" : ""}
                            </Button>
                          ) : (
                            <></>
                          )}
                        </HStack>
                      </Card.Content>
                    </Card>
                  </VStack>
                </ScrollView>
              );
            }}
          />
        </>
      )}
    </Box>
  );
};

export default ListaInventarios;
