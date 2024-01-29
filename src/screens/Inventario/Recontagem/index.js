import React, { useState, useEffect } from "react";
import { Alert, ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
 
  VStack,
  Box,
  Card,
  Badge,
  Text,
  Button as Button3,
  Modal,
} from "native-base";
import { ScrollView } from "native-base";
import { ListItem, Button as Button2, BottomSheet } from "@rneui/themed";
import {
  Button,
  ProgressBar,
  MD3Colors,
  TextInput,
  Text as TextNP,
} from "react-native-paper";
import { FontAwesome5 } from "@expo/vector-icons";

import api from "../../../service/axios";

const ListaProdutosRecontagem = ({ route, navigation }) => {
  const [produtoList, setProdutoList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(null);
  const [nomeUsuario, setNomeUsuario] = useState(null);

  const [inventarioStatus , setInventarioStatus] = useState(true)
  const [loadingStatus , setLoadingStatus] = useState(false)

  const consultarInventarioStatus = () => {
    setLoadingStatus(true)
    return api
      .get(
        `/api/produto/contagem/inventarios/${parseInt(
          JSON.stringify(route.params.idInventario)
        )}`
      )
      .then((r) => {
       setInventarioStatus(r.data?.status)
       
       
      })
      .catch((e) => {
        Alert.alert("Erro", "Erro ao buscar dados dos inventário ");
      })
      .finally((f) => {
        setLoadingStatus(false)
      });

  }

  const getProdutoList = () => {
    setLoading(true);
    consultarInventarioStatus()
    return api
      .get(
        `/api/produto/contagem/porInventario/mobile/recontar/${parseInt(
          JSON.stringify(route.params.idInventario)
        )}`
      )
      .then((r) => {
        //   console.log(r.data);
        setProdutoList(r.data);
      })
      .catch((e) => {
        Alert.alert("Erro", "Erro ao buscar os produtos para recontagem" + e);
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  const salvar = () => {
    consultarInventarioStatus()
    if(inventarioStatus === false) {
      Alert.alert("Aviso", "Não foi possível atualizar, o inventário está fechado ... Por favor tente novamente!");
    } else {
    if (!quantidade || !produtoSelecionado) {
      Alert.alert("Aviso", "Informe a quantidade e/ou produto");
    } else {
      setLoadingSalvar(true);
      let q = parseFloat(quantidade.replace(",", "."));
      return api
        .post("/api/produto/contagem/salvar", {
          id: produtoSelecionado?.id,
          idproduto: produtoSelecionado?.idproduto,
          idinventario: produtoSelecionado?.idinventario,
          produto: produtoSelecionado?.produto,
          idfilial: produtoSelecionado?.idfilial,
          quantidadeLida: q,
          nomeUsuario: nomeUsuario,
          recontar: false,
        })
        .then((r) => {
          setProdutoSelecionado(null);
          setQuantidade(null);
          Alert.alert(
            "Sucesso",
            `Atualizando a contagem de ${produtoSelecionado?.ean} - ${produtoSelecionado?.produto} para ${q} ${produtoSelecionado?.unidadeMedida}`
          );
          setLoadingSalvar(false);
          getProdutoList();
        })
        .catch((e) => {
          Alert.alert(
            "Erro",
            `Erro ao atualizar a contagem  
            ${produtoSelecionado?.ean} 
            - ${produtoSelecionado?.produto} `
          );
        });
    }}
  };

  useEffect(() => {
    const getNomeUsuarioToken = async () => {
      const token = await AsyncStorage.getItem("access_token");
      let a = JSON.parse(token);
      setNomeUsuario(a?.nome);
    };
    consultarInventarioStatus()
    getNomeUsuarioToken();
    getProdutoList();
  }, [route]);

  return (
    <>
      <Box
        bg={{
          linearGradient: {
            colors: ["#eb575a", "#708090"],
            start: [1, 0],
            end: [0, 0],
          },
        }}
        flex={1}
        justifyContent="flex-start"
      >
        {loading ? (
          <>
            <Box flex={1} mx={5} flexDir="column" justifyContent="center">
              <Text p={5} mx={5} fontSize="md" color="white">
                Carregando produtos ...
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
            
              {produtoSelecionado ? (
                <>
                  <Box
                    bgColor="#778899"
                    // justifyContent="center"
                    width="container"
                    height="100%"
                    px={1}
                  >
                    <Card backgroundColor="#f2f2f2">
                      <Box
                        bgColor="#f3f3f3"
                        flexDirection="column"
                        width="100%"
                        marginTop={5}
                        alignItems="center"
                      >
                        <Text fontSize={16}>
                          {produtoSelecionado?.ean
                            ? produtoSelecionado?.ean
                            : produtoSelecionado?.codigo}
                        </Text>
                        <Text fontSize={18} fontWeight="extrabold">
                          {" "}
                          {produtoSelecionado?.produto}
                        </Text>
                        <Text fontSize={12} fontWeight="extrabold">
                          {" "}
                          {produtoSelecionado?.unidadeMedida}
                        </Text>
                      </Box>

                      <Box flexDirection="column" w="container" p={1} m={4}>
                        <TextInput
                          w="100%"
                          onChangeText={(e) => setQuantidade(e)}
                          id="quantidade"
                          clearTextOnFocus
                          size="2xl"
                          marginTop={5}
                          placeholder="Quantidade #0,00"
                          keyboardType="decimal-pad"
                          rounded="md"
                          autoCapitalize="words"
                        />
                      </Box>

                      <Button3
                        onPress={(e) => {
                          setProdutoSelecionado(null);
                          setQuantidade(null);
                        }}
                        h="12"
                        m={5}
                        rounded="full"
                        colorScheme="danger"
                        disabled={loadingSalvar}
                        leftIcon={
                          <FontAwesome5 name="times" size={18} color="white" />
                        }
                      >
                        Cancelar
                      </Button3>
                      <Button3
                        isLoading={loadingSalvar}
                        isLoadingText="Salvando..."
                        // disabled={!produto || !quantidade}
                        onPress={() => salvar()}
                        h="12"
                        m="2"
                        rounded="full"
                        colorScheme="success"
                        rightIcon={
                          <FontAwesome5 name="edit" size={18} color="white" />
                        }
                      >
                        <Text fontWeight="bold" fontSize="lg" color="#ffff">
                          Recontar
                        </Text>
                      </Button3>
                    </Card>
                  </Box>
                </>
              ) : (
                <>
                  <Box m={1} p={1} width="container">
                    <Button
                      icon="arrow-left"
                      mode="contained"
                      buttonColor="red"
                      onPress={() =>
                        navigation.navigate("nova-contagem", {
                          itemId: route.params.idInventario,
                        })
                      }
                    >
                      Voltar
                    </Button>
                  </Box>
                  <Box m={1} p={1} width="container">
                    <Button
                      icon="refresh"
                      mode="contained"
                      buttonColor="purple"
                      onPress={() => getProdutoList()
                      }
                    >
                      Recarregar
                    </Button>
                  </Box>
                  {produtoList?.length > 0 ? (
                    <>
                      <ScrollView h="lg" p={1}>
                        <VStack p={1} w="container">
                          {produtoList.map((item, i) => (
                            <>
                              <ListItem.Swipeable
                                keyExtractor={(p) => p?.id}
                                topDivider
                                rightContent={(reset) => (
                                  <Button2
                                    title="Excluir"
                                    onPress={() => {
                                      reset();
                                      return api
                                        .delete(
                                          `/api/produto/contagem/inventario/item/${item?.id}`
                                        )
                                        .then((r) => {
                                          Alert.alert(
                                            "Sucesso",
                                            `Produto ${
                                              item?.produto + " "
                                            } excluído`
                                          );
                                          getProdutoList();
                                        })
                                        .catch((e) => {
                                          Alert.alert(
                                            "Erro",
                                            "Erro ao excluir ",
                                            e?.message
                                          );
                                        });
                                    }}
                                    icon={{ name: "delete", color: "white" }}
                                    buttonStyle={{
                                      minHeight: "100%",
                                      backgroundColor: "red",
                                    }}
                                  />
                                )}
                                leftContent={(reset) => (
                                  <Button2
                                    title="Recontar"
                                    onPress={() => {
                                      consultarInventarioStatus()
                                      setProdutoSelecionado(item)}}
                                    icon={{ name: "edit", color: "white" }}
                                    buttonStyle={{ minHeight: "100%" }}
                                  />
                                )}
                              >
                                <ListItem.Content>
                                  <ListItem.Title>
                                    {item?.produto}
                                  </ListItem.Title>
                                  <ListItem.Subtitle>
                                    Código - {item?.ean}
                                  </ListItem.Subtitle>
                                  <ListItem.Subtitle>
                                    Coletor(a) {item?.nomeUsuario}
                                  </ListItem.Subtitle>
                                </ListItem.Content>
                                <Badge backgroundColor={"green.500"}>
                                  <Text color="#ffff">Quantidade</Text>
                                  <Text
                                    fontSize="xl"
                                    fontWeight="bold"
                                    color="white"
                                  >
                                    {Intl.NumberFormat("pt-BR", {
                                      minimumFractionDigits: "0",
                                      maximumFractionDigits: "3",
                                    }).format(item?.quantidadeLida)}
                                  </Text>
                                  <Text size={6} color="#ffff">
                                    {item?.unidadeMedida}
                                  </Text>
                                </Badge>
                                <ListItem.Chevron />
                              </ListItem.Swipeable>
                            </>
                          ))}
                        </VStack>
                      </ScrollView>

                      <Card backgroundColor="purple.900" m={1}>
                        <Text h4 color="#f2f2f2">
                          Existe(m) {produtoList?.length} produto(s) para
                          recontagem !
                        </Text>
                      </Card>
                    </>
                  ) : (
                    <>
                     
                      <Card backgroundColor="blue.700" mx={5} my={5}>
                        
                        <Text h4 color="#f2f2f2">
                          Nenhum produto encontrado para recontagem !
                        </Text>
                      </Card>
                      <Box flex={1} width="container">
                        <ImageBackground
                          resizeMode="cover"
                          source={require("../../../../assets/images/vazio.png")}
                          alt="vazio"
                          style={{ flex: 1, width: "100%", height: "100%" }}
                        ></ImageBackground>
                      </Box>
                    </>
                  )}
                </>
              )}

              <Modal
                isOpen={loadingSalvar}
                onClose={() => setLoadingSalvar(false)}
                clos
              >
                <Modal.Content
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Modal.Header> Aguarde por favor </Modal.Header>
                  <Modal.Body>
                    <TextNP variant="titleMedium"> Atualizando </TextNP>
                    <ProgressBar
                      indeterminate
                      progress={1}
                      color={MD3Colors.success50}
                    />
                  </Modal.Body>
                </Modal.Content>
              </Modal>
              <BottomSheet modalProps={{}} isVisible={!inventarioStatus}>
                <Card backgroundColor="#f2f2f2">
                <Text fontSize="2xl">Inventário está {inventarioStatus?.status ? 'aberto' : 'fechado'}</Text>
                <Text mb={2} fontSize="md">Solicite ao retaguarda a abertura para continuar </Text>
                <Box mb={5}>
                <Button 
                 icon="refresh"
                 loading={loadingStatus}
                mode="contained" onPress={()=> consultarInventarioStatus()}  >
                 {loadingStatus ? 'Consultando status do inventário' : 'Tentar novamente'}
                </Button>

               
                   
                </Box>
                <Box>
                <Button
                      icon="arrow-left"
                      mode="contained"
                      buttonColor="red"
                      onPress={() =>
                        navigation.navigate("Menu")
                      }
                    >
                      Sair
                    </Button>
                </Box>
               

                </Card>

              
     
      </BottomSheet>
           
          </>
        )}
      </Box>
    </>
  );
};

export default ListaProdutosRecontagem;
