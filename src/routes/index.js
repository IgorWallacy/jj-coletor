import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/Login";
import  Menu  from "../screens/Menu";
import ListaInventarios from "../screens/Inventario/Lista";
import NovaContagem from "../screens/Inventario/Novo";

const Stack = createStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={ { headerShown : false}}>
      <Stack.Screen component={Login} name="Login"  />
      <Stack.Screen component={Menu} name="Menu" />
      <Stack.Screen component={ListaInventarios} name="lista-inventario" />
      <Stack.Screen component={NovaContagem} name="nova-contagem" />
    </Stack.Navigator>
  );
}
