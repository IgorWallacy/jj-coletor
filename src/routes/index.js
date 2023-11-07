import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/Login";
import Menu from "../screens/Menu";
import ListaInventarios from "../screens/Inventario/Lista";
import NovaContagem from "../screens/Inventario/Novo";
import ConfiguracaoComponent from "../screens/Configuracao";

const Stack = createStackNavigator();

export default function Routes() {

  

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: true }}
    >
      <Stack.Screen
        component={Login}
        name="Login"
        options={{
          title: "Sistema JJ - Coletor",
          headerStyle: {
            backgroundColor: "#708090",
          },
          headerTintColor: "#ffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        component={ConfiguracaoComponent}
        name="configuracao"
        options={{
          title: "Informe o endereço do servidor",
          headerStyle: {
            backgroundColor: "#708090",
          },
          headerTintColor: "#ffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen component={Menu} name="Menu"  options={{
          title: "Menu",
          headerShown : false,
          headerStyle: {
            backgroundColor: "#708090",
          },
          headerTintColor: "#ffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }} />
      <Stack.Screen
        component={ListaInventarios}
        name="lista-inventario"
        options={{
          title: "Escolha um inventário",
          headerStyle: {
            backgroundColor: "#708090",
          },
          headerTintColor: "#ffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        component={NovaContagem}
        name="nova-contagem"
        options={{
          title: "Iniciar a coleta de produtos",
          headerStyle: {
            backgroundColor: "#708090",
          },
          headerTintColor: "#ffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  );
}
