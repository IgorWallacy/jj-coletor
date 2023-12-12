import {
  Box,
  FlatList,
  HStack,
  VStack,
  Text,
  Button,
  ScrollView,
} from "native-base";

import { DatePickerInput, pt } from "react-native-paper-dates";

import {
  ProgressBar,
  MD3Colors,
  Card,
  Text as TextP,
  TextInput,
} from "react-native-paper";

import { FontAwesome5, FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import api from "../../../service/axios";
import moment from "moment";
import "moment/locale/pt-br";
import { enGB, registerTranslation } from "react-native-paper-dates";

moment.locale("pt-br");
registerTranslation("pt", pt);

const ListaInventarios = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [inventarioList, setInventarioList] = useState([]);
  const [inicio, setInicio] = useState();

  const getInventario = () => {

    if(inicio) {

    setLoading(true);
   

    return api
      .get(
        `/api/produto/contagem/inventarios/porData/${moment(inicio).format("YYYY-MM-DD")}`
      )
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
  } else {
    return api
    .get(
      `/api/produto/contagem/inventarios/porData/${moment().format("YYYY-MM-DD")}`
    )
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

  }
};

  useEffect(() => {
   
    getInventario();
  }, []);

  return (
    <Box
      safeAreaTop="1"
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
          <Box flexDirection="row" flexWrap="wrap" w="container" m={2}>
            <DatePickerInput
              locale="pt"
              label="Início do inventário"
              value={inicio}
              onChange={(d) => setInicio(d)}
              inputMode="start"
            />
          </Box>

          <Box flexDirection="column" w="container">
            <Box>
              <Button
                rounded="full"
                m={2}
                variant="solid"
                onPress={() => getInventario()}
                rightIcon={
                  <FontAwesome name="filter" size={20} color="white" />
                }
              >
                Pesquisar
              </Button>
            </Box>
          </Box>
          <FlatList
            data={inventarioList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              return (
                <>
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
                </>
              );
            }}
          />
        </>
      )}
    </Box>
  );
};

export default ListaInventarios;
