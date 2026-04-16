import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getUsuarios, setSessionUser } from "@/services/data";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const router = useRouter();

  const entrar = async () => {
    if (!email.trim() || !senha.trim() || carregando) return;

    try {
      setCarregando(true);
      setMensagem("");

      const { usuarios, offline } = await getUsuarios();
      const usuarioEncontrado = usuarios.find(
        (usuario) =>
          usuario.email === email.trim() && usuario.senha === senha.trim()
      );

      if (!usuarioEncontrado) {
        alert("Email ou senha invalidos");
        return;
      }

      await setSessionUser(usuarioEncontrado);

      if (offline) {
        setMensagem("Modo offline ativo. O app continua funcionando no aparelho.");
      }

      router.replace("/(tabs)");
    } catch (erro) {
      console.log(erro);
      alert("Nao foi possivel fazer login. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#f7f1e8" }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 22,
          paddingVertical: 32,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 40,
            right: -20,
            width: 180,
            height: 180,
            borderRadius: 999,
            backgroundColor: "#ffcf8b",
            opacity: 0.35,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 80,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: 999,
            backgroundColor: "#9fc2ff",
            opacity: 0.3,
          }}
        />

        <View
          style={{
            backgroundColor: "#17324d",
            borderRadius: 30,
            padding: 28,
            marginBottom: 18,
            shadowColor: "#17324d",
            shadowOpacity: 0.18,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 16 },
            elevation: 8,
          }}
        >
          <Text
            style={{
              color: "#ffd59e",
              fontSize: 13,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 14,
              fontWeight: "700",
            }}
          >
            Organize seu dia
          </Text>

          <Text
            style={{
              color: "#fffaf1",
              fontSize: 34,
              lineHeight: 40,
              fontWeight: "800",
              marginBottom: 12,
            }}
          >
            Entrar no painel de tarefas
          </Text>

          <Text
            style={{
              color: "#c8d5e2",
              fontSize: 15,
              lineHeight: 24,
            }}
          >
            Um visual mais moderno, tarefas mais inteligentes e um fluxo pronto
            para funcionar online ou offline.
          </Text>

          <View
            style={{
              marginTop: 22,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {["Busca rapida", "Prioridades", "Resumo diario"].map((item) => (
              <View
                key={item}
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderRadius: 999,
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ color: "#f3f7fb", fontWeight: "600" }}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#fffaf4",
            borderRadius: 28,
            padding: 22,
            borderWidth: 1,
            borderColor: "#f0e0c8",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#16253a" }}>
                Login
              </Text>
              <Text style={{ color: "#6f7a86", marginTop: 4 }}>
                Entre com a sua conta para acessar o painel.
              </Text>
            </View>
          </View>

          <Text style={{ color: "#3d4b5b", fontWeight: "700", marginBottom: 8 }}>
            Email
          </Text>
          <TextInput
            placeholder="Digite seu email"
            placeholderTextColor="#8e98a3"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 18,
              paddingHorizontal: 16,
              paddingVertical: 15,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#e4dccd",
              color: "#182332",
            }}
          />

          <Text style={{ color: "#3d4b5b", fontWeight: "700", marginBottom: 8 }}>
            Senha
          </Text>
          <TextInput
            placeholder="Digite sua senha"
            placeholderTextColor="#8e98a3"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 18,
              paddingHorizontal: 16,
              paddingVertical: 15,
              marginBottom: 18,
              borderWidth: 1,
              borderColor: "#e4dccd",
              color: "#182332",
            }}
          />

          <TouchableOpacity
            onPress={entrar}
            disabled={carregando}
            style={{
              backgroundColor: carregando ? "#5e8ab7" : "#245d91",
              borderRadius: 18,
              paddingVertical: 16,
              alignItems: "center",
              shadowColor: "#245d91",
              shadowOpacity: 0.2,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 10 },
              elevation: 4,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
              {carregando ? "Entrando..." : "Entrar no painel"}
            </Text>
          </TouchableOpacity>

          {mensagem ? (
            <Text
              style={{
                marginTop: 14,
                textAlign: "center",
                color: "#7a5b2d",
                lineHeight: 20,
              }}
            >
              {mensagem}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
